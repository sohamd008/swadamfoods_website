import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { products } from "@/lib/products"

export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 24 * 1024
const MAX_ITEMS = 20
const MAX_QUANTITY_PER_LINE = 20
const MAX_TOTAL_QUANTITY = 50
const MAX_NAME_LENGTH = 80
const MAX_ADDRESS_LENGTH = 240
const MAX_PHONE_LENGTH = 20

type OrderItemInput = {
  productId: string
  quantity: number
}

type CreateOrderBody = {
  items: OrderItemInput[]
  customer: {
    name: string
    phone: string
    address: string
    pincode: string
  }
  delivery: "pune" | "porter"
}

type NormalizedItem = {
  productId: string
  productName: string
  weight: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function generateOrderId(): string {
  const date = new Date()
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
  return `SWD-${y}${m}${d}-${random}`
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin")
  if (!origin) return true

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  })
}

async function getExistingOrder(db: D1Database, idempotencyKey: string) {
  const order = await db
    .prepare(
      `SELECT id, subtotal, delivery_fee, total, currency, payment_status, order_status, request_hash
       FROM orders WHERE idempotency_key = ? LIMIT 1`,
    )
    .bind(idempotencyKey)
    .first<{
      id: string
      subtotal: number
      delivery_fee: number
      total: number
      currency: string
      payment_status: string
      order_status: string
      request_hash: string | null
    }>()

  if (!order) return null

  const items = await db
    .prepare(
      `SELECT product_id AS productId, product_name AS productName, weight, quantity,
              unit_price AS unitPrice, line_total AS lineTotal
       FROM order_items WHERE order_id = ? ORDER BY id ASC`,
    )
    .bind(order.id)
    .all<NormalizedItem>()

  return {
    orderId: order.id,
    currency: order.currency,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    total: order.total,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    requestHash: order.request_hash,
    items: items.results,
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403)
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? ""
  if (!contentType.startsWith("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415)
  }

  const idempotencyKey = text(request.headers.get("Idempotency-Key"))
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(idempotencyKey)) {
    return json({ error: "A valid Idempotency-Key is required. Please retry from checkout." }, 400)
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  let body: CreateOrderBody
  try {
    body = JSON.parse(rawBody) as CreateOrderBody
  } catch {
    return json({ error: "Invalid JSON request." }, 400)
  }

  if (!body || typeof body !== "object") {
    return json({ error: "Invalid order request." }, 400)
  }

  const requestHash = await sha256Hex(rawBody)
  const { env } = getCloudflareContext()
  const db = (env as CloudflareEnv & { DB: D1Database }).DB

  try {
    const existing = await getExistingOrder(db, idempotencyKey)
    if (existing) {
      if (existing.requestHash !== requestHash) {
        return json({ error: "This checkout request key was already used for different order data." }, 409)
      }
      const { requestHash: _requestHash, ...safeExisting } = existing
      return json({ ...safeExisting, replayed: true }, 200)
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json({ error: "Your cart is empty." }, 400)
    }

    if (body.items.length > MAX_ITEMS) {
      return json({ error: `Too many different products in one order. Maximum is ${MAX_ITEMS}.` }, 400)
    }

    const name = text(body.customer?.name)
    const phone = text(body.customer?.phone)
    const address = text(body.customer?.address)
    const pincode = text(body.customer?.pincode)
    const delivery = body.delivery

    if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
      return json({ error: "Please enter a valid name." }, 400)
    }
    if (address.length < 8 || address.length > MAX_ADDRESS_LENGTH) {
      return json({ error: "Please enter a complete delivery address." }, 400)
    }
    if (phone.length > MAX_PHONE_LENGTH || !/^[0-9+()\-\s]{10,20}$/.test(phone)) {
      return json({ error: "Please enter a valid phone number." }, 400)
    }
    if (!/^\d{6}$/.test(pincode)) {
      return json({ error: "Please enter a valid 6-digit pincode." }, 400)
    }
    if (delivery !== "pune" && delivery !== "porter") {
      return json({ error: "Invalid delivery method." }, 400)
    }

    const normalizedItems: NormalizedItem[] = []
    let totalQuantity = 0

    for (const item of body.items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        item.productId.length === 0 ||
        item.productId.length > 80 ||
        !/^[a-z0-9-]+$/.test(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_QUANTITY_PER_LINE
      ) {
        return json({ error: "Invalid cart item." }, 400)
      }

      totalQuantity += item.quantity
      if (totalQuantity > MAX_TOTAL_QUANTITY) {
        return json({ error: `The maximum quantity per order is ${MAX_TOTAL_QUANTITY} items.` }, 400)
      }

      const product = products.find((candidate) => candidate.id === item.productId)
      if (!product) {
        return json({ error: "One of the selected products is unavailable." }, 400)
      }

      normalizedItems.push({
        productId: product.id,
        productName: product.name,
        weight: product.weight,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      })
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const deliveryFee = 0
    const total = subtotal + deliveryFee
    const orderId = generateOrderId()

    const statements = [
      db
        .prepare(
          `INSERT INTO orders (
            id, customer_name, customer_phone, customer_address, pincode,
            delivery_method, subtotal, delivery_fee, total, currency,
            payment_status, order_status, idempotency_key, request_hash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'pending', 'new', ?, ?)`,
        )
        .bind(
          orderId, name, phone, address, pincode, delivery,
          subtotal, deliveryFee, total, idempotencyKey, requestHash,
        ),
      ...normalizedItems.map((item) =>
        db
          .prepare(
            `INSERT INTO order_items (
              order_id, product_id, product_name, weight, quantity, unit_price, line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            orderId,
            item.productId,
            item.productName,
            item.weight,
            item.quantity,
            item.unitPrice,
            item.lineTotal,
          ),
      ),
    ]

    await db.batch(statements)

    return json(
      {
        orderId,
        currency: "INR",
        subtotal,
        deliveryFee,
        total,
        paymentStatus: "pending",
        orderStatus: "new",
        items: normalizedItems,
        replayed: false,
      },
      201,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ""

    if (message.includes("UNIQUE constraint failed: orders.idempotency_key")) {
      const existing = await getExistingOrder(db, idempotencyKey)
      if (existing) {
        if (existing.requestHash !== requestHash) {
          return json({ error: "This checkout request key was already used for different order data." }, 409)
        }
        const { requestHash: _requestHash, ...safeExisting } = existing
        return json({ ...safeExisting, replayed: true }, 200)
      }
    }

    console.error("Failed to create order:", error)
    return json({ error: "We couldn't create your order right now. Please try again." }, 500)
  }
}

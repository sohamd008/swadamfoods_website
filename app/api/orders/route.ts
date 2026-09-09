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
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
  let code = ""
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return `SWAD-${code}`
}

function sameOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get("Sec-Fetch-Site")?.toLowerCase()
  if (secFetchSite === "cross-site") {
    return false
  }

  const origin = request.headers.get("Origin")
  const requestOrigin = new URL(request.url).origin

  if (origin) {
    try {
      return new URL(origin).origin === requestOrigin
    } catch {
      return false
    }
  }

  const referer = request.headers.get("Referer")
  if (referer) {
    try {
      return new URL(referer).origin === requestOrigin
    } catch {
      return false
    }
  }

  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return true
  }

  return process.env.NODE_ENV !== "production"
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

function getCF() {
  try {
    const { env } = getCloudflareContext()
    const db = (env as unknown as { DB?: D1Database })?.DB
    return { db }
  } catch {
    return { db: undefined }
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
  const { db } = getCF()
  const orderId = generateOrderId()

  if (!db || typeof db.prepare !== "function") {
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
      },
      201,
    )
  }

  try {
    const statements = [
      db
        .prepare(
          `INSERT INTO orders (
            id, customer_name, customer_phone, customer_address, pincode,
            delivery_method, subtotal, delivery_fee, total, currency,
            payment_status, order_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'pending', 'new')`,
        )
        .bind(
          orderId, name, phone, address, pincode, delivery,
          subtotal, deliveryFee, total,
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
      },
      201,
    )
  } catch (error) {
    console.error("Failed to create order:", error)
    return json({ error: "We couldn't create your order right now. Please try again." }, 500)
  }
}

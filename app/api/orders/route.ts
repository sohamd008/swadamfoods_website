import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { products } from "@/lib/products"

export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 32 * 1024
const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX_REQUESTS = 10

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

function getClientKey(request: Request): string {
  const cloudflareIp = request.headers.get("CF-Connecting-IP")?.trim()
  if (cloudflareIp) return cloudflareIp.slice(0, 128)
  return "unknown"
}

function responseHeaders() {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  }
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: responseHeaders() })
}

async function consumeRateLimit(db: D1Database, clientKey: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = Math.floor(now / RATE_LIMIT_WINDOW_SECONDS) * RATE_LIMIT_WINDOW_SECONDS
  const bucketKey = `orders:${clientKey}`

  await db
    .prepare(
      `INSERT INTO api_rate_limits (bucket_key, window_start, request_count)
       VALUES (?, ?, 1)
       ON CONFLICT(bucket_key) DO UPDATE SET
         window_start = excluded.window_start,
         request_count = CASE
           WHEN api_rate_limits.window_start != excluded.window_start THEN 1
           ELSE api_rate_limits.request_count + 1
         END`,
    )
    .bind(bucketKey, windowStart)
    .run()

  const row = await db
    .prepare(`SELECT window_start, request_count FROM api_rate_limits WHERE bucket_key = ?`)
    .bind(bucketKey)
    .first<{ window_start: number; request_count: number }>()

  if (!row) return { allowed: true, retryAfter: RATE_LIMIT_WINDOW_SECONDS }

  const nextWindow = row.window_start + RATE_LIMIT_WINDOW_SECONDS
  const retryAfter = Math.max(1, nextWindow - now)

  return {
    allowed: row.request_count <= RATE_LIMIT_MAX_REQUESTS,
    retryAfter,
  }
}

async function getExistingOrder(db: D1Database, idempotencyKey: string) {
  const order = await db
    .prepare(
      `SELECT id, subtotal, delivery_fee, total, currency, payment_status, order_status
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
    }>()

  if (!order) return null

  const items = await db
    .prepare(
      `SELECT product_id, product_name, weight, quantity, unit_price, line_total
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
    items: items.results,
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? ""
  if (!contentType.startsWith("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415)
  }

  const idempotencyKey = text(request.headers.get("Idempotency-Key"))
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(idempotencyKey)) {
    return json(
      { error: "A valid Idempotency-Key is required. Please retry from checkout." },
      400,
    )
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  const { env } = getCloudflareContext()
  const db = (env as CloudflareEnv & { DB: D1Database }).DB

  try {
    const rate = await consumeRateLimit(db, getClientKey(request))
    if (!rate.allowed) {
      return new Response(JSON.stringify({ error: "Too many order requests. Please wait a moment and try again." }), {
        status: 429,
        headers: {
          ...responseHeaders(),
          "Retry-After": String(rate.retryAfter),
        },
      })
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

    const requestHash = await sha256Hex(rawBody)
    const existing = await getExistingOrder(db, idempotencyKey)

    if (existing) {
      const stored = await db
        .prepare(`SELECT request_hash FROM orders WHERE idempotency_key = ? LIMIT 1`)
        .bind(idempotencyKey)
        .first<{ request_hash: string | null }>()

      if (stored?.request_hash && stored.request_hash !== requestHash) {
        return json({ error: "This checkout request key was already used for a different order." }, 409)
      }

      return json(existing, 200)
    }

    if (!body || typeof body !== "object") {
      return json({ error: "Invalid order request." }, 400)
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json({ error: "Your cart is empty." }, 400)
    }

    if (body.items.length > 20) {
      return json({ error: "Too many different products in one order." }, 400)
    }

    const name = text(body.customer?.name)
    const phone = text(body.customer?.phone)
    const address = text(body.customer?.address)
    const pincode = text(body.customer?.pincode)
    const delivery = body.delivery

    if (name.length < 2 || name.length > 80) {
      return json({ error: "Please enter a valid name." }, 400)
    }

    if (address.length < 8 || address.length > 240) {
      return json({ error: "Please enter a complete delivery address." }, 400)
    }

    if (!/^[0-9+()\-\s]{10,20}$/.test(phone)) {
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
        item.productId.length > 100 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return json({ error: "Invalid cart item." }, 400)
      }

      totalQuantity += item.quantity
      if (totalQuantity > 50) {
        return json({ error: "The maximum quantity per order is 50 items." }, 400)
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
            id,
            customer_name,
            customer_phone,
            customer_address,
            pincode,
            delivery_method,
            subtotal,
            delivery_fee,
            total,
            currency,
            payment_status,
            order_status,
            idempotency_key,
            request_hash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'pending', 'new', ?, ?)`,
        )
        .bind(
          orderId,
          name,
          phone,
          address,
          pincode,
          delivery,
          subtotal,
          deliveryFee,
          total,
          idempotencyKey,
          requestHash,
        ),
      ...normalizedItems.map((item) =>
        db
          .prepare(
            `INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              weight,
              quantity,
              unit_price,
              line_total
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

    return json(
      { error: "We couldn't create your order right now. Please try again." },
      500,
    )
  }
}

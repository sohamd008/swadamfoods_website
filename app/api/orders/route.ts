import type { D1Database } from "@cloudflare/workers-types"
import { getDB } from "@/lib/db"
import { jsonResponse as json, isSameOrigin as sameOrigin } from "@/lib/api"
import { products } from "@/lib/products"
import { validateIndianMobile } from "@/lib/phone"

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

let inMemoryCounter = 1000

async function getNextOrderId(db: D1Database | undefined): Promise<string> {
  if (!db || typeof db.prepare !== "function") {
    inMemoryCounter++
    return `SWAD-${inMemoryCounter}`
  }

  try {
    const rows = await db
      .prepare(`SELECT id FROM orders WHERE id LIKE 'SWAD-%' ORDER BY LENGTH(id) DESC, id DESC LIMIT 50`)
      .all<{ id: string }>()

    let maxNum = 1000
    if (rows && rows.results) {
      for (const row of rows.results) {
        const match = row.id.match(/^SWAD-(\d+)$/)
        if (match) {
          const val = parseInt(match[1], 10)
          if (!isNaN(val) && val > maxNum) {
            maxNum = val
          }
        }
      }
    }

    if (maxNum === 1000) {
      const countResult = await db.prepare(`SELECT COUNT(*) as cnt FROM orders`).first<{ cnt: number }>()
      const count = countResult?.cnt || 0
      maxNum = 1000 + count
    }

    const next = maxNum + 1
    return `SWAD-${next}`
  } catch {
    inMemoryCounter++
    return `SWAD-${inMemoryCounter}`
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
  const phoneValidation = validateIndianMobile(phone)
  if (!phoneValidation.isValid) {
    return json({ error: phoneValidation.error || "Please enter a valid 10-digit mobile number." }, 400)
  }
  const cleanCustomerPhone = phoneValidation.cleanPhone
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
  const db = getDB()
  let orderId = await getNextOrderId(db)

  if (!db || typeof db.prepare !== "function") {
    return json({ error: "Order processing service is temporarily unavailable. Please try again in a few moments." }, 503)
  }

  try {
    let attempts = 0
    let success = false

    while (attempts < 3 && !success) {
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
              orderId,
              name,
              cleanCustomerPhone,
              address,
              pincode,
              delivery,
              subtotal,
              deliveryFee,
              total,
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
        success = true

        try {
          for (const item of normalizedItems) {
            await db
              .prepare(`UPDATE product_inventory SET stock = MAX(0, stock - ?) WHERE product_id = ?`)
              .bind(item.quantity, item.productId)
              .run()
          }
        } catch {}
      } catch (insertError: unknown) {
        attempts++
        const msg = insertError instanceof Error ? insertError.message : String(insertError)
        if (attempts < 3 && /unique|constraint|primary\s*key/i.test(msg)) {
          const numPart = parseInt(orderId.replace("SWAD-", ""), 10)
          const nextCandidate = isNaN(numPart) ? 1001 + attempts : numPart + attempts
          orderId = `SWAD-${nextCandidate}`
        } else {
          throw insertError
        }
      }
    }

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

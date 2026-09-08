import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

type OrderRow = {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  pincode: string
  delivery_method: string
  subtotal: number
  delivery_fee: number
  total: number
  currency: string
  payment_status: string
  order_status: string
  created_at: string
  updated_at: string
}

type OrderItemRow = {
  product_name: string
  weight: string
  quantity: number
  unit_price: number
  line_total: number
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(request, { limit: 20, windowMs: 60000, action: "track_order" })
  if (!rl.success) {
    return rateLimitExceededResponse(rl)
  }

  const { id: orderId } = await params
  if (!orderId || !/^SWD-\d{8}-[A-Z0-9]{8}$/.test(orderId)) {
    return json({ error: "Invalid order ID format." }, 400)
  }

  const { db } = getCF()
  if (!db || typeof db.prepare !== "function") {
    return json({ error: "Order details currently unavailable." }, 503)
  }

  try {
    const order = await db
      .prepare(
        `SELECT id, customer_name, customer_phone, customer_address, pincode,
                delivery_method, subtotal, delivery_fee, total, currency,
                payment_status, order_status, created_at, updated_at
         FROM orders
         WHERE id = ?
         LIMIT 1`,
      )
      .bind(orderId)
      .first<OrderRow>()

    if (!order) return json({ error: "Order not found." }, 404)

    const itemsResult = await db
      .prepare(
        `SELECT product_name, weight, quantity, unit_price, line_total
         FROM order_items
         WHERE order_id = ?`,
      )
      .bind(orderId)
      .all<OrderItemRow>()

    return json({
      order: {
        id: order.id,
        customerName: order.customer_name,
        customerPhoneMasked: order.customer_phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
        customerAddress: order.customer_address,
        pincode: order.pincode,
        deliveryMethod: order.delivery_method,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: (itemsResult.results ?? []).map((i) => ({
          productName: i.product_name,
          weight: i.weight,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          lineTotal: i.line_total,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to fetch public order:", error)
    return json({ error: "Failed to load order details." }, 500)
  }
}

import { getDB } from "@/lib/db"
import { jsonResponse as json, isSameOrigin as sameOrigin, cleanOrderId, isValidOrderId } from "@/lib/api"
import { syncPhonePeStatus } from "@/lib/order-lifecycle"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403)

  const rawOrderId = new URL(request.url).searchParams.get("orderId")?.trim() ?? ""
  const orderId = cleanOrderId(rawOrderId)
  if (!isValidOrderId(orderId)) return json({ error: "Invalid order ID." }, 400)

  const db = getDB()
  if (!db) return json({ error: "Database temporarily unavailable." }, 503)

  try {
    const order = await db
      .prepare("SELECT id, total, currency, payment_gateway, gateway_order_id, payment_status FROM orders WHERE id = ? OR gateway_order_id = ? LIMIT 1")
      .bind(orderId, rawOrderId)
      .first<{
        id: string
        total: number
        currency: string
        payment_gateway: string | null
        gateway_order_id: string | null
        payment_status: string
      }>()

    if (!order) return json({ error: "Order not found." }, 404)
    if (order.payment_gateway !== "phonepe" || !order.gateway_order_id) {
      return json({ error: "PhonePe is not assigned to this order." }, 409)
    }

    const result = await syncPhonePeStatus(db, order.id)
    if (!result) return json({ error: "PhonePe is not assigned to this order." }, 409)

    return json({
      ...result,
      total: order.total,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Failed to check PhonePe payment status:", error)
    return json({ error: "We couldn't verify the payment right now." }, 502)
  }
}

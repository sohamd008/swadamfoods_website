import { getDB } from "@/lib/db"
import { jsonResponse as json, isSameOrigin as sameOrigin, cleanOrderId, isValidOrderId } from "@/lib/api"
import { getPhonePeOrderStatus } from "@/lib/phonepe"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403)

  const rawOrderId = new URL(request.url).searchParams.get("orderId")?.trim() ?? ""
  const sanitizedOrderId = cleanOrderId(rawOrderId)
  if (!isValidOrderId(sanitizedOrderId)) return json({ error: "Invalid order ID." }, 400)

  const db = getDB()
  if (!db) return json({ error: "Database temporarily unavailable." }, 503)

  try {
    const order = await db
      .prepare(
        `SELECT id, total, currency, payment_gateway, gateway_order_id, payment_status
         FROM orders WHERE id = ? OR gateway_order_id = ? LIMIT 1`,
      )
      .bind(sanitizedOrderId, rawOrderId)
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

    if (order.payment_status === "paid") {
      return json({
        orderId: order.id,
        state: "COMPLETED",
        paymentStatus: "paid",
        total: order.total,
        currency: order.currency,
      })
    }

    const status = await getPhonePeOrderStatus(order.gateway_order_id)
    if (status.amount !== undefined && status.amount !== order.total * 100) {
      console.error("PhonePe amount mismatch", {
        orderId: order.id,
        expected: order.total * 100,
        received: status.amount,
      })
      return json({ error: "Payment verification failed." }, 502)
    }

    let paymentStatus = order.payment_status
    if (status.state === "COMPLETED") paymentStatus = "paid"
    else if (status.state === "FAILED") paymentStatus = "failed"
    else if (status.state === "EXPIRED") paymentStatus = "expired"
    else if (status.state === "PENDING") paymentStatus = "processing"

    if (paymentStatus !== order.payment_status) {
      await db
        .prepare(`UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(paymentStatus, order.id)
        .run()
    }

    const transaction = status.paymentDetails?.find((detail) => detail.state === "COMPLETED")
      ?? status.paymentDetails?.[0]

    return json({
      orderId: order.id,
      state: status.state ?? "PENDING",
      paymentStatus,
      total: order.total,
      currency: order.currency,
      transactionId: transaction?.transactionId ?? null,
      paymentMode: transaction?.paymentMode ?? null,
    })
  } catch (error) {
    console.error("Failed to check PhonePe payment status:", error)
    return json({ error: "We couldn't verify the payment right now." }, 502)
  }
}

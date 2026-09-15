import { getDB } from "@/lib/db"
import { jsonResponse as json, isSameOrigin as sameOrigin, cleanOrderId, isValidOrderId } from "@/lib/api"
import { markOrderPaid } from "@/lib/order-lifecycle"
import { PAYMENT_EXPIRY_SECONDS, createPhonePePayment, getPhonePeOrderStatus } from "@/lib/phonepe"

export const dynamic = "force-dynamic"

function generatePaymentMerchantOrderId(orderId: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()
  return `${orderId}-P${suffix}`
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403)
  if (!(request.headers.get("content-type")?.toLowerCase() ?? "").startsWith("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415)
  }

  let body: { orderId?: unknown }
  try {
    body = (await request.json()) as { orderId?: unknown }
  } catch {
    return json({ error: "Invalid JSON request." }, 400)
  }

  const orderId = typeof body.orderId === "string" ? cleanOrderId(body.orderId) : ""
  if (!isValidOrderId(orderId)) return json({ error: "Invalid order ID." }, 400)

  const db = getDB()
  if (!db) return json({ error: "Database temporarily unavailable." }, 503)

  try {
    const order = await db
      .prepare(
        `SELECT id, customer_phone, total, currency, payment_gateway,
                gateway_order_id, payment_status, payment_checkout_url, payment_expires_at
         FROM orders WHERE id = ? LIMIT 1`,
      )
      .bind(orderId)
      .first<{
        id: string
        customer_phone: string
        total: number
        currency: string
        payment_gateway: string | null
        gateway_order_id: string | null
        payment_status: string
        payment_checkout_url: string | null
        payment_expires_at: number | null
      }>()

    if (!order) return json({ error: "Order not found." }, 404)
    if (order.currency !== "INR") return json({ error: "Unsupported order currency." }, 400)
    if (order.payment_status === "paid") return json({ error: "This order has already been paid." }, 409)
    if (order.payment_gateway && order.payment_gateway !== "phonepe") return json({ error: "This order is assigned to another payment provider." }, 409)

    const now = Date.now()
    if (
      order.payment_gateway === "phonepe" &&
      order.gateway_order_id &&
      order.payment_checkout_url &&
      order.payment_expires_at &&
      order.payment_expires_at > now &&
      order.payment_status === "processing"
    ) {
      return json({ orderId, gateway: "phonepe", redirectUrl: order.payment_checkout_url, expiresAt: order.payment_expires_at })
    }

    if (order.payment_gateway === "phonepe" && order.gateway_order_id && order.payment_status === "processing") {
      const status = await getPhonePeOrderStatus(order.gateway_order_id)
      if (status.amount !== undefined && status.amount !== order.total * 100) {
        console.error("PhonePe amount mismatch", { orderId, expected: order.total * 100, received: status.amount })
        return json({ error: "Payment verification failed." }, 502)
      }

      if (status.state === "COMPLETED") {
        await markOrderPaid(db, orderId)
        return json({ orderId, gateway: "phonepe", alreadyPaid: true })
      }

      if (status.state !== "FAILED" && status.state !== "EXPIRED") {
        return json({ error: "Your previous payment is still being confirmed. Please wait a moment before trying again.", pending: true }, 409)
      }

      await db
        .prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ? AND payment_status = 'processing'")
        .bind(status.state === "EXPIRED" ? "expired" : "failed", orderId)
        .run()
    }

    const merchantOrderId = generatePaymentMerchantOrderId(orderId)
    const payment = await createPhonePePayment({
      merchantOrderId,
      orderId,
      amountInRupees: order.total,
      phone: order.customer_phone,
    })

    if (!payment.redirectUrl || payment.state !== "PENDING") {
      console.error("Unexpected PhonePe payment response", payment)
      return json({ error: "PhonePe could not start the payment." }, 502)
    }

    const expiresAt = typeof payment.expireAt === "number" ? payment.expireAt : now + PAYMENT_EXPIRY_SECONDS * 1000
    const update = await db
      .prepare(
        `UPDATE orders
         SET payment_gateway = 'phonepe', gateway_order_id = ?, payment_checkout_url = ?,
             payment_expires_at = ?, payment_status = 'processing', updated_at = datetime('now')
         WHERE id = ? AND payment_status IN ('pending', 'failed', 'expired', 'processing')`,
      )
      .bind(merchantOrderId, payment.redirectUrl, expiresAt, orderId)
      .run()

    if (!update.success || update.meta.changes < 1) {
      return json({ error: "The order changed while payment was being prepared. Please try again." }, 409)
    }

    return json({ orderId, gateway: "phonepe", redirectUrl: payment.redirectUrl, expiresAt })
  } catch (error) {
    console.error("Failed to initiate PhonePe payment:", error)
    return json({ error: "We couldn't start the secure payment right now. Please try again." }, 502)
  }
}

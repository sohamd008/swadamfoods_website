import { getDB } from "@/lib/db"
import { jsonResponse as json, isSameOrigin as sameOrigin, cleanOrderId, isValidOrderId } from "@/lib/api"
import { markOrderPaid } from "@/lib/order-lifecycle"
import { PAYMENT_EXPIRY_SECONDS, createPhonePePayment, getPhonePeOrderStatus } from "@/lib/phonepe"

export const dynamic = "force-dynamic"

function generatePaymentMerchantOrderId(orderId: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()
  return `${orderId}-P${suffix}`
}

const PAYMENT_CLAIM_SECONDS = 60

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
    let order = await db
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

    // A request can reach this point while another request is still creating the gateway payment.
    // Do not start a second PhonePe payment during that short claiming window.
    if (
      order.payment_gateway === "phonepe" &&
      order.payment_status === "processing" &&
      !order.payment_checkout_url &&
      order.gateway_order_id &&
      order.payment_expires_at &&
      order.payment_expires_at > now
    ) {
      return json({ error: "Your payment is already being prepared. Please wait a moment and try again.", pending: true }, 409)
    }

    // If a real checkout previously existed but is no longer usable, verify its final state
    // before permitting a fresh payment attempt.
    if (
      order.payment_gateway === "phonepe" &&
      order.gateway_order_id &&
      order.payment_checkout_url &&
      order.payment_status === "processing"
    ) {
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
        .prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ? AND payment_status = 'processing' AND gateway_order_id = ?")
        .bind(status.state === "EXPIRED" ? "expired" : "failed", orderId, order.gateway_order_id)
        .run()

      order = {
        ...order,
        payment_status: status.state === "EXPIRED" ? "expired" : "failed",
      }
    }

    const merchantOrderId = generatePaymentMerchantOrderId(orderId)
    const claimExpiresAt = now + PAYMENT_CLAIM_SECONDS * 1000

    // Claim the order before calling PhonePe. This prevents two concurrent checkout requests
    // from creating two gateway payments for the same order.
    const claim = await db
      .prepare(
        `UPDATE orders
         SET payment_gateway = 'phonepe', gateway_order_id = ?, payment_checkout_url = NULL,
             payment_expires_at = ?, payment_status = 'processing', updated_at = datetime('now')
         WHERE id = ?
           AND payment_status IN ('pending', 'failed', 'expired')`,
      )
      .bind(merchantOrderId, claimExpiresAt, orderId)
      .run()

    if (!claim.success || claim.meta.changes < 1) {
      return json({ error: "Your payment is already being prepared. Please wait a moment and try again.", pending: true }, 409)
    }

    const payment = await createPhonePePayment({
      merchantOrderId,
      orderId,
      amountInRupees: order.total,
      phone: order.customer_phone,
    })

    if (!payment.redirectUrl || payment.state !== "PENDING") {
      console.error("Unexpected PhonePe payment response", payment)
      await db
        .prepare("UPDATE orders SET payment_gateway = NULL, gateway_order_id = NULL, payment_checkout_url = NULL, payment_expires_at = NULL, payment_status = 'pending', updated_at = datetime('now') WHERE id = ? AND gateway_order_id = ? AND payment_status = 'processing'")
        .bind(orderId, merchantOrderId)
        .run()
      return json({ error: "PhonePe could not start the payment." }, 502)
    }

    const expiresAt = typeof payment.expireAt === "number" ? payment.expireAt : now + PAYMENT_EXPIRY_SECONDS * 1000
    const update = await db
      .prepare(
        `UPDATE orders
         SET payment_gateway = 'phonepe', gateway_order_id = ?, payment_checkout_url = ?,
             payment_expires_at = ?, payment_status = 'processing', updated_at = datetime('now')
         WHERE id = ? AND payment_status = 'processing' AND gateway_order_id = ?`,
      )
      .bind(merchantOrderId, payment.redirectUrl, expiresAt, orderId, merchantOrderId)
      .run()

    if (!update.success || update.meta.changes < 1) {
      // The payment belongs to the order only if our claimed gateway id is still present.
      // Return a conflict rather than exposing a payment link that another request won.
      return json({ error: "The order changed while payment was being prepared. Please refresh and try again." }, 409)
    }

    return json({ orderId, gateway: "phonepe", redirectUrl: payment.redirectUrl, expiresAt })
  } catch (error) {
    console.error("Failed to initiate PhonePe payment:", error)
    return json({ error: "We couldn't start the secure payment right now. Please try again." }, 502)
  }
}

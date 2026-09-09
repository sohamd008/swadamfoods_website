import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import {
  PAYMENT_EXPIRY_SECONDS,
  createPhonePePayment,
  getPhonePeOrderStatus,
} from "@/lib/phonepe"
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

function generatePaymentMerchantOrderId(orderId: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()
  return `${orderId}-P${suffix}`
}

export async function POST(request: Request) {
  const rl = checkRateLimit(request, { limit: 5, windowMs: 60000, action: "init_payment" })
  if (!rl.success) {
    return rateLimitExceededResponse(rl)
  }

  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403)

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? ""
  if (!contentType.startsWith("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415)
  }

  let body: { orderId?: unknown }
  try {
    body = (await request.json()) as { orderId?: unknown }
  } catch {
    return json({ error: "Invalid JSON request." }, 400)
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : ""
  if (!/^SWD-\d{8}-[A-Z0-9]{8}$/.test(orderId)) {
    return json({ error: "Invalid order ID." }, 400)
  }

  const { env } = getCloudflareContext()
  const db = (env as CloudflareEnv & { DB: D1Database }).DB

  try {
    const result = await db
      .prepare(
        `SELECT id, customer_phone, total, currency, payment_gateway,
                gateway_order_id, payment_status, payment_checkout_url, payment_expires_at
         FROM orders
         WHERE id = ?
         LIMIT 1`,
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

    if (!result) return json({ error: "Order not found." }, 404)
    if (result.currency !== "INR") return json({ error: "Unsupported order currency." }, 400)
    if (result.payment_status === "paid") return json({ error: "This order has already been paid." }, 409)

    if (result.payment_gateway && result.payment_gateway !== "phonepe") {
      return json({ error: "This order is assigned to another payment provider." }, 409)
    }

    const now = Date.now()

    if (
      result.payment_gateway === "phonepe" &&
      result.gateway_order_id &&
      result.payment_checkout_url &&
      result.payment_expires_at &&
      result.payment_expires_at > now &&
      result.payment_status === "processing"
    ) {
      return json({
        orderId,
        gateway: "phonepe",
        redirectUrl: result.payment_checkout_url,
        expiresAt: result.payment_expires_at,
      })
    }

    if (result.payment_gateway === "phonepe" && result.gateway_order_id && result.payment_status === "processing") {
      const status = await getPhonePeOrderStatus(result.gateway_order_id)

      if (status.amount !== undefined && status.amount !== result.total * 100) {
        console.error("PhonePe amount mismatch", { orderId, expected: result.total * 100, received: status.amount })
        return json({ error: "Payment verification failed." }, 502)
      }

      if (status.state === "COMPLETED") {
        await db
          .prepare(
            `UPDATE orders SET payment_status = 'paid', updated_at = datetime('now') WHERE id = ?`,
          )
          .bind(orderId)
          .run()
        return json({ orderId, gateway: "phonepe", alreadyPaid: true })
      }

      if (status.state !== "FAILED" && status.state !== "EXPIRED") {
        return json({
          error: "Your previous payment is still being confirmed. Please wait a moment before trying again.",
          pending: true,
        }, 409)
      }

      await db
        .prepare(
          `UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ? AND payment_status = 'processing'`,
        )
        .bind(status.state === "EXPIRED" ? "expired" : "failed", orderId)
        .run()
    }

    const paymentMerchantOrderId = generatePaymentMerchantOrderId(orderId)
    const payment = await createPhonePePayment({
      merchantOrderId: paymentMerchantOrderId,
      orderId,
      amountInRupees: result.total,
      phone: result.customer_phone,
    })

    if (!payment.redirectUrl || payment.state !== "PENDING") {
      console.error("Unexpected PhonePe payment response", payment)
      return json({ error: "PhonePe could not start the payment." }, 502)
    }

    const expiresAt = typeof payment.expireAt === "number"
      ? payment.expireAt
      : now + PAYMENT_EXPIRY_SECONDS * 1000

    await db
      .prepare(
        `UPDATE orders
         SET payment_gateway = 'phonepe',
             gateway_order_id = ?,
             payment_checkout_url = ?,
             payment_expires_at = ?,
             payment_status = 'processing',
             updated_at = datetime('now')
         WHERE id = ?
           AND payment_status IN ('pending', 'failed', 'expired', 'processing')`,
      )
      .bind(paymentMerchantOrderId, payment.redirectUrl, expiresAt, orderId)
      .run()

    return json({
      orderId,
      gateway: "phonepe",
      redirectUrl: payment.redirectUrl,
      expiresAt,
    })
  } catch (error) {
    console.error("Failed to initiate PhonePe payment:", error)
    return json({ error: "We couldn't start the secure payment right now. Please try again." }, 502)
  }
}

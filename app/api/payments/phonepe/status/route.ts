import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { getPhonePeOrderStatus } from "@/lib/phonepe"

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

function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin")
  if (!origin) return true
  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403)

  const orderId = new URL(request.url).searchParams.get("orderId")?.trim() ?? ""
  if (!/^SWD-\d{8}-[A-Z0-9]{8}$/.test(orderId)) return json({ error: "Invalid order ID." }, 400)

  const { env } = getCloudflareContext()
  const db = (env as CloudflareEnv & { DB: D1Database }).DB

  try {
    const order = await db
      .prepare(
        `SELECT id, total, currency, payment_gateway, gateway_order_id, payment_status
         FROM orders WHERE id = ? LIMIT 1`,
      )
      .bind(orderId)
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
      return json({ orderId, state: "COMPLETED", paymentStatus: "paid" })
    }

    const status = await getPhonePeOrderStatus(order.gateway_order_id)
    if (status.amount !== undefined && status.amount !== order.total * 100) {
      console.error("PhonePe amount mismatch", {
        orderId,
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
        .prepare(
          `UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ?`,
        )
        .bind(paymentStatus, orderId)
        .run()
    }

    const transaction = status.paymentDetails?.find((detail) => detail.state === "COMPLETED")
      ?? status.paymentDetails?.[0]

    return json({
      orderId,
      state: status.state ?? "PENDING",
      paymentStatus,
      transactionId: transaction?.transactionId ?? null,
      paymentMode: transaction?.paymentMode ?? null,
    })
  } catch (error) {
    console.error("Failed to check PhonePe payment status:", error)
    return json({ error: "We couldn't verify the payment right now." }, 502)
  }
}

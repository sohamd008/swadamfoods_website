import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { verifyPhonePeWebhook } from "@/lib/phonepe"

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

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

type PhonePeWebhook = {
  event?: string
  payload?: {
    orderId?: string
    merchantId?: string
    merchantOrderId?: string
    state?: string
    amount?: number
    expireAt?: number
    paymentDetails?: Array<{
      transactionId?: string
      amount?: number
      state?: string
      paymentMode?: string
    }>
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (rawBody.length === 0 || rawBody.length > 128 * 1024) return json({ error: "Invalid webhook payload." }, 400)

  try {
    if (!(await verifyPhonePeWebhook(rawBody, request.headers))) {
      return json({ error: "Invalid webhook signature." }, 401)
    }

    let body: PhonePeWebhook
    try {
      body = JSON.parse(rawBody) as PhonePeWebhook
    } catch {
      return json({ error: "Invalid webhook JSON." }, 400)
    }

    const event = body.event
    const payload = body.payload
    const merchantOrderId = payload?.merchantOrderId

    if (
      (event !== "checkout.order.completed" && event !== "checkout.order.failed") ||
      !payload ||
      !merchantOrderId
    ) {
      return json({ received: true })
    }

    if (payload.state !== "COMPLETED" && payload.state !== "FAILED") return json({ received: true })

    const cleanOrderId = merchantOrderId.replace(/-P[A-Z0-9]+$/i, "").trim()
    const { env } = getCloudflareContext()
    const db = (env as CloudflareEnv & { DB: D1Database }).DB
    const order = await db
      .prepare(
        `SELECT id, total, currency, payment_status
         FROM orders WHERE (gateway_order_id = ? OR id = ?) AND payment_gateway = 'phonepe' LIMIT 1`,
      )
      .bind(merchantOrderId, cleanOrderId)
      .first<{
        id: string
        total: number
        currency: string
        payment_status: string
      }>()

    if (!order) {
      console.warn("PhonePe webhook received for unknown payment attempt", merchantOrderId)
      return json({ received: true })
    }

    if (order.currency !== "INR" || payload.amount !== order.total * 100) {
      console.error("PhonePe webhook amount mismatch", {
        orderId: order.id,
        merchantOrderId,
        expected: order.total * 100,
        received: payload.amount,
      })
      return json({ error: "Payment amount mismatch." }, 400)
    }

    const eventId = await sha256(rawBody)
    try {
      await db
        .prepare(
          `INSERT INTO payment_events
             (order_id, gateway, event_id, event_type, payload)
           VALUES (?, 'phonepe', ?, ?, ?)`,
        )
        .bind(order.id, eventId, event, rawBody)
        .run()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (/unique|constraint/i.test(message)) return json({ received: true, duplicate: true })
      throw error
    }

    const transaction = payload.paymentDetails?.find((detail) => detail.state === "COMPLETED")
      ?? payload.paymentDetails?.[0]

    if (event === "checkout.order.completed" && payload.state === "COMPLETED") {
      await db
        .prepare(
          `UPDATE orders
           SET payment_status = 'paid', updated_at = datetime('now')
           WHERE id = ? AND payment_status <> 'refunded'`,
        )
        .bind(order.id)
        .run()
    } else if (event === "checkout.order.failed" && payload.state === "FAILED") {
      await db
        .prepare(
          `UPDATE orders
           SET payment_status = CASE WHEN payment_status = 'paid' THEN 'paid' ELSE 'failed' END,
               updated_at = datetime('now')
           WHERE id = ? AND payment_status <> 'refunded'`,
        )
        .bind(order.id)
        .run()
    }

    console.info("PhonePe webhook processed", {
      orderId: order.id,
      merchantOrderId,
      event,
      transactionId: transaction?.transactionId ?? null,
    })

    return json({ received: true })
  } catch (error) {
    console.error("PhonePe webhook processing failed:", error)
    return json({ error: "Webhook processing failed." }, 500)
  }
}

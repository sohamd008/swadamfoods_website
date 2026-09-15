import type { D1Database } from "@cloudflare/workers-types"
import { getPhonePeOrderStatus } from "@/lib/phonepe"

export type PaymentSyncResult = {
  orderId: string
  state: string
  paymentStatus: string
  transactionId?: string | null
  paymentMode?: string | null
}

type OrderRow = {
  id: string
  total: number
  payment_status: string
  payment_gateway: string | null
  gateway_order_id: string | null
}

function completedPayment(details?: Array<{ transactionId?: string; state?: string; paymentMode?: string }>) {
  return details?.find((detail) => detail.state === "COMPLETED") ?? details?.[0]
}

/** Marks an order as paid once the payment gateway has confirmed completion. */
export async function markOrderPaid(db: D1Database, orderId: string): Promise<void> {
  await db
    .prepare(
      "UPDATE orders SET payment_status = 'paid', updated_at = datetime('now') WHERE id = ? AND payment_status <> 'refunded'",
    )
    .bind(orderId)
    .run()
}

export async function syncPhonePeStatus(db: D1Database, orderId: string): Promise<PaymentSyncResult | null> {
  const order = await db
    .prepare("SELECT id, total, payment_status, payment_gateway, gateway_order_id FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first<OrderRow>()

  if (!order || order.payment_gateway !== "phonepe" || !order.gateway_order_id) return null
  if (order.payment_status === "paid") {
    return { orderId: order.id, state: "COMPLETED", paymentStatus: "paid" }
  }

  const status = await getPhonePeOrderStatus(order.gateway_order_id)
  if (status.amount !== undefined && status.amount !== order.total * 100) throw new Error("Payment amount mismatch.")

  const paymentStatus = status.state === "COMPLETED"
    ? "paid"
    : status.state === "FAILED"
      ? "failed"
      : status.state === "EXPIRED"
        ? "expired"
        : status.state === "PENDING"
          ? "processing"
          : order.payment_status

  if (paymentStatus === "paid") await markOrderPaid(db, order.id)
  else if (paymentStatus !== order.payment_status) {
    await db
      .prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ? AND payment_status <> 'refunded'")
      .bind(paymentStatus, order.id)
      .run()
  }

  const transaction = completedPayment(status.paymentDetails)
  return {
    orderId: order.id,
    state: status.state ?? "PENDING",
    paymentStatus,
    transactionId: transaction?.transactionId ?? null,
    paymentMode: transaction?.paymentMode ?? null,
  }
}

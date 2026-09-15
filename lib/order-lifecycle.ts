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

type ItemRow = {
  product_id: string
  quantity: number
}

function isUniqueViolation(error: unknown) {
  return /unique|constraint|primary\s*key/i.test(error instanceof Error ? error.message : String(error))
}

function completedPayment(details?: Array<{ transactionId?: string; state?: string; paymentMode?: string }>) {
  return details?.find((detail) => detail.state === "COMPLETED") ?? details?.[0]
}

/** Atomically claims an order for inventory deduction and applies the stock update once. */
export async function markOrderPaid(db: D1Database, orderId: string): Promise<void> {
  const order = await db
    .prepare("SELECT id, total, payment_status, payment_gateway, gateway_order_id FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first<OrderRow>()

  if (!order || order.payment_status === "refunded") return

  try {
    const items = await db
      .prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?")
      .bind(orderId)
      .all<ItemRow>()

    await db.batch([
      db.prepare("INSERT INTO inventory_deductions (order_id) VALUES (?)").bind(orderId),
      db.prepare("UPDATE orders SET payment_status = 'paid', updated_at = datetime('now') WHERE id = ? AND payment_status <> 'refunded'").bind(orderId),
      ...(items.results ?? []).map((item) =>
        db.prepare("UPDATE product_inventory SET stock = MAX(0, stock - ?), updated_at = datetime('now') WHERE product_id = ?")
          .bind(item.quantity, item.product_id),
      ),
    ])
  } catch (error) {
    if (!isUniqueViolation(error)) throw error
    const claim = await db
      .prepare("SELECT order_id FROM inventory_deductions WHERE order_id = ? LIMIT 1")
      .bind(orderId)
      .first<{ order_id: string }>()
    if (!claim) throw error
  }
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

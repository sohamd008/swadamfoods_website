import type { D1Database } from "@cloudflare/workers-types"
import { getPhonePeOrderStatus } from "@/lib/phonepe"

export type PaymentSyncResult = {
  orderId: string
  state: string
  paymentStatus: string
  transactionId?: string | null
  paymentMode?: string | null
}

type OrderPaymentRow = {
  id: string
  total: number
  currency: string
  payment_gateway: string | null
  gateway_order_id: string | null
  payment_status: string
}

type OrderInventoryRow = {
  id: string
  payment_status: string
  inventory_deducted: number
}

type OrderItemRow = {
  product_id: string
  quantity: number
}

function getCompletedTransaction(paymentDetails?: Array<{ transactionId?: string; state?: string; paymentMode?: string }>) {
  return paymentDetails?.find((detail) => detail.state === "COMPLETED") ?? paymentDetails?.[0]
}

export async function markOrderPaid(db: D1Database, orderId: string): Promise<void> {
  const order = await db
    .prepare("SELECT id, payment_status, inventory_deducted FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first<OrderInventoryRow>()

  if (!order || order.payment_status === "refunded") return
  if (order.inventory_deducted === 1) {
    if (order.payment_status !== "paid") {
      await db
        .prepare("UPDATE orders SET payment_status = 'paid', updated_at = datetime('now') WHERE id = ? AND payment_status <> 'refunded'")
        .bind(orderId)
        .run()
    }
    return
  }

  const items = await db
    .prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?")
    .bind(orderId)
    .all<OrderItemRow>()

  const statements = (items.results ?? []).map((item) =>
    db
      .prepare(
        `UPDATE product_inventory
         SET stock = MAX(0, stock - ?), updated_at = datetime('now')
         WHERE product_id = ?
           AND EXISTS (
             SELECT 1 FROM orders
             WHERE id = ? AND inventory_deducted = 0 AND payment_status <> 'refunded'
           )`,
      )
      .bind(item.quantity, item.product_id, orderId),
  )

  statements.push(
    db
      .prepare(
        `UPDATE orders
         SET payment_status = 'paid', inventory_deducted = 1, updated_at = datetime('now')
         WHERE id = ? AND inventory_deducted = 0 AND payment_status <> 'refunded'`,
      )
      .bind(orderId),
  )

  await db.batch(statements)
}

export async function syncPhonePeStatus(db: D1Database, orderId: string): Promise<PaymentSyncResult | null> {
  const order = await db
    .prepare(
      `SELECT id, total, currency, payment_gateway, gateway_order_id, payment_status
       FROM orders WHERE id = ? LIMIT 1`,
    )
    .bind(orderId)
    .first<OrderPaymentRow>()

  if (!order || order.payment_gateway !== "phonepe" || !order.gateway_order_id) return null

  if (order.payment_status === "paid") {
    return { orderId: order.id, state: "COMPLETED", paymentStatus: "paid" }
  }

  const status = await getPhonePeOrderStatus(order.gateway_order_id)
  if (status.amount !== undefined && status.amount !== order.total * 100) {
    throw new Error("Payment amount mismatch.")
  }

  let paymentStatus = order.payment_status
  if (status.state === "COMPLETED") paymentStatus = "paid"
  else if (status.state === "FAILED") paymentStatus = "failed"
  else if (status.state === "EXPIRED") paymentStatus = "expired"
  else if (status.state === "PENDING") paymentStatus = "processing"

  if (paymentStatus !== order.payment_status) {
    if (paymentStatus === "paid") {
      await markOrderPaid(db, order.id)
    } else {
      await db
        .prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ? AND payment_status <> 'refunded'")
        .bind(paymentStatus, order.id)
        .run()
    }
  }

  const transaction = getCompletedTransaction(status.paymentDetails)
  return {
    orderId: order.id,
    state: status.state ?? "PENDING",
    paymentStatus,
    transactionId: transaction?.transactionId ?? null,
    paymentMode: transaction?.paymentMode ?? null,
  }
}

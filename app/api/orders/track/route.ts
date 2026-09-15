import { getDB } from "@/lib/db"
import { jsonResponse as json, cleanOrderId, isValidOrderId } from "@/lib/api"
import { syncPhonePeStatus } from "@/lib/order-lifecycle"
import { validateIndianMobile, maskPhone, sanitizePhone } from "@/lib/phone"

export const dynamic = "force-dynamic"

type OrderRow = {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  pincode: string
  delivery_method: string
  subtotal: number
  delivery_fee: number
  total: number
  currency: string
  payment_status: string
  payment_gateway: string | null
  gateway_order_id: string | null
  order_status: string
  created_at: string
  updated_at: string
}

type OrderItemRow = {
  product_name: string
  weight: string
  quantity: number
  unit_price: number
  line_total: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { orderId?: unknown; phone?: unknown } | null
    const rawOrderId = typeof body?.orderId === "string" ? body.orderId.trim().toUpperCase() : ""
    const rawPhone = typeof body?.phone === "string" ? body.phone.trim() : ""
    const orderId = cleanOrderId(rawOrderId)

    if (!isValidOrderId(orderId)) return json({ error: "Invalid Order ID format." }, 400)

    const phoneValidation = validateIndianMobile(rawPhone)
    if (!phoneValidation.isValid) return json({ error: phoneValidation.error || "Please enter a valid 10-digit mobile number." }, 400)

    const db = getDB()
    if (!db) return json({ error: "Database service currently unavailable. Please try again in a few moments." }, 503)

    const order = await db
      .prepare(
        `SELECT id, customer_name, customer_phone, customer_address, pincode,
                delivery_method, subtotal, delivery_fee, total, currency,
                payment_status, payment_gateway, gateway_order_id, order_status, created_at, updated_at
         FROM orders WHERE id = ? LIMIT 1`,
      )
      .bind(orderId)
      .first<OrderRow>()

    if (!order) return json({ error: "No order found with that Order ID. Please check your confirmation details." }, 404)
    if (sanitizePhone(order.customer_phone) !== phoneValidation.cleanPhone) {
      return json({ error: "The mobile number entered does not match this order." }, 403)
    }

    if (order.payment_status !== "paid" && order.payment_gateway === "phonepe" && order.gateway_order_id) {
      try {
        const payment = await syncPhonePeStatus(db, order.id)
        if (payment) order.payment_status = payment.paymentStatus
      } catch (error) {
        console.error("Tracking PhonePe verification check failed:", error)
      }
    }

    const itemsResult = await db
      .prepare(
        `SELECT product_name, weight, quantity, unit_price, line_total
         FROM order_items WHERE order_id = ? ORDER BY id`,
      )
      .bind(orderId)
      .all<OrderItemRow>()

    return json({
      verified: true,
      order: {
        id: order.id,
        customerName: order.customer_name,
        customerPhoneMasked: maskPhone(order.customer_phone),
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        pincode: order.pincode,
        deliveryMethod: order.delivery_method,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: (itemsResult.results ?? []).map((item) => ({
          productName: item.product_name,
          weight: item.weight,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          lineTotal: item.line_total,
        })),
      },
    })
  } catch (error) {
    console.error("Order tracking error:", error)
    return json({ error: "Failed to verify order details. Please try again." }, 500)
  }
}

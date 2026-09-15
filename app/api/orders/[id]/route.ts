import { getDB } from "@/lib/db"
import { jsonResponse as json, verifyAdminKey, cleanOrderId, isValidOrderId } from "@/lib/api"
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params
  const orderId = cleanOrderId(rawId)
  if (!isValidOrderId(orderId)) return json({ error: "Invalid order ID format." }, 400)

  const db = getDB()
  if (!db) return json({ error: "Order details currently unavailable." }, 503)

  try {
    const order = await db
      .prepare(
        `SELECT id, customer_name, customer_phone, customer_address, pincode,
                delivery_method, subtotal, delivery_fee, total, currency,
                payment_status, payment_gateway, gateway_order_id, order_status, created_at, updated_at
         FROM orders WHERE id = ? LIMIT 1`,
      )
      .bind(orderId)
      .first<OrderRow>()

    if (!order) return json({ error: "Order not found." }, 404)

    const customerPhoneInput = request.headers.get("x-customer-phone") || new URL(request.url).searchParams.get("phone") || ""
    const isAdmin = verifyAdminKey(request)
    const dbPhoneLast10 = sanitizePhone(order.customer_phone)

    let isVerified = isAdmin
    if (!isVerified && customerPhoneInput) {
      const phoneValidation = validateIndianMobile(customerPhoneInput)
      if (!phoneValidation.isValid) return json({ error: phoneValidation.error || "Please enter a valid mobile number." }, 403)
      if (phoneValidation.cleanPhone !== dbPhoneLast10) {
        return json({ error: "The mobile number entered does not match this order.", requiresVerification: true }, 403)
      }
      isVerified = true
    }

    if (!isVerified) {
      return json({
        requiresVerification: true,
        order: {
          id: order.id,
          customerPhoneMasked: maskPhone(order.customer_phone),
          deliveryMethod: order.delivery_method,
          paymentStatus: order.payment_status,
          orderStatus: order.order_status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        },
      })
    }

    if (order.payment_status !== "paid" && order.payment_gateway === "phonepe" && order.gateway_order_id) {
      try {
        const payment = await syncPhonePeStatus(db, order.id)
        if (payment) order.payment_status = payment.paymentStatus
      } catch (error) {
        console.error("Order PhonePe status sync failed:", error)
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
      order: {
        id: order.id,
        customerName: order.customer_name,
        customerPhoneMasked: maskPhone(order.customer_phone),
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
    console.error("Failed to fetch public order:", error)
    return json({ error: "Failed to load order details." }, 500)
  }
}

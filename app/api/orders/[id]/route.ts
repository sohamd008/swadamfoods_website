import { getDB } from "@/lib/db"
import { jsonResponse as json } from "@/lib/api"
import { getPhonePeOrderStatus } from "@/lib/phonepe"
import { validateIndianMobile } from "@/lib/phone"

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
  payment_gateway?: string | null
  gateway_order_id?: string | null
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
  const orderId = (rawId || "").replace(/-P[A-Z0-9]+$/i, "").trim().toUpperCase()
  if (!orderId || !/^(SWAD-[A-Z0-9]{4,16}|SWD-\d{8}-[A-Z0-9]{8})$/i.test(orderId)) {
    return json({ error: "Invalid order ID format." }, 400)
  }

  const db = getDB()
  if (!db || typeof db.prepare !== "function") {
    return json({ error: "Order details currently unavailable." }, 503)
  }

  try {
    const order = await db
      .prepare(
        `SELECT id, customer_name, customer_phone, customer_address, pincode,
                delivery_method, subtotal, delivery_fee, total, currency,
                payment_status, payment_gateway, gateway_order_id, order_status, created_at, updated_at
         FROM orders
         WHERE id = ?
         LIMIT 1`,
      )
      .bind(orderId)
      .first<OrderRow>()

    if (!order) return json({ error: "Order not found." }, 404)

    const customerPhoneInput = request.headers.get("x-customer-phone") || new URL(request.url).searchParams.get("phone") || ""
    const adminKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "") || ""
    const isAdmin = Boolean(adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY)

    const dbPhoneDigits = (order.customer_phone || "").replace(/\D/g, "")
    const dbPhoneLast10 = dbPhoneDigits.slice(-10)

    let isVerified = isAdmin
    if (!isVerified && customerPhoneInput) {
      const phoneValidation = validateIndianMobile(customerPhoneInput)
      if (phoneValidation.isValid && phoneValidation.cleanPhone === dbPhoneLast10) {
        isVerified = true
      } else if (phoneValidation.isValid && phoneValidation.cleanPhone !== dbPhoneLast10) {
        return json(
          {
            error: "The mobile number entered does not match the mobile number used when placing this order. Please verify and try again.",
            requiresVerification: true,
          },
          403,
        )
      }
    }

    if (!isVerified) {
      return json({
        requiresVerification: true,
        order: {
          id: order.id,
          customerPhoneMasked: order.customer_phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
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
        const ppStatus = await getPhonePeOrderStatus(order.gateway_order_id)
        if (ppStatus.state === "COMPLETED") {
          order.payment_status = "paid"
          await db
            .prepare(`UPDATE orders SET payment_status = 'paid', updated_at = datetime('now') WHERE id = ?`)
            .bind(order.id)
            .run()
        } else if (ppStatus.state === "FAILED") {
          order.payment_status = "failed"
          await db
            .prepare(`UPDATE orders SET payment_status = 'failed', updated_at = datetime('now') WHERE id = ?`)
            .bind(order.id)
            .run()
        }
      } catch (err) {
        console.error("Order page PhonePe status check failed:", err)
      }
    }

    const itemsResult = await db
      .prepare(
        `SELECT product_name, weight, quantity, unit_price, line_total
         FROM order_items
         WHERE order_id = ?`,
      )
      .bind(orderId)
      .all<OrderItemRow>()

    return json({
      order: {
        id: order.id,
        customerName: order.customer_name,
        customerPhoneMasked: order.customer_phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
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
        items: (itemsResult.results ?? []).map((i) => ({
          productName: i.product_name,
          weight: i.weight,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          lineTotal: i.line_total,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to fetch public order:", error)
    return json({ error: "Failed to load order details." }, 500)
  }
}

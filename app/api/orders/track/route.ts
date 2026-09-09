import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { getPhonePeOrderStatus } from "@/lib/phonepe"
import { validateIndianMobile } from "@/lib/phone"

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

function getCF() {
  try {
    const { env } = getCloudflareContext()
    const db = (env as unknown as { DB?: D1Database })?.DB
    return { db }
  } catch {
    return { db: undefined }
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      orderId?: string
      phone?: string
    } | null

    const rawOrderId = body?.orderId?.trim().toUpperCase() || ""
    const rawPhone = body?.phone?.trim() || ""

    if (!rawOrderId) {
      return json({ error: "Please enter your Order ID." }, 400)
    }

    const orderIdMatch = rawOrderId.match(/SWAD-[A-Z0-9]{4,8}|SWD-\d{8}-[A-Z0-9]{8}/i)
    const orderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : rawOrderId

    if (!/^(SWAD-[A-Z0-9]{4,8}|SWD-\d{8}-[A-Z0-9]{8})$/i.test(orderId)) {
      return json({ error: "Invalid Order ID format. Expected format: SWAD-XXXX or SWD-YYYYMMDD-XXXXXXXX" }, 400)
    }

    const phoneValidation = validateIndianMobile(rawPhone)
    if (!phoneValidation.isValid) {
      return json({ error: phoneValidation.error || "Please enter a valid 10-digit mobile number." }, 400)
    }
    const inputPhoneLast10 = phoneValidation.cleanPhone

    const { db } = getCF()
    if (!db || typeof db.prepare !== "function") {
      return json({ error: "Database service currently unavailable. Please try again in a few moments." }, 503)
    }

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

    if (!order) {
      return json({ error: "No order found with Order ID " + orderId + ". Please check your order confirmation details." }, 404)
    }

    const dbPhoneDigits = (order.customer_phone || "").replace(/\D/g, "")
    const dbPhoneLast10 = dbPhoneDigits.slice(-10)

    if (dbPhoneLast10 !== inputPhoneLast10) {
      return json(
        {
          error: "The mobile number entered does not match the mobile number used when placing this order. Please verify and try again.",
        },
        403,
      )
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
      } catch (statusError) {
        console.error("Tracking PhonePe verification check failed:", statusError)
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
      verified: true,
      order: {
        id: order.id,
        customerName: order.customer_name,
        customerPhoneMasked: order.customer_phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
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
        items: (itemsResult.results ?? []).map((i) => ({
          productName: i.product_name,
          weight: i.weight,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          lineTotal: i.line_total,
        })),
      },
    })
  } catch (err) {
    console.error("Order tracking error:", err)
    return json({ error: "Failed to verify order details. Please try again." }, 500)
  }
}

import { getDB } from "@/lib/db"
import { jsonResponse as json, verifyAdminKey } from "@/lib/api"

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
  payment_gateway: string | null
  gateway_order_id: string | null
  payment_status: string
  order_status: string
  created_at: string
  updated_at: string
}

type OrderItemRow = {
  id: number
  order_id: string
  product_id: string
  product_name: string
  weight: string
  quantity: number
  unit_price: number
  line_total: number
}
function filterOrders<T extends { id: string; customerName: string; customerPhone: string; pincode: string; orderStatus: string }>(
  orders: T[],
  statusFilter?: string | null,
  searchQuery?: string | null,
): T[] {
  let result = orders
  if (statusFilter && statusFilter !== "all") {
    if (statusFilter === "active") {
      result = result.filter((o) =>
        ["new", "accepted", "preparing", "packed", "shipped"].includes(o.orderStatus),
      )
    } else {
      result = result.filter((o) => o.orderStatus === statusFilter)
    }
  }

  if (searchQuery) {
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(searchQuery) ||
        o.customerName.toLowerCase().includes(searchQuery) ||
        o.customerPhone.includes(searchQuery) ||
        o.pincode.includes(searchQuery),
    )
  }
  return result
}

let inMemoryOrders = [
  {
    id: "SWD-20260909-A1B2C3D4",
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    customerAddress: "Flat 402, Sunshine Heights, FC Road, Pune",
    pincode: "411004",
    deliveryMethod: "pune",
    subtotal: 480,
    deliveryFee: 0,
    total: 480,
    currency: "INR",
    paymentGateway: "phonepe",
    gatewayOrderId: "T260909010418",
    paymentStatus: "paid",
    orderStatus: "preparing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 1, product_name: "Patal Poha Chivda", weight: "500g", quantity: 2, unit_price: 160, line_total: 320 },
      { id: 2, product_name: "Instant Kanda Poha Premix", weight: "250g", quantity: 2, unit_price: 80, line_total: 160 },
    ],
  },
]

export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return json({ error: "Unauthorized. Invalid Admin Key." }, 401)
  }

  const db = getDB()

  const searchParams = new URL(request.url).searchParams
  const statusFilter = searchParams.get("status")?.trim()
  const searchQuery = searchParams.get("search")?.trim().toLowerCase()

  if (!db || typeof db.prepare !== "function") {
    return json({ orders: filterOrders([...inMemoryOrders], statusFilter, searchQuery) })
  }

  try {
    const ordersResult = await db
      .prepare(
        `SELECT id, customer_name, customer_phone, customer_address, pincode,
                delivery_method, subtotal, delivery_fee, total, currency,
                payment_gateway, gateway_order_id, payment_status, order_status,
                created_at, updated_at
         FROM orders
         ORDER BY created_at DESC
         LIMIT 200`,
      )
      .all<OrderRow>()

    const rawOrders = ordersResult.results ?? []

    const itemsResult = await db
      .prepare(
        `SELECT id, order_id, product_id, product_name, weight, quantity, unit_price, line_total
         FROM order_items`,
      )
      .all<OrderItemRow>()

    const itemsMap = new Map<string, OrderItemRow[]>()
    for (const item of itemsResult.results ?? []) {
      const list = itemsMap.get(item.order_id) ?? []
      list.push(item)
      itemsMap.set(item.order_id, list)
    }

    const formattedOrders = rawOrders.map((order) => ({
      id: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      pincode: order.pincode,
      deliveryMethod: order.delivery_method,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      currency: order.currency,
      paymentGateway: order.payment_gateway,
      gatewayOrderId: order.gateway_order_id,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: itemsMap.get(order.id) ?? [],
    }))

    return json({ orders: filterOrders(formattedOrders, statusFilter, searchQuery) })
  } catch (error) {
    console.warn("Failed to fetch admin orders from DB, returning in-memory fallback:", error)
    return json({ orders: filterOrders([...inMemoryOrders], statusFilter, searchQuery) })
  }
}

export async function PATCH(request: Request) {
  if (!verifyAdminKey(request)) {
    return json({ error: "Unauthorized. Invalid Admin Key." }, 401)
  }
  const db = getDB()

  let body: { orderId?: unknown; orderStatus?: unknown }
  try {
    body = (await request.json()) as { orderId?: unknown; orderStatus?: unknown }
  } catch {
    return json({ error: "Invalid JSON body." }, 400)
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : ""
  const orderStatus = typeof body.orderStatus === "string" ? body.orderStatus.trim() : ""

  const ALLOWED_STATUSES = [
    "new",
    "accepted",
    "preparing",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "refund_required",
  ]

  if (!orderId || !ALLOWED_STATUSES.includes(orderStatus)) {
    return json({ error: "Invalid orderId or orderStatus." }, 400)
  }

  if (!db || typeof db.prepare !== "function") {
    const order = inMemoryOrders.find((o) => o.id === orderId)
    if (order) {
      order.orderStatus = orderStatus
      order.updatedAt = new Date().toISOString()
    }
    return json({ success: true, orderId, orderStatus })
  }

  try {
    const result = await db
      .prepare(
        `UPDATE orders
         SET order_status = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(orderStatus, orderId)
      .run()

    if (!result.success) {
      return json({ error: "Failed to update order status." }, 500)
    }

    return json({ success: true, orderId, orderStatus })
  } catch (error) {
    console.error("Failed to update order status:", error)
    return json({ error: "Database error updating order status." }, 500)
  }
}

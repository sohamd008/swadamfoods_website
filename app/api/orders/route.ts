import { getCloudflareContext } from "@opennextjs/cloudflare"
import { products } from "@/lib/products"

export const dynamic = "force-dynamic"

type OrderItemInput = {
  productId: string
  quantity: number
}

type CreateOrderBody = {
  items: OrderItemInput[]
  customer: {
    name: string
    phone: string
    address: string
    pincode: string
  }
  delivery: "pune" | "porter"
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function generateOrderId(): string {
  const date = new Date()
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
  return `SWD-${y}${m}${d}-${random}`
}

export async function POST(request: Request) {
  let body: CreateOrderBody

  try {
    body = (await request.json()) as CreateOrderBody
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 })
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return Response.json({ error: "Your cart is empty." }, { status: 400 })
  }

  if (body.items.length > 20) {
    return Response.json({ error: "Too many different products in one order." }, { status: 400 })
  }

  const name = text(body.customer?.name)
  const phone = text(body.customer?.phone)
  const address = text(body.customer?.address)
  const pincode = text(body.customer?.pincode)
  const delivery = body.delivery

  if (!name || !phone || !address || !pincode) {
    return Response.json(
      { error: "Name, phone, address, and pincode are required." },
      { status: 400 },
    )
  }

  if (!/^[0-9+()\-\s]{10,20}$/.test(phone)) {
    return Response.json({ error: "Please enter a valid phone number." }, { status: 400 })
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    return Response.json({ error: "Please enter a valid 6-digit pincode." }, { status: 400 })
  }

  if (delivery !== "pune" && delivery !== "porter") {
    return Response.json({ error: "Invalid delivery method." }, { status: 400 })
  }

  const normalizedItems: Array<{
    productId: string
    productName: string
    weight: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }> = []

  for (const item of body.items) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      return Response.json({ error: "Invalid cart item." }, { status: 400 })
    }

    const product = products.find((candidate) => candidate.id === item.productId)

    if (!product) {
      return Response.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 },
      )
    }

    normalizedItems.push({
      productId: product.id,
      productName: product.name,
      weight: product.weight,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    })
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0)

  // Pune delivery is currently free. Porter charges are confirmed separately,
  // so the initial online payment covers the products only.
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  const { env } = getCloudflareContext()
  const db = env.DB
  const orderId = generateOrderId()

  try {
    const statements = [
      db
        .prepare(
          `INSERT INTO orders (
            id,
            customer_name,
            customer_phone,
            customer_address,
            pincode,
            delivery_method,
            subtotal,
            delivery_fee,
            total,
            currency,
            payment_status,
            order_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'pending', 'new')`,
        )
        .bind(
          orderId,
          name,
          phone,
          address,
          pincode,
          delivery,
          subtotal,
          deliveryFee,
          total,
        ),
      ...normalizedItems.map((item) =>
        db
          .prepare(
            `INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              weight,
              quantity,
              unit_price,
              line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            orderId,
            item.productId,
            item.productName,
            item.weight,
            item.quantity,
            item.unitPrice,
            item.lineTotal,
          ),
      ),
    ]

    await db.batch(statements)

    return Response.json(
      {
        orderId,
        currency: "INR",
        subtotal,
        deliveryFee,
        total,
        paymentStatus: "pending",
        orderStatus: "new",
        items: normalizedItems,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create order:", error)

    return Response.json(
      { error: "We couldn't create your order right now. Please try again." },
      { status: 500 },
    )
  }
}

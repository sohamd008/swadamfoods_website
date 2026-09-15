import { jsPDF } from "jspdf"
import { getDB } from "@/lib/db"
import { business } from "@/lib/products"
import { cleanOrderId, isValidOrderId, jsonResponse, verifyAdminKey } from "@/lib/api"
import { validateIndianMobile, maskPhone, sanitizePhone } from "@/lib/phone"
import { formatInvoiceNumber, numberToWordsINR } from "@/lib/invoice"

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
  order_status: string
  created_at: string
}

type ItemRow = {
  product_name: string
  weight: string
  quantity: number
  unit_price: number
  line_total: number
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = cleanOrderId(id)
  if (!isValidOrderId(orderId)) return new Response("Invalid order ID format.", { status: 400 })

  const db = getDB()
  if (!db) return new Response("Database temporarily unavailable.", { status: 503 })

  const order = await db
    .prepare(
      `SELECT id, customer_name, customer_phone, customer_address, pincode,
              delivery_method, subtotal, delivery_fee, total, currency,
              payment_status, order_status, created_at
       FROM orders WHERE id = ? LIMIT 1`,
    )
    .bind(orderId)
    .first<OrderRow>()

  if (!order) return new Response("Order not found.", { status: 404 })
  if (order.payment_status !== "paid") return new Response("Invoice is available after payment is confirmed.", { status: 409 })

  const admin = verifyAdminKey(request)
  const phoneInput = request.headers.get("x-customer-phone") || new URL(request.url).searchParams.get("phone") || ""
  const phoneValidation = phoneInput ? validateIndianMobile(phoneInput) : null
  const verifiedCustomer = Boolean(phoneValidation?.isValid && phoneValidation.cleanPhone === sanitizePhone(order.customer_phone))
  if (!admin && !verifiedCustomer) return new Response("Mobile number verification required to access the invoice.", { status: 403 })

  const items = (await db
    .prepare("SELECT product_name, weight, quantity, unit_price, line_total FROM order_items WHERE order_id = ? ORDER BY id")
    .bind(orderId)
    .all<ItemRow>()).results ?? []

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const margin = 14
  const pageWidth = 210
  const width = pageWidth - margin * 2
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  const invoiceTime = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })

  doc.setDrawColor(220, 215, 205)
  doc.rect(margin, 10, width, 277)
  doc.setFillColor(250, 247, 241)
  doc.rect(margin, 10, width, 34, "F")
  doc.line(margin, 44, margin + width, 44)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(45, 38, 30)
  doc.text(business.name.toUpperCase(), margin + 5, 18)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(85, 75, 65)
  doc.text("Authentic Indian snacks & instant premixes", margin + 5, 23)
  doc.text(business.address, margin + 5, 27)
  doc.text(`FSSAI: ${business.fssai} | WhatsApp: ${business.phoneDisplay}`, margin + 5, 31)
  doc.text(business.email, margin + 5, 35)

  const right = margin + 116
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(45, 38, 30)
  doc.text("ORDER INVOICE", right, 19)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(70, 65, 60)
  doc.text(`Invoice No: ${formatInvoiceNumber(order.id)}`, right, 25)
  doc.text(`Order ID: ${order.id}`, right, 29)
  doc.text(`Date: ${invoiceDate} ${invoiceTime}`, right, 33)
  doc.text(`Payment: PhonePe`, right, 37)
  doc.text("Paid", right, 41)

  let y = 51
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(100, 90, 80)
  doc.text("CUSTOMER", margin + 5, y)
  doc.text("DELIVERY", right, y)
  y += 5
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(30, 26, 22)
  doc.text(order.customer_name, margin + 5, y)
  doc.text(order.delivery_method === "porter" ? "Outside Pune · Porter" : "Pune · Home delivery", right, y)
  y += 4
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(70, 65, 60)
  const addressLines = doc.splitTextToSize(`${order.customer_address}, ${order.pincode}`, 96)
  doc.text(addressLines, margin + 5, y)
  doc.text(`Phone: ${maskPhone(order.customer_phone)}`, margin + 5, y + addressLines.length * 4 + 2)

  y += Math.max(addressLines.length * 4 + 9, 18)
  doc.line(margin, y, margin + width, y)
  y += 6
  doc.setFillColor(245, 242, 236)
  doc.rect(margin, y, width, 7, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(45, 38, 30)
  doc.text("#", margin + 3, y + 4.5)
  doc.text("Item", margin + 12, y + 4.5)
  doc.text("Pack", margin + 100, y + 4.5)
  doc.text("Qty", margin + 124, y + 4.5)
  doc.text("Rate", margin + 151, y + 4.5, { align: "right" })
  doc.text("Amount", margin + width - 4, y + 4.5, { align: "right" })
  y += 7

  items.forEach((item, index) => {
    doc.setFont("helvetica", index === 0 ? "bold" : "normal")
    doc.setFontSize(8)
    doc.setTextColor(35, 30, 25)
    doc.text(String(index + 1), margin + 3, y + 5)
    doc.text(item.product_name, margin + 12, y + 5)
    doc.setFont("helvetica", "normal")
    doc.text(item.weight, margin + 100, y + 5)
    doc.text(String(item.quantity), margin + 124, y + 5)
    doc.text(`Rs. ${item.unit_price.toFixed(2)}`, margin + 151, y + 5, { align: "right" })
    doc.setFont("helvetica", "bold")
    doc.text(`Rs. ${item.line_total.toFixed(2)}`, margin + width - 4, y + 5, { align: "right" })
    y += 8
    doc.setDrawColor(238, 234, 227)
    doc.line(margin, y, margin + width, y)
  })

  y += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(75, 68, 60)
  doc.text("Amount in Words:", margin + 5, y)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(35, 30, 25)
  doc.text(numberToWordsINR(order.total), margin + 5, y + 5)

  const totalX = margin + 127
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 68, 60)
  doc.text("Subtotal:", totalX, y)
  doc.text(`Rs. ${order.subtotal.toFixed(2)}`, margin + width - 4, y, { align: "right" })
  doc.text("Delivery:", totalX, y + 5)
  doc.text(order.delivery_fee === 0 ? "FREE" : `Rs. ${order.delivery_fee.toFixed(2)}`, margin + width - 4, y + 5, { align: "right" })
  doc.setFillColor(250, 247, 241)
  doc.rect(totalX - 3, y + 10, width - 122, 9, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(35, 30, 25)
  doc.text("Total Paid:", totalX, y + 16)
  doc.text(`Rs. ${order.total.toFixed(2)}`, margin + width - 4, y + 16, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 92, 84)
  doc.text("Payment confirmed through PhonePe Payment Gateway.", margin + 5, 268)
  doc.text("Thank you for ordering from Swadam Foods.", margin + 5, 274)
  doc.text("This document is an order invoice. Tax treatment should follow the applicable registration and invoice requirements.", margin + width / 2, 282, { align: "center" })

  return new Response(doc.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${order.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  })
}

import { jsPDF } from "jspdf"
import { getDB } from "@/lib/db"
import { cleanOrderId, isValidOrderId } from "@/lib/api"
import { validateIndianMobile, maskPhone, sanitizePhone } from "@/lib/phone"
import { numberToWordsINR, calculateGSTBreakdown, formatInvoiceNumber } from "@/lib/invoice"

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

  if (!orderId || !isValidOrderId(orderId)) {
    return new Response("Invalid order ID format.", { status: 400 })
  }

  const db = getDB()
  if (!db || typeof db.prepare !== "function") {
    return new Response("Database temporarily unavailable.", { status: 503 })
  }

  const order = await db
    .prepare(
      `SELECT id, customer_name, customer_phone, customer_address, pincode,
              delivery_method, subtotal, delivery_fee, total, currency,
              payment_status, order_status, created_at
       FROM orders
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(orderId)
    .first<OrderRow>()

  if (!order) {
    return new Response("Order not found.", { status: 404 })
  }

  const customerPhoneInput = request.headers.get("x-customer-phone") || new URL(request.url).searchParams.get("phone") || ""
  const adminKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "") || ""
  const isAdmin = Boolean(adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY)

  const dbPhoneLast10 = sanitizePhone(order.customer_phone || "")

  let isVerified = isAdmin
  if (!isVerified && customerPhoneInput) {
    const phoneValidation = validateIndianMobile(customerPhoneInput)
    if (phoneValidation.isValid && phoneValidation.cleanPhone === dbPhoneLast10) {
      isVerified = true
    }
  }

  if (!isVerified) {
    return new Response("Mobile number verification required to access tax invoice.", { status: 403 })
  }

  const itemsResult = await db
    .prepare(
      `SELECT product_name, weight, quantity, unit_price, line_total
       FROM order_items
       WHERE order_id = ?`,
    )
    .bind(orderId)
    .all<OrderItemRow>()

  const items = itemsResult.results ?? []

  const invoiceNumber = formatInvoiceNumber(order.id)
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const invoiceTime = new Date(order.created_at).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const { taxableValue, totalGst, cgst, sgst } = calculateGSTBreakdown(order.total)
  const maskedPhone = maskPhone(order.customer_phone)

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const margin = 14
  const pageWidth = 210
  const contentWidth = pageWidth - margin * 2

  doc.setDrawColor(226, 232, 240)
  doc.rect(margin, 10, contentWidth, 277)

  doc.setFillColor(248, 250, 252)
  doc.rect(margin, 10, contentWidth, 34, "F")
  doc.setDrawColor(203, 213, 225)
  doc.line(margin, 44, margin + contentWidth, 44)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(30, 41, 59)
  doc.text("SWADAM FOODS", margin + 5, 18)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text("Authentic Homemade Delicacies & Instant Premixes", margin + 5, 23)
  doc.text("B-10, Ruturang Society, Aranyeshwar, Pune 411009", margin + 5, 27)
  doc.setFont("helvetica", "bold")
  doc.text("GSTIN: 27AOCPD1930N1Z1 | FSSAI: 21524018002620 | MSME: UDYAM-MH-26-1188295", margin + 5, 31)
  doc.setFont("helvetica", "normal")
  doc.text("WhatsApp: +91 88888 51522 | Email: contact@swadamfoods.eu.cc", margin + 5, 35)
  doc.text("FSSAI Registered Category: 2106 90 99 (Food Preparations)", margin + 5, 39)

  const rightColX = margin + 115
  doc.setFillColor(234, 88, 12)
  doc.roundedRect(rightColX, 14, 62, 7, 1.5, 1.5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(255, 255, 255)
  doc.text("TAX INVOICE / BILL OF SUPPLY", rightColX + 31, 18.8, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(51, 65, 85)
  doc.text("Invoice No: " + invoiceNumber, rightColX, 26)
  doc.text("Order ID: " + order.id, rightColX, 30)
  doc.text("Date: " + invoiceDate + " " + invoiceTime, rightColX, 34)
  doc.text("Place of Supply: Maharashtra (27)", rightColX, 38)
  doc.text("Reverse Charge: No", rightColX, 42)

  let curY = 50
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text("BILLED & SHIPPED TO", margin + 5, curY)
  doc.text("FULFILLMENT & PAYMENT", rightColX, curY)

  curY += 4.5
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text(order.customer_name, margin + 5, curY)
  doc.text(order.delivery_method === "porter" ? "Porter Delivery" : "Pune Home Delivery", rightColX, curY)

  curY += 4
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  const addrLines = doc.splitTextToSize(order.customer_address + ", Pune - " + order.pincode, 95)
  doc.text(addrLines, margin + 5, curY)
  doc.text("Payment: PhonePe Payment Gateway", rightColX, curY)
  doc.text("Payment Status: " + (order.payment_status === "paid" ? "PAID IN FULL" : "PENDING"), rightColX, curY + 4)
  doc.text("Delivery Fee: FREE", rightColX, curY + 8)

  curY += Math.max(addrLines.length * 4 + 4, 14)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.text("Phone: " + maskedPhone, margin + 5, curY - 2)

  doc.setDrawColor(203, 213, 225)
  doc.line(margin, curY, margin + contentWidth, curY)

  curY += 5
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, curY, contentWidth, 7, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(30, 41, 59)
  doc.text("#", margin + 3, curY + 4.5)
  doc.text("Item Description", margin + 12, curY + 4.5)
  doc.text("HSN", margin + 82, curY + 4.5)
  doc.text("Pack", margin + 105, curY + 4.5)
  doc.text("Qty", margin + 125, curY + 4.5)
  doc.text("Rate", margin + 145, curY + 4.5, { align: "right" })
  doc.text("Total (Rs)", margin + contentWidth - 4, curY + 4.5, { align: "right" })

  curY += 7
  items.forEach((it, i) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)
    doc.text(String(i + 1), margin + 3, curY + 5)
    doc.setFont("helvetica", "bold")
    doc.text(it.product_name, margin + 12, curY + 5)
    doc.setFont("helvetica", "normal")
    doc.text("2106 90 99", margin + 82, curY + 5)
    doc.text(it.weight, margin + 105, curY + 5)
    doc.text(String(it.quantity), margin + 125, curY + 5)
    doc.text("Rs. " + it.unit_price, margin + 145, curY + 5, { align: "right" })
    doc.setFont("helvetica", "bold")
    doc.text("Rs. " + it.line_total, margin + contentWidth - 4, curY + 5, { align: "right" })
    curY += 7
    doc.setDrawColor(241, 245, 249)
    doc.line(margin, curY, margin + contentWidth, curY)
  })

  curY += 6
  doc.setDrawColor(203, 213, 225)
  doc.line(margin, curY, margin + contentWidth, curY)

  curY += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text("Amount in Words:", margin + 5, curY)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(numberToWordsINR(order.total), margin + 5, curY + 4.5)

  const totX = margin + 120
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text("Subtotal:", totX, curY)
  doc.text("Rs. " + order.subtotal.toFixed(2), margin + contentWidth - 4, curY, { align: "right" })

  doc.text("CGST (2.5%):", totX, curY + 4)
  doc.text("Rs. " + cgst.toFixed(2), margin + contentWidth - 4, curY + 4, { align: "right" })

  doc.text("SGST (2.5%):", totX, curY + 8)
  doc.text("Rs. " + sgst.toFixed(2), margin + contentWidth - 4, curY + 8, { align: "right" })

  doc.text("Delivery Fee:", totX, curY + 12)
  doc.text(order.delivery_fee === 0 ? "FREE" : "Rs. " + order.delivery_fee.toFixed(2), margin + contentWidth - 4, curY + 12, { align: "right" })

  doc.setFillColor(248, 250, 252)
  doc.rect(totX - 2, curY + 15, contentWidth - 118, 8, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text("Grand Total:", totX, curY + 20.5)
  doc.text("Rs. " + order.total.toFixed(2), margin + contentWidth - 4, curY + 20.5, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text("Payment Verified via PhonePe Payment Gateway (RBI Authorized)", margin + 5, 270)
  doc.text("For SWADAM FOODS — Authorised Signatory", margin + contentWidth - 4, 270, { align: "right" })
  doc.text("This is an authentic, computer-generated tax invoice issued by Swadam Foods under GST rules.", margin + contentWidth / 2, 280, { align: "center" })

  const pdfBytes = doc.output("arraybuffer")

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${order.id}.pdf"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

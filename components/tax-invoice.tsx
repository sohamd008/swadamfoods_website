"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Printer, Download, X, ShieldCheck, CheckCircle2, Building2, Loader2 } from "lucide-react"
import { PhonePeIcon } from "@/components/phonepe-logo"

export type TaxInvoiceOrder = {
  id: string
  customerName: string
  customerPhoneMasked: string
  customerAddress: string
  pincode: string
  deliveryMethod: string
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  items: Array<{
    productName: string
    weight: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

function numberToWordsINR(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ]
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ]

  function convertTwoDigits(n: number): string {
    if (n === 0) return ""
    if (n < 20) return ones[n]
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100)
    const rest = n % 100
    let res = ""
    if (hundred > 0) res += ones[hundred] + " Hundred"
    if (rest > 0) res += (res ? " " : "") + convertTwoDigits(rest)
    return res
  }

  const rounded = Math.round(amount)
  if (rounded === 0) return "Zero Rupees Only"

  let num = rounded
  const crore = Math.floor(num / 10000000)
  num %= 10000000
  const lakh = Math.floor(num / 100000)
  num %= 100000
  const thousand = Math.floor(num / 1000)
  num %= 1000
  const remainder = num

  let parts: string[] = []
  if (crore > 0) parts.push(convertTwoDigits(crore) + " Crore")
  if (lakh > 0) parts.push(convertTwoDigits(lakh) + " Lakh")
  if (thousand > 0) parts.push(convertTwoDigits(thousand) + " Thousand")
  if (remainder > 0) parts.push(convertThreeDigits(remainder))

  return "INR " + parts.join(" ") + " Only"
}

export function TaxInvoiceModal({
  order,
  isOpen,
  onClose,
}: {
  order: TaxInvoiceOrder
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  const invoiceNumber = `INV-${order.id.replace(/^(SWAD-|SWD-)/, "")}`
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const invoiceTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const gstRate = 0.05
  const taxableValue = Math.round((order.total / (1 + gstRate)) * 100) / 100
  const totalGst = Math.round((order.total - taxableValue) * 100) / 100
  const cgst = Math.round((totalGst / 2) * 100) / 100
  const sgst = Math.round((totalGst - cgst) * 100) / 100

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const { jsPDF } = await import("jspdf")
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
      doc.text("Proprietor: Sanyukta Sachin Dhumal | B-10, Ruturang Society, Aranyeshwar, Pune 411009", margin + 5, 27)
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
      doc.text(order.customerName, margin + 5, curY)
      doc.text(order.deliveryMethod === "porter" ? "Porter Delivery" : "Pune Home Delivery", rightColX, curY)

      curY += 4
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(51, 65, 85)
      const addrLines = doc.splitTextToSize(order.customerAddress + ", Pune - " + order.pincode, 95)
      doc.text(addrLines, margin + 5, curY)
      doc.text("Payment: PhonePe Payment Gateway", rightColX, curY)
      doc.text("Payment Status: " + (order.paymentStatus === "paid" ? "PAID IN FULL" : "PENDING"), rightColX, curY + 4)
      doc.text("Delivery Fee: FREE", rightColX, curY + 8)

      curY += Math.max(addrLines.length * 4 + 4, 14)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.text("Phone: " + order.customerPhoneMasked, margin + 5, curY - 2)

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
      order.items.forEach((it, i) => {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(15, 23, 42)
        doc.text(String(i + 1), margin + 3, curY + 5)
        doc.setFont("helvetica", "bold")
        doc.text(it.productName, margin + 12, curY + 5)
        doc.setFont("helvetica", "normal")
        doc.text("2106 90 99", margin + 82, curY + 5)
        doc.text(it.weight, margin + 105, curY + 5)
        doc.text(String(it.quantity), margin + 125, curY + 5)
        doc.text("Rs. " + it.unitPrice, margin + 145, curY + 5, { align: "right" })
        doc.setFont("helvetica", "bold")
        doc.text("Rs. " + it.lineTotal, margin + contentWidth - 4, curY + 5, { align: "right" })
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
      doc.text(order.deliveryFee === 0 ? "FREE" : "Rs. " + order.deliveryFee.toFixed(2), margin + contentWidth - 4, curY + 12, { align: "right" })

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

      doc.save(`Invoice-${order.id}.pdf`)
    } catch {
      window.open(`/api/orders/${encodeURIComponent(order.id)}/invoice`, "_blank")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-sm print:p-0 print:bg-white print:static"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] rounded-3xl bg-white text-stone-900 shadow-2xl border border-stone-200 overflow-hidden print:shadow-none print:border-none print:m-0 print:rounded-none print:w-full print:max-w-none"
      >
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 px-3 py-3 sm:px-6 sm:py-3.5 bg-stone-50/95 backdrop-blur-md print:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-5 w-5 text-amber-700 shrink-0" />
            <span className="font-heading text-xs sm:text-base font-extrabold text-stone-900 truncate">Tax Invoice / Bill of Supply</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 sm:px-4 text-xs font-extrabold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition touch-manipulation disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 active:scale-95 transition touch-manipulation"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-2.5 py-2 sm:px-3 text-xs font-extrabold text-stone-700 hover:bg-stone-100 active:scale-95 transition touch-manipulation shadow-xs"
              aria-label="Close invoice"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        <div id="tax-invoice-printable" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-stone-900 bg-white overscroll-contain">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-stone-200 pb-6">
            <div className="space-y-2 max-w-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/swadam-logo.webp"
                  alt="Swadam Foods"
                  width={140}
                  height={45}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="text-xs text-stone-600 leading-relaxed pt-1">
                <p className="font-extrabold text-sm text-stone-900">SWADAM FOODS</p>
                <p className="font-medium">Proprietor: Sanyukta Sachin Dhumal</p>
                <p>B-10, Ruturang Society, Aranyeshwar,</p>
                <p>Pune, Maharashtra 411009, India</p>
                <p className="pt-1 font-semibold text-stone-900">
                  GSTIN: <span className="font-mono text-stone-900 font-bold">27AOCPD1930N1Z1</span>
                </p>
                <p className="font-semibold text-stone-900">
                  FSSAI Lic. No: <span className="font-mono text-stone-900 font-bold">21524018002620</span>
                </p>
                <p className="font-semibold text-stone-900">
                  MSME: <span className="font-mono">UDYAM-MH-26-1188295</span>
                </p>
                <p className="text-stone-500 pt-0.5">WhatsApp / Phone: +91 88888 51522</p>
                <p className="text-stone-500">Email: contact@swadamfoods.eu.cc</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 sm:min-w-[200px]">
              <div className="inline-block rounded-xl border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-stone-700">
                TAX INVOICE
              </div>
              <div className="pt-2 text-xs space-y-1">
                <div>
                  <span className="text-stone-500">Invoice No:</span>{" "}
                  <span className="font-mono font-bold text-stone-900">{invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-stone-500">Order ID:</span>{" "}
                  <span className="font-mono font-bold text-stone-900">{order.id}</span>
                </div>
                <div>
                  <span className="text-stone-500">Date:</span>{" "}
                  <span className="font-medium text-stone-900">{invoiceDate}</span>
                </div>
                <div>
                  <span className="text-stone-500">Time:</span>{" "}
                  <span className="font-medium text-stone-900">{invoiceTime}</span>
                </div>
                <div>
                  <span className="text-stone-500">Place of Supply:</span>{" "}
                  <span className="font-semibold text-stone-900">Maharashtra (27)</span>
                </div>
                <div>
                  <span className="text-stone-500">Reverse Charge:</span>{" "}
                  <span className="font-semibold text-stone-900">No</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4 text-xs">
            <div className="space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-stone-500 text-[10px] block">
                Billed &amp; Shipped To
              </span>
              <p className="text-sm font-extrabold text-stone-900">{order.customerName}</p>
              <p className="font-medium text-stone-700 leading-relaxed">{order.customerAddress}</p>
              <p className="font-bold text-stone-900">Pincode: {order.pincode}</p>
              <p className="font-mono text-stone-600">Phone: {order.customerPhoneMasked}</p>
              <p className="text-stone-500">State: Maharashtra (27)</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="font-extrabold uppercase tracking-wider text-stone-500 text-[10px] block">
                Shipping &amp; Fulfillment
              </span>
              <p className="font-bold text-stone-900">
                {order.deliveryMethod === "porter" ? "Porter Express Delivery" : "Pune Local Home Delivery"}
              </p>
              <p className="text-stone-500">Delivery Charges: FREE</p>
              <div className="pt-2">
                <span className="font-extrabold uppercase tracking-wider text-stone-500 text-[10px] block">
                  Payment Status
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px] mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {order.paymentStatus === "paid" ? "PAID IN FULL" : "PAYMENT PENDING"}
                </span>
                <p className="text-[10px] text-stone-500 pt-0.5">Via PhonePe Payment Gateway</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full min-w-[540px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-y-2 border-stone-300 bg-stone-100 text-stone-700 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 text-center">HSN</th>
                  <th className="py-2.5 px-2 text-center">Pack</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-mono text-stone-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900">{item.productName}</p>
                      <p className="text-[10px] text-stone-500">Food preparation / Traditional Maharashtrian</p>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-stone-600">2106 90 99</td>
                    <td className="py-3 px-2 text-center text-stone-600">{item.weight}</td>
                    <td className="py-3 px-2 text-center font-bold text-stone-900">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-stone-700">₹{item.unitPrice}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">₹{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-stone-200 pt-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="font-extrabold uppercase tracking-wider text-stone-400 text-[10px] block">
                  Amount in Words
                </span>
                <p className="font-bold text-stone-800 italic mt-0.5">{numberToWordsINR(order.total)}</p>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 flex items-center gap-2.5">
                <PhonePeIcon className="h-5 w-5 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-extrabold text-[#5F259F]">Payment Verified</p>
                  <p className="text-stone-500 text-[10px]">Processed via PhonePe Payment Gateway (RBI Authorized)</p>
                </div>
              </div>

              <div className="text-[10px] text-stone-500 space-y-0.5 pt-1">
                <p className="font-semibold text-stone-700">Terms &amp; Conditions:</p>
                <p>1. Goods once sold are not returnable except in case of damage during transit.</p>
                <p>2. Keep in a cool, dry place. Consume within packaging shelf-life.</p>
                <p>3. Disputes subject to Pune jurisdiction only.</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 py-1">
                <span>Taxable Value (Food Prep @ 5% Inclusive):</span>
                <span className="font-mono font-medium">₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600 py-1">
                <span>Central GST (CGST 2.5%):</span>
                <span className="font-mono font-medium">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600 py-1">
                <span>State GST (SGST 2.5%):</span>
                <span className="font-mono font-medium">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600 py-1 border-b border-stone-200 pb-2">
                <span>Delivery / Freight Charges:</span>
                <span className="font-mono text-emerald-700 font-bold">FREE (₹0.00)</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-1">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-lg text-emerald-700">₹{order.total.toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-6 text-right">
                <div className="inline-block text-center border-t border-stone-300 pt-2 min-w-[180px]">
                  <p className="font-bold text-xs text-stone-900">For SWADAM FOODS</p>
                  <p className="text-[10px] text-stone-500 italic mt-0.5">Authorised Signatory</p>
                  <p className="text-[9px] text-stone-400 mt-1">Computer Generated Tax Invoice</p>
                  <p className="text-[9px] text-stone-400">No Physical Signature Required</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200 print:hidden">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Official GST &amp; FSSAI Compliant Tax Invoice</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground shadow-md active:scale-95 transition touch-manipulation disabled:opacity-60"
              >
                {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>{isGeneratingPdf ? "Generating PDF..." : "Download Official PDF"}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-200 active:scale-95 transition touch-manipulation"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-xs font-extrabold text-stone-700 hover:bg-stone-200 active:scale-95 transition touch-manipulation"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 text-center text-[10px] text-stone-400 print:pt-6">
            Thank you for ordering with Swadam Foods! Authentic, pure Maharashtrian delicacies made with love.
          </div>
        </div>
      </div>
    </div>
  )
}

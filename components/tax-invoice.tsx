"use client"

import { useState } from "react"
import Image from "next/image"
import { Printer, Download, X, ShieldCheck, CheckCircle2, Building2 } from "lucide-react"
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

  const invoiceNumber = `INV-${order.id.replace(/^SWD-/, "")}`
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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-2 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="relative my-6 w-full max-w-3xl rounded-3xl bg-white text-stone-900 shadow-2xl border border-stone-200 overflow-hidden print:shadow-none print:border-none print:m-0 print:rounded-none print:w-full print:max-w-none">
        
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-6 sm:py-4 bg-stone-50/95 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-5 w-5 text-amber-700 shrink-0" />
            <span className="font-heading text-sm sm:text-base font-extrabold text-stone-900 truncate">Tax Invoice / Bill of Supply</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 sm:px-4 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition touch-manipulation"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition touch-manipulation"
              aria-label="Close invoice"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div id="tax-invoice-printable" className="p-6 sm:p-8 space-y-6 text-stone-900 bg-white">
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

          <div className="border-t border-stone-200 pt-4 text-center text-[10px] text-stone-400 print:pt-6">
            Thank you for ordering with Swadam Foods! Authentic, pure Maharashtrian delicacies made with love.
          </div>
        </div>
      </div>
    </div>
  )
}

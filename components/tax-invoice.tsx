"use client"

import { useEffect, useState } from "react"
import { Building2, Download, Loader2, Printer, ShieldCheck, X } from "lucide-react"
import { business } from "@/lib/products"
import { formatInvoiceNumber, numberToWordsINR } from "@/lib/invoice"

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

type TaxInvoiceModalProps = {
  order: TaxInvoiceOrder
  isOpen: boolean
  onClose: () => void
  adminKey?: string
}

export function TaxInvoiceModal({ order, isOpen, onClose, adminKey }: TaxInvoiceModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState("")

  useEffect(() => {
    if (!isOpen) return
    setDownloadError("")
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const date = new Date(order.createdAt)
  const invoiceNumber = formatInvoiceNumber(order.id)
  const download = async () => {
    if (order.paymentStatus !== "paid" || downloading) return
    setDownloading(true)
    setDownloadError("")

    try {
      let resolvedAdminKey = adminKey?.trim() ?? ""
      let customerPhone = ""

      try {
        if (!resolvedAdminKey) resolvedAdminKey = localStorage.getItem("swadam_admin_key")?.trim() ?? ""
        if (!customerPhone) customerPhone = sessionStorage.getItem(`swadam_track_verified_${order.id}`)?.trim() ?? ""
        if (!customerPhone) customerPhone = localStorage.getItem(`swadam_track_verified_${order.id}`)?.trim() ?? ""
      } catch {}

      const headers: HeadersInit = { Accept: "application/pdf" }
      if (resolvedAdminKey) headers["x-admin-key"] = resolvedAdminKey
      if (customerPhone) headers["x-customer-phone"] = customerPhone

      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}/invoice`, {
        cache: "no-store",
        headers,
      })

      if (!response.ok) {
        const message = await response.text().catch(() => "")
        throw new Error(message || `Invoice download failed (${response.status}).`)
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
      if (!contentType.includes("application/pdf")) throw new Error("The server returned an invalid invoice file.")

      const blob = await response.blob()
      if (blob.size === 0) throw new Error("The invoice file is empty.")

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `Invoice-${order.id}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Unable to download the invoice right now.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <section className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white text-stone-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2"><Building2 className="h-5 w-5 shrink-0 text-amber-700" /><span className="truncate text-sm font-extrabold sm:text-base">Order Invoice</span></div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={download} disabled={downloading || order.paymentStatus !== "paid"} className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-3.5 w-3.5" />{downloading ? "Preparing…" : "PDF"}</button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold"><Printer className="h-3.5 w-3.5" />Print</button>
            <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-stone-200" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
        </div>

        {downloadError && (
          <div className="mx-3 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 sm:mx-6" role="alert">
            {downloadError}
          </div>
        )}

        <div id="tax-invoice-printable" className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="rounded-2xl border border-stone-200 p-4 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{business.name}</h1>
                <p className="mt-1 text-xs text-stone-600">Authentic Indian snacks &amp; instant premixes</p>
                <p className="mt-2 max-w-md text-xs leading-5 text-stone-600">{business.address}</p>
                <p className="mt-1 text-xs text-stone-600">FSSAI: {business.fssai} · {business.phoneDisplay}</p>
                <p className="text-xs text-stone-600">{business.email}</p>
              </div>
              <div className="sm:text-right"><p className="text-lg font-black">ORDER INVOICE</p><p className="mt-2 text-xs text-stone-600">Invoice No: {invoiceNumber}</p><p className="text-xs text-stone-600">Order ID: {order.id}</p><p className="text-xs text-stone-600">{date.toLocaleDateString("en-IN")} · {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p><p className="mt-1 text-xs font-bold text-emerald-700">Payment: {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus}</p></div>
            </div>

            <div className="grid gap-5 border-b border-stone-200 py-5 sm:grid-cols-2">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Customer</p><p className="mt-1 font-bold">{order.customerName}</p><p className="mt-1 text-sm text-stone-600">{order.customerAddress}, {order.pincode}</p><p className="mt-1 text-xs text-stone-500">Phone: {order.customerPhoneMasked}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Delivery</p><p className="mt-1 font-bold">{order.deliveryMethod === "porter" ? "Outside Pune · Porter" : "Pune · Home delivery"}</p><p className="mt-1 text-sm text-stone-600">Delivery: {order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee.toFixed(2)}`}</p></div>
            </div>

            <div className="overflow-x-auto py-5">
              <table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-stone-300 text-xs uppercase tracking-wide text-stone-500"><th className="pb-3 pr-3">#</th><th className="pb-3 pr-3">Item</th><th className="pb-3 pr-3">Pack</th><th className="pb-3 pr-3">Qty</th><th className="pb-3 pr-3 text-right">Rate</th><th className="pb-3 text-right">Amount</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={`${item.productName}-${index}`} className="border-b border-stone-100"><td className="py-3 pr-3">{index + 1}</td><td className="py-3 pr-3 font-semibold">{item.productName}</td><td className="py-3 pr-3">{item.weight}</td><td className="py-3 pr-3">{item.quantity}</td><td className="py-3 pr-3 text-right">₹{item.unitPrice.toFixed(2)}</td><td className="py-3 text-right font-bold">₹{item.lineTotal.toFixed(2)}</td></tr>)}</tbody></table>
            </div>

            <div className="flex flex-col gap-6 border-t border-stone-200 pt-5 sm:flex-row sm:justify-between"><div className="max-w-md"><p className="text-xs text-stone-500">Amount in words</p><p className="mt-1 text-sm font-bold">{numberToWordsINR(order.total)}</p><p className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Payment confirmed through PhonePe.</p></div><div className="w-full max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-stone-500">Delivery</span><span>{order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee.toFixed(2)}`}</span></div><div className="flex justify-between border-t border-stone-200 pt-3 text-base font-black"><span>Total Paid</span><span>₹{order.total.toFixed(2)}</span></div></div></div>
          </div>
        </div>
      </section>
    </div>
  )
}

"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, ArrowLeft, Check, CheckCircle2, ChefHat, Clock, Copy, FileText, Lock, PackageCheck, Phone, RefreshCw, Search, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCart } from "@/lib/cart-context"
import { WHATSAPP_NUMBER, products } from "@/lib/products"
import { sanitizePhone, validateIndianMobile } from "@/lib/phone"

const TaxInvoiceModal = dynamic(() => import("@/components/tax-invoice").then((mod) => mod.TaxInvoiceModal), { ssr: false })

type OrderItem = { productName: string; weight: string; quantity: number; unitPrice: number; lineTotal: number }
type OrderDetails = {
  id: string; customerName: string; customerPhoneMasked: string; customerPhone: string; customerAddress: string; pincode: string
  deliveryMethod: string; subtotal: number; deliveryFee: number; total: number; currency: string; paymentStatus: string; orderStatus: string
  createdAt: string; updatedAt: string; items: OrderItem[]
}
type Toast = { type: "info" | "success" | "error"; message: string }

const STAGES = [
  { label: "Order Received", icon: Clock },
  { label: "Payment Confirmed", icon: ShieldCheck },
  { label: "Preparing", icon: ChefHat },
  { label: "Packed", icon: PackageCheck },
  { label: "Out for Delivery", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
] as const

function stageIndex(order: Pick<OrderDetails, "orderStatus" | "paymentStatus">) {
  switch (order.orderStatus) {
    case "delivered": return 5
    case "shipped": return 4
    case "packed": return 3
    case "preparing": return 2
    case "accepted": return 1
    default: return order.paymentStatus === "paid" ? 1 : 0
  }
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return value
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function TrackOrderPage({ initialOrderId: initialOrderIdProp, initialPhone: initialPhoneProp }: { initialOrderId?: string; initialPhone?: string } = {}) {
  const searchParams = useSearchParams()
  const { addItem, openCart, clear: clearCart } = useCart()
  const initialOrderId = useMemo(() => (initialOrderIdProp || searchParams?.get("orderId") || searchParams?.get("id") || "").trim().toUpperCase(), [initialOrderIdProp, searchParams])
  const initialPhone = useMemo(() => initialPhoneProp || searchParams?.get("phone") || searchParams?.get("mobile") || "", [initialPhoneProp, searchParams])
  const [orderId, setOrderId] = useState(initialOrderId)
  const [phone, setPhone] = useState(sanitizePhone(initialPhone))
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [copied, setCopied] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoChecked = useRef(false)

  const notify = useCallback((type: Toast["type"], message: string, duration = 5000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = setTimeout(() => setToast(null), duration)
  }, [])

  useEffect(() => {
    setOrderId(initialOrderId)
    setPhone(sanitizePhone(initialPhone))
  }, [initialOrderId, initialPhone])

  const verify = useCallback(async (idValue = orderId, phoneValue = phone, silent = false) => {
    const cleanId = idValue.trim().toUpperCase()
    const phoneCheck = validateIndianMobile(phoneValue)
    if (!cleanId) { if (!silent) notify("error", "Please enter your Order ID."); return false }
    if (!phoneCheck.isValid) { if (!silent) notify("error", phoneCheck.error || "Please enter a valid mobile number."); return false }

    setLoading(true)
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        cache: "no-store",
        body: JSON.stringify({ orderId: cleanId, phone: phoneCheck.cleanPhone }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string; order?: OrderDetails } | null
      if (!response.ok || !data?.order) throw new Error(data?.error || "We couldn't verify that order.")
      setOrderId(cleanId)
      setPhone(phoneCheck.cleanPhone)
      setOrder(data.order)
      try {
        localStorage.setItem(`swadam_track_verified_${cleanId}`, phoneCheck.cleanPhone)
        sessionStorage.setItem(`swadam_track_verified_${cleanId}`, phoneCheck.cleanPhone)
      } catch {}
      if (data.order.paymentStatus === "paid") clearCart()
      if (!silent) notify("success", `Order ${data.order.id} verified.`, 3000)
      return true
    } catch (error) {
      if (!silent) notify("error", error instanceof Error ? error.message : "We couldn't verify the order right now.")
      return false
    } finally {
      setLoading(false)
    }
  }, [clearCart, notify, orderId, phone])

  useEffect(() => {
    if (autoChecked.current || !initialOrderId) return
    autoChecked.current = true
    let savedPhone = sanitizePhone(initialPhone)
    try {
      if (!savedPhone) savedPhone = sanitizePhone(localStorage.getItem(`swadam_track_verified_${initialOrderId}`) || sessionStorage.getItem(`swadam_track_verified_${initialOrderId}`) || "")
    } catch {}
    if (savedPhone) void verify(initialOrderId, savedPhone, true)
  }, [initialOrderId, initialPhone, verify])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const currentStage = order ? stageIndex(order) : 0
  const whatsappMessage = useMemo(() => order
    ? `Namaste ${order.customerName}! Your Swadam Foods order *${order.id}* is currently *${order.orderStatus}*.\n\nTrack order: https://swadamfoods.eu.cc/track?orderId=${encodeURIComponent(order.id)}`
    : "Namaste Swadam Foods! I need help tracking my order.", [order])

  const copyOrderId = useCallback(async () => {
    if (!order) return
    try {
      await navigator.clipboard.writeText(order.id)
      setCopied(true)
      notify("success", "Order ID copied.", 2200)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      notify("error", "Couldn't copy the Order ID.")
    }
  }, [notify, order])

  const reset = useCallback(() => {
    setOrder(null)
    setToast(null)
    setCopied(false)
    setInvoiceOpen(false)
  }, [])

  return (
    <div className="ambient-bg min-h-screen pb-16 pt-4">
      {toast && <div role={toast.type === "error" ? "alert" : "status"} aria-live="polite" className="fixed inset-x-0 top-3 z-[1000] flex justify-center px-3 sm:top-5"><div className={`flex w-full max-w-xl items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-2xl ${toast.type === "error" ? "border-destructive/25 bg-destructive/10" : toast.type === "success" ? "border-emerald-500/25 bg-emerald-500/10" : "border-primary/20 bg-card/95"}`}>{toast.type === "error" ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />}<p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{toast.message}</p><button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="rounded-full p-1 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button></div></div>}
      <header className="sticky top-3 z-40 mx-auto max-w-4xl px-4 sm:px-6"><div className="glass-header flex h-16 items-center justify-between gap-4 rounded-full px-4 sm:px-6"><Link href="/" className="flex min-w-0 items-center gap-2.5"><span className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7]/90 p-1"><Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={59} height={32} priority className="h-8 w-auto" /></span><div className="min-w-0"><p className="truncate text-base font-bold text-foreground">Swadam Foods</p><p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Order Tracking</p></div></Link><div className="flex items-center gap-2"><ThemeToggle /><Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-semibold text-foreground hover:bg-card"><ArrowLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Store</span></Link></div></div></header>
      <main className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        {!order ? (
          <section className="mx-auto mt-6 max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-9"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Truck className="h-6 w-6" /></span><div><h1 className="text-2xl font-bold text-foreground">Track Your Order</h1><p className="text-xs text-muted-foreground">Verify with the mobile number used at checkout.</p></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Enter the Order ID from your confirmation and your 10-digit mobile number.</p><form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void verify() }}><label className="block"><span className="text-xs font-bold uppercase tracking-wide">Order ID</span><input value={orderId} onChange={(e) => setOrderId(e.target.value.toUpperCase())} placeholder="SWD-20260915-AB12CD34" autoComplete="off" className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3.5 font-mono text-base font-bold outline-none focus:border-primary" /></label><label className="block"><span className="text-xs font-bold uppercase tracking-wide">Mobile Number</span><div className="relative mt-1.5"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">+91</span><input value={phone} onChange={(e) => setPhone(sanitizePhone(e.target.value))} maxLength={10} inputMode="numeric" type="tel" placeholder="10-digit mobile number" autoComplete="tel" className="w-full rounded-2xl border border-input bg-background py-3.5 pl-14 pr-4 font-mono text-base font-bold outline-none focus:border-primary" /></div></label><button disabled={loading} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg disabled:opacity-50">{loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Verifying…</> : <><Search className="h-4 w-4" /> Verify &amp; Track</>}</button></form><div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-accent" /> Protected verification</span><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">Need help?</a></div></section>
        ) : (
          <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary"><ArrowLeft className="h-3.5 w-3.5" /> Track another order</button><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void verify(order.id, phone)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</button>{order.paymentStatus === "paid" && <button type="button" onClick={() => setInvoiceOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary"><FileText className="h-3.5 w-3.5" /> Invoice</button>}</div></div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Order status</p><h1 className="mt-1 break-all text-3xl font-black tracking-tight text-foreground">{order.id}</h1><p className="mt-1 text-xs text-muted-foreground">Placed {relativeTime(order.createdAt)} · {order.customerName}</p></div><button type="button" onClick={() => void copyOrderId()} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold">{copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy ID"}</button></div>
              <div className="mt-7 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{STAGES.map((stage, index) => { const Icon = stage.icon; const active = index <= currentStage; return <div key={stage.label} className={`rounded-2xl border p-3 text-center ${active ? "border-primary/35 bg-primary/8" : "border-border bg-background"}`}><Icon className={`mx-auto h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} /><p className={`mt-1 text-[10px] font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>{stage.label}</p></div> })}</div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3"><InfoCard label="Payment" value={order.paymentStatus === "paid" ? "Paid" : order.paymentStatus} /><InfoCard label="Order" value={order.orderStatus.replaceAll("_", " ")} /><InfoCard label="Total" value={`₹${order.total.toLocaleString("en-IN")}`} /></div>
              <div className="mt-6 rounded-2xl border border-border bg-background p-4"><div className="flex items-start gap-3"><ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-foreground">Your items</p><div className="mt-3 space-y-2">{order.items.map((item, index) => <div key={`${item.productName}-${index}`} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate text-muted-foreground">{item.productName} · {item.weight} × {item.quantity}</span><span className="shrink-0 font-bold">₹{item.lineTotal.toLocaleString("en-IN")}</span></div>)}</div></div></div></div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row"><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground"><Phone className="h-4 w-4" /> WhatsApp us</a><button type="button" onClick={() => { order.items.forEach((item) => { const product = products.find((candidate) => candidate.name === item.productName); if (product) addItem(product) }); openCart() }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-extrabold text-foreground"><ShoppingBag className="h-4 w-4" /> Order again</button></div>
            </div>
          </section>
        )}
      </main>
      {order && <TaxInvoiceModal isOpen={invoiceOpen} order={order} onClose={() => setInvoiceOpen(false)} />}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-extrabold capitalize text-foreground">{value}</p></div>
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  Bell,
  BellOff,
  Boxes,
  Calendar,
  Check,
  CheckSquare,
  ChefHat,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  IndianRupee,
  Layers,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Square,
  Truck,
  X,
} from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/products"

const TaxInvoiceModal = dynamic(
  () => import("@/components/tax-invoice").then((mod) => mod.TaxInvoiceModal),
  { ssr: false },
)

type OrderItem = {
  id: number
  product_name: string
  weight: string
  quantity: number
  unit_price: number
  line_total: number
}

type Order = {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  pincode: string
  deliveryMethod: string
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
  paymentGateway: string | null
  gatewayOrderId: string | null
  paymentStatus: string
  orderStatus: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

const STATUS_CONFIG: Record<string, { label: string; nextStatus?: string; nextLabel?: string; tone: string }> = {
  new: { label: "New Order", nextStatus: "accepted", nextLabel: "Accept Order", tone: "amber" },
  accepted: { label: "Accepted", nextStatus: "preparing", nextLabel: "Start Preparing", tone: "blue" },
  preparing: { label: "Preparing", nextStatus: "packed", nextLabel: "Mark Packed", tone: "orange" },
  packed: { label: "Packed & Ready", nextStatus: "shipped", nextLabel: "Out for Delivery", tone: "purple" },
  shipped: { label: "Out for Delivery", nextStatus: "delivered", nextLabel: "Mark Delivered", tone: "teal" },
  delivered: { label: "Delivered", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "rose" },
}

const PROCESS_STEPS = [
  { id: "accepted", label: "Confirmed", icon: ShieldCheck },
  { id: "preparing", label: "Kitchen", icon: ChefHat },
  { id: "packed", label: "Packed", icon: Package },
  { id: "shipped", label: "En Route", icon: Truck },
  { id: "delivered", label: "Delivered", icon: ShieldCheck },
] as const

const FILTERS = [
  { id: "active", label: "Active", icon: Layers },
  { id: "new", label: "New", icon: Clock },
  { id: "preparing", label: "Kitchen", icon: ChefHat },
  { id: "packed", label: "Packed", icon: Package },
  { id: "shipped", label: "En Route", icon: Truck },
  { id: "delivered", label: "Delivered", icon: ShieldCheck },
  { id: "all", label: "All Orders", icon: Boxes },
]

function formatRelativeTime(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function statusTone(tone: string) {
  const styles: Record<string, string> = {
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    orange: "bg-orange-50 text-orange-800 border-orange-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    teal: "bg-teal-50 text-teal-800 border-teal-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
  }
  return styles[tone] ?? styles.amber
}

function getTrackUrl(order: Order) {
  const phone = order.customerPhone.replace(/\D/g, "").slice(-10)
  return `${window.location.origin}/track?orderId=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(phone)}`
}

function getWhatsAppMessage(order: Order, status: string) {
  const url = getTrackUrl(order)
  const name = order.customerName
  const messages: Record<string, string> = {
    new: `Namaste ${name}! We received your Swadam Foods order *${order.id}* (₹${order.total}). We are reviewing it now.\n\nTrack order: ${url}`,
    accepted: `Namaste ${name}! Your Swadam Foods order *${order.id}* (₹${order.total}) is confirmed. We are starting preparation.\n\nTrack order: ${url}`,
    preparing: `Namaste ${name}! Your order *${order.id}* is currently being freshly prepared in our kitchen.\n\nTrack progress: ${url}`,
    packed: `Namaste ${name}! Your order *${order.id}* is freshly packed, sealed, and ready for dispatch.\n\nTrack order: ${url}`,
    shipped: `Namaste ${name}! Your order *${order.id}* is out for delivery with our delivery partner.\n\nTrack live: ${url}`,
    delivered: `Namaste ${name}! Your order *${order.id}* has been successfully delivered. Thank you for choosing Swadam Foods!`,
    cancelled: `Namaste ${name}! Your Swadam Foods order *${order.id}* has been cancelled. For any queries or refund assistance, please reply to this message.`,
  }
  return messages[status] ?? messages.accepted
}

function openWhatsApp(phone: string, message: string) {
  let number = phone.replace(/\D/g, "")
  if (number.length === 10) number = `91${number}`
  if (!number) return
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusTone(cfg.tone)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  )
}

function OrderDetailModal({ order, onClose, onOpenInvoice, onStatusChange, updatingId }: {
  order: Order
  onClose: () => void
  onOpenInvoice: (order: Order) => void
  onStatusChange: (order: Order, status: string) => Promise<void>
  updatingId: string | null
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const stepIndex = PROCESS_STEPS.findIndex((step) => step.id === order.orderStatus)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white text-stone-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-4">
          <div className="min-w-0">
            <h3 className="font-extrabold">Order Summary &amp; History</h3>
            <p className="truncate font-mono text-xs text-stone-500">{order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { navigator.clipboard.writeText(order.id); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy ID"}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-stone-500 hover:bg-stone-200" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Order Status</p>
              <div className="mt-2"><StatusBadge status={order.orderStatus} /></div>
              <p className="mt-2 text-[11px] text-stone-500">Updated {new Date(order.updatedAt).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Payment</p>
              <div className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${order.paymentStatus === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {order.paymentStatus === "paid" ? "✓ Paid" : order.paymentStatus}
              </div>
              <p className="mt-2 truncate text-[11px] text-stone-500">{order.paymentGateway ?? "Direct"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Order Process</span>
              <span className="text-[10px] font-bold text-emerald-700">Tap to advance &amp; notify</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {PROCESS_STEPS.map((step, idx) => {
                const Icon = step.icon
                const current = order.orderStatus === step.id
                const passed = stepIndex >= 0 && idx < stepIndex
                return (
                  <button key={step.id} type="button" disabled={updatingId === order.id} onClick={() => onStatusChange(order, step.id)} className={`rounded-xl border p-2.5 text-xs font-bold transition ${current ? "border-amber-500 bg-amber-50 text-amber-900" : passed ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
                    <Icon className="mx-auto mb-1 h-4 w-4" />
                    {step.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Customer</p>
                <p className="mt-1 font-extrabold">{order.customerName}</p>
                <a href={`tel:${order.customerPhone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-mono font-bold text-stone-700 hover:underline"><Phone className="h-3 w-3" />{order.customerPhone}</a>
              </div>
              <button type="button" onClick={() => openWhatsApp(order.customerPhone, `Namaste ${order.customerName}!`)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </button>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-stone-700"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" /><span>{order.customerAddress} · {order.pincode}</span></div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold"> <span>Items ({order.items.length})</span><span>Amount</span> </div>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-stone-100 px-4 py-3 text-xs last:border-0">
                <div><p className="font-bold">{item.product_name}</p><p className="text-stone-400">{item.weight} × {item.quantity} @ ₹{item.unit_price}</p></div>
                <span className="font-mono font-bold">₹{item.line_total}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-stone-50 px-4 py-3 text-sm font-black"><span>Total</span><span>₹{order.total}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 bg-stone-50 px-5 py-3">
          <Link href={`/track?orderId=${encodeURIComponent(order.id)}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900">Customer Track View <ExternalLink className="h-3.5 w-3.5" /></Link>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { onClose(); onOpenInvoice(order) }} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold"><FileText className="h-3.5 w-3.5" /> Invoice</button>
            <button type="button" onClick={onClose} className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white">Done</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [adminKey, setAdminKey] = useState("")
  const [inputKey, setInputKey] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [statusFilter, setStatusFilter] = useState("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState("preparing")
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null)
  const [autoWhatsApp, setAutoWhatsApp] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [chime, setChime] = useState(true)
  const previousNewCount = useRef(0)

  useEffect(() => {
    const stored = localStorage.getItem("swadam_admin_key")
    if (stored) setAdminKey(stored)
  }, [])

  const fetchOrders = useCallback(async (key: string) => {
    if (!key) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders?key=${encodeURIComponent(key)}`)
      const data = await res.json()
      if (!res.ok) {
        setIsAuthorized(false)
        setAuthError(res.status === 401 ? "Wrong passcode. Please verify your merchant key." : data.error || "Failed to load orders.")
        return
      }
      setOrders(data.orders ?? [])
      setIsAuthorized(true)
      setAuthError("")
      setError("")
      setLastUpdated(new Date())
    } catch {
      setError("Connection error. Please check your internet connection.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (adminKey) fetchOrders(adminKey) }, [adminKey, fetchOrders])
  useEffect(() => {
    if (!isAuthorized || !adminKey) return
    const timer = setInterval(() => fetchOrders(adminKey), 20000)
    return () => clearInterval(timer)
  }, [isAuthorized, adminKey, fetchOrders])

  useEffect(() => {
    if (!isAuthorized) return
    const count = orders.filter((o) => o.orderStatus === "new" && o.paymentStatus === "paid").length
    if (chime && previousNewCount.current > 0 && count > previousNewCount.current) {
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        osc.start(); osc.stop(ctx.currentTime + 0.5)
        setTimeout(() => { try { ctx.close() } catch {} }, 700)
      } catch {}
    }
    previousNewCount.current = count
  }, [orders, chime, isAuthorized])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const key = inputKey.trim()
    if (!key) return setAuthError("Please enter your admin passcode.")
    localStorage.setItem("swadam_admin_key", key)
    setAdminKey(key)
    fetchOrders(key)
  }

  const handleLogout = () => {
    localStorage.removeItem("swadam_admin_key")
    setAdminKey(""); setIsAuthorized(false); setOrders([]); setSelectedIds(new Set())
  }

  const updateStatus = async (orderId: string, orderStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ orderId, orderStatus }),
      })
      if (!res.ok) throw new Error()
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus } : o))
      setSelectedOrder((prev) => prev && prev.id === orderId ? { ...prev, orderStatus } : prev)
      return true
    } catch {
      setNotice("Could not update the order status.")
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  const updateStatusWithWhatsApp = useCallback(async (order: Order, status: string) => {
    const ok = await updateStatus(order.id, status)
    if (!ok) return
    if (autoWhatsApp) openWhatsApp(order.customerPhone, getWhatsAppMessage(order, status))
    setNotice(`Updated ${order.id} to ${STATUS_CONFIG[status]?.label ?? status}`)
    setTimeout(() => setNotice(null), 3000)
  }, [adminKey, autoWhatsApp])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return orders.filter((order) => {
      const statusMatch = statusFilter === "all" ? true : statusFilter === "active" ? ["new", "accepted", "preparing", "packed", "shipped"].includes(order.orderStatus) : order.orderStatus === statusFilter
      const queryMatch = !q || order.id.toLowerCase().includes(q) || order.customerName.toLowerCase().includes(q) || order.customerPhone.includes(q) || order.pincode.includes(q)
      return statusMatch && queryMatch
    })
  }, [orders, statusFilter, searchQuery])

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      revenue: orders.filter((o) => o.paymentStatus === "paid" && o.createdAt?.startsWith(today)).reduce((sum, o) => sum + o.total, 0),
      active: orders.filter((o) => ["new", "accepted", "preparing", "packed"].includes(o.orderStatus)).length,
      enroute: orders.filter((o) => o.orderStatus === "shipped").length,
      pending: orders.filter((o) => !["paid", "refunded"].includes(o.paymentStatus)).length,
    }
  }, [orders])

  const toggleSelect = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const bulkUpdate = async () => {
    if (!selectedIds.size) return
    setBulkUpdating(true)
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      const order = orders.find((o) => o.id === id)
      if (!order) continue
      const ok = await updateStatus(id, bulkStatus)
      if (ok && autoWhatsApp) openWhatsApp(order.customerPhone, getWhatsAppMessage(order, bulkStatus))
    }
    setSelectedIds(new Set())
    setBulkUpdating(false)
    setNotice(`Updated ${ids.length} order${ids.length > 1 ? "s" : ""}.`)
    setTimeout(() => setNotice(null), 3000)
  }

  const downloadManifest = () => {
    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = orders.filter((o) => ["packed", "shipped"].includes(o.orderStatus) && o.createdAt?.startsWith(today))
    const rows = [
      ["Order ID", "Customer Name", "Phone", "Address", "Pincode", "Delivery", "Items", "Total (INR)", "Status"],
      ...todayOrders.map((o) => [o.id, o.customerName, o.customerPhone, `"${o.customerAddress.replace(/"/g, '""')}"`, o.pincode, o.deliveryMethod === "porter" ? "Porter" : "Pune Home", `"${o.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")}"`, String(o.total), o.orderStatus]),
    ]
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `swadam-manifest-${today}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4 dark:bg-stone-950">
        <div className="w-full max-w-sm space-y-6 rounded-[2.5rem] border border-stone-200 bg-white p-8 text-center shadow-2xl dark:border-stone-800 dark:bg-stone-900">
          <Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={73} height={40} className="mx-auto h-10 w-auto" priority />
          <div><span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400"><ShieldCheck className="h-3.5 w-3.5" /> Merchant Portal</span><h1 className="mt-3 text-2xl font-black text-stone-900 dark:text-white">Operations Dashboard</h1><p className="mt-1 text-xs text-stone-400">Enter your merchant access passcode</p></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input type="password" value={inputKey} onChange={(e) => setInputKey(e.target.value)} autoFocus placeholder="••••••••••••" className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-4 pl-11 pr-4 text-center font-mono text-sm tracking-widest focus:border-amber-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white" /></div>
            {authError && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4" />{authError}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground disabled:opacity-60">{loading ? "Verifying..." : "Access Dashboard"}</button>
          </form>
          <p className="text-[11px] text-stone-400">WhatsApp Business · +{WHATSAPP_NUMBER}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100/90 pb-16 text-stone-900 dark:bg-stone-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><Link href="/" target="_blank"><Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={59} height={32} className="h-8 w-auto" priority /></Link><div className="hidden h-5 w-px bg-stone-200 sm:block dark:bg-stone-800" /><span className="hidden font-bold md:inline">Operations</span><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Live"}</span></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setAutoWhatsApp((v) => !v)} className={`hidden rounded-xl border px-3 py-2 text-xs font-bold sm:inline-flex ${autoWhatsApp ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-white text-stone-500"}`}><MessageSquare className="mr-1.5 h-3.5 w-3.5" />WhatsApp {autoWhatsApp ? "ON" : "OFF"}</button>
            <button type="button" onClick={() => fetchOrders(adminKey)} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold dark:border-stone-800 dark:bg-stone-900"><RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span></button>
            <button type="button" onClick={downloadManifest} className="hidden items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold sm:inline-flex dark:border-stone-800 dark:bg-stone-900"><Download className="h-3.5 w-3.5" />Manifest</button>
            <button type="button" onClick={() => setChime((v) => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900" title="Toggle new order chime">{chime ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}</button>
            <Link href="/" target="_blank" className="hidden items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold sm:inline-flex dark:border-stone-800 dark:bg-stone-900">Store <ExternalLink className="h-3 w-3" /></Link>
            <button type="button" onClick={handleLogout} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900/40 dark:bg-stone-900"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Today's Revenue</span><div className="mt-2 flex items-center gap-1 font-mono text-2xl font-black text-emerald-700"><IndianRupee className="h-5 w-5" />{kpis.revenue.toLocaleString("en-IN")}</div><span className="text-[11px] text-stone-400">Paid orders today</span></div>
          <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900/40 dark:bg-stone-900"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Kitchen Active</span><div className="mt-2 font-mono text-2xl font-black text-amber-700">{kpis.active}</div><span className="text-[11px] text-stone-400">New to packed</span></div>
          <div className="rounded-2xl border border-teal-200 bg-white p-4 dark:border-teal-900/40 dark:bg-stone-900"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Out for Delivery</span><div className="mt-2 font-mono text-2xl font-black text-teal-700">{kpis.enroute}</div><span className="text-[11px] text-stone-400">Shipped orders</span></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Unpaid / Pending</span><div className="mt-2 font-mono text-2xl font-black text-stone-700">{kpis.pending}</div><span className="text-[11px] text-stone-400">Awaiting payment</span></div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {FILTERS.map((tab) => { const Icon = tab.icon; const active = statusFilter === tab.id; return <button key={tab.id} type="button" onClick={() => setStatusFilter(tab.id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold ${active ? "bg-primary text-primary-foreground" : "border border-stone-200 bg-white text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"}`}><Icon className="h-3.5 w-3.5" />{tab.label}</button> })}
          </div>
          <div className="relative min-w-[220px]"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders, phone, name..." className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-xs dark:border-stone-800 dark:bg-stone-900" />{searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5" /></button>}</div>
        </div>

        {error && <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}

        {filtered.length > 0 && <div className="flex items-center gap-3 px-1 text-xs font-bold text-stone-600"><button type="button" onClick={() => setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map((o) => o.id)))} className="inline-flex items-center gap-1.5">{selectedIds.size === filtered.length ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />} {selectedIds.size ? `${selectedIds.size} selected` : "Select all"}</button>{selectedIds.size > 0 && <button type="button" onClick={() => setSelectedIds(new Set())} className="text-rose-600">Clear</button>}</div>}

        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.new
            const paid = order.paymentStatus === "paid"
            const completed = ["delivered", "cancelled"].includes(order.orderStatus)
            return (
              <div key={order.id} className={`rounded-2xl border bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900 ${selectedIds.has(order.id) ? "border-primary ring-2 ring-primary/20" : "border-stone-200"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-4 dark:border-stone-800 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => toggleSelect(order.id)}>{selectedIds.has(order.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-stone-400" />}</button><span className="rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 font-mono text-xs font-black dark:border-stone-700 dark:bg-stone-800">{order.id}</span><span className="text-[11px] text-stone-400">{formatRelativeTime(order.createdAt)}</span><StatusBadge status={order.orderStatus} /></div>
                  <div className="flex items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{paid ? "✓ Paid" : "⏳ Pending"}</span><span className="font-mono text-lg font-black">₹{order.total}</span></div>
                </div>
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-12">
                  <div className="lg:col-span-4"><div className="flex items-center gap-2"><h3 className="truncate font-extrabold">{order.customerName}</h3><button type="button" onClick={() => setSelectedOrder(order)} className="rounded-full bg-stone-100 p-1.5 text-stone-600"><FileText className="h-3.5 w-3.5" /></button></div><a href={`tel:${order.customerPhone}`} className="mt-1 inline-flex items-center gap-1 font-mono text-xs font-bold text-stone-700 dark:text-stone-300"><Phone className="h-3 w-3" />{order.customerPhone}</a><p className="mt-2 line-clamp-2 text-xs text-stone-500"><MapPin className="mr-1 inline h-3 w-3" />{order.customerAddress} · {order.pincode}</p></div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 lg:col-span-5 dark:border-stone-800 dark:bg-stone-950"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</span>{order.items.slice(0, 3).map((item) => <div key={item.id} className="mt-1 flex items-center justify-between gap-2 text-xs"><span className="truncate font-semibold">{item.product_name} <span className="font-normal text-stone-400">({item.weight})</span></span><span className="font-mono">×{item.quantity}</span></div>)}{order.items.length > 3 && <span className="mt-1 block text-[11px] font-bold text-primary">+{order.items.length - 3} more</span>}</div>
                  <div className="flex flex-col gap-2 lg:col-span-3">
                    {!completed && cfg.nextStatus && <button type="button" disabled={updatingId === order.id} onClick={() => updateStatusWithWhatsApp(order, cfg.nextStatus!)} className="rounded-xl bg-primary px-3 py-2.5 text-xs font-extrabold text-primary-foreground disabled:opacity-60">{updatingId === order.id ? "Updating..." : `${cfg.nextLabel} →`}</button>}
                    <div className="flex gap-2"><button type="button" onClick={() => openWhatsApp(order.customerPhone, `Namaste ${order.customerName}!`)} className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] font-bold text-emerald-800"><MessageSquare className="mr-1 inline h-3 w-3" />Chat</button><button type="button" onClick={() => setSelectedInvoice(order)} className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-700"><FileText className="h-3.5 w-3.5" /></button>{!completed && <button type="button" disabled={updatingId === order.id} onClick={() => updateStatusWithWhatsApp(order, "cancelled")} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600"><X className="h-3.5 w-3.5" /></button>}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && !loading && <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-12 text-center dark:border-stone-800 dark:bg-stone-900/60"><Package className="mx-auto h-12 w-12 text-stone-300" /><h3 className="mt-3 font-extrabold">No orders found</h3><p className="mt-1 text-xs text-stone-400">Try a different search or status filter.</p></div>}
      </main>

      {selectedIds.size > 0 && <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-white shadow-2xl"><span className="text-xs font-extrabold">{selectedIds.size} selected</span><select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="rounded-xl border border-stone-600 bg-stone-800 px-2 py-1.5 text-xs font-bold"><option value="accepted">Confirmed</option><option value="preparing">Kitchen</option><option value="packed">Packed</option><option value="shipped">En Route</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select><button type="button" onClick={bulkUpdate} disabled={bulkUpdating} className="rounded-xl bg-primary px-3.5 py-2 text-xs font-extrabold disabled:opacity-60">{bulkUpdating ? "Updating..." : "Apply"}</button><button type="button" onClick={() => setSelectedIds(new Set())}><X className="h-4 w-4" /></button></div>}

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onOpenInvoice={setSelectedInvoice} onStatusChange={updateStatusWithWhatsApp} updatingId={updatingId} />}
      {selectedInvoice && <TaxInvoiceModal order={{ id: selectedInvoice.id, customerName: selectedInvoice.customerName, customerPhoneMasked: selectedInvoice.customerPhone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"), customerAddress: selectedInvoice.customerAddress, pincode: selectedInvoice.pincode, deliveryMethod: selectedInvoice.deliveryMethod, subtotal: selectedInvoice.subtotal, deliveryFee: selectedInvoice.deliveryFee, total: selectedInvoice.total, currency: selectedInvoice.currency, paymentStatus: selectedInvoice.paymentStatus, orderStatus: selectedInvoice.orderStatus, createdAt: selectedInvoice.createdAt, items: selectedInvoice.items.map((item) => ({ productName: item.product_name, weight: item.weight, quantity: item.quantity, unitPrice: item.unit_price, lineTotal: item.line_total })) }} isOpen={true} onClose={() => setSelectedInvoice(null)} />}
      {notice && <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-300 bg-emerald-950 px-4 py-3 text-xs font-bold text-emerald-100 shadow-2xl">{notice}</div>}
    </div>
  )
}

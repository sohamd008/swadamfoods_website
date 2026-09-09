"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { WHATSAPP_NUMBER } from "@/lib/products"
import {
  ChefHat,
  Truck,
  Clock,
  RotateCcw,
  MessageSquare,
  LogOut,
  Search,
  Lock,
  IndianRupee,
  MapPin,
  Phone,
  AlertCircle,
  Package,
} from "lucide-react"

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

const STATUS = {
  new:       { label: "New Order",        dot: "#F59E0B", bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  accepted:  { label: "Accepted",         dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
  preparing: { label: "Preparing",        dot: "#F97316", bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
  packed:    { label: "Packed",           dot: "#8B5CF6", bg: "#F5F3FF", text: "#6D28D9", border: "#C4B5FD" },
  shipped:   { label: "Out for Delivery", dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" },
  delivered: { label: "Delivered",        dot: "#22C55E", bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
  cancelled: { label: "Cancelled",        dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" },
} as const

const FILTER_TABS = [
  { id: "active",    label: "⚡ Active"   },
  { id: "new",       label: "🆕 New"      },
  { id: "preparing", label: "👨‍🍳 Kitchen" },
  { id: "packed",    label: "📦 Packed"   },
  { id: "shipped",   label: "🚚 Delivery" },
  { id: "delivered", label: "✅ Done"     },
  { id: "all",       label: "📋 All"      },
]

function getWhatsAppMessage(order: Order, type: "accepted" | "preparing" | "packed" | "shipped" | "delivered") {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://swadamfoods.eu.cc"
  const url = `${origin}/order/${order.id}`
  const msgs = {
    accepted:  `Namaste ${order.customerName}! Your Swadam Foods order *${order.id}* (Rs. ${order.total}) is confirmed. We are preparing your fresh items now.\n\nTrack here: ${url}`,
    preparing: `Namaste ${order.customerName}! Your order *${order.id}* is being freshly prepared in our kitchen.\n\nTrack here: ${url}`,
    packed:    `Namaste ${order.customerName}! Your order *${order.id}* is packed and ready for dispatch.\n\nTrack here: ${url}`,
    shipped:   `Namaste ${order.customerName}! Your Swadam Foods order *${order.id}* is out for delivery.\n\nTrack live: ${url}`,
    delivered: `Namaste ${order.customerName}! Your order *${order.id}* has been delivered. Thank you for choosing Swadam Foods. Enjoy your authentic Maharashtrian delicacies!`,
  }
  return msgs[type]
}

function openWhatsApp(phone: string, message: string) {
  let p = phone.replace(/\D/g, "")
  if (p.length === 10) p = "91" + p
  window.open(`https://wa.me/${p}?text=${encodeURIComponent(message)}`, "_blank")
}

function StatusChip({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS] ?? STATUS.new
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
      style={{ background: s.bg, color: s.text, border: `2px solid ${s.border}` }}
    >
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

function OrderCard({
  order,
  onStatusChange,
  updatingId,
}: {
  order: Order
  onStatusChange: (id: string, status: string) => Promise<void>
  updatingId: string | null
}) {
  const updating = updatingId === order.id
  const isPaid = order.paymentStatus === "paid"
  const isDone = ["delivered", "cancelled"].includes(order.orderStatus)

  const actions: { label: string; status: string; color: string }[] = []
  if (!isDone) {
    if (order.orderStatus === "new")
      actions.push({ label: "✓  Accept Order", status: "accepted", color: "#3B82F6" })
    if (["new", "accepted"].includes(order.orderStatus))
      actions.push({ label: "👨‍🍳  Start Preparing", status: "preparing", color: "#F97316" })
    if (["accepted", "preparing"].includes(order.orderStatus))
      actions.push({ label: "📦  Mark Packed", status: "packed", color: "#8B5CF6" })
    if (["packed", "preparing"].includes(order.orderStatus))
      actions.push({ label: "🚚  Out for Delivery", status: "shipped", color: "#10B981" })
    actions.push({ label: "🎉  Mark Delivered", status: "delivered", color: "#22C55E" })
  }

  const waButtons: { label: string; type: "accepted" | "preparing" | "packed" | "shipped" | "delivered" }[] = [
    { label: "Accepted",  type: "accepted"  },
    { label: "Preparing", type: "preparing" },
    { label: "Packed",    type: "packed"    },
    { label: "Dispatch",  type: "shipped"   },
    { label: "Delivered", type: "delivered" },
  ]

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-stone-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="text-2xl font-extrabold text-stone-900 truncate">{order.customerName}</div>
            <div className="flex flex-wrap items-center gap-3 text-stone-500">
              <span className="flex items-center gap-1.5 font-medium text-base">
                <Phone className="w-4 h-4 text-stone-400" />
                {order.customerPhone}
              </span>
              <span className="flex items-center gap-1.5 text-base">
                <MapPin className="w-4 h-4 text-stone-400" />
                {order.customerAddress} · {order.pincode}
              </span>
            </div>
            <div className="text-sm font-semibold text-stone-500 pt-1">
              {order.deliveryMethod === "porter" ? "🚗 Porter Delivery" : "🏠 Home Delivery · Pune"}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-3xl font-black text-stone-900 font-mono">₹{order.total}</div>
            <StatusChip status={order.orderStatus} />
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={isPaid
                ? { background: "#F0FDF4", color: "#15803D", border: "1.5px solid #86EFAC" }
                : { background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FCD34D" }}
            >
              {isPaid ? "✓ Paid" : "⏳ Payment Pending"}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-stone-400 font-mono">{order.id}</div>
      </div>

      <div className="px-6 py-5 border-b border-stone-100 bg-stone-50">
        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Items Ordered</div>
        <div className="divide-y divide-stone-200">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <span className="font-bold text-stone-800 text-base">{item.product_name}</span>
                <span className="ml-2 text-sm text-stone-400">{item.weight} · qty {item.quantity}</span>
              </div>
              <span className="font-bold text-stone-700 text-base font-mono">₹{item.line_total}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-stone-300 mt-1">
          <span className="font-bold text-stone-500">Total</span>
          <span className="text-xl font-black text-stone-900 font-mono">₹{order.total}</span>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="px-6 py-5 border-b border-stone-100">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Update Status</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map((action) => (
              <button
                key={action.status}
                disabled={updating}
                onClick={() => onStatusChange(order.id, action.status)}
                className="py-5 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-md"
                style={{
                  background: action.color,
                  boxShadow: `0 4px 20px ${action.color}55`,
                  opacity: updating ? 0.6 : 1,
                }}
              >
                {updating ? <RotateCcw className="w-4 h-4 animate-spin" /> : action.label}
              </button>
            ))}
            <button
              disabled={updating}
              onClick={() => { if (confirm("Cancel this order?")) onStatusChange(order.id, "cancelled") }}
              className="py-5 rounded-2xl text-base font-bold text-red-500 bg-red-50 border-2 border-red-200 transition-all active:scale-[0.97]"
            >
              ✕  Cancel
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-5">
        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
          📱 Send WhatsApp Update to Customer
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {waButtons.map(({ label, type }) => (
            <button
              key={type}
              onClick={() => openWhatsApp(order.customerPhone, getWhatsAppMessage(order, type))}
              className="py-4 rounded-2xl text-sm font-bold text-emerald-700 bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 transition-all active:scale-[0.97] flex flex-col items-center gap-1"
            >
              <MessageSquare className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
        <Link
          href={`/order/${order.id}`}
          target="_blank"
          className="mt-2 block text-center py-3.5 rounded-2xl text-sm font-bold text-stone-500 bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-all"
        >
          View Customer Tracking Page ↗
        </Link>
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
  const [showSearch, setShowSearch] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
        if (res.status === 401) { setIsAuthorized(false); setAuthError("Wrong passcode.") }
        else setError(data.error || "Failed to load")
        return
      }
      setOrders(data.orders || [])
      setIsAuthorized(true)
      setAuthError("")
      setError("")
      setLastUpdated(new Date())
    } catch {
      setError("Connection error.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (adminKey) fetchOrders(adminKey) }, [adminKey, fetchOrders])

  useEffect(() => {
    if (!isAuthorized || !adminKey) return
    const t = setInterval(() => fetchOrders(adminKey), 15000)
    return () => clearInterval(t)
  }, [isAuthorized, adminKey, fetchOrders])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const key = inputKey.trim()
    if (!key) {
      setAuthError("Please enter your admin passcode.")
      return
    }
    localStorage.setItem("swadam_admin_key", key)
    setAdminKey(key)
    fetchOrders(key)
  }

  const handleLogout = () => {
    localStorage.removeItem("swadam_admin_key")
    setAdminKey(""); setIsAuthorized(false); setOrders([])
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      })
      if (res.ok) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      else alert("Failed to update status")
    } catch { alert("Network error") }
    finally { setUpdatingId(null) }
  }

  const filtered = useMemo(() => orders.filter((o) => {
    const ms = statusFilter === "all" ? true
      : statusFilter === "active" ? ["new","accepted","preparing","packed","shipped"].includes(o.orderStatus)
      : o.orderStatus === statusFilter
    const q = searchQuery.toLowerCase().trim()
    const mq = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
      || o.customerPhone.includes(q) || o.pincode.includes(q)
    return ms && mq
  }), [orders, statusFilter, searchQuery])

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let revenue = 0, active = 0, enroute = 0, pending = 0
    for (const o of orders) {
      if (o.paymentStatus === "paid" && o.createdAt?.startsWith(today)) revenue += o.total
      if (["new","accepted","preparing","packed"].includes(o.orderStatus)) active++
      if (o.orderStatus === "shipped") enroute++
      if (!["paid","refunded"].includes(o.paymentStatus)) pending++
    }
    return { revenue, active, enroute, pending }
  }, [orders])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stone-100">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 text-center border border-stone-100">
          <div className="flex justify-center">
            <div className="bg-stone-50 rounded-3xl p-3 shadow-sm border border-stone-200">
              <Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={120} height={40} className="h-10 w-auto" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-800">Kitchen Portal</h1>
            <p className="text-stone-400 mt-1.5 text-sm">Enter your merchant passcode</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="••••••••••"
                autoFocus
                className="w-full pl-12 pr-4 py-5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-base font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl text-base font-bold text-white shadow-lg transition-all active:scale-[0.98]"
              style={{ background: "oklch(0.72 0.16 62)", boxShadow: "0 8px 28px oklch(0.72 0.16 62 / 0.4)" }}
            >
              {loading ? "Verifying…" : "Open Dashboard"}
            </button>
          </form>
          <p className="text-xs text-stone-300">WhatsApp Business · +{WHATSAPP_NUMBER}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto gap-3">
          <div className="flex items-center gap-3">
            <Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={100} height={32} className="h-8 w-auto" />
            <div className="h-6 w-px bg-stone-200" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-800 text-base hidden sm:inline">Live Orders</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Live"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(!showSearch)} className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition active:scale-95" aria-label="Toggle search">
              <Search className="w-5 h-5 text-stone-500" />
            </button>
            <button onClick={() => fetchOrders(adminKey)} className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition active:scale-95" aria-label="Refresh orders">
              <RotateCcw className={`w-5 h-5 text-stone-500 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition active:scale-95" aria-label="Log out">
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="px-5 pb-4 max-w-5xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, phone, order ID, pincode…"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today's Revenue", value: `₹${kpis.revenue.toLocaleString("en-IN")}`, Icon: IndianRupee, color: "#15803D", bg: "#F0FDF4", border: "#86EFAC" },
            { label: "Active Orders",   value: kpis.active,  Icon: ChefHat, color: "#92400E", bg: "#FEF3C7", border: "#FCD34D" },
            { label: "En Route",        value: kpis.enroute, Icon: Truck,   color: "#065F46", bg: "#ECFDF5", border: "#6EE7B7" },
            { label: "Unpaid",          value: kpis.pending, Icon: Clock,   color: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5" },
          ].map(({ label, value, Icon, color, bg, border }) => (
            <div key={label} className="bg-white rounded-3xl p-5 shadow-sm border flex flex-col gap-3" style={{ borderColor: border }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="text-2xl font-extrabold font-mono" style={{ color }}>{value}</div>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className="whitespace-nowrap px-5 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 shrink-0 shadow-sm"
                style={active
                  ? { background: "oklch(0.72 0.16 62)", color: "#fff", boxShadow: "0 4px 16px oklch(0.72 0.16 62 / 0.35)" }
                  : { background: "#fff", color: "#78716C", border: "1px solid #E7E5E4" }}
              >
                {tab.label}
                {tab.id === "active" && kpis.active > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-black" style={active ? { background: "rgba(0,0,0,0.2)", color: "#fff" } : { background: "#FEF3C7", color: "#92400E" }}>
                    {kpis.active}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <div className="p-4 rounded-2xl flex gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <Package className="w-16 h-16 text-stone-200" />
            <div className="text-xl font-bold text-stone-400">No orders here</div>
            <div className="text-stone-300 text-sm">
              {statusFilter === "active" ? "No active orders right now." : "Try a different filter above."}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

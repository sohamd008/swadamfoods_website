"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { WHATSAPP_NUMBER, products } from "@/lib/products"

const TaxInvoiceModal = dynamic(
  () => import("@/components/tax-invoice").then((mod) => mod.TaxInvoiceModal),
  { ssr: false }
)
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
  Info,
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  FileText,
  ShieldCheck,
  Calendar,
  Sparkles,
  Layers,
  Download,
  BarChart2,
  Bell,
  BellOff,
  CheckSquare,
  Square,
  Boxes,
  TimerReset,
  Minus,
  Plus,
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

const STATUS_CONFIG = {
  new: {
    label: "New Order",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-800 dark:text-amber-300",
    badgeBorder: "border-amber-300/80 dark:border-amber-800",
    dot: "bg-amber-500",
    nextStatus: "accepted",
    nextLabel: "Accept Order",
    nextColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
  },
  accepted: {
    label: "Accepted",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-800 dark:text-blue-300",
    badgeBorder: "border-blue-300/80 dark:border-blue-800",
    dot: "bg-blue-500",
    nextStatus: "preparing",
    nextLabel: "Start Preparing",
    nextColor: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20",
  },
  preparing: {
    label: "Preparing",
    badgeBg: "bg-orange-50 dark:bg-orange-950/40",
    badgeText: "text-orange-800 dark:text-orange-300",
    badgeBorder: "border-orange-300/80 dark:border-orange-800",
    dot: "bg-orange-500",
    nextStatus: "packed",
    nextLabel: "Mark Packed",
    nextColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
  },
  packed: {
    label: "Packed & Ready",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    badgeText: "text-purple-800 dark:text-purple-300",
    badgeBorder: "border-purple-300/80 dark:border-purple-800",
    dot: "bg-purple-500",
    nextStatus: "shipped",
    nextLabel: "Out for Delivery",
    nextColor: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20",
  },
  shipped: {
    label: "Out for Delivery",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40",
    badgeText: "text-teal-800 dark:text-teal-300",
    badgeBorder: "border-teal-300/80 dark:border-teal-800",
    dot: "bg-teal-500",
    nextStatus: "delivered",
    nextLabel: "Mark Delivered",
    nextColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
  },
  delivered: {
    label: "Delivered",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    badgeBorder: "border-emerald-300/80 dark:border-emerald-800",
    dot: "bg-emerald-500",
    nextStatus: null,
    nextLabel: null,
    nextColor: "",
  },
  cancelled: {
    label: "Cancelled",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-800 dark:text-rose-300",
    badgeBorder: "border-rose-300/80 dark:border-rose-800",
    dot: "bg-rose-500",
    nextStatus: null,
    nextLabel: null,
    nextColor: "",
  },
} as const

const ORDER_PROCESS_STEPS = [
  { id: "accepted", label: "1. Confirmed", shortLabel: "Confirmed", icon: Sparkles },
  { id: "preparing", label: "2. Kitchen", shortLabel: "Kitchen", icon: ChefHat },
  { id: "packed", label: "3. Packed", shortLabel: "Packed", icon: Package },
  { id: "shipped", label: "4. Out for Delivery", shortLabel: "En Route", icon: Truck },
  { id: "delivered", label: "5. Delivered", shortLabel: "Delivered", icon: ShieldCheck },
] as const

const FILTER_TABS = [
  { id: "active", label: "Active Orders", icon: Layers },
  { id: "new", label: "New", icon: Clock },
  { id: "preparing", label: "Kitchen", icon: ChefHat },
  { id: "packed", label: "Packed", icon: Package },
  { id: "shipped", label: "En Route", icon: Truck },
  { id: "delivered", label: "Delivered", icon: ShieldCheck },
  { id: "all", label: "All Orders", icon: Sparkles },
]

function getWhatsAppMessage(order: Order, type: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://swadamfoods.eu.cc"
  const phoneParam = encodeURIComponent(order.customerPhone.replace(/\D/g, "").slice(-10))
  const url = `${origin}/track?orderId=${encodeURIComponent(order.id)}&phone=${phoneParam}`
  const msgs: Record<string, string> = {
    new: `Namaste ${order.customerName}! We received your Swadam Foods order *${order.id}* (₹${order.total}). We are reviewing it now.\n\nTrack order: ${url}`,
    accepted: `Namaste ${order.customerName}! Your Swadam Foods order *${order.id}* (₹${order.total}) is confirmed. We are starting preparation.\n\nTrack order: ${url}`,
    preparing: `Namaste ${order.customerName}! Your order *${order.id}* is currently being freshly prepared in our kitchen.\n\nTrack progress: ${url}`,
    packed: `Namaste ${order.customerName}! Your order *${order.id}* is freshly packed, sealed, and ready for dispatch.\n\nTrack order: ${url}`,
    shipped: `Namaste ${order.customerName}! Your order *${order.id}* is out for delivery with our delivery partner.\n\nTrack live: ${url}`,
    delivered: `Namaste ${order.customerName}! Your order *${order.id}* has been successfully delivered. Thank you for choosing Swadam Foods! Enjoy your authentic delicacies.`,
    cancelled: `Namaste ${order.customerName}! Your Swadam Foods order *${order.id}* has been cancelled. For any queries or refund assistance, please reply to this message.`,
  }
  return msgs[type] || msgs.accepted
}

function openWhatsApp(phone: string, message: string) {
  let p = phone.replace(/\D/g, "")
  if (!p) return
  if (p.length === 10) p = "91" + p
  window.open(`https://wa.me/${p}?text=${encodeURIComponent(message)}`, "_blank")
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  } catch {
    return dateStr
  }
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.new
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} shadow-xs`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <span>{cfg.label}</span>
    </span>
  )
}

function OrderDetailModal({
  order,
  onClose,
  onOpenInvoice,
  onStatusChangeWithWhatsApp,
  updatingId,
}: {
  order: Order
  onClose: () => void
  onOpenInvoice: (order: Order) => void
  onStatusChangeWithWhatsApp?: (order: Order, newStatus: string) => Promise<void>
  updatingId?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const isPaid = order.paymentStatus === "paid"

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

  const copyId = () => {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white text-stone-900 shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 px-5 py-4 bg-stone-50/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 font-black shrink-0">
              <Info className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading text-base font-extrabold text-stone-900 truncate">
                Order Summary &amp; History
              </h3>
              <p className="text-xs text-stone-500 font-mono truncate">{order.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy ID"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Order Status
              </span>
              <div className="mt-1.5">
                <StatusBadge status={order.orderStatus} />
              </div>
              <span className="text-[11px] text-stone-500 mt-2 block">
                Updated: {new Date(order.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Payment Status
              </span>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                    isPaid ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {isPaid ? "✓ Paid in Full" : "⏳ Pending"}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 mt-2 block truncate">
                Gateway: {order.paymentGateway ? "PhonePe PG" : "Direct"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Order Process &amp; WhatsApp Notifications
              </span>
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>Tap any step to advance &amp; notify</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ORDER_PROCESS_STEPS.map((step, idx) => {
                const stepOrder = ["accepted", "preparing", "packed", "shipped", "delivered"]
                const currentIdx = stepOrder.indexOf(order.orderStatus)
                const isCurrent = order.orderStatus === step.id
                const isPassed = currentIdx !== -1 && idx < currentIdx
                const StepIcon = step.icon
                const isUpdating = updatingId === order.id

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => {
                      if (onStatusChangeWithWhatsApp) {
                        onStatusChangeWithWhatsApp(order, step.id)
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border text-center ${
                      isCurrent
                        ? "border-amber-500 bg-amber-500/15 text-amber-900 ring-2 ring-amber-500/30 font-black"
                        : isPassed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {isPassed ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <StepIcon className={`h-3.5 w-3.5 ${isCurrent ? "text-amber-600" : "text-stone-400"}`} />
                      )}
                    </div>
                    <span className="text-[11px] leading-tight">{step.shortLabel}</span>
                    <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                      <MessageSquare className="h-2 w-2" />
                      WhatsApp
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Customer &amp; Delivery Destination
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {order.deliveryMethod === "porter" ? "🚗 Porter Express" : "🏠 Pune Local"}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-stone-900">{order.customerName}</p>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{order.customerPhone}</span>
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-stone-700 leading-relaxed">{order.customerAddress}</p>
                <p className="font-mono text-stone-500">Pincode: {order.pincode}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-100/90 px-4 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Itemized Order ({order.items.length})</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-stone-100 px-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <p className="font-bold text-stone-900">{item.product_name}</p>
                    <p className="text-stone-400 text-[11px]">
                      {item.weight} &times; {item.quantity} @ ₹{item.unit_price}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-stone-900">₹{item.line_total}</span>
                </div>
              ))}
            </div>
            <div className="bg-stone-50/80 px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs font-extrabold text-stone-900">
              <span>Total Bill (Incl. GST)</span>
              <span className="font-mono text-base font-black text-emerald-700">₹{order.total}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 px-5 py-3.5 bg-stone-50/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <Link
            href={`/track?orderId=${encodeURIComponent(order.id)}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
          >
            <span>Customer Track View</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenInvoice(order)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 transition shadow-xs active:scale-95"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Tax Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onStatusChange,
  onStatusChangeWithWhatsApp,
  onViewDetails,
  onOpenInvoice,
  updatingId,
  isSelected,
  onToggleSelect,
}: {
  order: Order
  onStatusChange: (id: string, status: string) => Promise<void>
  onStatusChangeWithWhatsApp: (order: Order, status: string) => Promise<void>
  onViewDetails: (order: Order) => void
  onOpenInvoice: (order: Order) => void
  updatingId: string | null
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}) {
  const [showWaMenu, setShowWaMenu] = useState(false)
  const updating = updatingId === order.id
  const isPaid = order.paymentStatus === "paid"
  const isCompleted = order.orderStatus === "delivered" || order.orderStatus === "cancelled"
  const cfg = STATUS_CONFIG[order.orderStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.new

  const waOptions: Array<{
    type: "accepted" | "preparing" | "packed" | "shipped" | "delivered"
    label: string
  }> = [
    { type: "accepted", label: "1. Confirmed & Accepted" },
    { type: "preparing", label: "2. Kitchen Preparing" },
    { type: "packed", label: "3. Packed & Sealed" },
    { type: "shipped", label: "4. Out for Delivery" },
    { type: "delivered", label: "5. Delivered & Thank You" },
  ]

  return (
    <div className={`relative rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all ${isSelected ? "border-primary/60 ring-2 ring-primary/20" : "border-stone-200/90"}`}>
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSelect && (
            <button
              type="button"
              onClick={() => onToggleSelect(order.id)}
              className="shrink-0 text-stone-400 hover:text-primary transition active:scale-95"
              title={isSelected ? "Deselect order" : "Select order for bulk action"}
            >
              {isSelected ? <CheckSquare className="h-4.5 w-4.5 text-primary" /> : <Square className="h-4.5 w-4.5" />}
            </button>
          )}
          <span className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
            {order.id}
          </span>
          <span className="text-[11px] text-stone-400 font-medium">
            {formatRelativeTime(order.createdAt)}
          </span>
          <span className="hidden sm:inline-block text-[11px] text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
            {order.deliveryMethod === "porter" ? "🚗 Porter" : "🏠 Pune Home"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
              isPaid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isPaid ? "✓ Paid" : "⏳ Pending"}
          </span>
          <StatusBadge status={order.orderStatus} />
          <span className="font-mono text-base sm:text-lg font-black text-stone-900 pl-1">
            ₹{order.total}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-extrabold text-stone-900 text-sm sm:text-base truncate">
              {order.customerName}
            </h4>
            <button
              type="button"
              onClick={() => onViewDetails(order)}
              className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-stone-100 hover:bg-amber-500 hover:text-white text-stone-600 transition shadow-xs active:scale-95 shrink-0"
              title="View full order details"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a
              href={`tel:${order.customerPhone}`}
              className="inline-flex items-center gap-1 font-mono font-bold text-stone-700 hover:text-primary"
            >
              <Phone className="h-3 w-3 text-stone-400" />
              <span>{order.customerPhone}</span>
            </a>
            <button
              type="button"
              onClick={() => openWhatsApp(order.customerPhone, `Namaste ${order.customerName}!`)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition active:scale-95"
              title="Quick WhatsApp message"
            >
              <MessageSquare className="h-2.5 w-2.5" />
              <span>Chat</span>
            </button>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 leading-snug pt-0.5">
            <MapPin className="inline h-3 w-3 text-stone-400 mr-1" />
            {order.customerAddress} · {order.pincode}
          </p>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center rounded-xl bg-stone-50/70 p-3 border border-stone-200/60">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5 block">
            Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </span>
          <div className="space-y-1">
            {order.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800 truncate pr-2">
                  {item.product_name} <span className="text-stone-400 font-normal">({item.weight})</span>
                </span>
                <span className="font-mono text-stone-600 font-bold shrink-0">
                  &times;{item.quantity}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <span className="text-[11px] font-bold text-primary block pt-0.5">
                +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col justify-between gap-2.5">
          {!isCompleted && cfg.nextStatus && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onStatusChangeWithWhatsApp(order, cfg.nextStatus!)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm ${cfg.nextColor} disabled:opacity-60`}
            >
              {updating ? (
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{cfg.nextLabel}</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setShowWaMenu(!showWaMenu)}
                className="w-full inline-flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-2 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
              >
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-emerald-600" />
                  <span>Notify WhatsApp</span>
                </span>
                <ChevronDown className="h-3 w-3 text-emerald-600" />
              </button>

              {showWaMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowWaMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-1 z-40 w-56 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl text-xs">
                    <span className="block px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                      Select Customer Update
                    </span>
                    {waOptions.map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setShowWaMenu(false)
                          openWhatsApp(order.customerPhone, getWhatsAppMessage(order, opt.type))
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-[11px] font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center gap-2"
                      >
                        <MessageSquare className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenInvoice(order)}
              className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition active:scale-95 shadow-xs shrink-0"
              title="View GST Tax Invoice"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>

            {!isCompleted && (
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  if (confirm(`Are you sure you want to cancel order ${order.id}? This will also notify the customer via WhatsApp.`)) {
                    onStatusChangeWithWhatsApp(order, "cancelled")
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 p-2 text-rose-600 hover:bg-rose-100 transition active:scale-95 shrink-0"
                title="Cancel Order & Send WhatsApp"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-stone-100 dark:border-stone-800/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            Order Process Steps &amp; WhatsApp Updates
          </span>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>Click any step to advance &amp; send WhatsApp</span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {ORDER_PROCESS_STEPS.map((step, idx) => {
            const stepOrder = ["accepted", "preparing", "packed", "shipped", "delivered"]
            const currentIdx = stepOrder.indexOf(order.orderStatus)
            const isCurrent = order.orderStatus === step.id
            const isPassed = currentIdx !== -1 && idx < currentIdx
            const StepIcon = step.icon

            return (
              <button
                key={step.id}
                type="button"
                disabled={updating}
                onClick={() => onStatusChangeWithWhatsApp(order, step.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  isCurrent
                    ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-extrabold shadow-xs ring-1 ring-amber-500/30"
                    : isPassed
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                }`}
                title={`Advance to ${step.label} and send WhatsApp`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {isPassed ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <StepIcon className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? "text-amber-600" : "text-stone-400"}`} />
                  )}
                  <span className="truncate">{step.shortLabel}</span>
                </span>
                <MessageSquare className="h-2.5 w-2.5 text-stone-300 group-hover:text-emerald-600 shrink-0 transition" />
              </button>
            )
          })}
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
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null)
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true)
  const [statusNotification, setStatusNotification] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState("preparing")
  const [bulkUpdating, setBulkUpdating] = useState(false)

  const [chimeEnabled, setChimeEnabled] = useState(true)
  const prevOrderCountRef = React.useRef(0)

  const [inventory, setInventory] = useState<Record<string, number>>({})
  const [inventoryInputs, setInventoryInputs] = useState<Record<string, string>>({})
  const [inventoryUpdating, setInventoryUpdating] = useState<string | null>(null)

  const [timeSlots, setTimeSlots] = useState<Array<{ id: string; label: string; capacity: number; booked: number; isActive: boolean; available: number }>>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotUpdating, setSlotUpdating] = useState<string | null>(null)

  const LOW_STOCK_THRESHOLD = 10

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
        if (res.status === 401) {
          setIsAuthorized(false)
          setAuthError("Wrong passcode. Please verify your merchant key.")
        } else {
          setError(data.error || "Failed to load orders.")
        }
        return
      }
      setOrders(data.orders || [])
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

  useEffect(() => {
    if (adminKey) fetchOrders(adminKey)
  }, [adminKey, fetchOrders])

  useEffect(() => {
    if (!isAuthorized || !adminKey) return
    const timer = setInterval(() => fetchOrders(adminKey), 20000)
    return () => clearInterval(timer)
  }, [isAuthorized, adminKey, fetchOrders])

  useEffect(() => {
    if (!isAuthorized) return
    const newCount = orders.filter((o) => o.orderStatus === "new" && o.paymentStatus === "paid").length
    if (chimeEnabled && newCount > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = "sine"
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.6)
      } catch {}
    }
    prevOrderCountRef.current = newCount
  }, [orders, chimeEnabled, isAuthorized])

  useEffect(() => {
    if (!isAuthorized || !adminKey) return
    fetch(`/api/admin/inventory?key=${encodeURIComponent(adminKey)}`)
      .then((r) => r.json())
      .then((data: { inventory?: Array<{ productId: string; stock: number }> }) => {
        const map: Record<string, number> = {}
        const inputs: Record<string, string> = {}
        for (const item of data.inventory ?? []) {
          map[item.productId] = item.stock
          inputs[item.productId] = String(item.stock)
        }
        setInventory(map)
        setInventoryInputs(inputs)
      })
      .catch(() => {})
  }, [isAuthorized, adminKey])

  useEffect(() => {
    if (!isAuthorized || !adminKey) return
    setSlotsLoading(true)
    fetch(`/api/admin/time-slots?key=${encodeURIComponent(adminKey)}`)
      .then((r) => r.json())
      .then((data: { slots?: Array<{ id: string; label: string; capacity: number; booked: number; isActive: boolean; available: number }> }) => {
        setTimeSlots(data.slots ?? [])
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [isAuthorized, adminKey])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const key = inputKey.trim()
    if (!key) {
      setAuthError("Please enter your admin passcode.")
    } else {
      localStorage.setItem("swadam_admin_key", key)
      setAdminKey(key)
      fetchOrders(key)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("swadam_admin_key")
    setAdminKey("")
    setIsAuthorized(false)
    setOrders([])
    setSelectedIds(new Set())
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.size === 0) return
    setBulkUpdating(true)
    const ids = Array.from(selectedIds)
    for (const orderId of ids) {
      try {
        const res = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
          body: JSON.stringify({ orderId, orderStatus: bulkStatus }),
        })
        if (res.ok) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: bulkStatus } : o)))
          if (autoSendWhatsApp) {
            const order = orders.find((o) => o.id === orderId)
            if (order) openWhatsApp(order.customerPhone, getWhatsAppMessage(order, bulkStatus))
          }
        }
      } catch {}
    }
    setSelectedIds(new Set())
    setBulkUpdating(false)
    setStatusNotification(`Bulk updated ${ids.length} order${ids.length > 1 ? "s" : ""} to "${STATUS_CONFIG[bulkStatus as keyof typeof STATUS_CONFIG]?.label || bulkStatus}"`)
    setTimeout(() => setStatusNotification(null), 4000)
  }

  const handleInventoryUpdate = async (productId: string) => {
    const stockStr = inventoryInputs[productId] ?? "0"
    const stock = Math.max(0, parseInt(stockStr, 10) || 0)
    setInventoryUpdating(productId)
    try {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ productId, stock }),
      })
      setInventory((prev) => ({ ...prev, [productId]: stock }))
    } catch {}
    setInventoryUpdating(null)
  }

  const handleSlotToggle = async (slotId: string, isActive: boolean) => {
    setSlotUpdating(slotId)
    try {
      await fetch("/api/admin/time-slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ slotId, isActive }),
      })
      setTimeSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, isActive } : s)))
    } catch {}
    setSlotUpdating(null)
  }

  const handleSlotCapacity = async (slotId: string, capacity: number) => {
    setSlotUpdating(slotId)
    try {
      await fetch("/api/admin/time-slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ slotId, capacity }),
      })
      setTimeSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, capacity, available: Math.max(0, capacity - s.booked) } : s)))
    } catch {}
    setSlotUpdating(null)
  }

  const downloadManifest = () => {
    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = orders.filter(
      (o) => ["packed", "shipped"].includes(o.orderStatus) && o.createdAt?.startsWith(today),
    )
    const rows = [
      ["Order ID", "Customer Name", "Phone", "Address", "Pincode", "Delivery", "Items", "Total (INR)", "Status"],
      ...todayOrders.map((o) => [
        o.id,
        o.customerName,
        o.customerPhone,
        `"${o.customerAddress.replace(/"/g, '""')}"`,
        o.pincode,
        o.deliveryMethod === "porter" ? "Porter" : "Pune Home",
        `"${o.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")}"`,
        String(o.total),
        o.orderStatus,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `swadam-manifest-${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o)),
        )
        setSelectedOrderDetails((prev) =>
          prev && prev.id === orderId ? { ...prev, orderStatus: newStatus } : prev,
        )
      } else {
        alert("Failed to update status. Please try again.")
      }
    } catch {
      alert("Network error. Could not reach server.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChangeWithWhatsApp = useCallback(
    async (order: Order, newStatus: string) => {
      if (autoSendWhatsApp) {
        const msg = getWhatsAppMessage(order, newStatus)
        openWhatsApp(order.customerPhone, msg)
        const label = STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label || newStatus
        setStatusNotification(`Updated ${order.id} to "${label}" & opened WhatsApp message`)
      } else {
        const label = STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label || newStatus
        setStatusNotification(`Updated ${order.id} to "${label}"`)
      }
      setTimeout(() => setStatusNotification(null), 4000)
      await handleStatusChange(order.id, newStatus)
    },
    [autoSendWhatsApp, adminKey],
  )

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? ["new", "accepted", "preparing", "packed", "shipped"].includes(o.orderStatus)
          : o.orderStatus === statusFilter

      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.pincode.includes(q)

      return matchStatus && matchQuery
    })
  }, [orders, statusFilter, searchQuery])

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let revenue = 0
    let active = 0
    let enroute = 0
    let pending = 0
    for (const o of orders) {
      if (o.paymentStatus === "paid" && o.createdAt?.startsWith(today)) {
        revenue += o.total
      }
      if (["new", "accepted", "preparing", "packed"].includes(o.orderStatus)) {
        active++
      }
      if (o.orderStatus === "shipped") {
        enroute++
      }
      if (!["paid", "refunded"].includes(o.paymentStatus)) {
        pending++
      }
    }
    return { revenue, active, enroute, pending }
  }, [orders])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100 dark:bg-stone-950">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-2xl border border-stone-200 dark:bg-stone-900 dark:border-stone-800 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-3xl p-3 bg-stone-50 border border-stone-200 shadow-xs dark:bg-stone-800 dark:border-stone-700">
              <Image
                src="/images/swadam-logo.webp"
                alt="Swadam Foods"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Kitchen &amp; Dispatch
            </span>
            <h1 className="mt-2 text-2xl font-black text-stone-900 dark:text-white">Merchant Portal</h1>
            <p className="text-xs text-stone-400 mt-1">Enter your merchant access passcode</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-4 pl-11 pr-4 text-center font-mono text-sm tracking-widest text-stone-800 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>

          <p className="text-[11px] text-stone-400">
            WhatsApp Business · +{WHATSAPP_NUMBER}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100/90 dark:bg-stone-950 text-stone-900 dark:text-white pb-16">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" target="_blank" className="shrink-0">
              <Image
                src="/images/swadam-logo.webp"
                alt="Swadam Foods"
                width={100}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm hidden md:inline">Operations</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "Live"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoSendWhatsApp(!autoSendWhatsApp)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-xs active:scale-95 ${
                autoSendWhatsApp
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
              }`}
              title="Toggle automatic WhatsApp messaging when advancing order steps"
            >
              <MessageSquare className={`h-3.5 w-3.5 ${autoSendWhatsApp ? "text-emerald-600" : "text-stone-400"}`} />
              <span className="hidden sm:inline">WhatsApp on Steps:</span>
              <span>{autoSendWhatsApp ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchOrders(adminKey)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-xs active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              title="Refresh order feed"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={downloadManifest}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-xs active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              title="Download today's dispatch manifest CSV"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              <span className="hidden sm:inline">Manifest</span>
            </button>

            <button
              type="button"
              onClick={() => setChimeEnabled(!chimeEnabled)}
              className={`inline-flex items-center justify-center h-9 w-9 rounded-xl border transition shadow-xs active:scale-95 ${chimeEnabled ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40" : "border-stone-200 bg-white text-stone-400 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900"}`}
              title={chimeEnabled ? "Mute new order chime" : "Unmute new order chime"}
            >
              {chimeEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-xs active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
            >
              <span className="hidden sm:inline">Store</span>
              <ExternalLink className="h-3 w-3 text-stone-400" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-xs active:scale-95 dark:border-rose-900/50 dark:bg-rose-950/40"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs dark:border-emerald-900/40 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                Today&apos;s Revenue
              </span>
              <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center dark:bg-emerald-950/40">
                <IndianRupee className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400">
              ₹{kpis.revenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">Paid orders today</span>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs dark:border-amber-900/40 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                Kitchen Active
              </span>
              <span className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center dark:bg-amber-950/40">
                <ChefHat className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-2xl font-black text-amber-700 dark:text-amber-400">
              {kpis.active}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">Preparing &amp; packed</span>
          </div>

          <div className="rounded-2xl border border-teal-200/80 bg-white p-4 shadow-xs dark:border-teal-900/40 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                Out for Delivery
              </span>
              <span className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center dark:bg-teal-950/40">
                <Truck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-2xl font-black text-teal-700 dark:text-teal-400">
              {kpis.enroute}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">With delivery partner</span>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                Unpaid / Pending
              </span>
              <span className="h-7 w-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center dark:bg-stone-800">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-2xl font-black text-stone-700 dark:text-stone-300">
              {kpis.pending}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">Awaiting confirmation</span>
          </div>
        </div>

        {Object.entries(inventory).some(([, stock]) => stock <= LOW_STOCK_THRESHOLD && stock >= 0) && (
          <div className="flex items-center gap-3 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-orange-600" />
            <span>
              Low Stock Alert: {Object.entries(inventory).filter(([, s]) => s <= LOW_STOCK_THRESHOLD && s >= 0).map(([id]) => {
                const p = products.find((pr) => pr.id === id)
                return p ? `${p.name} (${inventory[id]} left)` : id
              }).join(", ")}
            </span>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
              <Boxes className="h-4 w-4 text-amber-600" />
              <h2 className="font-extrabold text-sm text-stone-900 dark:text-white">Stock Inventory Manager</h2>
            </div>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {products.map((product) => {
                const stock = inventory[product.id] ?? 0
                const inputVal = inventoryInputs[product.id] ?? String(stock)
                const isLow = stock <= LOW_STOCK_THRESHOLD
                const isUpdatingThis = inventoryUpdating === product.id
                return (
                  <div key={product.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-[10px] text-stone-400">{product.weight}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${isLow ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"}`}>
                        {isLow ? `${stock} left` : `${stock} in stock`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setInventoryInputs((p) => ({ ...p, [product.id]: String(Math.max(0, parseInt(inputVal, 10) - 1 || 0)) }))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition active:scale-95 dark:border-stone-700 dark:bg-stone-800">
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={inputVal}
                          onChange={(e) => setInventoryInputs((p) => ({ ...p, [product.id]: e.target.value }))}
                          className="w-16 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-center text-xs font-mono font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                        <button type="button" onClick={() => setInventoryInputs((p) => ({ ...p, [product.id]: String((parseInt(inputVal, 10) || 0) + 1) }))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition active:scale-95 dark:border-stone-700 dark:bg-stone-800">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={isUpdatingThis}
                        onClick={() => handleInventoryUpdate(product.id)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[11px] font-extrabold text-white transition active:scale-95 disabled:opacity-60 shadow-xs"
                      >
                        {isUpdatingThis ? <RotateCcw className="h-3 w-3 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <TimerReset className="h-4 w-4 text-teal-600" />
                <h2 className="font-extrabold text-sm text-stone-900 dark:text-white">Today&apos;s Delivery Slots</h2>
              </div>
              <span className="text-[10px] font-bold text-stone-400">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
            </div>
            {slotsLoading ? (
              <div className="px-5 py-6 flex items-center gap-2 text-xs text-stone-400">
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                <span>Loading slots…</span>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {timeSlots.map((slot) => {
                  const isUpdatingSlot = slotUpdating === slot.id
                  const pct = slot.capacity > 0 ? Math.round((slot.booked / slot.capacity) * 100) : 0
                  return (
                    <div key={slot.id} className="px-5 py-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold text-stone-900 dark:text-white">{slot.label}</p>
                          <p className="text-[10px] text-stone-400">{slot.booked}/{slot.capacity} booked · {slot.available} available</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button type="button" disabled={isUpdatingSlot} onClick={() => handleSlotCapacity(slot.id, Math.max(slot.booked, slot.capacity - 1))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition active:scale-95 dark:border-stone-700 dark:bg-stone-800 disabled:opacity-50"><Minus className="h-2.5 w-2.5" /></button>
                            <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 min-w-5 text-center">{slot.capacity}</span>
                            <button type="button" disabled={isUpdatingSlot} onClick={() => handleSlotCapacity(slot.id, slot.capacity + 1)} className="h-6 w-6 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition active:scale-95 dark:border-stone-700 dark:bg-stone-800 disabled:opacity-50"><Plus className="h-2.5 w-2.5" /></button>
                          </div>
                          <button
                            type="button"
                            disabled={isUpdatingSlot}
                            onClick={() => handleSlotToggle(slot.id, !slot.isActive)}
                            className={`rounded-xl px-3 py-1.5 text-[11px] font-extrabold transition active:scale-95 shadow-xs disabled:opacity-60 ${slot.isActive ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"}`}
                          >
                            {slot.isActive ? "Close" : "Open"}
                          </button>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FILTER_TABS.map((tab) => {
                const active = statusFilter === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 shrink-0 shadow-xs ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {tab.id === "active" && kpis.active > 0 && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {kpis.active}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, phone, name..."
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-8 text-xs font-medium placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-12 text-center dark:border-stone-800 dark:bg-stone-900/60">
              <Package className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-3 font-heading font-extrabold text-stone-700 dark:text-stone-300">
                No orders found
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                {searchQuery
                  ? "Try searching with a different name, order ID, or phone."
                  : "No orders match the selected status filter."}
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex items-center gap-3 px-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.size === filtered.length) {
                    setSelectedIds(new Set())
                  } else {
                    setSelectedIds(new Set(filtered.map((o) => o.id)))
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-primary transition active:scale-95"
              >
                {selectedIds.size === filtered.length && filtered.length > 0 ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>{selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}</span>
              </button>
              {selectedIds.size > 0 && (
                <button type="button" onClick={() => setSelectedIds(new Set())} className="text-xs font-bold text-rose-600 hover:text-rose-800 active:scale-95">Clear</button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onStatusChangeWithWhatsApp={handleStatusChangeWithWhatsApp}
                onViewDetails={setSelectedOrderDetails}
                onOpenInvoice={setSelectedInvoiceOrder}
                updatingId={updatingId}
                isSelected={selectedIds.has(order.id)}
                onToggleSelect={(id) => setSelectedIds((prev) => {
                  const next = new Set(prev)
                  if (next.has(id)) next.delete(id)
                  else next.add(id)
                  return next
                })}
              />
            ))}
          </div>
        </div>
      </main>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-stone-300 bg-stone-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
          <span className="text-xs font-extrabold text-white">{selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-xl border border-stone-600 bg-stone-800 px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {Object.entries(STATUS_CONFIG).filter(([, v]) => v.nextStatus !== null || ["accepted","preparing","packed","shipped","delivered"].includes(["accepted","preparing","packed","shipped","delivered"].find(s => s) ?? "")).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={bulkUpdating}
            onClick={handleBulkStatusUpdate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-extrabold text-primary-foreground transition active:scale-95 disabled:opacity-60 shadow-lg"
          >
            {bulkUpdating ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>Apply</span>
          </button>
          <button type="button" onClick={() => setSelectedIds(new Set())} className="text-stone-400 hover:text-white transition active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedOrderDetails && (
        <OrderDetailModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
          onStatusChangeWithWhatsApp={handleStatusChangeWithWhatsApp}
          updatingId={updatingId}
        />
      )}

      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={{
            id: selectedInvoiceOrder.id,
            customerName: selectedInvoiceOrder.customerName,
            customerPhoneMasked: selectedInvoiceOrder.customerPhone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
            customerAddress: selectedInvoiceOrder.customerAddress,
            pincode: selectedInvoiceOrder.pincode,
            deliveryMethod: selectedInvoiceOrder.deliveryMethod,
            subtotal: selectedInvoiceOrder.subtotal,
            deliveryFee: selectedInvoiceOrder.deliveryFee,
            total: selectedInvoiceOrder.total,
            currency: selectedInvoiceOrder.currency,
            paymentStatus: selectedInvoiceOrder.paymentStatus,
            orderStatus: selectedInvoiceOrder.orderStatus,
            createdAt: selectedInvoiceOrder.createdAt,
            items: selectedInvoiceOrder.items.map((i) => ({
              productName: i.product_name,
              weight: i.weight,
              quantity: i.quantity,
              unitPrice: i.unit_price,
              lineTotal: i.line_total,
            })),
          }}
          isOpen={true}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-950/95 px-4 py-3 text-xs font-bold text-emerald-100 shadow-2xl backdrop-blur-md">
          <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}
    </div>
  )
}

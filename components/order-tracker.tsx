"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2,
  Clock,
  Truck,
  ChefHat,
  PackageCheck,
  MessageSquare,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  PhoneCall,
  ShieldCheck,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

type OrderItem = {
  productName: string
  weight: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

type OrderDetails = {
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
  updatedAt: string
  items: OrderItem[]
}

const MERCHANT_WHATSAPP = "8888851522"

const STAGES = [
  {
    id: "received",
    label: "Order Received",
    subtitle: "Received & logged into system",
    icon: Clock,
  },
  {
    id: "paid",
    label: "Payment Confirmed",
    subtitle: "Payment verified via PhonePe",
    icon: ShieldCheck,
  },
  {
    id: "preparing",
    label: "Kitchen Preparation",
    subtitle: "Freshly handcrafting delicacies",
    icon: ChefHat,
  },
  {
    id: "packed",
    label: "Packed & Sealed",
    subtitle: "Sealed & ready for dispatch",
    icon: PackageCheck,
  },
  {
    id: "shipped",
    label: "Out for Delivery",
    subtitle: "Delivery partner on the way",
    icon: Truck,
  },
  {
    id: "delivered",
    label: "Delivered",
    subtitle: "Delivered to your doorstep!",
    icon: Sparkles,
  },
]

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchOrder = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true)
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Order not found.")
          return
        }
        setOrder(data.order)
        setError("")
      } catch {
        setError("Failed to connect to server.")
      } finally {
        setLoading(false)
        if (isManualRefresh) {
          setTimeout(() => setRefreshing(false), 600)
        }
      }
    },
    [orderId],
  )

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(() => fetchOrder(false), 10000)
    return () => clearInterval(interval)
  }, [fetchOrder])

  const copyOrderId = () => {
    if (!order) return
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStageIndex = (orderStatus: string, paymentStatus: string) => {
    if (orderStatus === "delivered") return 5
    if (orderStatus === "shipped") return 4
    if (orderStatus === "packed") return 3
    if (orderStatus === "preparing") return 2
    if (paymentStatus === "paid" || orderStatus === "accepted") return 1
    return 0
  }

  if (loading) {
    return (
      <div className="ambient-bg flex min-h-screen items-center justify-center p-4">
        <div className="glass-card flex flex-col items-center space-y-4 rounded-3xl p-8 text-center shadow-xl">
          <RefreshCw className="h-10 w-10 animate-spin text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-foreground">Fetching Live Status...</h3>
            <p className="text-xs text-muted-foreground">Connecting to Swadam Foods order system</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="ambient-bg flex min-h-screen items-center justify-center p-4">
        <div className="glass-card w-full max-w-md space-y-6 rounded-3xl p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-foreground">Order Not Found</h2>
            <p className="text-xs text-muted-foreground">{error || "Please check your order ID and try again."}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Swadam Foods Store</span>
          </Link>
        </div>
      </div>
    )
  }

  const currentStageIdx = getStageIndex(order.orderStatus, order.paymentStatus)
  const isCancelled = order.orderStatus === "cancelled"

  const whatsappMessage = encodeURIComponent(
    `Namaste Swadam Foods! 🙏 I have a question about my order *${order.id}* (Total: ₹${order.total}).`,
  )

  return (
    <div className="ambient-bg min-h-screen pb-16 pt-4">
      {/* Top Header Bar */}
      <header className="sticky top-3 z-40 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="glass-header flex h-16 items-center justify-between gap-4 rounded-full px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7]/90 p-1 shadow-xs ring-1 ring-white/60">
              <Image
                src="/images/swadam-logo.webp"
                alt="Swadam Foods logo"
                width={112}
                height={36}
                sizes="56px"
                className="h-8 w-auto shrink-0"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-base font-extrabold tracking-tight text-foreground">
                Swadam Foods
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                Live Order Tracker
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrder(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-background active:scale-95"
              title="Refresh order status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Shop</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Order Status Banner */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Live Status Active
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {order.id}
                </h1>
                <button
                  onClick={copyOrderId}
                  className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-xs font-medium text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
              <div className="text-left md:text-right">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Total
                </span>
                <span className="font-heading text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{order.total}
                </span>
              </div>

              <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-300"
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{order.paymentStatus === "paid" ? "Payment Confirmed" : "Payment Pending"}</span>
              </span>
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="pt-6">
            {isCancelled ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center text-rose-700 dark:text-rose-300">
                <h4 className="font-bold text-sm">This order has been cancelled</h4>
                <p className="text-xs mt-1">If you have any questions, please contact our support team below.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Progress Timeline
                  </h3>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    Current Stage: {STAGES[currentStageIdx]?.label}
                  </span>
                </div>

                {/* Progress Steps Grid / List */}
                <div className="relative space-y-6 pl-4 sm:pl-6 before:absolute before:left-7 sm:before:left-9 before:top-3 before:bottom-3 before:w-1 before:bg-border/60">
                  {STAGES.map((stage, idx) => {
                    const isPassed = idx <= currentStageIdx
                    const isCurrent = idx === currentStageIdx
                    const Icon = stage.icon

                    return (
                      <div key={stage.id} className="relative flex items-start gap-4">
                        {/* Icon Node */}
                        <div
                          className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            isPassed
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
                              : "bg-card border-border text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-emerald-500/30 scale-110" : ""}`}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>

                        {/* Step Label & Subtitle */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-heading text-sm font-bold ${isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 animate-pulse">
                                Live Now
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{stage.subtitle}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Details Card */}
          <div className="glass-card rounded-3xl p-6 space-y-4 shadow-lg border border-white/60 dark:border-white/10">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="font-heading text-sm font-bold text-foreground">Delivery Destination</h3>
            </div>

            <div className="space-y-2 text-xs text-foreground">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Customer Name</span>
                <span className="font-bold text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Phone</span>
                <span className="font-mono text-muted-foreground">{order.customerPhoneMasked}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Delivery Address</span>
                <p className="font-medium text-foreground leading-relaxed">
                  {order.customerAddress}
                  <span className="block font-bold text-amber-700 dark:text-amber-400 mt-0.5">Pincode: {order.pincode}</span>
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">Fulfillment Method</span>
                <span className="inline-block rounded-xl bg-accent/80 border border-border px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground mt-1">
                  {order.deliveryMethod === "pune" ? "🚚 Pune Local Delivery" : "📦 Porter Express Delivery"}
                </span>
              </div>
            </div>
          </div>

          {/* Items Summary Card */}
          <div className="glass-card rounded-3xl p-6 space-y-4 shadow-lg border border-white/60 dark:border-white/10">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h3 className="font-heading text-sm font-bold text-foreground">Order Items ({order.items.length})</h3>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                  <div>
                    <span className="font-bold text-foreground">{item.productName}</span>
                    <span className="block text-[10px] text-muted-foreground">Pack: {item.weight}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground">₹{item.lineTotal}</span>
                    <span className="block text-[10px] text-muted-foreground">{item.quantity} × ₹{item.unitPrice}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3 text-xs space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span className="font-mono text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border/60">
                <span>Grand Total</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Business Direct Contact Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <MessageSquare className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-heading text-lg font-extrabold text-foreground">
              Need Help With Your Order?
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Connect directly with our Swadam Foods team on WhatsApp for instant updates, special instructions, or assistance.
            </p>
          </div>

          <a
            href={`https://wa.me/91${MERCHANT_WHATSAPP}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Chat on WhatsApp (+91 {MERCHANT_WHATSAPP})</span>
            <ExternalLink className="h-4 w-4 ml-1 opacity-80" />
          </a>
        </div>
      </main>
    </div>
  )
}

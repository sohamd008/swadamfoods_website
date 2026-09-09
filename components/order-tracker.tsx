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
  FileText,
  Phone,
  Lock,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { PhonePeIcon } from "@/components/phonepe-logo"
import dynamic from "next/dynamic"
import { WHATSAPP_NUMBER, products } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { validateIndianMobile } from "@/lib/phone"

const TaxInvoiceModal = dynamic(
  () => import("@/components/tax-invoice").then((mod) => mod.TaxInvoiceModal),
  { ssr: false }
)

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
    subtitle: "Payment verified via PhonePe Payment Gateway",
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
  const { clear: clearCart, addItem, openCart } = useCart()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false)
  const [needsVerification, setNeedsVerification] = useState<boolean>(false)
  const [phoneInput, setPhoneInput] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string>("")
  const [verifying, setVerifying] = useState<boolean>(false)
  const [maskedPhone, setMaskedPhone] = useState<string>("")

  const fetchOrder = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true)
      try {
        const savedPhone =
          (typeof window !== "undefined" &&
            (localStorage.getItem("swadam_track_verified_" + orderId) ||
              sessionStorage.getItem("swadam_track_verified_" + orderId))) ||
          ""

        const headers: Record<string, string> = {}
        if (savedPhone) {
          headers["x-customer-phone"] = savedPhone
        }

        const res = await fetch(`/api/orders/${orderId}`, { headers })
        const data = await res.json()
        if (!res.ok) {
          if (data.requiresVerification) {
            setNeedsVerification(true)
            setMaskedPhone(data.order?.customerPhoneMasked || "")
            setError("")
            return
          }
          setError(data.error || "Order not found.")
          return
        }

        if (data.requiresVerification) {
          setNeedsVerification(true)
          setMaskedPhone(data.order?.customerPhoneMasked || "")
          setError("")
          return
        }

        setOrder(data.order)
        setNeedsVerification(false)
        if (data.order?.paymentStatus === "paid") {
          clearCart()
        }
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
    [clearCart, orderId],
  )

  const handleVerifyPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setPhoneError("")

    const validation = validateIndianMobile(phoneInput)
    if (!validation.isValid) {
      setPhoneError(validation.error || "Please enter a valid 10-digit mobile number.")
      return
    }

    setVerifying(true)
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone: validation.cleanPhone }),
      })
      const data = await res.json()
      if (!res.ok || !data.verified) {
        setPhoneError(data.error || "Verification failed. Please check the mobile number.")
        return
      }

      try {
        localStorage.setItem("swadam_track_verified_" + orderId, validation.cleanPhone)
        sessionStorage.setItem("swadam_track_verified_" + orderId, validation.cleanPhone)
      } catch {}

      setOrder(data.order)
      setNeedsVerification(false)
      if (data.order?.paymentStatus === "paid") {
        clearCart()
      }
      setPhoneError("")
    } catch {
      setPhoneError("Unable to verify mobile number. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    fetchOrder()
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
            <h3 className="font-heading text-lg font-bold text-foreground">Loading Order Details...</h3>
            <p className="text-xs text-muted-foreground">Connecting to Swadam Foods order system</p>
          </div>
        </div>
      </div>
    )
  }

  if (needsVerification) {
    return (
      <div className="ambient-bg min-h-screen px-4 py-8 sm:px-6">
        <header className="sticky top-3 z-40 mx-auto max-w-4xl">
          <div className="glass-header flex h-16 items-center justify-between gap-4 rounded-full px-4 sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3 transition-transform hover:scale-[1.02] active:scale-95">
              <span className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7]/90 p-1 shadow-sm ring-1 ring-white/60">
                <Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={448} height={244} sizes="59px" priority className="h-8 w-auto shrink-0" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-sm sm:text-base font-extrabold tracking-tight text-foreground truncate">Swadam Foods</span>
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase truncate">Order Security</span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/" className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/10 active:scale-95">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Store</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-md pt-8">
          <div className="glass-card rounded-[2.5rem] border border-white/70 bg-white/70 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-stone-900/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  One-Time Verification
                </span>
                <h1 className="font-heading text-xl font-black text-foreground">Verify Your Mobile</h1>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              To protect customer privacy and delivery address details, please verify the 10-digit mobile number registered with order <strong className="font-mono text-foreground">{orderId}</strong>.
            </p>

            {maskedPhone && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
                Registered Mobile: <strong className="font-mono tracking-wider">{maskedPhone}</strong>
              </div>
            )}

            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="verify-phone" className="text-xs font-extrabold uppercase tracking-wide text-foreground">
                  10-Digit Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>+91</span>
                  </span>
                  <input
                    id="verify-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setPhoneInput(val)
                      setPhoneError("")
                    }}
                    placeholder="9876543210"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 py-3.5 pl-16 pr-4 font-mono text-sm font-bold text-foreground placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950/50 dark:focus:bg-stone-950"
                    autoComplete="tel-national"
                    autoFocus
                  />
                </div>
              </div>

              {phoneError && (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{phoneError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifying || phoneInput.length !== 10}
                className="flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify & Unlock Tracking</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Swadam Foods, I need help verifying my order ${orderId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Need assistance? Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </main>
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
    `Namaste Swadam Foods! I have a question about my order *${order.id}* (Total: Rs. ${order.total}).`,
  )

  return (
    <div className="ambient-bg min-h-screen pb-16 pt-4">
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
                Order Tracker
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

      <main className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 space-y-6">
        <div className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Order Status
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
                  aria-label="Copy Order ID"
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

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-300"
                }`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{order.paymentStatus === "paid" ? "Payment Confirmed" : "Payment Pending"}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 active:scale-95 transition"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download Tax Invoice</span>
                </button>
              </div>
            </div>
          </div>

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

                <div className="relative space-y-6 pl-4 sm:pl-6 before:absolute before:left-7 sm:before:left-9 before:top-3 before:bottom-3 before:w-1 before:bg-border/60">
                  {STAGES.map((stage, idx) => {
                    const isPassed = idx <= currentStageIdx
                    const isCurrent = idx === currentStageIdx
                    const Icon = stage.icon

                    return (
                      <div key={stage.id} className="relative flex items-start gap-4">
                        <div
                          className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            isPassed
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
                              : "bg-card border-border text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-emerald-500/30 scale-110" : ""}`}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-heading text-sm font-bold ${isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                Current Stage
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Payment Gateway</span>
                <span className="flex items-center gap-1.5 font-bold text-[#5F259F] dark:text-purple-300">
                  <PhonePeIcon className="h-3.5 w-3.5" />
                  <span>PhonePe Payment Gateway {order.paymentStatus === "paid" ? "(Verified Paid)" : "(Pending)"}</span>
                </span>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View Official GST Invoice ↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {order.orderStatus === "delivered" && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-primary/20 bg-primary/5 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-extrabold text-foreground">Loved your order?</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Reorder the exact same items with one tap — your cart will be ready instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                order.items.forEach((item) => {
                  const product = products.find((p) => p.name === item.productName || p.id === item.productName)
                  if (product) {
                    for (let i = 0; i < item.quantity; i++) addItem(product)
                  }
                })
                openCart()
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary hover:opacity-90 px-6 py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Reorder Same Items</span>
            </button>
          </div>
        )}

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
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Chat on WhatsApp (+{WHATSAPP_NUMBER})</span>
            <ExternalLink className="h-4 w-4 ml-1 opacity-80" />
          </a>
        </div>
      </main>

      {order && (
        <TaxInvoiceModal
          order={order}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  )
}

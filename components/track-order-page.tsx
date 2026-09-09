"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Phone,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  Truck,
  ChefHat,
  PackageCheck,
  Sparkles,
  Copy,
  Check,
  FileText,
  MessageSquare,
  MapPin,
  Lock,
  ShoppingBag,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { PhonePeIcon } from "@/components/phonepe-logo"
import dynamic from "next/dynamic"
import { WHATSAPP_NUMBER, products } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { sanitizePhone, validateIndianMobile } from "@/lib/phone"

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
  customerPhone: string
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
    subtitle: "Verified via PhonePe Payment Gateway",
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

export function TrackOrderPage() {
  const { addItem, openCart } = useCart()
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || searchParams.get("id") || ""
  const initialPhone = searchParams.get("phone") || searchParams.get("mobile") || ""

  const [orderId, setOrderId] = useState(initialOrderId.toUpperCase())
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [copied, setCopied] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId.toUpperCase())
    }
    if (initialPhone) {
      setPhone(initialPhone)
    }
  }, [initialOrderId, initialPhone])

  useEffect(() => {
    const cleanId = initialOrderId.trim().toUpperCase()
    let checkPhone = initialPhone
    if (!checkPhone && cleanId && typeof window !== "undefined") {
      checkPhone =
        localStorage.getItem("swadam_track_verified_" + cleanId) ||
        sessionStorage.getItem("swadam_track_verified_" + cleanId) ||
        ""
      if (checkPhone) {
        setPhone(checkPhone)
      }
    }

    const phoneValidation = validateIndianMobile(checkPhone)
    if (cleanId && phoneValidation.isValid) {
      const autoVerify = async () => {
        setLoading(true)
        setError("")
        try {
          const res = await fetch("/api/orders/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: cleanId, phone: phoneValidation.cleanPhone }),
          })
          const data = await res.json()
          if (!res.ok) {
            setError(data.error || "Verification failed. Please check your details.")
            return
          }
          try {
            localStorage.setItem("swadam_track_verified_" + cleanId, phoneValidation.cleanPhone)
            sessionStorage.setItem("swadam_track_verified_" + cleanId, phoneValidation.cleanPhone)
          } catch {}
          setOrder(data.order)
          setError("")
        } catch {
          setError("Failed to connect to the server. Please check your internet connection.")
        } finally {
          setLoading(false)
        }
      }
      autoVerify()
    }
  }, [initialOrderId, initialPhone])

  const handleVerify = async (e?: React.FormEvent, isSilentRefresh = false) => {
    if (e) e.preventDefault()

    const cleanId = orderId.trim().toUpperCase()
    const phoneValidation = validateIndianMobile(phone)

    if (!cleanId) {
      setError("Please enter your Order ID.")
      return
    }

    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || "Please enter a valid 10-digit mobile number.")
      return
    }

    const cleanPhone = phoneValidation.cleanPhone

    if (isSilentRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError("")

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cleanId, phone: cleanPhone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Verification failed. Please check your details.")
        return
      }

      try {
        localStorage.setItem("swadam_track_verified_" + cleanId, cleanPhone)
        sessionStorage.setItem("swadam_track_verified_" + cleanId, cleanPhone)
      } catch {}

      setOrder(data.order)
      setError("")
    } catch {
      setError("Failed to connect to the server. Please check your internet connection.")
    } finally {
      setLoading(false)
      if (isSilentRefresh) {
        setTimeout(() => setRefreshing(false), 500)
      }
    }
  }

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

  const handleReset = () => {
    setOrder(null)
    setError("")
  }

  const currentStageIdx = order ? getStageIndex(order.orderStatus, order.paymentStatus) : 0
  const isCancelled = order?.orderStatus === "cancelled"

  const whatsappMessage = order
    ? encodeURIComponent(`Namaste Swadam Foods! I am inquiring about my order *${order.id}* (Total: Rs. ${order.total}).`)
    : encodeURIComponent(`Namaste Swadam Foods! I need help tracking my order.`)

  return (
    <div className="ambient-bg min-h-screen pb-16 pt-4">
      <header className="sticky top-3 z-40 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="glass-header flex h-16 items-center justify-between gap-4 rounded-full px-4 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 sm:gap-3 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7]/90 p-1 shadow-sm ring-1 ring-white/60">
              <Image
                src="/images/swadam-logo.webp"
                alt="Swadam Foods"
                width={448}
                height={244}
                sizes="59px"
                priority
                className="h-8 w-auto shrink-0"
              />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-sm sm:text-base font-extrabold tracking-tight text-foreground truncate">
                Swadam Foods
              </span>
              <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase truncate">
                Order Tracking
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-white/60 dark:hover:bg-white/10 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        {!order ? (
          <div className="mx-auto max-w-lg space-y-6 pt-4">
            <div className="glass-card rounded-[2.5rem] border border-white/70 bg-white/70 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-stone-900/80">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Truck className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-heading text-2xl font-black text-foreground">Track Your Order</h1>
                  <p className="text-xs text-muted-foreground">Verify identity with your mobile number</p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Enter the Order ID from your receipt or confirmation message, along with the 10-digit mobile number used during checkout.
              </p>

              <form onSubmit={(e) => handleVerify(e)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="order-id" className="text-xs font-extrabold uppercase tracking-wide text-foreground">
                    Order ID
                  </label>
                  <div className="relative">
                    <input
                      id="order-id"
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                      placeholder="SWAD-1001 or SWAD-XXXX"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3.5 font-mono text-base sm:text-sm font-bold text-foreground placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950/50 dark:focus:bg-stone-950"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mobile-number" className="text-xs font-extrabold uppercase tracking-wide text-foreground">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>+91</span>
                    </span>
                    <input
                      id="mobile-number"
                      type="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 py-3.5 pl-16 pr-4 font-mono text-base sm:text-sm font-bold text-foreground placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950/50 dark:focus:bg-stone-950"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 touch-manipulation"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying details...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Verify &amp; Track Order</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800/80">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Protected verification</span>
                  </span>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary hover:underline"
                  >
                    Need Help? WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white/80 px-4 py-2 text-xs font-bold text-foreground shadow-sm hover:bg-white active:scale-95 transition dark:border-stone-800 dark:bg-stone-900/80"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Track another order</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerify(undefined, true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/80 px-4 py-2 text-xs font-bold text-foreground shadow-sm hover:bg-white active:scale-95 transition dark:border-stone-800 dark:bg-stone-900/80 disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
              </button>
            </div>

            <div className="glass-card rounded-[2.5rem] border border-white/70 bg-white/70 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-stone-900/80">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 pb-6 dark:border-stone-800/80">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
                      Verified Customer Order
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Authenticated</span>
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground">
                    Namaste, {order.customerName}!
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copyOrderId}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-foreground shadow-xs hover:bg-stone-50 active:scale-95 transition dark:border-stone-800 dark:bg-stone-950"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="font-mono">{order.id}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInvoiceOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition touch-manipulation"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Download Tax Invoice</span>
                  </button>
                </div>
              </div>

              {isCancelled ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Order Cancelled</h4>
                      <p className="text-xs mt-0.5">This order was cancelled. If you were charged, your refund will be processed promptly.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Preparation &amp; Delivery Progress
                    </h2>
                  </div>

                  <div className="relative">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {STAGES.map((stage, idx) => {
                        const Icon = stage.icon
                        const isDone = currentStageIdx > idx
                        const isCurrent = currentStageIdx === idx

                        return (
                          <div
                            key={stage.id}
                            className={`relative flex items-start gap-3 rounded-2xl border p-4 transition-all ${
                              isCurrent
                                ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20 dark:bg-amber-500/15"
                                : isDone
                                ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                                : "border-stone-200/60 bg-stone-50/40 text-stone-400 opacity-60 dark:border-stone-800 dark:bg-stone-900/20"
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isCurrent
                                  ? "bg-amber-500 text-white shadow-sm"
                                  : isDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground truncate">{stage.label}</p>
                                {isCurrent && (
                                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-300">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{stage.subtitle}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 grid gap-6 border-t border-stone-200/80 pt-6 dark:border-stone-800/80 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    Delivery Address
                  </h3>
                  <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/30">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-foreground">{order.customerName}</p>
                        <p className="text-muted-foreground">{order.customerAddress}</p>
                        <p className="font-mono text-muted-foreground">Pincode: {order.pincode}</p>
                        <p className="text-muted-foreground pt-1">
                          Phone: <span className="font-mono font-bold text-foreground">{order.customerPhoneMasked}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <PhonePeIcon className="h-6 w-6 shrink-0 rounded-md" />
                      <div className="text-xs">
                        <p className="font-bold text-foreground">PhonePe Payment Gateway</p>
                        <p className="text-[11px] text-muted-foreground">
                          {order.paymentStatus === "paid" ? "Payment Confirmed" : "Payment Verification Pending"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                        order.paymentStatus === "paid"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    Items in Order ({order.items.length})
                  </h3>
                  <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 divide-y divide-stone-200/60 dark:border-stone-800 dark:bg-stone-900/30 dark:divide-stone-800">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-xs">
                        <div>
                          <p className="font-bold text-foreground">{item.productName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.weight} &times; {item.quantity}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-foreground">₹{item.lineTotal}</span>
                      </div>
                    ))}

                    <div className="pt-3 mt-1 flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground">Subtotal</span>
                      <span className="font-mono font-bold text-foreground">₹{order.subtotal}</span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground">Delivery</span>
                      <span className="font-bold text-emerald-600">
                        {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                      </span>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-sm border-t border-stone-300 dark:border-stone-700">
                      <span className="font-extrabold text-foreground">Total Paid</span>
                      <span className="font-mono font-black text-foreground text-base">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 pt-6 dark:border-stone-800/80">
                {order.orderStatus === "delivered" && (
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
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-95 transition"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Reorder Same Items</span>
                  </button>
                )}

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Swadam Support</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-3 text-xs font-bold text-foreground shadow-xs hover:bg-stone-50 active:scale-95 transition dark:border-stone-700 dark:bg-stone-900"
                >
                  <FileText className="h-4 w-4" />
                  <span>View Full Tax Invoice</span>
                </button>
              </div>
            </div>

            {isInvoiceOpen && (
              <TaxInvoiceModal
                order={{
                  id: order.id,
                  customerName: order.customerName,
                  customerPhoneMasked: order.customerPhoneMasked,
                  customerAddress: order.customerAddress,
                  pincode: order.pincode,
                  deliveryMethod: order.deliveryMethod,
                  subtotal: order.subtotal,
                  deliveryFee: order.deliveryFee,
                  total: order.total,
                  currency: order.currency,
                  paymentStatus: order.paymentStatus,
                  orderStatus: order.orderStatus,
                  createdAt: order.createdAt,
                  items: order.items,
                }}
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

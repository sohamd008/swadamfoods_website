"use client"

import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Loader2,
  LockKeyhole,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  Wifi,
  WifiOff,
  X,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { WHATSAPP_NUMBER } from "@/lib/products"
import { sanitizePhone, validateIndianMobile } from "@/lib/phone"
import { PhonePeIcon, PhonePeLogo, PhonePeSecurityBadge } from "@/components/phonepe-logo"

declare global {
  interface Window {
    PhonePeCheckout?: {
      transact: (options: {
        tokenUrl: string
        callback?: (response: "USER_CANCEL" | "CONCLUDED") => void
        type?: "IFRAME" | "REDIRECT"
      }) => void
      closePage?: () => void
    }
  }
}

type DeliveryMethod = "pune" | "porter"
type SubmitState = "idle" | "submitting" | "success" | "error"
type PaymentState = "idle" | "opening" | "paying" | "paid" | "failed"

type OrderResponse = {
  orderId: string
  currency: string
  subtotal: number
  deliveryFee: number
  total: number
  paymentStatus: string
  orderStatus: string
}

type PaymentResponse = {
  orderId: string
  gateway: "phonepe"
  redirectUrl: string
  expiresAt: number
}

type PaymentStatusResponse = {
  orderId: string
  state: string
  paymentStatus: string
  transactionId?: string | null
  paymentMode?: string | null
}

function friendlyError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The connection took too long. Please check your internet and try again."
  }

  return error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again."
}

export function CheckoutPage() {
  const router = useRouter()
  const { items, totalItems, totalPrice, setQuantity, removeItem, clear } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [pincode, setPincode] = useState("")
  const [delivery, setDelivery] = useState<DeliveryMethod>("pune")
  const [isOnline, setIsOnline] = useState(true)
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [phonePeReady, setPhonePeReady] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [paymentState, setPaymentState] = useState<PaymentState>("idle")
  const [error, setError] = useState("")
  const [paymentMessage, setPaymentMessage] = useState("")
  const [lastRedirectUrl, setLastRedirectUrl] = useState("")
  const [showCancelledModal, setShowCancelledModal] = useState(false)
  const [showMobileSummary, setShowMobileSummary] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const orderRef = useRef<OrderResponse | null>(null)
  const itemsRef = useRef(items)
  orderRef.current = order
  itemsRef.current = items

  const checkConnection = useCallback(async () => {
    if (typeof window === "undefined") return false

    setCheckingConnection(true)

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`/api/health?check=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })
      window.clearTimeout(timeout)

      if (!response.ok) throw new Error(`Health check failed (${response.status}).`)

      setIsOnline(true)
      return true
    } catch {
      setIsOnline(false)
      return false
    } finally {
      setCheckingConnection(false)
    }
  }, [])

  const refreshPaymentStatus = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/payments/phonepe/status?orderId=${encodeURIComponent(orderId)}`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
      const payload = (await response.json().catch(() => null)) as PaymentStatusResponse | { error?: string } | null

      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error || "Payment status check failed." : "Payment status check failed.")
      }

      const status = payload as PaymentStatusResponse
      if (status.paymentStatus === "paid" || status.state === "COMPLETED") {
        setPaymentState("paid")
        setSubmitState("success")
        const currentOrder = orderRef.current
        const currentItems = itemsRef.current
        if (currentOrder) {
          trackEvent("purchase", {
            transaction_id: currentOrder.orderId,
            currency: currentOrder.currency || "INR",
            value: currentOrder.total,
            items: currentItems.map((item) => ({
              item_id: item.product.id,
              item_name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              item_brand: "Swadam Foods",
            })),
          })
        }
        clear()
        return "paid" as const
      }

      if (status.paymentStatus === "failed" || status.paymentStatus === "expired" || status.state === "FAILED" || status.state === "EXPIRED" || status.state === "USER_CANCEL") {
        setPaymentState("failed")
        setPaymentMessage("The payment was not completed. Your order is still safe, and you can try again.")
        setShowCancelledModal(true)
        return "failed" as const
      }

      return "pending" as const
    } catch (statusError) {
      console.error("PhonePe status check failed:", statusError)
      return "unknown" as const
    }
  }, [clear])

  const openPhonePePayment = useCallback(async (redirectUrl: string, orderId: string) => {
    setPaymentState("opening")
    setPaymentMessage("")
    setLastRedirectUrl(redirectUrl)

    if (!redirectUrl) {
      setPaymentState("failed")
      setPaymentMessage("Secure payment could not be started. Please try again.")
      setShowCancelledModal(true)
      return
    }

    const isMobile =
      typeof window !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768 ||
        ("ontouchstart" in window && window.innerWidth < 1024))

    if (isMobile) {
      setPaymentState("paying")
      setPaymentMessage("Opening PhonePe Payment Gateway...")
      window.location.href = redirectUrl
      return
    }

    const startedAt = Date.now()
    while (!window.PhonePeCheckout?.transact && Date.now() - startedAt < 4000) {
      await new Promise((resolve) => window.setTimeout(resolve, 100))
    }

    if (!window.PhonePeCheckout?.transact) {
      setPaymentState("paying")
      setPaymentMessage("Opening PhonePe Payment Gateway...")
      window.location.href = redirectUrl
      return
    }

    setPaymentState("paying")

    try {
      window.PhonePeCheckout.transact({
        tokenUrl: redirectUrl,
        type: "IFRAME",
        callback: async (response) => {
          if (response === "USER_CANCEL") {
            setPaymentState("idle")
            setPaymentMessage("Payment cancelled. Your order is still here whenever you're ready.")
            setShowCancelledModal(true)
            return
          }

          const cleanId = orderId.replace(/-P[A-Z0-9]+$/i, "").trim()
          for (let attempt = 0; attempt < 10; attempt += 1) {
            const result = await refreshPaymentStatus(cleanId)
            if (result === "paid") {
              clear()
              router.replace(`/order/${encodeURIComponent(cleanId)}`)
              return
            }
            if (result === "failed") return
            await new Promise((resolve) => window.setTimeout(resolve, 1500))
          }

          clear()
          router.replace(`/order/${encodeURIComponent(cleanId)}`)
        },
      })
    } catch (sdkError) {
      console.error("PhonePe SDK failed to open in iframe, redirecting directly:", sdkError)
      window.location.href = redirectUrl
    }
  }, [clear, refreshPaymentStatus, router])

  useEffect(() => {
    const handleOnline = () => void checkConnection()
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    void checkConnection()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [checkConnection])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackOrderId = params.get("orderId")
    const payment = params.get("payment")
    if (payment === "phonepe" && callbackOrderId) {
      const cleanId = callbackOrderId.replace(/-P[A-Z0-9]+$/i, "").trim()
      void (async () => {
        setPaymentState("paying")
        setPaymentMessage("Verifying payment with PhonePe Payment Gateway...")
        for (let attempt = 0; attempt < 10; attempt += 1) {
          const result = await refreshPaymentStatus(cleanId)
          if (result === "paid") {
            clear()
            router.replace(`/order/${encodeURIComponent(cleanId)}`)
            return
          }
          if (result === "failed") {
            setPaymentState("failed")
            setPaymentMessage("Payment was not completed. Your order is safe and you can try again.")
            setShowCancelledModal(true)
            return
          }
          await new Promise((resolve) => window.setTimeout(resolve, 1500))
        }

        clear()
        router.replace(`/order/${encodeURIComponent(cleanId)}`)
      })()
    }
  }, [clear, refreshPaymentStatus, router])

  const subtotal = useMemo(() => totalPrice, [totalPrice])
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  const isSubmittingOrPaying = submitState === "submitting" || paymentState === "opening" || paymentState === "paying"
  const canSubmitOrder = !isSubmittingOrPaying && isOnline && items.length > 0

  const whatsappHref = useMemo(() => {
    const lines = [
      "Hello Swadam Foods! I'd like to confirm my order:",
      "",
      ...items.map(
        (item, index) =>
          `${index + 1}. ${item.product.name} (${item.product.weight}) x${item.quantity} - Rs. ${item.product.price * item.quantity}`,
      ),
      "",
      `Subtotal: Rs. ${subtotal}`,
      delivery === "pune"
        ? "Delivery: Home delivery in Pune (FREE)"
        : "Delivery: Outside Pune via Porter (charges to be confirmed)",
      `Name: ${name.trim()}`,
      `Phone: ${sanitizePhone(phone)}`,
      `Address: ${address.trim()}, ${pincode.trim()}`,
      order ? `Order ID: ${order.orderId}` : "",
    ].filter(Boolean)

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`
  }, [address, delivery, items, name, order, phone, pincode, subtotal])

  function validate() {
    const nextErrors: Record<string, string> = {}
    const cleanName = name.trim()
    const cleanAddress = address.trim()
    const cleanPincode = pincode.trim()

    if (items.length === 0) nextErrors.items = "Your cart is empty."
    if (cleanName.length < 2 || cleanName.length > 80) nextErrors.name = "Enter your name (2–80 characters)."
    const phoneCheck = validateIndianMobile(phone)
    if (!phoneCheck.isValid) nextErrors.phone = phoneCheck.error || "Enter a valid 10-digit mobile number."
    if (cleanAddress.length < 8 || cleanAddress.length > 240) nextErrors.address = "Enter a complete delivery address."
    if (!/^\d{6}$/.test(cleanPincode)) nextErrors.pincode = "Enter a valid 6-digit pincode."

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function startPhonePePayment(orderId: string) {
    setError("")

    if (!isOnline) {
      setError("Please reconnect before starting the payment.")
      return
    }

    if (!phonePeReady || !window.PhonePeCheckout?.transact) {
      setPaymentState("failed")
      setPaymentMessage("Secure payment is still loading. Please wait a moment and try again.")
      return
    }

    setPaymentState("opening")
    setSubmitState("submitting")

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 15000)
      const response = await fetch("/api/payments/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({ orderId }),
      })
      window.clearTimeout(timeout)

      const payload = (await response.json().catch(() => null)) as PaymentResponse | { error?: string } | null
      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error || "Unable to start payment." : "Unable to start payment.")
      }

      const payment = payload as PaymentResponse
      setSubmitState("idle")
      await openPhonePePayment(payment.redirectUrl, orderId)
    } catch (requestError) {
      console.error("PhonePe initiation failed:", requestError)
      setSubmitState("idle")
      setPaymentState("failed")
      setPaymentMessage(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "We couldn't start the secure payment right now. Please try again.",
      )
    }
  }

  async function submitOrder() {
    setError("")
    setPaymentMessage("")

    if (order) {
      await startPhonePePayment(order.orderId)
      return
    }

    if (!validate()) {
      setSubmitState("error")
      return
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setIsOnline(false)
      setError("You're offline or Swadam Foods could not be reached. Please reconnect and try again.")
      setSubmitState("error")
      return
    }

    setSubmitState("submitting")

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 12000)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          customer: {
            name: name.trim(),
            phone: sanitizePhone(phone),
            address: address.trim(),
            pincode: pincode.trim(),
          },
          delivery,
        }),
      })
      window.clearTimeout(timeout)

      const payload = (await response.json().catch(() => null)) as (OrderResponse & { items?: unknown[] }) | { error?: string } | null
      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error || `Request failed (${response.status}).` : `Request failed (${response.status}).`)
      }

      const createdOrder = payload as OrderResponse
      setOrder(createdOrder)
      try {
        const cleanCustPhone = sanitizePhone(phone)
        if (cleanCustPhone) {
          localStorage.setItem("swadam_track_verified_" + createdOrder.orderId, cleanCustPhone)
          sessionStorage.setItem("swadam_track_verified_" + createdOrder.orderId, cleanCustPhone)
        }
      } catch {}
      trackEvent("begin_checkout", {
        currency: createdOrder.currency,
        value: createdOrder.total,
        items: items.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      })

      await startPhonePePayment(createdOrder.orderId)
    } catch (requestError) {
      console.error("Checkout submission failed:", requestError)
      setSubmitState("error")
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "We couldn't create your order right now. Please try again.",
      )
    }
  }

  if (submitState === "success" && order) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
          <section className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_30px_90px_rgba(67,48,22,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/20 sm:p-10">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-accent/30 bg-accent/15 text-accent shadow-inner">
                <Check className="h-8 w-8" aria-hidden="true" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent">Payment confirmed</p>
              <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">The good stuff is officially on its way. ✨</h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                Order <span className="font-semibold text-foreground">{order.orderId}</span> has been paid successfully for ₹{order.total.toLocaleString("en-IN")}.
              </p>
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
                <div className="glass-panel rounded-2xl p-4 text-left"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p><p className="mt-1 text-sm font-bold text-foreground">Paid</p></div>
                <div className="glass-panel rounded-2xl p-4 text-left"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</p><p className="mt-1 text-sm font-bold text-foreground">{totalItems}</p></div>
                <div className="glass-panel rounded-2xl p-4 text-left"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p><p className="mt-1 text-sm font-bold text-foreground">₹{order.total.toLocaleString("en-IN")}</p></div>
              </div>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Link
                  href={"/order/" + order.orderId}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <Package className="h-4 w-4" aria-hidden="true" />
                  <span>Track Live Order</span>
                </Link>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent/90 px-5 py-3 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/15 transition-transform hover:-translate-y-0.5 active:scale-[0.99]">
                  Message us on WhatsApp<ChevronRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link href="/" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/35 px-5 py-3 text-sm font-bold text-foreground backdrop-blur-xl transition-colors hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">Back to Store</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-shell min-h-screen px-4 py-5 sm:px-6 sm:py-8 pb-36 sm:pb-28 lg:pb-8">
      <Script
        src="https://mercury.phonepe.com/web/bundle/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setPhonePeReady(true)}
        onError={() => setPhonePeReady(false)}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/35 px-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Back to shop
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {isOnline ? <Wifi className="h-4 w-4 text-accent" aria-hidden="true" /> : <WifiOff className="h-4 w-4 text-destructive" aria-hidden="true" />}
            <span>{checkingConnection ? "Checking…" : isOnline ? "Secure connection" : "Offline"}</span>
          </div>
        </div>

        {!isOnline && (
          <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-foreground backdrop-blur-xl">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="flex-1"><p className="font-bold">Looks like you lost your connection.</p><p className="mt-0.5 text-muted-foreground">No worries — your cart is safe on this device. Reconnect before placing the order.</p></div>
            <button type="button" onClick={() => void checkConnection()} disabled={checkingConnection} className="rounded-full border border-border/70 bg-background/50 px-3 py-2 text-xs font-bold text-foreground disabled:cursor-wait disabled:opacity-60">{checkingConnection ? "Checking…" : "Retry"}</button>
          </div>
        )}

        <div className="mb-5 rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/20 lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-foreground">Order summary</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Tap to {showMobileSummary ? "hide" : "view"} items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-heading text-lg font-black text-foreground">
                ₹{total.toLocaleString("en-IN")}
              </span>
              <ChevronRight
                className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                  showMobileSummary ? "rotate-90" : ""
                }`}
                aria-hidden="true"
              />
            </div>
          </button>

          {showMobileSummary && (
            <div className="mt-4 border-t border-border/60 pt-4 space-y-3">
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.product.id} className="glass-panel flex items-center justify-between gap-3 rounded-2xl p-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.product.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.product.weight} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground shrink-0">₹{item.product.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-2 text-xs font-semibold text-muted-foreground">
                <span>Delivery ({delivery === "pune" ? "Pune" : "Porter"})</span>
                <span className="text-foreground">{delivery === "pune" ? "Free" : "Confirmed later"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Swadam Foods</p><span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">Secure Checkout</span></div>
                <h1 className="mt-1 font-heading font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Checkout</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Provide your delivery address below to complete your order.</p>
              </div>
              <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/50 sm:flex"><LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" /></div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={name}
                onChange={(val) => {
                  setName(val)
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }))
                }}
                placeholder="Your name"
                error={fieldErrors.name}
                autoComplete="name"
              />
              <Field
                label="Phone number"
                value={phone}
                onChange={(val) => {
                  setPhone(sanitizePhone(val))
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }))
                }}
                placeholder="10-digit mobile number"
                error={fieldErrors.phone}
                autoComplete="tel"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
              <Field
                label="Delivery address"
                value={address}
                onChange={(val) => {
                  setAddress(val)
                  if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: "" }))
                }}
                placeholder="House / street, area, city"
                error={fieldErrors.address}
                autoComplete="street-address"
                multiline
              />
              <Field
                label="Pincode"
                value={pincode}
                onChange={(value) => {
                  setPincode(value.replace(/\D/g, "").slice(0, 6))
                  if (fieldErrors.pincode) setFieldErrors((prev) => ({ ...prev, pincode: "" }))
                }}
                placeholder="411041"
                error={fieldErrors.pincode}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <div className="mt-7"><div className="mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" /><h2 className="text-sm font-bold text-foreground">Delivery Method</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DeliveryCard selected={delivery === "pune"} icon={<Package className="h-5 w-5" aria-hidden="true" />} title="Home delivery in Pune" detail="FREE" note="Fresh kitchen dispatch with free home delivery across Pune." onClick={() => setDelivery("pune")} />
                <DeliveryCard selected={delivery === "porter"} icon={<Truck className="h-5 w-5" aria-hidden="true" />} title="Outside Pune" detail="Porter" note="Delivery charge is confirmed before dispatch." onClick={() => setDelivery("porter")} />
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-foreground">Secure Payment Gateway</h2>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1 border border-purple-500/20 text-[#5F259F] dark:text-purple-300">
                  <PhonePeIcon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">PhonePe Payment Gateway</span>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/25 bg-card p-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5F259F] text-white shadow-xs">
                    <PhonePeIcon className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">PhonePe Payment Gateway</p>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                            100% Verified
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          Pay directly with UPI (PhonePe, Google Pay, Paytm, BHIM), Credit/Debit Cards, or NetBanking.
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                        RBI Authorized
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground">PhonePe</span>
                      <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground">Google Pay</span>
                      <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground">Paytm</span>
                      <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground">BHIM UPI</span>
                      <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground">Visa / Mastercard / RuPay</span>
                      <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground">NetBanking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {paymentMessage && (
              <div role="status" className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${paymentState === "failed" ? "border-destructive/20 bg-destructive/8" : "border-primary/20 bg-primary/5"}`}>
                {paymentState === "failed" ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" /> : <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
                <p className="flex-1 leading-5 text-muted-foreground">{paymentMessage}</p>
                <button type="button" onClick={() => setPaymentMessage("")} className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Dismiss message"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            )}

            {error && (<div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" /><div className="flex-1"><p className="font-bold text-foreground">We couldn't complete that</p><p className="mt-0.5 text-muted-foreground">{error}</p></div><button type="button" onClick={() => setError("")} className="text-xs font-bold text-muted-foreground hover:text-foreground">Dismiss</button></div>)}

            <div className="mt-7 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-950/40"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /><p className="text-xs leading-5 text-foreground"><span className="font-semibold">Your payment is protected.</span> We never ask for your UPI PIN, OTP, CVV or net banking password.</p></div>
              <div className="hidden sm:flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-md items-start gap-2 text-xs leading-5 text-muted-foreground"><p>Orders are dispatched fresh from our kitchen. You will receive tracking details immediately.</p></div>
                <button
                  type="button"
                  onClick={() => void submitOrder()}
                  disabled={!canSubmitOrder}
                  className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingOrPaying ? (
                    <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />{paymentState === "paying" ? "Opening PhonePe Payment Gateway…" : "Preparing PhonePe Payment Gateway…"}</>
                  ) : (
                    <>
                      <PhonePeIcon className="h-5 w-5 shrink-0 rounded-md" />
                      <span>{`Pay Now · ₹${total.toLocaleString("en-IN")}`}</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block h-fit rounded-2xl border border-border bg-card p-5 shadow-sm sticky top-24">
            <div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" /><h2 className="font-heading font-serif text-xl font-bold text-foreground">Order Summary</h2><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{totalItems}</span></div>
            {items.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center"><p className="text-sm font-semibold text-foreground">Your cart is empty</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Add something delicious before checking out.</p><Link href="/#products" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Browse products</Link></div> : <>
              <ul className="mt-5 space-y-3">{items.map((item) => <li key={item.product.id} className="rounded-xl border border-border/70 bg-secondary/30 p-3"><div className="flex gap-3"><Image src={item.product.image || "/placeholder.svg"} alt={item.product.name} width={64} height={64} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-heading font-serif font-bold leading-tight text-foreground">{item.product.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.product.weight} · ₹{item.product.price}</p><div className="mt-2 flex items-center justify-between gap-3"><div className="flex items-center rounded-lg border border-border/80 bg-background p-0.5"><button type="button" onClick={() => setQuantity(item.product.id, item.quantity - 1)} className="h-7 w-7 rounded-md text-base font-bold text-foreground hover:bg-secondary" aria-label={`Decrease ${item.product.name} quantity`}>−</button><span className="min-w-7 text-center text-xs font-bold text-foreground">{item.quantity}</span><button type="button" onClick={() => setQuantity(item.product.id, Math.min(item.quantity + 1, 99))} className="h-7 w-7 rounded-md text-base font-bold text-foreground hover:bg-secondary" aria-label={`Increase ${item.product.name} quantity`}>+</button></div><button type="button" onClick={() => removeItem(item.product.id)} className="text-[11px] font-semibold text-muted-foreground hover:text-destructive">Remove</button></div></div></div></li>)}</ul>
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm"><div className="flex items-center justify-between text-muted-foreground"><span>Subtotal</span><span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span></div><div className="flex items-center justify-between text-muted-foreground"><span>Delivery</span><span className="font-semibold text-foreground">{delivery === "pune" ? "Free" : "Added later"}</span></div><div className="flex items-end justify-between border-t border-border pt-3"><span className="text-sm font-bold text-foreground">Total</span><span className="font-heading font-serif text-3xl font-bold text-foreground">₹{total.toLocaleString("en-IN")}</span></div></div>
              <div className="mt-5 space-y-2.5 text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <PhonePeIcon className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground">Secured by PhonePe Payment Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>256-bit Bank-Grade SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>RBI-Authorized Merchant Checkout</span>
                </div>
              </div>
              {order && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs"><p className="font-bold text-foreground">Order {order.orderId}</p><p className="mt-0.5 text-muted-foreground">Your order is ready for secure payment.</p></div>}
            </>}
          </aside>
        </div>

        <div className="mobile-bottom-bar px-4 pt-3.5 lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total amount</span>
              <span className="font-heading font-serif text-2xl font-bold text-foreground">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button
              type="button"
              onClick={() => void submitOrder()}
              disabled={!canSubmitOrder}
              className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmittingOrPaying ? (
                <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {paymentState === "paying" ? "Opening PhonePe..." : "Processing..."}</>
              ) : (
                <>
                  <PhonePeIcon className="h-4 w-4 shrink-0 rounded-sm" />
                  <span>{`Pay Now · ₹${total.toLocaleString("en-IN")}`}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showCancelledModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancelled-dialog-title"
          onClick={() => setShowCancelledModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <CircleAlert className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 id="cancelled-dialog-title" className="mt-4 font-heading font-serif text-2xl font-bold text-foreground">
                Payment Cancelled
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {paymentMessage || "Your payment process was cancelled. Your order and cart items remain saved so you can try again whenever you are ready."}
              </p>

              {lastRedirectUrl && (
                <div className="mt-4 w-full rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 text-left">
                  <div className="flex items-center gap-2">
                    <PhonePeIcon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold text-foreground">Direct Payment Link</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    If your browser or mobile app blocked the payment popup, you can open PhonePe Payment Gateway directly:
                  </p>
                  <a
                    href={lastRedirectUrl}
                    className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5F259F] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-opacity"
                  >
                    <span>Open PhonePe Payment Gateway Directly</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelledModal(false)
                    void submitOrder()
                  }}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Payment Again
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelledModal(false)}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Review Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  inputMode,
  multiline = false,
  maxLength,
  pattern,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  autoComplete?: string
  inputMode?: "text" | "tel" | "numeric"
  multiline?: boolean
  maxLength?: number
  pattern?: string
  type?: string
}) {
  const id = `checkout-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-foreground">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-24 resize-none rounded-xl border bg-background px-4 py-3.5 text-base sm:text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/60 touch-manipulation ${
            error ? "border-destructive ring-1 ring-destructive" : "border-input hover:border-border focus:border-primary focus:ring-1 focus:ring-primary"
          }`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          pattern={pattern}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-13 rounded-xl border bg-background px-4 py-3.5 text-base sm:text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/60 touch-manipulation ${
            error ? "border-destructive ring-1 ring-destructive" : "border-input hover:border-border focus:border-primary focus:ring-1 focus:ring-primary"
          }`}
        />
      )}
      {error && (
        <span id={`${id}-error`} className="text-xs font-semibold text-destructive">
          {error}
        </span>
      )}
    </label>
  )
}

function DeliveryCard({ selected, icon, title, detail, note, onClick }: { selected: boolean; icon: React.ReactNode; title: string; detail: string; note: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border p-4 text-left transition-all touch-manipulation active:scale-[0.99] ${
        selected
          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
          : "border-border bg-card hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-foreground">{title}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${selected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
              {detail}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{note}</span>
        </span>
      </div>
    </button>
  )
}

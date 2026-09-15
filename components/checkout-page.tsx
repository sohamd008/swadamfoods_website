"use client"

import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
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
import { PhonePeIcon } from "@/components/phonepe-logo"

declare global {
  interface Window {
    PhonePeCheckout?: {
      transact: (options: {
        tokenUrl: string
        callback?: (response: "USER_CANCEL" | "CONCLUDED") => void
        type?: "IFRAME" | "REDIRECT"
      }) => void
    }
  }
}

type DeliveryMethod = "pune" | "porter"
type ToastType = "info" | "success" | "error"

type Toast = {
  type: ToastType
  message: string
}

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

function showableError(error: unknown, fallback: string) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The request took too long. Please check your connection and try again."
  }
  return error instanceof Error && error.message ? error.message : fallback
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
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const toastTimer = useRef<number | null>(null)
  const orderRef = useRef<OrderResponse | null>(null)
  const itemsRef = useRef(items)
  orderRef.current = order
  itemsRef.current = items

  const notify = useCallback((type: ToastType, message: string, duration = 5000) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = window.setTimeout(() => setToast(null), duration)
  }, [])

  const checkConnection = useCallback(async () => {
    setCheckingConnection(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 5000)
    try {
      const response = await fetch(`/api/health?check=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })
      if (!response.ok) throw new Error(`Connection check failed (${response.status}).`)
      setIsOnline(true)
      return true
    } catch {
      setIsOnline(false)
      return false
    } finally {
      window.clearTimeout(timeout)
      setCheckingConnection(false)
    }
  }, [])

  const pollPayment = useCallback(async (orderId: string) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 8000)
      try {
        const response = await fetch(`/api/payments/phonepe/status?orderId=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        const payload = (await response.json().catch(() => null)) as PaymentStatusResponse | { error?: string } | null
        if (!response.ok) throw new Error(payload && "error" in payload ? payload.error || "Payment verification failed." : "Payment verification failed.")

        const status = payload as PaymentStatusResponse
        if (status.paymentStatus === "paid" || status.state === "COMPLETED") {
          const currentOrder = orderRef.current
          if (currentOrder) {
            trackEvent("purchase", {
              transaction_id: currentOrder.orderId,
              currency: currentOrder.currency || "INR",
              value: currentOrder.total,
              items: itemsRef.current.map((item) => ({
                item_id: item.product.id,
                item_name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                item_brand: "Swadam Foods",
              })),
            })
          }
          clear()
          notify("success", "Payment confirmed. Your order is now being prepared.", 4500)
          router.replace(`/order/${encodeURIComponent(orderId)}`)
          return "paid" as const
        }

        if (status.paymentStatus === "failed" || status.paymentStatus === "expired" || status.state === "FAILED" || status.state === "EXPIRED") {
          notify("error", "Payment was not completed. Your order is still safe — you can try again.", 7000)
          return "failed" as const
        }
      } catch (error) {
        if (attempt === 11) {
          console.error("PhonePe status check failed:", error)
          notify("error", "We are still confirming the payment. Your order has not been marked paid yet. Please check again in a moment.", 8000)
          return "unknown" as const
        }
      } finally {
        window.clearTimeout(timeout)
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1500))
    }

    return "unknown" as const
  }, [clear, notify, router])

  const openPhonePe = useCallback(async (redirectUrl: string, orderId: string) => {
    if (!redirectUrl) {
      notify("error", "Secure payment could not be started. Please try again.", 6000)
      return
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768

    if (isMobile) {
      notify("info", "Opening secure PhonePe payment…", 3000)
      window.location.href = redirectUrl
      return
    }

    const startedAt = Date.now()
    while (!window.PhonePeCheckout?.transact && Date.now() - startedAt < 4000) {
      await new Promise((resolve) => window.setTimeout(resolve, 100))
    }

    if (!window.PhonePeCheckout?.transact) {
      notify("info", "Opening PhonePe securely…", 3000)
      window.location.href = redirectUrl
      return
    }

    try {
      window.PhonePeCheckout.transact({
        tokenUrl: redirectUrl,
        type: "IFRAME",
        callback: (response) => {
          if (response === "USER_CANCEL") {
            notify("info", "Payment cancelled. Your order is still safe and ready whenever you are.", 6000)
            return
          }
          notify("info", "Payment submitted. Confirming your payment securely…", 5000)
          void pollPayment(orderId)
        },
      })
    } catch (error) {
      console.error("PhonePe SDK failed, using direct payment link:", error)
      window.location.href = redirectUrl
    }
  }, [notify, pollPayment])

  const startPhonePePayment = useCallback(async (orderId: string) => {
    if (!isOnline) {
      notify("error", "Please reconnect to the internet before paying.")
      return
    }

    setBusy(true)
    notify("info", phonePeReady ? "Preparing secure payment…" : "Connecting to secure payment…", 3000)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch("/api/payments/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({ orderId }),
      })
      const payload = (await response.json().catch(() => null)) as PaymentResponse | { error?: string } | null
      if (!response.ok) throw new Error(payload && "error" in payload ? payload.error || "Unable to start payment." : "Unable to start payment.")
      await openPhonePe((payload as PaymentResponse).redirectUrl, orderId)
    } catch (error) {
      console.error("PhonePe initiation failed:", error)
      notify("error", showableError(error, "We couldn't start the secure payment. Please try again."), 7000)
    } finally {
      window.clearTimeout(timeout)
      setBusy(false)
    }
  }, [isOnline, notify, openPhonePe, phonePeReady])

  useEffect(() => {
    const onOnline = () => void checkConnection()
    const onOffline = () => setIsOnline(false)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    void checkConnection()
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [checkConnection])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackOrderId = params.get("orderId")
    if (params.get("payment") !== "phonepe" || !callbackOrderId) return

    notify("info", "Confirming your PhonePe payment…", 6000)
    void pollPayment(callbackOrderId.replace(/-P[A-Z0-9]+$/i, "").trim().toUpperCase())
  }, [notify, pollPayment])

  const subtotal = totalPrice
  const total = subtotal
  const canPay = !busy && isOnline && items.length > 0

  const whatsappHref = useMemo(() => {
    const lines = [
      "Hello Swadam Foods! I'd like to confirm my order:",
      "",
      ...items.map((item, index) => `${index + 1}. ${item.product.name} (${item.product.weight}) x${item.quantity} - Rs. ${item.product.price * item.quantity}`),
      "",
      `Total: Rs. ${subtotal}`,
      delivery === "pune" ? "Delivery: Pune (FREE)" : "Delivery: Outside Pune (charges to be confirmed)",
      `Name: ${name.trim()}`,
      `Phone: ${sanitizePhone(phone)}`,
      `Address: ${address.trim()}, ${pincode.trim()}`,
      order ? `Order ID: ${order.orderId}` : "",
    ].filter(Boolean)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`
  }, [address, delivery, items, name, order, phone, pincode, subtotal])

  const validate = useCallback(() => {
    const next: Record<string, string> = {}
    const cleanName = name.trim()
    const cleanAddress = address.trim()
    const cleanPincode = pincode.trim()
    const phoneCheck = validateIndianMobile(phone)
    if (items.length === 0) next.items = "Your cart is empty."
    if (cleanName.length < 2 || cleanName.length > 80) next.name = "Enter your name (2–80 characters)."
    if (!phoneCheck.isValid) next.phone = phoneCheck.error || "Enter a valid mobile number."
    if (cleanAddress.length < 8 || cleanAddress.length > 240) next.address = "Enter a complete delivery address."
    if (!/^\d{6}$/.test(cleanPincode)) next.pincode = "Enter a valid 6-digit pincode."
    setFieldErrors(next)
    if (Object.keys(next).length) {
      notify("error", "Please fix the highlighted details before paying.", 5000)
      return false
    }
    return true
  }, [address, items, name, notify, phone, pincode])

  const submitOrder = useCallback(async () => {
    if (order) {
      await startPhonePePayment(order.orderId)
      return
    }

    if (!validate()) return
    if (!(await checkConnection())) {
      notify("error", "We couldn't reach Swadam Foods. Please reconnect and try again.", 6500)
      return
    }

    setBusy(true)
    notify("info", "Creating your order…", 3000)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12000)
    try {
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
      const payload = (await response.json().catch(() => null)) as OrderResponse | { error?: string } | null
      if (!response.ok) throw new Error(payload && "error" in payload ? payload.error || `Request failed (${response.status}).` : `Request failed (${response.status}).`)

      const createdOrder = payload as OrderResponse
      setOrder(createdOrder)
      try {
        const verifiedPhone = sanitizePhone(phone)
        if (verifiedPhone) {
          localStorage.setItem(`swadam_track_verified_${createdOrder.orderId}`, verifiedPhone)
          sessionStorage.setItem(`swadam_track_verified_${createdOrder.orderId}`, verifiedPhone)
        }
      } catch {}

      trackEvent("begin_checkout", {
        currency: createdOrder.currency,
        value: createdOrder.total,
        items: items.map((item) => ({ item_id: item.product.id, item_name: item.product.name, price: item.product.price, quantity: item.quantity })),
      })

      orderRef.current = createdOrder
      await startPhonePePayment(createdOrder.orderId)
    } catch (error) {
      console.error("Checkout submission failed:", error)
      notify("error", showableError(error, "We couldn't create your order right now. Please try again."), 7000)
    } finally {
      window.clearTimeout(timeout)
      setBusy(false)
    }
  }, [address, checkConnection, delivery, items, name, notify, order, phone, pincode, startPhonePePayment, validate])

  return (
    <main className="checkout-shell min-h-screen px-4 py-5 pb-36 sm:px-6 sm:py-8 lg:pb-8">
      <Script
        src="https://mercury.phonepe.com/web/bundle/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setPhonePeReady(true)}
        onError={() => setPhonePeReady(false)}
      />

      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className="fixed inset-x-0 top-3 z-[1000] flex justify-center px-3 sm:top-5 sm:px-4"
        >
          <div className={`flex w-full max-w-xl items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-2xl ${
            toast.type === "error"
              ? "border-destructive/25 bg-destructive/10"
              : toast.type === "success"
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-primary/20 bg-card/90"
          }`}>
            {toast.type === "error" ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" /> : toast.type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> : <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">{toast.message}</p>
            <button type="button" onClick={() => setToast(null)} className="rounded-full p-1 text-muted-foreground hover:bg-secondary" aria-label="Dismiss message"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur-xl hover:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Back to shop
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {isOnline ? <Wifi className="h-4 w-4 text-accent" aria-hidden="true" /> : <WifiOff className="h-4 w-4 text-destructive" aria-hidden="true" />}
            <span>{checkingConnection ? "Checking…" : isOnline ? "Secure connection" : "Offline"}</span>
          </div>
        </div>

        {!isOnline && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-foreground backdrop-blur-xl">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="min-w-0 flex-1"><p className="font-bold">You're offline.</p><p className="mt-0.5 text-muted-foreground">Your cart is safe. Reconnect before placing your order.</p></div>
            <button type="button" onClick={() => void checkConnection()} disabled={checkingConnection} className="rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-bold text-foreground disabled:opacity-60">{checkingConnection ? "Checking…" : "Retry"}</button>
          </div>
        )}

        <div className="mb-5 rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/20 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><ShoppingBag className="h-5 w-5" /></span><div className="min-w-0"><p className="text-sm font-extrabold text-foreground">Order summary</p><p className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "items"}</p></div></div>
            <span className="shrink-0 font-heading text-lg font-black text-foreground">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-white/70 bg-white/60 p-5 shadow-[0_24px_70px_rgba(67,48,22,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/20 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Swadam Foods</p><h1 className="mt-1 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Checkout</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">One calm final step between you and the good stuff.</p></div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/45 sm:flex dark:border-white/10 dark:bg-white/5"><LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" /></div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={name} onChange={setName} placeholder="Your name" error={fieldErrors.name} autoComplete="name" />
              <Field label="Phone number" value={phone} onChange={(value) => setPhone(sanitizePhone(value))} placeholder="10-digit mobile number" error={fieldErrors.phone} autoComplete="tel" inputMode="numeric" maxLength={10} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
              <Field label="Delivery address" value={address} onChange={setAddress} placeholder="House / street, area, city" error={fieldErrors.address} autoComplete="street-address" multiline />
              <Field label="Pincode" value={pincode} onChange={(value) => setPincode(value.replace(/\D/g, "").slice(0, 6))} placeholder="411041" error={fieldErrors.pincode} autoComplete="postal-code" inputMode="numeric" maxLength={6} />
            </div>

            <div className="mt-8"><div className="mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" /><h2 className="text-sm font-bold text-foreground">Delivery</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DeliveryCard selected={delivery === "pune"} icon={<Package className="h-5 w-5" />} title="Home delivery in Pune" detail="FREE" note="Fresh dispatch from our kitchen." onClick={() => setDelivery("pune")} />
                <DeliveryCard selected={delivery === "porter"} icon={<Truck className="h-5 w-5" />} title="Outside Pune" detail="Porter" note="Delivery charge confirmed before dispatch." onClick={() => setDelivery("porter")} />
              </div>
            </div>

            <div className="mt-8"><div className="mb-3 flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" aria-hidden="true" /><h2 className="text-sm font-bold text-foreground">Secure payment</h2></div>
              <div className="rounded-3xl border border-primary/20 bg-white/35 p-4 dark:bg-white/[0.04]"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><LockKeyhole className="h-5 w-5" /></span><div><p className="text-sm font-bold text-foreground">Payment handled securely by PhonePe</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Choose UPI, cards or NetBanking on the secure payment screen.</p><div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground"><span className="rounded-full bg-white/60 px-2.5 py-1 dark:bg-white/5">PhonePe</span><span className="rounded-full bg-white/60 px-2.5 py-1 dark:bg-white/5">UPI</span><span className="rounded-full bg-white/60 px-2.5 py-1 dark:bg-white/5">Cards</span><span className="rounded-full bg-white/60 px-2.5 py-1 dark:bg-white/5">NetBanking</span></div></div></div></div>
            </div>

            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/7 px-4 py-3"><ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" /><p className="text-xs leading-5 text-foreground"><span className="font-bold">Your payment is protected.</span> We never ask for your UPI PIN, OTP, CVV or banking password.</p></div>

            <div className="mt-7 hidden items-center justify-between gap-4 sm:flex"><p className="max-w-md text-xs leading-5 text-muted-foreground">Your cart stays with you until the payment is confirmed.</p><PayButton busy={busy} canPay={canPay} total={total} hasOrder={Boolean(order)} onClick={() => void submitOrder()} /></div>
          </section>

          <aside className="hidden h-fit rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_24px_70px_rgba(67,48,22,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-5 lg:block">
            <div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" /><h2 className="font-heading text-xl font-bold text-foreground">Your order</h2><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{totalItems}</span></div>
            {items.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center"><p className="text-sm font-bold">Your cart is empty</p><Link href="/#products" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground">Browse products</Link></div> : <><ul className="mt-5 space-y-3">{items.map((item) => <li key={item.product.id} className="rounded-2xl border border-border/70 bg-white/40 p-3 dark:bg-white/5"><div className="flex gap-3"><Image src={item.product.image || "/placeholder.svg"} alt={item.product.name} width={64} height={64} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-bold leading-tight text-foreground">{item.product.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.product.weight} · ₹{item.product.price}</p><div className="mt-2 flex items-center justify-between gap-3"><div className="flex items-center rounded-full border border-border/70 bg-background/30 p-0.5"><button type="button" onClick={() => setQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 rounded-full text-base font-bold hover:bg-secondary" aria-label={`Decrease ${item.product.name}`}>−</button><span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => setQuantity(item.product.id, Math.min(item.quantity + 1, 20))} className="h-8 w-8 rounded-full text-base font-bold hover:bg-secondary" aria-label={`Increase ${item.product.name}`}>+</button></div><button type="button" onClick={() => removeItem(item.product.id)} className="text-[11px] font-bold text-muted-foreground hover:text-destructive">Remove</button></div></div></div></li>)}</ul><div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span></div><div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="font-semibold text-foreground">{delivery === "pune" ? "Free" : "Added later"}</span></div><div className="flex items-end justify-between border-t border-border/60 pt-3"><span className="font-bold">Total</span><span className="font-heading text-3xl font-black">₹{total.toLocaleString("en-IN")}</span></div></div><div className="mt-5 space-y-2 text-xs text-muted-foreground"><div className="flex items-center gap-2"><PhonePeIcon className="h-4 w-4" /> Secure payment by PhonePe</div><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-accent" /> Payment details handled securely</div></div>{order && <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs"><p className="font-bold">Order {order.orderId}</p><p className="mt-0.5 text-muted-foreground">Ready for secure payment.</p></div>}</>}
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-card/90 px-4 py-3 backdrop-blur-xl dark:bg-card/95 lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}><div className="mx-auto flex max-w-md items-center gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p><p className="font-heading text-2xl font-black">₹{total.toLocaleString("en-IN")}</p></div><PayButton busy={busy} canPay={canPay} total={total} hasOrder={Boolean(order)} onClick={() => void submitOrder()} /></div></div>
      </div>
    </main>
  )
}

function PayButton({ busy, canPay, total, hasOrder, onClick }: { busy: boolean; canPay: boolean; total: number; hasOrder: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={!canPay} className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{busy ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Preparing payment…</> : <><PhonePeIcon className="h-5 w-5 rounded-md" /> {hasOrder ? "Pay securely" : `Pay securely · ₹${total.toLocaleString("en-IN")}`}<ChevronRight className="h-5 w-5" aria-hidden="true" /></>}</button>
}

function Field({ label, value, onChange, placeholder, error, autoComplete, inputMode, multiline = false, maxLength }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; error?: string; autoComplete?: string; inputMode?: "text" | "tel" | "numeric"; multiline?: boolean; maxLength?: number }) {
  const id = `checkout-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  return <label htmlFor={id} className="flex flex-col gap-1.5"><span className="text-sm font-bold text-foreground">{label}</span>{multiline ? <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} rows={3} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`min-h-24 resize-none rounded-2xl border bg-background px-4 py-3.5 text-base sm:text-sm outline-none transition-colors ${error ? "border-destructive ring-1 ring-destructive" : "border-input focus:border-primary focus:ring-1 focus:ring-primary"}`} /> : <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`min-h-13 rounded-2xl border bg-background px-4 py-3.5 text-base sm:text-sm outline-none transition-colors ${error ? "border-destructive ring-1 ring-destructive" : "border-input focus:border-primary focus:ring-1 focus:ring-primary"}`} />}{error && <span id={`${id}-error`} className="text-xs font-semibold text-destructive">{error}</span>}</label>
}

function DeliveryCard({ selected, icon, title, detail, note, onClick }: { selected: boolean; icon: React.ReactNode; title: string; detail: string; note: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={`rounded-3xl border p-4 text-left transition-all active:scale-[0.99] ${selected ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/30" : "border-border bg-card/60 hover:bg-secondary/50"}`}><div className="flex items-start gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{icon}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-foreground">{title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${selected ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{detail}</span></span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{note}</span></span></div></button>
}

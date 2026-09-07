"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  MessageCircle,
  Truck,
  PackageCheck,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { WHATSAPP_NUMBER } from "@/lib/products"
import { trackEvent } from "@/lib/analytics"

type DeliveryMethod = "pune" | "porter"

const deliveryOptions: {
  id: DeliveryMethod
  icon: typeof Truck
  title: string
  detail: string
  note: string
}[] = [
  {
    id: "pune",
    icon: PackageCheck,
    title: "Home delivery in Pune",
    detail: "FREE",
    note: "We deliver to your doorstep across Pune at no extra cost.",
  },
  {
    id: "porter",
    icon: Truck,
    title: "Outside Pune (via Porter)",
    detail: "Charges added later",
    note: "We'll book Porter and share the delivery charge with you on WhatsApp before dispatch.",
  },
]

export function CartDrawer() {
  const { items, isOpen, closeCart, totalItems, totalPrice, setQuantity, removeItem } =
    useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [delivery, setDelivery] = useState<DeliveryMethod>("pune")
  const asideRef = useRef<HTMLElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const activeOption = deliveryOptions.find((option) => option.id === delivery)!

  useEffect(() => {
    if (isOpen) {
      trackEvent("view_cart", {
        currency: "INR",
        value: totalPrice,
        items: items.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      })
      document.body.style.overflow = "hidden"
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus()
      }, 100)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ""
      }
    } else {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeCart()
        return
      }
      if (e.key === "Tab" && asideRef.current) {
        const focusable = asideRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeCart])

  function buildWhatsAppLink() {
    const lines = [
      "Hello Swadam Foods! I'd like to place an order:",
      "",
      ...items.map(
        (item, index) =>
          `${index + 1}. ${item.product.name} (${item.product.weight}) x${item.quantity} — ₹${item.product.price * item.quantity}`,
      ),
      "",
      `Subtotal: ₹${totalPrice}`,
      delivery === "pune"
        ? "Delivery: Home delivery in Pune (FREE)"
        : "Delivery: Outside Pune via Porter (charges to be confirmed)",
    ]
    if (name.trim()) lines.push("", `Name: ${name.trim()}`)
    if (phone.trim()) lines.push(`Phone: ${phone.trim()}`)
    if (address.trim()) lines.push(`Delivery address: ${address.trim()}`)

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      inert={!isOpen ? true : undefined}
    >
      {isOpen && (
        <div
          onClick={closeCart}
          className="absolute inset-0 bg-foreground/35 transition-opacity duration-200"
        />
      )}

      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/45 bg-background/88 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl will-change-transform transition-transform duration-200 ease-out sm:top-3 sm:right-3 sm:h-[calc(100%-1.5rem)] sm:rounded-[2rem] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/35 bg-white/25 px-5 py-4 dark:bg-black/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-bold text-foreground">
              Your order
            </h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/45 text-muted-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-background/70 hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/50 bg-white/35 shadow-inner backdrop-blur-xl dark:bg-white/10">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="font-heading text-lg font-bold text-foreground">
              Your cart is empty
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Add some snacks and premixes, then send your order to us on WhatsApp.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 rounded-full border border-primary/20 bg-primary/90 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      sizes="64px"
                      loading="lazy"
                      className="aspect-square h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-heading text-sm font-bold leading-tight text-foreground">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.product.weight} · ₹{item.product.price}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(item.product.id, item.quantity - 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
                            aria-label={`Decrease ${item.product.name} quantity`}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(item.product.id, item.quantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
                            aria-label={`Increase ${item.product.name} quantity`}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <span className="font-heading text-sm font-bold text-foreground">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-foreground">
                  Delivery option
                </p>
                <div className="flex flex-col gap-2.5">
                  {deliveryOptions.map(({ id, icon: Icon, title, detail, note }) => {
                    const selected = delivery === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDelivery(id)}
                        aria-pressed={selected}
                        className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
                      >
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-heading text-sm font-bold text-foreground">
                              {title}
                            </span>
                            <span
                              className={`shrink-0 text-xs font-bold uppercase tracking-wide ${id === "pune" ? "text-accent" : "text-primary"}`}
                            >
                              {detail}
                            </span>
                          </span>
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {note}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                  Your name <span className="text-muted-foreground">(optional)</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                  Phone number{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="e.g. 98765 43210"
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                  Delivery address{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="House / street, area, city, pincode"
                    className="resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-white/35 bg-card/75 px-5 py-4 dark:bg-card/70">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">₹{totalPrice}</span>
              </div>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Delivery</span>
                <span className="font-semibold text-foreground">
                  {delivery === "pune" ? "Free (Pune)" : "Added later"}
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="font-heading text-2xl font-extrabold text-foreground">
                  ₹{totalPrice}
                  {delivery === "porter" && (
                    <span className="ml-1 align-middle text-xs font-medium text-muted-foreground">
                      + Porter
                    </span>
                  )}
                </span>
              </div>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-accent/95 px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/15 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Send order on WhatsApp
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {activeOption.id === "porter"
                  ? "We'll confirm the Porter delivery charge on WhatsApp before dispatch."
                  : "You'll be taken to WhatsApp to confirm your order with us."}
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

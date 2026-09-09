"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { PhonePeIcon } from "@/components/phonepe-logo"

export function CartDrawer() {
  const { items, isOpen, closeCart, totalItems, totalPrice, setQuantity, removeItem } = useCart()
  const asideRef = useRef<HTMLElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

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
    const timer = window.setTimeout(() => closeBtnRef.current?.focus(), 80)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart()
        return
      }
      if (event.key !== "Tab" || !asideRef.current) return

      const focusable = asideRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [closeCart, isOpen, items, totalPrice])

  return (
    <div className="fixed inset-0 z-50" inert={!isOpen ? true : undefined}>
      {isOpen && (
        <button
          type="button"
          aria-label="Close cart"
          onClick={closeCart}
          className="absolute inset-0 cursor-default bg-foreground/30 backdrop-blur-[2px]"
        />
      )}

      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/60 bg-background/80 shadow-2xl backdrop-blur-2xl transition-transform duration-200 ease-out sm:top-3 sm:right-3 sm:h-[calc(100%-1.5rem)] sm:rounded-[2rem] ${isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-white/40 bg-white/20 px-5 py-4 dark:border-white/10 dark:bg-black/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-bold text-foreground">Your cart</h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-muted-foreground">
                {totalItems}
              </span>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/45 text-muted-foreground backdrop-blur transition hover:bg-background/70 hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/50 bg-white/35 shadow-inner backdrop-blur-xl dark:bg-white/10">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="mt-4 font-heading text-xl font-bold text-foreground">Your cart is empty</p>
            <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
              Pick a snack or instant premix and it will appear here.
            </p>
            <Link
              href="/#products"
              onClick={closeCart}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15"
            >
              Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.product.id} className="glass-panel rounded-2xl p-3">
                    <div className="flex gap-3">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        sizes="64px"
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-heading text-sm font-bold text-foreground">
                              {item.product.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.product.weight} · ₹{item.product.price}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-border/70 bg-background/25 p-0.5">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
                              aria-label={`Decrease ${item.product.name} quantity`}
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.product.id, Math.min(item.quantity + 1, 99))}
                              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
                              aria-label={`Increase ${item.product.name} quantity`}
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          <span className="font-heading text-base font-bold text-foreground">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-white/40 bg-white/25 px-5 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
                <span className="font-heading text-2xl font-extrabold text-foreground">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.99]"
              >
                Continue to checkout
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                <PhonePeIcon className="h-4 w-4 shrink-0" />
                <span>Secured by PhonePe Payment Gateway · UPI &amp; Cards</span>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

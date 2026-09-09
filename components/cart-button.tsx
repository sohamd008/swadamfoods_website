"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function CartButton() {
  const { totalItems, openCart } = useCart()

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={totalItems > 0 ? `Open cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}` : "Open cart"}
      className="relative flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full bg-primary p-2.5 sm:px-4 sm:py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 touch-manipulation"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Open cart</span>
      <span className="hidden sm:inline">Cart</span>
      {totalItems > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-background">
          {totalItems}
        </span>
      )}
    </button>
  )
}

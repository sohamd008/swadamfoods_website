"use client"

import { Plus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add to order
    </button>
  )
}

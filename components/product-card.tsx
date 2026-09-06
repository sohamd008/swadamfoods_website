"use client"

import { Plus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={product.image || "/placeholder.svg"}
          alt={`${product.name} served in a bowl`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-bold text-foreground">
            {product.name}
          </h3>
          <p className="text-sm font-medium text-primary">{product.tagline}</p>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-extrabold text-foreground">
              ₹{product.price}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.weight} pack
            </span>
          </div>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to order
          </button>
        </div>
      </div>
    </article>
  )
}

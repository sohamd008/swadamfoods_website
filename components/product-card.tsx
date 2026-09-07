"use client"

import Image from "next/image"
import { ChevronDown, ChefHat, Plus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import type { Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const hasPrep = Boolean(product.prepSteps?.length)

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={960}
          height={720}
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
          loading="lazy"
          className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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

        {hasPrep && (
          <details className="group/details rounded-2xl border border-border bg-secondary/40">
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ChefHat className="h-4 w-4 text-primary" aria-hidden="true" />
                {product.prepTitle ?? "How to prepare"}
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/details:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ol className="flex list-none flex-col gap-2 px-3.5 pb-3.5 pt-1">
              {product.prepSteps!.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-extrabold text-foreground">
              ₹{product.price}
            </span>
            <span className="text-xs text-muted-foreground">
              Single {product.weight} packet
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              addItem(product)
              trackEvent("add_to_cart", {
                currency: "INR",
                value: product.price,
                items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }],
              })
            }}
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

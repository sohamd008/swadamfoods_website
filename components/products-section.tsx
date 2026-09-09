"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"

export function ProductsSection() {
  const [inventory, setInventory] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data: { inventory?: Array<{ productId: string; stock: number }> }) => {
        const map: Record<string, number> = {}
        for (const item of data.inventory ?? []) {
          map[item.productId] = item.stock
        }
        setInventory(map)
      })
      .catch(() => {})
  }, [])

  return (
    <section id="products" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="glass-pill rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
            Our Range
          </span>
          <h2 className="mt-4 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Snacks &amp; instant premixes
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Freshly made in small batches. Tap add to cart and order securely online.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              stock={inventory[product.id]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

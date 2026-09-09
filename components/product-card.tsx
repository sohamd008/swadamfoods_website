"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChefHat, X, ArrowRight } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/lib/products"

export function ProductCard({ product, stock }: { product: Product; stock?: number }) {
  const [isPrepOpen, setIsPrepOpen] = useState(false)
  const hasPrep = Boolean(product.prepSteps?.length)

  useEffect(() => {
    if (!isPrepOpen) return
    document.body.style.overflow = "hidden"
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPrepOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPrepOpen])

  return (
    <>
      <article className="glass-card group flex flex-col overflow-hidden rounded-[2.2rem] h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={540}
            height={405}
            sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
            loading="lazy"
            style={{ aspectRatio: "4/3" }}
            className="block h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.badge && (
            <span className="glass-pill absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-xs font-bold text-accent shadow-md">
              {product.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-xl font-extrabold text-foreground">
                {product.name}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {product.tagline}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {hasPrep && (
              <button
                type="button"
                onClick={() => setIsPrepOpen(true)}
                className="glass-pill flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-left text-xs font-bold text-foreground transition-all hover:bg-white/80 active:scale-[0.98] touch-manipulation dark:hover:bg-white/10"
                aria-haspopup="dialog"
                aria-expanded={isPrepOpen}
              >
                <span className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{product.prepTitle ?? "How to prepare"}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary">
                  <span>View</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </button>
            )}

            {stock !== undefined && stock <= 10 && stock > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Only {stock} pack{stock > 1 ? "s" : ""} left from today&apos;s batch!</span>
              </div>
            )}
            {stock !== undefined && stock === 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                <span>Sold out from today&apos;s batch</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-white/40 pt-4 dark:border-white/10">
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-black tracking-tight text-foreground">
                  ₹{product.price}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {product.weight} pack
                </span>
              </div>
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </article>

      {hasPrep && isPrepOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-200"
            onClick={() => setIsPrepOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`prep-title-${product.id}`}
            className="ios-sheet relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6 transition-all duration-200 transform-gpu"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-foreground/20 sm:hidden" />

            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/60 bg-secondary/50 shadow-xs">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 id={`prep-title-${product.id}`} className="font-heading text-lg font-black tracking-tight text-foreground truncate">
                    {product.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <ChefHat className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{product.prepTitle ?? "Preparation & storage"}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPrepOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground active:scale-95"
                aria-label="Close instructions"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="my-4 max-h-[60vh] overflow-y-auto pr-1">
              <ol className="divide-y divide-border/40 overflow-hidden rounded-2xl border border-border/60 bg-white/40 shadow-xs backdrop-blur-md dark:bg-white/5">
                {product.prepSteps!.map((step, i) => (
                  <li key={i} className="flex items-start gap-3.5 p-4 text-xs sm:text-sm text-foreground leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-black text-primary-foreground shadow-sm">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsPrepOpen(false)}
                className="w-full rounded-2xl bg-primary py-3.5 text-center text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

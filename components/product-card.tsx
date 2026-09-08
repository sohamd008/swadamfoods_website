import Image from "next/image"
import { ChevronDown, ChefHat } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const hasPrep = Boolean(product.prepSteps?.length)

  return (
    <article className="glass-card group flex flex-col overflow-hidden rounded-[2.2rem]">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={960}
          height={720}
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
          loading="lazy"
          className="block aspect-[4/3] h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="glass-pill absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-xs font-bold text-accent shadow-md">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-xl font-extrabold text-foreground">
            {product.name}
          </h3>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{product.tagline}</p>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {hasPrep && (
          <details className="group/details glass-pill rounded-2xl transition-all">
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left">
              <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                <ChefHat className="h-4 w-4 text-primary" aria-hidden="true" />
                {product.prepTitle ?? "How to prepare"}
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open/details:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ol className="flex list-none flex-col gap-2.5 px-4 pb-4 pt-1 border-t border-white/40 dark:border-white/10">
              {product.prepSteps!.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground shadow-sm">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/40 pt-4 dark:border-white/10">
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
    </article>
  )
}

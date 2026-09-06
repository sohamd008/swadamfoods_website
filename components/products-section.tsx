import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"

export function ProductsSection() {
  return (
    <section id="products" className="scroll-mt-20 bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Range
          </span>
          <h2 className="mt-2 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Snacks &amp; instant premixes
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Freshly made in small batches. Tap add to order and send your basket
            to us on WhatsApp — we&apos;ll confirm and arrange delivery.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

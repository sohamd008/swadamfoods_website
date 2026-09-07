import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { ProductsSection } from "@/components/products-section"
import { AboutSection } from "@/components/about-section"
import { TrustSection } from "@/components/trust-section"
import { FaqSection } from "@/components/faq-section"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"

export default function Page() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <ProductsSection />
        <AboutSection />
        <TrustSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <CartDrawer />
    </>
  )
}

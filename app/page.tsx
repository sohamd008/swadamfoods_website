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
      <SiteHeader />
      <main>
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

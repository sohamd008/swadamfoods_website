import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { ProductsSection } from "@/components/products-section"
import { AboutSection } from "@/components/about-section"
import { TrustSection } from "@/components/trust-section"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { WebMCPTools } from "@/components/webmcp-tools"

export default function Page() {
  return (
    <>
      <WebMCPTools />
      <SiteHeader />
      <main>
        <Hero />
        <ProductsSection />
        <AboutSection />
        <TrustSection />
      </main>
      <SiteFooter />
      <CartDrawer />
    </>
  )
}

import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react"
import { WHATSAPP_NUMBER, business } from "@/lib/products"

export function SiteFooter() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Swadam Foods! I'd like to know more about your products.",
  )}`

  const registrations = [
    { label: "FSSAI", value: business.fssai },
    { label: "UDYAM MSME", value: business.udyam },
  ]

  return (
    <footer id="contact" className="relative scroll-mt-20 border-t border-white/40 pt-8 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 text-center sm:p-12 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5">
            <span className="glass-pill rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
              Fast & Fresh Delivery
            </span>
            <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready to enjoy authentic home-style snacks?
            </h2>
            <p className="max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
              Add your favourites to the cart and pay securely online. Need help with an order? Message us directly on WhatsApp.
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="w-fit overflow-hidden rounded-2xl border border-white/60 bg-[#f7f2e7]/90 p-2 shadow-sm">
              <Image src="/images/swadam-logo.webp" alt="Swadam Foods logo" width={160} height={80} sizes="80px" className="h-14 w-auto" />
            </span>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">Authentic Indian snacks and instant premixes, made with real ingredients and traditional recipes. Proudly a women-owned and women-operated business.</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Get in touch</span>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors hover:text-primary"><Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{business.phoneDisplay}</a>
            <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors hover:text-primary"><Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{business.email}</a>
            <a href="https://www.instagram.com/swadamfoodsindia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors hover:text-primary">
              <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
              @swadamfoodsindia
            </a>
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{business.address}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Registrations</span>
            <dl className="flex flex-col gap-2">{registrations.map(({ label, value }) => (<div key={label} className="glass-pill rounded-2xl px-4 py-2.5"><dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="font-mono text-xs font-bold text-foreground">{value}</dd></div>))}</dl>
          </div>
        </div>

        <div className="mt-12 border-t border-white/40 pt-6 dark:border-white/10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center text-xs text-muted-foreground sm:text-left">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved. · Women-owned &amp; operated.</p>
              <p className="mt-0.5">Ownership: DANDEKAR VIDYA AJIT</p>
            </div>
            <nav className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-4" aria-label="Legal">
              <Link href="/terms" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Terms</Link>
              <Link href="/privacy-policy" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Privacy</Link>
              <Link href="/payment-policy" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Payments</Link>
              <Link href="/refund-policy" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Refunds</Link>
              <Link href="/return-policy" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Returns</Link>
              <Link href="/shipping-policy" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Shipping</Link>
              <Link href="/cookie-policy" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Cookies</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

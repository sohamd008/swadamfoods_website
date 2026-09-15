import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Phone, Mail, MapPin, ShieldCheck, CreditCard } from "lucide-react"
import { WHATSAPP_NUMBER, business } from "@/lib/products"
import { PhonePeIcon } from "@/components/phonepe-logo"

export function SiteFooter() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Swadam Foods! I'd like to know more about your products.")}`
  const paymentMethods = ["UPI", "Google Pay", "Paytm", "BHIM UPI", "Visa / Mastercard", "RuPay", "NetBanking"]

  return (
    <footer id="contact" className="relative scroll-mt-20 border-t border-border/70 pt-8">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-14">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-xs">Direct from our Kitchen in Pune</span>
            <h2 className="text-balance font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Ready to taste the purity?</h2>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">Experience the crunch of traditional Patal Poha Chivda and convenience of 5-minute breakfast premixes. Order online in under 2 minutes!</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a href="#products" className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-[0.98]">Order Online Now</a>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"><MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" /><span>Chat on WhatsApp</span></a>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="w-fit overflow-hidden rounded-2xl border border-border/80 bg-[#f7f2e7]/90 p-2.5 shadow-sm"><Image src="/images/swadam-logo.webp" alt="Swadam Foods logo" width={88} height={48} className="h-12 w-auto" /></span>
            <p className="text-xs leading-relaxed text-muted-foreground">Authentic Indian snacks and instant breakfast premixes, handcrafted with real ingredients and traditional family recipes. Proudly women-owned and women-operated in Pune.</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400"><ShieldCheck className="h-4 w-4" aria-hidden="true" /><span>FSSAI registered</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Contact Us</span>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs font-semibold text-foreground hover:text-primary"><Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /><span>{business.phoneDisplay}</span></a>
            <a href={`mailto:${business.email}`} className="flex items-center gap-2.5 text-xs font-semibold text-foreground hover:text-primary"><Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /><span>{business.email}</span></a>
            <a href="https://www.instagram.com/swadamfoodsindia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs font-semibold text-foreground hover:text-primary">
              <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" /></svg>
              <span>@swadamfoodsindia</span>
            </a>
            <p className="flex items-start gap-2.5 pt-1 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" /><span>{business.address}</span></p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Official Registrations</span>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 p-2.5"><div className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-white p-1 shadow-xs"><Image src="/images/fssai-logo.webp" alt="FSSAI logo" width={240} height={119} className="h-6 w-auto object-contain" /></div><div className="flex min-w-0 flex-col"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">FSSAI License No.</span><span className="truncate font-mono text-xs font-bold text-foreground select-all">{business.fssai}</span></div></div>
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 p-2.5"><div className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-white p-1 shadow-xs"><Image src="/images/msme-logo.webp" alt="MSME logo" width={240} height={278} className="h-7 w-auto object-contain" /></div><div className="flex min-w-0 flex-col"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">UDYAM Reg. No.</span><span className="truncate font-mono text-xs font-bold text-foreground select-all">{business.udyam}</span></div></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary"><CreditCard className="h-3.5 w-3.5" aria-hidden="true" /><span>Secure Payment</span></span>
            <div className="flex items-center gap-2.5 rounded-xl border border-purple-500/25 bg-purple-500/10 p-2.5"><PhonePeIcon className="h-7 w-7 shrink-0 rounded-lg shadow-xs" /><div className="flex min-w-0 flex-col"><span className="text-[11px] font-bold text-[#5F259F] dark:text-purple-300">Powered by PhonePe Payment Gateway</span><span className="text-[10px] text-muted-foreground">Secure payment screen for your payment details.</span></div></div>
            <p className="text-[11px] text-muted-foreground">UPI, cards and NetBanking are available through PhonePe.</p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">{paymentMethods.map((mode) => <span key={mode} className="rounded-lg border border-border/70 bg-card px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-xs">{mode}</span>)}</div>
          </div>
        </div>

        <div id="footer" className="mt-14 scroll-mt-10 border-t border-white/40 pt-6 dark:border-white/10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center text-xs text-muted-foreground sm:text-left"><p>© {new Date().getFullYear()} {business.name}. All rights reserved. · Women-owned &amp; operated in Pune, Maharashtra.</p></div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end" aria-label="Legal navigation">
              <Link href="/track" className="text-xs font-bold text-primary hover:underline">Track Order</Link>
              <Link href="/terms" className="text-xs font-bold text-muted-foreground hover:text-primary">Terms</Link>
              <Link href="/privacy-policy" className="text-xs font-bold text-muted-foreground hover:text-primary">Privacy</Link>
              <Link href="/payment-policy" className="text-xs font-bold text-muted-foreground hover:text-primary">Payments</Link>
              <Link href="/refund-policy" className="text-xs font-bold text-muted-foreground hover:text-primary">Refunds</Link>
              <Link href="/return-policy" className="text-xs font-bold text-muted-foreground hover:text-primary">Returns</Link>
              <Link href="/shipping-policy" className="text-xs font-bold text-muted-foreground hover:text-primary">Shipping</Link>
              <Link href="/cookie-policy" className="text-xs font-bold text-muted-foreground hover:text-primary">Cookies</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

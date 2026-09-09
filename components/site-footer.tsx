"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Phone, Mail, MapPin, ShieldCheck, CreditCard } from "lucide-react"
import { WHATSAPP_NUMBER, business } from "@/lib/products"
import { PhonePeIcon } from "@/components/phonepe-logo"

export function SiteFooter() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Swadam Foods! I'd like to know more about your products.",
  )}`

  const handlePolicyClick = () => {
    try {
      sessionStorage.setItem("swadam_home_scroll", String(window.scrollY))
      sessionStorage.setItem("swadam_viewing_policy", "true")
      sessionStorage.setItem("swadam_from_home", "true")
    } catch {
    }
  }

  useEffect(() => {
    const restore = () => {
      try {
        const viewingPolicy = sessionStorage.getItem("swadam_viewing_policy")
        const savedScroll = sessionStorage.getItem("swadam_home_scroll")

        if (viewingPolicy === "true") {
          sessionStorage.removeItem("swadam_viewing_policy")

          const targetY = savedScroll ? parseInt(savedScroll, 10) : NaN
          const root = document.documentElement

          const performScroll = () => {
            if (!isNaN(targetY) && targetY > 0) {
              const prevBehavior = root.style.scrollBehavior
              root.style.scrollBehavior = "auto"
              window.scrollTo({ top: targetY, left: 0, behavior: "instant" })
              root.style.scrollBehavior = prevBehavior
            } else {
              const footerEl = document.getElementById("footer") || document.getElementById("contact")
              if (footerEl) {
                footerEl.scrollIntoView({ behavior: "instant" })
              }
            }
          }

          performScroll()
          const r1 = requestAnimationFrame(performScroll)
          const t1 = setTimeout(performScroll, 50)
          const t2 = setTimeout(performScroll, 150)
          const t3 = setTimeout(performScroll, 300)
        }
      } catch {
      }
    }

    restore()

    window.addEventListener("popstate", restore)
    window.addEventListener("pageshow", restore)

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          try {
            if (window.scrollY > 0) {
              sessionStorage.setItem("swadam_home_scroll", String(window.scrollY))
              sessionStorage.setItem("swadam_from_home", "true")
            }
          } catch {
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("popstate", restore)
      window.removeEventListener("pageshow", restore)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const paymentMethods = [
    "PhonePe Payment Gateway UPI",
    "Google Pay",
    "Paytm",
    "BHIM UPI",
    "Visa / Mastercard",
    "RuPay",
    "NetBanking",
  ]

  return (
    <footer id="contact" className="relative scroll-mt-20 border-t border-white/40 pt-8 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 text-center sm:p-14 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          
          <div className="relative flex flex-col items-center gap-5 max-w-2xl mx-auto">
            <span className="glass-pill rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
              Direct from our Kitchen in Pune
            </span>
            <h2 className="text-balance font-heading text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Ready to taste the purity?
            </h2>
            <p className="text-pretty text-sm sm:text-base text-muted-foreground leading-relaxed">
              Experience the crunch of traditional Patal Poha Chivda and convenience of 5-minute breakfast premixes. Order online in under 2 minutes!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95"
              >
                Order Online Now
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-pill inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold text-foreground transition-transform hover:bg-white/80 active:scale-95 dark:hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <span className="w-fit overflow-hidden rounded-2xl border border-white/60 bg-[#f7f2e7]/90 p-2.5 shadow-sm">
              <Image
                src="/images/swadam-logo.webp"
                alt="Swadam Foods logo"
                width={448}
                height={244}
                sizes="80px"
                className="h-12 w-auto"
              />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Authentic Indian snacks and instant breakfast premixes, handcrafted with real ingredients and traditional family recipes. Proudly women-owned and women-operated in Pune.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Certified Food Safety</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Contact Us
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs font-bold text-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{business.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-2.5 text-xs font-bold text-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{business.email}</span>
            </a>
            <a
              href="https://www.instagram.com/swadamfoodsindia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs font-bold text-foreground transition-colors hover:text-primary"
            >
              <svg
                className="h-4 w-4 shrink-0 text-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
              <span>@swadamfoodsindia</span>
            </a>
            <p className="flex items-start gap-2.5 text-xs text-muted-foreground pt-1">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{business.address}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Official Accreditations
            </span>
            <div className="flex flex-col gap-2.5">
              <div className="glass-pill flex items-center gap-3 rounded-2xl p-2.5">
                <div className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-xs border border-slate-100">
                  <Image
                    src="/images/fssai-logo.webp"
                    alt="FSSAI Logo"
                    width={240}
                    height={119}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground block">
                    FSSAI License No.
                  </span>
                  <span className="font-mono text-xs font-black text-foreground select-all truncate">
                    {business.fssai}
                  </span>
                </div>
              </div>

              <div className="glass-pill flex items-center gap-3 rounded-2xl p-2.5">
                <div className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-xs border border-slate-100">
                  <Image
                    src="/images/msme-logo.webp"
                    alt="MSME Logo"
                    width={240}
                    height={278}
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground block">
                    UDYAM Reg. No.
                  </span>
                  <span className="font-mono text-xs font-black text-foreground select-all truncate">
                    {business.udyam}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Secure Payment Modes</span>
            </span>

            <div className="glass-pill flex items-center gap-2.5 rounded-2xl p-2.5 border border-purple-500/25 bg-purple-500/10">
              <PhonePeIcon className="h-7 w-7 shrink-0 rounded-lg shadow-xs" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-extrabold text-[#5F259F] dark:text-purple-300">
                  Powered by PhonePe Payment Gateway
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  RBI-Authorized · 256-bit SSL
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Encrypted online checkout with instant UPI &amp; card verification.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {paymentMethods.map((mode) => (
                <span
                  key={mode}
                  className="rounded-xl border border-white/60 bg-white/45 px-2.5 py-1 text-[10px] font-bold text-foreground backdrop-blur-md dark:border-white/10 dark:bg-white/5"
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div id="footer" className="mt-14 border-t border-white/40 pt-6 dark:border-white/10 scroll-mt-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center text-xs text-muted-foreground sm:text-left">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved. · Women-owned &amp; operated in Pune, Maharashtra.</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/80">Proprietorship: DANDEKAR VIDYA AJIT</p>
            </div>
            <nav className="flex flex-wrap justify-center sm:justify-end gap-x-5 gap-y-2" aria-label="Legal navigation">
              <Link href="/terms" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Terms</Link>
              <Link href="/privacy-policy" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Privacy</Link>
              <Link href="/payment-policy" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Payments</Link>
              <Link href="/refund-policy" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Refunds</Link>
              <Link href="/return-policy" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Returns</Link>
              <Link href="/shipping-policy" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Shipping</Link>
              <Link href="/cookie-policy" onClick={handlePolicyClick} className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">Cookies</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

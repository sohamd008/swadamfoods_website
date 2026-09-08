"use client"

import { useState } from "react"
import { BadgeCheck, ShieldCheck, HeartHandshake, Copy, Check } from "lucide-react"
import { business } from "@/lib/products"

const credentials = [
  {
    icon: HeartHandshake,
    title: "Women-Owned Enterprise",
    badgeText: "Authentic Heritage",
    description:
      "Solely owned and run by a woman entrepreneur in Pune — every recipe, every spice blend, and every batch is handcrafted with family care.",
    reg: null,
  },
  {
    icon: ShieldCheck,
    title: "FSSAI Registered & Certified",
    badgeText: "Food Safety Verified",
    description:
      "Registered with the Food Safety and Standards Authority of India for safe, hygienic, and authentic food manufacturing operations.",
    reg: { label: "FSSAI", value: business.fssai },
  },
  {
    icon: BadgeCheck,
    title: "UDYAM MSME Registered",
    badgeText: "Govt. of India",
    description:
      "A recognised Micro enterprise under the Ministry of Micro, Small and Medium Enterprises, Government of India.",
    reg: { label: "UDYAM", value: business.udyam },
  },
]

export function TrustSection() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <section id="trust" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
          <span className="glass-pill rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
            Certifications &amp; Trust
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Certified purity, verified quality
          </h2>
          <p className="text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
            Shop with total confidence. We adhere to the highest food safety and government registration standards.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map(({ icon: Icon, title, badgeText, description, reg }) => (
            <div
              key={title}
              className="glass-card flex flex-col justify-between rounded-[2.2rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inner border border-accent/25">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="glass-pill rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent">
                    {badgeText}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-xl font-extrabold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>

              {reg ? (
                <div className="mt-6 flex items-center justify-between gap-2 rounded-2xl border border-white/60 bg-white/40 p-3.5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      {reg.label} License No.
                    </span>
                    <p className="font-mono text-xs font-black text-foreground truncate">
                      {reg.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(reg.value, reg.label)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition hover:bg-background hover:text-foreground active:scale-90"
                    title={`Copy ${reg.label} number`}
                  >
                    {copiedKey === reg.label ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>100% Home-Made in Pune, Maharashtra</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

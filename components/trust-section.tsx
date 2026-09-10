import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { business } from "@/lib/products"

function FssaiLogo() {
  return (
    <Image
      src="/images/fssai-logo.webp"
      alt="FSSAI Official Logo"
      width={240}
      height={119}
      sizes="180px"
      className="h-12 w-auto object-contain"
    />
  )
}

function MsmeLogo() {
  return (
    <Image
      src="/images/msme-logo.webp"
      alt="Ministry of MSME Government of India Official Logo"
      width={240}
      height={278}
      sizes="150px"
      className="h-14 w-auto object-contain"
    />
  )
}

function WomenOwnedLogo() {
  return (
    <svg viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto" aria-label="Women Owned Business Official Logo">
      <g transform="translate(10, 8)">
        <circle cx="32" cy="32" r="28" fill="#E11D48" fillOpacity="0.12" stroke="#E11D48" strokeWidth="2" />
        <circle cx="32" cy="32" r="20" stroke="#E11D48" strokeWidth="1.2" strokeDasharray="2.5 2" />
        <path d="M32 20c-5-5-12-1-12 5 0 8 12 15 12 15s12-7 12-15c0-6-7-10-12-5z" fill="#E11D48" />
        <circle cx="32" cy="27" r="3.5" fill="#FFFFFF" />
      </g>
      
      <text x="82" y="30" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="900" fontSize="17" letterSpacing="0.5" fill="#E11D48">
        WOMEN-OWNED
      </text>
      <text x="82" y="46" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="11" letterSpacing="0.4" fill="#1C355E" className="dark:fill-white">
        ENTERPRISE
      </text>
      <text x="82" y="58" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6" fill="#15803D" className="dark:fill-emerald-400">
        AUTHENTIC HOME-MADE HERITAGE
      </text>
    </svg>
  )
}

const credentials = [
  {
    logo: <WomenOwnedLogo />,
    title: "Women-Owned Enterprise",
    badgeText: "Authentic Heritage",
    description:
      "Solely owned and run by a woman entrepreneur in Pune — every recipe, spice blend, and batch is handcrafted with traditional family care.",
    status: "Verified Women Entrepreneurship",
    regLabel: null,
    regNumber: null,
  },
  {
    logo: <FssaiLogo />,
    title: "FSSAI Registered & Certified",
    badgeText: "Food Safety Verified",
    description:
      "Registered with the Food Safety and Standards Authority of India for hygienic, compliant, and quality food manufacturing operations.",
    status: "Govt. Food Safety Certified",
    regLabel: "FSSAI License No.",
    regNumber: business.fssai,
  },
  {
    logo: <MsmeLogo />,
    title: "UDYAM MSME Registered",
    badgeText: "Govt. of India",
    description:
      "A recognised Micro enterprise under the Ministry of Micro, Small and Medium Enterprises, Government of India.",
    status: "Official UDYAM Registration",
    regLabel: "UDYAM Reg. No.",
    regNumber: business.udyam,
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-xs">
            Official Compliance
          </span>
          <h2 className="text-balance font-heading font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Certified purity &amp; official compliance
          </h2>
          <p className="text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
            Shop with total confidence. We strictly adhere to Government of India food safety standards and micro-enterprise regulations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map(({ logo, title, badgeText, description, status, regLabel, regNumber }) => (
            <div
              key={title}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4">
                  <div className="flex h-16 w-36 items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-xs border border-border/40">
                    {logo}
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary shrink-0">
                    {badgeText}
                  </span>
                </div>

                <h3 className="mt-5 font-heading font-serif text-xl font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-xs sm:text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>

                {regNumber && (
                  <div className="mt-4 rounded-xl border border-border/70 bg-secondary/30 px-4 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {regLabel}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-foreground tracking-wide select-all">
                      {regNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50/80 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

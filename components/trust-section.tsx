import { CheckCircle2 } from "lucide-react"

function FssaiLogo() {
  return (
    <svg viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto" aria-label="FSSAI Official Logo">
      {/* Official FSSAI 3-color flame/swoosh */}
      <path d="M48 24C48 14 58 6 72 6C86 6 94 14 94 24C84 20 74 22 66 24C58 26 52 26 48 24Z" fill="#F37021" />
      <path d="M56 20C66 12 76 8 90 10C82 17 72 21 62 23C58 23 56 22 56 20Z" fill="#3BB54A" />
      <path d="M44 28C48 19 55 14 66 12C57 19 51 24 46 28H44Z" fill="#00AEEF" />
      
      {/* Wordmark fssai */}
      <text x="36" y="56" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="900" fontSize="36" letterSpacing="-1.5" fill="#1C355E" className="dark:fill-white">
        fssai
      </text>

      {/* Official Government of India banner */}
      <rect x="0" y="64" width="280" height="12" rx="3" fill="#1C355E" className="dark:fill-slate-800" />
      <text x="140" y="72.5" textAnchor="middle" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="700" fontSize="6.2" letterSpacing="0.8" fill="#FFFFFF">
        FOOD SAFETY AND STANDARDS AUTHORITY OF INDIA
      </text>
    </svg>
  )
}

function MsmeLogo() {
  return (
    <svg viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto" aria-label="Ministry of MSME Official Logo">
      {/* Emblem Chakra & Floral Tri-color Motif */}
      <g transform="translate(10, 8)">
        <circle cx="32" cy="32" r="28" fill="#F47920" fillOpacity="0.12" stroke="#F47920" strokeWidth="2" />
        <circle cx="32" cy="32" r="20" stroke="#003366" strokeWidth="1.5" strokeDasharray="3 2" className="dark:stroke-sky-400" />
        <circle cx="32" cy="32" r="4" fill="#003366" className="dark:fill-sky-400" />
        <path d="M32 16v32M16 32h32M21 21l22 22M21 43l22-22" stroke="#003366" strokeWidth="1.2" strokeLinecap="round" className="dark:stroke-sky-400" />
        <path d="M32 14c-4 5-4 10 0 14 4-4 4-9 0-14z" fill="#F47920" />
        <path d="M32 36c-4 5-4 10 0 14 4-4 4-9 0-14z" fill="#138808" />
      </g>
      
      {/* Official MSME Typography */}
      <text x="82" y="32" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="900" fontSize="22" letterSpacing="1" fill="#003366" className="dark:fill-white">
        MSME
      </text>
      <text x="82" y="46" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="10.5" letterSpacing="0.4" fill="#F47920">
        सूक्ष्म, लघु एवं मध्यम उद्यम
      </text>
      <text x="82" y="58" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6" fill="#475569" className="dark:fill-slate-300">
        UDYAM · GOVERNMENT OF INDIA
      </text>
    </svg>
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
  },
  {
    logo: <FssaiLogo />,
    title: "FSSAI Registered & Certified",
    badgeText: "Food Safety Verified",
    description:
      "Registered with the Food Safety and Standards Authority of India for hygienic, compliant, and quality food manufacturing operations.",
    status: "Govt. Food Safety Certified",
  },
  {
    logo: <MsmeLogo />,
    title: "UDYAM MSME Registered",
    badgeText: "Govt. of India",
    description:
      "A recognised Micro enterprise under the Ministry of Micro, Small and Medium Enterprises, Government of India.",
    status: "Official UDYAM Registration",
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
          <span className="glass-pill rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
            Official Certifications
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Certified purity &amp; official compliance
          </h2>
          <p className="text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
            Shop with total confidence. We strictly adhere to Government of India food safety standards and micro-enterprise regulations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map(({ logo, title, badgeText, description, status }) => (
            <div
              key={title}
              className="glass-card flex flex-col justify-between rounded-[2.2rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
                  <div className="overflow-hidden rounded-2xl bg-white/60 p-2 shadow-xs backdrop-blur-md dark:bg-white/10">
                    {logo}
                  </div>
                  <span className="glass-pill rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent shrink-0">
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

              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
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

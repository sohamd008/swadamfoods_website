import Image from "next/image"
import { ShieldCheck, Leaf, Clock, Sparkles, ArrowRight } from "lucide-react"

const highlights = [
  { icon: ShieldCheck, label: "FSSAI Registered" },
  { icon: Leaf, label: "Zero Preservatives" },
  { icon: Clock, label: "Ready in 5 Mins" },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden py-8 sm:py-14 lg:py-18">
      {/* Ambient warm lighting mesh */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[550px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-400/25 via-orange-400/15 to-emerald-400/20 blur-3xl opacity-75 dark:from-amber-600/15 dark:to-emerald-600/10" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
        {/* Left Column: Brand Copy & CTAs */}
        <div className="flex flex-col gap-6">
          {/* Top Brand Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground shadow-xs">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Made in India · Home-Style Recipes</span>
            </span>

            <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Free Delivery in Pune</span>
            </span>
          </div>

          <h1 className="text-balance font-heading text-4xl font-black leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Authentic Indian snacks, handcrafted the{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-300">
              traditional
            </span>{" "}
            way.
          </h1>

          <p className="max-w-lg text-pretty text-base sm:text-lg leading-relaxed text-muted-foreground">
            From our signature crunchy <strong>Patal Poha Chivda</strong> to 5-minute instant{" "}
            <strong>Kanda Poha</strong> and <strong>Upma</strong> premixes — 100% pure ingredients, home-style flavours, delivered fresh to your doorstep.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-95"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#about"
              className="glass-pill rounded-full px-6 py-4 text-sm font-bold text-foreground transition-all hover:bg-white/80 active:scale-95 dark:hover:bg-white/10"
            >
              Our Story &amp; Heritage
            </a>
          </div>

          {/* Value Proposition Tags */}
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5 pt-3 border-t border-white/40 dark:border-white/10">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="glass-pill flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-foreground"
              >
                <Icon className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Hero Visual Food Showcase */}
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-[2.8rem] bg-gradient-to-r from-amber-500/25 to-emerald-500/25 blur-2xl transition-all duration-500 group-hover:blur-3xl opacity-80" />
          
          <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] border border-white/80 shadow-2xl backdrop-blur-2xl dark:border-white/10">
            <Image
              src="/images/hero-chivda.webp"
              alt="A rustic bowl of handcrafted Patal Poha Chivda garnished with roasted peanuts and fresh curry leaves"
              width={1200}
              height={1200}
              sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
              priority
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Floating Glass Badges */}
          <div className="glass-panel absolute top-5 right-5 rounded-2xl px-3.5 py-2 shadow-xl border border-white/80 dark:border-white/10">
            <p className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Home-Style Recipe</span>
            </p>
          </div>

          <div className="glass-panel absolute bottom-5 left-5 rounded-2xl p-4 shadow-2xl border border-white/80 dark:border-white/10 max-w-[260px]">
            <p className="font-heading text-sm font-extrabold text-foreground">
              Patal Poha Chivda
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              200 g · ₹90 · Freshly Roasted in Pune
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

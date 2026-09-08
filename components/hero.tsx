import Image from "next/image"
import { ShieldCheck, Leaf, Clock } from "lucide-react"

const highlights = [
  { icon: ShieldCheck, label: "FSSAI compliant" },
  { icon: Leaf, label: "No preservatives" },
  { icon: Clock, label: "Ready in minutes" },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden py-10 sm:py-16">
      {/* Ambient background glow mesh */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-400/25 via-orange-300/15 to-emerald-400/20 blur-3xl opacity-70 dark:from-amber-600/15 dark:to-emerald-600/10" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 md:grid-cols-2 md:py-14">
        <div className="flex flex-col gap-6">
          <div className="w-fit overflow-hidden rounded-3xl border border-white/70 bg-[#f7f2e7]/80 p-3.5 shadow-xl shadow-amber-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <Image
              src="/images/swadam-logo.webp"
              alt="Swadam Foods — Taste of Purity and Care"
              width={176}
              height={96}
              sizes="(max-width: 639px) 176px, 224px"
              className="h-auto w-auto sm:h-24"
            />
          </div>
          <span className="glass-pill inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground shadow-xs">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Made in India · Home-style recipes
          </span>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Authentic Indian snacks, made the <span className="text-primary bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-300">traditional</span> way.
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            From our signature Patal Poha Chivda to instant Kanda Poha and Upma
            premixes — real ingredients, real flavour, delivered to your door.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-95"
            >
              Shop products
            </a>
            <a
              href="#about"
              className="glass-pill rounded-full px-7 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-white/80 dark:hover:bg-white/10"
            >
              Our story
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="glass-pill flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-foreground"
              >
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-amber-500/20 to-emerald-500/20 blur-xl transition-all group-hover:blur-2xl opacity-70" />
          <Image
            src="/images/hero-chivda.webp"
            alt="A rustic bowl of Patal Poha Chivda garnished with peanuts and curry leaves"
            width={1200}
            height={1200}
            sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
            priority
            fetchPriority="high"
            className="relative aspect-square w-full rounded-[2.2rem] border border-white/70 object-cover shadow-2xl backdrop-blur-xl dark:border-white/10"
          />
          <div className="glass-panel absolute bottom-5 left-5 rounded-2xl p-4 shadow-2xl">
            <p className="font-heading text-sm font-extrabold text-foreground">
              Patal Poha Chivda
            </p>
            <p className="text-xs font-semibold text-muted-foreground">200 g · ₹90</p>
          </div>
        </div>
      </div>
    </section>
  )
}

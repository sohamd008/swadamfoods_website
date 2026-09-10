import Image from "next/image"
import { ShieldCheck, Leaf, Clock, ArrowRight } from "lucide-react"

const highlights = [
  { icon: ShieldCheck, label: "FSSAI Registered" },
  { icon: Leaf, label: "Zero Preservatives" },
  { icon: Clock, label: "Ready in 5 Mins" },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden py-8 sm:py-14 lg:py-18">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Small-Batch Kitchen · Pune</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Free Delivery in Pune</span>
            </span>
          </div>

          <h1 className="text-balance font-heading font-serif text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Authentic Indian snacks &amp; instant premixes, handcrafted the{" "}
            <em className="italic font-normal text-primary mr-2">
              traditional
            </em>
            way.
          </h1>

          <p className="max-w-lg text-pretty text-base sm:text-lg leading-relaxed text-muted-foreground">
            From our signature crunchy <strong>Patal Poha Chivda</strong> to 5-minute instant{" "}
            <strong>Kanda Poha</strong> and <strong>Upma</strong> premixes — 100% pure ingredients, home-style flavours, delivered fresh to your doorstep.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-[0.98]"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#about"
              className="rounded-xl border border-border bg-card/70 px-6 py-4 text-sm font-semibold text-foreground transition-all hover:bg-card active:scale-[0.98]"
            >
              Our Story &amp; Heritage
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-3 border-t border-border/70">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-xs font-semibold text-foreground"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative group">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-xl">
            <Image
              src="/images/hero-chivda.webp"
              alt="A rustic bowl of handcrafted Patal Poha Chivda garnished with roasted peanuts and fresh curry leaves"
              width={640}
              height={640}
              sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
              priority
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="absolute top-4 right-4 rounded-lg border border-border/80 bg-card/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Leaf className="h-3.5 w-3.5" />
              <span>100% Clean Ingredients</span>
            </p>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-lg backdrop-blur-sm sm:right-auto sm:max-w-xs">
            <p className="font-heading font-serif text-base font-bold text-foreground">
              Patal Poha Chivda
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">
              200g · ₹90 · Freshly Roasted in Small Batches
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

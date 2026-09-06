import { ShieldCheck, Leaf, Clock } from "lucide-react"

const highlights = [
  { icon: ShieldCheck, label: "FSSAI compliant" },
  { icon: Leaf, label: "No preservatives" },
  { icon: Clock, label: "Ready in minutes" },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="flex flex-col gap-6">
          <div className="w-fit overflow-hidden rounded-2xl border border-border bg-[#f7f2e7] p-3 shadow-sm">
            <img
              src="/images/swadam-logo.jpg"
              alt="Swadam Foods — Taste of Purity and Care"
              className="h-24 w-auto sm:h-28"
            />
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-foreground">
            Made in India · Home-style recipes
          </span>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Authentic Indian snacks, made the <span className="text-primary">traditional</span> way.
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            From our signature Patal Poha Chivda to instant Kanda Poha and Upma
            premixes — real ingredients, real flavour, delivered to your door.
            Order in seconds, straight to our WhatsApp.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
            >
              Shop products
            </a>
            <a
              href="#about"
              className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Our story
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/15 blur-2xl"
          />
          <img
            src="/images/hero-chivda.png"
            alt="A rustic bowl of Patal Poha Chivda garnished with peanuts and curry leaves"
            className="aspect-square w-full rounded-[2rem] border border-border object-cover shadow-xl"
          />
          <div className="absolute bottom-4 left-4 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
            <p className="font-heading text-sm font-bold text-foreground">
              Patal Poha Chivda
            </p>
            <p className="text-xs text-muted-foreground">200 g · ₹90</p>
          </div>
        </div>
      </div>
    </section>
  )
}

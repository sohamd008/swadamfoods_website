import { Star, CheckCircle, Quote } from "lucide-react"

const reviews = [
  {
    name: "Ananya Deshmukh",
    location: "Kothrud, Pune",
    rating: 5,
    product: "Patal Poha Chivda",
    review:
      "The Patal Poha Chivda tastes exactly like what my grandmother used to make during Diwali. Incredibly light, crisp, not oily at all, and the roasted peanuts and curry leaves are super fresh. Our whole family loved it!",
    initials: "AD",
    bg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  {
    name: "Vikram Joshi",
    location: "Baner, Pune",
    rating: 5,
    product: "Instant Kanda Poha Premix",
    review:
      "A total game-changer for busy weekday mornings. Just pour hot boiling water, wait 5 minutes, and you get authentic, fluffy Maharashtrian Kanda Poha. Real flavours and absolutely zero preservative aftertaste.",
    initials: "VJ",
    bg: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  },
  {
    name: "Pooja Kulkarni",
    location: "Viman Nagar, Pune",
    rating: 5,
    product: "Instant Upma Premix & Chivda",
    review:
      "Ordered the combo on WhatsApp and received it promptly. The packaging is premium and resealable. You can taste the genuine home-style ingredients in every single bite. Proud to support a local women-run venture!",
    initials: "PK",
    bg: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
  },
]

export function ReviewsSection() {
  return (
    <section className="relative scroll-mt-20 py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
          <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
            <span className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
              ))}
            </span>
            <span>Customer Love</span>
          </span>

          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Loved by foodies across Pune
          </h2>
          <p className="text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
            Authentic flavours speak for themselves. Here is what our customers have to say about Swadam Foods.
          </p>
        </div>

        {/* Reviews Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="glass-card flex flex-col justify-between rounded-[2.2rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="space-y-4">
                {/* Rating & Product Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                    {r.product}
                  </span>
                </div>

                {/* Review Quote */}
                <p className="relative text-xs sm:text-sm leading-relaxed text-foreground/90 italic">
                  <Quote className="inline h-3.5 w-3.5 text-primary/40 mr-1 -mt-1" />
                  {r.review}
                </p>
              </div>

              {/* Author Row */}
              <div className="mt-6 flex items-center gap-3 border-t border-white/40 pt-4 dark:border-white/10">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-heading text-xs font-black shadow-xs ${r.bg}`}
                >
                  {r.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading text-sm font-bold text-foreground truncate">
                      {r.name}
                    </span>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label="Verified Customer" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{r.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Social Proof Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-white/60 bg-white/40 px-6 py-4 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:gap-12">
          <div>
            <span className="font-heading text-2xl font-black text-foreground">4.9/5</span>
            <span className="block text-[11px] font-semibold text-muted-foreground">Average Customer Rating</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border/60" />
          <div>
            <span className="font-heading text-2xl font-black text-foreground">2,500+</span>
            <span className="block text-[11px] font-semibold text-muted-foreground">Packs Delivered</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border/60" />
          <div>
            <span className="font-heading text-2xl font-black text-foreground">100%</span>
            <span className="block text-[11px] font-semibold text-muted-foreground">Zero Preservatives</span>
          </div>
        </div>
      </div>
    </section>
  )
}

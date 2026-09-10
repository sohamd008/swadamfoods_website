import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card/70 p-6 sm:p-10 md:p-12 shadow-sm">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative order-last md:order-first group">
            <Image
              src="/images/kanda-poha.webp"
              alt="Freshly prepared Kanda Poha garnished with coriander and coconut"
              width={540}
              height={405}
              sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
              loading="lazy"
              style={{ aspectRatio: "4/3" }}
              className="relative h-auto w-full rounded-2xl border border-border/80 object-cover shadow-md"
            />
          </div>

          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-1.5 w-fit rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-xs">
              Our Story &amp; Heritage
            </span>
            <h2 className="text-balance font-heading font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Home-style taste, made with care
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Swadam Foods is a women-owned and women-operated business, born from a
              simple idea — bring the honest, home-style flavours of Indian snacks
              to busy kitchens everywhere.
            </p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              No shortcuts, no artificial flavours — just the authentic taste you
              grew up loving, ready whenever you are.
            </p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Based in Pune, Maharashtra, we prepare every batch in small
              quantities to guarantee freshness. Our instant premixes are
              designed for busy households — simply add hot water, wait five
              minutes, and enjoy a home-style breakfast.
            </p>

            <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-border/70 pt-6">
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-3.5 text-center">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Products
                </dt>
                <dd className="font-heading font-serif text-2xl font-bold text-foreground mt-0.5">
                  3
                </dd>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-3.5 text-center">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Preservatives
                </dt>
                <dd className="font-heading font-serif text-2xl font-bold text-foreground mt-0.5">
                  Zero
                </dd>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-3.5 text-center">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Made in
                </dt>
                <dd className="font-heading font-serif text-2xl font-bold text-foreground mt-0.5">
                  Pune
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

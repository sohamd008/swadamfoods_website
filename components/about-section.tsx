import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="glass-panel mx-auto max-w-6xl rounded-[2.5rem] p-6 shadow-2xl sm:p-10 md:p-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative order-last md:order-first group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-lg transition-all group-hover:blur-xl" />
            <Image
              src="/images/kanda-poha.webp"
              alt="Freshly prepared Kanda Poha garnished with coriander and coconut"
              width={1200}
              height={900}
              sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
              loading="lazy"
              className="relative aspect-[4/3] h-auto w-full rounded-3xl border border-white/70 object-cover shadow-xl backdrop-blur-xl dark:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-5">
            <span className="glass-pill w-fit rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
              Our Story
            </span>
            <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
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

            <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-white/40 pt-6 dark:border-white/10">
              <div className="glass-pill rounded-2xl p-3 text-center">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Products
                </dt>
                <dd className="font-heading text-2xl font-black text-foreground">
                  3
                </dd>
              </div>
              <div className="glass-pill rounded-2xl p-3 text-center">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Preservatives
                </dt>
                <dd className="font-heading text-2xl font-black text-foreground">
                  Zero
                </dd>
              </div>
              <div className="glass-pill rounded-2xl p-3 text-center">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Made in
                </dt>
                <dd className="font-heading text-2xl font-black text-foreground">
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

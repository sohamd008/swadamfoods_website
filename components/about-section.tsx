import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
        <div className="relative order-last md:order-first">
          <Image
            src="/images/kanda-poha.png"
            alt="Freshly prepared Kanda Poha garnished with coriander and coconut"
            width={1200}
            height={900}
            sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-3xl border border-border object-cover shadow-lg"
          />
        </div>

        <div className="flex flex-col gap-5">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Story
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Home-style taste, made with care
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Swadam Foods is a women-owned and women-operated business, born from a
            simple idea — bring the honest, home-style flavours of Indian snacks
            to busy kitchens everywhere. Every batch of our Patal Poha Chivda and
            instant premixes is prepared with carefully sourced ingredients and
            time-tested recipes.
          </p>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            No shortcuts, no artificial flavours — just the authentic taste you
            grew up loving, ready whenever you are. We take food safety and
            quality seriously, and we&apos;re proud to be a registered,
            compliant Indian food business.
          </p>

          <dl className="mt-2 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Products
              </dt>
              <dd className="font-heading text-2xl font-extrabold text-foreground">
                3
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Preservatives
              </dt>
              <dd className="font-heading text-2xl font-extrabold text-foreground">
                Zero
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Made in
              </dt>
              <dd className="font-heading text-2xl font-extrabold text-foreground">
                Pune
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

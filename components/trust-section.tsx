import { BadgeCheck, ShieldCheck, HeartHandshake } from "lucide-react"
import { business } from "@/lib/products"

const credentials = [
  {
    icon: HeartHandshake,
    title: "Women-Owned Business",
    description:
      "Solely owned and run by a woman entrepreneur — every recipe and every batch is a labour of love.",
    reg: null,
  },
  {
    icon: BadgeCheck,
    title: "UDYAM MSME Registered",
    description:
      "A recognised Micro enterprise under the Government of India's UDYAM registration.",
    reg: { label: "UDYAM", value: business.udyam },
  },
  {
    icon: ShieldCheck,
    title: "FSSAI Registered",
    description:
      "Registered with the Food Safety and Standards Authority of India for safe, hygienic food business operations.",
    reg: { label: "FSSAI", value: business.fssai },
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="glass-pill rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-xs">
            Why Swadam
          </span>
          <h2 className="mt-4 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Registered and ready to serve
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Shop with confidence and see our business registration details at a glance.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map(({ icon: Icon, title, description, reg }) => (
            <div
              key={title}
              className="glass-card flex flex-col rounded-[2.2rem] p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inner border border-accent/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                {reg && (
                  <span className="glass-pill rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent">
                    Verified
                  </span>
                )}
              </div>

              <h3 className="mt-5 font-heading text-xl font-extrabold text-foreground">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>

              {reg && (
                <div className="mt-6 glass-pill rounded-2xl p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    {reg.label} Reg No.
                  </p>
                  <p className="mt-1 break-all font-mono text-xs font-bold text-foreground">
                    {reg.value}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

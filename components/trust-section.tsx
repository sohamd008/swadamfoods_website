import { BadgeCheck, ShieldCheck, ReceiptText, HeartHandshake } from "lucide-react"
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
  {
    icon: ReceiptText,
    title: "GSTIN Registered",
    description:
      "A GST-registered business with transparent billing information for every order.",
    reg: { label: "GSTIN", value: business.gstin },
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="scroll-mt-20 bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Why Swadam
          </span>
          <h2 className="mt-2 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Registered and ready to serve
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Shop with confidence and see our business registration details at a glance.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map(({ icon: Icon, title, description, reg }) => (
            <div
              key={title}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                {reg && (
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Registered
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>

              {reg && (
                <div className="mt-5 rounded-2xl border border-border bg-secondary/45 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {reg.label} Registration No.
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">
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

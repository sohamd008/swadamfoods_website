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
    title: "FSSAI Compliant",
    description:
      "Manufactured under Food Safety and Standards Authority of India guidelines for safe, hygienic food.",
    reg: { label: "FSSAI", value: business.fssai },
  },
  {
    icon: ReceiptText,
    title: "GSTIN Registered",
    description:
      "A fully GST-registered business, so you always get proper, transparent billing on every order.",
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
            A registered, compliant food business
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Order with confidence — we meet India&apos;s food-safety and business
            standards.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map(({ icon: Icon, title, description, reg }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              {reg && (
                <p className="mt-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  {reg.label}:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {reg.value}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

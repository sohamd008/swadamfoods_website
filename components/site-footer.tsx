import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react"
import { WHATSAPP_NUMBER, business } from "@/lib/products"

export function SiteFooter() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Swadam Foods! I'd like to know more about your products.",
  )}`

  const registrations = [
    { label: "GSTIN", value: business.gstin },
    { label: "FSSAI", value: business.fssai },
    { label: "UDYAM MSME", value: business.udyam },
  ]

  return (
    <footer id="contact" className="scroll-mt-20 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-12 text-center">
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to order?
          </h2>
          <p className="max-w-md text-pretty text-primary-foreground/80">
            Add your favourites to the cart and check out on WhatsApp, or message
            us directly — we&apos;re happy to help.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="w-fit overflow-hidden rounded-xl border border-border bg-[#f7f2e7] p-2">
              <Image
                src="/images/swadam-logo.jpg"
                alt="Swadam Foods logo"
                width={160}
                height={80}
                sizes="80px"
                className="h-16 w-auto"
              />
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Authentic Indian snacks and instant premixes, made with real
              ingredients and traditional recipes. Proudly a women-owned and
              women-operated business.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Get in touch
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {business.phoneDisplay}
            </a>
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {business.email}
            </a>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {business.address}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Registrations
            </span>
            <dl className="flex flex-col gap-2">
              {registrations.map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="font-mono text-sm font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {business.name}. All rights reserved. ·
            Women-owned &amp; operated.
          </p>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link
              href="/terms"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
            <Link
              href="/refund-policy"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Refund &amp; Cancellation Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

import { MessageCircle, Phone } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/products"

export function SiteFooter() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Swadam Foods! I'd like to know more about your products.",
  )}`

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

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="font-heading text-xl font-extrabold text-foreground">
              Swadam Foods
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Authentic Indian snacks and instant premixes, made with real
              ingredients and traditional recipes.
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              UDYAM MSME · FSSAI Compliant · GSTIN Registered
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Get in touch
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
              +91 88888 51522
            </a>
            <p className="text-sm text-muted-foreground">
              Orders &amp; enquiries on WhatsApp Business
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Swadam Foods. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

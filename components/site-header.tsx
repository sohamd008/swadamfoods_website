import Image from "next/image"
import { CartButton } from "@/components/cart-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileMenu } from "@/components/mobile-menu"

export const navLinks = [
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#trust" },
  { label: "Track Order", href: "/track" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-50 mx-auto max-w-6xl px-3 sm:px-6">
      <div className="glass-header flex h-16 items-center justify-between gap-2 sm:gap-4 rounded-full px-3.5 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2 sm:gap-3 transition-transform hover:scale-[1.02] active:scale-95">
          <span className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7]/90 p-1 shadow-sm ring-1 ring-white/60">
            <Image
              src="/images/swadam-logo.webp"
              alt="Swadam Foods logo"
              width={448}
              height={244}
              sizes="59px"
              priority
              className="h-8 w-auto shrink-0"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-heading font-serif text-xl font-bold tracking-tight text-foreground">
              <span className="whitespace-nowrap">Swadam Foods</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Taste of Purity and Care
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-xs lg:text-sm font-medium text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:shadow-xs"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

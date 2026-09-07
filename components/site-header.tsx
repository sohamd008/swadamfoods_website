import Image from "next/image"
import { CartButton } from "@/components/cart-button"
import { ThemeToggle } from "@/components/theme-toggle"

export const navLinks = [
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#trust" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="flex items-center justify-center overflow-hidden rounded-xl bg-[#f7f2e7] p-1 ring-1 ring-border">
            <Image
              src="/images/swadam-logo.webp"
              alt="Swadam Foods logo"
              width={112}
              height={36}
              sizes="56px"
              className="h-9 w-auto shrink-0"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              <span className="whitespace-nowrap">Swadam Foods</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Taste of Purity and Care
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CartButton />
          <MobileMenu />
        </div>
    </header>
  )
}

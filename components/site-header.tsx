import Image from "next/image"
import { CartButton } from "@/components/cart-button"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#trust" },
  { label: "Contact", href: "#contact" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex items-center justify-center overflow-hidden rounded-xl bg-[#f7f2e7] p-1 ring-1 ring-border">
            <Image
              src="/images/swadam-logo.webp"
              alt="Swadam Foods logo"
              width={112}
              height={36}
              sizes="56px"
              className="h-9 w-auto"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              Swadam Foods
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Taste of Purity and Care
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
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
        </div>
      </div>
    </header>
  )
}

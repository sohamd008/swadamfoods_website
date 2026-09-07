"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { navLinks } from "@/components/site-header"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      <div id="mobile-nav" className={`md:hidden ${open ? "block" : "hidden"}`}>
        <nav className="flex flex-col gap-1 border-t border-border bg-background/95 px-4 pb-4 pt-2 shadow-lg" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}

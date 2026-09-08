"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { navLinks } from "@/components/site-header"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="glass-pill flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all hover:scale-105 active:scale-95 md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-md animate-in fade-in duration-200 md:hidden">
          <div className="flex h-20 items-center justify-between px-6">
            <span className="font-heading text-lg font-black text-white">Swadam Foods</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xl"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav id="mobile-nav" className="flex flex-col gap-2.5 px-6 pt-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="glass-panel flex items-center justify-between rounded-2xl px-5 py-4 text-base font-extrabold text-foreground shadow-lg active:scale-98"
              >
                <span>{link.label}</span>
                <span className="text-xs font-bold text-primary">→</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

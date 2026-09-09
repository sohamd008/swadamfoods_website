"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

type LegalSection = {
  heading?: string
  paragraphs: string[]
}

export function LegalPage({
  title,
  intro,
  sections,
  updatedAt = "8 September 2026",
}: {
  title: string
  intro?: string
  sections: LegalSection[]
  updatedAt?: string
}) {
  const router = useRouter()

  useEffect(() => {
    try {
      sessionStorage.setItem("swadam_viewing_policy", "true")
    } catch {
    }
  }, [])

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      const fromHome = sessionStorage.getItem("swadam_from_home") === "true"
      if (fromHome && window.history.length > 1) {
        e.preventDefault()
        sessionStorage.setItem("swadam_viewing_policy", "true")
        router.back()
        return
      }
    } catch {
    }
  }

  return (
    <main className="ambient-bg min-h-dvh py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="glass-card rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-white/60 dark:border-white/10">
          <a
            href="/#footer"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </a>

          <h1 className="mt-6 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Last updated: {updatedAt}
          </p>

          {intro ? (
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {intro}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-8 border-t border-border/60 pt-8">
            {sections.map((section, i) => (
              <section key={section.heading ?? i} className="flex flex-col gap-3">
                {section.heading ? (
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {section.heading}
                  </h2>
                ) : null}
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
            <a
              href="/#footer"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xs font-bold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Back to top &uarr;
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

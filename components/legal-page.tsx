import Link from "next/link"
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
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <h1 className="mt-8 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
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

        <div className="mt-10 flex flex-col gap-8">
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
      </div>
    </main>
  )
}

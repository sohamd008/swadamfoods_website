import Link from "next/link"
import Image from "next/image"
import { Home, ArrowRight, MessageSquare, Compass } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/products"

export default function NotFound() {
  return (
    <div className="ambient-bg flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[750px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-400/10 to-emerald-400/15 blur-3xl opacity-75 dark:from-amber-600/15 dark:to-emerald-600/10" />

      <main className="glass-card mx-auto flex w-full max-w-lg flex-col items-center rounded-[2.5rem] border border-white/80 p-8 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-stone-900/80 sm:p-12">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7]/90 p-1.5 shadow-sm ring-1 ring-white/60">
              <Image
                src="/images/swadam-logo.webp"
                alt="Swadam Foods"
                width={120}
                height={48}
                className="h-9 w-auto shrink-0"
                priority
              />
            </span>
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary shadow-xs">
          <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>Error 404 · Page Not Found</span>
        </div>

        <h1 className="mt-5 font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          This page could not be found.
        </h1>

        <p className="mt-3 text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
          The link you followed may be broken, or the page may have been moved. Don&apos;t worry, your favourite snacks and premixes are waiting on the home store!
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="group flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-full border border-white/70 bg-white/45 px-6 py-3.5 text-sm font-extrabold text-foreground shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-xl active:scale-95 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <Home className="h-4 w-4 text-primary transition-transform group-hover:scale-110" aria-hidden="true" />
            <span>Return to Home</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            href="/track"
            className="glass-pill flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-xs font-bold text-foreground transition-all hover:bg-white/70 dark:hover:bg-white/10 active:scale-95"
          >
            <span>Track Your Order</span>
          </Link>
        </div>

        <div className="mt-8 border-t border-stone-200/60 pt-5 text-center dark:border-stone-800/60">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Swadam Foods, I need help finding something on your website.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Need help? Chat with us on WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  )
}

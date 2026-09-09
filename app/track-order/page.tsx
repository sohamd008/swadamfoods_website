import type { Metadata } from "next"
import { Suspense } from "react"
import { TrackOrderPage } from "@/components/track-order-page"

export const metadata: Metadata = {
  title: "Track Your Order | Swadam Foods",
  description: "Verify your mobile number and track your Swadam Foods order status and delivery updates.",
}

export default function TrackOrderAliasPage() {
  return (
    <Suspense
      fallback={
        <div className="ambient-bg flex min-h-screen items-center justify-center p-4">
          <div className="glass-card flex flex-col items-center space-y-4 rounded-3xl p-8 text-center shadow-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading tracking system...</p>
          </div>
        </div>
      }
    >
      <TrackOrderPage />
    </Suspense>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"
import { TrackOrderPage } from "@/components/track-order-page"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order #${id} | Swadam Foods Tracking`,
    description: `Track the status of Swadam Foods order ${id}.`,
  }
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense
      fallback={
        <div className="ambient-bg flex min-h-screen items-center justify-center p-4">
          <div className="glass-card flex flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading order details…</p>
          </div>
        </div>
      }
    >
      <TrackOrderPage initialOrderId={id} />
    </Suspense>
  )
}

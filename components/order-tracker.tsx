"use client"

import { TrackOrderPage } from "@/components/track-order-page"

export function OrderTracker({ orderId }: { orderId: string }) {
  return <TrackOrderPage initialOrderId={orderId} />
}

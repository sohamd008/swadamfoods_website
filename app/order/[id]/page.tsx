import type { Metadata } from "next"
import { OrderTracker } from "@/components/order-tracker"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order #${id} | Swadam Foods Tracking`,
    description: `Track live order status for Swadam Foods order ${id}`,
  }
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderTracker orderId={id} />
}

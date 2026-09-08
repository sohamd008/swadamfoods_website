import type { Metadata } from "next"
import { CheckoutPage } from "@/components/checkout-page"

export const metadata: Metadata = {
  title: "Checkout | Swadam Foods",
  description: "Secure checkout for your Swadam Foods order.",
  robots: { index: false, follow: false },
}

export default function CheckoutRoute() {
  return <CheckoutPage />
}

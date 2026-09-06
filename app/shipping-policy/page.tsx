import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Shipping Policy | Swadam Foods",
  description: "Shipping and delivery policy for Swadam Foods orders.",
}

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      sections={[
        {
          heading: "Shipping & Delivery",
          paragraphs: [
            `Orders are shipped through registered domestic courier companies and/or Speed Post where applicable. Orders are shipped within 5 days from the date of the order and/or payment, or as per the delivery date agreed at the time of order confirmation, subject to courier company / post office norms. ${business.name} shall not be liable for delays caused by the courier company or postal authority.`,
            "Delivery will be made to the address provided by the buyer at the time of purchase. If any shipping costs are levied by Swadam Foods or the delivery provider, such shipping costs are not refundable unless otherwise required by applicable law.",
          ],
        },
        {
          heading: "Delivery Information",
          paragraphs: [
            "Please provide a complete and accurate delivery address when placing your order. Delivery timelines may vary depending on the destination, courier availability and other circumstances outside our control.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For questions regarding shipping or delivery, please contact ${business.name} at ${business.email} / ${business.phoneDisplay}.`,
          ],
        },
      ]}
    />
  )
}

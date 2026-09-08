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
      intro="This policy explains how Swadam Foods handles delivery of food products ordered through our website. Delivery availability, timing and charges can depend on destination and the delivery provider available for the order."
      sections={[
        {
          heading: "Pune Home Delivery",
          paragraphs: [
            "For eligible Pune addresses, home delivery may be offered free of charge as shown at checkout. The actual service area may depend on operational availability at the time of the order.",
          ],
        },
        {
          heading: "Outside Pune",
          paragraphs: [
            "For addresses outside Pune, we may arrange delivery through a third-party logistics provider such as Porter where service is available. Delivery availability and applicable charges will be confirmed before dispatch where an additional charge applies. We will not silently add an undisclosed delivery fee to the checkout total.",
          ],
        },
        {
          heading: "Dispatch & Delivery Timelines",
          paragraphs: [
            "We will communicate the expected dispatch or delivery timeline during order confirmation where reasonably possible. Timelines are estimates and may vary due to destination, logistics capacity, weather, traffic, holidays, service interruptions or other events outside our reasonable control.",
            "Delivery is made to the address supplied by the customer. Incorrect or incomplete address details can cause delay, failed delivery or additional logistics costs for which the customer may be responsible where permitted by applicable law and after reasonable notice.",
          ],
        },
        {
          heading: "Delivery Attempts & Receipt",
          paragraphs: [
            "Please ensure someone is available to receive the order when a delivery is scheduled. Customers should inspect the outer packaging at delivery where practical and contact us promptly if the package appears visibly damaged, tampered with or otherwise unsafe.",
          ],
        },
        {
          heading: "Third-Party Delivery Providers",
          paragraphs: [
            "Where a third-party logistics provider is used, its applicable delivery terms may also apply. We will reasonably assist with delivery issues that are reported to us, but we cannot guarantee a delivery time controlled by an independent provider.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For shipping and delivery questions, contact ${business.name} at ${business.email} or ${business.phoneDisplay}. Please include your order ID and delivery pincode.`,
          ],
        },
      ]}
    />
  )
}

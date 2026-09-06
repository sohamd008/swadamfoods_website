import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Swadam Foods",
  description: "Cancellation and refund policy for Swadam Foods orders.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro="This refund and cancellation policy outlines how you can cancel or seek a refund for a product or service that you have purchased through the Platform."
      sections={[
        {
          heading: "Cancellation",
          paragraphs: [
            "Cancellations will only be considered if the request is made within 7 days of placing the order. However, cancellation requests may not be entertained if the order has been communicated for shipping, the shipping process has been initiated, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.",
            `${business.name} does not accept cancellation requests for perishable items like eatables. However, a refund or replacement can be made if the customer establishes that the quality of the product delivered is not good.`,
          ],
        },
        {
          heading: "Damaged or Defective Products",
          paragraphs: [
            "In case of receipt of damaged or defective items, please report the issue to our customer service team. The request will be entertained once the product has been checked and the same is determined by us. This should be reported within 7 days of receipt of products.",
            "If you feel that the product received is not as shown on the site or is not as per your expectations, you must bring it to the notice of our customer service within 7 days of receiving the product. Our customer service team, after looking into your complaint, will take an appropriate decision.",
          ],
        },
        {
          heading: "Manufacturer Warranty",
          paragraphs: [
            "In case of complaints regarding products that come with a warranty from the manufacturers, please refer the issue to the manufacturer concerned.",
          ],
        },
        {
          heading: "Refund Processing",
          paragraphs: [
            "In case any refund is approved by Swadam Foods, it will take 5 days for the refund to be processed.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For cancellation or refund requests, please contact ${business.name} at ${business.email} / ${business.phoneDisplay}.`,
          ],
        },
      ]}
    />
  )
}

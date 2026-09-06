import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Return Policy | Swadam Foods",
  description: "Return and exchange policy for Swadam Foods orders.",
}

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      title="Return Policy"
      sections={[
        {
          heading: "Return & Exchange Eligibility",
          paragraphs: [
            "We offer refund / exchange within the first 2 days from the date of purchase. If 2 days have passed since your purchase, you will not be offered a return, exchange or refund of any kind.",
            "To become eligible for a return or an exchange, the purchased item should be unused and in the same condition as you received it, and the item must have its original packaging. Items purchased on sale may not be eligible for a return / exchange. Only items found defective or damaged may be replaced based on an approved exchange request.",
          ],
        },
        {
          heading: "Exempt Products",
          paragraphs: [
            "There may be certain categories of products / items that are exempted from returns or refunds. Such categories will be identified to you at the time of purchase.",
          ],
        },
        {
          heading: "Inspection & Processing",
          paragraphs: [
            "For an accepted exchange / return request, once the returned product / item is received and inspected by us, we will notify you about receipt of the returned / exchanged product. If the request is approved after our quality check, the return or exchange will be processed in accordance with our policies.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For return or exchange requests, please contact ${business.name} at ${business.email} / ${business.phoneDisplay}.`,
          ],
        },
      ]}
    />
  )
}

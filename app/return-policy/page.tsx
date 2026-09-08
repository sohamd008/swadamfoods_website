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
      intro="All return, exchange, replacement and refund requests are subject to review and approval by Swadam Foods. Submission of a request does not create an automatic right to a return, exchange, replacement or refund."
      sections={[
        {
          heading: "Return & Exchange Eligibility",
          paragraphs: [
            "We may offer a refund / exchange within the first 2 days from the date of purchase, subject to review and approval by Swadam Foods. If 2 days have passed since your purchase, you will not be offered a return, exchange or refund of any kind.",
            "To be considered for a return or an exchange, the purchased item should be unused and in the same condition as you received it, and the item must have its original packaging. Items purchased on sale may not be eligible for a return / exchange. Only items found defective or damaged may be replaced based on an exchange request approved by Swadam Foods.",
          ],
        },
        {
          heading: "Exempt Products",
          paragraphs: [
            "There may be certain categories of products / items that are exempted from returns or refunds. Such categories will be identified to you at the time of purchase. Any applicable return, exchange, replacement or refund remains subject to approval by Swadam Foods.",
          ],
        },
        {
          heading: "Inspection & Processing",
          paragraphs: [
            "For an accepted exchange / return request, once the returned product / item is received and inspected by us, we will notify you about receipt of the returned / exchanged product. If the request is approved after our quality check, the return or exchange will be processed in accordance with our policies. Approval of the request is at the discretion of Swadam Foods, subject to applicable law.",
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

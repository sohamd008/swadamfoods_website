import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Swadam Foods",
  description:
    "Cancellation, replacement, and refund terms for orders placed with Swadam Foods.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      sections={[
        {
          heading: "Cancellation Terms",
          paragraphs: [
            `After making payment to Swadam Foods, customers may request for cancelling the order within 6 hours of payment by contacting ${business.legalEmail} or ${business.legalPhone}. Swadam Foods reserves the right to accept or reject any cancellation request at its sole discretion, including cases where order processing, dispatch, or service preparation has already begun. Any concerns or disputes will be handled directly between Swadam Foods and the customer.`,
          ],
        },
        {
          heading: "Replacement Terms",
          paragraphs: [
            `Swadam Foods entertains requests for replacement only in cases of proven product defects, damage during transit, or service issues. Refunds are not provided under any circumstances. To request a replacement, customers must contact Swadam Foods via ${business.legalEmail} or ${business.legalPhone} within 2 days of delivery / service completion, along with the invoices, order information and supporting details to establish the alleged defects, damages, or deficiencies.`,
            "Swadam Foods may accept or reject a replacement request at its sole discretion. If Swadam Foods approves the replacement request, the replacement will be processed within the timeline communicated by Swadam Foods. Any concerns or disputes will be handled directly between Swadam Foods and the customer.",
          ],
        },
        {
          heading: "Refund Terms",
          paragraphs: [
            `Swadam Foods entertains requests for refunds only in cases of proven defects in product, damage during transit, service issues. To make a request, customers should contact Swadam Foods via ${business.legalEmail} or ${business.legalPhone} within 7 days of delivery / service completion with the invoices, order information and supporting information to establish the alleged defects, damages or deficiencies.`,
            "Swadam Foods may accept or reject a request for refund at its sole discretion. If Swadam Foods approves the refund request, refunds will be processed within the timeline communicated by Swadam Foods. Any concerns or disputes will be handled directly between Swadam Foods and the customer.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For any cancellation, refund, or return requests, please contact us at ${business.legalEmail} / ${business.legalPhone}.`,
          ],
        },
      ]}
    />
  )
}

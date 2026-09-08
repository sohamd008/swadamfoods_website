import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Return Policy | Swadam Foods",
  description: "Return, replacement and exchange policy for Swadam Foods food products.",
}

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      title="Return Policy"
      intro="Because our products are packaged food items, ordinary change-of-mind returns are generally not accepted after delivery. We do, however, want to resolve genuine cases involving damaged, tampered, incorrect or qualifying quality issues."
      sections={[
        {
          heading: "When You Should Contact Us",
          paragraphs: [
            `Please contact ${business.name} within 48 hours of delivery if you receive an incorrect, visibly damaged, tampered, leaking, materially incomplete, or otherwise qualifying product issue. Contact us at ${business.email} or ${business.phoneDisplay} and mention the order ID.`,
            "For quality concerns, describe the issue clearly and, where reasonably possible, retain the product, packaging and batch information until we finish our review.",
          ],
        },
        {
          heading: "Food-Safety & Change-of-Mind Returns",
          paragraphs: [
            "Opened or used food products are generally not eligible for return or exchange because of hygiene and food-safety considerations. Change-of-mind, taste preference or failure to read the product information before purchase generally does not qualify for a return or refund, subject to applicable law.",
          ],
        },
        {
          heading: "Eligibility for Replacement or Refund",
          paragraphs: [
            "After reviewing the complaint, Swadam Foods may offer an appropriate remedy such as replacement, refund or another resolution where the issue is verified and the remedy is appropriate. The exact remedy may depend on the nature of the problem, product availability and applicable law.",
            "If the issue concerns damage caused during delivery, we may request photographs or other reasonable evidence so that we can investigate with the delivery provider.",
          ],
        },
        {
          heading: "Inspection",
          paragraphs: [
            "Where a return is exceptionally approved, we may arrange collection or provide return instructions. Any returned product must be handled safely and retained as instructed until the review is complete. We may decline a return where the product has been opened, altered, stored improperly, or otherwise cannot be reasonably inspected, subject to applicable law.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For return, replacement or quality complaints, contact ${business.name} at ${business.email} or ${business.phoneDisplay}. Please include the order ID and a description of the issue.`,
          ],
        },
      ]}
    />
  )
}

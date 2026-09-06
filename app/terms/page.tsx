import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Terms of Service | Swadam Foods",
  description:
    "Terms and Conditions governing the use of the Swadam Foods website and purchase of our products.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These Terms and Conditions ("Terms") constitute a binding agreement between Swadam Foods ("we," "us," or "our") and you ("you" or "your"), governing your use of our website and/or purchase of goods/services from us (collectively, "Services"). By using our website and/or making a purchase from us, you expressly agree to the following Terms.`}
      sections={[
        {
          heading: "1. Use of Services",
          paragraphs: [
            "You shall not use our website and/or Services for any purpose that is unlawful, illegal or prohibited under Indian laws, or any other local laws that might apply to you.",
            "It is your responsibility to ensure that any goods, services, or information available through our website meet your specific requirements.",
          ],
        },
        {
          heading: "2. Orders & Availability",
          paragraphs: [
            "You agree to provide accurate and complete information for order fulfilment and service delivery. We shall not be liable for issues resulting from incorrect or incomplete information you provide to us.",
            "All purchases/orders are subject to availability.",
            "We reserve the right to cancel orders at our discretion, including but not limited to cases of non-availability of goods you wish to purchase from us or if the order is suspected of fraud.",
          ],
        },
        {
          heading: "3. Payments",
          paragraphs: [
            "Payments must be made in full at the time of purchase unless otherwise agreed upon by us.",
            "You must ensure that the payment details provided are valid and belong to you.",
          ],
        },
        {
          heading: "4. Liability",
          paragraphs: [
            "We shall not be liable for any loss or damage arising from the use of our Services, whether direct, indirect, or consequential.",
            "We shall not be liable for any loss or damage arising directly or indirectly from the decline of authorization for any transaction due to the Cardholder exceeding the preset limit mutually agreed upon with our acquiring bank.",
          ],
        },
        {
          heading: "5. Governing Law & Disputes",
          paragraphs: [
            "Any dispute arising out of the use of our website, purchase from us, or any engagement with us shall be subject to the laws of India.",
          ],
        },
        {
          heading: "6. Contact Information",
          paragraphs: [
            `If you have any questions regarding these Terms, please contact us at ${business.legalEmail} / ${business.legalPhone}.`,
          ],
        },
      ]}
    />
  )
}

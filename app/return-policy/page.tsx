import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Return Policy | Swadam Foods",
  description: "Food safety non-returnable notice and return-free replacement policy for Swadam Foods under FSSAI and Indian Consumer Protection regulations.",
}

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      title="Return Policy"
      updatedAt="9 September 2026"
      intro={`At ${business.name}, we hold the safety, hygiene, and freshness of our food products to the highest standards. This Return Policy explains why packaged food items are non-returnable once delivered, and how we protect our consumers through our Return-Free Replacement and Refund Guarantee under Indian Law.`}
      sections={[
        {
          heading: "1. Non-Returnable Nature of Packaged Food Items",
          paragraphs: [
            "In strict compliance with the Food Safety and Standards Act, 2006 (FSSA 2006) and regulations set forth by the Food Safety and Standards Authority of India (FSSAI), all consumable food products (including Patal Poha Chivda, Instant Kanda Poha Premix, and Instant Upma Premix) are NON-RETURNABLE once delivered and accepted.",
            "Why food items cannot be physically returned: Once a food package leaves our monitored storage environment and is received by a household, it cannot be safely reintroduced into commerce or restocked due to risks of exposure to environmental moisture, temperature fluctuations, and cross-contamination. This policy protects all our customers by guaranteeing that every pack dispatched is 100% factory-fresh and untampered.",
          ],
        },
        {
          heading: "2. Doorstep Rejection for Damaged Parcels",
          paragraphs: [
            "If a delivery courier partner arrives with a parcel that is visibly severely damaged, opened, crushed, or leaking, you have the right to refuse acceptance at the doorstep.",
            "Simply mark the delivery receipt / status as \"Refused due to outer parcel damage\" and immediately notify our support team on WhatsApp at +91 88888 51522 or email swadamfoodsindia@gmail.com. We will immediately dispatch a fresh replacement parcel or issue a 100% full refund.",
          ],
        },
        {
          heading: "3. Return-Free Replacement & Refund Guarantee",
          paragraphs: [
            "Even though physical returns of food items are not accepted, you are 100% financially and qualitatively protected under the Consumer Protection Act, 2019:",
            "If your product arrives in any of the following conditions:",
            "• Outer package torn, punctured, or seal broken.",
            "• Damaged or compromised during transit.",
            "• Expired product or past \"Best Before\" date.",
            "• Wrong product item or quantity dispatched in error.",
            "• Verified quality defect upon opening.",
            "You do NOT need to mail or ship the food back to us. We will provide a 100% Return-Free Resolution (either an immediate free priority replacement sent to your address or a full refund credited to your original payment method).",
          ],
        },
        {
          heading: "4. How to Report an Issue",
          paragraphs: [
            "1. Timeframe: Report the issue within forty-eight (48) hours of receipt of the parcel.",
            "2. How to Contact: Message our team on WhatsApp (+91 88888 51522) or email swadamfoodsindia@gmail.com with your Order ID and photo proof showing the damaged pack and batch number.",
            "3. Fast Resolution: Our team verifies reports within 24 hours. Replacements are dispatched on the next business day, or refunds are initiated within 24–48 hours directly to your payment source.",
          ],
        },
        {
          heading: "5. Customer Grievance Officer",
          paragraphs: [
            `If you have any questions or require escalation regarding returns or replacements, please contact our designated Grievance Officer:`,
            `Name: ${business.grievanceOfficer}\nEntity: ${business.name} (Proprietorship: ${business.proprietor})\nAddress: ${business.address}\nEmail: ${business.email}\nPhone / WhatsApp: ${business.phoneDisplay}\nWorking Hours: Monday to Saturday, 09:30 AM to 06:30 PM IST`,
          ],
        },
      ]}
    />
  )
}

import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Swadam Foods",
  description: "Cancellation, return-free refund, and replacement policy for Swadam Foods orders under the Consumer Protection (E-Commerce) Rules, 2020.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      updatedAt="9 September 2026"
      intro={`At ${business.name}, we are committed to delivering authentic, freshly prepared, and hygienically packed snacks and instant premixes. This policy outlines how order cancellations, replacements, and refunds are handled in accordance with the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.`}
      sections={[
        {
          heading: "1. Order Cancellation by Customer",
          paragraphs: [
            "• Cancellation Window: You may request cancellation of your order free of charge before the order is dispatched or marked for preparation in our kitchen (typically within two (2) hours of placing your order).",
            "• Post-Dispatch Orders: Once an order has been prepared, packed, or dispatched with our courier/delivery partners, cancellation requests cannot be accepted because fresh, packaged food items cannot be reused or restocked once dispatched.",
            "• To cancel an eligible order, please message us immediately on WhatsApp (+91 88888 51522) or email swadamfoodsindia@gmail.com with your unique Order ID. If the order has not been dispatched, we will cancel the order and initiate a 100% refund immediately.",
          ],
        },
        {
          heading: "2. Order Cancellation by Swadam Foods",
          paragraphs: [
            "We reserve the right to cancel an order under exceptional circumstances, such as: (a) your delivery address is in an unserviceable area or non-deliverable pincode; (b) unforeseen ingredient stock shortages; (c) Force Majeure events affecting operations; or (d) suspected fraudulent payment activity.",
            "If an order is cancelled by Swadam Foods, you will be notified immediately via WhatsApp/SMS/Email, and a 100% full refund of the amount paid will be issued back to your original payment instrument without any deduction or cancellation fee.",
          ],
        },
        {
          heading: "3. Refund & Replacement Eligibility for Food Products",
          paragraphs: [
            "Under Indian food safety standards (FSSAI) and consumer protection norms, packaged food items cannot be returned once delivered and accepted. However, we provide an immediate 100% full refund or free replacement in any of the following verified instances:",
            "• Damaged in Transit: The outer parcel or product packaging is visibly broken, punctured, torn, or crushed upon arrival.",
            "• Tampered Seal: The security or tamper-evident seal on the food pack is broken upon delivery.",
            "• Defective Quality / Spoilage: The product does not meet our freshness and quality standards upon opening.",
            "• Past Expiry: The product delivered is past its printed \"Best Before\" or manufacturing shelf-life date.",
            "• Incorrect or Missing Item: You received a different product variant, wrong item, or missing packet from what was ordered.",
          ],
        },
        {
          heading: "4. How to Claim a Refund or Replacement",
          paragraphs: [
            "1. Reporting Timeframe: Please notify us within forty-eight (48) hours of delivery.",
            "2. Supporting Proof: Send a message to our customer care team via WhatsApp at +91 88888 51522 or email swadamfoodsindia@gmail.com with your Order ID, a brief description of the issue, and clear photographs or an unboxing video showing the damaged packet, packaging, and batch number.",
            "3. Resolution: Our quality team will review your report within twenty-four (24) hours. Upon verification, you may choose between: (a) an immediate free priority replacement dispatched at zero cost to you; or (b) a 100% refund credited to your original payment method.",
            "Note: Because our products are consumable food items, you are NOT required to ship back damaged or spoiled food packets.",
          ],
        },
        {
          heading: "5. Refund Method & Processing Timelines",
          paragraphs: [
            "• Source Instrument Credit: In compliance with Reserve Bank of India (RBI) regulations, approved refunds for online payments are credited exclusively back to the original payment source (UPI account, Debit Card, Credit Card, or NetBanking) used at the time of purchase.",
            "• Processing Timeline: Once approved by our team, the refund transaction is initiated through our payment gateway (PhonePe / Razorpay) within twenty-four (24) to forty-eight (48) hours.",
            "• Bank Credit Timeline: The refunded amount typically reflects in your bank account or card balance within five (5) to seven (7) business days, depending on your bank's clearance cycles.",
          ],
        },
        {
          heading: "6. Grievance & Escalation",
          paragraphs: [
            `If your refund or replacement request has not been addressed within the committed timeframe, you may escalate the issue directly to our Grievance Officer:`,
            `Name: ${business.grievanceOfficer}\nEntity: ${business.name} (Proprietorship: ${business.proprietor})\nAddress: ${business.address}\nEmail: ${business.email}\nPhone / WhatsApp: ${business.phoneDisplay}\nWorking Hours: Monday to Saturday, 09:30 AM to 06:30 PM IST`,
          ],
        },
      ]}
    />
  )
}

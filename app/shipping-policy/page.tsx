import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Swadam Foods",
  description: "Shipping timelines, delivery coverage, packaging standards, and tracking disclosures for Swadam Foods orders under Indian E-Commerce regulations.",
}

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      updatedAt="9 September 2026"
      intro={`At ${business.name}, we take immense care to ensure that your favourite authentic Maharashtrian snacks and instant premixes are prepared fresh, packaged securely, and delivered to your doorstep in pristine condition. This Shipping & Delivery Policy outlines our delivery methods, timelines, shipping charges, and tracking procedures in accordance with the Consumer Protection (E-Commerce) Rules, 2020.`}
      sections={[
        {
          heading: "1. Delivery Zones & Delivery Methods",
          paragraphs: [
            "We currently fulfill orders across Pune and deliver to serviceable postal pincodes throughout India:",
            "• Local Delivery in Pune: Orders within Pune municipal limits are delivered directly via our dedicated local delivery team or on-demand logistics partners (such as Porter). Delivery typically takes one (1) to two (2) business days.",
            "• Domestic Deliveries (Rest of Maharashtra & India): Orders outside Pune are shipped via reputed, registered commercial courier companies (e.g., Delhivery, Blue Dart, DTDC) or India Post Speed Post. Delivery timelines typically range from three (3) to seven (7) business days, depending on destination connectivity.",
          ],
        },
        {
          heading: "2. Order Processing & Dispatch Timelines",
          paragraphs: [
            "• Preparation & Dispatch: Because our snacks and premixes are freshly packed in small batches, orders are prepared and dispatched within twenty-four (24) to forty-eight (48) hours of successful payment confirmation.",
            "• Operating Days: Our fulfillment kitchen operates Monday through Saturday. Orders placed on Sundays or gazetted public holidays are processed and dispatched on the immediate following working day.",
            "• Pincode Verification: Deliverability is determined based on the 6-digit postal pincode entered during checkout. If a pincode is temporarily unserviceable by our courier partners, we will contact you immediately to arrange alternate shipping or issue an instant 100% refund.",
          ],
        },
        {
          heading: "3. Shipping Charges & Transparent Pricing",
          paragraphs: [
            "In strict compliance with the Consumer Protection (E-Commerce) Rules, 2020, Swadam Foods does not impose unexpected or hidden delivery fees at checkout:",
            "• Pune City: Standard home delivery in Pune is FREE for qualifying orders as indicated during checkout.",
            "• Outside Pune / Domestic Express: Any applicable nominal courier or intercity freight charges are calculated transparently and presented for your confirmation prior to making payment.",
          ],
        },
        {
          heading: "4. Live Order Tracking & Dispatch Alerts",
          paragraphs: [
            "In compliance with statutory requirements, transparency in tracking is maintained at every step:",
            "• Live Tracking Page: You can monitor the progress of your order in real time on our website at https://swadamfoods.eu.cc/order/[your-order-id].",
            "• Instant WhatsApp Updates: When your order moves from Accepted to Preparing, Packed, and Out for Delivery, our system automatically transmits live status alerts directly to your registered WhatsApp mobile number.",
            "• Courier Waybill / AWB: For domestic shipments outside Pune, your tracking number (AWB) and courier tracking portal link will be shared as soon as the package is handed over to the courier partner.",
          ],
        },
        {
          heading: "5. Packaging Standards & Food Protection",
          paragraphs: [
            "All products are packed in certified multi-layer, food-grade, moisture-resistant packaging that preserves crispness, aroma, and freshness. For transit protection, items are placed in sturdy corrugated outer shipping boxes with protective cushioning to prevent crushing or puncture during transport.",
          ],
        },
        {
          heading: "6. Non-Delivery, Address Errors & Transit Damage",
          paragraphs: [
            "• Address Accuracy: Customers are requested to ensure their delivery address, landmark, and 6-digit pincode are completely accurate. Swadam Foods cannot be held liable for delivery delays or failed deliveries caused by incorrect or incomplete address information.",
            "• Unsuccessful Delivery Attempts: Couriers will attempt delivery up to two (2) times and attempt to contact you on your registered phone number. If delivery fails because the customer is unavailable or contact cannot be established, the package may be returned to our facility.",
            "• Transit Damage: If your package arrives visibly damaged or tampered with, you may reject it at the doorstep or report it with photographs to our customer care team within 48 hours for an immediate free replacement under our Refund & Cancellation Policy.",
          ],
        },
        {
          heading: "7. Customer Support & Shipping Inquiries",
          paragraphs: [
            `For any queries or assistance regarding your shipment, please reach out to:`,
            `Customer Care: ${business.phoneDisplay} (WhatsApp / Call)\nEmail: ${business.email}\nOperating Entity: ${business.name} (Proprietorship: ${business.proprietor})\nRegistered Kitchen Address: ${business.address}\nSupport Hours: Monday to Saturday, 09:30 AM to 06:30 PM IST`,
          ],
        },
      ]}
    />
  )
}

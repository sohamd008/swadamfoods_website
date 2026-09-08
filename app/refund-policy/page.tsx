import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Swadam Foods",
  description: "Cancellation, failed-payment and refund policy for Swadam Foods orders.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro="This policy explains when an order may be cancelled and how approved refunds are handled for Swadam Foods purchases. Food products are handled carefully because of their nature and food-safety requirements."
      sections={[
        {
          heading: "Order Cancellation",
          paragraphs: [
            "You may request cancellation as soon as possible after placing an order. Cancellation is generally possible before the order has been accepted for fulfilment, prepared, packed, or dispatched. Once preparation or dispatch has started, cancellation may no longer be possible except where required by applicable law.",
            "To request cancellation, contact us using the details below and provide your order ID. We will confirm whether the order can still be cancelled.",
          ],
        },
        {
          heading: "Failed, Expired or Pending Payments",
          paragraphs: [
            "A failed or expired payment does not by itself confirm a paid order. Payment status is reconciled against our server-side order records and information received from the relevant payment provider.",
            "If money has been debited from your account but the payment is shown as pending or the order has not been confirmed, do not make repeated payments immediately. Contact us with the order ID and relevant payment details so we can reconcile the transaction with PhonePe or Razorpay and determine the appropriate outcome.",
          ],
        },
        {
          heading: "When a Refund May Be Approved",
          paragraphs: [
            "A refund may be approved for reasons including a cancelled order that has already been paid, a duplicate successful charge, an order cancelled by Swadam Foods after payment, or a qualifying issue with a delivered product under our Return Policy. All requests remain subject to verification and applicable law.",
            "Because our products are food items, change-of-mind refunds after delivery are generally not available, particularly for opened or used products, unless required by applicable law or approved following a qualifying quality, damage, shortage or wrong-item issue.",
          ],
        },
        {
          heading: "How Refunds Are Processed",
          paragraphs: [
            "Where an online payment was made, an approved refund will generally be initiated through the payment provider used for that transaction, such as PhonePe or Razorpay, and returned to the original payment instrument or through the method permitted by the provider.",
            "Swadam Foods may take up to 7 business days to initiate or complete an approved refund after the required verification is finished. Your bank or payment provider may require additional time to credit the refunded amount. The actual crediting timeline is outside our direct control.",
          ],
        },
        {
          heading: "Duplicate or Incorrect Charges",
          paragraphs: [
            "If you believe you have been charged more than once for the same order, contact us promptly with the order ID and transaction references. We will check our records and the relevant payment provider before issuing any eligible refund.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For cancellation, payment or refund requests, contact ${business.name} at ${business.email} or ${business.phoneDisplay}. Please include your order ID whenever available.`,
          ],
        },
      ]}
    />
  )
}

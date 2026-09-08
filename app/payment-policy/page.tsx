import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Payments & Payment Security | Swadam Foods",
  description: "Payment methods, payment processing and payment-security information for Swadam Foods.",
}

export default function PaymentPolicyPage() {
  return (
    <LegalPage
      title="Payments & Payment Security"
      intro="Swadam Foods uses third-party payment service providers to process online payments securely. This policy explains how online payments work on our website and what you should expect when paying for an order."
      sections={[
        {
          heading: "Payment Providers",
          paragraphs: [
            "Online payments may be processed through PhonePe and, where used as an alternative payment provider, Razorpay. The payment provider available for a particular transaction may depend on system availability, transaction conditions and our checkout configuration.",
            "The relevant payment provider may process payment and transaction information under its own terms and privacy notice in addition to our policies. PhonePe and Razorpay are independent payment service providers and are not the seller of Swadam Foods products.",
          ],
        },
        {
          heading: "What We Store",
          paragraphs: [
            "Swadam Foods stores order and payment-status information needed to fulfil and reconcile your purchase, such as order ID, transaction reference, selected payment provider, amount, status and relevant timestamps.",
            "We do not store your full card number, CVV, UPI PIN, OTP, net-banking password or similar payment authentication secret in our website database. Do not send these credentials to us through WhatsApp, email, phone or any other channel.",
          ],
        },
        {
          heading: "Payment Status",
          paragraphs: [
            "A payment can be successful, failed, expired or temporarily pending. Our server verifies payment status using information received from the payment provider rather than relying only on what the browser displays.",
            "Please do not make another payment merely because the browser is slow or a payment page appears to be stuck. A second payment attempt is appropriate only after the first attempt is confirmed as unsuccessful or cancelled. This helps reduce duplicate charges.",
          ],
        },
        {
          heading: "Alternative Payment Provider",
          paragraphs: [
            "Where the primary payment provider is clearly unavailable or an attempted transaction has definitively failed before completion, we may offer or use an alternate provider such as Razorpay. We do not treat an unknown or still-processing transaction as failed solely to start another payment attempt.",
          ],
        },
        {
          heading: "Payment Confirmation & Orders",
          paragraphs: [
            "Your order is considered paid only after the transaction is successfully verified against the corresponding order. A payment page visit, browser redirect, screenshot or customer message is not by itself proof of successful payment.",
            "If payment has succeeded but your order still appears pending, contact us with the order ID and payment transaction reference. We will reconcile the transaction with the relevant payment provider.",
          ],
        },
        {
          heading: "Refunds",
          paragraphs: [
            "Approved refunds for online payments are generally initiated through the payment provider used for the original transaction and are normally returned to the original payment instrument, subject to the provider's capabilities, banking processes and applicable law. See our Refund & Cancellation Policy for eligibility and timing.",
          ],
        },
        {
          heading: "Payment Security",
          paragraphs: [
            "Payment credentials are handled by the applicable payment provider through its secure payment flow. Our gateway credentials and webhook verification secrets are kept on the server and are not intended to be exposed to customers or included in browser code.",
            "Swadam Foods will never ask for your UPI PIN, card PIN, CVV or OTP in order to confirm an order or issue a refund. If someone claiming to represent Swadam Foods requests such information, do not provide it.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For payment questions or a payment reconciliation issue, contact ${business.name} at ${business.email} or ${business.phoneDisplay}. Please include the order ID and payment reference, but never include payment passwords, PINs, CVVs or OTPs.`,
          ],
        },
      ]}
    />
  )
}

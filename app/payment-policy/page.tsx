import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Payments & Payment Security Policy | Swadam Foods",
  description: "Payment methods, RBI compliance, payment aggregator integration, and payment security standards for Swadam Foods.",
}

export default function PaymentPolicyPage() {
  return (
    <LegalPage
      title="Payments & Payment Security Policy"
      updatedAt="9 September 2026"
      intro={`Swadam Foods (${business.name}, Proprietorship: ${business.proprietor}) processes all online transactions in compliance with directives issued by the Reserve Bank of India (RBI) and the Consumer Protection (E-Commerce) Rules, 2020. This policy explains how your payment information is handled, our security protocols, and how transaction reconciliations and refunds operate.`}
      sections={[
        {
          heading: "1. Authorized Payment Aggregators & Payment Modes",
          paragraphs: [
            "Online transactions on our Platform are processed through Reserve Bank of India (RBI) authorized Payment Aggregators, primarily PhonePe (PhonePe Private Limited), with failover integration via Razorpay (Razorpay Software Private Limited).",
            "Accepted Payment Instruments (INR Only):",
            "• Unified Payments Interface (UPI): PhonePe, Google Pay, Paytm, BHIM, and all bank UPI applications.",
            "• Debit & Credit Cards: RuPay, Visa, and Mastercard issued by Indian banks.",
            "• NetBanking: Over 50+ scheduled commercial banks across India.",
            "All transactions are conducted exclusively in Indian National Rupees (INR / ₹).",
          ],
        },
        {
          heading: "2. RBI Card-on-File Tokenization (CoFT) & Non-Storage of Financial Secrets",
          paragraphs: [
            "In strict compliance with the RBI directives on Regulation of Payment Aggregators and Payment Gateways and Card-on-File Tokenization (CoFT):",
            "• Swadam Foods NEVER collects, captures, or stores your sensitive financial secrets (including full credit/debit card numbers, CVVs, card expiry dates, UPI PINs, NetBanking passwords, or One-Time Passwords - OTPs) on our servers or databases.",
            "• All payment credential input fields are hosted directly in secure, encrypted, PCI-DSS Level 1 compliant environments maintained by our authorized payment aggregators.",
            "• Swadam Foods only receives non-sensitive transaction metadata required for order fulfillment and statutory accounting (such as unique Order ID, gateway transaction reference, selected payment method, payment timestamp, and verified payment status).",
          ],
        },
        {
          heading: "3. Two-Factor Authentication (2FA) & Transaction Integrity",
          paragraphs: [
            "In adherence to RBI security standards, all electronic transactions on our Platform require mandatory Multi-Factor Authentication (MFA / 2FA)—such as entering your confidential UPI MPIN or a dynamic SMS/Bank OTP. No transaction can be completed without customer authorization through their banking provider.",
            "Server-Authoritative Pricing: Every order total is computed server-side directly from our verified product catalog. Any client-side parameter tampering, script modification, or value alteration is automatically detected and rejected by our edge security architecture.",
          ],
        },
        {
          heading: "4. Payment Status, Pending Transactions & Duplicate Deductions",
          paragraphs: [
            "• Order Confirmation: An order is marked as 'Paid' only upon cryptographic verification of success signals received directly from the payment gateway webhook or server API. Browser redirects or screenshots do not constitute conclusive proof of payment.",
            "• Pending Payments: If your account has been debited but the order status displays 'Pending' or 'Payment Cancelled' due to network dropouts or bank server latency, please allow up to fifteen (15) minutes for automated server reconciliation.",
            "• Preventing Duplicate Charges: Please avoid making an immediate second payment attempt if the gateway screen appears slow or pending. Verify your bank SMS or contact our WhatsApp support first.",
          ],
        },
        {
          heading: "5. Failed Transactions & RBI Auto-Reversal TAT Framework",
          paragraphs: [
            "In accordance with RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20 on Harmonisation of Turnaround Time (TAT) and customer compensation for failed transactions:",
            "• If an amount has been debited from your bank account or card but the transaction failed at the payment gateway level, the debited funds are held in the banking settlement pipeline and are NOT transferred to Swadam Foods.",
            "• The banking system is mandated by RBI regulations to automatically reverse and credit the debited amount back to your source account within T+1 to T+5 business days (where T is the date of transaction).",
            "• If your funds are not automatically reversed within seven (7) business days, please message us on WhatsApp (+91 88888 51522) with your bank statement snippet showing the debit and UTR reference number. We will gladly coordinate with our payment aggregator to facilitate immediate banking escalation.",
          ],
        },
        {
          heading: "6. Customer Safety & Anti-Fraud Advisory",
          paragraphs: [
            "Swadam Foods, its proprietor, and its team members will NEVER ask you for your UPI PIN, ATM PIN, Card CVV, NetBanking password, or OTP via phone call, SMS, WhatsApp, or email—whether for order confirmation, address verification, or processing a refund.",
            "Never enter your UPI PIN to 'receive' money or refunds. Under UPI architecture, entering your PIN always DEBITS funds from your account. If you receive an unsolicited request claiming to represent Swadam Foods asking for sensitive credentials, please report it immediately to swadamfoodsindia@gmail.com.",
          ],
        },
        {
          heading: "7. Payment Support & Escalation",
          paragraphs: [
            `For transaction inquiries or payment reconciliation assistance, contact:`,
            `Billing & Customer Support: ${business.phoneDisplay} (WhatsApp / Call)\nEmail: ${business.email}\nOperating Entity: ${business.name} (Proprietorship: ${business.proprietor})\nAddress: ${business.address}\nSupport Hours: Monday to Saturday, 09:30 AM to 06:30 PM IST`,
          ],
        },
      ]}
    />
  )
}

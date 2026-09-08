import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Privacy Policy | Swadam Foods",
  description: "Privacy Policy governing how Swadam Foods collects, uses, stores and protects personal data under the Digital Personal Data Protection Act, 2023 and IT Act, 2000.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedAt="9 September 2026"
      intro={`This Privacy Policy describes how ${business.name} (Proprietorship: ${business.proprietor}), acting as a Data Fiduciary, collects, uses, shares, stores, and protects personal data obtained through our website https://swadamfoods.eu.cc (hereinafter referred to as the "Platform"). This document is prepared and published in strict compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act 2023), Section 43A of the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.`}
      sections={[
        {
          heading: "1. Data Fiduciary Information",
          paragraphs: [
            `The Data Fiduciary responsible for your personal data is ${business.name}, having its registered office at ${business.address}.`,
            `Contact Email: ${business.email} | Customer Support & WhatsApp: ${business.phoneDisplay}.`,
            "We provide products and services exclusively within the Republic of India. All personal data collected through this Platform is hosted, processed, and maintained on secure servers located within India.",
          ],
        },
        {
          heading: "2. Personal Data We Collect",
          paragraphs: [
            "We collect only the minimum personal data strictly necessary to provide our products and services. This includes:",
            "• Identity & Contact Details: Full name, delivery address, city, state, postal pincode, landmark, and mobile/telephone number.",
            "• Order & Transaction Details: Products purchased, pack sizes, item quantities, total transaction amount, unique Order ID, delivery preferences, and payment status receipts provided by payment gateways.",
            "• Communications Data: Customer support queries, feedback, or delivery instructions submitted via WhatsApp, email, or telephone.",
            "Financial Secrets Exclusion: Swadam Foods NEVER collects, stores, or has access to your full debit/credit card numbers, CVVs, expiry dates, UPI PINs, NetBanking passwords, or OTPs. All payment transactions are executed directly on encrypted, PCI-DSS compliant payment gateway environments licensed by the Reserve Bank of India (PhonePe / Razorpay).",
          ],
        },
        {
          heading: "3. Purpose and Legal Grounds for Processing",
          paragraphs: [
            "In accordance with the DPDP Act 2023, we process your personal data solely for specified, lawful purposes:",
            "• Contractual Fulfillment: To prepare fresh food items, pack orders, calculate shipping, coordinate doorstep delivery with logistics partners, and provide order status tracking via WhatsApp and SMS.",
            "• Customer Support: To address order inquiries, process cancellations, investigate transit damages, and execute approved refunds.",
            "• Statutory & Tax Compliance: To maintain accurate sales accounts, invoices, and audit registers in compliance with the Central Goods and Services Tax (CGST) Act, 2017 and Income Tax Act, 1961.",
            "• Platform Security & Fraud Prevention: To detect and mitigate automated bot attacks, unauthorized API abuse, duplicate payment charges, and cyber threats.",
          ],
        },
        {
          heading: "4. Data Sharing & Third-Party Service Providers",
          paragraphs: [
            "We do not sell, rent, trade, or monetize your personal data to any third-party marketing companies or data brokers. We disclose personal data only on a strict need-to-know basis to:",
            "• Logistics & Delivery Partners (e.g., local delivery personnel, Porter, registered couriers, or Speed Post) exclusively to deliver your package to your specified address.",
            "• RBI-Licensed Payment Aggregators (PhonePe / Razorpay) to verify and reconcile transaction amounts.",
            "• Law Enforcement & Statutory Regulatory Bodies when required by a valid legal process, court order, or statutory obligation under Indian law.",
          ],
        },
        {
          heading: "5. Your Rights as a Data Principal (DPDP Act, 2023)",
          paragraphs: [
            "Under Chapter III of the Digital Personal Data Protection Act, 2023, you possess the following statutory rights regarding your personal data:",
            "• Right to Access (Section 11): You have the right to request a summary of the personal data we hold about you and the processing activities undertaken.",
            "• Right to Correction & Erasure (Section 12): You have the right to request the correction of inaccurate data, completion of incomplete data, or erasure of personal data that is no longer necessary for the purpose for which it was collected (subject to statutory tax record retention requirements).",
            "• Right of Grievance Redressal (Section 13): You have the right to readily available grievance redressal in respect of any act or omission by us regarding performance of our obligations under the DPDP Act.",
            "• Right to Nominate (Section 14): You have the right to nominate any other individual to exercise your rights under the DPDP Act in the event of death or incapacity.",
            "• Right to Withdraw Consent: Where processing is based on consent, you may withdraw your consent at any time by writing to our Grievance Officer at swadamfoodsindia@gmail.com. Withdrawal of consent does not affect the lawfulness of processing undertaken prior to such withdrawal.",
          ],
        },
        {
          heading: "6. Data Security Practices & Procedures",
          paragraphs: [
            "In compliance with Section 43A of the IT Act, 2000 and the IT (Reasonable Security Practices) Rules, 2011, we implement comprehensive administrative, physical, and technical safeguards:",
            "• TLS 1.3 / HTTPS encryption for all browser and server data transfers.",
            "• Enterprise edge rate-limiting and DDoS shield to prevent unauthorized data scraping.",
            "• Content Security Policy (CSP) headers preventing unauthorized script injection or cross-site clickjacking.",
            "• Strict access controls restricting customer order databases exclusively to authorized fulfillment personnel.",
          ],
        },
        {
          heading: "7. Data Retention Policy",
          paragraphs: [
            "We retain personal data only for as long as necessary to fulfill the operational purpose of fulfilling your order, handling warranty/grievance claims, and satisfying mandatory statutory requirements under Indian taxation laws (typically 6 to 8 years for tax invoices and financial transaction ledgers). Once the statutory retention period expires, customer data is securely deleted or irreversibly anonymized.",
          ],
        },
        {
          heading: "8. Data Protection Grievance Officer",
          paragraphs: [
            `In accordance with Rule 4(4) of the Consumer Protection (E-Commerce) Rules, 2020 and Section 13 of the Digital Personal Data Protection Act, 2023, our designated Grievance Officer details are:`,
            `Name & Designation: ${business.grievanceOfficer}, Grievance Officer\nEntity: ${business.name} (Proprietorship: ${business.proprietor})\nRegistered Office: ${business.address}\nEmail: ${business.email}\nPhone: ${business.phoneDisplay}\nWorking Hours: Monday to Saturday, 09:30 AM to 06:30 PM IST`,
            "The Grievance Officer will acknowledge receipt of your data privacy complaint within forty-eight (48) hours and resolve the grievance within thirty (30) days from the date of receipt.",
          ],
        },
      ]}
    />
  )
}

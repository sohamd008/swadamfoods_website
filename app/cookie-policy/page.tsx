import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Cookie & Tracking Technologies Policy | Swadam Foods",
  description: "How Swadam Foods utilizes essential browser storage and privacy-respecting analytics under the Digital Personal Data Protection Act, 2023.",
}

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie & Tracking Technologies Policy"
      updatedAt="9 September 2026"
      intro={`This Cookie Policy explains how ${business.name} (Proprietorship: ${business.proprietor}) utilizes cookies, browser local storage, and similar web technologies when you browse https://swadamfoods.eu.cc. This policy is formulated in accordance with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.`}
      sections={[
        {
          heading: "1. What are Cookies & Local Storage?",
          paragraphs: [
            "Cookies are small text files stored in your web browser by websites you visit. Browser storage technologies (such as SessionStorage and LocalStorage) permit a website to remember your device preferences, items added to your cart, and page states across navigation transitions.",
          ],
        },
        {
          heading: "2. Strictly Necessary / Essential Technologies",
          paragraphs: [
            "Swadam Foods utilizes essential browser storage strictly required for the core technical operation and security of our Platform:",
            "• Shopping Cart State: Maintains your selected items and quantities in memory so your cart is preserved while you navigate between pages or proceed to checkout.",
            "• Theme & Display Preferences: Stores your preferred visual mode (Light or Dark theme).",
            "• Scroll Position Restoration: Temporarily records your scroll position in session memory so that when you finish reading a policy or legal document, you are returned to the exact section of the home page without disruptive page jumps.",
            "• Anti-Abuse & Rate-Limiting Tokens: Essential security tokens preventing automated distributed denial-of-service (DDoS) requests.",
            "Because these technologies are essential for the website to function, they cannot be turned off without disabling site features.",
          ],
        },
        {
          heading: "3. Privacy-Respecting Analytics",
          paragraphs: [
            "We utilize Google Analytics (GA4) exclusively for aggregated, non-personalized traffic and performance measurement. This service provides anonymous metrics such as page load speed, popular products viewed, and general visitor regional distribution.",
            "Zero Advertising Tracking: Swadam Foods DOES NOT employ third-party advertising cookies, retargeting pixels (such as Meta/Facebook Pixel), or behavioral cross-site trackers. We do not sell, share, or syndicate user browsing activity to any advertising networks or data brokers.",
          ],
        },
        {
          heading: "4. Third-Party Payment Gateway Cookies",
          paragraphs: [
            "When you initiate a payment checkout, you are redirected to or interact with secure payment infrastructure operated by RBI-licensed payment aggregators (such as PhonePe or Razorpay). These payment providers may deploy strictly necessary security cookies to authenticate transactions, detect fraud, and maintain session continuity. Their deployment is governed by their respective privacy policies.",
          ],
        },
        {
          heading: "5. Managing and Controlling Cookies",
          paragraphs: [
            "You have full control over cookies through your web browser settings. Most browsers allow you to block, delete, or receive notifications before a cookie is stored:",
            "• Google Chrome: Settings → Privacy and Security → Third-party cookies.",
            "• Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data.",
            "• Apple Safari: Settings → Safari → Advanced → Block All Cookies.",
            "Please note that disabling all browser storage may prevent you from adding items to your shopping cart or completing online checkout.",
          ],
        },
        {
          heading: "6. Questions & Grievance Contact",
          paragraphs: [
            `For questions regarding our use of cookies and tracking technologies, please contact our Grievance Officer:`,
            `Name: ${business.grievanceOfficer}, Grievance Officer\nEntity: ${business.name} (Proprietorship: ${business.proprietor})\nRegistered Office: ${business.address}\nEmail: ${business.email}\nPhone / WhatsApp: ${business.phoneDisplay}\nWorking Hours: Monday to Saturday, 09:30 AM to 06:30 PM IST`,
          ],
        },
      ]}
    />
  )
}

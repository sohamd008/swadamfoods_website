import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Cookie & Analytics Policy | Swadam Foods",
  description: "How Swadam Foods uses cookies and analytics technologies on its website.",
}

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie & Analytics Policy"
      intro="This policy explains the cookies and similar technologies that may be used when you visit https://swadamfoods.eu.cc. It should be read together with our Privacy Policy."
      sections={[
        {
          heading: "What Cookies Are",
          paragraphs: [
            "Cookies are small files or identifiers that a website or third-party service may store in your browser or device. Similar technologies can be used to remember preferences, measure website usage or support security and functionality.",
          ],
        },
        {
          heading: "How We Use Them",
          paragraphs: [
            "Swadam Foods may use essential browser storage or similar technologies to support features such as your shopping cart, theme preference and reliable operation of the website.",
            "We also use Google Analytics to understand website traffic and user interactions, measure performance and improve the website. Analytics information may include pages viewed, events, browser/device information, approximate timing and other usage data permitted by the analytics service.",
          ],
        },
        {
          heading: "Third-Party Technologies",
          paragraphs: [
            "Third-party services used on or linked from the website may set their own cookies or similar identifiers. Their collection and use of information is governed by their respective policies. Payment pages and payment-processing systems may also use technologies necessary for secure transaction processing.",
          ],
        },
        {
          heading: "Your Choices",
          paragraphs: [
            "You can control or delete cookies through your browser settings. You may also use browser privacy controls, content blockers or other available device controls. Disabling certain non-essential technologies may reduce analytics functionality or affect some preferences, but should not by itself create a requirement to disclose payment credentials.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "We may update this policy when we add, remove or materially change analytics, cookies or similar technologies. The latest version will be published on this page.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For questions about cookies, analytics or privacy, contact ${business.name} at ${business.email} or ${business.phoneDisplay}.`,
          ],
        },
      ]}
    />
  )
}

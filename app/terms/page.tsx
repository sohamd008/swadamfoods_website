import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Terms & Conditions | Swadam Foods",
  description: "Terms and Conditions governing use of the Swadam Foods website and purchase of products.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`These Terms & Conditions govern your use of the Swadam Foods website and your purchase of our products. By browsing the website, placing an order, or making a payment, you agree to these Terms, our Privacy Policy, Payment Policy, Shipping Policy, Return Policy, and Refund & Cancellation Policy.`}
      sections={[
        {
          paragraphs: [
            `${business.name} operates from ${business.address}. The website https://swadamfoods.eu.cc is used to display our products, accept orders and provide customer support. We may update these Terms from time to time; the version published on the website at the time of your order will generally apply to that order, subject to applicable law.`,
            `You may place an order as a guest; creating an account is not required. You are responsible for providing accurate name, phone number, delivery address and pincode information needed to fulfil your order.`,
          ],
        },
        {
          heading: "Products, Pricing & Availability",
          paragraphs: [
            "We take reasonable care to keep product descriptions, pack sizes, photographs and prices accurate. Product images are illustrative and the actual packaging may vary slightly. Availability can change without notice.",
            "Prices shown at checkout are the prices used to calculate the order total. Applicable delivery charges, where any, will be shown or communicated before dispatch. We may correct obvious pricing or listing errors and may cancel an affected order with an appropriate refund where applicable.",
          ],
        },
        {
          heading: "Placing & Accepting an Order",
          paragraphs: [
            "Submitting an order request does not by itself guarantee acceptance. An order is considered accepted when Swadam Foods confirms it or begins fulfilment, subject to availability and successful payment where online payment is required.",
            "We may decline or cancel an order in cases such as product unavailability, suspected fraud or abuse, incorrect pricing, incomplete delivery details, payment failure, or circumstances beyond our reasonable control. Where a payment has already been captured for an order we cancel, we will process the applicable refund in accordance with our Refund & Cancellation Policy.",
          ],
        },
        {
          heading: "Online Payments",
          paragraphs: [
            "Online payments are processed by third-party payment service providers that may include PhonePe and Razorpay. We do not ask you to send card numbers, UPI PINs, CVVs, OTPs, net-banking passwords or similar authentication credentials to us by WhatsApp, email, phone or any other direct message.",
            "A payment attempt may fail, expire or remain temporarily pending. An order is not treated as paid merely because a customer has been redirected to or has seen a payment page. Payment status is reconciled using information received from the relevant payment provider and our server-side records.",
            "Where the primary payment processor is unavailable or a payment attempt is clearly unsuccessful before completion, we may use an alternate payment provider such as Razorpay. We do not start a second payment attempt merely because the first attempt is taking time or has an unknown status.",
          ],
        },
        {
          heading: "Delivery",
          paragraphs: [
            "Pune home delivery may be offered free of charge as displayed at checkout. For deliveries outside Pune, availability and delivery charges may depend on the delivery provider and destination and will be confirmed separately before dispatch where applicable.",
            "You must provide a complete and accurate delivery address. Delivery timelines are estimates and may be affected by weather, traffic, courier or logistics delays, address issues, or other events outside our reasonable control.",
          ],
        },
        {
          heading: "Food Products & Product Information",
          paragraphs: [
            "Our products are food items and should be stored and consumed according to the storage instructions, best-before information and other directions printed on the product packaging. Please review the ingredients and allergen information before consuming a product, especially where you have a known allergy or dietary restriction.",
            "Do not consume a product if its packaging is visibly damaged, tampered with, or otherwise unsafe. Contact us promptly so that we can investigate and provide an appropriate resolution in accordance with applicable law and our policies.",
          ],
        },
        {
          heading: "Acceptable Use",
          paragraphs: [
            "You must not use the website for unlawful activity, fraud, abuse, interference with the service, attempts to bypass security controls, or submission of false or misleading information. We may take reasonable measures to protect the website, our customers and our payment/order systems from misuse.",
          ],
        },
        {
          heading: "Intellectual Property",
          paragraphs: [
            "The website's text, branding, graphics, product photographs, layout and other original content are owned by or licensed to Swadam Foods unless otherwise stated. You may not reproduce, modify, distribute or commercially exploit our content without permission, except where permitted by law.",
          ],
        },
        {
          heading: "Third-Party Services",
          paragraphs: [
            "The website may rely on third-party services such as payment processors, delivery providers, analytics providers, hosting infrastructure and communications services. Their own terms and privacy notices may also apply to the parts of their services they provide.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "To the extent permitted by applicable law, Swadam Foods will not be responsible for indirect or consequential loss arising from use of the website or delays caused by third-party infrastructure. Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.",
          ],
        },
        {
          heading: "Force Majeure",
          paragraphs: [
            "We will not be responsible for a failure or delay caused by events beyond our reasonable control, including natural disasters, major network or infrastructure outages, transport disruption, government restrictions, public emergencies, or third-party service failures.",
          ],
        },
        {
          heading: "Governing Law & Disputes",
          paragraphs: [
            "These Terms are governed by the laws of India. Subject to applicable consumer-protection rights and other mandatory legal remedies, disputes relating to these Terms or an order will be subject to the jurisdiction of competent courts in Pune, Maharashtra, India.",
          ],
        },
        {
          heading: "Grievance & Contact",
          paragraphs: [
            `Designated grievance contact: Vidya Ajit Dandekar, Owner / Authorised Representative. Address: ${business.address}. Email: ${business.email}. Phone: ${business.phoneDisplay}. Customer-support hours: Monday–Friday, 9:00 AM–6:00 PM IST.`,
            "Please include your order ID and relevant details when contacting us about an order, payment, refund or complaint so that we can investigate efficiently.",
          ],
        },
      ]}
    />
  )
}

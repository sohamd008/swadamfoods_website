import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { business } from "@/lib/products"

export const metadata: Metadata = {
  title: "Privacy Policy | Swadam Foods",
  description: "Privacy Policy governing how Swadam Foods collects, uses, shares and protects personal data.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        {
          heading: "Introduction",
          paragraphs: [
            `This Privacy Policy describes how ${business.name} ("we", "our", "us") collect, use, share, protect or otherwise process your information / personal data through our website https://swadamfoods.eu.cc (hereinafter referred to as the Platform). You may be able to browse certain sections of the Platform without registering with us. We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India. By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions, and agree to be governed by the laws of India including applicable laws relating to data protection and privacy. If you do not agree, please do not use or access the Platform.`,
          ],
        },
        {
          heading: "Collection",
          paragraphs: [
            `We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship. Some of the information that we may collect includes personal data / information provided to us during use of our Platform such as name, address, telephone/mobile number, email ID and information shared for order fulfilment. You always have the option not to provide information by choosing not to use a particular service or feature on the Platform. We may collect information related to your transactions on the Platform and third-party business partner platforms. When a third-party business partner collects your personal data directly from you, you will be governed by their privacy policies. We request you to read those policies before disclosing information. We will never ask you to disclose debit/credit card PINs, net-banking passwords or mobile-banking passwords through an unsolicited call, email or message. If you receive such a request claiming to be from Swadam Foods, do not provide the information and report it to the appropriate authority.`,
          ],
        },
        {
          heading: "Usage",
          paragraphs: [
            "We use personal data to provide the services you request, assist with handling and fulfilling orders, enhance customer experience, resolve disputes, troubleshoot problems, inform you about offers, products, services and updates, customise your experience, detect and protect against error, fraud and other criminal activity, enforce our terms and conditions, conduct marketing research, analysis and surveys, and as otherwise described to you at the time of collection of information.",
          ],
        },
        {
          heading: "Sharing",
          paragraphs: [
            "We may disclose personal data to third parties such as logistics partners, payment service providers, technology providers and other service providers where required to provide our services. We may also disclose personal data to government agencies or authorised law enforcement agencies when required by law or where reasonably necessary to comply with legal process, enforce our terms, prevent fraud or protect the rights, property or personal safety of our users or the general public.",
          ],
        },
        {
          heading: "Security Precautions",
          paragraphs: [
            "To protect your personal data from unauthorised access or disclosure, loss or misuse, we adopt reasonable security practices and procedures. However, transmission of information over the internet is not completely secure and users acknowledge the inherent risks of data transmission over the internet and World Wide Web.",
          ],
        },
        {
          heading: "Data Deletion and Retention",
          paragraphs: [
            `You may write to us at ${business.email} to request assistance with deletion or other data-related requests. We may refuse or delay deletion where there are pending grievances, claims, pending shipments or other legitimate reasons. We retain personal data for no longer than required for the purpose for which it was collected or as required under applicable law. We may retain data where necessary to prevent fraud or future abuse or for other legitimate purposes and may continue to retain anonymised data for analytical and research purposes.`,
          ],
        },
        {
          heading: "Your Rights",
          paragraphs: [
            "You may request access to, rectification of, or updates to your personal data by contacting us using the contact details below, subject to applicable law.",
          ],
        },
        {
          heading: "Consent",
          paragraphs: [
            `By visiting our Platform or providing your information, you consent to the collection, use, storage, disclosure and otherwise processing of your information on the Platform in accordance with this Privacy Policy. You may withdraw consent by writing to us at ${business.email}. Please note that withdrawal of consent will not be retrospective and may restrict or prevent us from providing services for which the information is necessary.`,
          ],
        },
        {
          heading: "Changes to this Privacy Policy",
          paragraphs: [
            "Please check this Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices and may notify you about significant changes in the manner required by applicable laws.",
          ],
        },
        {
          heading: "Grievance Officer",
          paragraphs: [
            `${business.name}\n${business.address}\nEmail: ${business.email}\nPhone: ${business.phoneDisplay}\nTime: Monday - Friday (9:00 - 18:00)`,
          ],
        },
      ]}
    />
  )
}

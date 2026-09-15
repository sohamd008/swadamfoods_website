import { Manrope } from "next/font/google"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { CartProvider } from "@/lib/cart-context"
import { ThemeProvider } from "@/components/theme-provider"
import { business, products } from "@/lib/products"
import "./globals.css"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL("https://swadamfoods.eu.cc"),
  title: "Swadam Foods | Authentic Indian Snacks & Instant Premixes",
  description: "Authentic Indian snacks and instant breakfast premixes from Swadam Foods. Secure online checkout with PhonePe Payment Gateway.",
  alternates: { canonical: "https://swadamfoods.eu.cc" },
  keywords: ["Swadam Foods", "Indian snacks", "Patal Poha Chivda", "Kanda Poha premix", "Upma premix", "instant breakfast", "FSSAI"],
  icons: { icon: "/images/swadam-logo.webp", shortcut: "/images/swadam-logo.webp", apple: "/images/swadam-logo.webp" },
  openGraph: {
    title: "Swadam Foods | Authentic Indian Snacks",
    description: "Traditional snacks and instant breakfast premixes with secure online checkout.",
    type: "website",
    url: "https://swadamfoods.eu.cc",
    siteName: "Swadam Foods",
    locale: "en_IN",
    images: [{ url: "/images/swadam-logo.webp", alt: "Swadam Foods logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swadam Foods | Authentic Indian Snacks",
    description: "Traditional snacks and instant breakfast premixes with secure online checkout.",
    images: ["/images/swadam-logo.webp"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#181412" },
  ],
}

const productJsonLd = products.map((product) => ({
  "@type": "Product",
  "@id": `https://swadamfoods.eu.cc/#product-${product.id}`,
  name: product.name,
  description: product.description,
  image: `https://swadamfoods.eu.cc${product.image}`,
  sku: product.id,
  brand: { "@type": "Brand", name: business.name },
  offers: {
    "@type": "Offer",
    url: "https://swadamfoods.eu.cc/#products",
    priceCurrency: "INR",
    price: product.price,
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: business.name },
  },
}))

const faqJsonLd = [
  {
    "@type": "Question",
    name: "What products does Swadam Foods sell?",
    acceptedAnswer: { "@type": "Answer", text: products.map((product) => `${product.name} (${product.weight}, ₹${product.price})`).join(", ") },
  },
  {
    "@type": "Question",
    name: "How do I prepare the Instant Kanda Poha Premix?",
    acceptedAnswer: { "@type": "Answer", text: "Empty the premix into a bowl, add hot boiling water equal to half the amount of premix, cover and rest for 5 minutes." },
  },
  {
    "@type": "Question",
    name: "How do I prepare the Instant Upma Premix?",
    acceptedAnswer: { "@type": "Answer", text: "Empty the premix into a bowl, add hot water according to the preparation instructions on the pack, cover and rest for 5 minutes." },
  },
  {
    "@type": "Question",
    name: "How do I order from Swadam Foods?",
    acceptedAnswer: { "@type": "Answer", text: "Add products to the cart, complete the checkout form, and pay securely online. Payment is processed by PhonePe Payment Gateway." },
  },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: business.name,
        url: "https://swadamfoods.eu.cc",
        logo: "https://swadamfoods.eu.cc/images/swadam-logo.webp",
        email: business.email,
        telephone: "+918888851522",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Lane No. 30/31 B, Ganesh Nagar, Dhayari",
          addressLocality: "Pune",
          addressRegion: "Maharashtra",
          addressCountry: "IN",
        },
        sameAs: ["https://www.instagram.com/swadamfoodsindia"],
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://swadamfoods.eu.cc/#business",
        name: business.name,
        image: "https://swadamfoods.eu.cc/images/swadam-logo.webp",
        url: "https://swadamfoods.eu.cc",
        telephone: "+918888851522",
        priceRange: "₹₹",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Lane No. 30/31 B, Ganesh Nagar, Dhayari",
          addressLocality: "Pune",
          addressRegion: "Maharashtra",
          addressCountry: "IN",
        },
      },
      ...productJsonLd,
      { "@type": "FAQPage", "@id": "https://swadamfoods.eu.cc/#faq", mainEntity: faqJsonLd },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning className={`bg-background ${manrope.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9MMSSWSXB0" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9MMSSWSXB0', { send_page_view: true });`}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  )
}

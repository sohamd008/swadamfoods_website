import Script from 'next/script'
import { Manrope } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { CartProvider } from '@/lib/cart-context'
import { ThemeProvider } from '@/components/theme-provider'
import { SecurityProtection } from '@/components/security-protection'
import { business, products } from '@/lib/products'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://swadamfoods.eu.cc'),
  title: 'Swadam Foods | Authentic Indian Snacks & Instant Premixes',
  description:
    'Authentic Indian snacks — Patal Poha Chivda, instant Kanda Poha & Upma premixes. Secure online checkout with PhonePe and Razorpay.',
  alternates: {
    canonical: 'https://swadamfoods.eu.cc',
  },
  keywords: [
    'Swadam Foods',
    'Indian snacks',
    'Patal Poha Chivda',
    'Kanda Poha premix',
    'Upma premix',
    'instant breakfast',
    'FSSAI',
  ],
  icons: {
    icon: '/images/swadam-logo.webp',
    shortcut: '/images/swadam-logo.webp',
    apple: '/images/swadam-logo.webp',
  },
  openGraph: {
    title: 'Swadam Foods | Authentic Indian Snacks',
    description:
      'Handcrafted Patal Poha Chivda and instant Kanda Poha & Upma premixes with secure online checkout.',
    type: 'website',
    url: 'https://swadamfoods.eu.cc',
    siteName: 'Swadam Foods',
    locale: 'en_IN',
    images: [{ url: '/images/swadam-logo.webp', alt: 'Swadam Foods logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swadam Foods | Authentic Indian Snacks',
    description:
      'Handcrafted Patal Poha Chivda and instant Kanda Poha & Upma premixes with secure online checkout.',
    images: ['/images/swadam-logo.webp'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f2e7' },
    { media: '(prefers-color-scheme: dark)', color: '#25201a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`bg-background ${manrope.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9MMSSWSXB0"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9MMSSWSXB0', { send_page_view: true });`}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
        <SecurityProtection />
        <script
          id="asset-protection"
          dangerouslySetInnerHTML={{
            __html: `(function(){document.addEventListener('contextmenu',function(e){var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;e.preventDefault();},true);document.addEventListener('dragstart',function(e){var t=e.target;if(t&&(t.tagName==='IMG'||(t.closest&&t.closest('img'))||(t.closest&&t.closest('picture')))){e.preventDefault();}},true);window.addEventListener('keydown',function(e){var isMac=navigator.platform&&navigator.platform.indexOf('Mac')>=0;var cmdOrCtrl=isMac?e.metaKey:e.ctrlKey;if(e.key==='F12'||(cmdOrCtrl&&e.shiftKey&&(e.key==='I'||e.key==='i'||e.key==='J'||e.key==='j'||e.key==='C'||e.key==='c'))||(cmdOrCtrl&&(e.key==='u'||e.key==='U'||e.key==='s'||e.key==='S'))){e.preventDefault();}},true);})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: business.name,
                  url: 'https://swadamfoods.eu.cc',
                  logo: 'https://swadamfoods.eu.cc/images/swadam-logo.webp',
                  email: business.email,
                  telephone: '+918888851522',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Lane No. 30/31 B, Ganesh Nagar, Dhayari',
                    addressLocality: 'Pune',
                    addressRegion: 'Maharashtra',
                    addressCountry: 'IN',
                  },
                  sameAs: ['https://www.instagram.com/swadamfoodsindia'],
                },
                {
                  '@type': 'LocalBusiness',
                  '@id': 'https://swadamfoods.eu.cc/#business',
                  name: business.name,
                  image: 'https://swadamfoods.eu.cc/images/swadam-logo.webp',
                  url: 'https://swadamfoods.eu.cc',
                  telephone: '+918888851522',
                  priceRange: '₹₹',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Lane No. 30/31 B, Ganesh Nagar, Dhayari',
                    addressLocality: 'Pune',
                    addressRegion: 'Maharashtra',
                    addressCountry: 'IN',
                  },
                  hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Snacks & Instant Premixes',
                    itemListElement: products.map((p) => ({
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Product',
                        name: p.name,
                        description: p.description,
                        image: `https://swadamfoods.eu.cc${p.image}`,
                        brand: { '@type': 'Brand', name: 'Swadam Foods' },
                        offers: {
                          '@type': 'Offer',
                          price: p.price,
                          priceCurrency: 'INR',
                          availability: 'https://schema.org/InStock',
                        },
                      },
                    })),
                  },
                },
                {
                  '@type': 'FAQPage',
                  '@id': 'https://swadamfoods.eu.cc/#faq',
                  mainEntity: [
                    { question: 'What products does Swadam Foods sell?', answer: 'We sell Patal Poha Chivda (200 g, ₹90), Instant Kanda Poha Premix (150 g, ₹70), and Instant Upma Premix (150 g, ₹70).' },
                    { question: 'How do I prepare the Instant Kanda Poha Premix?', answer: 'Empty the premix into a bowl, add hot boiling water equal to half the amount of premix (1 part water to 2 parts premix), cover and rest for 5 minutes.' },
                    { question: 'How do I prepare the Instant Upma Premix?', answer: 'Empty the premix into a bowl, add hot boiling water equal to the same amount as the premix (1:1 ratio), cover and rest for 5 minutes.' },
                    { question: 'How do I order from Swadam Foods?', answer: 'Add products to the cart, complete the checkout form, and pay securely online. Payment is processed by PhonePe or, where used as an alternative, Razorpay. For help with an order, contact us on WhatsApp.' },
                    { question: 'Is Swadam Foods a registered business?', answer: 'Yes, we are FSSAI registered and UDYAM MSME registered. We are a women-owned business based in Pune, Maharashtra.' },
                  ].map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}

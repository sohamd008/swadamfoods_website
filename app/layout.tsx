import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://swadamfoods.eu.cc'),
  title: 'Swadam Foods | Authentic Indian Snacks & Instant Premixes',
  description:
    'Swadam Foods manufactures authentic Indian snacks — Patal Poha Chivda and instant Kanda Poha & Upma premixes. FSSAI registered, UDYAM MSME & GSTIN registered. Order directly on WhatsApp.',
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
    icon: '/images/swadam-logo.jpg',
    shortcut: '/images/swadam-logo.jpg',
    apple: '/images/swadam-logo.jpg',
  },
  openGraph: {
    title: 'Swadam Foods | Authentic Indian Snacks',
    description:
      'Handcrafted Patal Poha Chivda and instant Kanda Poha & Upma premixes. Order directly on WhatsApp.',
    type: 'website',
    url: 'https://swadamfoods.eu.cc',
    siteName: 'Swadam Foods',
    locale: 'en_IN',
    images: [{ url: '/images/swadam-logo.jpg', alt: 'Swadam Foods logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swadam Foods | Authentic Indian Snacks',
    description:
      'Handcrafted Patal Poha Chivda and instant Kanda Poha & Upma premixes.',
    images: ['/images/swadam-logo.jpg'],
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
      className={`bg-background ${inter.variable} ${poppins.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

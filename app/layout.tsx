import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
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
  title: 'Swadam Foods | Authentic Indian Snacks & Instant Premixes',
  description:
    'Swadam Foods manufactures authentic Indian snacks — Patal Poha Chivda and instant Kanda Poha & Upma premixes. FSSAI compliant, UDYAM MSME & GSTIN registered. Order directly on WhatsApp.',
  generator: 'v0.app',
  keywords: [
    'Swadam Foods',
    'Indian snacks',
    'Patal Poha Chivda',
    'Kanda Poha premix',
    'Upma premix',
    'instant breakfast',
    'FSSAI',
  ],
  openGraph: {
    title: 'Swadam Foods | Authentic Indian Snacks',
    description:
      'Handcrafted Patal Poha Chivda and instant Kanda Poha & Upma premixes. Order directly on WhatsApp.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#e8a33d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

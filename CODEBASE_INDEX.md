# Swadam Foods — Codebase Guide & Index

A comprehensive guide and reference index for the Swadam Foods website codebase (`swadamfoods.eu.cc`). Designed as a quick-lookup book index for developers and AI agents alike.

---

## Table of Contents

1. [Alphabetical Book Index](#alphabetical-book-index)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Directory & File Catalog](#directory--file-catalog)
   - [Root Configuration Files](#root-configuration-files)
   - [App Router & Pages (`app/`)](#app-router--pages-app)
   - [Frontend Components (`components/`)](#frontend-components-components)
   - [Shared Libraries & Core Utilities (`lib/`)](#shared-libraries--core-utilities-lib)
   - [Backend API Route Handlers (`app/api/`)](#backend-api-route-handlers-appapi)
   - [Database Migrations (`migrations/`)](#database-migrations-migrations)
   - [Static Assets & Discovery Protocols (`public/`)](#static-assets--discovery-protocols-public)
4. [Core Data & Control Flows](#core-data--control-flows)
   - [1. Product Browsing & Cart Management](#1-product-browsing--cart-management)
   - [2. Checkout & PhonePe Payment v2](#2-checkout--phonepe-payment-v2)
   - [3. Order Privacy Verification & Live Tracking](#3-order-privacy-verification--live-tracking)
   - [4. Tax Invoice Generation (Client & Server)](#4-tax-invoice-generation-client--server)
   - [5. Admin Merchant Operations & Inventory Sync](#5-admin-merchant-operations--inventory-sync)
5. [Database Schema Reference](#database-schema-reference)
6. [Security & Compliance Summary](#security--compliance-summary)
7. [Essential Commands & Runbook](#essential-commands--runbook)

---

## Alphabetical Book Index

Use this index to quickly locate code symbols, components, routes, and features:

| Topic / Keyword | Primary File | Description |
|---|---|---|
| **About Section** | [`about-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/about-section.tsx) | Brand story, founder heritage, and handcrafted values |
| **Add to Cart Button** | [`add-to-cart-button.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/add-to-cart-button.tsx) | Mobile & desktop touch-friendly item quantity adder |
| **Admin Authentication** | [`admin/orders/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/admin/orders/route.ts) | Timing-safe admin secret key verification |
| **Admin Dashboard UI** | [`admin-dashboard.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/admin-dashboard.tsx) | Merchant portal with KPI metrics, status updates, live inventory |
| **Admin Page Route** | [`app/admin/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/admin/page.tsx) | Admin entry page rendering the admin dashboard |
| **Agent Protocols (UCP/ACP/MCP)** | [`middleware.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/middleware.ts) | Markdown negotiation, MCP server card, UCP endpoints |
| **Analytics (Google)** | [`analytics.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/analytics.ts) | GA4 e-commerce events: view_item, add_to_cart, begin_checkout, purchase |
| **API Helpers** | [`api.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/api.ts) | Centralized `jsonResponse` and `isSameOrigin` validation |
| **Bulk Status Updates** | [`admin-dashboard.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/admin-dashboard.tsx) | Batch transition of multiple orders with WhatsApp dispatch |
| **Cart Context** | [`cart-context.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/cart-context.tsx) | React state and localStorage persistence for cart items |
| **Cart Drawer UI** | [`cart-drawer.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/cart-drawer.tsx) | Slide-over drawer with item stepper and checkout trigger |
| **Cart Drawer Gate** | [`cart-drawer-gate.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/cart-drawer-gate.tsx) | Dynamic client-side wrapper to avoid hydration mismatch |
| **Checkout Page UI** | [`checkout-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/checkout-page.tsx) | 2-column responsive form, PhonePe integration, sticky summary |
| **Checkout Page Route** | [`app/checkout/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/checkout/page.tsx) | Checkout entry route |
| **Cloudflare D1 Helper** | [`db.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/db.ts) | Centralized `getDB()` accessor for Cloudflare D1 SQL database |
| **Content Security Policy** | [`middleware.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/middleware.ts) | Strict CSP allowing PhonePe, GA4, and Cloudflare Insights |
| **Delivery Options** | [`checkout-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/checkout-page.tsx) | Pune Local (Free) vs Outside Pune (Porter courier) |
| **FAQ Section** | [`faq-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/faq-section.tsx) | Shelf life, ingredients, preparation, and shipping FAQ accordion |
| **Footer** | [`site-footer.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/site-footer.tsx) | 4-column footer with legal links, contact, FSSAI/MSME info |
| **Header** | [`site-header.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/site-header.tsx) | Sticky glass navigation bar, brand logo, cart trigger, theme toggle |
| **Hero Section** | [`hero.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/hero.tsx) | Hero headline, CTAs, trust chips, and hero dish card |
| **Inventory API** | [`inventory/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/inventory/route.ts) | Public real-time SKU stock count endpoint |
| **Inventory Manager API** | [`admin/inventory/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/admin/inventory/route.ts) | Admin endpoint for updating stock quantities |
| **Invoice Words Engine** | [`invoice.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/invoice.ts) | Centralized Indian Rupee number to words converter (`numberToWordsINR`) |
| **Legal Pages** | [`legal-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/legal-page.tsx) | Reusable layout for terms, privacy, refunds, shipping policies |
| **Mobile Menu** | [`mobile-menu.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/mobile-menu.tsx) | Hamburger slide-in menu for small screens |
| **Not Found (404)** | [`app/not-found.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/not-found.tsx) | Branded 404 error page with glassmorphism return home button |
| **OpenNext Config** | [`open-next.config.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/open-next.config.ts) | Cloudflare Worker bundling configuration |
| **Order Creation API** | [`orders/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/route.ts) | Creates orders, validates phone and stock, issues order ID |
| **Order Details API** | [`orders/[id]/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/%5Bid%5D/route.ts) | Retrieves single order details with privacy masking |
| **Order Page Route** | [`app/order/[id]/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/order/%5Bid%5D/page.tsx) | Customer order view route (`/order/[id]`) |
| **Order Tracker UI** | [`order-tracker.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/order-tracker.tsx) | Lightweight adapter delegating to TrackOrderPage |
| **Phone Number Logic** | [`phone.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/phone.ts) | Indian 10-digit mobile number validation & sanitization |
| **PhonePe Gateway Client** | [`phonepe.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/phonepe.ts) | PhonePe Standard Checkout v2 API client and HMAC verification |
| **PhonePe Icon / Logo** | [`phonepe-logo.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/phonepe-logo.tsx) | SVG logo and icon for PhonePe Payment Gateway |
| **PhonePe Pay API** | [`payments/phonepe/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/payments/phonepe/route.ts) | Initiates secure PhonePe payment session and redirect URL |
| **PhonePe Status API** | [`payments/phonepe/status/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/payments/phonepe/status/route.ts) | Checks live payment status from PhonePe gateway |
| **PhonePe Webhook** | [`webhooks/phonepe/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/webhooks/phonepe/route.ts) | Asynchronous webhook notification processor |
| **Product Card UI** | [`product-card.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/product-card.tsx) | Item card with image, price, stock badge, prep drawer trigger |
| **Products Catalog** | [`products.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/products.ts) | Product definitions (Chivda, Poha, Upma), pricing, weights, WhatsApp |
| **Products Section** | [`products-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/products-section.tsx) | Responsive 3-column product showcase section |
| **Tax Invoice PDF API** | [`orders/[id]/invoice/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/%5Bid%5D/invoice/route.ts) | Server-side jsPDF tax invoice generation and download |
| **Tax Invoice Modal UI** | [`tax-invoice.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/tax-invoice.tsx) | Client-side invoice view, browser print, and PDF download |
| **Theme Provider** | [`theme-provider.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/theme-provider.tsx) | Next-themes provider wrapper for dark/light themes |
| **Theme Toggle** | [`theme-toggle.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/theme-toggle.tsx) | Sun/moon button to switch light and dark modes |
| **Tracking API** | [`orders/track/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/track/route.ts) | Verifies phone number against order ID and returns full details |
| **Tracking Page Route** | [`app/track/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/track/page.tsx) | Customer tracking route (`/track`) |
| **Tracking Page UI** | [`track-order-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/track-order-page.tsx) | Stepper (Received to Delivered), reorder, WhatsApp support |
| **Trust Section** | [`trust-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/trust-section.tsx) | Trust badges: FSSAI, MSME, Zero Preservatives, Pure Ingredients |
| **Wrangler Config** | [`wrangler.jsonc`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/wrangler.jsonc) | Cloudflare Worker, Pages assets, D1 database binding config |

---

## Architecture & Technology Stack

```
                                  [ User Browser ]
                                         │
                                         ▼
                             [ Cloudflare CDN Edge ]
                                         │
                                         ▼
                     [ Next.js 16 (OpenNext Worker Runtime) ]
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
    [ App Router & UI ]          [ Middleware & CSP ]         [ REST API Handlers ]
   • React 19 Client Components   • Content Security Policy     • /api/orders
   • Tailwind CSS 4 Artisanal UI  • Markdown / Agent Headers    • /api/payments/phonepe
   • Fraunces & Plus Jakarta Sans • WWW redirect & Headers      • /api/admin/orders
   • Lucide React Icons
            │                                                           │
            ▼                                                           ▼
   [ Client Cart & Context ]                                   [ Cloudflare D1 SQL ]
   • LocalStorage Persistence                                  • orders table
   • Dynamic jsPDF Generation                                  • order_items table
   • Google Analytics Tracking                                 • inventory table
                                                                        │
                                                                        ▼
                                                           [ PhonePe Payment Gateway ]
                                                           • Standard Checkout v2
                                                           • Webhook & Status Sync
```

### Core Technologies
- **Framework**: Next.js 16.3.4 (App Router, Turbopack, standalone/OpenNext output)
- **UI Library**: React 19.2.8 & React DOM 19.2.8
- **Typography & Brand Identity**: Google Fonts via `next/font/google` (`Fraunces` high-character cookbook/editorial serif + `Plus Jakarta Sans` clean body copy)
- **Styling**: Tailwind CSS 4.3.3 (`@tailwindcss/postcss`) with authentic warm artisanal culinary palette (sun-roasted terracotta `#B84A1A`, warm unbleached parchment/ivory `#FAF7F2`, deep espresso typography `#231E1B`, and subtle stone borders)
- **Hosting / Edge**: Cloudflare Pages / Cloudflare Workers via `@opennextjs/cloudflare`
- **Database**: Cloudflare D1 (Serverless SQLite database binding `DB`)
- **Payment Gateway**: PhonePe Payment Gateway Standard Checkout v2 (UPI, Cards, NetBanking)
- **PDF Generation**: `jspdf` 4.2.1 (both client-side and edge server-side rendering)
- **Icons**: `lucide-react` 1.42.0
- **Theming**: `next-themes` 0.4.6 (Dark & Light modes)
- **Testing**: Playwright 1.63.0 (End-to-End mobile & desktop cross-browser verification)

---

## Directory & File Catalog

### Root Configuration Files

- [`package.json`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/package.json): NPM project manifests, scripts (`dev`, `build`, `build:worker`), and dependencies.
- [`wrangler.jsonc`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/wrangler.jsonc): Cloudflare deployment config, defines worker entry point (`.open-next/worker.js`), static assets directory (`.open-next/assets`), compatibility date, and D1 database binding (`DB` -> `swadam_orders`).
- [`next.config.mjs`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/next.config.mjs): Next.js configuration including image domains, optimizePackageImports, and security headers.
- [`open-next.config.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/open-next.config.ts): Cloudflare adapter options for OpenNext.
- [`tsconfig.json`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/tsconfig.json): TypeScript compilation options with path alias `@/*` mapped to `./*`.
- [`.gitignore`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/.gitignore): Specifies files excluded from git tracking (secrets, node_modules, build caches, test outputs, logs, OS metadata).
- [`middleware.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/middleware.ts): Global Next.js middleware enforcing Content Security Policy (PhonePe, GA4, Cloudflare Insights), Canonical www redirection, HTTP-level markdown negotiation, and AI Agent Discovery protocols.

---

### App Router & Pages (`app/`)

- [`app/layout.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/layout.tsx): Root layout wrapping the entire application in `ThemeProvider` and `CartProvider`. Injects Google Analytics (`gtag.js`) and font configurations.
- [`app/globals.css`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/globals.css): Global styles, Tailwind CSS 4 directives, ambient background gradients, glassmorphism card classes, safe-area-inset utilities, and mobile touch manipulation rules.
- [`app/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/page.tsx): Main landing page composing `SiteHeader`, `Hero`, `ProductsSection`, `AboutSection`, `TrustSection`, `FaqSection`, `SiteFooter`, and `CartDrawerGate`.
- [`app/checkout/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/checkout/page.tsx): Checkout route hosting `CheckoutPage`.
- [`app/track/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/track/page.tsx): Order tracking entry route wrapped in `Suspense` hosting `TrackOrderPage`.
- [`app/track-order/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/track-order/page.tsx): Alias route that re-exports directly from `app/track/page.tsx`.
- [`app/order/[id]/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/order/%5Bid%5D/page.tsx): Direct customer order status route (`/order/SWAD-XXXX`), wraps `OrderTracker` in `Suspense`.
- [`app/admin/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/admin/page.tsx): Merchant admin dashboard route, wraps `AdminDashboard` in `Suspense`.
- [`app/not-found.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/not-found.tsx): Custom 404 error page styled with ambient glassmorphism and store navigation.
- **Legal & Policy Pages**:
  - [`app/privacy-policy/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/privacy-policy/page.tsx)
  - [`app/terms/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/terms/page.tsx)
  - [`app/shipping-policy/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/shipping-policy/page.tsx)
  - [`app/refund-policy/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/refund-policy/page.tsx)
  - [`app/return-policy/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/return-policy/page.tsx)
  - [`app/payment-policy/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/payment-policy/page.tsx)
  - [`app/cookie-policy/page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/cookie-policy/page.tsx)

---

### Frontend Components (`components/`)

#### Navigation & Layout
- [`components/site-header.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/site-header.tsx): Sticky glass navigation header, logo, nav links (`Products`, `About`, `Why Us`, `Track Order`, `FAQ`, `Contact`), theme toggle, cart counter trigger, and mobile menu button.
- [`components/mobile-menu.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/mobile-menu.tsx): Slide-in navigation drawer for mobile devices with body scroll lock and escape listener.
- [`components/site-footer.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/site-footer.tsx): Footer with store branding, quick links, policies, contact info, FSSAI/MSME licenses, and WhatsApp contact button.
- [`components/theme-toggle.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/theme-toggle.tsx): Interactive toggle switching between light and dark themes.
- [`components/theme-provider.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/theme-provider.tsx): Client wrapper around `next-themes`.

#### Storefront & Sections
- [`components/hero.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/hero.tsx): Hero banner with title, value proposition, action buttons, and animated dish preview.
- [`components/products-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/products-section.tsx): Renders product grid, heading, and live stock updates.
- [`components/product-card.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/product-card.tsx): Individual item card with image hover effect, price, quantity controls, and preparation drawer.
- [`components/add-to-cart-button.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/add-to-cart-button.tsx): Touch-friendly add-to-cart trigger with active quantity indicator.
- [`components/about-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/about-section.tsx): Heritage and story section detailing Pune-style traditional recipes and pure ingredients.
- [`components/trust-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/trust-section.tsx): Trust points: 100% Homemade, Zero Preservatives, Pune Express Delivery, FSSAI & MSME certifications.
- [`components/faq-section.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/faq-section.tsx): Expandable accordion answering common questions regarding orders, storage, and preparation.
- [`components/legal-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/legal-page.tsx): Template for policy and legal documentation.
- [`components/phonepe-logo.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/phonepe-logo.tsx): Clean SVG icons and badges for PhonePe Payment Gateway.

#### Shopping Cart & Checkout
- [`components/cart-drawer.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/cart-drawer.tsx): Floating slide-over cart drawer with live subtotal calculation, quantity stepper, empty state, and checkout link.
- [`components/cart-drawer-gate.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/cart-drawer-gate.tsx): Dynamically imports `CartDrawer` with `{ ssr: false }` to prevent hydration mismatches.
- [`components/cart-button.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/cart-button.tsx): Header cart trigger badge showing total item count with bounce animation.
- [`components/checkout-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/checkout-page.tsx): Complete checkout workflow:
  - Responsive 2-column layout (Form on left, Sticky summary on right)
  - Full Name, 10-digit Indian Mobile Number, Address, and Pincode validation
  - Pune Delivery (Free) vs Outside Pune (Porter) selector
  - PhonePe Standard Checkout session creation and redirect
  - Polling verification for payment completion with cancelled/retry modal
  - Google Analytics e-commerce purchase tracking using fresh state refs

#### Tracking, Invoices & Admin Operations
- [`components/track-order-page.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/track-order-page.tsx): Unified order tracking component:
  - Phone number verification for customer privacy
  - 6-stage status progress stepper (`Received` -> `Paid` -> `Preparing` -> `Packed` -> `Shipped` -> `Delivered`)
  - Itemized order breakdown and delivery details
  - 1-click reorder button (repopulates cart) and direct WhatsApp support trigger
  - Automatically clears cart context once order payment is confirmed
- [`components/order-tracker.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/order-tracker.tsx): Lightweight adapter passing `initialOrderId` prop to `TrackOrderPage`.
- [`components/tax-invoice.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/tax-invoice.tsx): Modal displaying GST tax invoice, FSSAI/MSME details, 5% GST computation, and client-side jsPDF download.
- [`components/admin-dashboard.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/components/admin-dashboard.tsx): Complete merchant management dashboard:
  - Passcode authentication (`swadam_admin_key`)
  - 4 KPI metric cards: Today's Revenue, Active Kitchen, Out for Delivery, Pending Payments
  - Real-time stock inventory counter with SKU increment/decrement and low-stock alerts
  - Order search filter and status tabs (`All`, `Active`, `New`, `Preparing`, `Packed`, `Shipped`, `Delivered`, `Cancelled`)
  - Order detail modal with customer information and address copy
  - Audio chime alerts on incoming new orders
  - Direct WhatsApp template dispatch for customer order status updates
  - Manifest CSV export for courier and dispatch logistics
  - Bulk status transitions for multiple selected orders

---

### Shared Libraries & Core Utilities (`lib/`)

- [`lib/db.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/db.ts): Centralized Cloudflare D1 SQL database helper:
  - `getDB(): D1Database | undefined`: Safely resolves the D1 database binding from `@opennextjs/cloudflare` context across edge worker and local environments.
- [`lib/api.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/api.ts): API response and security helpers:
  - `jsonResponse(data, status, extraHeaders)`: Standardized JSON response builder with `no-store` cache control.
  - `isSameOrigin(request)`: Validates that state-mutating requests match the application host origin, preventing CSRF.
  - `timingSafeEqual(a, b)`: Constant-time byte string comparison to prevent side-channel timing attacks.
  - `cleanOrderId(rawId)`: Strips merchant payment suffix (`-PXXXX`), trims, and normalizes order IDs.
  - `isValidOrderId(orderId)`: Strict regex validation for `SWAD-XXXX` and legacy `SWD-YYYYMMDD-XXXXXXXX` order formats.
  - `verifyAdminKey(request)`: Multi-source (`x-admin-key`, `Authorization: Bearer`, `?key=`) timing-safe admin authentication.
- [`lib/invoice.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/invoice.ts): Centralized tax invoice helper:
  - `numberToWordsINR(amount: number): string`: Converts numerical currency amounts into Indian numbering system words (`INR ... Only` with Crore, Lakh, Thousand, Hundred).
  - `calculateGSTBreakdown(total, gstRate)`: Centralized GST computation returning taxable value, CGST (2.5%), SGST (2.5%), and total GST (5%).
  - `formatInvoiceNumber(orderId)`: Standardizes invoice number generation (`INV-XXXX`).
- [`lib/phone.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/phone.ts): Indian mobile phone number utilities:
  - `validateIndianMobile(rawPhone)`: Validates strict 10-digit format starting with digits 6, 7, 8, or 9, blocking invalid and dummy patterns (`9999999999`, `1234567890`).
  - `sanitizePhone(input)`: Strips non-digit characters.
  - `maskPhone(phone)`: Masks phone numbers (`98******45`) for privacy-preserving display across tracking and invoice views.
  - `formatIndianMobile(phone)`: Formats phone numbers for user display (`+91 XXXXX XXXXX`).
- [`lib/products.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/products.ts): Product definitions, weights, prices, shelf-life, and official WhatsApp contact numbers:
  - `WHATSAPP_NUMBER`: `"918888851522"`
  - `products`: Product array (Patal Poha Chivda ₹90, Instant Kanda Poha ₹70, Instant Upma ₹70).
- [`lib/cart-context.tsx`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/cart-context.tsx): Cart state manager:
  - Provides `items`, `totalItems`, `totalPrice`, `subtotal`, `addItem`, `removeItem`, `setQuantity`, `clear`, `isOpen`, `openCart`, `closeCart`.
  - Persists cart data to `localStorage` under `swadam_cart`.
- [`lib/phonepe.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/phonepe.ts): PhonePe Payment Gateway Standard Checkout v2 client:
  - `createPhonePePayment(...)`: Generates SHA-256 HMAC authorization headers and calls `/v2/pay` to obtain checkout redirect URL.
  - `getPhonePeOrderStatus(...)`: Queries PhonePe order status API to verify transaction outcome.
  - `verifyPhonePeWebhookSignature(...)`: Verifies authenticity of incoming webhook payloads.
- [`lib/analytics.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/lib/analytics.ts): Google Analytics GA4 helper:
  - `trackEvent(eventName, params)`: Dispatches e-commerce events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).

---

### Backend API Route Handlers (`app/api/`)

| Route | Methods | Purpose & Functionality |
|---|---|---|
| [`app/api/orders/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/route.ts) | `POST` | Validates customer details, verifies stock availability, checks same-origin security, creates order in D1 database, generates unique order ID (`SWAD-XXXX`), and reserves inventory. |
| [`app/api/orders/[id]/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/%5Bid%5D/route.ts) | `GET` | Fetches single order details. If requested without phone verification header, returns masked phone number (`...1234`) with `requiresVerification: true` to prevent unauthorized PII snooping. |
| [`app/api/orders/track/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/track/route.ts) | `POST` | Verifies the provided 10-digit mobile number against the stored order in D1. On successful match, returns full order details, items, and status. |
| [`app/api/orders/[id]/invoice/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/orders/%5Bid%5D/invoice/route.ts) | `GET` | Generates and downloads a clean, printable PDF tax invoice rendered directly on the edge using `jspdf`. Includes GSTIN, FSSAI, MSME, itemized bill, and currency in words. |
| [`app/api/payments/phonepe/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/payments/phonepe/route.ts) | `POST` | Initiates a PhonePe Standard Checkout session for an existing unpaid order. Obtains checkout URL, records payment expiration, and returns redirect link. |
| [`app/api/payments/phonepe/status/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/payments/phonepe/status/route.ts) | `GET` | Polled by checkout page during verification. Fetches real-time status from PhonePe gateway, verifies amount matches exactly, and transitions order status in D1. |
| [`app/api/webhooks/phonepe/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/webhooks/phonepe/route.ts) | `POST` | Processes asynchronous server-to-server webhook callbacks from PhonePe, verifying SHA-256 signature and updating payment status to `paid`. |
| [`app/api/inventory/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/inventory/route.ts) | `GET` | Returns current available stock quantities for all product SKUs. |
| [`app/api/admin/inventory/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/admin/inventory/route.ts) | `GET`, `PATCH` | Protected admin endpoint to inspect stock counts and update product inventory quantities in D1. Requires timing-safe admin secret key. |
| [`app/api/admin/orders/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/admin/orders/route.ts) | `GET`, `PATCH` | Protected admin endpoint. `GET` returns all orders with customer details and line items. `PATCH` updates order status (`accepted`, `preparing`, `packed`, `shipped`, `delivered`, `cancelled`). |
| [`app/api/health/route.ts`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/app/api/health/route.ts) | `GET` | Light connectivity health check called by checkout page before initiating payment. |

---

### Database Migrations (`migrations/`)

- [`migrations/0001_initial.sql`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/migrations/0001_initial.sql): Base SQLite schema creating `orders` table (id, customer details, totals, payment status, order status, timestamps) and `order_items` table (id, order_id, product_id, product_name, quantity, unit_price, line_total).
- [`migrations/0002_inventory.sql`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/migrations/0002_inventory.sql): Creates `inventory` table with product SKUs, stock counts, reserved counts, and updated timestamps.
- [`migrations/0002_phonepe_checkout.sql`](file:///c:/Users/Ajit/Documents/antigravity/amazing-shannon/migrations/0002_phonepe_checkout.sql): Adds `payment_gateway`, `gateway_order_id`, `payment_checkout_url`, and `payment_expires_at` columns to `orders` table.

---

### Static Assets & Discovery Protocols (`public/`)

- **Images & Branding**:
  - `public/images/swadam-logo.webp`: Official brand logo
  - `public/images/hero-chivda.webp`: High-resolution hero image
  - `public/images/patal-poha-chivda.webp`: Patal Poha Chivda product pack
  - `public/images/kanda-poha.webp`: Instant Kanda Poha Premix product pack
  - `public/images/upma.webp`: Instant Upma Premix product pack
  - `public/images/fssai-logo.webp`: FSSAI Food Safety certification seal
  - `public/images/msme-logo.webp`: Ministry of MSME certification seal
  - `public/images/phonepe-logo.svg`, `phonepe-icon.svg`: Official PhonePe vector logos
- **SEO & Discovery**:
  - `public/robots.txt`: Search crawler indexing permissions
  - `public/sitemap.xml`: XML sitemap containing store URLs
  - `public/llms.txt`: Machine-readable summary for AI agents and LLMs
  - `public/openapi.json`: OpenAPI 3.0 specification of Swadam Foods APIs
  - `public/auth.md`: Agent authentication and registration instructions
- **Agent Protocols (`public/.well-known/`)**:
  - `.well-known/mcp/server-card.json`: Model Context Protocol server definition
  - `.well-known/agent-skills/`: Agent skills directory
  - `.well-known/ucp`: Universal Commerce Protocol endpoint
  - `.well-known/acp.json`: Agentic Commerce Protocol endpoint
  - `.well-known/api-catalog`: RFC 9309 API Catalog definition

---

## Core Data & Control Flows

### 1. Product Browsing & Cart Management
1. Visitor loads `https://swadamfoods.eu.cc/`.
2. `ProductsSection` displays product cards using details from `lib/products.ts` and fetches live stock counts from `/api/inventory`.
3. Clicking "Add to Cart" triggers `addItem()` in `lib/cart-context.tsx`. Cart items are stored in React state and synchronized with `localStorage` (`swadam_cart`).
4. Google Analytics logs `add_to_cart` event via `lib/analytics.ts`.
5. User can open the `CartDrawer`, adjust quantities, or click "Proceed to Checkout".

### 2. Checkout & PhonePe Payment v2
1. User navigates to `/checkout`.
2. `CheckoutPage` displays a 2-column layout (Desktop) or stacked form with collapsible summary (Mobile).
3. User enters Full Name, 10-digit Indian Mobile Number, Address, and selects Delivery Method.
4. Clicking "Pay Now" initiates a `POST /api/orders` call with cart items and customer details:
   - Order record is created in Cloudflare D1 with status `pending`.
   - Returns unique `orderId` (e.g. `SWAD-1042`).
5. Client calls `POST /api/payments/phonepe` with `orderId`:
   - Server creates a unique merchant order ID (`SWAD-1042-PXXXX`).
   - PhonePe v2 API (`/v2/pay`) is called with SHA-256 HMAC authorization.
   - PhonePe returns a secure payment redirect URL.
6. Client opens the PhonePe payment window. Simultaneously, the checkout page begins polling `/api/payments/phonepe/status?orderId=SWAD-1042`.
7. Once payment completes:
   - PhonePe status returns `COMPLETED`.
   - Database updates `payment_status = 'paid'`.
   - Client triggers Google Analytics `purchase` event with items and order total.
   - Cart is cleared from `localStorage`.
   - User is redirected to `/order/[id]` or live tracking.

### 3. Order Privacy Verification & Live Tracking
1. Customer visits `/track` or `/order/SWAD-1042`.
2. To protect customer privacy and prevent order scraping, the system checks whether the user's mobile number is already verified in browser session storage (`swadam_track_verified_SWAD-1042`).
3. If unverified, the customer is prompted to enter their 10-digit mobile number.
4. Client calls `POST /api/orders/track` with `{ orderId, phone }`:
   - Server checks phone number against the database record.
   - Upon verification, the full order details, delivery address, and line items are returned.
5. The UI renders the live 6-stage timeline:
   - `Order Received` -> `Payment Confirmed` -> `Kitchen Preparation` -> `Packed & Sealed` -> `Out for Delivery` -> `Delivered`.
6. Customer can click "1-Click Reorder" to quickly reload the exact same items into their cart, or click "Inquire via WhatsApp" to chat with the kitchen.

### 4. Tax Invoice Generation (Client & Server)
1. In `TrackOrderPage` or `AdminDashboard`, customer/admin clicks "Tax Invoice".
2. `TaxInvoiceModal` renders an official GST tax invoice layout:
   - Supplier: Swadam Foods, Pune, Maharashtra
   - FSSAI License: `21526080002094`
   - MSME UDYAM: `UDYAM-MH-26-1188295`
   - GST Breakdown: 5% total (CGST 2.5% + SGST 2.5%)
   - Amount in Words: Converted using `numberToWordsINR()` from `lib/invoice.ts`
3. Clicking "Download PDF" generates a crisp vector PDF invoice directly via `jspdf`.
4. Alternatively, calling `GET /api/orders/[id]/invoice` generates and downloads the PDF directly from the edge server.

### 5. Admin Merchant Operations & Inventory Sync
1. Merchant visits `/admin` and enters the secret key (`swadam_admin_key`).
2. Server validates the key with timing-safe comparison (`timingSafeEqual`).
3. Unlocked dashboard renders 4 live KPI metric cards (Today's Revenue, Active Kitchen Orders, En Route, Pending Payments).
4. Order cards display customer contact, delivery method, itemized bill, and status buttons (`Accept Order`, `Start Preparing`, `Mark Packed`, `Out for Delivery`, `Mark Delivered`).
5. Clicking any status update:
   - Issues a `PATCH /api/admin/orders` call to update D1.
   - Automatically offers to open a pre-formatted WhatsApp customer notification message.
6. Multi-select enables bulk status updates for multiple orders at once.
7. Real-time inventory manager allows instant adjustment of available stock counts with low-stock warnings.

---

## Database Schema Reference

Cloudflare D1 SQLite database binding `DB` contains three core tables:

### 1. `orders` Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  subtotal REAL NOT NULL,
  delivery_fee REAL NOT NULL,
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_gateway TEXT,
  gateway_order_id TEXT,
  payment_checkout_url TEXT,
  payment_expires_at INTEGER,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `order_items` Table
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  weight TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### 3. `inventory` Table
```sql
CREATE TABLE inventory (
  product_id TEXT PRIMARY KEY,
  stock_quantity INTEGER NOT NULL DEFAULT 50,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security & Compliance Summary

1. **Zero Comments Rule**: No inline code comments (`//`, `/* */`, `<!-- -->`) exist in code files to keep bundle size minimal and clean.
2. **Content Security Policy (CSP)**:
   - Restricts script execution to `'self'`, `'unsafe-inline'`, PhonePe domains (`*.phonepe.com`), Google Analytics (`googletagmanager.com`, `google-analytics.com`), and Cloudflare Insights (`static.cloudflareinsights.com`).
   - Frame ancestors are set to `'none'` to prevent clickjacking.
3. **Same-Origin Protection**:
   - Mutating endpoints (`/api/orders`, `/api/payments/phonepe`) enforce same-origin verification via `lib/api.ts` `isSameOrigin(request)`.
4. **Phone Number Privacy Protection**:
   - Orders cannot be viewed by arbitrary third parties simply by guessing order IDs. `api/orders/[id]` returns masked phone numbers unless validated with customer phone number matching.
5. **Timing-Safe Admin Authentication**:
   - `timingSafeEqual` prevents side-channel timing attacks on the merchant secret key.
6. **Regulatory Compliance**:
   - FSSAI License: `21526080002094`
   - UDYAM Registration: `UDYAM-MH-26-1188295`
   - GSTIN: `27AOCPD1930N1Z1`

---

## Essential Commands & Runbook

### Local Development
```bash
# Start local Next.js development server
npm run dev

# Run TypeScript type check across the codebase
npx tsc --noEmit
```

### Verification & Scans
```bash
# Verify Zero Comments Rule across repository
node "C:\Users\Ajit\.gemini\antigravity\brain\81b116a7-44a6-49e8-8bc4-a281110a7ed3\scratch\check_comments.js"

# Run automated desktop compatibility audit suite (Playwright)
node "C:\Users\Ajit\.gemini\antigravity\brain\81b116a7-44a6-49e8-8bc4-a281110a7ed3\scratch\run_desktop_audit.js"
```

### Production Build & Worker Bundling
```bash
# Compile Next.js production bundle
npm run build

# Compile OpenNext Cloudflare Worker bundle (.open-next/worker.js)
npm run build:worker
```

### Git & Deployment
```bash
# Check git status
git status

# Commit and deploy to GitHub main
git add -A
git commit -m "Your descriptive commit message"
git push origin main
```

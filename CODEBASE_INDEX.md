# Swadam Foods codebase

The source of truth is the Next.js application in `app/`, reusable UI in `components/`, and shared server/client logic in `lib/`.

## Runtime

- Next.js with OpenNext for Cloudflare Workers
- Cloudflare D1 database: `swadam_orders`
- PhonePe Standard Checkout for customer payments
- PhonePe webhook plus server-side payment-status reconciliation
- Order tracking by order ID and verified mobile number

## Important source files

- `app/api/orders/route.ts` — creates orders from canonical product prices
- `app/api/payments/phonepe/route.ts` — starts PhonePe payments
- `app/api/payments/phonepe/status/route.ts` — reconciles payment status
- `app/api/webhooks/phonepe/route.ts` — verifies PhonePe webhooks
- `lib/order-lifecycle.ts` — shared payment/inventory lifecycle logic
- `lib/phonepe.ts` — PhonePe API client and webhook signature validation
- `lib/cart-context.tsx` — client cart state and persistence
- `lib/products.ts` — canonical product and business data
- `components/checkout-page.tsx` — responsive checkout UI

Generated `.open-next` output is not source code and should not be committed.

# Swadam Foods website

Next.js storefront for Swadam Foods with a Cloudflare OpenNext deployment, D1 order storage, and PhonePe Standard Checkout.

## Production architecture

- Storefront and checkout: Next.js
- Runtime/deployment: Cloudflare Workers + OpenNext
- Orders: Cloudflare D1
- Payments: PhonePe Standard Checkout
- Payment confirmation: PhonePe webhook + server-side status reconciliation
- Customer order tracking: Order ID + mobile verification

Generated OpenNext output is intentionally not stored in git. Run the OpenNext build during deployment.

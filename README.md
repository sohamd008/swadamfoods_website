# Swadam Foods website

Next.js storefront for Swadam Foods with a Cloudflare OpenNext deployment, D1 order storage, and PhonePe Standard Checkout.

## Production architecture

- Storefront and checkout: Next.js
- Runtime/deployment: Cloudflare Workers + OpenNext
- Orders: Cloudflare D1
- Private production inventory: separate Cloudflare D1 database (INVENTORY_DB)
- Private inventory authentication: Cloudflare Access with origin-side JWT verification
- Payments: PhonePe Standard Checkout
- Payment confirmation: PhonePe webhook + server-side status reconciliation
- Customer order tracking: Order ID + mobile verification

Generated OpenNext output is intentionally not stored in git. Run the OpenNext build during deployment.

## Private inventory

The private, tablet-first production and supplier-traceability workspace lives at /inventory on the custom website hostname. It reuses the storefront glassmorphism and theme tokens. Inventory records are not stored in the public repository or the customer-orders database.

Before using it, complete the separate D1 and Cloudflare Access setup in [INVENTORY_SETUP.md](INVENTORY_SETUP.md). The Worker must have the INVENTORY_DB binding and the CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD secrets configured before the inventory API will serve records.

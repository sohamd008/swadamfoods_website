# Swadam Foods private inventory setup

The application code is deployed separately from production data. The inventory module uses a new D1 database and must not reuse the customer-orders database.

## 1. Create the separate D1 database

From the repository root, run:

    npx wrangler d1 create swadam_inventory

Copy the database ID from the command output. Add this object to the existing d1_databases array in wrangler.jsonc:

    {
      "binding": "INVENTORY_DB",
      "database_name": "swadam_inventory",
      "database_id": "PASTE_THE_NEW_DATABASE_ID_HERE"
    }

Do not replace or rename the existing DB binding. It remains connected to customer orders.

## 2. Create the inventory tables

Apply the dedicated schema to the new database:

    npx wrangler d1 execute swadam_inventory --remote --file=migrations/inventory/0001_inventory.sql

For local development, use:

    npx wrangler d1 execute swadam_inventory --local --file=migrations/inventory/0001_inventory.sql

The inventory migration is intentionally stored in its own directory and must not be applied to swadam_orders.

## 3. Configure Cloudflare Access

Create a self-hosted Cloudflare Access application for the custom hostname and these inventory paths:

- swadamfoods.eu.cc/inventory*
- swadamfoods.eu.cc/api/inventory*

Set its policy to allow only the specific owner/operator email addresses. Require a strong identity provider and MFA. Do not create a public/bypass policy.

If Cloudflare Access requires separate applications for those path patterns, copy both application Audience (AUD) values into CF_ACCESS_AUD, separated by commas.

Set the Worker runtime values:

    npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
    npx wrangler secret put CF_ACCESS_AUD

For CF_ACCESS_TEAM_DOMAIN, enter the team hostname only, for example your-team.cloudflareaccess.com, not a URL. For CF_ACCESS_AUD, enter the Access application AUD tag or comma-separated AUD tags. You may optionally set CF_ACCESS_ALLOWED_EMAILS as a comma-separated additional allow-list.

The server independently validates the Cf-Access-Jwt-Assertion signature, issuer, audience, expiry and email. A browser-side check is not used as the security boundary. Requests to an alternate hostname also fail at the origin unless they carry a valid Access assertion.

## 4. Protect alternate hostnames

Apply equivalent Cloudflare Access protection to any alternate public hostname that can reach the same Worker, or disable that hostname. The application also verifies the signed Access assertion at the origin, so a request to an unprotected alternate hostname is denied when the Access secrets are configured.

## 5. Verify before entering records

After saving the D1 binding and Access values, deploy the Worker and test:

1. /inventory redirects unauthenticated visitors to Cloudflare Access.
2. A non-allow-listed identity is denied.
3. An allow-listed identity can load /inventory.
4. /api/inventory returns 401 without a valid Access assertion.
5. /api/inventory returns an empty inventory snapshot after the database is bound and migrated.
6. Create a vendor, material, purchase lot, product and test batch.
7. Try to consume more than the received lot balance; the database trigger must reject the batch atomically.

The inventory interface is tablet-first, uses the site's shared glassmorphism/theme tokens and keeps production data in the dedicated INVENTORY_DB binding.

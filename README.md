# Swadam Foods Website

Official website for Swadam Foods, featuring our Indian snacks and instant premixes, product information, and WhatsApp ordering.

## Development

Install dependencies with pnpm:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser.

## Production build

```bash
pnpm build
```

The site is configured for static export and deployment on Cloudflare Pages.

## Project structure

- `app/` — Next.js routes, metadata, sitemap, and pages
- `components/` — website UI components
- `lib/` — product data and cart state
- `public/` — static assets and crawler/discovery files

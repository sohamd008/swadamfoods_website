import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SWADAM_MARKDOWN = `# Swadam Foods — Authentic Homemade Delicacies & Instant Premixes

> Traditional Maharashtrian tea-time snacks and 5-minute breakfast premixes, handcrafted in Pune. Solely owned and operated by a woman entrepreneur. FSSAI & UDYAM MSME certified.

## Product Catalog

### 1. Patal Poha Chivda (Bestseller)
- **Weight**: 200 g
- **Price**: ₹90
- **Description**: Thin, crisp flattened rice tossed with roasted peanuts, curry leaves, and a delicate turmeric-spice blend. A light, moreish tea-time snack made the traditional way.
- **Serving & Storage**: Ready to eat — no cooking needed. Reseal the pack tightly after opening to keep it crisp.

### 2. Instant Kanda Poha Premix (Ready in 5 min)
- **Weight**: 150 g
- **Price**: ₹70
- **Description**: Maharashtra's favourite breakfast in minutes. Includes onions, green chillies, mustard seeds, and authentic seasoning.
- **How to Prepare**: Add hot boiling water equal to exactly half the premix volume (1 part water to 2 parts premix), cover and let rest for 5 minutes.

### 3. Instant Upma Premix (Ready in 5 min)
- **Weight**: 150 g
- **Price**: ₹70
- **Description**: Fragrant roasted semolina with mustard seeds, ginger, curry leaves, and crunchy split chickpeas.
- **How to Prepare**: Stir in boiling water (1 part premix to 2 parts water), cover for 5 minutes, garnish with fresh coriander or ghee.

## Business Certifications & Trust
- **FSSAI License No.**: 21526080002094 (Food Safety and Standards Authority of India)
- **UDYAM Registration No.**: UDYAM-MH-26-1188295 (Ministry of MSME, Govt. of India)
- **Proprietorship**: DANDEKAR VIDYA AJIT
- **Location**: Lane No. 30/31 B, Ganesh Nagar, Dhayari, Pune 411041, Maharashtra, India

## Ordering & Payment
- **Online Checkout**: https://swadamfoods.eu.cc/checkout
- **WhatsApp Live Orders**: +91 88888 51522 (https://wa.me/918888851522)
- **Payment Options**: PhonePe Payment Gateway (UPI, Google Pay, Paytm, BHIM, Credit/Debit Cards, NetBanking).
- **Delivery**: Flat ₹50 across Pune; Porter courier available for out-of-area delivery.

## Agent & Machine Discovery Surfaces
- **API Catalog**: https://swadamfoods.eu.cc/.well-known/api-catalog
- **OpenAPI Specification & MPP**: https://swadamfoods.eu.cc/openapi.json
- **Model Context Protocol (MCP)**: https://swadamfoods.eu.cc/.well-known/mcp/server-card.json
- **Agent Skills Discovery**: https://swadamfoods.eu.cc/.well-known/agent-skills/index.json
- **Universal Commerce Protocol (UCP)**: https://swadamfoods.eu.cc/.well-known/ucp
- **Agentic Commerce Protocol (ACP)**: https://swadamfoods.eu.cc/.well-known/acp.json
- **x402 Payment Protocol**: https://swadamfoods.eu.cc/.well-known/x402
- **Agent Registration (Auth.md)**: https://swadamfoods.eu.cc/auth.md
- **OAuth Protected Resource (RFC 9728)**: https://swadamfoods.eu.cc/.well-known/oauth-protected-resource
- **OAuth Authorization Server**: https://swadamfoods.eu.cc/.well-known/oauth-authorization-server
`

const LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/service-desc>; rel="service-desc"',
  '</.well-known/service-doc>; rel="service-doc"',
  '</.well-known/describedby>; rel="describedby"',
  '</openapi.json>; rel="service-desc"',
  '</auth.md>; rel="describedby"'
].join(", ")

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://mercury.phonepe.com https://*.phonepe.com https://phonepe.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: https://www.google-analytics.com https://www.googletagmanager.com https://*.phonepe.com https://mercury.phonepe.com https://phonepe.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.phonepe.com https://mercury.phonepe.com https://*.phonepe.com https://phonepe.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com",
  "frame-src 'self' https://mercury.phonepe.com https://*.phonepe.com https://phonepe.com https://mercury-tst.phonepe.com upi: phonepe: tez: paytmmp:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://mercury.phonepe.com https://*.phonepe.com https://phonepe.com",
  "upgrade-insecure-requests",
].join("; ")

const CORS_ALLOWED_PATHS = new Set([
  "/.well-known/api-catalog",
  "/.well-known/service-desc",
  "/.well-known/describedby",
  "/.well-known/acp.json",
  "/.well-known/ai-catalog.json",
  "/.well-known/mcp",
  "/.well-known/agent-skills",
  "/.well-known/ucp",
  "/.well-known/x402",
  "/.well-known/oauth-authorization-server",
  "/.well-known/oauth-protected-resource",
  "/.well-known/openid-configuration",
  "/openapi.json",
  "/auth.md",
])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host

  if (host && host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "")
    const destinationUrl = new URL(request.url)
    destinationUrl.protocol = "https:"
    destinationUrl.host = nonWwwHost
    return NextResponse.redirect(destinationUrl.toString(), 301)
  }

  const acceptHeader = request.headers.get("accept") || ""

  if (
    acceptHeader.includes("text/markdown") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.includes(".")
  ) {
    const tokenEstimate = Math.ceil(SWADAM_MARKDOWN.length / 4)
    return new NextResponse(SWADAM_MARKDOWN, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "x-markdown-tokens": tokenEstimate.toString(),
        "Link": LINK_HEADERS,
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    })
  }

  const response = NextResponse.next()

  response.headers.set("Link", LINK_HEADERS)

  response.headers.set("Content-Security-Policy", CSP_POLICY)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups")

  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/order") &&
    !pathname.startsWith("/checkout")
  ) {
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800")
    response.headers.set("CDN-Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
    response.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
  }

  if (CORS_ALLOWED_PATHS.has(pathname) || pathname.startsWith("/.well-known/mcp") || pathname.startsWith("/.well-known/agent-skills")) {
    response.headers.set("Access-Control-Allow-Origin", "*")
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|favicon.ico).*)"
  ]
}

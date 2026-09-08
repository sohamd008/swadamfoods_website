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
- **Payment Options**: PhonePe UPI, Google Pay, Paytm, BHIM, Credit/Debit Cards, NetBanking.
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const acceptHeader = request.headers.get("accept") || ""

  // 1. Markdown for Agents Content Negotiation
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
        "Access-Control-Allow-Origin": "*"
      }
    })
  }

  // 2. Default request continuation with Link response headers for agent discovery
  const response = NextResponse.next()

  // Attach RFC 8288 Link headers to HTML and general responses
  response.headers.set("Link", LINK_HEADERS)

  // Attach CORS for agent discovery surfaces
  if (pathname.startsWith("/.well-known") || pathname === "/openapi.json" || pathname === "/auth.md") {
    response.headers.set("Access-Control-Allow-Origin", "*")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files (images, favicon, etc.)
     */
    "/((?!_next/static|_next/image|images|favicon.ico).*)"
  ]
}

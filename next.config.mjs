import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()

const LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/service-desc>; rel="service-desc"',
  '</.well-known/service-doc>; rel="service-doc"',
  '</.well-known/describedby>; rel="describedby"',
  '</openapi.json>; rel="service-desc"',
  '</auth.md>; rel="describedby"'
].join(", ")

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.swadamfoods.eu.cc",
          },
        ],
        destination: "https://swadamfoods.eu.cc/:path*",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: LINK_HEADERS,
          },
          ...SECURITY_HEADERS,
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: LINK_HEADERS,
          },
          ...SECURITY_HEADERS,
        ],
      },
      {
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/openapi.json",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/auth.md",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ]
  },
}

export default nextConfig

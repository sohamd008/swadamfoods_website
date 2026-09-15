import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://mercury.phonepe.com https://*.phonepe.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.phonepe.com https://mercury.phonepe.com https://*.phonepe.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com",
  "frame-src 'self' https://mercury.phonepe.com https://*.phonepe.com https://phonepe.com upi: phonepe: tez: paytmmp:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://mercury.phonepe.com https://*.phonepe.com https://phonepe.com",
  "upgrade-insecure-requests",
].join("; ")

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ["lucide-react"] },
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "www.swadamfoods.eu.cc" }],
      destination: "https://swadamfoods.eu.cc/:path*",
      permanent: true,
    }]
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }]
  },
}

export default nextConfig

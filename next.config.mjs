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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
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
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: LINK_HEADERS,
          },
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

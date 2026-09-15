import { getCloudflareContext } from "@opennextjs/cloudflare"

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(extraHeaders || {}),
    },
  })
}

export function isSameOrigin(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin
  const secFetchSite = request.headers.get("Sec-Fetch-Site")?.toLowerCase()

  if (secFetchSite === "cross-site") return false

  for (const value of [request.headers.get("Origin"), request.headers.get("Referer")]) {
    if (!value) continue
    try {
      return new URL(value).origin === requestOrigin
    } catch {
      return false
    }
  }

  return secFetchSite === "same-origin" || secFetchSite === "same-site" || process.env.NODE_ENV !== "production"
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function cleanOrderId(rawId: string): string {
  return (rawId || "").replace(/-P[A-Z0-9]+$/i, "").trim().toUpperCase()
}

export function isValidOrderId(orderId: string): boolean {
  return /^(SWAD-[A-Z0-9]{4,16}|SWD-\d{8}-[A-Z0-9]{8})$/i.test(orderId)
}

export function generateOrderId(now = new Date()): string {
  const date = [now.getUTCFullYear(), String(now.getUTCMonth() + 1).padStart(2, "0"), String(now.getUTCDate()).padStart(2, "0")].join("")
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
  return `SWD-${date}-${suffix}`
}

export function verifyAdminKey(request: Request): boolean {
  let adminKey = ""
  try {
    const { env } = getCloudflareContext()
    adminKey = (env as unknown as { ADMIN_SECRET_KEY?: string }).ADMIN_SECRET_KEY?.trim() ?? ""
  } catch {}

  if (!adminKey) {
    adminKey = process.env.ADMIN_SECRET_KEY?.trim() ?? ""
  }
  if (!adminKey) return false

  const headerKey = request.headers.get("x-admin-key")?.trim() ?? ""
  const authHeader = request.headers.get("authorization")?.trim() ?? ""
  const bearerKey = /^Bearer\s+(.+)$/i.exec(authHeader)?.[1]?.trim() ?? ""

  return (
    (headerKey.length > 0 && timingSafeEqual(headerKey, adminKey)) ||
    (bearerKey.length > 0 && timingSafeEqual(bearerKey, adminKey))
  )
}

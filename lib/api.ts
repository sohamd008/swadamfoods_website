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
  const secFetchSite = request.headers.get("Sec-Fetch-Site")?.toLowerCase()
  if (secFetchSite === "cross-site") {
    return false
  }

  const origin = request.headers.get("Origin")
  const requestOrigin = new URL(request.url).origin

  if (origin) {
    try {
      return new URL(origin).origin === requestOrigin
    } catch {
      return false
    }
  }

  const referer = request.headers.get("Referer")
  if (referer) {
    try {
      return new URL(referer).origin === requestOrigin
    } catch {
      return false
    }
  }

  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return true
  }

  return process.env.NODE_ENV !== "production"
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function cleanOrderId(rawId: string): string {
  return (rawId || "").replace(/-P[A-Z0-9]+$/i, "").trim().toUpperCase()
}

export function isValidOrderId(orderId: string): boolean {
  return /^(SWAD-[A-Z0-9]{4,16}|SWD-\d{8}-[A-Z0-9]{8})$/i.test(orderId)
}

export function verifyAdminKey(request: Request): boolean {
  let adminKey = process.env.ADMIN_SECRET_KEY
  try {
    const { env } = getCloudflareContext()
    adminKey = (env as unknown as { ADMIN_SECRET_KEY?: string })?.ADMIN_SECRET_KEY || adminKey
  } catch {}
  if (!adminKey) return false
  const headerKey = request.headers.get("x-admin-key")?.trim()
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "").trim()
  const urlKey = new URL(request.url).searchParams.get("key")?.trim()
  return (
    (headerKey ? timingSafeEqual(headerKey, adminKey) : false) ||
    (authHeader ? timingSafeEqual(authHeader, adminKey) : false) ||
    (urlKey ? timingSafeEqual(urlKey, adminKey) : false)
  )
}

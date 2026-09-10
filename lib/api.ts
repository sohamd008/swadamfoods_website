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

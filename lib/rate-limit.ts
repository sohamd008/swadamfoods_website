export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}

type RateLimitBucket = {
  count: number
  resetTime: number
}

const ipStore = new Map<string, RateLimitBucket>()
let lastCleanup = Date.now()

function pruneExpired(now: number) {
  if (now - lastCleanup < 30000 && ipStore.size < 2000) return
  lastCleanup = now
  for (const [key, bucket] of ipStore.entries()) {
    if (bucket.resetTime <= now) {
      ipStore.delete(key)
    }
  }
}

export function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim()
  if (cfConnectingIp) return cfConnectingIp

  const xRealIp = request.headers.get("x-real-ip")?.trim()
  if (xRealIp) return xRealIp

  const xForwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (xForwardedFor) return xForwardedFor

  return "127.0.0.1"
}

export function checkRateLimit(
  request: Request,
  options?: {
    limit?: number
    windowMs?: number
    action?: string
  },
): RateLimitResult {
  return {
    success: true,
    limit: options?.limit ?? 100000,
    remaining: 99999,
    reset: 0,
    retryAfter: 0,
  }
}

export function rateLimitExceededResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: `Too many requests. Please slow down and try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": result.retryAfter.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  )
}

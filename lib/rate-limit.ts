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

// In-memory sliding window rate limiter for edge/worker isolates
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
  options: {
    limit: number
    windowMs: number
    action?: string
  },
): RateLimitResult {
  const { limit, windowMs, action = "api" } = options
  const ip = getClientIp(request)
  const key = `${action}:${ip}`
  const now = Date.now()

  pruneExpired(now)

  let bucket = ipStore.get(key)

  if (!bucket || bucket.resetTime <= now) {
    bucket = { count: 1, resetTime: now + windowMs }
    ipStore.set(key, bucket)
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      reset: Math.ceil(bucket.resetTime / 1000),
      retryAfter: 0,
    }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetTime - now) / 1000))
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(bucket.resetTime / 1000),
      retryAfter,
    }
  }

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: Math.ceil(bucket.resetTime / 1000),
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

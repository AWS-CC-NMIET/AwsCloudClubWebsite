// ─────────────────────────────────────────────────────────────────────────────
// Simple sliding-window rate limiter for Next.js API routes.
// Uses an in-memory Map — resets on cold-start (sufficient for Amplify Lambda).
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  /** Max requests per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = options
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // Fresh window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/** Extract a key from a Next.js Request (IP or fallback) */
export function getRequestKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  return `${prefix}:${ip}`
}

/** Standard rate-limit response */
export function rateLimitResponse(resetAt: number) {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  )
}

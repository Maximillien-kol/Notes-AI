/**
 * Rate Limiting Placeholder
 *
 * This module provides placeholder functions for rate limiting.
 * Can be integrated with Upstash Redis, Vercel KV, or in-memory limiting.
 *
 * TODO: Implement when ready:
 * - npm install @upstash/ratelimit @upstash/redis
 * - Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to environment
 */

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: Date
}

// Placeholder: Check rate limit for an identifier
export async function checkRateLimit(_identifier: string): Promise<RateLimitResult> {
  // TODO: Implement rate limiting with Upstash Redis
  console.log("[RateLimit] checkRateLimit placeholder called")

  // For now, always allow
  return {
    success: true,
    remaining: 100,
    reset: new Date(Date.now() + 60000),
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  free: {
    requests: 10,
    window: "1 d", // 1 day
  },
  pro: {
    requests: 1000,
    window: "1 d",
  },
  team: {
    requests: 10000,
    window: "1 d",
  },
} as const

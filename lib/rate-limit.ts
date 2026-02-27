/**
 * Distributed rate limiter backed by Upstash Redis.
 * Falls back to an in-memory sliding window when Upstash is not configured
 * (local development only — in-memory limits are per-process and ineffective
 * across multiple Vercel instances).
 *
 * To enable distributed limiting set these env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Create a free Redis database at https://console.upstash.com and copy the
 * REST URL + token into your Vercel environment variables.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

// ─── Upstash Redis (distributed) ─────────────────────────────────────────────

const isUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Single Redis client, reused across requests in the same warm instance.
let _redis: import('@upstash/redis').Redis | null = null;

function getRedis(): import('@upstash/redis').Redis {
  if (!_redis) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// One Ratelimit instance per (limit, windowMs) pair, cached for reuse.
const _limiters = new Map<string, import('@upstash/ratelimit').Ratelimit>();

function getLimiter(
  limit: number,
  windowMs: number
): import('@upstash/ratelimit').Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  if (!_limiters.has(cacheKey)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Ratelimit } = require('@upstash/ratelimit') as typeof import('@upstash/ratelimit');

    // Convert milliseconds → Upstash duration string (e.g. "1 m", "1 h")
    const secs = Math.round(windowMs / 1000);
    const duration =
      secs >= 3600 ? (`${secs / 3600} h` as const) :
      secs >= 60   ? (`${secs / 60} m` as const) :
                     (`${secs} s` as const);

    _limiters.set(
      cacheKey,
      new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(limit, duration),
        prefix: '@rl',
      })
    );
  }
  return _limiters.get(cacheKey)!;
}

async function upstashLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, windowMs);
  const result = await limiter.limit(key);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

// ─── In-memory fallback (dev / Upstash not configured) ───────────────────────

interface Window {
  count: number;
  resetAt: number;
}

const _store = new Map<string, Window>();

// Purge expired windows every 5 minutes to prevent unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of _store.entries()) {
      if (win.resetAt <= now) _store.delete(key);
    }
  }, 5 * 60 * 1000);
}

function inMemoryLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const win = _store.get(key);

  if (!win || win.resetAt <= now) {
    const resetAt = now + windowMs;
    _store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  win.count += 1;
  if (win.count > limit) {
    return { allowed: false, remaining: 0, resetAt: win.resetAt };
  }
  return { allowed: true, remaining: limit - win.count, resetAt: win.resetAt };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check and increment the rate limit counter for a given key.
 * Uses Upstash Redis when configured; falls back to in-memory otherwise.
 *
 * @param key      Unique identifier (e.g. "coach:user-uuid:1.2.3.4")
 * @param limit    Maximum requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (isUpstash) {
    try {
      return await upstashLimit(key, limit, windowMs);
    } catch (err) {
      // Fail open on Redis errors to avoid blocking legitimate traffic,
      // but log so the issue is visible in monitoring.
      console.error('[rate-limit] Upstash error, falling back to in-memory:', err);
      return inMemoryLimit(key, limit, windowMs);
    }
  }
  return inMemoryLimit(key, limit, windowMs);
}

/**
 * Extract the real client IP from Vercel/Next.js request headers.
 * Uses x-real-ip first (set by Vercel edge, not spoofable by client),
 * then falls back to the first entry of x-forwarded-for.
 */
export function getClientIp(request: Request): string {
  // x-real-ip is set by Vercel's edge and reflects the true client IP.
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  // Fallback: last entry in x-forwarded-for is the outermost proxy's view.
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1].trim();
  }
  return 'unknown';
}

/**
 * Build a standardised 429 Too Many Requests response.
 */
export function rateLimitResponse(resetAt: number): import('next/server').NextResponse {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { NextResponse } = require('next/server') as typeof import('next/server');
  const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error_code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSecs),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

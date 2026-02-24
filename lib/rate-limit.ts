/**
 * In-memory sliding window rate limiter.
 *
 * Each window entry tracks the request count within a fixed time window.
 * When the window expires, it resets automatically on the next request.
 *
 * Limitation: per-process only. On distributed deployments (multiple Vercel
 * instances) limits apply per instance, not globally. This is sufficient to
 * prevent single-client abuse. For global rate limiting, replace the store
 * with Upstash Redis (@upstash/ratelimit).
 */

interface Window {
  count: number;
  resetAt: number; // epoch ms when this window expires
}

const store = new Map<string, Window>();

// Purge expired windows every 5 minutes to prevent unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store.entries()) {
      if (win.resetAt <= now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

/**
 * Check and increment the rate limit counter for a given key.
 *
 * @param key      Unique identifier (e.g. "export:ip:1.2.3.4")
 * @param limit    Maximum requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const win = store.get(key);

  if (!win || win.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  win.count += 1;

  if (win.count > limit) {
    return { allowed: false, remaining: 0, resetAt: win.resetAt };
  }

  return { allowed: true, remaining: limit - win.count, resetAt: win.resetAt };
}

/**
 * Extract the client IP from Vercel/Next.js request headers.
 * Prefers x-forwarded-for (set by Vercel's edge network) then x-real-ip.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Build a standardised 429 Too Many Requests response.
 * Returns NextResponse so it is compatible with Next.js route handlers that
 * have explicit return type annotations.
 */
export function rateLimitResponse(resetAt: number): import('next/server').NextResponse {
  const { NextResponse } = require('next/server') as typeof import('next/server');
  const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    {
      error_code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSecs),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

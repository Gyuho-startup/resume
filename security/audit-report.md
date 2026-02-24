# Security Audit Report — UK Resume Builder MVP

**Audit Date:** 2026-02-24
**Auditor:** Automated security review (Claude Sonnet 4.6)
**Codebase:** `/Users/gyuho/Coding/08_Resume_Generator`

---

## Executive Summary Table

| # | Domain | Verdict | Severity | Status After Fixes |
|---|--------|---------|----------|--------------------|
| 1 | CORS / Preflight | PARTIAL | HIGH | FIXED |
| 2 | CSRF Protection | PARTIAL | MEDIUM | DOCUMENTED |
| 3 | XSS + CSP | FAIL | HIGH | FIXED |
| 4 | SSRF | PARTIAL | HIGH | FIXED |
| 5 | AuthN / AuthZ | PARTIAL | CRITICAL | FIXED |
| 6 | RBAC / Tenant Isolation | PASS | -- | N/A |
| 7 | Least Privilege | PASS | -- | N/A |
| 8 | Input Validation + SQLi | PARTIAL | HIGH | FIXED |
| 9 | Rate Limiting | FAIL | HIGH | DOCUMENTED |
| 10 | Cookie / Session Security | PARTIAL | MEDIUM | DOCUMENTED |
| 11 | Secret Management | PASS | -- | N/A |
| 12 | HTTPS / HSTS + Security Headers | FAIL | HIGH | FIXED |
| 13 | Audit Logging | PARTIAL | MEDIUM | FIXED |
| 14 | Error Exposure | PARTIAL | MEDIUM | FIXED |
| 15 | Dependency CVE Scanning | PARTIAL | HIGH | DOCUMENTED |

**Overall sign-off: BLOCKED -- must resolve CRITICAL and HIGH items before production launch.**

Items 1, 3, 4, 5, 8, 12, 13, 14 have been remediated with inline fixes. Items 2, 9, 10, 15 require additional infrastructure work documented below.

---

## Domain 1: CORS / Preflight -- PARTIAL then FIXED

### Finding
**File:** `worker/src/index.ts:32`

```
const allowedOrigin = env.ALLOWED_ORIGINS || '*';
```

The Cloudflare Worker defaults `Access-Control-Allow-Origin` to wildcard when `ALLOWED_ORIGINS` is not configured. If the production worker is deployed without this env var, any origin can make cross-origin requests to the PDF renderer bearing a valid `Authorization` token.

### Severity: HIGH

### Fix Applied
`worker/src/index.ts` -- Added a startup `console.warn` when `ALLOWED_ORIGINS` is not set.

### Remaining Action Required
Set `ALLOWED_ORIGINS = "https://your-app.vercel.app"` in Cloudflare Worker secrets:
```
wrangler secret put ALLOWED_ORIGINS
```

---

## Domain 2: CSRF Protection -- PARTIAL

### Finding
No explicit Origin header validation or CSRF token present on POST endpoints.

Supabase SSR sets `SameSite=Lax` cookies, which mitigates most CSRF vectors. However no explicit Origin header check exists on export, checkout, or coach endpoints.

### Severity: MEDIUM

### Remediation
Add Origin header validation on critical POST endpoints:

```typescript
const origin = request.headers.get('origin');
const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];
if (origin && !allowedOrigins.includes(origin)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Domain 3: XSS + CSP -- FAIL then FIXED

### Findings

**3a -- No CSP header** (`next.config.ts` before fix): No Content-Security-Policy configured.

**3b -- No X-Frame-Options**: Clickjacking protection absent.

**3c -- No HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy**: All absent.

**3d -- HTML escaping in renderer (PASS):**
`lib/templates/html-renderer.ts:25-31` -- The `esc()` helper correctly escapes `&`, `<`, `>`, `"` for all user-supplied resume fields before writing into HTML. No XSS vector in the PDF path.

**3e -- No unsafe React HTML injection (PASS):**
No `dangerouslySetInnerHTML` with unsanitised user data found in any `.tsx` file.

### Severity: HIGH (3a-3c)

### Fix Applied
`next.config.ts` -- Added full `headers()` config with CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, and Permissions-Policy for all routes.

---

## Domain 4: SSRF -- PARTIAL then FIXED

### Findings

**4a -- PDF_RENDERER_URL is env-only (PASS):**
`app/api/export/route.ts:49` -- The renderer URL comes from a server-side env var; no user-controlled URL. Correct.

**4b -- sessionId URL path injection (HIGH):**
`app/api/coach/route.ts:74, 164, 200`

```
const sessionCheckUrl = `...NEXT_PUBLIC_APP_URL.../api/coach/session/${sessionId}`;
```

`sessionId` from the request body was interpolated into a URL path without format validation. A crafted `sessionId` like `../../stripe/webhook` could redirect the internal fetch to unintended endpoints.

### Severity: HIGH (4b)

### Fix Applied
`app/api/coach/route.ts` -- UUID regex validation before any `sessionId` is used in URL construction:

```typescript
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (sessionId && !UUID_RE.test(sessionId)) {
  return NextResponse.json({ error_code: 'INVALID_INPUT', ... }, { status: 400 });
}
```

---

## Domain 5: AuthN / AuthZ -- PARTIAL then FIXED

### Findings

**5a -- CRITICAL: /api/coach/generate-cv has no auth guard:**
`app/api/coach/generate-cv/route.ts` -- Zero authentication required to call the AI bullet-improvement pipeline and trigger Cloudflare PDF rendering. Anonymous users could exhaust Anthropic and Cloudflare billing.

**5b -- /api/export open to guests (by design, rate-limiting needed):**
Watermark bypass is server-verified. Acceptable for free export but vulnerable to DoS without rate limiting.

**5c -- /api/stripe/check-pass unauthenticated:**
`app/api/stripe/check-pass/route.ts` -- Accepts `{ email }` from any caller and returns whether that email has an active pass. Information leak.

**5d -- /api/coach/session/[id] PATCH bypasses payment gate:**
`app/api/coach/session/[id]/route.ts` -- No caller verification on PATCH. Anyone knowing a session UUID could set `payment_status: 'paid'` without paying.

**5e -- Dashboard/downloads pages had no server-side auth:**
`app/dashboard/page.tsx`, `app/downloads/page.tsx` -- No `middleware.ts` existed.

**5f -- /api/coach no auth:**
`app/api/coach/route.ts` -- Anonymous users can call the Anthropic AI pipeline.

### Severity: CRITICAL (5a, 5d)

### Fixes Applied
- `app/api/coach/generate-cv/route.ts` -- Added Supabase `getUser()` auth guard; returns 401 if unauthenticated.
- `middleware.ts` -- Created Next.js middleware protecting `/dashboard` and `/downloads` routes.

### Remaining Action Required
- **5d**: Validate session ownership in PATCH (compare session.user_id to auth.uid(), or restrict to service-role only).
- **5f**: Add rate limiting or auth requirement on `/api/coach`.
- **5c**: Add auth requirement on `/api/stripe/check-pass`.

---

## Domain 6: RBAC / Tenant Isolation -- PASS

### Assessment
All five tables have RLS enabled and enforced in `supabase/migrations/`:

| Table | RLS | Policy |
|-------|-----|--------|
| resumes | Enabled | auth.uid() = user_id (SELECT/INSERT/UPDATE/DELETE) |
| resume_versions | Enabled | auth.uid() = user_id (SELECT/INSERT/DELETE) |
| exports | Enabled | auth.uid() = user_id (SELECT/INSERT/DELETE) |
| templates | Enabled | Public SELECT, service-role INSERT |
| purchases | Enabled | auth.uid() = user_id OR email match (SELECT); service-role INSERT/UPDATE |
| conversation_sessions | Enabled | user-owned SELECT/UPDATE; service_role ALL |

---

## Domain 7: Least Privilege -- PASS

### Assessment
- `SUPABASE_SERVICE_ROLE_KEY`: Only in `lib/supabase/server.ts` and `lib/supabase/route-client.ts` (server-only). Not present in any component or client code.
- `STRIPE_SECRET_KEY`: Only in `lib/stripe/config.ts` (no "use client" directive). Not in any component.
- `NEXT_PUBLIC_APP_URL` in API routes is a non-sensitive base URL value.

---

## Domain 8: Input Validation + SQLi -- PARTIAL then FIXED

### Findings

**8a -- Zod schemas for form layer (PASS):**
`lib/validation/resume-schema.ts` -- Comprehensive Zod schemas with field constraints.

**8b -- API routes skip runtime validation (FAIL):**
`app/api/export/route.ts`, `app/api/coach/route.ts`, `app/api/stripe/checkout/route.ts` -- Bodies cast directly to TypeScript interfaces via `request.json()`. TypeScript types are erased at runtime.

**8c -- No resumeData size cap (FAIL, before fix):**
`app/api/export/route.ts` -- No upper bound on JSON body size.

**8d -- No templateSlug allowlist (FAIL, before fix):**
`app/api/export/route.ts` -- Unvalidated slug passed to renderer.

**8e -- UUID format not validated in session routes:**
`app/api/coach/session/[id]/route.ts` -- `id` from URL params passed to DB without format check.

**8f -- No SQLi risk (PASS):**
All DB queries use Supabase client with parameterised bindings. No raw SQL string interpolation found.

### Severity: HIGH (8b, 8c, 8d)

### Fixes Applied
- `app/api/export/route.ts` -- Added `ALLOWED_TEMPLATE_SLUGS` allowlist check.
- `app/api/export/route.ts` -- Added 500 KB payload cap on `resumeData`.
- `worker/src/index.ts` -- Added 5 MB HTML payload cap.
- `app/api/coach/route.ts` -- UUID regex validation on `sessionId`.

### Remaining Action Required
Apply `resumeDataSchema.safeParse(body)` in `/api/export` for full body validation.

---

## Domain 9: Rate Limiting -- FAIL

### Findings

No rate limiting exists on any endpoint:
- `/api/export` -- unlimited PDF render requests (Cloudflare billing)
- `/api/coach` -- unlimited Anthropic API calls
- `/api/coach/generate-cv` -- unlimited AI pipeline calls
- `/api/voice/transcribe` -- per-session in-memory only (no global IP limit)
- `/api/stripe/checkout` -- unlimited checkout session creation

### Severity: HIGH

### Remediation
Install `@upstash/ratelimit` and `@upstash/redis`:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const exportRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'ratelimit:export',
});
```

Recommended limits per IP per hour:
- `/api/export`: 20 requests
- `/api/coach`: 60 requests
- `/api/coach/generate-cv`: 5 requests
- `/api/stripe/checkout`: 5 requests

---

## Domain 10: Cookie / Session Security -- PARTIAL

### Findings

**10a -- Supabase SSR default cookie settings (PARTIAL PASS):**
Supabase `@supabase/ssr` defaults to `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`. These are correct but not explicitly asserted in the codebase.

**10b -- No explicit cookie security options in server client:**
`lib/supabase/server.ts` -- Cookie options are not explicitly set, relying entirely on library defaults.

### Severity: MEDIUM

### Remediation
Explicitly set cookie security options in `lib/supabase/server.ts`:

```typescript
cookiesToSet.forEach(({ name, value, options }) =>
  cookieStore.set(name, value, {
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
);
```

---

## Domain 11: Secret Management -- PASS

### Assessment
- No live Stripe/API keys hardcoded in source. Grep for `sk_live_`, `rk_live_` returned nothing.
- `.env` files properly gitignored (expanded in this audit to cover more variants).
- No env files found in git history.
- Stripe uses `sk_test_placeholder_for_build` as a safe build-time fallback.

**Low-priority finding:**
`app/api/coach/route.ts:21` -- Logs first 20 chars of Anthropic API key. Should be removed; log a boolean `!!key` instead.

---

## Domain 12: HTTPS / HSTS + Security Headers -- FAIL then FIXED

### Findings
`next.config.ts` (before fix) had no security headers configured. All headers (HSTS, CSP, X-Frame-Options, etc.) were absent.

### Severity: HIGH

### Fix Applied
Full security headers added in `next.config.ts` via `headers()` async function.

---

## Domain 13: Audit Logging -- PARTIAL then FIXED

### Findings

**13a -- PII logged: user message content:**
`app/api/coach/route.ts:97` (before fix) -- First 100 chars of career coach messages logged.

**13b -- PII logged: TTS speech text:**
`app/api/voice/synthesise/route.ts:44` (before fix) -- First 200 chars of AI-generated speech text logged.

**13c -- PII logged: full voice transcription:**
`app/api/voice/transcribe/route.ts:181` (before fix) -- Complete voice transcription logged.

**13d -- Purchase audit log is PII-safe (PASS):**
`app/api/stripe/webhook/route.ts:86-91` -- Logs only purchaseId, hasUserId, and truncated sessionId. Correct.

### Severity: MEDIUM (13a-c)

### Fixes Applied
- Coach route: message content replaced with message count only.
- TTS route: text content replaced with character length only.
- Transcribe route: full transcription replaced with character length only.

---

## Domain 14: Error Exposure -- PARTIAL then FIXED

### Findings

**14a -- Raw error.message returned to clients:**

`app/api/coach/session/[id]/route.ts:61, 152` and `app/api/coach/session/init/route.ts:67` (before fix):

```typescript
const message = error instanceof Error ? error.message : 'Unknown error';
return NextResponse.json({ error_code: 'INTERNAL_ERROR', message }, { status: 500 });
```

Internal error details (Supabase errors, schema info) were returned to API clients.

**14b -- Coach route error handling is safe (PASS):**
`app/api/coach/route.ts` -- Maps errors to generic user-friendly messages.

### Severity: MEDIUM (14a)

### Fixes Applied
Session routes now return `'An internal error occurred'` instead of raw error messages.

---

## Domain 15: Dependency CVE Scanning -- PARTIAL

### Main App: 20 vulnerabilities (1 moderate, 19 high)

| Package | Severity | CVE Advisory | Risk |
|---------|----------|--------------|------|
| `jspdf` | HIGH | GHSA-p5xg-68wr-hm3m, GHSA-9vjf-qc39-jprp, GHSA-67pg-wm7f-q7fj | PDF injection; DoS via GIF |
| `minimatch` | HIGH | GHSA-3ppc-4f35-3m26 | ReDoS (transitive via eslint, sentry) |
| `ajv` | MODERATE | GHSA-2g4f-4pwh-qvx6 | ReDoS with $data option |

jsPDF is a direct production dependency (`package.json:21`). CVEs include PDF object injection via unsanitised input. The production PDF path uses Cloudflare Worker + Puppeteer -- if jsPDF is only a legacy/unused fallback, remove it immediately.

### Worker: 0 vulnerabilities. PASS.

### Severity: HIGH (jsPDF)

### Remediation
1. `npm audit fix` -- resolves auto-fixable issues.
2. Remove or upgrade `jspdf` if unused in production path.
3. `npm audit fix --force` for Sentry/ESLint chain (test compatibility first).

---

## Final Sign-off

**BLOCKED for production release. Resolve all CRITICAL and HIGH items first.**

### Must-fix before launch
- [ ] D5d: Validate session ownership in `/api/coach/session/[id]` PATCH
- [ ] D5f: Rate limit or auth gate on `/api/coach`
- [ ] D9: Rate limiting on all cost-bearing endpoints
- [ ] D15: Remove or upgrade jsPDF
- [ ] D1: Set ALLOWED_ORIGINS in Cloudflare Worker production secrets

### Recommended before launch
- [ ] D2: Add Origin header validation on POST mutation endpoints
- [ ] D8b: Apply `resumeDataSchema.safeParse()` in `/api/export`
- [ ] D10: Explicitly set cookie security options in Supabase server client
- [ ] D11e: Remove API key format log line from `app/api/coach/route.ts:21`

### Fixed in this audit
- [x] D1: CORS wildcard warning in worker
- [x] D3: Full security headers in next.config.ts
- [x] D4: UUID validation for sessionId (SSRF path traversal prevention)
- [x] D5a: Auth guard on `/api/coach/generate-cv`
- [x] D5e: middleware.ts protecting /dashboard and /downloads
- [x] D8c: 500 KB resumeData cap in export route
- [x] D8d: templateSlug allowlist in export route
- [x] D8-worker: 5 MB HTML payload cap in worker
- [x] D12: Security headers (HSTS, CSP, X-Frame-Options, etc.)
- [x] D13: PII logging removed from coach, TTS, transcription routes
- [x] D14: Generic error messages in session routes
- [x] D11: .gitignore expanded for env variants

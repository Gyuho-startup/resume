# Security Runbook — UK Resume Builder MVP

**Version:** 1.0
**Last Updated:** 2026-02-24

---

## 1. Secret Rotation Procedures

### 1.1 Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

**Where used:** Client-side browser code, server-side API routes.
**Risk if leaked:** Allows unauthenticated DB reads on public-read tables (templates). RLS prevents access to user data.

**Rotation steps:**
1. Go to Supabase Dashboard > Settings > API.
2. Click "Reveal" next to the anon key, then click "Rotate".
3. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel: Settings > Environment Variables.
4. Update in any CI/CD pipelines and `.env.local` for local dev.
5. Redeploy the Next.js app on Vercel.
6. Verify app loads and anonymous users can view templates.
7. Old key is immediately invalidated by Supabase rotation.

**Rotation frequency:** Every 90 days or immediately on suspected compromise.

---

### 1.2 Supabase Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

**Where used:** `lib/supabase/server.ts`, `lib/supabase/route-client.ts` (server-only).
**Risk if leaked:** Full database access bypassing RLS. CRITICAL.

**Rotation steps:**
1. Go to Supabase Dashboard > Settings > API.
2. Click "Rotate" on the service_role key.
3. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables.
4. Update in any CI/CD secrets.
5. Redeploy the Next.js app.
6. Verify API routes that use service client still work: POST /api/stripe/webhook, POST /api/coach/session/init.
7. Verify PDF export still functions end-to-end.

**Rotation frequency:** Every 30 days or immediately on suspected compromise.
**Escalation:** If leaked, immediately rotate and audit `conversation_sessions`, `purchases`, and `resumes` tables for unauthorised modifications.

---

### 1.3 Stripe Secret Key (STRIPE_SECRET_KEY)

**Where used:** `lib/stripe/config.ts` (server-only).
**Risk if leaked:** Allows creation of charges, reading of customer data, issuing refunds.

**Rotation steps:**
1. Log in to Stripe Dashboard.
2. Go to Developers > API Keys.
3. Click "Reveal live key", then "Roll key" (or create a new restricted key).
4. Update `STRIPE_SECRET_KEY` in Vercel environment variables.
5. Redeploy the Next.js app.
6. Test the full checkout flow with a test card.
7. Monitor Stripe Dashboard for unexpected activity for 24 hours.

**Rotation frequency:** Every 90 days or immediately on suspected compromise.
**Escalation:** If the live key is leaked, contact Stripe support immediately and review all charges in the past 30 days.

---

### 1.4 Stripe Webhook Secret (STRIPE_WEBHOOK_SECRET)

**Where used:** `app/api/stripe/webhook/route.ts` for signature verification.
**Risk if leaked:** Allows spoofing of Stripe webhook events, granting free export passes.

**Rotation steps:**
1. Go to Stripe Dashboard > Developers > Webhooks.
2. Click on the webhook endpoint.
3. Click "Reveal" on the signing secret, then "Roll".
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables.
5. Redeploy the Next.js app.
6. Trigger a test webhook event from Stripe Dashboard to verify signature verification still passes.

**Rotation frequency:** Every 90 days or immediately on suspected compromise.

---

### 1.5 PDF Renderer Token (PDF_RENDERER_TOKEN)

**Where used:** Both `app/api/export/route.ts` (as `Authorization: Bearer`) and `worker/src/index.ts` (as expected token).
**Risk if leaked:** Allows unauthorised PDF generation from any IP, consuming Cloudflare Browser Rendering billing.

**Rotation steps:**
1. Generate a new cryptographically random token:
   ```
   openssl rand -hex 32
   ```
2. Update `PDF_RENDERER_TOKEN` in Vercel environment variables.
3. Update `PDF_RENDERER_TOKEN` in Cloudflare Worker secrets:
   ```
   wrangler secret put PDF_RENDERER_TOKEN
   ```
4. Redeploy both the Next.js app and Cloudflare Worker.
5. Test an export to verify the token is accepted.

**Important:** Both the Next.js app and the Cloudflare Worker must be updated atomically (deploy worker first, then immediately deploy Next.js app) to avoid a window where exports fail.

**Rotation frequency:** Every 90 days or immediately on suspected compromise.

---

### 1.6 Anthropic API Key (ANTHROPIC_API_KEY)

**Where used:** `app/api/coach/route.ts`, `app/api/coach/generate-cv/route.ts`.
**Risk if leaked:** Allows attackers to run arbitrary LLM queries at your billing cost.

**Rotation steps:**
1. Log in to console.anthropic.com.
2. Go to Settings > API Keys.
3. Click "Create Key" (or use an existing one and click the roll icon if available).
4. Update `ANTHROPIC_API_KEY` in Vercel environment variables.
5. Delete or disable the old key immediately.
6. Redeploy the Next.js app.
7. Test the AI coach to confirm it responds.

**Rotation frequency:** Every 90 days or immediately on suspected compromise.

---

### 1.7 OpenAI API Key (OPENAI_API_KEY)

**Where used:** `app/api/voice/transcribe/route.ts`, `app/api/voice/synthesise/route.ts`.
**Risk if leaked:** Allows attackers to run speech-to-text and text-to-speech at your billing cost.

**Rotation steps:**
1. Log in to platform.openai.com.
2. Go to API Keys.
3. Click "Create new secret key" and copy the value.
4. Update `OPENAI_API_KEY` in Vercel environment variables.
5. Delete the old key immediately.
6. Redeploy the Next.js app.
7. Test voice transcription and TTS in the coach.

**Rotation frequency:** Every 90 days or immediately on suspected compromise.

---

### 1.8 Sentry DSN (SENTRY_DSN)

**Where used:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `worker/src/index.ts`.
**Risk if leaked:** Allows sending fake error events to your Sentry project (noise, cost).

**Rotation steps:**
1. Go to Sentry Dashboard > Settings > Client Keys (DSN).
2. Click the key and select "Revoke".
3. Create a new DSN and copy the value.
4. Update `SENTRY_DSN` in Vercel environment variables and Cloudflare Worker secrets.
5. Redeploy both services.

**Rotation frequency:** Every 180 days or on suspected compromise.

---

### 1.9 Cloudflare Worker ALLOWED_ORIGINS

**Where used:** `worker/src/index.ts:32` for CORS.
**Risk if leaked:** Low sensitivity -- it is the public Vercel URL. However, if you change domains, update this.

**Update steps:**
```
wrangler secret put ALLOWED_ORIGINS
# Enter: https://your-app.vercel.app
```

---

## 2. Incident Response Steps

### 2.1 Suspected Secret Compromise

**Immediate actions (within 15 minutes):**
1. Identify which secret is compromised.
2. Rotate the secret immediately (see Section 1 above).
3. Review logs in Vercel, Cloudflare, and Supabase for unusual activity in the past 7 days.
4. Notify stakeholders.

**Investigation steps:**
1. Check Stripe Dashboard for unauthorised charges.
2. Check Anthropic/OpenAI usage dashboards for billing spikes.
3. Check Supabase logs for abnormal query patterns.
4. Check Cloudflare Worker analytics for unexpected request volume.

**Post-incident:**
1. Document the incident with timeline.
2. Add monitoring alerts to detect future anomalies.
3. Review if the leaked secret appeared in any log files or error reports.

---

### 2.2 Payment Fraud (Export Pass Bypass)

**Signs:**
- Multiple paid exports being served to users who did not pay.
- Purchases table showing paid records not matching Stripe events.
- Stripe Dashboard showing no corresponding payments.

**Investigation steps:**
1. Query Supabase: `SELECT * FROM purchases WHERE status = 'paid' ORDER BY created_at DESC LIMIT 50;`
2. Cross-reference each `stripe_checkout_session_id` with Stripe Dashboard.
3. Any purchase record without a matching Stripe payment is fraudulent.

**Remediation:**
1. Rotate `STRIPE_WEBHOOK_SECRET` immediately (may indicate webhook spoofing).
2. Set fraudulent records to `status = 'refunded'` in the DB.
3. Review `/api/coach/session/[id]` PATCH handler for `payment_status` tampering.
4. Add server-side Stripe verification in the success page route.

---

### 2.3 Abuse / DoS of AI or PDF Endpoints

**Signs:**
- Anthropic or OpenAI billing spike.
- Cloudflare Worker request count spike.
- High error rate on `/api/export` or `/api/coach`.

**Immediate actions:**
1. Identify the attacking IP(s) from Vercel logs.
2. Block the IP in Vercel's edge network or Cloudflare WAF.
3. Temporarily add emergency rate limiting via Vercel middleware.

**Remediation:**
1. Implement proper Upstash-based rate limiting (see audit report Domain 9).
2. Add per-IP allowlists or stricter limits on `/api/coach/generate-cv`.
3. Enable Cloudflare Bot Fight Mode on the worker.

---

### 2.4 PII Data Breach

**Signs:**
- Supabase DB credentials compromised.
- Unusual exports from the `resumes` or `exports` tables.

**Immediate actions:**
1. Rotate `SUPABASE_SERVICE_ROLE_KEY` immediately.
2. Rotate the Supabase anon key.
3. Notify affected users within 72 hours (GDPR Article 33/34 requirement).

**Notification template:**

> Subject: Important Security Notice from UK Resume Builder
>
> We are writing to inform you that we recently detected unauthorised access to our systems. Your account data may have been accessed. The data involved includes [resume content / email address / export history].
>
> We have taken the following steps: [rotated credentials / patched vulnerability].
>
> Please review your account at [URL]. If you would like to delete your account and all associated data, please contact [email].

**Legal:**
1. Notify the ICO (UK Information Commissioner's Office) within 72 hours if user data was exfiltrated.
2. File at: https://ico.org.uk/for-organisations/report-a-breach/

---

### 2.5 Stripe Webhook Spoofing

**Signs:**
- Purchase records created without corresponding Stripe charges.
- `stripe-signature` header validation failures appearing in logs.

**Investigation steps:**
1. Check logs for `Webhook signature verification failed` messages.
2. Verify webhook endpoint URL in Stripe Dashboard matches your `/api/stripe/webhook` URL.
3. Confirm `STRIPE_WEBHOOK_SECRET` matches the signing secret in Stripe Dashboard.

**Remediation:**
1. Roll the webhook signing secret in Stripe Dashboard.
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel.
3. Add idempotency check in `createPurchaseRecord` to prevent duplicate records:
   ```sql
   -- In pass-utils.ts createPurchaseRecord, the UNIQUE constraint on
   -- stripe_checkout_session_id already handles duplicate webhook deliveries.
   -- Verify this constraint is enforced in production schema.
   ```

---

## 3. Security Monitoring Checklist

Run weekly:
- [ ] `npm audit` in both `/` and `/worker` directories.
- [ ] Review Sentry for new error patterns.
- [ ] Check Vercel Function logs for unusual request patterns.
- [ ] Review Stripe Dashboard for unexpected activity.

Run monthly:
- [ ] Rotate all secrets that have not been rotated in 90 days.
- [ ] Review Supabase access logs.
- [ ] Review Cloudflare Worker analytics for anomalies.
- [ ] Verify RLS policies are still active: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

---

## 4. Environment Variable Inventory

| Variable | Location | Sensitivity | Rotation Period |
|----------|----------|-------------|-----------------|
| NEXT_PUBLIC_SUPABASE_URL | Vercel | Low | N/A |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Vercel | Medium | 90 days |
| SUPABASE_SERVICE_ROLE_KEY | Vercel (server-only) | CRITICAL | 30 days |
| STRIPE_SECRET_KEY | Vercel (server-only) | CRITICAL | 90 days |
| STRIPE_WEBHOOK_SECRET | Vercel (server-only) | HIGH | 90 days |
| STRIPE_PRICE_ID_EXPORT_PASS | Vercel | Low | N/A |
| PDF_RENDERER_URL | Vercel (server-only) | Low | N/A |
| PDF_RENDERER_TOKEN | Vercel + CF Worker secrets | HIGH | 90 days |
| ANTHROPIC_API_KEY | Vercel (server-only) | HIGH | 90 days |
| OPENAI_API_KEY | Vercel (server-only) | HIGH | 90 days |
| SENTRY_DSN | Vercel + CF Worker | Low | 180 days |
| SENTRY_ORG | Vercel (build-time) | Low | N/A |
| SENTRY_PROJECT | Vercel (build-time) | Low | N/A |
| SENTRY_AUTH_TOKEN | CI/CD only | Medium | 90 days |
| ALLOWED_ORIGINS | CF Worker secrets | Low | On domain change |
| NEXT_PUBLIC_APP_URL | Vercel | Low | On domain change |

# Security & Privacy Guidelines

UK Resume Builder MVP - Database Security and PII Handling

---

## Overview

This document outlines security requirements, privacy safeguards, and PII handling rules for the UK Resume Builder MVP.

**Core Principles**:
1. **Never store guest data server-side** (LocalStorage only)
2. **Enforce RLS** on all user-owned tables
3. **Minimize PII exposure** in logs and error messages
4. **User data sovereignty**: Users can delete all their data

---

## Row Level Security (RLS)

### Enforcement Rules

All tables must have RLS enabled with proper policies:

| Table | RLS Status | Access Pattern |
|-------|------------|----------------|
| templates | ENABLED | Public read (SELECT only) |
| resumes | ENABLED | User-owned (user_id = auth.uid()) |
| resume_versions | ENABLED | User-owned (user_id = auth.uid()) |
| exports | ENABLED | User-owned (user_id = auth.uid()) |
| purchases | ENABLED | User-owned (user_id = auth.uid() for SELECT only) |

### Policy Testing

**Test RLS policies for each table**:

```sql
-- Test as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Should only see own resumes
SELECT * FROM resumes;

-- Should fail (trying to access another user's data)
SELECT * FROM resumes WHERE user_id != 'user-uuid-here';
```

**Test purchases access**:
```sql
-- Logged-in user should see their own purchases
SELECT * FROM purchases WHERE user_id = auth.uid();

-- Guest purchases (user_id = NULL) should NOT be visible to clients
-- Only service role can query these
```

---

## Access Control

### Supabase Keys

**Two types of keys**:

1. **Anon Key** (Client-side)
   - Safe to expose in browser
   - RLS enforced automatically
   - Used for: Auth, user data queries
   - Environment variable: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Service Role Key** (Server-side ONLY)
   - **NEVER expose to client**
   - Bypasses RLS (full database access)
   - Used for: Admin operations, Stripe webhooks, purchase creation
   - Environment variable: `SUPABASE_SERVICE_ROLE_KEY`

### When to Use Service Role

**Use service role for**:
- Creating/updating purchase records (Stripe webhooks)
- Validating export pass status (server-side API)
- Admin operations (template management)
- Data migration/cleanup scripts

**Never use service role for**:
- Client-side queries
- User-initiated CRUD operations
- Public API endpoints

### Backend Integration Examples

**Creating a Supabase client (Next.js)**:

```typescript
// Client-side (with RLS)
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```typescript
// Server-side (with RLS - for user operations)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

```typescript
// Server-side admin (bypasses RLS - use sparingly)
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

---

## PII Protection

### What is PII in This System?

**Personal Identifiable Information (PII)**:
- User name (from resume data)
- Email address
- Phone number
- Home address/city
- LinkedIn/GitHub URLs
- Any content from `resumes.data` JSONB field

### PII Logging Rules

**NEVER log the following**:
- Raw resume content (`resumes.data` JSONB)
- Personal information fields (name, email, phone) from resume data
- Full email addresses (except in purchase records)
- Stripe customer details beyond IDs

**What you CAN log**:
- Resume ID (UUID)
- User ID (UUID)
- Template ID (UUID)
- Purchase ID (UUID)
- Export ID (UUID)
- Stripe Checkout Session ID
- Error codes and sanitized error messages
- Timestamps

### Logging Examples

**Bad (PII exposure)**:
```typescript
// DO NOT DO THIS
console.error('Failed to save resume:', resumeData)
logger.error('Export failed', { email: user.email, name: resumeData.personal.name })
Sentry.captureException(error, { extra: { resume: resumeData } })
```

**Good (PII protected)**:
```typescript
// DO THIS INSTEAD
console.error('Failed to save resume:', { resumeId, userId })
logger.error('Export failed', { userId, exportId, templateId })
Sentry.captureException(error, {
  extra: {
    resumeId,
    userId,
    errorCode: 'EXPORT_FAILED'
  }
})
```

### Error Messages

**Client-facing errors should be generic**:

```typescript
// Bad - exposes internal details
throw new Error(`Failed to save resume for user ${userId} with email ${email}`)

// Good - generic message
throw new Error('Failed to save resume. Please try again.')
```

**Server-side errors can be more detailed (but still no PII)**:

```typescript
// Bad - includes PII
logger.error(`Resume save failed: ${resumeData}`)

// Good - contextual without PII
logger.error('Resume save failed', {
  resumeId,
  userId,
  errorCode: 'DB_WRITE_ERROR',
  timestamp: Date.now()
})
```

---

## Sentry Configuration

**Exclude PII fields from Sentry reports**:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  beforeSend(event, hint) {
    // Remove PII from event context
    if (event.extra) {
      delete event.extra.resume
      delete event.extra.resumeData
      delete event.extra.personalInfo
      delete event.extra.email
      delete event.extra.phone
    }

    // Remove PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          delete breadcrumb.data.resume
          delete breadcrumb.data.email
          delete breadcrumb.data.name
        }
        return breadcrumb
      })
    }

    return event
  }
})
```

---

## Data Storage Security

### Guest Users

**CRITICAL: Guest resumes are NEVER stored server-side**

- All guest data lives in browser LocalStorage
- No database records for guest resumes
- Guest exports: Track metadata only (if user upgrades to account)

**Implementation**:
```typescript
// Guest resume storage (client-side only)
function saveGuestResume(resumeData: ResumeData) {
  localStorage.setItem('guest_resume', JSON.stringify(resumeData))
  // DO NOT send to server
}

// Guest export (no database record)
async function exportGuestResume(resumeData: ResumeData, templateId: string) {
  // Send to PDF renderer directly
  // No database INSERT for exports table
  const pdf = await renderPDF({ data: resumeData, templateId, watermark: true })
  return pdf
}
```

### Logged-in Users

**Resume storage**:
- Store in `resumes` table with RLS enforcement
- Autosave with debouncing (2-5 seconds)
- Track versions in `resume_versions` table

**Export tracking**:
- Record in `exports` table (RLS enforced)
- Optional: Store PDF in Supabase Storage with signed URLs
- Storage path is nullable (metadata-only tracking is valid)

### PDF Storage (Optional)

**If storing PDFs in Supabase Storage**:

1. **Use signed URLs with short expiry**:
   ```typescript
   const { data } = await supabase.storage
     .from('exports')
     .createSignedUrl(storagePath, 3600) // 1 hour expiry
   ```

2. **Storage bucket configuration**:
   - Bucket: `exports` (private)
   - RLS enabled on storage bucket
   - User can only access their own files

3. **File naming convention**:
   ```
   exports/{user_id}/{export_id}.pdf
   ```

4. **Cleanup policy**:
   - Auto-delete PDFs after 30 days (optional)
   - User can delete manually via "Downloads" page

---

## Guest Purchase Handling

### Guest Purchase Flow

1. Guest clicks "Buy Export Pass"
2. Stripe Checkout with email collection
3. Webhook creates purchase record:
   - `user_id = NULL`
   - `email = customer_email`
   - `status = 'paid'`
   - `pass_start_at = now()`
   - `pass_end_at = now() + 24 hours`

4. Guest can export without watermark for 24 hours
5. Post-purchase: Show "Create account to save resumes" CTA

### Guest-to-User Conversion

**When guest signs up with same email**:

```sql
-- Link guest purchases to new user account (server-side)
UPDATE purchases
SET user_id = 'new-user-uuid'
WHERE email = 'user@example.com' AND user_id IS NULL;
```

### Security Considerations

**Guest purchase validation**:
- Always validate pass window server-side
- Never trust client-side claims
- Use `has_active_export_pass(NULL, email)` function

**Example server-side check**:
```typescript
async function validateExportPass(email: string): Promise<boolean> {
  const { data } = await supabaseAdmin.rpc('has_active_export_pass', {
    check_user_id: null,
    check_email: email
  })
  return data === true
}
```

---

## Data Deletion ("Delete My Data")

### User Data Deletion Flow

**When user requests data deletion**:

1. Delete from `resumes` (CASCADE deletes `resume_versions`)
2. Delete from `exports`
3. Delete PDFs from Supabase Storage (if applicable)
4. **DO NOT delete** `purchases` (retain for accounting)

**Implementation**:
```typescript
async function deleteUserData(userId: string) {
  const supabase = createClient()

  // Delete resumes (CASCADE deletes resume_versions)
  await supabase.from('resumes').delete().eq('user_id', userId)

  // Delete exports (and PDFs from storage)
  const { data: exports } = await supabase
    .from('exports')
    .select('storage_path')
    .eq('user_id', userId)

  for (const exp of exports || []) {
    if (exp.storage_path) {
      await supabase.storage.from('exports').remove([exp.storage_path])
    }
  }

  await supabase.from('exports').delete().eq('user_id', userId)

  // Note: purchases are retained for accounting/compliance
}
```

### Purchase Data Retention

**Purchases must be retained for**:
- Accounting/financial compliance: 30-90 days minimum
- Dispute resolution: 90 days
- Tax purposes: Up to 7 years (jurisdiction-dependent)

**After retention period**:
- Archive to cold storage
- Anonymize email (hash or redact)
- Keep only: purchase_id, amount, timestamp, status

---

## Common RLS Violation Errors

### Error: "new row violates row-level security policy"

**Cause**: Trying to INSERT/UPDATE with wrong user_id

**Fix**:
```typescript
// Bad - trying to insert with different user_id
await supabase.from('resumes').insert({
  user_id: 'other-user-id', // RLS violation
  title: 'My Resume',
  data: {}
})

// Good - use authenticated user's ID
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('resumes').insert({
  user_id: user.id, // Matches auth.uid()
  title: 'My Resume',
  data: {}
})
```

### Error: "permission denied for table purchases"

**Cause**: Client trying to INSERT/UPDATE purchases table

**Fix**: Use service role on server-side only
```typescript
// Bad - client trying to insert purchase
await supabase.from('purchases').insert({ ... }) // RLS denies

// Good - server-side with service role
await supabaseAdmin.from('purchases').insert({ ... })
```

---

## Rate Limiting & Abuse Prevention

### API Endpoints to Protect

1. **Export endpoint** (`/api/export/create`)
   - Rate limit: 10 exports per hour per IP (free tier)
   - Rate limit: 100 exports per hour per IP (paid pass)

2. **Purchase endpoint** (`/api/checkout/create`)
   - Rate limit: 5 checkout sessions per hour per IP

3. **Resume save endpoint**
   - Rate limit: 100 saves per hour per user

### Implementation (Next.js middleware)

```typescript
import { ratelimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'

  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  // Continue with request
}
```

---

## Security Checklist

Before deploying to production:

- [ ] All tables have RLS enabled
- [ ] RLS policies tested with different user contexts
- [ ] Service role key is server-side only (not in client code)
- [ ] PII fields excluded from logs (console, Sentry, analytics)
- [ ] Error messages are generic (no PII exposure)
- [ ] Guest resumes never stored server-side
- [ ] Purchases INSERT/UPDATE via service role only
- [ ] Export pass validation is server-side
- [ ] PDF signed URLs have short expiry (if storing PDFs)
- [ ] "Delete my data" flow implemented
- [ ] Rate limiting configured for critical endpoints
- [ ] Database backups enabled (Supabase automatic)
- [ ] Webhook endpoints have signature verification

---

## Backend Integration Patterns

### Creating a Resume (Logged-in User)

```typescript
import { createClient } from '@/lib/supabase/server'

export async function createResume(title: string, data: ResumeData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id, // RLS enforces this matches auth.uid()
      title,
      country: 'UK',
      data
    })
    .select()
    .single()

  if (error) {
    // Log error without PII
    console.error('Resume creation failed', { userId: user.id, errorCode: error.code })
    throw new Error('Failed to create resume')
  }

  return data
}
```

### Validating Export Pass (Server-side)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function hasActiveExportPass(
  userId?: string,
  email?: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('has_active_export_pass', {
    check_user_id: userId || null,
    check_email: email || null
  })

  if (error) {
    console.error('Export pass check failed', { userId, errorCode: error.code })
    return false
  }

  return data === true
}
```

### Handling Stripe Webhook (Create Purchase)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const email = session.customer_email!
  const userId = session.metadata?.user_id || null

  const passStart = new Date()
  const passEnd = new Date(passStart.getTime() + 24 * 60 * 60 * 1000) // 24 hours

  const { error } = await supabaseAdmin.from('purchases').insert({
    user_id: userId,
    email,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    status: 'paid',
    pass_start_at: passStart.toISOString(),
    pass_end_at: passEnd.toISOString()
  })

  if (error) {
    // Log error without PII
    console.error('Purchase creation failed', {
      sessionId: session.id,
      errorCode: error.code
    })
    throw error
  }
}
```

---

## Support & Questions

For security-related questions or concerns:
1. Review this document first
2. Check RLS policies in `supabase/policies/`
3. Test with different user contexts
4. Consult Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security

**When in doubt**: Restrict access and consult with security team.

---

**Last Updated**: 2026-02-09

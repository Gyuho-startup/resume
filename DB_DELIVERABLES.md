# DB/Security Agent - Phase 0 Deliverables

**Date**: 2026-02-09
**Agent**: DB/Security
**Status**: COMPLETE

---

## Overview

Complete database schema, migrations, RLS policies, and security documentation for the UK Resume Builder MVP.

**Key Features**:
- Guest users: NO server-side storage (LocalStorage only)
- Logged-in users: Full resume saving with version history
- Guest purchases: Export Pass via email (no account required)
- Row Level Security (RLS) enforced on all user-owned tables
- PII protection guidelines and logging rules

---

## Deliverables

### 1. Supabase Migrations

Located in: `/Users/gyuho/Coding/08_Resume_Generator/supabase/migrations/`

| File | Description |
|------|-------------|
| `20260209000001_initial_schema.sql` | Core tables: templates, resumes, resume_versions, exports, purchases. Includes indexes, constraints, triggers, and comments. |
| `20260209000002_enable_rls.sql` | Enable RLS on all tables and apply security policies. |
| `20260209000003_helper_functions.sql` | Utility functions for export pass validation, version snapshots, and cleanup. |

**Apply migrations**:
```bash
cd /Users/gyuho/Coding/08_Resume_Generator
supabase db push

# Or manually:
psql $SUPABASE_DB_URL -f supabase/migrations/20260209000001_initial_schema.sql
psql $SUPABASE_DB_URL -f supabase/migrations/20260209000002_enable_rls.sql
psql $SUPABASE_DB_URL -f supabase/migrations/20260209000003_helper_functions.sql
```

### 2. RLS Policies (Reference Documentation)

Located in: `/Users/gyuho/Coding/08_Resume_Generator/supabase/policies/`

| File | Description |
|------|-------------|
| `templates_policies.sql` | Public read access for templates |
| `resumes_policies.sql` | User-owned CRUD policies |
| `resume_versions_policies.sql` | User-owned version history policies |
| `exports_policies.sql` | User-owned export history policies |
| `purchases_policies.sql` | Read-only for users, server-side INSERT/UPDATE |

**Note**: Policies are already applied in migration `20260209000002_enable_rls.sql`. These files are for reference only.

### 3. Seed Data

Located in: `/Users/gyuho/Coding/08_Resume_Generator/seeds/`

| File | Description |
|------|-------------|
| `templates.sql` | 5 ATS-friendly resume templates with UUIDs |

**Seed templates**:
```bash
psql $SUPABASE_DB_URL -f seeds/templates.sql
```

### 4. Documentation

Located in: `/Users/gyuho/Coding/08_Resume_Generator/docs/`

| File | Description |
|------|-------------|
| `db-schema.md` | Complete schema reference with tables, indexes, relationships, common queries |
| `security-notes.md` | PII handling rules, RLS testing, access control patterns, Sentry config |
| `db-integration.md` | Backend integration examples with Next.js server actions and API routes |

Located in: `/Users/gyuho/Coding/08_Resume_Generator/supabase/`

| File | Description |
|------|-------------|
| `README.md` | Quick start guide, migration instructions, troubleshooting, maintenance |

---

## Database Schema Summary

### Tables

1. **templates** (public read)
   - 5 ATS-friendly resume templates
   - Seeded with UUIDs for consistency
   - No authentication required to view

2. **resumes** (user-owned, RLS enforced)
   - Logged-in users only (user_id NOT NULL)
   - JSONB data field for full resume content
   - Cascade delete to resume_versions

3. **resume_versions** (user-owned, RLS enforced)
   - Version history snapshots
   - Cascade delete with parent resume
   - Helper function: `create_resume_version_snapshot()`

4. **exports** (user-owned, RLS enforced)
   - Export history for logged-in users
   - Tracks watermark status and source
   - Optional PDF storage path (Supabase Storage)

5. **purchases** (user-owned read, server-side write)
   - Supports guest purchases (user_id NULLABLE)
   - 24-hour Export Pass window
   - Stripe Checkout Session ID tracking
   - RLS: Users can read own, server-side INSERT/UPDATE only

### Helper Functions

1. `has_active_export_pass(user_id, email)` → BOOLEAN
   - Check if user/guest has active 24-hour pass

2. `get_active_export_pass(user_id, email)` → TABLE
   - Get pass details with remaining time in seconds

3. `create_resume_version_snapshot(resume_id, user_id)` → UUID
   - Create version snapshot, returns version ID

4. `cleanup_old_resume_versions(resume_id, keep_count)` → INTEGER
   - Delete old versions, keep last N, returns deleted count

---

## Security Features

### Row Level Security (RLS)

**All tables have RLS enabled**:

| Table | Policy |
|-------|--------|
| templates | Public SELECT |
| resumes | User can SELECT/INSERT/UPDATE/DELETE own |
| resume_versions | User can SELECT/INSERT/DELETE own |
| exports | User can SELECT/INSERT/DELETE own |
| purchases | User can SELECT own (no INSERT/UPDATE/DELETE) |

**Key enforcement**:
- Policy check: `auth.uid() = user_id`
- Guest data NEVER stored server-side
- Purchases managed via service role only

### PII Protection

**NEVER log**:
- Resume content (`resumes.data` JSONB)
- Personal information (name, email, phone) from resume data
- Full email addresses (except in purchase records)
- Stripe customer details beyond IDs

**What you CAN log**:
- UUIDs (resume_id, user_id, template_id, etc.)
- Error codes and timestamps
- Stripe session IDs

**Sentry configuration**: Exclude PII fields from error reports (see `security-notes.md`)

### Access Control

**Two Supabase keys**:

1. **Anon Key** (client-side, RLS enforced)
   - Environment variable: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Used for: Auth, user data queries

2. **Service Role Key** (server-side only, bypasses RLS)
   - Environment variable: `SUPABASE_SERVICE_ROLE_KEY`
   - Used for: Purchases, webhooks, admin operations

### Data Deletion

**User-controlled**:
- Resumes (CASCADE deletes versions)
- Resume versions
- Exports (and PDFs from storage)

**Retained for compliance**:
- Purchases (30-90 days minimum for accounting)

---

## Integration Examples

### Create Resume (Logged-in User)

```typescript
import { createClient } from '@/lib/supabase/server'

export async function createResume(title: string, data: ResumeData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: resume } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id, // RLS enforces
      title,
      data
    })
    .select()
    .single()

  return resume
}
```

### Check Active Export Pass (Server-side)

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function hasActivePass(userId?: string, email?: string) {
  const { data } = await supabaseAdmin.rpc('has_active_export_pass', {
    check_user_id: userId || null,
    check_email: email || null
  })
  return data === true
}
```

### Handle Stripe Webhook (Create Purchase)

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const passStart = new Date()
  const passEnd = new Date(passStart.getTime() + 24 * 60 * 60 * 1000)

  await supabaseAdmin.from('purchases').insert({
    user_id: session.metadata?.user_id || null,
    email: session.customer_email!,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    status: 'paid',
    pass_start_at: passStart.toISOString(),
    pass_end_at: passEnd.toISOString()
  })
}
```

See `docs/db-integration.md` for complete examples.

---

## Testing Checklist

- [ ] Migrations apply cleanly in Supabase
- [ ] RLS policies block unauthorized access
- [ ] Templates are publicly readable (no auth)
- [ ] Users can only see their own resumes
- [ ] Users cannot INSERT into purchases table (client-side)
- [ ] Helper functions work correctly
- [ ] Export pass validation returns correct results
- [ ] Version snapshots create properly
- [ ] Cleanup function deletes old versions

### Test RLS (SQL Editor)

```sql
-- Test as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "test-user-uuid"}';

SELECT * FROM resumes; -- Should be empty for new user
SELECT * FROM templates; -- Should return all templates

RESET ROLE;
```

---

## Next Steps for Other Agents

### Frontend Agent
- Use client-side Supabase client with anon key
- Implement LocalStorage for guest resumes
- Show export history page (read from `exports` table)
- Implement "Delete my data" button

### Backend Agent
- Set up server-side Supabase clients (anon + service role)
- Implement export pass validation (server-side only)
- Create server actions for CRUD operations
- Handle RLS violation errors gracefully

### Payments Agent
- Use service role for purchase INSERT/UPDATE
- Implement Stripe webhook handler
- Calculate 24-hour pass window
- Link guest purchases to users on sign-up

---

## Environment Variables Required

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Direct DB access
SUPABASE_DB_URL=postgresql://postgres:password@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

---

## File Tree

```
/Users/gyuho/Coding/08_Resume_Generator/
├── docs/
│   ├── db-schema.md           (Complete schema reference)
│   ├── security-notes.md      (PII handling, RLS testing)
│   └── db-integration.md      (Backend examples)
├── seeds/
│   └── templates.sql          (5 ATS-friendly templates)
├── supabase/
│   ├── README.md              (Setup guide)
│   ├── migrations/
│   │   ├── 20260209000001_initial_schema.sql
│   │   ├── 20260209000002_enable_rls.sql
│   │   └── 20260209000003_helper_functions.sql
│   └── policies/              (Reference only)
│       ├── templates_policies.sql
│       ├── resumes_policies.sql
│       ├── resume_versions_policies.sql
│       ├── exports_policies.sql
│       └── purchases_policies.sql
└── DB_DELIVERABLES.md         (This file)
```

---

## Definition of Done

✅ **Migrations**:
- [x] Initial schema with all tables
- [x] Indexes for common queries
- [x] Foreign key constraints
- [x] Triggers for updated_at
- [x] Comments for documentation

✅ **RLS Policies**:
- [x] Enabled on all tables
- [x] Templates: Public read
- [x] User-owned tables: auth.uid() enforcement
- [x] Purchases: Server-side only INSERT/UPDATE

✅ **Helper Functions**:
- [x] Export pass validation
- [x] Version snapshot creation
- [x] Old version cleanup

✅ **Documentation**:
- [x] Complete schema reference
- [x] Security guidelines
- [x] Backend integration examples
- [x] Setup and maintenance guide

✅ **Seed Data**:
- [x] 5 ATS-friendly templates with UUIDs

✅ **Security**:
- [x] PII logging prevention guidelines
- [x] Access control patterns
- [x] Data deletion flow
- [x] Error handling examples

---

## Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Migration files**: `/Users/gyuho/Coding/08_Resume_Generator/supabase/migrations/`
- **Policy reference**: `/Users/gyuho/Coding/08_Resume_Generator/supabase/policies/`
- **Schema docs**: `/Users/gyuho/Coding/08_Resume_Generator/docs/db-schema.md`
- **Security notes**: `/Users/gyuho/Coding/08_Resume_Generator/docs/security-notes.md`
- **Integration guide**: `/Users/gyuho/Coding/08_Resume_Generator/docs/db-integration.md`

---

**Status**: Ready for backend integration and testing.

**Next Agent**: Backend Agent (implement server actions, API routes, and Stripe webhooks)

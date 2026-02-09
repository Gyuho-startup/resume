# Database Schema Diagram

UK Resume Builder MVP - Visual Schema Reference

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE AUTH (External)                            │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │ auth.users   │                                                           │
│  ├──────────────┤                                                           │
│  │ id (UUID)    │◄───────────────────────────────┐                         │
│  │ email        │                                 │                         │
│  │ created_at   │                                 │                         │
│  └──────────────┘                                 │                         │
│                                                    │                         │
└────────────────────────────────────────────────────┼─────────────────────────┘
                                                     │
                                                     │
┌────────────────────────────────────────────────────┼─────────────────────────┐
│                         PUBLIC SCHEMA              │                         │
│                                                    │                         │
│  ┌──────────────────────────────────┐             │                         │
│  │ templates                        │             │                         │
│  ├──────────────────────────────────┤             │                         │
│  │ id (UUID, PK)                    │             │                         │
│  │ name                             │             │                         │
│  │ description                      │             │                         │
│  │ is_ats_safe (BOOLEAN)            │             │                         │
│  │ version                          │             │                         │
│  │ created_at                       │             │                         │
│  │ updated_at                       │             │                         │
│  └──────────────────────────────────┘             │                         │
│         ▲                                          │                         │
│         │                                          │                         │
│         │ FK (template_id)                         │                         │
│         │                                          │                         │
│  ┌──────┴───────────────────────────┐             │                         │
│  │ exports                          │             │                         │
│  ├──────────────────────────────────┤             │                         │
│  │ id (UUID, PK)                    │             │                         │
│  │ user_id (UUID, FK) ──────────────┼─────────────┘                         │
│  │ resume_id (UUID, FK, NULLABLE) ──┼────┐                                  │
│  │ template_id (UUID, FK)           │    │                                  │
│  │ watermark (BOOLEAN)              │    │                                  │
│  │ source ('guest' | 'user')        │    │                                  │
│  │ storage_path (TEXT, NULLABLE)    │    │                                  │
│  │ created_at                       │    │                                  │
│  └──────────────────────────────────┘    │                                  │
│                                           │                                  │
│                                           │                                  │
│  ┌───────────────────────────────────────┼──────────────────┐               │
│  │ resumes                                ▼                  │               │
│  ├───────────────────────────────────────────────────────────┤               │
│  │ id (UUID, PK)                                             │               │
│  │ user_id (UUID, FK, NOT NULL) ─────────────────────────────┼───────────────┘
│  │ title (TEXT)                                              │
│  │ role_slug (TEXT, NULLABLE)                                │
│  │ country (TEXT, DEFAULT 'UK')                              │
│  │ data (JSONB)                                              │
│  │ created_at                                                │
│  │ updated_at (auto-updated via trigger)                     │
│  └───────────────────────────────────────────────────────────┘
│         │
│         │ FK (resume_id)
│         │ CASCADE DELETE
│         │
│         ▼
│  ┌──────────────────────────────────┐
│  │ resume_versions                  │
│  ├──────────────────────────────────┤
│  │ id (UUID, PK)                    │
│  │ resume_id (UUID, FK)             │
│  │ user_id (UUID, FK, NOT NULL) ────┼───────────────────────────────────────┘
│  │ data (JSONB)                     │
│  │ created_at                       │
│  └──────────────────────────────────┘
│
│
│  ┌──────────────────────────────────┐
│  │ purchases                        │
│  ├──────────────────────────────────┤
│  │ id (UUID, PK)                    │
│  │ user_id (UUID, FK, NULLABLE) ────┼───────────────────────────────────────┘
│  │ email (TEXT, NOT NULL)           │    (NULL for guest purchases)
│  │ stripe_checkout_session_id (UNIQUE) │
│  │ stripe_payment_intent_id         │
│  │ status ('paid' | 'failed' | 'refunded') │
│  │ pass_start_at (TIMESTAMPTZ)      │
│  │ pass_end_at (TIMESTAMPTZ)        │    (24-hour window)
│  │ created_at                       │
│  │ updated_at (auto-updated)        │
│  └──────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Relationships

### User → Resumes (1:N)
- One user can have many resumes
- `resumes.user_id` → `auth.users.id`
- NOT NULL (only logged-in users can save)
- CASCADE DELETE (delete user = delete all resumes)

### Resume → Resume Versions (1:N)
- One resume can have many versions
- `resume_versions.resume_id` → `resumes.id`
- CASCADE DELETE (delete resume = delete all versions)
- Both tables reference same `user_id` for consistency

### User → Exports (1:N)
- One user can have many exports
- `exports.user_id` → `auth.users.id`
- NOT NULL (only logged-in users track exports)
- CASCADE DELETE (delete user = delete export history)

### Export → Resume (N:1, Optional)
- Export can reference a saved resume
- `exports.resume_id` → `resumes.id`
- NULLABLE (guest exports or ad-hoc exports)
- SET NULL ON DELETE (resume deleted, export record remains)

### Export → Template (N:1)
- Export must reference a template
- `exports.template_id` → `templates.id`
- NOT NULL (every export uses a template)
- CASCADE DELETE (delete template = delete exports using it)

### User → Purchases (1:N, Optional)
- One user can have many purchases
- `purchases.user_id` → `auth.users.id`
- NULLABLE (supports guest purchases)
- SET NULL ON DELETE (user deleted, purchase record remains for accounting)

---

## Data Flow Diagrams

### Guest User Flow

```
┌──────────────┐
│   Browser    │
│ LocalStorage │  ← Guest resume data (NEVER sent to server)
└──────────────┘
       │
       │ Export (with email)
       ▼
┌──────────────┐
│  PDF Render  │  ← Temporary, no storage
└──────────────┘
       │
       │ Purchase Export Pass (optional)
       ▼
┌──────────────┐
│  purchases   │  ← user_id = NULL, email stored
│  (database)  │
└──────────────┘
```

### Logged-in User Flow

```
┌──────────────┐
│   Browser    │
└──────────────┘
       │ Autosave
       ▼
┌──────────────┐
│   resumes    │  ← Full JSONB storage
│  (database)  │
└──────────────┘
       │
       │ Version snapshot (on demand)
       ▼
┌──────────────┐
│resume_versions│ ← History tracking
│  (database)  │
└──────────────┘


┌──────────────┐
│  Export PDF  │
└──────────────┘
       │
       ▼
┌──────────────┐
│   exports    │  ← Track export history
│  (database)  │
└──────────────┘
       │ (optional)
       ▼
┌──────────────┐
│   Storage    │  ← Supabase Storage (PDFs)
│   Bucket     │
└──────────────┘
```

### Purchase Flow (Guest → User Conversion)

```
1. GUEST PURCHASE
┌──────────────┐
│  Stripe      │
│  Checkout    │
└──────────────┘
       │
       ▼
┌──────────────┐
│  purchases   │  user_id = NULL
│              │  email = 'guest@example.com'
└──────────────┘

2. GUEST SIGNS UP
┌──────────────┐
│ auth.users   │  email = 'guest@example.com'
│              │  id = 'new-user-uuid'
└──────────────┘

3. LINK PURCHASES (server-side)
UPDATE purchases
SET user_id = 'new-user-uuid'
WHERE email = 'guest@example.com'
  AND user_id IS NULL
```

---

## RLS Policy Visualization

### Templates (Public)

```
┌─────────────────────────────────────────┐
│              templates                  │
│─────────────────────────────────────────│
│  RLS ENABLED                            │
│                                         │
│  Policy: "Templates are publicly        │
│           readable"                     │
│                                         │
│  SELECT: ✓ (anyone, no auth required)  │
│  INSERT: ✗ (service role only)         │
│  UPDATE: ✗ (service role only)         │
│  DELETE: ✗ (service role only)         │
└─────────────────────────────────────────┘
```

### Resumes (User-Owned)

```
┌─────────────────────────────────────────┐
│               resumes                   │
│─────────────────────────────────────────│
│  RLS ENABLED                            │
│                                         │
│  Policy Check: auth.uid() = user_id    │
│                                         │
│  SELECT: ✓ (own only)                  │
│  INSERT: ✓ (with own user_id)          │
│  UPDATE: ✓ (own only)                  │
│  DELETE: ✓ (own only)                  │
│                                         │
│  Other users: ✗ (blocked by RLS)       │
└─────────────────────────────────────────┘
```

### Resume Versions (User-Owned)

```
┌─────────────────────────────────────────┐
│          resume_versions                │
│─────────────────────────────────────────│
│  RLS ENABLED                            │
│                                         │
│  Policy Check: auth.uid() = user_id    │
│                                         │
│  SELECT: ✓ (own only)                  │
│  INSERT: ✓ (with own user_id)          │
│  UPDATE: ✗ (append-only)               │
│  DELETE: ✓ (own only)                  │
└─────────────────────────────────────────┘
```

### Exports (User-Owned)

```
┌─────────────────────────────────────────┐
│               exports                   │
│─────────────────────────────────────────│
│  RLS ENABLED                            │
│                                         │
│  Policy Check: auth.uid() = user_id    │
│                                         │
│  SELECT: ✓ (own only)                  │
│  INSERT: ✓ (with own user_id)          │
│  UPDATE: ✗ (append-only)               │
│  DELETE: ✓ (own only)                  │
└─────────────────────────────────────────┘
```

### Purchases (Read-Only for Users)

```
┌─────────────────────────────────────────┐
│              purchases                  │
│─────────────────────────────────────────│
│  RLS ENABLED                            │
│                                         │
│  Policy Check: auth.uid() = user_id    │
│  (only for SELECT)                      │
│                                         │
│  SELECT: ✓ (own only, if logged in)    │
│  INSERT: ✗ (service role only)         │
│  UPDATE: ✗ (service role only)         │
│  DELETE: ✗ (service role only)         │
│                                         │
│  Guest purchases (user_id = NULL):     │
│    - NOT visible to any client          │
│    - Server-side validation only        │
└─────────────────────────────────────────┘
```

---

## Indexes for Performance

### resumes
- `idx_resumes_user_id` on `(user_id)` - List user's resumes
- `idx_resumes_role_slug` on `(role_slug)` - Filter by role
- `idx_resumes_created_at` on `(created_at DESC)` - Sort by date

### resume_versions
- `idx_resume_versions_resume_id` on `(resume_id)` - Get versions for resume
- `idx_resume_versions_user_id` on `(user_id)` - Get user's versions
- `idx_resume_versions_created_at` on `(created_at DESC)` - Sort by date

### exports
- `idx_exports_user_id` on `(user_id)` - List user's exports
- `idx_exports_resume_id` on `(resume_id)` - Get exports for resume
- `idx_exports_created_at` on `(created_at DESC)` - Sort by date
- `idx_exports_watermark` on `(watermark)` - Filter by watermark status

### purchases
- `idx_purchases_user_id` on `(user_id)` - List user's purchases
- `idx_purchases_email` on `(email)` - Find guest purchases by email
- `idx_purchases_stripe_checkout_session_id` on `(stripe_checkout_session_id)` - Webhook lookup
- `idx_purchases_status` on `(status)` - Filter by status
- `idx_purchases_pass_window` on `(pass_start_at, pass_end_at)` - Active pass queries

### templates
- `idx_templates_is_ats_safe` on `(is_ats_safe)` - Filter ATS-safe templates

---

## Helper Functions Flow

### has_active_export_pass()

```
Input: user_id OR email
         │
         ▼
┌─────────────────────────┐
│ Check purchases table   │
│ WHERE:                  │
│  - user_id = input OR   │
│  - email = input        │
│  - status = 'paid'      │
│  - now() BETWEEN        │
│    pass_start_at AND    │
│    pass_end_at          │
└─────────────────────────┘
         │
         ▼
Output: BOOLEAN (true/false)
```

### get_active_export_pass()

```
Input: user_id OR email
         │
         ▼
┌─────────────────────────┐
│ Find active purchase    │
│ Calculate remaining time│
│ in seconds              │
└─────────────────────────┘
         │
         ▼
Output: TABLE
  - purchase_id
  - pass_start_at
  - pass_end_at
  - remaining_seconds
```

### create_resume_version_snapshot()

```
Input: resume_id, user_id
         │
         ▼
┌─────────────────────────┐
│ 1. Get resume data      │
│ 2. Verify ownership     │
│ 3. Insert into          │
│    resume_versions      │
└─────────────────────────┘
         │
         ▼
Output: version_id (UUID)
```

### cleanup_old_resume_versions()

```
Input: resume_id, keep_count (default 10)
         │
         ▼
┌─────────────────────────┐
│ 1. Find last N versions │
│ 2. DELETE older versions│
│ 3. Return deleted count │
└─────────────────────────┘
         │
         ▼
Output: INTEGER (deleted count)
```

---

## Common Query Patterns

### Get user's resumes with version counts

```sql
SELECT
  r.id,
  r.title,
  r.updated_at,
  COUNT(rv.id) as version_count
FROM resumes r
LEFT JOIN resume_versions rv ON rv.resume_id = r.id
WHERE r.user_id = auth.uid()
GROUP BY r.id
ORDER BY r.updated_at DESC;
```

### Get export history with details

```sql
SELECT
  e.id,
  e.watermark,
  e.created_at,
  t.name as template_name,
  r.title as resume_title
FROM exports e
JOIN templates t ON t.id = e.template_id
LEFT JOIN resumes r ON r.id = e.resume_id
WHERE e.user_id = auth.uid()
ORDER BY e.created_at DESC;
```

### Find active export pass for user

```sql
SELECT
  id,
  pass_start_at,
  pass_end_at,
  EXTRACT(EPOCH FROM (pass_end_at - now())) as remaining_seconds
FROM purchases
WHERE user_id = auth.uid()
  AND status = 'paid'
  AND now() BETWEEN pass_start_at AND pass_end_at
ORDER BY pass_end_at DESC
LIMIT 1;
```

### Find guest purchase by email (server-side only)

```sql
SELECT *
FROM purchases
WHERE email = 'guest@example.com'
  AND user_id IS NULL
  AND status = 'paid'
  AND now() BETWEEN pass_start_at AND pass_end_at;
```

---

## Storage Bucket Structure (Optional)

If storing PDFs in Supabase Storage:

```
exports/ (bucket)
├── {user_id_1}/
│   ├── {export_id_1}.pdf
│   ├── {export_id_2}.pdf
│   └── {export_id_3}.pdf
├── {user_id_2}/
│   ├── {export_id_4}.pdf
│   └── {export_id_5}.pdf
└── ...

RLS on Storage Bucket:
- User can only access files in their own folder
- Signed URLs with 1-hour expiry
- Auto-delete after 30 days (optional)
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                  │
│  - Input validation                                 │
│  - Rate limiting                                    │
│  - Error handling (no PII in errors)                │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  SUPABASE AUTH                      │
│  - JWT token validation                             │
│  - Session management                               │
│  - Magic link / OAuth                               │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              ROW LEVEL SECURITY (RLS)               │
│  - User can only access own data                    │
│  - Templates are public                             │
│  - Purchases server-side only                       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                 DATABASE LAYER                      │
│  - Foreign key constraints                          │
│  - NOT NULL constraints                             │
│  - CHECK constraints (enum values)                  │
│  - Indexes for performance                          │
└─────────────────────────────────────────────────────┘
```

---

**See also**:
- [db-schema.md](./db-schema.md) - Detailed table definitions
- [security-notes.md](./security-notes.md) - Security guidelines
- [db-integration.md](./db-integration.md) - Backend examples

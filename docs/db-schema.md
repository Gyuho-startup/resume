# Database Schema Documentation

UK Resume Builder MVP - Supabase PostgreSQL Schema

## Overview

The database schema supports:
- **Guest users**: No server-side storage (LocalStorage only)
- **Logged-in users**: Full resume saving, version history, and export tracking
- **Guest purchases**: Export Pass purchases via email (no account required)
- **Security**: Row Level Security (RLS) on all tables

---

## Tables

### 1. templates

**Purpose**: Store ATS-friendly resume templates (publicly readable)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique template identifier |
| name | TEXT | NOT NULL | Template display name |
| description | TEXT | - | Template description |
| is_ats_safe | BOOLEAN | NOT NULL, DEFAULT true | ATS compatibility flag |
| version | TEXT | NOT NULL, DEFAULT '1.0' | Template version |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes**:
- `idx_templates_is_ats_safe` on `(is_ats_safe)`

**RLS Policies**:
- Public SELECT access (no authentication required)
- INSERT/UPDATE/DELETE via service role only

**Notes**:
- Templates are seeded during initial deployment
- Use service role key for template management

---

### 2. resumes

**Purpose**: Store user-owned resumes (logged-in users only)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique resume identifier |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Resume owner (CASCADE DELETE) |
| title | TEXT | NOT NULL | User-defined resume title |
| role_slug | TEXT | - | Target role slug (for analytics) |
| country | TEXT | NOT NULL, DEFAULT 'UK' | Target country |
| data | JSONB | NOT NULL, DEFAULT '{}' | Full resume content (personal, education, experience, projects, skills) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp (auto-updated) |

**Indexes**:
- `idx_resumes_user_id` on `(user_id)`
- `idx_resumes_role_slug` on `(role_slug)`
- `idx_resumes_created_at` on `(created_at DESC)`

**RLS Policies**:
- Users can SELECT/INSERT/UPDATE/DELETE their own resumes only
- Policy enforces: `auth.uid() = user_id`

**Triggers**:
- `update_resumes_updated_at`: Auto-updates `updated_at` on UPDATE

**Notes**:
- Guest resumes are NEVER stored in this table
- `data` JSONB structure should match the builder schema
- Consider creating a version snapshot before major updates

---

### 3. resume_versions

**Purpose**: Version history for resumes (logged-in users only)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique version identifier |
| resume_id | UUID | NOT NULL, FK → resumes(id) | Parent resume (CASCADE DELETE) |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Version owner (CASCADE DELETE) |
| data | JSONB | NOT NULL, DEFAULT '{}' | Resume snapshot at this version |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Version creation timestamp |

**Indexes**:
- `idx_resume_versions_resume_id` on `(resume_id)`
- `idx_resume_versions_user_id` on `(user_id)`
- `idx_resume_versions_created_at` on `(created_at DESC)`

**RLS Policies**:
- Users can SELECT/INSERT/DELETE their own versions only
- No UPDATE policy (versions are append-only)

**Helper Functions**:
- `create_resume_version_snapshot(resume_id, user_id)`: Create version snapshot
- `cleanup_old_resume_versions(resume_id, keep_count)`: Cleanup old versions

**Notes**:
- Automatically deleted when parent resume is deleted (CASCADE)
- Consider periodic cleanup to avoid excessive storage

---

### 4. exports

**Purpose**: Export history for logged-in users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique export identifier |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Export owner (CASCADE DELETE) |
| resume_id | UUID | FK → resumes(id) | Source resume (SET NULL on delete) |
| template_id | UUID | NOT NULL, FK → templates(id) | Template used (CASCADE DELETE) |
| watermark | BOOLEAN | NOT NULL, DEFAULT true | Watermark applied flag |
| source | TEXT | NOT NULL, CHECK IN ('guest', 'user') | Export source type |
| storage_path | TEXT | - | Optional Supabase Storage path |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Export timestamp |

**Indexes**:
- `idx_exports_user_id` on `(user_id)`
- `idx_exports_resume_id` on `(resume_id)`
- `idx_exports_created_at` on `(created_at DESC)`
- `idx_exports_watermark` on `(watermark)`

**RLS Policies**:
- Users can SELECT/INSERT/DELETE their own exports only
- No UPDATE policy (exports are append-only)

**Notes**:
- `source = 'guest'`: Export from guest session (converted to logged-in)
- `source = 'user'`: Export from logged-in session
- `storage_path`: Optional PDF storage in Supabase Storage (use signed URLs)
- Guest exports are NOT tracked in this table

---

### 5. purchases

**Purpose**: Export Pass purchases (supports guest and logged-in users)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique purchase identifier |
| user_id | UUID | NULLABLE, FK → auth.users(id) | Purchase owner (SET NULL on delete) |
| email | TEXT | NOT NULL | Purchaser email (for guest + logged-in) |
| stripe_checkout_session_id | TEXT | UNIQUE, NOT NULL | Stripe Checkout Session ID |
| stripe_payment_intent_id | TEXT | - | Stripe Payment Intent ID |
| status | TEXT | NOT NULL, CHECK IN ('paid', 'failed', 'refunded') | Purchase status |
| pass_start_at | TIMESTAMPTZ | - | 24-hour pass start (UTC) |
| pass_end_at | TIMESTAMPTZ | - | 24-hour pass end (UTC) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Purchase creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp (auto-updated) |

**Indexes**:
- `idx_purchases_user_id` on `(user_id)`
- `idx_purchases_email` on `(email)`
- `idx_purchases_stripe_checkout_session_id` on `(stripe_checkout_session_id)`
- `idx_purchases_status` on `(status)`
- `idx_purchases_pass_window` on `(pass_start_at, pass_end_at)`

**RLS Policies**:
- Users can SELECT their own purchases only
- No INSERT/UPDATE/DELETE policies (server-side only via service role)

**Triggers**:
- `update_purchases_updated_at`: Auto-updates `updated_at` on UPDATE

**Helper Functions**:
- `has_active_export_pass(user_id, email)`: Check if pass is active
- `get_active_export_pass(user_id, email)`: Get active pass details

**Notes**:
- **Guest purchases**: `user_id = NULL`, identified by `email` only
- **Logged-in purchases**: `user_id` populated, `email` also stored
- Pass window: Exactly 24 hours from `pass_start_at` to `pass_end_at`
- Status updates handled via Stripe webhooks (server-side only)
- Retention: Keep purchase records for accounting/compliance (30-90 days minimum)

---

## Helper Functions

### has_active_export_pass(check_user_id UUID, check_email TEXT)

Check if a user or guest has an active 24-hour export pass.

**Parameters**:
- `check_user_id`: User UUID (for logged-in users)
- `check_email`: Email address (for guest users)

**Returns**: `BOOLEAN`

**Usage**:
```sql
-- Check logged-in user
SELECT has_active_export_pass('user-uuid-here', NULL);

-- Check guest user by email
SELECT has_active_export_pass(NULL, 'guest@example.com');
```

---

### get_active_export_pass(check_user_id UUID, check_email TEXT)

Get details of the active export pass including remaining time.

**Parameters**:
- `check_user_id`: User UUID (for logged-in users)
- `check_email`: Email address (for guest users)

**Returns**: TABLE with columns:
- `purchase_id`: UUID
- `pass_start_at`: TIMESTAMPTZ
- `pass_end_at`: TIMESTAMPTZ
- `remaining_seconds`: INTEGER

**Usage**:
```sql
-- Get active pass for logged-in user
SELECT * FROM get_active_export_pass('user-uuid-here', NULL);

-- Get active pass for guest user
SELECT * FROM get_active_export_pass(NULL, 'guest@example.com');
```

---

### create_resume_version_snapshot(p_resume_id UUID, p_user_id UUID)

Create a version snapshot of a resume.

**Parameters**:
- `p_resume_id`: Resume UUID
- `p_user_id`: User UUID (for authorization)

**Returns**: UUID (version ID)

**Usage**:
```sql
SELECT create_resume_version_snapshot('resume-uuid', 'user-uuid');
```

---

### cleanup_old_resume_versions(p_resume_id UUID, p_keep_count INTEGER)

Delete old resume versions, keeping only the most recent N versions.

**Parameters**:
- `p_resume_id`: Resume UUID
- `p_keep_count`: Number of versions to keep (default: 10)

**Returns**: INTEGER (number of versions deleted)

**Usage**:
```sql
-- Keep last 10 versions, delete older ones
SELECT cleanup_old_resume_versions('resume-uuid', 10);
```

---

## Data Relationships

```
auth.users (Supabase Auth)
    ↓ (1:N)
resumes
    ↓ (1:N)
resume_versions

auth.users
    ↓ (1:N)
exports
    ← (N:1) templates
    ← (N:1) resumes (optional)

auth.users (nullable)
    ↓ (1:N)
purchases
```

---

## Common Queries

### Get user's resumes (with latest version count)

```sql
SELECT
  r.id,
  r.title,
  r.role_slug,
  r.updated_at,
  COUNT(rv.id) as version_count
FROM resumes r
LEFT JOIN resume_versions rv ON rv.resume_id = r.id
WHERE r.user_id = auth.uid()
GROUP BY r.id
ORDER BY r.updated_at DESC;
```

### Get user's export history

```sql
SELECT
  e.id,
  e.watermark,
  e.source,
  e.created_at,
  t.name as template_name,
  r.title as resume_title
FROM exports e
JOIN templates t ON t.id = e.template_id
LEFT JOIN resumes r ON r.id = e.resume_id
WHERE e.user_id = auth.uid()
ORDER BY e.created_at DESC
LIMIT 50;
```

### Check if user has active export pass

```sql
SELECT
  id,
  pass_start_at,
  pass_end_at,
  EXTRACT(EPOCH FROM (pass_end_at - now())) / 3600 as hours_remaining
FROM purchases
WHERE user_id = auth.uid()
  AND status = 'paid'
  AND now() BETWEEN pass_start_at AND pass_end_at
ORDER BY pass_end_at DESC
LIMIT 1;
```

### Get purchase by Stripe session ID (server-side)

```sql
SELECT * FROM purchases
WHERE stripe_checkout_session_id = 'cs_test_abc123';
```

---

## Migration Files

1. `20260209000001_initial_schema.sql`: Core tables and indexes
2. `20260209000002_enable_rls.sql`: Enable RLS and apply policies
3. `20260209000003_helper_functions.sql`: Utility functions

---

## Security Notes

See [security-notes.md](./security-notes.md) for detailed security guidelines.

**Key Security Rules**:
- All user-owned tables enforce RLS
- Guest resumes NEVER stored server-side
- Purchases INSERT/UPDATE via service role only
- No PII in application logs
- Signed URLs for stored PDFs (short expiry)

---

## Data Retention

- **resumes**: User-controlled (delete my data)
- **resume_versions**: User-controlled (delete my data)
- **exports**: User-controlled (delete my data)
- **purchases**: Retain for 30-90 days minimum (accounting/compliance)
- **templates**: Permanent

---

## Next Steps

1. Run migrations in Supabase
2. Seed templates table
3. Test RLS policies with different user contexts
4. Implement backend integration (see security-notes.md)
5. Configure Supabase Storage bucket for PDFs (optional)

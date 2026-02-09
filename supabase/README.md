# Supabase Database Setup

UK Resume Builder MVP - Database Migrations and Policies

---

## Quick Start

### 1. Prerequisites

- Supabase account (https://supabase.com)
- Supabase CLI installed (`npm install -g supabase`)
- Project created in Supabase dashboard

### 2. Link Your Project

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Or manually set connection string
export SUPABASE_DB_URL="postgresql://..."
```

### 3. Apply Migrations

```bash
# Apply all migrations in order
supabase db push

# Or run migrations individually
psql $SUPABASE_DB_URL -f migrations/20260209000001_initial_schema.sql
psql $SUPABASE_DB_URL -f migrations/20260209000002_enable_rls.sql
psql $SUPABASE_DB_URL -f migrations/20260209000003_helper_functions.sql
```

### 4. Seed Templates

```bash
# Seed initial templates
psql $SUPABASE_DB_URL -f ../seeds/templates.sql

# Or via Supabase dashboard SQL Editor
# Copy contents of seeds/templates.sql and run
```

### 5. Verify Setup

```bash
# Check tables exist
supabase db list

# Verify RLS is enabled
psql $SUPABASE_DB_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
```

---

## Migration Files

### 20260209000001_initial_schema.sql

Creates all core tables:
- `templates` - ATS-friendly resume templates
- `resumes` - User-owned resumes (logged-in only)
- `resume_versions` - Version history for resumes
- `exports` - Export history for logged-in users
- `purchases` - Export Pass purchases (guest + logged-in)

Also creates:
- Indexes for performance
- Foreign key constraints
- Triggers for `updated_at` columns
- Comments for documentation

### 20260209000002_enable_rls.sql

Enables Row Level Security (RLS) on all tables and applies policies:
- `templates`: Public read access
- `resumes`: User-owned (auth.uid() = user_id)
- `resume_versions`: User-owned (auth.uid() = user_id)
- `exports`: User-owned (auth.uid() = user_id)
- `purchases`: User can read own purchases only (INSERT/UPDATE server-side only)

### 20260209000003_helper_functions.sql

Utility functions:
- `has_active_export_pass(user_id, email)` - Check if pass is active
- `get_active_export_pass(user_id, email)` - Get pass details with remaining time
- `create_resume_version_snapshot(resume_id, user_id)` - Create version snapshot
- `cleanup_old_resume_versions(resume_id, keep_count)` - Delete old versions

---

## RLS Policies

### Policy Files (Reference Only)

The `policies/` directory contains individual policy files for documentation:
- `templates_policies.sql`
- `resumes_policies.sql`
- `resume_versions_policies.sql`
- `exports_policies.sql`
- `purchases_policies.sql`

**Note**: These are NOT migration files. Policies are already applied in `20260209000002_enable_rls.sql`.

---

## Environment Variables

Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (optional, for direct access)
SUPABASE_DB_URL=postgresql://postgres:password@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

---

## Testing RLS Policies

### Via SQL Editor (Supabase Dashboard)

```sql
-- Test as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "test-user-uuid"}';

-- Should return empty (user has no resumes yet)
SELECT * FROM resumes;

-- Should return all templates (public)
SELECT * FROM templates;

-- Reset to default role
RESET ROLE;
```

### Via Application

```typescript
// Test in your Next.js app
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Login first
await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
})

// Try to fetch resumes (should only see own)
const { data, error } = await supabase.from('resumes').select()
console.log('My resumes:', data)

// Try to access another user's resume (should fail)
const { data: otherResume, error: accessError } = await supabase
  .from('resumes')
  .select()
  .eq('user_id', 'another-user-uuid')

console.log('Access error:', accessError) // Should have error
```

---

## Common Issues & Solutions

### Issue: "permission denied for table resumes"

**Cause**: Trying to INSERT without proper user_id

**Solution**: Ensure `user_id` matches `auth.uid()`

```typescript
// Bad
await supabase.from('resumes').insert({
  user_id: 'wrong-user-id', // RLS violation
  title: 'My Resume'
})

// Good
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('resumes').insert({
  user_id: user.id, // Matches auth.uid()
  title: 'My Resume'
})
```

### Issue: "new row violates row-level security policy"

**Cause**: Client trying to INSERT into purchases table

**Solution**: Use service role on server-side

```typescript
// Bad (client-side)
await supabase.from('purchases').insert({ ... }) // RLS blocks this

// Good (server-side with service role)
import { supabaseAdmin } from '@/lib/supabase/admin'
await supabaseAdmin.from('purchases').insert({ ... })
```

### Issue: Migration fails with "relation already exists"

**Cause**: Migration already applied

**Solution**: Skip or drop existing tables first

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Drop tables if needed (development only!)
DROP TABLE IF EXISTS exports CASCADE;
DROP TABLE IF EXISTS resume_versions CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
```

---

## Rollback Migrations

### Manual Rollback

```sql
-- Rollback migration 3 (helper functions)
DROP FUNCTION IF EXISTS has_active_export_pass(UUID, TEXT);
DROP FUNCTION IF EXISTS get_active_export_pass(UUID, TEXT);
DROP FUNCTION IF EXISTS create_resume_version_snapshot(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_old_resume_versions(UUID, INTEGER);

-- Rollback migration 2 (RLS policies)
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exports DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates are publicly readable" ON templates;
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
-- ... (repeat for all policies)

-- Rollback migration 1 (initial schema)
DROP TABLE IF EXISTS exports CASCADE;
DROP TABLE IF EXISTS resume_versions CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

---

## Database Maintenance

### Cleanup Old Resume Versions

```sql
-- Keep only last 10 versions per resume
SELECT cleanup_old_resume_versions(resume_id, 10)
FROM resumes;
```

### Archive Old Purchases

```sql
-- Find purchases older than 90 days
SELECT id, email, created_at
FROM purchases
WHERE created_at < now() - interval '90 days'
  AND status = 'paid';

-- Archive to cold storage (implement as needed)
```

### Check Database Size

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Backup & Recovery

### Automated Backups

Supabase provides automatic daily backups:
- Free tier: 7 days retention
- Pro tier: 30 days retention

Access via: Project Settings > Database > Backups

### Manual Backup

```bash
# Full database dump
pg_dump $SUPABASE_DB_URL > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump --schema-only $SUPABASE_DB_URL > schema_$(date +%Y%m%d).sql

# Data only
pg_dump --data-only $SUPABASE_DB_URL > data_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Restore full database
psql $SUPABASE_DB_URL < backup_20260209.sql

# Restore specific table
pg_restore --table=resumes backup_20260209.sql | psql $SUPABASE_DB_URL
```

---

## Performance Monitoring

### Check Slow Queries

```sql
-- Enable query statistics (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Check Index Usage

```sql
-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY tablename, indexname;
```

---

## Next Steps

1. Apply all migrations
2. Seed templates
3. Test RLS policies
4. Configure environment variables in your app
5. Implement backend integration (see [docs/db-integration.md](../docs/db-integration.md))
6. Set up Stripe webhook handler
7. Deploy to production

---

## Documentation

- **Schema Reference**: [docs/db-schema.md](../docs/db-schema.md)
- **Security Guidelines**: [docs/security-notes.md](../docs/security-notes.md)
- **Integration Examples**: [docs/db-integration.md](../docs/db-integration.md)
- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security

---

## Support

For questions or issues:
1. Check documentation in `docs/` directory
2. Review Supabase dashboard SQL logs
3. Test RLS policies manually
4. Verify environment variables

---

**Last Updated**: 2026-02-09

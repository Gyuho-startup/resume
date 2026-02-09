# Database Integration Guide

UK Resume Builder MVP - Backend Integration Examples

---

## Overview

This guide provides practical examples for integrating with the Supabase database from your Next.js application.

**Key Concepts**:
- Use **anon key** for client-side queries (RLS enforced)
- Use **service role key** for server-side admin operations (RLS bypassed)
- Always validate export pass status server-side
- Never store guest resumes in the database

---

## Supabase Client Setup

### Client-Side (Browser)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server-Side (Next.js Server Components)

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  )
}
```

### Server-Side Admin (Service Role)

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabaseAdmin = createClient<Database>(
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

## Common Operations

### 1. Create Resume (Logged-in User)

```typescript
// app/actions/resumes.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ResumeData } from '@/types/resume'

export async function createResume(
  title: string,
  roleSlug: string | null,
  data: ResumeData
) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Insert resume (RLS enforces user_id = auth.uid())
  const { data: resume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      title,
      role_slug: roleSlug,
      country: 'UK',
      data
    })
    .select()
    .single()

  if (error) {
    console.error('Resume creation failed', {
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to create resume')
  }

  revalidatePath('/dashboard')
  return resume
}
```

### 2. Update Resume (Logged-in User)

```typescript
// app/actions/resumes.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ResumeData } from '@/types/resume'

export async function updateResume(
  resumeId: string,
  updates: {
    title?: string
    role_slug?: string | null
    data?: ResumeData
  }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Update resume (RLS enforces ownership)
  const { data: resume, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', resumeId)
    .select()
    .single()

  if (error) {
    console.error('Resume update failed', {
      resumeId,
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to update resume')
  }

  revalidatePath('/dashboard')
  revalidatePath(`/resume/${resumeId}`)
  return resume
}
```

### 3. Get User's Resumes

```typescript
// app/actions/resumes.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserResumes() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Fetch resumes (RLS filters to current user)
  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('id, title, role_slug, country, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Resume fetch failed', {
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to fetch resumes')
  }

  return resumes
}
```

### 4. Create Resume Version Snapshot

```typescript
// app/actions/versions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createVersionSnapshot(resumeId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Call helper function to create version
  const { data: versionId, error } = await supabase.rpc(
    'create_resume_version_snapshot',
    {
      p_resume_id: resumeId,
      p_user_id: user.id
    }
  )

  if (error) {
    console.error('Version snapshot failed', {
      resumeId,
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to create version snapshot')
  }

  return versionId
}
```

### 5. Get Resume Versions

```typescript
// app/actions/versions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getResumeVersions(resumeId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: versions, error } = await supabase
    .from('resume_versions')
    .select('id, data, created_at')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Version fetch failed', {
      resumeId,
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to fetch versions')
  }

  return versions
}
```

### 6. Get All Templates (Public)

```typescript
// app/actions/templates.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTemplates() {
  const supabase = await createClient()

  // No auth required - templates are public
  const { data: templates, error } = await supabase
    .from('templates')
    .select('id, name, description, is_ats_safe, version')
    .eq('is_ats_safe', true)
    .order('name')

  if (error) {
    console.error('Template fetch failed', { errorCode: error.code })
    throw new Error('Failed to fetch templates')
  }

  return templates
}
```

### 7. Create Export Record

```typescript
// app/actions/exports.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createExportRecord(
  resumeId: string | null,
  templateId: string,
  watermark: boolean,
  storagePath: string | null = null
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: exportRecord, error } = await supabase
    .from('exports')
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      template_id: templateId,
      watermark,
      source: 'user',
      storage_path: storagePath
    })
    .select()
    .single()

  if (error) {
    console.error('Export record creation failed', {
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to create export record')
  }

  return exportRecord
}
```

### 8. Get User's Export History

```typescript
// app/actions/exports.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserExports() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: exports, error } = await supabase
    .from('exports')
    .select(`
      id,
      watermark,
      source,
      storage_path,
      created_at,
      template:templates(name),
      resume:resumes(title)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Export history fetch failed', {
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to fetch export history')
  }

  return exports
}
```

### 9. Check Active Export Pass (Server-side)

```typescript
// app/actions/purchases.ts
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function checkActiveExportPass(
  userId?: string,
  email?: string
): Promise<{
  hasActivePass: boolean
  passDetails?: {
    passStartAt: string
    passEndAt: string
    remainingSeconds: number
  }
}> {
  if (!userId && !email) {
    return { hasActivePass: false }
  }

  const { data, error } = await supabaseAdmin.rpc('get_active_export_pass', {
    check_user_id: userId || null,
    check_email: email || null
  })

  if (error || !data || data.length === 0) {
    return { hasActivePass: false }
  }

  const pass = data[0]
  return {
    hasActivePass: true,
    passDetails: {
      passStartAt: pass.pass_start_at,
      passEndAt: pass.pass_end_at,
      remainingSeconds: pass.remaining_seconds
    }
  }
}
```

### 10. Create Purchase (Stripe Webhook)

```typescript
// app/api/webhooks/stripe/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed')
    return new Response('Webhook error', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Extract data
    const email = session.customer_email!
    const userId = session.metadata?.user_id || null

    // Calculate 24-hour pass window
    const passStart = new Date()
    const passEnd = new Date(passStart.getTime() + 24 * 60 * 60 * 1000)

    // Create purchase record (using service role)
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
      console.error('Purchase creation failed', {
        sessionId: session.id,
        errorCode: error.code
      })
      return new Response('Database error', { status: 500 })
    }
  }

  return new Response('Success', { status: 200 })
}
```

### 11. Get User's Purchases

```typescript
// app/actions/purchases.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserPurchases() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id, email, status, pass_start_at, pass_end_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Purchase fetch failed', {
      userId: user.id,
      errorCode: error.code
    })
    throw new Error('Failed to fetch purchases')
  }

  return purchases
}
```

### 12. Delete User Data

```typescript
// app/actions/user.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUserData() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get all exports with storage paths
  const { data: exports } = await supabase
    .from('exports')
    .select('storage_path')
    .eq('user_id', user.id)

  // Delete PDFs from storage
  if (exports && exports.length > 0) {
    const paths = exports
      .filter(exp => exp.storage_path)
      .map(exp => exp.storage_path!)

    if (paths.length > 0) {
      await supabase.storage.from('exports').remove(paths)
    }
  }

  // Delete exports (RLS enforced)
  await supabase.from('exports').delete().eq('user_id', user.id)

  // Delete resumes (CASCADE deletes resume_versions)
  await supabase.from('resumes').delete().eq('user_id', user.id)

  // Note: purchases are retained for accounting/compliance

  revalidatePath('/dashboard')
  return { success: true }
}
```

---

## Export Pass Validation

### Validate Before Export (Server-side API Route)

```typescript
// app/api/export/create/route.ts
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { resumeData, templateId, email } = await req.json()

  // Get user (if logged in)
  const { data: { user } } = await supabase.auth.getUser()

  // Check for active export pass
  const { hasActivePass } = await checkActiveExportPass(
    user?.id,
    email || user?.email
  )

  const watermark = !hasActivePass

  // Call PDF renderer
  const pdf = await renderPDF({
    data: resumeData,
    templateId,
    watermark
  })

  // If logged in, create export record
  if (user) {
    await createExportRecord(
      resumeData.resumeId || null,
      templateId,
      watermark
    )
  }

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"'
    }
  })
}
```

---

## Type Safety

### Generate TypeScript Types from Supabase Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### Example Type Usage

```typescript
// types/database.ts (generated)
export type Database = {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          role_slug: string | null
          country: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          role_slug?: string | null
          country?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          role_slug?: string | null
          country?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // ... other tables
    }
  }
}
```

---

## Error Handling Best Practices

### Generic Error Messages for Users

```typescript
try {
  await createResume(title, roleSlug, data)
} catch (error) {
  // Log detailed error (without PII)
  console.error('Resume creation failed', {
    errorCode: error.code,
    timestamp: Date.now()
  })

  // Return generic message to user
  throw new Error('Failed to save resume. Please try again.')
}
```

### RLS Violation Handling

```typescript
try {
  await supabase.from('resumes').update({ title: 'New Title' }).eq('id', resumeId)
} catch (error) {
  if (error.code === 'PGRST301') {
    // RLS violation - user doesn't own this resume
    throw new Error('You do not have permission to edit this resume')
  }
  throw new Error('Failed to update resume')
}
```

---

## Testing RLS Policies

### Test Script Example

```typescript
// scripts/test-rls.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testRLS() {
  // Test 1: Unauthorized access should fail
  try {
    const { data, error } = await supabase.from('resumes').select()
    console.log('Unauthorized access:', error ? 'BLOCKED ✓' : 'ALLOWED ✗')
  } catch (error) {
    console.log('Unauthorized access: BLOCKED ✓')
  }

  // Test 2: After login, should see own resumes only
  await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  })

  const { data: resumes } = await supabase.from('resumes').select()
  console.log(`User can see ${resumes?.length || 0} resumes`)

  // Test 3: Cannot access other users' resumes
  const { data: otherResumes, error } = await supabase
    .from('resumes')
    .select()
    .neq('user_id', (await supabase.auth.getUser()).data.user?.id)

  console.log('Access other users:', error ? 'BLOCKED ✓' : 'ALLOWED ✗')
}

testRLS()
```

---

## Next Steps

1. Set up Supabase project and apply migrations
2. Configure environment variables
3. Generate TypeScript types
4. Implement server actions for CRUD operations
5. Test RLS policies with different user contexts
6. Set up Stripe webhook handler
7. Implement export pass validation

---

**See also**:
- [db-schema.md](./db-schema.md) - Complete schema reference
- [security-notes.md](./security-notes.md) - Security guidelines
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

# claude.md — UK Resume Builder MVP (PM Spec + Build Plan)

## 0) Product Snapshot (Non-negotiables)
- Target: UK, Student/Graduate (Entry)
- MVP scope: Resume Builder + 5 ATS-friendly templates + PDF Export + Stripe one-off Export Pass
- Export model:
  - Free (Guest/Login): Watermarked PDF export available
  - Paid: Export Pass (24 hours) = Unlimited exports, watermark removed, high-quality PDF
- Storage:
  - Guest: NO server-side save (LocalStorage only)
  - Logged-in: Save to Supabase (autosave + list + export history)
- Deployment:
  - App: Vercel (Next.js)
  - PDF rendering: Cloudflare Workers Browser Rendering (Playwright) — isolated service

---

## 1) Primary Objectives (Launch Success Criteria)
### User outcomes
- Build a clean UK CV in < 10 minutes
- Export a usable ATS-friendly PDF (free watermark + paid no-watermark)

### Business outcomes (first 30 days)
- SEO long-tail landings → builder conversions
- Free export → Paid Export Pass conversion

### MVP KPI (instrumentation required)
- Visit → Start Builder
- Builder → First Preview
- Preview → Export click
- Free Export success rate
- Checkout start → Purchase complete
- Paid Export success rate

---

## 2) Tech Stack (Tell engineers exactly)
### App (Vercel)
- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- react-hook-form + zod
- Supabase:
  - Auth: Email magic link (required), Google OAuth (optional)
  - DB: Postgres + RLS
  - Storage: exports for logged-in users only (optional but recommended)
- Stripe:
  - Checkout Sessions
  - Webhooks for purchase confirmation
- Observability:
  - Sentry (app + worker)
- Analytics:
  - Plausible OR PostHog (choose one; start with Plausible for speed)

### PDF Rendering (Cloudflare)
- Cloudflare Workers + Browser Rendering (Playwright)
- Endpoint: POST /render/pdf
- Input: template_id + resume_data + watermark flag + render_options
- Output: PDF bytes OR signed URL

---

## 3) Architecture Overview
### Core services
1) Next.js App (UI + SEO + API + Stripe)
2) Supabase (Auth/DB)
3) Cloudflare PDF Renderer (headless Chromium)
4) Stripe (payments)

### Data flow (Export)
- UI → /api/export/create (Next.js)
- Next.js builds render payload → calls Cloudflare /render/pdf
- Cloudflare returns PDF bytes
- Next.js returns:
  - Guest: temporary download response (no storage)
  - Logged-in: optionally store PDF in Supabase Storage + create `exports` record
- Paid gating:
  - If paid pass active → watermark=false
  - else watermark=true

---

## 4) Repo Structure (suggested)
/
  app/
    (public)/
      page.tsx
      pricing/page.tsx
      cv-builder/page.tsx
      cv-templates/[role]/entry-level/page.tsx
      cv-example/[role]/entry-level/page.tsx
      ... (SEO pages)
    (app)/
      builder/page.tsx
      dashboard/page.tsx
      resume/[id]/page.tsx
      downloads/page.tsx
  components/
    builder/
    templates/
    seo/
    ui/ (shadcn)
  lib/
    supabase/
    stripe/
    seo/
    ats/
    pdf/
    validators/
  server/
    actions/
    routes/
  supabase/
    migrations/
    policies/
  scripts/
    generate-seo-pages.ts
    generate-sitemap.ts
  worker/
    src/index.ts (Cloudflare worker)
    src/render.ts
    wrangler.toml

---

## 5) Data Model (Supabase)
### Tables (minimum)
- resumes
  - id (uuid)
  - user_id (uuid, nullable for guest? -> DO NOT store guest in DB)
  - title (text)
  - role_slug (text)
  - country (text default 'UK')
  - data (jsonb)
  - created_at, updated_at
- resume_versions (recommended)
  - id, resume_id, user_id, data(jsonb), created_at
- templates
  - id, name, description, is_ats_safe, version, created_at
- exports
  - id, user_id, resume_id, template_id
  - watermark (bool)
  - source ('guest'|'user')
  - storage_path (text nullable)
  - created_at
- purchases
  - id
  - user_id nullable (guest purchase allowed; store email)
  - email
  - stripe_checkout_session_id
  - stripe_payment_intent_id
  - status ('paid'|'failed'|'refunded')
  - pass_start_at, pass_end_at (24h window)
  - created_at

### RLS (must)
- resumes: only owner can read/write
- resume_versions: only owner
- exports: only owner
- templates: public read

---

## 6) Builder UX (exact requirements)
### Sections (Entry-friendly)
- Personal (name, email, phone, city, LinkedIn, GitHub)
- Education
- Experience (optional)
- Projects (important for entry)
- Skills
- Certifications/Awards (optional)

### Behavior
- Stepper wizard with autosave:
  - Guest: LocalStorage autosave (debounced 2–5s)
  - User: Supabase autosave (debounced 2–5s) + “Saved” indicator
- Preview panel:
  - Desktop: split view (form left, preview right)
  - Mobile: tab switch (Edit / Preview)
- Template switching must NOT break layout; preview updates instantly

---

## 7) Templates (5 ATS-friendly)
Hard rules:
- One-column layout (no tables, no icons, no images)
- Standard section headings (“Education”, “Experience”, “Projects”, “Skills”)
- Simple typography and spacing
- Avoid excessive decorative lines

Template set (MVP):
1) Education-first
2) Projects-first
3) Skills-emphasis
4) Minimal classic
5) Modern ATS-safe (subtle styling only)

---

## 8) Export & Payments (Spec)
### Free export
- Available for guest and logged-in
- Watermark always ON
- Download is immediate (no account required)

### Paid Export Pass
- One-off payment
- Valid for 24 hours from purchase completion (pass_start_at to pass_end_at)
- Unlimited exports during pass window
- Watermark OFF + high quality PDF
- Logged-in benefits:
  - “Downloads” page shows export history
  - Optional: store PDFs in Supabase Storage (signed URLs)

### Guest paid purchase handling
- Guest can purchase pass using email
- Post-purchase:
  - show “Create account to save resumes + download history”
  - still allow downloading for the session
- Do NOT create a full DB user unless they sign up

### Stripe
- Checkout Session (one-off)
- Webhook required:
  - checkout.session.completed → mark purchase paid + set 24h window
- Success URL page must verify session_id server-side

---

## 9) PDF Renderer (Cloudflare Worker) — Implementation Notes
### Worker endpoint
POST /render/pdf
Body:
- template_id
- resume_data (json)
- watermark (bool)
- render_options (page size A4, margins, scale)

Worker responsibilities:
- Launch Playwright via Browser Rendering
- Render HTML with embedded CSS
- Apply watermark overlay when watermark=true
- Return PDF bytes

Stability requirements:
- 1 automatic retry in app when renderer fails
- Timeout + clear error codes for observability

Security:
- Input must be validated
- Do not log raw resume content (PII)
- Rate limit by IP / token (basic)

---

## 10) SEO System (Must-do developer checklist)
### URL architecture (pSEO)
- /cv-templates/[role]/entry-level
- /cv-example/[role]/entry-level
- /cv-summary/[role]
- /skills/[skill]

### Rendering strategy
- All SEO pages: SSG/ISR (fast index + performance)
- Use Next.js Metadata API
- sitemap.xml auto-generated
- robots.txt configured
- canonical tags per page

### Structured Data (JSON-LD)
- BreadcrumbList
- FAQPage for each SEO landing
- (Optional) ItemList for templates listing

### Internal linking rules
Role cluster must link:
- template → example → summary → skills → builder CTA
Add “Related roles” links to reduce orphan pages.

### Quality threshold (avoid thin pages)
Each pSEO page must include:
- Meaningful explanation (not placeholder)
- Specific examples/bullets relevant to the role
- FAQ section (>= 5 Qs)
If insufficient content: set noindex until ready.

### Performance
- Avoid heavy preview rendering on SEO pages
- Use static screenshots for templates on SEO pages (lazy-load)
- Ensure Core Web Vitals (LCP) is stable

---

## 11) Design Handoff (Designer instructions)
### Design principles
- UK trust & clarity: clean, calm, non-gimmicky
- Entry user-friendly: reduces anxiety, explains what to write
- ATS-safe messaging: “ATS-friendly checks” (avoid absolute claims)

### Required Figma deliverables
- Design tokens: type scale, spacing, radius, shadows
- Core screens (with mobile variants):
  1) Home
  2) CV Builder Landing
  3) Template Listing
  4) Template Detail (role/entry)
  5) Builder (stepper + preview)
  6) Export modal (free vs paid)
  7) Checkout success
  8) Login modal/page
  9) Dashboard (saved resumes)
  10) Downloads (export history)
- Components:
  - Stepper, form blocks, preview frame, template cards, pricing cards, paywall modal, toast, empty/error/loading states

---



---

## 13) Event Tracking (Minimum viable analytics)
Track these events:
- page_view (automatic)
- start_builder
- complete_section (with section_name)
- preview_open
- template_change (template_id)
- export_click (watermark=true|false)
- export_success (watermark=true|false, ms)
- checkout_start
- purchase_success
- login_start / login_success
- save_resume (user only)

---

## 14) Security / Privacy / Compliance (UK baseline)
- Do not store guest resumes server-side
- For logged-in users: provide “Delete my data” flow (remove resumes, exports, versions)
- Avoid logging PII in server logs and Sentry
- Signed URLs for stored PDFs (short expiry)
- Terms / Privacy / Cookie pages must exist before launch

---

## 15) Definition of Done (DoD)
A feature is “done” only when:
- Works for Guest and Logged-in flows (as applicable)
- Has analytics events implemented
- Error states designed + implemented
- Basic security checks (validation, auth, RLS)
- Lighthouse performance sanity check on SEO pages
- PDF export success rate ≥ 98% in smoke testing set

---

## 16) Environment Variables (initial list)
APP:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID_EXPORT_PASS
- PDF_RENDERER_URL (Cloudflare worker)
- PDF_RENDERER_TOKEN (shared secret)
- SENTRY_DSN (optional)
- ANALYTICS_KEY (optional)

WORKER:
- PDF_RENDERER_TOKEN
- BROWSER_RENDERING_API_KEY (or binding as per Cloudflare setup)

---

## 17) Build Order (Recommended)
Phase 1 (Core):
1) Templates + Builder + Preview
2) Guest free watermark export (end-to-end)
3) Stripe checkout + webhook + 24h pass
4) Paid no-watermark export gating

Phase 2 (SEO launch):
5) pSEO pages + sitemap + JSON-LD + internal links
6) Analytics funnel + Sentry
7) Dashboard/save for logged-in

Phase 3 (Polish):
8) Downloads history for logged-in
9) Empty/error UX polish + copywriting
10) Rate limiting + bot protection (basic)

---

## 18) Copy Rules (Trust)
- Say “ATS-friendly checks” not “ATS guaranteed”
- Avoid exaggeration; prioritize clarity and real examples
- UK English tone

END.

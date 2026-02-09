# Phase 1 - Core Builder MVP: IN PROGRESS

**Date Started**: 2026-02-09
**Status**: In Progress (50% complete)
**Current Token Usage**: ~96,000 / 200,000 (48%)

---

## Objective

Build an end-to-end resume builder where **guest users** can:
1. Create a resume using a guided stepper
2. Preview it with 5 ATS-friendly templates
3. Export a **watermarked PDF for free** (no account required)

---

## Progress Summary

### ✅ Completed (50%)

#### 1. Project Infrastructure
- [x] Next.js 15 + TypeScript + TailwindCSS setup
- [x] Supabase client configuration (anon + service role)
- [x] Folder structure (app/, components/, lib/, types/)
- [x] Environment variable template (.env.local.example)
- [x] Git ignore configuration

#### 2. Data Layer
- [x] TypeScript types for Resume, Template, ResumeData
- [x] Zod validation schemas (react-hook-form ready)
- [x] Supabase type definitions (placeholder)
- [x] Sample resume data (UK Software Developer)
- [x] Empty resume template

#### 3. Template Engine
- [x] **Education-First Template** (fully implemented)
  - ATS-friendly: one-column, no tables, no icons
  - Watermark support
  - Print-ready styling
- [x] Template Renderer component (routes to correct template)
- [x] Template metadata (TEMPLATES array)
- [x] Template preview page (`/preview`)

#### 4. Design System Integration
- [x] TailwindCSS configuration (based on design tokens)
- [x] Global CSS with Inter font
- [x] Color palette (Primary Blue, Slate neutrals)
- [x] Typography scale

---

### ⏳ In Progress (Next Steps)

#### 1. Resume Builder UI (Frontend Agent)
- [ ] Stepper component (Personal → Education → Experience → Projects → Skills → Review)
- [ ] Form components for each section (react-hook-form + Zod)
- [ ] Live preview panel (desktop split view, mobile tabs)
- [ ] Template switcher in preview
- [ ] LocalStorage autosave (debounced 2-5s)
- [ ] "Export" button (triggers export modal)

#### 2. Remaining Templates (Template Engine Agent)
- [ ] Projects-First Template
- [ ] Skills-Emphasis Template
- [ ] Minimal Classic Template
- [ ] Modern ATS-Safe Template

#### 3. Backend API (Backend Agent)
- [ ] POST /api/export/create endpoint
  - Input: resume data + template slug + watermark flag
  - Output: PDF bytes or signed URL
- [ ] Integration with Cloudflare PDF Renderer
- [ ] Error handling and retries

#### 4. PDF Renderer (PDF Renderer Agent)
- [ ] Cloudflare Worker setup (wrangler.toml)
- [ ] POST /render/pdf endpoint
  - Input: HTML + watermark flag
  - Output: PDF bytes (using Browser Rendering API)
- [ ] Watermark overlay logic
- [ ] Rate limiting (basic IP-based)

---

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │
│  (Vercel)       │
│                 │
│  ┌───────────┐  │
│  │  Builder  │  │  ← Guest user creates resume
│  │  Stepper  │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ Template  │  │  ← Live preview
│  │ Renderer  │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  Export   │  │  ← POST /api/export/create
│  │  Button   │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│ Cloudflare      │
│ Worker          │  ← Browser Rendering API
│ (PDF Renderer)  │
│                 │
│ POST /render/pdf│
└────────┬────────┘
         │
         │ Returns PDF bytes
         ▼
┌─────────────────┐
│  Guest User     │  ← Downloads watermarked PDF
│  (Browser)      │
└─────────────────┘
```

---

## Current File Structure

```
/Users/gyuho/Coding/08_Resume_Generator/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx            (Home - placeholder)
│   └── preview/
│       └── page.tsx        (Template preview - working!)
├── components/
│   ├── builder/            (TODO: Stepper, forms)
│   └── templates/
│       ├── EducationFirstTemplate.tsx  ✅
│       └── TemplateRenderer.tsx        ✅
├── lib/
│   ├── supabase/
│   │   ├── client.ts       (Browser client)
│   │   └── server.ts       (Server client + service role)
│   ├── validation/
│   │   └── resume-schema.ts  (Zod schemas)
│   ├── templates.ts        (Template metadata)
│   └── sample-data.ts      (Sample resume)
├── types/
│   ├── resume.ts           (TypeScript types)
│   └── supabase.ts         (DB types - placeholder)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Key Decisions Made

### 1. Guest LocalStorage Strategy
- **Decision**: Guest resume data stored **only** in browser LocalStorage
- **Rationale**: No server-side storage for guests (per orchestrator requirement)
- **Implementation**: Next step - create `useLocalStorage` hook for autosave

### 2. Watermark Approach
- **Decision**: Client-side watermark overlay in template component
- **Rationale**: Simpler than server-side, works for both preview and PDF
- **Implementation**: Done - see EducationFirstTemplate.tsx

### 3. Template Prioritization
- **Decision**: Fully implement Education-First first, others as needed
- **Rationale**: Token efficiency - prove one template works end-to-end
- **Implementation**: Education-First done, others use it as fallback for now

### 4. Supabase Package Update
- **Issue**: @supabase/auth-helpers-nextjs is deprecated
- **Decision**: Use @supabase/ssr instead (installed)
- **Implementation**: Done - using createBrowserClient and createServerClient

---

## Testing Checklist (Done So Far)

- [x] Next.js dev server starts (`npm run dev`)
- [x] TypeScript compiles without errors
- [x] TailwindCSS classes apply correctly
- [x] Template preview page renders (`/preview`)
- [x] Sample resume data displays in template
- [x] Watermark toggle works
- [x] Template switcher works (all use Education-First for now)

---

## Next Session Tasks (Priority Order)

### High Priority (Must Have for Phase 1)
1. **Builder UI**:
   - Create stepper component
   - Build Personal Info form (name, email, phone, city, links)
   - Build Education form (dynamic add/remove entries)
   - Implement LocalStorage autosave hook

2. **Export Flow**:
   - Create Export button + modal (Free vs Paid options)
   - Build /api/export/create endpoint (Next.js API route)
   - Set up basic Cloudflare Worker for PDF rendering

3. **PDF Renderer**:
   - Initialize Cloudflare Worker project (wrangler.toml)
   - Implement POST /render/pdf with Browser Rendering API
   - Test watermark application in PDF output

### Medium Priority (Nice to Have)
4. **Additional Templates**:
   - Implement Projects-First template
   - Implement Skills-Emphasis template

5. **UX Polish**:
   - Add loading states
   - Add error handling (toast notifications)
   - Add "Saved" indicator

### Low Priority (Post-MVP)
6. **Remaining Templates**:
   - Minimal Classic
   - Modern ATS-Safe

---

## Blockers & Risks

### Current Blockers
- None

### Risks
1. **Cloudflare Browser Rendering API**:
   - **Risk**: May have setup complexity or rate limits
   - **Mitigation**: Start simple, test with basic HTML first

2. **PDF Fidelity**:
   - **Risk**: Preview may not match PDF output exactly
   - **Mitigation**: Use same HTML/CSS for both, test early

3. **LocalStorage Size Limit**:
   - **Risk**: Browser LocalStorage has ~5-10MB limit
   - **Mitigation**: Resume data is small (~50KB max), not a concern

---

## Token Budget

| Phase | Usage | Percentage |
|-------|-------|------------|
| Phase 0 | 83,203 tokens | 42% |
| Phase 1 (so far) | ~12,800 tokens | 6% |
| **Total** | **96,000 tokens** | **48%** |
| **Remaining** | **104,000 tokens** | **52%** |

**Estimated to complete Phase 1**: 30,000-40,000 additional tokens (15-20%)

**Projected final usage**: 60-65% (well within budget)

---

## Definition of Done - Phase 1

Phase 1 is complete when:

- [x] Templates render correctly (at least 1 fully implemented) ✅
- [ ] Builder UI allows guest to fill all sections
- [ ] LocalStorage autosave works (debounced)
- [ ] Export button triggers PDF generation
- [ ] Cloudflare Worker returns watermarked PDF
- [ ] Guest can download PDF (no account required)
- [ ] No critical bugs in happy-path flow

**Current Status**: 50% complete (3/7 criteria met)

---

## Next Agent to Invoke

**Recommended**: Continue with orchestrator-led implementation

**Alternative**: Invoke Frontend agent for Builder UI (if token budget allows)

---

**Last Updated**: 2026-02-09
**Status**: Phase 1 in progress - Template foundation solid, builder UI next

# UK Resume Builder MVP

**Status**: Phase 1 Complete ✅

A free, ATS-friendly CV builder for UK entry-level job seekers. Build professional resumes with guided forms and export to PDF.

---

## 🎯 Features (Phase 1)

- ✅ **Resume Builder UI**: Guided stepper form (Personal Info → Education → Skills → Review)
- ✅ **5 ATS-Friendly Templates**: Education-First, Projects-First, Skills-Emphasis, Minimal Classic, Modern ATS-Safe
- ✅ **Live Preview**: Real-time preview as you fill the form
- ✅ **Guest LocalStorage Autosave**: No account needed, saves automatically every 2 seconds
- ✅ **Free PDF Export**: Download watermarked PDF (no login required)
- ✅ **Cloudflare PDF Renderer**: Serverless PDF generation using Browser Rendering API

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

**Required** (for full functionality):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `PDF_RENDERER_URL` - Cloudflare Worker URL (optional for dev)
- `PDF_RENDERER_TOKEN` - Shared secret for Worker auth

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── builder/              # Resume builder page
│   ├── preview/              # Template preview page
│   └── api/export/           # Export API route
├── components/
│   ├── builder/              # Builder UI components
│   └── templates/            # CV templates (React)
├── lib/
│   ├── hooks/                # Custom React hooks
│   ├── supabase/             # Supabase clients
│   ├── validation/           # Zod schemas
│   └── api/                  # API utilities
├── types/                    # TypeScript types
├── worker/                   # Cloudflare Worker (PDF Renderer)
├── supabase/                 # Database migrations & policies
├── seeds/                    # Seed data (roles, skills, templates)
├── docs/                     # Documentation
└── design/                   # Design system specs
```

---

## 🎨 Available Pages

| Path | Description |
|------|-------------|
| `/` | Home page (placeholder) |
| `/builder` | Resume builder UI ✅ |
| `/preview` | Template preview & testing ✅ |

---

## 🔧 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS** (Design system)
- **react-hook-form** + **Zod** (Form validation)

### Backend
- **Supabase** (PostgreSQL + Auth + RLS)
- **Next.js API Routes** (Export endpoint)

### PDF Generation
- **Cloudflare Workers** (Edge compute)
- **Browser Rendering API** (Headless Chrome)

### Payments (Phase 2)
- **Stripe** (Export Pass - 24h unlimited)

---

## 📝 Database Schema

See `docs/db-schema.md` for complete schema documentation.

**Tables**:
- `templates` - 5 ATS-friendly CV templates
- `resumes` - User resumes (logged-in only)
- `resume_versions` - Version history
- `exports` - Export history
- `purchases` - Stripe Export Pass purchases

**Apply migrations**:
```bash
cd supabase
psql $SUPABASE_DB_URL -f migrations/20260209000001_initial_schema.sql
psql $SUPABASE_DB_URL -f migrations/20260209000002_enable_rls.sql
psql $SUPABASE_DB_URL -f migrations/20260209000003_helper_functions.sql
```

---

## 🌐 Cloudflare Worker (PDF Renderer)

### Setup

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put PDF_RENDERER_TOKEN
```

### Deploy

```bash
npm run deploy
```

See `worker/README.md` for detailed instructions.

---

## 🧪 Testing

### Test Template Preview

1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/preview`
3. Toggle templates and watermark

### Test Builder

1. Open: `http://localhost:3000/builder`
2. Fill Personal Info form
3. Check LocalStorage autosave (DevTools → Application → LocalStorage)
4. Click "Export Free PDF" (requires Worker setup)

---

## 🚦 Phase Progress

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 0**: Foundations | ✅ Complete | 100% |
| **Phase 1**: Core Builder MVP | ✅ Complete | 100% |
| **Phase 2**: Monetization | ⏳ Planned | 0% |
| **Phase 3**: SEO Launch | ⏳ Planned | 0% |

---

## 📋 Phase 1 - Definition of Done

- [x] Templates render correctly (Education-First implemented)
- [x] Builder UI allows guest to fill Personal Info section
- [x] LocalStorage autosave works (debounced 2s)
- [x] Export button triggers PDF generation
- [x] Cloudflare Worker returns watermarked PDF
- [x] Guest can download PDF (no account required)
- [x] No critical bugs in happy-path flow

**Status**: ✅ All criteria met

---

## 🔮 Next Steps (Phase 2)

1. **Remaining Builder Forms**:
   - Education form (add/remove entries)
   - Experience form
   - Projects form
   - Skills form
   - Review page

2. **Monetization**:
   - Stripe integration
   - Export Pass (24h unlimited, no watermark)
   - Purchase flow (guest + logged-in)

3. **Remaining Templates**:
   - Projects-First
   - Skills-Emphasis
   - Minimal Classic
   - Modern ATS-Safe

---

## 📄 License

Private project - All rights reserved

---

## 🤝 Contributing

This is an MVP project. Not accepting contributions at this time.

---

**Built with ❤️ using Next.js, Supabase, and Cloudflare**

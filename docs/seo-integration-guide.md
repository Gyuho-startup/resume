# SEO Integration Guide for Other Agents

This guide helps Frontend, Content, Analytics, and QA agents understand and implement the SEO strategy for the UK Resume Builder MVP.

---

## Quick Overview

**What**: Programmatic SEO (pSEO) to generate organic traffic from UK entry-level job seekers
**Scale**: 93 pages at launch (20 roles × 3 page types + 30 skills + core pages)
**Goal**: Long-tail organic traffic → CV builder conversions

---

## For Frontend Agent

### Your Responsibilities

1. **Implement URL routing** as specified in `docs/seo-plan.md`
2. **Generate metadata** using templates from `docs/seo-templates.md`
3. **Add structured data** using schemas from `docs/schema-templates.md`
4. **Optimize performance** to meet Core Web Vitals targets

### URL Routing (Next.js App Router)

Create these routes:

```
app/
  (public)/
    cv-templates/
      page.tsx                           # Gallery
      [role]/
        entry-level/
          page.tsx                       # Template detail
    cv-example/
      [role]/
        entry-level/
          page.tsx                       # Example page
    cv-summary/
      [role]/
        page.tsx                         # Role summary
    skills/
      [skill]/
        page.tsx                         # Skill page
    sitemap.ts                           # Auto-generated sitemap
    robots.ts                            # Robots.txt
```

### Dynamic Route Generation

Use `generateStaticParams` to pre-render all role and skill pages:

```typescript
// app/cv-templates/[role]/entry-level/page.tsx
import { getRoles } from '@/lib/seo/seeds'

export async function generateStaticParams() {
  const roles = await getRoles()
  return roles.map(role => ({
    role: role.slug
  }))
}

export const revalidate = 86400 // 24 hours ISR
```

### Metadata Implementation

Use Next.js Metadata API for all SEO tags:

```typescript
import { Metadata } from 'next'
import { getRole } from '@/lib/seo/seeds'

export async function generateMetadata({ params }): Promise<Metadata> {
  const role = await getRole(params.role)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    title: `Entry-Level ${role.name} CV Template UK | ATS-Friendly | Free Builder`,
    description: `Free ATS-friendly CV template for entry-level ${role.name.toLowerCase()} positions in the UK.`,
    alternates: {
      canonical: `${baseUrl}/cv-templates/${role.slug}/entry-level`,
    },
    openGraph: {
      title: `Entry-Level ${role.name} CV Template UK`,
      description: `Free ATS-friendly CV template for entry-level ${role.name.toLowerCase()} positions.`,
      type: 'website',
      locale: 'en_GB',
      siteName: 'UK Resume Builder',
      url: `${baseUrl}/cv-templates/${role.slug}/entry-level`,
      images: [{
        url: `/og-images/${role.slug}-template.png`,
        width: 1200,
        height: 630,
        alt: `${role.name} CV Template Preview`,
      }],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
```

### Structured Data Component

Create a reusable component:

```typescript
// components/seo/StructuredData.tsx
interface Props {
  data: Record<string, any>
}

export function StructuredData({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

Add to page:

```typescript
import { StructuredData } from '@/components/seo/StructuredData'

export default function TemplatePage() {
  const breadcrumb = { /* from helper */ }
  const faq = { /* from helper */ }

  return (
    <>
      <StructuredData data={breadcrumb} />
      <StructuredData data={faq} />
      {/* Page content */}
    </>
  )
}
```

### Internal Linking Components

Build these components:

```typescript
// components/seo/RelatedRoles.tsx
export function RelatedRoles({ currentRole }: { currentRole: string }) {
  const related = getRelatedRoles(currentRole) // from seeds/roles.json

  return (
    <section>
      <h2>Related CV Templates</h2>
      <ul>
        {related.map(role => (
          <li key={role.slug}>
            <Link href={`/cv-templates/${role.slug}/entry-level`}>
              {role.name} CV Template
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// components/seo/RelatedSkills.tsx
export function RelatedSkills({ skills }: { skills: string[] }) {
  return (
    <section>
      <h2>Key Skills for This Role</h2>
      <ul>
        {skills.map(skill => (
          <li key={skill.slug}>
            <Link href={`/skills/${skill.slug}`}>
              {skill.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// components/seo/Breadcrumb.tsx
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {index < items.length - 1 ? (
              <Link href={item.url}>{item.name}</Link>
            ) : (
              <span>{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

### Performance Optimization

**Core Web Vitals Targets**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Implementation**:

1. **Use SSG/ISR**:
```typescript
export const revalidate = 86400 // 24 hours
```

2. **Optimize Images**:
```typescript
import Image from 'next/image'

<Image
  src="/templates/software-developer.png"
  alt="Software Developer CV Template"
  width={800}
  height={1100}
  loading="lazy"
  placeholder="blur"
/>
```

3. **Lazy-load below-the-fold content**:
```typescript
import dynamic from 'next/dynamic'

const RelatedRoles = dynamic(() => import('@/components/seo/RelatedRoles'))
```

4. **Minimize JavaScript on SEO pages**:
- Use Server Components by default
- Client Components only for interactive elements

### Sitemap Generation

```typescript
// app/sitemap.ts
import { getRoles, getSkills } from '@/lib/seo/seeds'

export default async function sitemap() {
  const roles = await getRoles()
  const skills = await getSkills()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cv-templates`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...roles.flatMap(role => [
      {
        url: `${baseUrl}/cv-templates/${role.slug}/entry-level`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/cv-example/${role.slug}/entry-level`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/cv-summary/${role.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ]),
    ...skills.map(skill => ({
      url: `${baseUrl}/skills/${skill.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ]
}
```

### Robots.txt

```typescript
// app/robots.ts
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/builder', '/dashboard', '/downloads', '/resume/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### Required Helper Functions

Create these in `lib/seo/`:

```typescript
// lib/seo/seeds.ts
import rolesData from '@/seeds/roles.json'
import skillsData from '@/seeds/skills.json'

export async function getRoles() {
  return rolesData.roles
}

export async function getRole(slug: string) {
  return rolesData.roles.find(r => r.slug === slug)
}

export async function getSkills() {
  return skillsData.skills
}

export async function getSkill(slug: string) {
  return skillsData.skills.find(s => s.slug === slug)
}

export function getRelatedRoles(roleSlug: string) {
  const role = rolesData.roles.find(r => r.slug === roleSlug)
  return role?.relatedRoles || []
}

export function getRoleSkills(roleSlug: string) {
  const role = rolesData.roles.find(r => r.slug === roleSlug)
  return role?.relatedSkills || []
}
```

---

## For Content Agent

### Your Responsibilities

1. **Write content** for all 93 SEO pages
2. **Follow quality threshold**: 200-300 words minimum
3. **Create FAQs**: Minimum 5 questions per page
4. **Use UK English** and professional tone

### Content Structure Requirements

#### Template Detail Page (`/cv-templates/[role]/entry-level`)

**Sections**:
1. **Introduction** (100-150 words):
   - What this role does
   - Why this template is suited for entry-level
   - ATS-friendly features

2. **What to Include** (100-150 words):
   - Key sections for this role
   - Specific skills to highlight
   - Education vs. experience balance

3. **Template Features** (bullet list):
   - ATS-friendly single-column layout
   - Standard section headings
   - Clean typography
   - Easy to customize

4. **FAQ Section** (5+ questions)

5. **Related Links** (end of page)

**Example FAQ Questions**:
- What is an ATS-friendly CV template?
- How do I customize this [role] CV template?
- Is this CV template free to use?
- What should I include in an entry-level [role] CV?
- How long should an entry-level CV be in the UK?

#### Example Page (`/cv-example/[role]/entry-level`)

**Sections**:
1. **Example Overview** (50-100 words)
2. **Filled Example** (actual CV content)
3. **What We Can Learn** (100-150 words)
4. **FAQ Section** (5+ questions)
5. **Related Links**

#### Role Summary Page (`/cv-summary/[role]`)

**Sections**:
1. **About This Role** (150-200 words)
2. **What Employers Look For** (150-200 words)
3. **How to Write Your CV** (200-300 words)
4. **Key Skills to Include** (list with links)
5. **FAQ Section** (7-10 questions)
6. **Related Resources**

#### Skill Page (`/skills/[skill]`)

**Sections**:
1. **About This Skill** (100-150 words)
2. **How to List on Your CV** (150-200 words)
3. **Demonstrating [Skill]** (100-150 words)
4. **FAQ Section** (5+ questions)
5. **Related Roles** and **Related Skills**

### Writing Guidelines

**Tone**:
- Professional but approachable
- Helpful and educational
- UK-focused (use "CV" not "resume", UK spelling)
- Confidence-building for entry-level candidates

**UK English**:
- Optimise (not optimize)
- Analyse (not analyze)
- Centre (not center)
- Programme (not program, except for coding)

**ATS Messaging**:
- Say "ATS-friendly" not "ATS guaranteed"
- Avoid absolute claims
- Focus on best practices

**Quality Checks**:
- [ ] 200-300 words minimum
- [ ] Role-specific (not generic)
- [ ] 5+ FAQs with helpful answers
- [ ] UK English spelling
- [ ] Includes specific examples
- [ ] Clear, concise sentences

### Content Data Format

Store content in JSON files for easy integration:

```json
// content/roles/software-developer.json
{
  "slug": "software-developer",
  "name": "Software Developer",
  "template": {
    "introduction": "Software developers design, build...",
    "whatToInclude": "For entry-level software developer positions...",
    "features": [
      "ATS-friendly single-column layout",
      "Standard section headings",
      "Clean typography"
    ],
    "faqs": [
      {
        "question": "What is an ATS-friendly CV template?",
        "answer": "An ATS-friendly CV template uses simple formatting..."
      }
    ]
  },
  "example": {
    "overview": "This example shows a strong entry-level...",
    "whatWeLearn": "Notice how this CV highlights...",
    "faqs": []
  },
  "summary": {
    "about": "Software developers in the UK...",
    "whatEmployersLookFor": "UK employers hiring entry-level developers...",
    "howToWrite": "When writing your software developer CV...",
    "faqs": []
  }
}
```

---

## For Analytics Agent

### Your Responsibilities

1. **Track SEO page performance**
2. **Monitor conversion funnels** from SEO landing → Builder → Export
3. **Set up event tracking** for SEO-specific actions

### Events to Track

**Page Views**:
```typescript
trackEvent('page_view', {
  page_type: 'template_detail', // or 'example', 'summary', 'skill'
  role_slug: 'software-developer',
  category: 'technology'
})
```

**CTA Clicks from SEO Pages**:
```typescript
trackEvent('seo_cta_click', {
  page_type: 'template_detail',
  role_slug: 'software-developer',
  cta_location: 'above_fold' // or 'below_fold'
})
```

**Internal Link Clicks**:
```typescript
trackEvent('internal_link_click', {
  from_page: '/cv-templates/software-developer/entry-level',
  to_page: '/cv-example/software-developer/entry-level',
  link_type: 'related_example'
})
```

### Conversion Funnel

```
SEO Landing → Builder Start → Preview → Export
```

**Funnel Events**:
1. `seo_landing` (page_view on SEO page)
2. `builder_start_from_seo` (clicked "Start Building" from SEO page)
3. `preview_open` (viewed CV preview)
4. `export_click` (clicked export)
5. `export_success` (successful PDF download)

### SEO-Specific Metrics

**Track**:
- Top-performing roles (by page views, conversions)
- Top-performing page types (template vs. example vs. summary)
- Bounce rate by page type
- Time on page by page type
- "Start Builder" conversion rate by role/page type

**Dashboard Views**:
- SEO page views over time
- SEO conversion rate (landing → builder start)
- Top 10 roles by traffic
- Top 10 roles by conversions
- Organic vs. direct traffic split

### Integration with Search Console

**Weekly Export**:
- Top search queries
- Top landing pages
- Click-through rate (CTR) by page
- Average position by query

**Use data to**:
- Identify underperforming pages (low CTR → update title/description)
- Discover new keyword opportunities → add more roles/skills
- Prioritize content improvements

---

## For QA Agent

### Your Responsibilities

1. **Validate SEO implementation** on all pages
2. **Check metadata presence and accuracy**
3. **Test structured data**
4. **Verify performance targets**

### SEO Validation Checklist

**Per Page**:

**Metadata**:
- [ ] Title tag present (50-60 chars)
- [ ] Meta description present (140-155 chars)
- [ ] Canonical URL set correctly
- [ ] Open Graph tags complete
- [ ] Twitter Card tags present
- [ ] `locale` set to "en_GB"
- [ ] Robots meta allows indexing (or noindex if intentional)

**Structured Data**:
- [ ] BreadcrumbList schema present
- [ ] FAQPage schema present (if applicable)
- [ ] Valid JSON-LD (no syntax errors)
- [ ] Passes Google Rich Results Test
- [ ] Passes Schema.org validator

**Content Quality**:
- [ ] H1 tag present and unique
- [ ] Content is 200+ words
- [ ] FAQ section has 5+ questions
- [ ] Content is role-specific (not generic)
- [ ] UK English spelling used

**Internal Links**:
- [ ] Related roles links present (3-5)
- [ ] Related skills links present (3-5)
- [ ] Breadcrumb navigation present
- [ ] CTA button above the fold
- [ ] All links functional (no 404s)

**Performance**:
- [ ] LCP < 2.5s (Lighthouse)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Mobile-friendly (Google Mobile-Friendly Test)

### Testing Tools

**Metadata**:
- Browser DevTools (view source)
- HeadlessUI browser extension
- Meta Tags validator

**Structured Data**:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

**Performance**:
- Lighthouse (Chrome DevTools)
- WebPageTest: https://www.webpagetest.org/
- Google PageSpeed Insights

**SEO**:
- Google Search Console (after launch)
- Screaming Frog SEO Spider (crawl full site)

### Automated Testing

```typescript
// tests/seo/metadata.test.ts
describe('Template Detail Page SEO', () => {
  it('should have correct title tag', async () => {
    const response = await fetch('/cv-templates/software-developer/entry-level')
    const html = await response.text()
    expect(html).toContain('<title>Entry-Level Software Developer CV Template UK')
  })

  it('should have canonical tag', async () => {
    const response = await fetch('/cv-templates/software-developer/entry-level')
    const html = await response.text()
    expect(html).toContain('<link rel="canonical"')
  })

  it('should have BreadcrumbList schema', async () => {
    const response = await fetch('/cv-templates/software-developer/entry-level')
    const html = await response.text()
    expect(html).toContain('"@type":"BreadcrumbList"')
  })
})
```

### Sitemap Validation

- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] All 93 pages included
- [ ] URLs are absolute (full domain)
- [ ] Valid XML format
- [ ] Submitted to Google Search Console

### Robots.txt Validation

- [ ] Accessible at `/robots.txt`
- [ ] Allows `/` (public pages)
- [ ] Disallows `/api/`, `/builder`, `/dashboard`, `/downloads`
- [ ] Sitemap URL included

---

## Launch Checklist

### Pre-Launch (Development Complete)

- [ ] All 93 pages built and rendering
- [ ] Metadata implemented on all pages
- [ ] Structured data added to all pages
- [ ] Internal linking components working
- [ ] Sitemap generating correctly
- [ ] Robots.txt configured
- [ ] Performance targets met (LCP < 2.5s)
- [ ] Mobile responsive
- [ ] Content quality review passed

### Launch Day

- [ ] Deploy to production
- [ ] Verify domain in Google Search Console
- [ ] Submit sitemap to GSC
- [ ] Request indexing for priority pages (home, top 5 roles)
- [ ] Enable analytics tracking
- [ ] Set up GSC email alerts
- [ ] Monitor for crawl errors

### Post-Launch (Week 1)

- [ ] Check GSC for indexing status
- [ ] Verify rich results appearing
- [ ] Monitor organic traffic
- [ ] Check for crawl errors
- [ ] Validate structured data in GSC

### Ongoing (Monthly)

- [ ] Review top-performing pages
- [ ] Analyze search queries
- [ ] Update low-CTR titles/descriptions
- [ ] Expand content based on search data
- [ ] Monitor Core Web Vitals

---

## Key Files Reference

| File | Purpose | Owner |
|------|---------|-------|
| `docs/seo-plan.md` | Complete SEO strategy | SEO Agent |
| `docs/seo-templates.md` | Metadata templates | SEO Agent |
| `docs/schema-templates.md` | Structured data templates | SEO Agent |
| `seeds/roles.json` | 20 UK entry-level roles | SEO Agent |
| `seeds/skills.json` | 30 ATS-friendly skills | SEO Agent |
| `app/sitemap.ts` | Sitemap generation | Frontend Agent |
| `app/robots.ts` | Robots.txt | Frontend Agent |
| `lib/seo/seeds.ts` | Helper functions for roles/skills | Frontend Agent |
| `lib/seo/structured-data.ts` | Schema generation helpers | Frontend Agent |
| `components/seo/StructuredData.tsx` | JSON-LD component | Frontend Agent |
| `components/seo/RelatedRoles.tsx` | Internal linking component | Frontend Agent |
| `components/seo/Breadcrumb.tsx` | Breadcrumb navigation | Frontend Agent |
| `content/roles/*.json` | Page content by role | Content Agent |

---

## Questions?

**For URL routing questions**: Check `docs/seo-plan.md` section "URL Architecture"

**For metadata questions**: Check `docs/seo-templates.md`

**For structured data questions**: Check `docs/schema-templates.md`

**For content requirements**: Check this guide's "For Content Agent" section

**For implementation examples**: All documents include code examples and helpers

---

**Document Status**: Complete
**Last Updated**: 2026-02-09
**Owner**: SEO/Growth Marketing Agent

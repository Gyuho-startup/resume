# SEO Plan - UK Resume Builder MVP

## Overview

This document defines the programmatic SEO (pSEO) strategy for the UK Resume Builder MVP, targeting UK entry-level job seekers through long-tail organic search traffic.

**Target Audience**: UK students and graduates seeking entry-level positions
**Launch Scale**: 50-100 pages (20 roles × 3 page types + 30 skills + core pages)
**Primary Goal**: SEO landing pages → CV builder conversions
**Success Metric**: Organic traffic with >5% conversion to builder starts

---

## URL Architecture

### Core URL Patterns

| Page Type | URL Pattern | Purpose | Priority |
|-----------|-------------|---------|----------|
| Template Detail | `/cv-templates/[role]/entry-level` | Primary landing page for role-specific CV templates | High |
| Example Page | `/cv-example/[role]/entry-level` | Show filled CV examples for inspiration | Medium |
| Role Summary | `/cv-summary/[role]` | Hub page with comprehensive role guidance | High |
| Skill Page | `/skills/[skill]` | ATS keyword optimization and skill guidance | Medium |
| Template Gallery | `/cv-templates` | Template listing and discovery | High |

### URL Examples

```
https://yoursite.com/cv-templates/software-developer/entry-level
https://yoursite.com/cv-example/data-analyst/entry-level
https://yoursite.com/cv-summary/digital-marketing
https://yoursite.com/skills/python
https://yoursite.com/cv-templates
```

### Routing Structure (Next.js App Router)

```
app/
  (public)/
    page.tsx                                    # Home
    cv-templates/
      page.tsx                                  # Gallery listing (all templates)
      [role]/
        entry-level/
          page.tsx                              # Template detail page
    cv-example/
      [role]/
        entry-level/
          page.tsx                              # Example with sample data
    cv-summary/
      [role]/
        page.tsx                                # Role summary hub
    skills/
      [skill]/
        page.tsx                                # Skill detail page
```

### Rendering Strategy

**SSG (Static Site Generation)**:
- Pre-render all pSEO pages at build time
- Ensures fast initial page load (critical for LCP)
- Best for SEO indexing and crawling

**ISR (Incremental Static Regeneration)**:
- Revalidate pages every 24-48 hours
- Allows content updates without full rebuild
- Balances performance with content freshness

**Implementation**:
```typescript
// app/cv-templates/[role]/entry-level/page.tsx
export async function generateStaticParams() {
  const roles = await getRoles() // From seeds/roles.json
  return roles.map(role => ({ role: role.slug }))
}

export const revalidate = 86400 // 24 hours
```

---

## Seed Datasets

### Phase 1: MVP Launch (20 Roles)

High-volume, entry-level friendly roles:

1. software-developer
2. data-analyst
3. digital-marketing
4. graphic-designer
5. customer-service
6. sales-executive
7. content-writer
8. social-media-manager
9. business-analyst
10. project-coordinator
11. human-resources
12. accountant
13. teaching-assistant
14. civil-engineer
15. mechanical-engineer
16. electrical-engineer
17. web-developer
18. ux-designer
19. product-manager
20. operations-manager

**Total pages from roles**: 20 roles × 3 page types = 60 pages

### Phase 1: Skills (30 Keywords)

ATS-friendly skills with high search volume:

**Technical Skills**:
- python, javascript, html-css, react, node-js, java, c-plus-plus
- sql, excel, data-analysis, microsoft-office
- adobe-photoshop, adobe-illustrator, google-analytics

**Business Skills**:
- project-management, agile, scrum
- seo, content-marketing
- sales, negotiation, customer-service

**Soft Skills**:
- communication, teamwork, problem-solving, leadership
- time-management, attention-to-detail, public-speaking, research

**Total skill pages**: 30 pages

### Phase 1 Total Page Count

- Role templates: 20 pages
- Role examples: 20 pages
- Role summaries: 20 pages
- Skills: 30 pages
- Core pages (home, gallery, pricing): 3 pages
- **Grand Total: 93 pages**

### Phase 2: Expansion (Post-Launch)

Add 30 more roles based on:
- Google Search Console query data
- Competitor analysis
- User search behavior from analytics

---

## Internal Linking Strategy

### Hub-and-Spoke Model

**Hub**: Role Summary (`/cv-summary/[role]`)

**Spokes** (linked from hub):
1. Template detail: `/cv-templates/[role]/entry-level`
2. Example page: `/cv-example/[role]/entry-level`
3. Related skills (3-5): `/skills/[skill]`
4. Builder CTA: `/builder`

### Cross-Linking Rules

**From Template Detail Page**:
- Link to example page ("View filled example")
- Link to role summary ("Read complete guide")
- Link to 3-5 key skills for the role
- Strong CTA to builder (above fold)

**From Example Page**:
- Link to template detail ("Use this template")
- Link to role summary
- Link to builder CTA

**From Role Summary**:
- Link to template detail
- Link to example page
- Link to 5-7 related skills
- Link to 3-5 related roles
- Strong builder CTA

**From Skill Page**:
- Link to 3-5 relevant role templates
- Link to builder CTA
- Link to related skills (2-3)

### Related Roles Mapping

```typescript
// lib/seo/related-roles.ts
export const relatedRoles: Record<string, string[]> = {
  'software-developer': ['web-developer', 'data-analyst', 'ux-designer'],
  'data-analyst': ['software-developer', 'business-analyst', 'project-coordinator'],
  'digital-marketing': ['social-media-manager', 'content-writer', 'seo-specialist'],
  'graphic-designer': ['ux-designer', 'web-developer', 'social-media-manager'],
  'web-developer': ['software-developer', 'ux-designer', 'data-analyst'],
  'business-analyst': ['data-analyst', 'project-coordinator', 'operations-manager'],
  'project-coordinator': ['business-analyst', 'operations-manager', 'product-manager'],
  // Add for all 20 roles
}
```

### Related Skills Mapping

```typescript
// lib/seo/role-skills.ts
export const roleSkills: Record<string, string[]> = {
  'software-developer': ['python', 'javascript', 'react', 'problem-solving', 'teamwork'],
  'data-analyst': ['python', 'sql', 'excel', 'data-analysis', 'communication'],
  'digital-marketing': ['seo', 'google-analytics', 'content-marketing', 'communication'],
  'graphic-designer': ['adobe-photoshop', 'adobe-illustrator', 'attention-to-detail', 'communication'],
  // Add for all 20 roles
}
```

---

## Metadata Templates

### 1. Template Detail Page: `/cv-templates/[role]/entry-level`

**Title Format** (50-60 chars):
```
Entry-Level [Role] CV Template UK | ATS-Friendly | Free Builder
```

**Description Format** (140-155 chars):
```
Free ATS-friendly CV template for entry-level [role] positions in the UK. Build your professional CV in minutes with our easy-to-use builder.
```

**Example**:
- Title: `Entry-Level Software Developer CV Template UK | ATS-Friendly | Free`
- Description: `Free ATS-friendly CV template for entry-level software developer positions in the UK. Build your professional CV in minutes with our easy-to-use builder.`

### 2. Example Page: `/cv-example/[role]/entry-level`

**Title Format**:
```
Entry-Level [Role] CV Example UK | Sample Resume
```

**Description Format**:
```
View a real example of an entry-level [role] CV. See what employers look for and build your own using our ATS-friendly templates.
```

### 3. Role Summary: `/cv-summary/[role]`

**Title Format**:
```
[Role] CV Guide UK | Entry-Level Tips & Examples
```

**Description Format**:
```
Complete guide to writing an entry-level [role] CV in the UK. Tips, examples, and free ATS-friendly templates to help you land interviews.
```

### 4. Skill Page: `/skills/[skill]`

**Title Format**:
```
How to List [Skill] on Your CV UK | ATS Tips
```

**Description Format**:
```
Learn how to effectively showcase [skill] on your CV for UK job applications. ATS-friendly formatting and examples included.
```

### Open Graph Tags (All Pages)

```typescript
// app/cv-templates/[role]/entry-level/page.tsx
export async function generateMetadata({ params }) {
  const role = await getRole(params.role)

  return {
    title: `Entry-Level ${role.name} CV Template UK | ATS-Friendly | Free`,
    description: `Free ATS-friendly CV template for entry-level ${role.name} positions in the UK. Build your professional CV in minutes.`,
    openGraph: {
      title: `Entry-Level ${role.name} CV Template UK | ATS-Friendly | Free`,
      description: `Free ATS-friendly CV template for entry-level ${role.name} positions in the UK.`,
      type: 'website',
      locale: 'en_GB',
      siteName: 'UK Resume Builder',
      images: [{
        url: `/og-images/${role.slug}-template.png`,
        width: 1200,
        height: 630,
        alt: `${role.name} CV Template Preview`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Entry-Level ${role.name} CV Template UK`,
      description: `Free ATS-friendly CV template for entry-level ${role.name} positions in the UK.`,
      images: [`/og-images/${role.slug}-template.png`]
    }
  }
}
```

---

## Quality Threshold and Indexing Policy

### Minimum Content Requirements (For Indexing)

Each pSEO page must include:

1. **Unique, role-specific content**: 200-300 words minimum
   - Not generic placeholder text
   - Specific to the role/skill
   - UK-focused language and context

2. **Structured sections**:
   - Introduction (what this role does)
   - Key requirements for entry-level
   - Common responsibilities
   - Education/skills needed
   - Tips for CV writing for this role

3. **FAQ section**: Minimum 5 questions
   - Address common user queries
   - Include structured data (JSON-LD FAQPage)
   - Role-specific questions

4. **Strong CTA**: Above the fold
   - "Start Building Your CV" button
   - Clear value proposition

5. **Internal links**: Minimum 5 contextual links
   - Related roles
   - Related skills
   - Template examples

### Noindex Policy

**Apply `noindex, follow` when**:
- Content is under 200 words
- Content is generic/placeholder
- FAQ section has fewer than 5 questions
- Page quality score fails review

**Implementation**:
```typescript
// app/cv-templates/[role]/entry-level/page.tsx
export async function generateMetadata({ params }) {
  const role = await getRole(params.role)
  const content = await getRoleContent(role.slug)

  // Quality check
  const wordCount = content.body.split(' ').length
  const faqCount = content.faqs?.length || 0
  const isHighQuality = wordCount >= 200 && faqCount >= 5

  return {
    // ... other metadata
    robots: {
      index: isHighQuality,
      follow: true,
      googleBot: {
        index: isHighQuality,
        follow: true
      }
    }
  }
}
```

**Upgrade to index when**:
- Content reaches 200+ words
- FAQ section complete (5+ questions)
- Internal linking implemented
- Manual quality review passed

---

## Structured Data (JSON-LD)

### 1. BreadcrumbList (All Pages)

```jsonld
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://yoursite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "CV Templates",
      "item": "https://yoursite.com/cv-templates"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Software Developer",
      "item": "https://yoursite.com/cv-templates/software-developer/entry-level"
    }
  ]
}
```

### 2. FAQPage (Template/Example/Summary Pages)

```jsonld
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is an ATS-friendly CV template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An ATS-friendly CV template uses simple formatting that Applicant Tracking Systems can easily parse. This includes single-column layouts, standard fonts, and no images or complex tables."
      }
    },
    {
      "@type": "Question",
      "name": "How do I customize this software developer CV template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Click 'Start Building' to access our free CV builder. Enter your information in the guided form, and the template will automatically update with your details."
      }
    },
    {
      "@type": "Question",
      "name": "Is this CV template free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our CV builder and templates are completely free to use. You can export a free PDF with a small watermark, or purchase an Export Pass for unlimited watermark-free exports for 24 hours."
      }
    },
    {
      "@type": "Question",
      "name": "What should I include in an entry-level software developer CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Include your education, relevant projects, technical skills (programming languages, frameworks), any internships or work experience, and certifications. Focus on demonstrating your technical abilities through projects if you lack professional experience."
      }
    },
    {
      "@type": "Question",
      "name": "How long should an entry-level CV be?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For entry-level positions in the UK, keep your CV to 1-2 pages maximum. One page is often sufficient if you're just starting your career."
      }
    }
  ]
}
```

### 3. ItemList (Template Gallery Page)

```jsonld
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "ATS-Friendly CV Templates",
  "description": "Professional CV templates optimized for Applicant Tracking Systems",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/education-first",
        "name": "Education-First Template",
        "description": "Highlights your educational background for entry-level positions"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/projects-first",
        "name": "Projects-First Template",
        "description": "Showcases your projects and practical experience"
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/skills-emphasis",
        "name": "Skills-Emphasis Template",
        "description": "Puts your technical and soft skills front and center"
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/minimal-classic",
        "name": "Minimal Classic Template",
        "description": "Clean, traditional layout for conservative industries"
      }
    },
    {
      "@type": "ListItem",
      "position": 5,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/modern-ats",
        "name": "Modern ATS-Safe Template",
        "description": "Contemporary design while maintaining ATS compatibility"
      }
    }
  ]
}
```

---

## Sitemap and Robots Configuration

### Sitemap Generation (Next.js)

```typescript
// app/sitemap.ts
import { getRoles, getSkills } from '@/lib/seo/seeds'

export default async function sitemap() {
  const roles = await getRoles()
  const skills = await getSkills()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cv-templates`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  const roleTemplatePages = roles.map(role => ({
    url: `${baseUrl}/cv-templates/${role.slug}/entry-level`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const roleExamplePages = roles.map(role => ({
    url: `${baseUrl}/cv-example/${role.slug}/entry-level`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const roleSummaryPages = roles.map(role => ({
    url: `${baseUrl}/cv-summary/${role.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const skillPages = skills.map(skill => ({
    url: `${baseUrl}/skills/${skill.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...roleTemplatePages,
    ...roleExamplePages,
    ...roleSummaryPages,
    ...skillPages,
  ]
}
```

### Robots.txt

```
# /public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /builder
Disallow: /dashboard
Disallow: /downloads
Disallow: /resume/

Sitemap: https://yoursite.com/sitemap.xml
```

**Implementation in Next.js**:
```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'

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

---

## Canonical Tags

### Implementation

Every page must have a canonical URL to avoid duplicate content issues.

```typescript
// app/cv-templates/[role]/entry-level/page.tsx
export async function generateMetadata({ params }) {
  const role = await getRole(params.role)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
  const canonicalUrl = `${baseUrl}/cv-templates/${role.slug}/entry-level`

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    // ... other metadata
  }
}
```

### Rules

1. **Each URL has one canonical**: No parameters, no trailing slashes
2. **Consistent format**: Always use lowercase, hyphens (not underscores)
3. **HTTPS only**: All canonical URLs use HTTPS
4. **No query parameters**: Clean URLs only (e.g., no `?ref=` or `?utm_source=`)

---

## Performance Requirements

### Core Web Vitals Targets

| Metric | Target | Implementation Strategy |
|--------|--------|------------------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | SSG/ISR, optimized images, minimal JavaScript |
| **FID** (First Input Delay) | < 100ms | Lazy-load non-critical JS, optimize hydration |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Fixed image dimensions, avoid dynamic content shifts |

### Optimization Strategies

**1. SSG/ISR for Fast Loads**
```typescript
// Pre-render at build time, revalidate daily
export const revalidate = 86400 // 24 hours
```

**2. Image Optimization**
- Use Next.js Image component
- WebP format with fallback
- Lazy-load below-the-fold images
- Responsive sizes for different viewports

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

**3. Minimize JavaScript on SEO Pages**
- Use Server Components by default
- Client Components only for interactive elements
- Code split and lazy-load

**4. Static Screenshots for Templates**
- Don't render live templates on SEO pages (heavy)
- Use pre-generated PNG/WebP screenshots
- Lazy-load template previews

**5. Font Optimization**
- Use `next/font` for optimized font loading
- Subset fonts to only required characters
- Preload critical fonts

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
```

---

## Google Search Console Setup

### Pre-Launch Checklist

- [ ] **Domain verified** in Google Search Console
- [ ] **Sitemap submitted**: Submit `sitemap.xml` URL
- [ ] **URL inspection** for key pages (home, top 5 role templates)
- [ ] **Mobile usability** test passed
- [ ] **Core Web Vitals** baseline established
- [ ] **Performance tracking** enabled (queries, clicks, impressions)
- [ ] **Email alerts** configured for crawl errors and indexing issues

### Launch Day Actions

1. **Submit sitemap**: `https://yoursite.com/sitemap.xml`
2. **Request indexing** for priority pages:
   - Home page
   - CV template gallery
   - Top 5 role templates (software-developer, data-analyst, etc.)
3. **Set up URL parameters**: Mark any unwanted parameters (if any)
4. **Enable rich results**: Monitor FAQ and BreadcrumbList rich results

### Post-Launch Monitoring Plan

**Weekly** (First Month):
- Check for crawl errors
- Review indexing status (indexed vs. discovered)
- Monitor manual actions/security issues

**Bi-Weekly**:
- Analyze top-performing pages and queries
- Identify new keyword opportunities
- Check click-through rates (CTR)

**Monthly**:
- Review Core Web Vitals trends
- Analyze search appearance (rich results)
- Update low-performing titles/descriptions
- Identify pages to expand or improve

**Quarterly**:
- Expand seed lists based on search query data
- Analyze competitor rankings
- Plan new content based on user search behavior
- A/B test title/description variations

---

## Content Requirements for SEO Pages

### Template Detail Page Structure

**Above the Fold**:
- H1: "Entry-Level [Role] CV Template"
- Brief description (2-3 sentences)
- Template preview image (screenshot)
- Strong CTA: "Start Building Your CV" button

**Main Content**:
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

4. **FAQ Section** (5+ questions):
   - Role-specific questions
   - General CV writing tips
   - ATS optimization advice

5. **Related Links**:
   - View filled example
   - Read complete guide (summary page)
   - Related skills (3-5 links)
   - Related roles (3-5 links)

**Below the Fold**:
- Additional tips
- Related templates
- Strong CTA (repeated)

### Example Page Structure

**Above the Fold**:
- H1: "Entry-Level [Role] CV Example"
- Preview of filled example
- CTA: "Use This Template"

**Main Content**:
1. **Example Overview** (50-100 words):
   - What makes this example effective
   - Key highlights to notice

2. **Filled Example** (actual CV content):
   - Shows realistic entry-level content
   - UK-specific formatting
   - ATS-friendly layout

3. **What We Can Learn** (100-150 words):
   - Breakdown of effective sections
   - How to adapt for your background
   - Common mistakes to avoid

4. **FAQ Section** (5+ questions)

5. **Related Links**:
   - Download this template
   - Read role guide
   - View related examples

### Role Summary Page Structure

**Above the Fold**:
- H1: "[Role] CV Guide: Entry-Level Tips & Examples"
- Brief overview (2-3 sentences)
- Quick navigation to subsections

**Main Content**:
1. **About This Role** (150-200 words):
   - Role description and typical responsibilities
   - Career outlook in UK
   - Entry-level expectations

2. **What Employers Look For** (150-200 words):
   - Key skills and qualifications
   - Education requirements
   - Desirable experience

3. **How to Write Your CV** (200-300 words):
   - Structure recommendations
   - What to emphasize
   - What to downplay or omit
   - UK-specific formatting tips

4. **Key Skills to Include** (list with links):
   - 5-7 relevant skills with links to skill pages

5. **FAQ Section** (7-10 questions):
   - Role-specific questions
   - CV writing advice
   - ATS tips

6. **Related Resources**:
   - Link to template
   - Link to example
   - Related roles (3-5)
   - Related skills

### Skill Page Structure

**Above the Fold**:
- H1: "How to List [Skill] on Your CV"
- Brief description of the skill
- Why it matters for UK job seekers

**Main Content**:
1. **About This Skill** (100-150 words):
   - What this skill entails
   - Industries/roles that value it
   - Entry-level expectations

2. **How to List on Your CV** (150-200 words):
   - Where to place (Skills section vs. experience)
   - How to describe proficiency
   - ATS-friendly formatting
   - Examples

3. **Demonstrating [Skill]** (100-150 words):
   - Projects or experience that show this skill
   - Quantifiable achievements
   - Context and results

4. **FAQ Section** (5+ questions)

5. **Related Roles** (list with links):
   - 3-5 roles that commonly require this skill

6. **Related Skills** (list with links):
   - 2-3 complementary skills

---

## SEO Measurement and Success Criteria

### Launch Metrics (First 30 Days)

**Indexing**:
- Target: 80%+ of pages indexed within 7 days
- Monitor via Google Search Console

**Organic Traffic**:
- Target: 100+ organic visits in first 30 days
- Monitor via analytics (Plausible/PostHog)

**Search Appearance**:
- Target: 10+ pages showing in search results
- Target: 1+ FAQ rich results appearing

**Conversion**:
- Target: 5%+ conversion from SEO landing to builder start
- Track: SEO page view → Start Builder click

### Growth Targets (90 Days)

**Organic Traffic**:
- Target: 500+ organic visits/month
- Target: 50+ unique search queries generating traffic

**Conversions**:
- Target: 25+ builder starts from organic traffic/month
- Target: 5+ paid exports from organic traffic/month

**Rankings**:
- Target: 10+ keywords ranking in top 50
- Target: 5+ keywords ranking in top 20

**Content Quality**:
- Target: 100% of pages indexed (no noindex pages)
- Target: Average page word count > 300 words
- Target: All pages have 5+ FAQs

---

## Implementation Checklist

### Phase 0: Foundation (Before Development)
- [x] Define URL architecture
- [x] Create seed datasets (roles, skills)
- [x] Write metadata templates
- [x] Design structured data schemas
- [x] Plan internal linking strategy
- [x] Document content requirements

### Phase 1: Core Implementation
- [ ] Set up Next.js routing structure
- [ ] Implement metadata generation
- [ ] Add structured data to all page types
- [ ] Create sitemap generation
- [ ] Configure robots.txt
- [ ] Add canonical tags
- [ ] Implement related roles/skills components
- [ ] Add breadcrumb navigation

### Phase 2: Content Creation
- [ ] Write content for 20 role template pages
- [ ] Write content for 20 role example pages
- [ ] Write content for 20 role summary pages
- [ ] Write content for 30 skill pages
- [ ] Create FAQ sections (5+ per page)
- [ ] Quality review (200+ words, role-specific)

### Phase 3: Performance Optimization
- [ ] Optimize images (WebP, lazy-load)
- [ ] Implement SSG/ISR
- [ ] Minimize JavaScript on SEO pages
- [ ] Test Core Web Vitals (target: LCP < 2.5s)
- [ ] Mobile responsiveness check
- [ ] Page speed audit (Lighthouse)

### Phase 4: Launch Preparation
- [ ] Set up Google Search Console
- [ ] Verify domain ownership
- [ ] Submit sitemap
- [ ] Request indexing for priority pages
- [ ] Set up analytics tracking
- [ ] Configure SEO event tracking
- [ ] Set up monitoring alerts

### Phase 5: Post-Launch
- [ ] Monitor indexing status (weekly)
- [ ] Track organic traffic and conversions
- [ ] Review search queries (bi-weekly)
- [ ] Optimize low-performing pages (monthly)
- [ ] Expand content based on data (quarterly)

---

## Integration Requirements

### For Frontend Agent
- Implement URL routing as specified
- Use Next.js Metadata API for all SEO tags
- Add structured data scripts to page components
- Ensure CTAs are prominent on all SEO pages
- Implement related roles/skills components
- Build breadcrumb navigation component

### For Content Agent
- Follow content structure requirements (above)
- Ensure 200-300 word minimum per page
- Write 5+ FAQs per page
- Use UK English and tone
- Make content role-specific (not generic)
- Include specific examples and tips

### For Analytics Agent
- Track SEO page views by page type
- Track "Start Builder" CTA clicks from SEO pages
- Set up funnel: SEO landing → Builder → Export
- Track organic traffic sources
- Monitor Core Web Vitals
- Set up conversion goals for SEO traffic

### For QA Agent
- Validate metadata presence on all pages
- Check canonical tags are correct
- Verify sitemap includes all pages
- Test robots.txt blocks correct URLs
- Validate structured data (Google Rich Results Test)
- Check internal links are not broken
- Verify page quality meets threshold (200+ words, 5+ FAQs)

---

## Risk Mitigation

### Thin Content Risk
**Risk**: Pages indexed with insufficient content hurt overall site quality
**Mitigation**: Apply noindex until pages meet quality threshold (200+ words, 5+ FAQs)

### Duplicate Content Risk
**Risk**: Similar content across role pages triggers duplicate content penalty
**Mitigation**: Ensure each role has unique, specific content; use canonical tags; vary examples and tips

### Performance Risk
**Risk**: Heavy JavaScript or large images slow page load, hurting rankings
**Mitigation**: Use SSG/ISR, optimize images, lazy-load non-critical content, monitor Core Web Vitals

### Indexing Delay Risk
**Risk**: Pages not indexed quickly enough to generate traffic
**Mitigation**: Submit sitemap immediately, request indexing for priority pages, ensure proper internal linking

### Keyword Cannibalization Risk
**Risk**: Multiple pages compete for same keywords
**Mitigation**: Clear URL structure, distinct page purposes (template vs. example vs. summary), strategic internal linking

---

## Success Criteria

SEO strategy is successful when:

1. **Indexing**: 80%+ pages indexed within 7 days of launch
2. **Traffic**: 500+ organic visits/month by day 90
3. **Conversions**: 5%+ conversion from SEO pages to builder starts
4. **Rankings**: 10+ keywords in top 50, 5+ in top 20 (by day 90)
5. **Performance**: All pages meet Core Web Vitals (LCP < 2.5s)
6. **Quality**: 100% of pages meet quality threshold (no noindex pages by day 30)
7. **Rich Results**: 10+ pages showing FAQ rich results in search

---

## Next Steps

1. **Frontend Agent**: Implement URL routing and metadata generation
2. **Content Agent**: Write content for Phase 1 pages (20 roles, 30 skills)
3. **Analytics Agent**: Set up SEO tracking and conversion funnels
4. **QA Agent**: Create validation checklist for SEO requirements

---

**Document Status**: Complete
**Last Updated**: 2026-02-09
**Owner**: SEO/Growth Marketing Agent
**Review Cycle**: Monthly (post-launch)

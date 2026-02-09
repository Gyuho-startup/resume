# SEO Metadata Templates

This document provides standardized metadata templates for all SEO pages in the UK Resume Builder MVP. Use these templates to ensure consistent, optimized metadata across all programmatic SEO pages.

---

## General Guidelines

### Character Limits
- **Title**: 50-60 characters (optimal for display in search results)
- **Description**: 140-155 characters (optimal for display in search results)
- **H1**: 40-60 characters (clear, concise, keyword-rich)

### Best Practices
- Include primary keyword near the start of title
- Add location ("UK") for local SEO
- Include value proposition ("Free", "ATS-Friendly")
- Use action words ("Build", "View", "Learn")
- Maintain consistent brand voice (professional, helpful, UK-focused)
- Always use UK English spelling (e.g., "optimise" not "optimize")

---

## 1. Template Detail Page

**URL Pattern**: `/cv-templates/[role]/entry-level`

### Title Template
```
Entry-Level [Role] CV Template UK | ATS-Friendly | Free Builder
```

**Variables**:
- `[Role]`: Capitalize each word (e.g., "Software Developer", "Data Analyst")

**Examples**:
- `Entry-Level Software Developer CV Template UK | ATS-Friendly | Free Builder`
- `Entry-Level Data Analyst CV Template UK | ATS-Friendly | Free Builder`
- `Entry-Level Digital Marketing CV Template UK | ATS-Friendly | Free Builder`

### Description Template
```
Free ATS-friendly CV template for entry-level [role] positions in the UK. Build your professional CV in minutes with our easy-to-use builder.
```

**Variables**:
- `[role]`: Lowercase (e.g., "software developer", "data analyst")

**Examples**:
- `Free ATS-friendly CV template for entry-level software developer positions in the UK. Build your professional CV in minutes with our easy-to-use builder.`
- `Free ATS-friendly CV template for entry-level data analyst positions in the UK. Build your professional CV in minutes with our easy-to-use builder.`

### H1 Template
```
Entry-Level [Role] CV Template
```

**Example**:
- `Entry-Level Software Developer CV Template`

### Open Graph Metadata
```typescript
{
  title: "Entry-Level [Role] CV Template UK | ATS-Friendly | Free",
  description: "Free ATS-friendly CV template for entry-level [role] positions in the UK.",
  type: "website",
  locale: "en_GB",
  siteName: "UK Resume Builder",
  url: "https://yoursite.com/cv-templates/[role-slug]/entry-level",
  images: [{
    url: "/og-images/[role-slug]-template.png",
    width: 1200,
    height: 630,
    alt: "[Role] CV Template Preview"
  }]
}
```

### Twitter Card Metadata
```typescript
{
  card: "summary_large_image",
  title: "Entry-Level [Role] CV Template UK",
  description: "Free ATS-friendly CV template for entry-level [role] positions in the UK.",
  images: ["/og-images/[role-slug]-template.png"]
}
```

---

## 2. Example Page

**URL Pattern**: `/cv-example/[role]/entry-level`

### Title Template
```
Entry-Level [Role] CV Example UK | Sample Resume
```

**Examples**:
- `Entry-Level Software Developer CV Example UK | Sample Resume`
- `Entry-Level Data Analyst CV Example UK | Sample Resume`

### Description Template
```
View a real example of an entry-level [role] CV. See what employers look for and build your own using our ATS-friendly templates.
```

**Examples**:
- `View a real example of an entry-level software developer CV. See what employers look for and build your own using our ATS-friendly templates.`

### H1 Template
```
Entry-Level [Role] CV Example
```

**Example**:
- `Entry-Level Software Developer CV Example`

### Open Graph Metadata
```typescript
{
  title: "Entry-Level [Role] CV Example UK | Sample Resume",
  description: "View a real example of an entry-level [role] CV. See what UK employers look for.",
  type: "website",
  locale: "en_GB",
  siteName: "UK Resume Builder",
  url: "https://yoursite.com/cv-example/[role-slug]/entry-level",
  images: [{
    url: "/og-images/[role-slug]-example.png",
    width: 1200,
    height: 630,
    alt: "[Role] CV Example"
  }]
}
```

---

## 3. Role Summary Page

**URL Pattern**: `/cv-summary/[role]`

### Title Template
```
[Role] CV Guide UK | Entry-Level Tips & Examples
```

**Examples**:
- `Software Developer CV Guide UK | Entry-Level Tips & Examples`
- `Data Analyst CV Guide UK | Entry-Level Tips & Examples`

### Description Template
```
Complete guide to writing an entry-level [role] CV in the UK. Tips, examples, and free ATS-friendly templates to help you land interviews.
```

**Examples**:
- `Complete guide to writing an entry-level software developer CV in the UK. Tips, examples, and free ATS-friendly templates to help you land interviews.`

### H1 Template
```
[Role] CV Guide: Entry-Level Tips & Examples
```

**Example**:
- `Software Developer CV Guide: Entry-Level Tips & Examples`

### Open Graph Metadata
```typescript
{
  title: "[Role] CV Guide UK | Entry-Level Tips & Examples",
  description: "Complete guide to writing an entry-level [role] CV in the UK. Free templates and examples included.",
  type: "website",
  locale: "en_GB",
  siteName: "UK Resume Builder",
  url: "https://yoursite.com/cv-summary/[role-slug]",
  images: [{
    url: "/og-images/[role-slug]-guide.png",
    width: 1200,
    height: 630,
    alt: "[Role] CV Guide"
  }]
}
```

---

## 4. Skill Page

**URL Pattern**: `/skills/[skill]`

### Title Template
```
How to List [Skill] on Your CV UK | ATS Tips
```

**Variables**:
- `[Skill]`: Capitalize properly (e.g., "Python", "Microsoft Excel", "Project Management")

**Examples**:
- `How to List Python on Your CV UK | ATS Tips`
- `How to List Microsoft Excel on Your CV UK | ATS Tips`
- `How to List Project Management on Your CV UK | ATS Tips`

### Description Template
```
Learn how to effectively showcase [skill] on your CV for UK job applications. ATS-friendly formatting and examples included.
```

**Examples**:
- `Learn how to effectively showcase Python on your CV for UK job applications. ATS-friendly formatting and examples included.`
- `Learn how to effectively showcase communication skills on your CV for UK job applications. ATS-friendly formatting and examples included.`

### H1 Template
```
How to List [Skill] on Your CV
```

**Examples**:
- `How to List Python on Your CV`
- `How to List Communication on Your CV`

### Open Graph Metadata
```typescript
{
  title: "How to List [Skill] on Your CV UK | ATS Tips",
  description: "Learn how to effectively showcase [skill] on your CV for UK job applications.",
  type: "website",
  locale: "en_GB",
  siteName: "UK Resume Builder",
  url: "https://yoursite.com/skills/[skill-slug]",
  images: [{
    url: "/og-images/skills-[skill-slug].png",
    width: 1200,
    height: 630,
    alt: "How to List [Skill] on Your CV"
  }]
}
```

---

## 5. Template Gallery Page

**URL**: `/cv-templates`

### Title
```
Free ATS-Friendly CV Templates UK | Entry-Level Resume Builder
```

### Description
```
Choose from 5 professional, ATS-friendly CV templates designed for UK entry-level job seekers. Build your CV online for free in minutes.
```

### H1
```
Free ATS-Friendly CV Templates
```

### Open Graph Metadata
```typescript
{
  title: "Free ATS-Friendly CV Templates UK | Entry-Level Resume Builder",
  description: "Choose from 5 professional, ATS-friendly CV templates designed for UK entry-level job seekers.",
  type: "website",
  locale: "en_GB",
  siteName: "UK Resume Builder",
  url: "https://yoursite.com/cv-templates",
  images: [{
    url: "/og-images/cv-templates-gallery.png",
    width: 1200,
    height: 630,
    alt: "CV Templates Gallery"
  }]
}
```

---

## 6. Home Page

**URL**: `/`

### Title
```
Free CV Builder UK | ATS-Friendly Resume Templates for Entry-Level
```

### Description
```
Build your professional CV in minutes with our free ATS-friendly templates designed for UK entry-level job seekers. No watermark on free exports.
```

### H1
```
Build Your Professional CV in Minutes
```

### Open Graph Metadata
```typescript
{
  title: "Free CV Builder UK | ATS-Friendly Resume Templates for Entry-Level",
  description: "Build your professional CV in minutes with our free ATS-friendly templates designed for UK entry-level job seekers.",
  type: "website",
  locale: "en_GB",
  siteName: "UK Resume Builder",
  url: "https://yoursite.com",
  images: [{
    url: "/og-images/home.png",
    width: 1200,
    height: 630,
    alt: "UK Resume Builder - Free CV Builder"
  }]
}
```

---

## 7. Pricing Page

**URL**: `/pricing`

### Title
```
Pricing | Export Pass for Watermark-Free CV Downloads
```

### Description
```
Get unlimited watermark-free CV exports for 24 hours. One-off payment, no subscription. Build and download professional CVs in minutes.
```

### H1
```
Simple, Transparent Pricing
```

---

## Implementation Examples

### Next.js Metadata API (App Router)

#### Template Detail Page
```typescript
// app/cv-templates/[role]/entry-level/page.tsx
import { Metadata } from 'next'
import { getRole } from '@/lib/seo/seeds'

interface PageProps {
  params: { role: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const role = await getRole(params.role)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
  const canonicalUrl = `${baseUrl}/cv-templates/${role.slug}/entry-level`

  return {
    title: `Entry-Level ${role.name} CV Template UK | ATS-Friendly | Free Builder`,
    description: `Free ATS-friendly CV template for entry-level ${role.name.toLowerCase()} positions in the UK. Build your professional CV in minutes with our easy-to-use builder.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Entry-Level ${role.name} CV Template UK | ATS-Friendly | Free`,
      description: `Free ATS-friendly CV template for entry-level ${role.name.toLowerCase()} positions in the UK.`,
      type: 'website',
      locale: 'en_GB',
      siteName: 'UK Resume Builder',
      url: canonicalUrl,
      images: [
        {
          url: `/og-images/${role.slug}-template.png`,
          width: 1200,
          height: 630,
          alt: `${role.name} CV Template Preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Entry-Level ${role.name} CV Template UK`,
      description: `Free ATS-friendly CV template for entry-level ${role.name.toLowerCase()} positions in the UK.`,
      images: [`/og-images/${role.slug}-template.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function TemplatePage({ params }: PageProps) {
  // Page content
}
```

#### Example Page
```typescript
// app/cv-example/[role]/entry-level/page.tsx
import { Metadata } from 'next'
import { getRole } from '@/lib/seo/seeds'

interface PageProps {
  params: { role: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const role = await getRole(params.role)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
  const canonicalUrl = `${baseUrl}/cv-example/${role.slug}/entry-level`

  return {
    title: `Entry-Level ${role.name} CV Example UK | Sample Resume`,
    description: `View a real example of an entry-level ${role.name.toLowerCase()} CV. See what employers look for and build your own using our ATS-friendly templates.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Entry-Level ${role.name} CV Example UK | Sample Resume`,
      description: `View a real example of an entry-level ${role.name.toLowerCase()} CV. See what UK employers look for.`,
      type: 'website',
      locale: 'en_GB',
      siteName: 'UK Resume Builder',
      url: canonicalUrl,
      images: [
        {
          url: `/og-images/${role.slug}-example.png`,
          width: 1200,
          height: 630,
          alt: `${role.name} CV Example`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Entry-Level ${role.name} CV Example UK`,
      description: `View a real example of an entry-level ${role.name.toLowerCase()} CV.`,
      images: [`/og-images/${role.slug}-example.png`],
    },
  }
}
```

#### Skill Page
```typescript
// app/skills/[skill]/page.tsx
import { Metadata } from 'next'
import { getSkill } from '@/lib/seo/seeds'

interface PageProps {
  params: { skill: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const skill = await getSkill(params.skill)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
  const canonicalUrl = `${baseUrl}/skills/${skill.slug}`

  return {
    title: `How to List ${skill.name} on Your CV UK | ATS Tips`,
    description: `Learn how to effectively showcase ${skill.name.toLowerCase()} on your CV for UK job applications. ATS-friendly formatting and examples included.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `How to List ${skill.name} on Your CV UK | ATS Tips`,
      description: `Learn how to effectively showcase ${skill.name.toLowerCase()} on your CV for UK job applications.`,
      type: 'website',
      locale: 'en_GB',
      siteName: 'UK Resume Builder',
      url: canonicalUrl,
      images: [
        {
          url: `/og-images/skills-${skill.slug}.png`,
          width: 1200,
          height: 630,
          alt: `How to List ${skill.name} on Your CV`,
        },
      ],
    },
  }
}
```

---

## Quality Checklist

Before publishing any SEO page, verify:

- [ ] Title is 50-60 characters
- [ ] Description is 140-155 characters
- [ ] Primary keyword appears in title
- [ ] "UK" appears in title or description
- [ ] Value proposition is clear ("Free", "ATS-Friendly")
- [ ] Canonical URL is set correctly
- [ ] Open Graph tags are complete
- [ ] Twitter Card tags are present
- [ ] locale is set to "en_GB"
- [ ] robots metadata allows indexing
- [ ] Image dimensions are 1200x630 (Open Graph standard)
- [ ] Alt text is descriptive and keyword-rich

---

## A/B Testing Variations (Post-Launch)

After launch, consider testing these title variations:

### Template Detail Page Variations
- **Original**: `Entry-Level [Role] CV Template UK | ATS-Friendly | Free Builder`
- **Variation A**: `Free [Role] CV Template UK | Entry-Level | ATS-Friendly`
- **Variation B**: `[Role] CV Template for Entry-Level Jobs UK | Free & ATS-Friendly`

### Description Variations
- **Original**: `Free ATS-friendly CV template for entry-level [role] positions in the UK. Build your professional CV in minutes with our easy-to-use builder.`
- **Variation A**: `Professional [role] CV template designed for UK entry-level positions. ATS-friendly format. Build and download your CV for free in minutes.`
- **Variation B**: `Get hired faster with our free [role] CV template. ATS-friendly design for UK entry-level jobs. Build your CV in under 10 minutes.`

**Note**: Test variations only after establishing baseline performance (30+ days of data).

---

## Metadata Generation Helper Functions

```typescript
// lib/seo/metadata-helpers.ts

interface Role {
  slug: string
  name: string
}

interface Skill {
  slug: string
  name: string
}

export function generateTemplateMetadata(role: Role, baseUrl: string) {
  return {
    title: `Entry-Level ${role.name} CV Template UK | ATS-Friendly | Free Builder`,
    description: `Free ATS-friendly CV template for entry-level ${role.name.toLowerCase()} positions in the UK. Build your professional CV in minutes with our easy-to-use builder.`,
    canonicalUrl: `${baseUrl}/cv-templates/${role.slug}/entry-level`,
    ogImage: `/og-images/${role.slug}-template.png`,
  }
}

export function generateExampleMetadata(role: Role, baseUrl: string) {
  return {
    title: `Entry-Level ${role.name} CV Example UK | Sample Resume`,
    description: `View a real example of an entry-level ${role.name.toLowerCase()} CV. See what employers look for and build your own using our ATS-friendly templates.`,
    canonicalUrl: `${baseUrl}/cv-example/${role.slug}/entry-level`,
    ogImage: `/og-images/${role.slug}-example.png`,
  }
}

export function generateSummaryMetadata(role: Role, baseUrl: string) {
  return {
    title: `${role.name} CV Guide UK | Entry-Level Tips & Examples`,
    description: `Complete guide to writing an entry-level ${role.name.toLowerCase()} CV in the UK. Tips, examples, and free ATS-friendly templates to help you land interviews.`,
    canonicalUrl: `${baseUrl}/cv-summary/${role.slug}`,
    ogImage: `/og-images/${role.slug}-guide.png`,
  }
}

export function generateSkillMetadata(skill: Skill, baseUrl: string) {
  return {
    title: `How to List ${skill.name} on Your CV UK | ATS Tips`,
    description: `Learn how to effectively showcase ${skill.name.toLowerCase()} on your CV for UK job applications. ATS-friendly formatting and examples included.`,
    canonicalUrl: `${baseUrl}/skills/${skill.slug}`,
    ogImage: `/og-images/skills-${skill.slug}.png`,
  }
}
```

---

**Document Status**: Complete
**Last Updated**: 2026-02-09
**Owner**: SEO/Growth Marketing Agent
**Review Cycle**: Monthly (test variations, update based on CTR data)

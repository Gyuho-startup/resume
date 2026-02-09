# Structured Data (Schema.org JSON-LD) Templates

This document provides JSON-LD structured data templates for all SEO pages in the UK Resume Builder MVP. Structured data helps search engines understand page content and enables rich results in search.

---

## Overview

### What is Structured Data?

Structured data is code in a specific format (JSON-LD) that tells search engines about your page content. It can enable:
- **FAQ rich results** (expandable Q&A in search)
- **Breadcrumb navigation** in search results
- **Enhanced listings** for template galleries

### Implementation

Add JSON-LD scripts to the `<head>` or end of `<body>` in your Next.js pages:

```typescript
// In page component
export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    // ... schema content
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Page content */}
    </>
  )
}
```

---

## 1. BreadcrumbList Schema

Use on all pages to show breadcrumb navigation in search results.

### Template Detail Page Example

```json
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

### Example Page Breadcrumb

```json
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
      "name": "CV Examples",
      "item": "https://yoursite.com/cv-examples"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Software Developer Example",
      "item": "https://yoursite.com/cv-example/software-developer/entry-level"
    }
  ]
}
```

### Role Summary Breadcrumb

```json
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
      "name": "CV Guides",
      "item": "https://yoursite.com/cv-guides"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Software Developer CV Guide",
      "item": "https://yoursite.com/cv-summary/software-developer"
    }
  ]
}
```

### Skill Page Breadcrumb

```json
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
      "name": "Skills",
      "item": "https://yoursite.com/skills"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Python",
      "item": "https://yoursite.com/skills/python"
    }
  ]
}
```

---

## 2. FAQPage Schema

Use on Template Detail, Example, Summary, and Skill pages to enable FAQ rich results.

### Template Detail Page FAQ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is an ATS-friendly CV template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An ATS-friendly CV template uses simple formatting that Applicant Tracking Systems can easily parse. This includes single-column layouts, standard fonts (like Arial or Calibri), clear section headings, and no images or complex tables that might confuse the software."
      }
    },
    {
      "@type": "Question",
      "name": "How do I customise this software developer CV template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Click the 'Start Building' button to access our free CV builder. You'll be guided through each section with helpful prompts. Simply enter your information (education, skills, projects, experience), and the template will automatically format everything in an ATS-friendly layout."
      }
    },
    {
      "@type": "Question",
      "name": "Is this CV template free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our CV builder and templates are completely free to use. You can export a free PDF with a small watermark at the bottom. For watermark-free exports, you can purchase a 24-hour Export Pass for unlimited downloads."
      }
    },
    {
      "@type": "Question",
      "name": "What should I include in an entry-level software developer CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Include your education (degree, university, graduation date), relevant projects (personal or academic), technical skills (programming languages, frameworks, tools), any internships or work experience (even non-tech roles), and certifications. Focus on demonstrating your technical abilities through projects if you lack professional experience."
      }
    },
    {
      "@type": "Question",
      "name": "How long should an entry-level CV be in the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For entry-level positions in the UK, keep your CV to 1-2 pages maximum. One page is often sufficient if you're just starting your career. Focus on quality over quantity—include only relevant information that demonstrates your suitability for the role."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use this template for jobs outside the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, this CV template follows international best practices and is ATS-friendly globally. However, be aware that some countries prefer different formats (e.g., US resumes typically don't include photos or date of birth, which UK CVs may include). Our templates are optimised for UK job applications but work well internationally."
      }
    }
  ]
}
```

### Role Summary Page FAQ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What qualifications do I need to become an entry-level software developer in the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most entry-level software developer roles in the UK require a degree in Computer Science, Software Engineering, or a related field. However, many employers also accept candidates with coding bootcamp certificates, strong portfolios, or demonstrable self-taught skills. Focus on building practical projects to showcase your abilities."
      }
    },
    {
      "@type": "Question",
      "name": "What programming languages should I list on my software developer CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "List the languages you're most proficient in and those relevant to the job. Common languages for UK entry-level roles include Python, JavaScript, Java, C++, and SQL. Always indicate your proficiency level (e.g., 'proficient', 'working knowledge') and back it up with projects or experience."
      }
    },
    {
      "@type": "Question",
      "name": "Should I include non-tech work experience on my software developer CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, include non-tech work experience if it demonstrates transferable skills like teamwork, communication, problem-solving, or customer service. However, keep it brief and focus more on technical projects, internships, and education if you have them."
      }
    },
    {
      "@type": "Question",
      "name": "How many projects should I include on my entry-level software developer CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Include 2-4 of your best projects that demonstrate different skills. Choose projects that show problem-solving, use of modern technologies, and real-world applications. For each project, briefly describe what it does, the technologies used, and your specific contributions."
      }
    },
    {
      "@type": "Question",
      "name": "What's the average salary for entry-level software developers in the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entry-level software developers in the UK typically earn between £25,000-£35,000 per year, with London positions often at the higher end (£30,000-£40,000). Salaries vary based on location, company size, specific technologies, and your skills."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need a GitHub profile for entry-level software developer applications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "While not mandatory, a GitHub profile is highly recommended. It serves as a portfolio of your work and demonstrates your coding ability to potential employers. Include your GitHub link on your CV and ensure your repositories are well-documented with clear README files."
      }
    },
    {
      "@type": "Question",
      "name": "Should I tailor my software developer CV for each application?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, tailoring your CV increases your chances significantly. Review the job description and adjust your skills section, project descriptions, and summary to match the specific technologies and requirements mentioned. This helps you pass ATS screening and shows genuine interest."
      }
    }
  ]
}
```

### Skill Page FAQ (Example: Python)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Where should I list Python on my CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "List Python in your 'Skills' or 'Technical Skills' section, typically near the top of your CV. You can also mention it in your project descriptions and work experience where you've actually used it. Group it with other programming languages for clarity."
      }
    },
    {
      "@type": "Question",
      "name": "How do I describe my Python proficiency level on a CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use clear terms like 'Beginner', 'Intermediate', 'Proficient', or 'Advanced'. Alternatively, you can use 'Working knowledge', 'Strong understanding', or 'Expert level'. Always be honest—you may be tested during interviews. For ATS systems, simply listing 'Python' is often sufficient."
      }
    },
    {
      "@type": "Question",
      "name": "Should I list Python libraries and frameworks separately?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, list specific Python libraries and frameworks (e.g., Django, Flask, NumPy, Pandas, TensorFlow) as separate skills. This helps with ATS keyword matching and shows depth of knowledge. Format it as 'Python (Django, Pandas, NumPy)' or list them separately in your skills section."
      }
    },
    {
      "@type": "Question",
      "name": "How can I demonstrate Python skills on my CV without work experience?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Showcase Python through personal projects, GitHub repositories, coding bootcamp projects, university coursework, or online certifications (e.g., from Coursera, Udemy). Describe what you built, which Python libraries you used, and any measurable results or outcomes."
      }
    },
    {
      "@type": "Question",
      "name": "Is Python a good skill for entry-level jobs in the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Python is highly valued in the UK job market, especially for roles in software development, data analysis, machine learning, automation, and web development. It's beginner-friendly yet powerful, making it an excellent choice for entry-level candidates."
      }
    },
    {
      "@type": "Question",
      "name": "Should I include Python certifications on my CV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, include relevant Python certifications in a dedicated 'Certifications' or 'Professional Development' section. List the certification name, issuing organisation (e.g., Python Institute, Coursera), and date obtained. This adds credibility, especially for entry-level candidates."
      }
    }
  ]
}
```

---

## 3. ItemList Schema

Use on the Template Gallery page to list all available templates.

### Template Gallery ItemList

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "ATS-Friendly CV Templates for UK Entry-Level Job Seekers",
  "description": "Professional CV templates optimised for Applicant Tracking Systems, designed specifically for UK entry-level positions.",
  "numberOfItems": 5,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/education-first",
        "name": "Education-First CV Template",
        "description": "Highlights your educational background and academic achievements, ideal for recent graduates and students with limited work experience.",
        "url": "https://yoursite.com/cv-templates/education-first"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/projects-first",
        "name": "Projects-First CV Template",
        "description": "Showcases your projects and practical experience upfront, perfect for developers, designers, and technical roles.",
        "url": "https://yoursite.com/cv-templates/projects-first"
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/skills-emphasis",
        "name": "Skills-Emphasis CV Template",
        "description": "Puts your technical and soft skills front and centre, ideal for roles where specific competencies are key.",
        "url": "https://yoursite.com/cv-templates/skills-emphasis"
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/minimal-classic",
        "name": "Minimal Classic CV Template",
        "description": "Clean, traditional layout suitable for conservative industries like finance, law, and consulting.",
        "url": "https://yoursite.com/cv-templates/minimal-classic"
      }
    },
    {
      "@type": "ListItem",
      "position": 5,
      "item": {
        "@type": "WebPage",
        "@id": "https://yoursite.com/cv-templates/modern-ats",
        "name": "Modern ATS-Safe CV Template",
        "description": "Contemporary design with subtle styling that maintains full ATS compatibility and readability.",
        "url": "https://yoursite.com/cv-templates/modern-ats"
      }
    }
  ]
}
```

---

## 4. WebPage Schema

Use on all pages for general page information.

### Template Detail Page WebPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://yoursite.com/cv-templates/software-developer/entry-level",
  "name": "Entry-Level Software Developer CV Template UK",
  "description": "Free ATS-friendly CV template for entry-level software developer positions in the UK. Build your professional CV in minutes.",
  "url": "https://yoursite.com/cv-templates/software-developer/entry-level",
  "inLanguage": "en-GB",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://yoursite.com",
    "name": "UK Resume Builder",
    "url": "https://yoursite.com"
  },
  "about": {
    "@type": "Thing",
    "name": "CV Template for Software Developer"
  },
  "breadcrumb": {
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
}
```

---

## 5. Organization Schema

Use on the home page to define your website organization.

### Organization Schema (Home Page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UK Resume Builder",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "description": "Free CV builder for UK entry-level job seekers with ATS-friendly templates",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "sameAs": [
    "https://twitter.com/yourhandle",
    "https://linkedin.com/company/yourcompany"
  ]
}
```

---

## Implementation Helpers

### Next.js Component for Structured Data

```typescript
// components/seo/StructuredData.tsx
interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

### Usage in Page

```typescript
// app/cv-templates/[role]/entry-level/page.tsx
import { StructuredData } from '@/components/seo/StructuredData'
import { generateBreadcrumb, generateFAQ } from '@/lib/seo/structured-data'

export default async function TemplatePage({ params }: { params: { role: string } }) {
  const role = await getRole(params.role)
  const breadcrumb = generateBreadcrumb('template', role)
  const faq = generateFAQ('template', role)

  return (
    <>
      <StructuredData data={breadcrumb} />
      <StructuredData data={faq} />
      {/* Page content */}
    </>
  )
}
```

### Helper Functions

```typescript
// lib/seo/structured-data.ts

interface Role {
  slug: string
  name: string
}

interface Skill {
  slug: string
  name: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'

export function generateBreadcrumb(pageType: 'template' | 'example' | 'summary' | 'skill', item: Role | Skill) {
  const breadcrumbMap = {
    template: {
      parent: 'CV Templates',
      parentUrl: '/cv-templates',
      currentUrl: `/cv-templates/${item.slug}/entry-level`
    },
    example: {
      parent: 'CV Examples',
      parentUrl: '/cv-examples',
      currentUrl: `/cv-example/${item.slug}/entry-level`
    },
    summary: {
      parent: 'CV Guides',
      parentUrl: '/cv-guides',
      currentUrl: `/cv-summary/${item.slug}`
    },
    skill: {
      parent: 'Skills',
      parentUrl: '/skills',
      currentUrl: `/skills/${item.slug}`
    }
  }

  const config = breadcrumbMap[pageType]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: config.parent,
        item: `${BASE_URL}${config.parentUrl}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'name' in item ? item.name : item.slug,
        item: `${BASE_URL}${config.currentUrl}`
      }
    ]
  }
}

export function generateFAQ(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateItemList(items: Array<{ name: string; description: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ATS-Friendly CV Templates for UK Entry-Level Job Seekers',
    description: 'Professional CV templates optimised for Applicant Tracking Systems',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        '@id': `${BASE_URL}${item.url}`,
        name: item.name,
        description: item.description,
        url: `${BASE_URL}${item.url}`
      }
    }))
  }
}

export function generateWebPage(page: { name: string; description: string; url: string; breadcrumb: any }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}${page.url}`,
    name: page.name,
    description: page.description,
    url: `${BASE_URL}${page.url}`,
    inLanguage: 'en-GB',
    isPartOf: {
      '@type': 'WebSite',
      '@id': BASE_URL,
      name: 'UK Resume Builder',
      url: BASE_URL
    },
    breadcrumb: page.breadcrumb
  }
}
```

---

## Testing Structured Data

### Google Rich Results Test

1. Visit: https://search.google.com/test/rich-results
2. Enter your page URL or paste the JSON-LD code
3. Verify no errors or warnings
4. Check which rich results are eligible

### Schema.org Validator

1. Visit: https://validator.schema.org/
2. Paste your JSON-LD code
3. Verify schema is valid and complete

### Manual Checklist

- [ ] `@context` is `https://schema.org`
- [ ] `@type` is correct for the schema type
- [ ] All required properties are present
- [ ] URLs are absolute (include full domain)
- [ ] Text fields don't have HTML tags (plain text only)
- [ ] Arrays use proper JSON format
- [ ] No trailing commas
- [ ] Valid JSON syntax (use JSON validator)

---

## FAQ Content Guidelines

### Writing Effective FAQ Entries

**Question Format**:
- Start with interrogative words (What, How, Why, Should, Can)
- Be specific and conversational
- Use natural language people actually search for
- Keep questions under 100 characters

**Answer Format**:
- Provide clear, concise answers (2-4 sentences)
- Front-load the most important information
- Use plain text (no HTML in JSON-LD)
- Keep answers under 300 characters for best display
- Include specific details (numbers, examples)

**Common FAQ Topics**:
- ATS optimization
- Template customization
- What to include/exclude
- Length and format guidelines
- UK-specific advice
- Entry-level expectations
- Pricing/export options

---

## Structured Data Monitoring

### Post-Launch Tracking

**Google Search Console**:
- Navigate to "Enhancements" section
- Check for structured data errors
- Monitor rich result performance
- Track impressions and clicks for FAQ results

**Weekly Monitoring**:
- Check for new errors or warnings
- Verify rich results are appearing in search
- Monitor click-through rates on FAQ results

**Monthly Review**:
- Analyze which FAQs get the most impressions
- Update FAQ content based on performance
- Add new FAQs based on user search queries

---

## Priority Implementation Order

1. **BreadcrumbList** (all pages) - Easy win, helps navigation
2. **FAQPage** (template/summary pages) - Enables rich results
3. **ItemList** (gallery page) - Better template discovery
4. **WebPage** (all pages) - General page context
5. **Organization** (home page) - Brand definition

---

**Document Status**: Complete
**Last Updated**: 2026-02-09
**Owner**: SEO/Growth Marketing Agent
**Review Cycle**: Monthly (update FAQ content based on Search Console data)

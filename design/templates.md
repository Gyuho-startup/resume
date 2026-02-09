# ATS-Friendly CV Templates

Comprehensive specifications for 5 ATS-friendly CV templates. All templates designed for UK entry-level job seekers with emphasis on parsability, accessibility, and professional appearance.

---

## ATS Hard Rules (Non-Negotiable)

These constraints MUST be enforced across all templates:

### Layout Constraints
1. **One-column layout only** - No multi-column designs (ATS parsers read left-to-right, top-to-bottom)
2. **No tables for layout** - Tables confuse ATS parsers; use semantic HTML sections instead
3. **No text boxes or floating elements** - All content must be in document flow
4. **Standard heading order** - Use proper heading hierarchy (h1, h2, h3)

### Content Constraints
5. **No icons or images** - Text only (except for watermark overlay in free tier)
6. **No headers/footers** - All content in main body
7. **Standard section headings** - Use recognizable labels: "Education", "Work Experience", "Projects", "Skills", "Certifications"
8. **No special characters for bullets** - Use simple hyphens or asterisks, not unicode symbols

### Typography Constraints
9. **Standard fonts only** - Arial, Calibri, Georgia, Times New Roman, or other system fonts
10. **Simple font sizes** - Max 2-3 sizes (e.g., 16px body, 18px section headings, 20px name)
11. **Max 2 font weights** - Regular (400) and Bold (700) only

### Spacing Constraints
12. **Consistent margins** - 15-20mm on all sides for A4
13. **Predictable spacing** - Regular line heights and section gaps
14. **No excessive white space** - Balanced content distribution

---

## Page Specifications (All Templates)

### Page Size
- **Format**: A4 (210mm × 297mm / 8.27" × 11.69")
- **Orientation**: Portrait
- **Print margins**: 15mm minimum, 20mm recommended

### Safe Zones
- **Top margin**: 20mm
- **Bottom margin**: 20mm
- **Left margin**: 20mm
- **Right margin**: 20mm
- **Content width**: 170mm (210mm - 40mm margins)

### Typography Foundation

| Element | Font | Size | Line Height | Weight | Color |
|---------|------|------|-------------|--------|-------|
| Name (h1) | Arial | 20pt (26.67px) | 28pt | Bold (700) | #000000 |
| Section Heading (h2) | Arial | 14pt (18.67px) | 20pt | Bold (700) | #000000 |
| Subsection (h3) | Arial | 12pt (16px) | 18pt | Bold (700) | #000000 |
| Body Text | Arial | 11pt (14.67px) | 16pt | Regular (400) | #000000 |
| Meta Text (dates, locations) | Arial | 10pt (13.33px) | 14pt | Regular (400) | #333333 |

### Color Palette (Print-safe)
- **Primary text**: #000000 (pure black)
- **Secondary text**: #333333 (dark gray)
- **Section dividers**: #CCCCCC (light gray)
- **Background**: #FFFFFF (white)

**Note**: No color backgrounds or colored text for ATS safety. Print-safe grayscale only.

---

## Template 1: Education-First

### Description
Ideal for students and recent graduates with limited work experience. Highlights academic achievements, relevant coursework, and projects.

### Section Order
1. Personal Details (Name, Contact)
2. Professional Summary (2-3 lines)
3. Education (Primary section - detailed)
4. Projects (If applicable)
5. Work Experience (Optional - internships, part-time)
6. Skills (Technical + Soft)
7. Certifications / Awards (Optional)

### Layout Details

#### Personal Details (Top)
```
[Name - 20pt, Bold, Center-aligned]
[Contact Line: Email | Phone | LinkedIn | Location - 10pt, Center-aligned]
```

**Spacing**: 12pt after name, 8pt after contact line

#### Professional Summary
```
PROFESSIONAL SUMMARY [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]
[2-3 sentence summary, 11pt, Regular]
```

**Spacing**: 16pt before section, 12pt after heading, 16pt after content

#### Education (Detailed)
```
EDUCATION [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Degree Name] [12pt, Bold]
[University Name] [11pt, Regular]
[Expected Graduation / Graduation Date] · [Location] [10pt, Italic or Gray]
• Relevant Coursework: [List]
• Academic Achievements: [GPA if >3.5, honors, scholarships]
[8pt spacing between entries]

[Additional Degrees if applicable]
```

**Spacing**: 16pt before section, 12pt after heading, 8pt between degree entries, 16pt after section

#### Projects
```
PROJECTS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Project Name] [12pt, Bold]
[Technologies Used] · [Date] [10pt, Gray]
• [Achievement/outcome bullet point 1]
• [Achievement/outcome bullet point 2]
• [Achievement/outcome bullet point 3]
[8pt spacing between projects]
```

**Spacing**: 16pt before section, 12pt after heading, 8pt between projects

#### Skills
```
SKILLS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

Technical Skills: [Comma-separated list]
Soft Skills: [Comma-separated list]
Languages: [Language - Proficiency level]
```

**Spacing**: 16pt before section, 12pt after heading

### Distinguishing Features
- Education section appears before work experience
- Detailed academic information (coursework, achievements)
- Larger space allocation for education content
- Projects section prominent if work experience is minimal

---

## Template 2: Projects-First

### Description
Designed for career changers, bootcamp graduates, and self-taught individuals. Emphasizes practical projects and hands-on experience.

### Section Order
1. Personal Details
2. Professional Summary
3. Projects (Primary section - highly detailed)
4. Technical Skills
5. Work Experience (Can be non-tech roles)
6. Education
7. Certifications

### Layout Details

#### Projects Section (Primary Focus)
```
PROJECTS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Project Name] [12pt, Bold]
[Role (if team project)] · [Duration/Date] [10pt, Gray]
Technologies: [Tech stack] [11pt, Regular]
• [Impact-focused bullet - what problem did it solve?]
• [Technical achievement - what did you build/implement?]
• [Quantifiable result if possible - users, performance, etc.]
• [Link to GitHub/demo if applicable] [10pt, Gray]

[8pt spacing between projects]
[Repeat for 3-5 projects]
```

**Spacing**: 16pt before section, 12pt after heading, 12pt between projects (more than other templates)

#### Technical Skills (Prominent)
```
TECHNICAL SKILLS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

Languages: [List]
Frameworks & Libraries: [List]
Tools & Platforms: [List]
Databases: [List]
```

**Spacing**: 16pt before section, 12pt after heading, 4pt between skill categories

### Distinguishing Features
- Projects section appears first (after summary)
- Each project includes tech stack upfront
- Links to demos/GitHub encouraged
- Skills categorized for easy scanning
- Work experience de-emphasized (later in CV)

---

## Template 3: Skills-Emphasis

### Description
Best for technical roles requiring specific skill sets. Organizes skills prominently with clear categorization.

### Section Order
1. Personal Details
2. Professional Summary
3. Skills (Primary section - categorized and detailed)
4. Work Experience
5. Projects (Integrated with experience)
6. Education
7. Certifications

### Layout Details

#### Skills Section (Primary Focus)
```
SKILLS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

Programming Languages
[Skill 1] · [Skill 2] · [Skill 3] [11pt, Regular]

Frameworks & Technologies
[Framework 1] · [Framework 2] · [Framework 3]

Tools & Platforms
[Tool 1] · [Tool 2] · [Tool 3]

Soft Skills
[Skill 1] · [Skill 2] · [Skill 3]

Languages
[Language] (Proficiency) · [Language] (Proficiency)
```

**Spacing**: 16pt before section, 12pt after heading, 8pt between categories, 4pt between skill items

**Alternative Layout** (List format):
```
SKILLS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

Technical Skills
• Languages: [Comma-separated]
• Frameworks: [Comma-separated]
• Tools: [Comma-separated]

Soft Skills
• [Skill 1], [Skill 2], [Skill 3]
```

#### Work Experience (Skills-tagged)
```
WORK EXPERIENCE [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Job Title] [12pt, Bold]
[Company Name] · [Location] [11pt, Regular]
[Start Date] – [End Date] [10pt, Gray]
• [Achievement bullet with skill tag: e.g., "Developed feature using React"]
• [Achievement bullet]
• [Achievement bullet]
Skills used: [Relevant skills from skills section] [10pt, Italic]

[8pt spacing between roles]
```

**Spacing**: 16pt before section, 12pt after heading, 8pt between roles

### Distinguishing Features
- Skills section at the top (after summary)
- Skills categorized by type
- Work experience bullets reference skills
- Optional "Skills used" tag per role
- Skills-first approach for technical screening

---

## Template 4: Minimal Classic

### Description
Traditional chronological CV with clean, conservative styling. Ideal for formal industries (finance, law, consulting).

### Section Order
1. Personal Details
2. Professional Summary (Optional)
3. Work Experience
4. Education
5. Skills
6. Additional Information (Volunteer, Languages, Interests)

### Layout Details

#### Personal Details (Minimal)
```
[NAME] [20pt, Bold, Left-aligned]
[Email] | [Phone] | [LinkedIn] | [Location] [10pt, Regular, Left-aligned]
```

**Spacing**: 8pt after name, 12pt after contact line

#### Work Experience (Detailed)
```
WORK EXPERIENCE [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Job Title] [12pt, Bold]
[Company Name] · [Location] [11pt, Regular]
[Month Year] – [Month Year] [10pt, Gray]

• [Action verb] [achievement with quantifiable result]
• [Action verb] [responsibility or project outcome]
• [Action verb] [impact on team/company]

[10pt spacing between roles]
```

**Spacing**: 16pt before section, 12pt after heading, 10pt between roles, 16pt after section

#### Education
```
EDUCATION [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Degree], [Field of Study] [12pt, Bold]
[University Name] · [Location] [11pt, Regular]
[Graduation Year] [10pt, Gray]
```

**Spacing**: 16pt before section, 12pt after heading, 8pt between degrees

#### Skills (Simple List)
```
SKILLS [14pt, Bold, Left-aligned]
──────────────────────────── [1pt gray line]

[Skill 1], [Skill 2], [Skill 3], [Skill 4], [Skill 5]
```

**Spacing**: 16pt before section, 12pt after heading

### Distinguishing Features
- Minimal visual styling (no heavy lines)
- Traditional reverse-chronological order
- Concise, action-oriented bullets
- No icons, graphics, or embellishments
- Maximum focus on content, not design
- Left-aligned throughout (no centering except optional name)

---

## Template 5: Modern ATS-Safe

### Description
Contemporary design with subtle styling while maintaining ATS compatibility. Balances visual appeal with parsability.

### Section Order
1. Personal Details
2. Professional Summary
3. Work Experience
4. Skills
5. Projects
6. Education
7. Certifications

### Layout Details

#### Personal Details (Subtle Style)
```
[NAME] [20pt, Bold, Left-aligned]
[Job Title / Professional Headline] [12pt, Regular, Gray]

Email: [email] · Phone: [phone] · LinkedIn: [linkedin] · Location: [city]
[10pt, Regular]
```

**Spacing**: 4pt after name, 8pt after headline, 16pt after contact

#### Professional Summary (With Context)
```
PROFESSIONAL SUMMARY [14pt, Bold, Left-aligned]

[3-4 sentence summary highlighting: background, key strengths, career goals]
[11pt, Regular, Line height: 18pt]
```

**Spacing**: 16pt before section, 12pt after heading, 16pt after content

#### Work Experience (Achievement-focused)
```
WORK EXPERIENCE [14pt, Bold, Left-aligned]

[Company Name] · [Location] [12pt, Bold]
[Job Title] · [Employment Type] [11pt, Regular]
[Month Year] – [Month Year or Present] [10pt, Gray]

• [Achievement with metric: increased X by Y%]
• [Project outcome: delivered Z feature resulting in...]
• [Responsibility with impact: managed A leading to B]

[10pt spacing between roles]
```

**Spacing**: 16pt before section, 12pt after heading, 10pt between roles

#### Skills (Grid-style, but ATS-safe)
```
SKILLS [14pt, Bold, Left-aligned]

Technical: [Skill 1] · [Skill 2] · [Skill 3] · [Skill 4]
Tools: [Tool 1] · [Tool 2] · [Tool 3]
Soft Skills: [Skill 1] · [Skill 2] · [Skill 3]
```

**Spacing**: 16pt before section, 12pt after heading, 6pt between skill rows

### Distinguishing Features
- Professional headline under name
- Subtle use of gray for meta information
- Dot separators (·) instead of pipes (|)
- Company name before job title (modern convention)
- Achievement-focused bullets with metrics
- Clean, spacious layout with breathing room
- Subtle visual hierarchy while maintaining ATS compatibility

---

## Section Content Guidelines (All Templates)

### Personal Details
**Required Fields:**
- Full Name
- Email (professional)
- Phone (UK format: 07123 456789)
- Location (City, UK - no full address needed)

**Optional Fields:**
- LinkedIn profile
- GitHub (for technical roles)
- Portfolio website

**Character Limits:**
- Name: 50 characters
- Email: 60 characters
- Phone: 20 characters
- LinkedIn: 100 characters

### Professional Summary
**Guidelines:**
- Length: 2-4 sentences (50-100 words)
- Include: Current status (e.g., "Recent Computer Science graduate"), key skills, career goal
- Tone: Professional, confident, specific
- Avoid: Generic phrases like "hard-working team player"

**Example:**
"Recent Computer Science graduate from University of Manchester with strong foundations in full-stack development and data structures. Completed 5 academic projects using React, Node.js, and PostgreSQL. Seeking an entry-level software engineering role to apply problem-solving skills and contribute to innovative web applications."

### Work Experience Bullets
**Format:**
- Start with action verb (past tense for completed roles, present for current)
- Include specific outcome or metric when possible
- Length: 1-2 lines per bullet
- Quantity: 3-5 bullets per role

**Action Verbs (Entry-level appropriate):**
- Developed, Built, Implemented, Created, Designed
- Assisted, Supported, Contributed, Collaborated
- Analyzed, Researched, Evaluated, Tested
- Improved, Optimized, Streamlined, Enhanced
- Managed, Coordinated, Organized, Led

**Good Example:**
"Developed a customer feedback dashboard using React and Chart.js, reducing report generation time by 60%"

**Bad Example:**
"Responsible for making dashboards"

### Education
**Include:**
- Degree name and field
- University name
- Expected graduation or graduation year
- Relevant coursework (if space permits)
- Academic honors (if GPA > 3.5 or equivalent)

**Optional:**
- Dissertation/thesis title (if relevant to role)
- Notable academic projects
- Study abroad experience

### Projects
**Include:**
- Project name
- Brief description (1 line)
- Technologies used
- Your role (if team project)
- Outcome or impact
- Link to demo/GitHub (optional)

**Format:**
- 2-4 projects for entry-level
- Prioritize recent and relevant projects
- Include at least one end-to-end project

### Skills
**Categories:**
- Programming Languages
- Frameworks & Libraries
- Tools & Platforms
- Databases
- Soft Skills
- Languages (human languages)

**Guidelines:**
- Order by proficiency (strongest first)
- Only include skills you can discuss in interview
- Avoid skill ratings (bars, stars, percentages)
- Use standard names (e.g., "JavaScript" not "JS")

---

## Watermark Implementation (Free Tier)

### Watermark Specifications

**Text:** "Created with CV Builder - Remove watermark: [URL]"
**Position:** Bottom center of every page
**Font:** Arial, 9pt
**Color:** #CCCCCC (light gray)
**Opacity:** 50%
**Margin:** 10mm from bottom edge

**Technical Implementation:**
- Watermark applied as overlay during PDF rendering
- Does NOT interfere with ATS parsing (positioned in bottom margin)
- Clearly visible but not obtrusive
- Removed entirely for paid Export Pass users

**CSS for Watermark:**
```css
.watermark {
  position: fixed;
  bottom: 10mm;
  left: 0;
  right: 0;
  text-align: center;
  font-family: Arial, sans-serif;
  font-size: 9pt;
  color: #CCCCCC;
  opacity: 0.5;
  z-index: 9999;
}
```

---

## Print & PDF Optimization

### CSS for Print

**Page Setup:**
```css
@page {
  size: A4 portrait;
  margin: 20mm;
}

@media print {
  body {
    font-family: Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000000;
  }

  /* Prevent page breaks inside sections */
  section {
    page-break-inside: avoid;
  }

  /* Prevent orphaned headings */
  h1, h2, h3 {
    page-break-after: avoid;
  }

  /* Remove backgrounds for ATS */
  * {
    background: white !important;
    color: black !important;
  }

  /* Hide interactive elements */
  button, .no-print {
    display: none !important;
  }
}
```

### Font Embedding
- Use system fonts (Arial, Times New Roman, Georgia)
- If custom fonts used (e.g., Inter), ensure proper embedding
- Fallback to Arial if font fails to load

### File Size Optimization
- Target: < 500KB per PDF
- No embedded images (except watermark overlay)
- Compress PDF after generation
- Use standard PDF/A format for maximum compatibility

---

## ATS Testing Checklist

Before finalizing any template, verify:

1. **Text Extraction Test**
   - Copy-paste content from PDF
   - Verify correct order and formatting
   - Check no garbled characters

2. **Online ATS Parsers**
   - Test with free ATS scanners (e.g., Jobscan, Resume Worded)
   - Verify all sections are detected
   - Check skill extraction accuracy

3. **Screen Reader Test**
   - Use NVDA or JAWS to read PDF
   - Verify logical reading order
   - Check heading hierarchy

4. **Print Test**
   - Print to physical paper
   - Verify margins and spacing
   - Check text is readable (not too small)

5. **File Compatibility**
   - Open in Adobe Reader
   - Open in browser PDF viewer
   - Open in mobile PDF viewer

---

## Template Selection Guidance

Provide this guidance to users when selecting templates:

**Choose Education-First if:**
- You're a current student or recent graduate
- You have limited work experience
- Your degree is highly relevant to target role
- You want to highlight academic achievements

**Choose Projects-First if:**
- You're a career changer or self-taught
- You have strong portfolio projects
- Your work experience is in a different field
- You completed a bootcamp or online course

**Choose Skills-Emphasis if:**
- You're applying for technical roles
- Job description lists many specific skills
- You have diverse technical abilities
- You want to pass ATS keyword matching

**Choose Minimal Classic if:**
- You're applying to traditional industries
- You have solid work experience
- You prefer conservative, formal style
- Company culture is formal/corporate

**Choose Modern ATS-Safe if:**
- You want contemporary design
- You're applying to startups or tech companies
- You have a mix of experience and projects
- You want visual appeal without sacrificing ATS compatibility

---

**Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Ready for Development

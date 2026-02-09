# Design Handoff Document

Complete design specifications for UK Resume Builder MVP. This document provides everything the frontend team needs to implement the UI without additional design questions.

---

## Document Overview

**Project**: UK Resume Builder MVP
**Target Users**: UK Entry-level job seekers (students, graduates, career changers)
**Tech Stack**: Next.js 14, TailwindCSS, shadcn/ui, React Hook Form
**Design System Version**: 1.0
**Last Updated**: 2026-02-09

---

## Quick Reference

| Document | Purpose |
|----------|---------|
| [tokens.md](./tokens.md) | Typography, spacing, colors, shadows, breakpoints |
| [components.md](./components.md) | Component specifications with states and interactions |
| [templates.md](./templates.md) | 5 ATS-friendly CV template specifications |
| [tailwind-config.md](./tailwind-config.md) | Complete TailwindCSS configuration and utility classes |

---

## Design Principles

### 1. UK Trust & Clarity
- **Professional appearance**: Clean, calm, non-gimmicky design
- **Entry-level friendly**: Reduce anxiety, provide helpful examples
- **Trust signals**: Clear value proposition, transparent pricing, no dark patterns
- **Conservative palette**: Professional blues and grays, minimal accent colors

### 2. ATS-Safe First
- **Messaging**: Say "ATS-friendly checks" NOT "ATS guaranteed"
- **Educational approach**: Explain what ATS systems are and how they work
- **Template compliance**: All templates follow strict ATS hard rules
- **Avoid absolute claims**: No promises like "Get hired faster" or "100% success rate"

### 3. Accessibility
- **WCAG AA compliance**: Minimum 4.5:1 contrast for text
- **Keyboard navigation**: All interactive elements accessible via Tab
- **Screen readers**: Semantic HTML, proper ARIA labels
- **Touch targets**: Minimum 44px × 44px on mobile
- **Focus states**: Clear visible indicators for keyboard users

---

## Core Screens

### 1. Home Page

**Purpose**: Landing page introducing the CV builder and templates

**Layout (Desktop >= 1024px)**
```
[Header: Logo | CV Builder | Templates | Pricing | Login]
[Hero Section]
  - H1: "Create Your Professional UK CV"
  - Subheading: "ATS-friendly templates designed for entry-level job seekers"
  - CTA: "Start Building (Free)" + "View Templates"
  - Hero image/illustration
[Features Section]
  - 3-column grid
  - Icons + Heading + Description
  - Features: "ATS-friendly", "Free export", "Save & edit anytime"
[Template Preview Section]
  - Horizontal scroll of 5 template cards
  - "View all templates" CTA
[How It Works Section]
  - 3-step process with numbers
  - Steps: "Fill in details", "Choose template", "Export PDF"
[Pricing Section]
  - 2 cards: Free vs Export Pass
[CTA Section]
  - Final CTA: "Start Building Your CV"
[Footer: Links | Legal | Social]
```

**Layout (Mobile < 768px)**
- Single column, stacked sections
- Hero CTA buttons stacked vertically
- Features in single column
- Template preview cards in horizontal scroll

**Key Measurements**
- Hero section: 600px height (desktop), 400px (mobile)
- Section padding: 80px vertical (desktop), 48px (mobile)
- Container max-width: 1280px
- Horizontal spacing: 24px

**Colors**
- Background: Slate-50 (#f8fafc)
- Card backgrounds: White
- Primary CTA: Blue-600
- Secondary CTA: White with blue border

---

### 2. CV Builder Landing

**Purpose**: Detailed overview of builder features before starting

**Layout**
```
[Header]
[Hero]
  - H1: "Build Your CV in Minutes"
  - Lead text: "Free forever. No credit card required."
  - CTA: "Start Building Now"
[Feature Cards]
  - 4-column grid (desktop), stacked (mobile)
  - Features: Templates, ATS-friendly, Auto-save, Export options
[Template Showcase]
  - Grid of 5 templates with thumbnails
  - "ATS-friendly" badges
  - Preview + Select buttons
[FAQ Section]
  - Accordion component
  - Common questions about builder, export, ATS
[CTA]
  - "Ready to get started?"
  - Button: "Create Your CV"
```

---

### 3. Templates Listing

**Purpose**: Gallery view of all available CV templates

**Layout (Desktop)**
```
[Header]
[Page Title]
  - H1: "CV Templates"
  - Description: "Choose from 5 ATS-friendly templates"
[Filter/Sort Bar]
  - Dropdown: "All Templates" | "Education-first" | "Projects-first" | etc.
[Template Grid]
  - 3-column grid
  - Template card: Thumbnail + Name + Badge + "Select" button
[Info Section]
  - "What makes a template ATS-friendly?"
  - Explanation + Tips
```

**Template Card Specifications**
- Width: 320px (desktop), 100% (mobile)
- Border: 2px slate-200
- Border radius: 8px
- Padding: 16px
- Shadow: sm (hover: md)
- Thumbnail aspect ratio: 1:1.414 (A4)

---

### 4. Builder (Main Application)

**Purpose**: Multi-step form with live preview

**Layout (Desktop >= 1024px)**
```
[Header: Logo | Auto-save indicator | Save & Exit]
[Main Container: Split View]
  [Left Panel: 40% width]
    [Stepper Component]
      - Progress bar
      - Section labels
      - Navigation buttons
    [Form Content]
      - Section-specific form fields
      - Add/remove buttons for multi-entry
      - Validation messages
    [Bottom Navigation]
      - Previous + Next buttons
  [Right Panel: 60% width]
    [Preview Header]
      - Template switcher dropdown
      - Zoom controls (optional)
    [Preview Content]
      - A4 preview (scaled to fit)
      - Live-updating content
      - Watermark indicator (if free)
```

**Layout (Mobile < 768px)**
```
[Header: Logo | Tab Navigation]
[Tab Bar: "Edit" | "Preview"]
[Content Area]
  If "Edit" tab active:
    - Stepper (condensed)
    - Form fields
    - Navigation buttons
  If "Preview" tab active:
    - Template switcher
    - Full-width preview
    - Back to Edit button
```

**Key Interactions**
- Form auto-save: Debounce 2 seconds after last input
- Preview update: Debounce 500ms after form change
- Template switch: Instant update, preserve all data
- Section navigation: Validate current section before proceeding

**States**
- Saving: Toast notification "Saving changes..."
- Saved: Indicator in header "Saved just now"
- Error: Toast notification "Save failed, retrying..."
- Loading: Skeleton preview while rendering

---

### 5. Export Modal (Paywall)

**Purpose**: Prompt user to choose free (watermark) or paid export

**Modal Specifications**
- Max width: 480px
- Padding: 32px
- Border radius: 16px
- Shadow: 2xl
- Backdrop: Slate-900 with 50% opacity + blur

**Layout**
```
[Close Button: top-right]
[Icon: Lock or Sparkle (blue-500, 48px)]
[Title: "Export Your CV"]
[Description]
  "Choose your export option"

[Option 1: Free Export]
  - Icon: Document with watermark indicator
  - Title: "Free Export"
  - Features:
    • Watermarked PDF
    • Standard quality
    • No account needed
  - Button: "Export Free" (secondary style)

[Option 2: Export Pass]
  - Icon: Sparkle
  - Badge: "Most Popular"
  - Title: "Export Pass"
  - Subtitle: "£4.99 for 24 hours"
  - Features:
    • Unlimited exports
    • No watermark
    • High quality PDF
    • Download history (if logged in)
  - Button: "Get Export Pass" (primary style)

[Footer Text]
  "All CVs are ATS-friendly"
```

**Behavior**
- Triggered: On "Export" button click (if no active pass)
- Dismiss: Click backdrop, press Escape, or complete action
- Animation: Fade in (300ms) with scale effect
- Focus trap: Tab navigation stays within modal

---

### 6. Login Modal/Page

**Purpose**: Allow users to log in or sign up

**Modal Layout**
```
[Close Button]
[Title: "Log in to save your CV"]
[Description]
  "Save your progress and access your CVs from any device"

[Email Magic Link Section]
  - Label: "Email"
  - Input field
  - Button: "Send magic link"
  - Helper text: "We'll email you a link to log in"

[Divider: "or"]

[OAuth Section]
  - Button: "Continue with Google"
  - Google icon + text

[Footer]
  "By continuing, you agree to our Terms and Privacy Policy"
```

**States**
- Default: Form ready
- Sending: Button shows spinner "Sending..."
- Sent: Success message "Check your email for the login link"
- Error: Error message "Failed to send. Please try again."

---

### 7. Dashboard

**Purpose**: List of saved CVs for logged-in users

**Layout**
```
[Header]
[Page Title]
  - H1: "Your CVs"
  - Button: "+ Create New CV"

[CV List]
  If empty:
    [Empty State]
      - Icon: Document with plus
      - Text: "Create your first CV"
      - Button: "+ Create CV"

  If has CVs:
    [Grid: 3 columns desktop, 1 column mobile]
      [CV Card]
        - Thumbnail preview
        - Title (editable inline)
        - Last edited: "2 hours ago"
        - Actions: Edit | Duplicate | Delete
```

**CV Card Specifications**
- Width: 280px (desktop), 100% (mobile)
- Thumbnail: A4 aspect ratio, max 200px height
- Border: 1px slate-200
- Hover: Shadow-md, scale-102

---

### 8. Downloads Page

**Purpose**: Export history for logged-in users with active pass

**Layout**
```
[Header]
[Page Title]
  - H1: "Downloads"
  - Badge: "Export Pass Active (18 hours left)" or "No active pass"

[Export List]
  [Table or Card List]
    - CV Name
    - Template Used
    - Export Date
    - File Size
    - Download Button
    - Delete Button

[Empty State]
  - Text: "No exports yet"
  - Subtext: "Your exported CVs will appear here"
```

---

## Component States

### Button States

**Primary Button (Blue)**
- Default: bg-blue-600, text-white
- Hover: bg-blue-700
- Active: bg-blue-800
- Focus: ring-2 ring-blue-500 ring-offset-2
- Disabled: bg-slate-300, text-slate-500, opacity-40

**Secondary Button (Outline)**
- Default: border-2 border-slate-300, text-slate-700
- Hover: bg-slate-50, border-slate-400
- Active: bg-slate-100
- Focus: ring-2 ring-slate-500 ring-offset-2
- Disabled: border-slate-200, text-slate-400, opacity-40

**Ghost Button (Text)**
- Default: text-blue-600
- Hover: bg-blue-50
- Active: bg-blue-100
- Focus: ring-2 ring-blue-500 ring-offset-2
- Disabled: text-slate-400, opacity-40

### Input States

**Text Input**
- Default: border-slate-300, bg-white
- Focus: border-blue-500, ring-2 ring-blue-500
- Error: border-red-500, bg-red-50
- Disabled: bg-slate-100, text-slate-400
- Filled & Valid: border-green-500 (optional subtle indicator)

**Placeholder Text**
- Color: slate-400
- Examples provided for each field

### Form Validation

**Validation Rules**
- Email: Must be valid format
- Phone: Optional, but if provided must match UK format
- Required fields: Marked with red asterisk
- Character limits: Enforced with counter

**Error Display**
- Inline: Below field, red text (14px)
- Toast: For form-wide errors
- Summary: At top of form section (if multiple errors)

**Success Feedback**
- Toast: "Section completed"
- Checkmark: In stepper for completed sections
- Auto-save: "Saved just now" in header

---

## Loading & Empty States

### Skeleton Screens

**Dashboard Loading**
```
[3 CV Card Skeletons]
  - Rectangle: 280px × 200px (thumbnail)
  - Line: 60% width, 20px height (title)
  - Line: 40% width, 16px height (date)
```

**Preview Loading**
```
[A4 Container]
  - Multiple skeleton lines
  - Varying widths (60%, 80%, 40%)
  - Animate: Pulse effect
```

### Empty States

**Dashboard (No CVs)**
- Icon: Document with plus (slate-300, 80px)
- Title: "Create Your First CV" (20px, bold)
- Description: "Get started with a professional, ATS-friendly CV template"
- CTA: "+ Create CV" (primary button)

**Downloads (No Exports)**
- Icon: Download (slate-300, 64px)
- Title: "No Exports Yet"
- Description: "Your exported CVs will appear here"
- No CTA (passive state)

### Error States

**General Error**
- Icon: Alert triangle (red-500, 64px)
- Title: "Something went wrong"
- Description: "We're working to fix this. Please try again."
- Actions: "Try Again" (primary) + "Go Home" (secondary)

**Network Error**
- Icon: WiFi off (slate-400, 64px)
- Title: "Connection lost"
- Description: "Check your internet connection and try again."
- Actions: "Retry" (primary)

**404 Not Found**
- Icon: Search (slate-400, 80px)
- Title: "Page Not Found"
- Description: "The page you're looking for doesn't exist."
- Actions: "Go Home" (primary)

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Single column, stacked, tabs for builder |
| Tablet | 768px - 1024px | Adaptive columns, compact spacing |
| Desktop | >= 1024px | Full split-view, multi-column grids |

### Mobile-Specific Patterns

**Navigation**
- Hamburger menu for main nav
- Bottom nav bar for builder (optional)
- Sticky header with shadow on scroll

**Form Fields**
- Full width inputs
- Larger touch targets (44px min height)
- Input type="email" for email keyboard
- Input type="tel" for phone keyboard

**Modals**
- Full-screen on mobile
- Slide up animation
- Close button top-left

**Preview**
- Tab-based navigation (Edit | Preview)
- Full width preview
- Pinch to zoom (optional enhancement)

### Tablet Adaptations

**Builder**
- Collapsible preview panel (drawer)
- Toggle button to show/hide preview
- Form remains full width when preview hidden

**Template Gallery**
- 2-column grid
- Horizontal scroll as fallback

---

## Animation & Transitions

### Transition Durations

| Element | Duration | Easing |
|---------|----------|--------|
| Button hover | 150ms | ease-out |
| Input focus | 200ms | ease-in-out |
| Modal open/close | 300ms | ease-out |
| Toast in/out | 200ms / 150ms | ease-out / ease-in |
| Page transition | 200ms | ease-in-out |

### Micro-interactions

**Button Click**
- Scale: 0.98 (press effect)
- Duration: 100ms

**Card Hover**
- Shadow: sm → md
- Scale: 1.02
- Duration: 200ms

**Toggle/Checkbox**
- Background color fade: 200ms
- Checkmark slide in: 150ms

**Progress Bar Fill**
- Width change: 300ms ease-in-out
- Color transition: 200ms

---

## Typography Usage

### Heading Hierarchy

```
H1 (Page Title)
  - Desktop: 36px (2.25rem) / 40px line-height
  - Mobile: 30px (1.875rem) / 36px line-height
  - Weight: Bold (700)
  - Color: Slate-900
  - Use: Once per page, main page title

H2 (Section Title)
  - Desktop: 24px (1.5rem) / 32px line-height
  - Mobile: 24px / 32px
  - Weight: Bold (700)
  - Color: Slate-900
  - Use: Major sections

H3 (Subsection)
  - Size: 20px (1.25rem) / 28px line-height
  - Weight: Semibold (600)
  - Color: Slate-900
  - Use: Card titles, sub-sections

Body Large (Lead Text)
  - Size: 18px (1.125rem) / 28px line-height
  - Weight: Normal (400)
  - Color: Slate-700
  - Use: Hero subheadings, intro paragraphs

Body (Default)
  - Size: 16px (1rem) / 24px line-height
  - Weight: Normal (400)
  - Color: Slate-700
  - Use: Body text, form labels

Body Small (Meta Text)
  - Size: 14px (0.875rem) / 20px line-height
  - Weight: Normal (400)
  - Color: Slate-600
  - Use: Helper text, captions, dates
```

### Text Color Palette

| Usage | Color Token | Hex | When to Use |
|-------|-------------|-----|-------------|
| Primary text | slate-900 | #0f172a | Headings, important text |
| Body text | slate-700 | #334155 | Body paragraphs, descriptions |
| Secondary text | slate-600 | #475569 | Labels, less important text |
| Muted text | slate-500 | #64748b | Helper text, meta info |
| Placeholder | slate-400 | #94a3b8 | Input placeholders, disabled text |
| Links | blue-600 | #2563eb | Hyperlinks (default) |
| Links (hover) | blue-700 | #1d4ed8 | Hyperlinks (hover state) |
| Error text | red-600 | #dc2626 | Error messages |
| Success text | green-600 | #16a34a | Success messages |

---

## Accessibility Implementation

### Focus Management

**Visible Focus Indicators**
- Ring width: 2px
- Ring color: blue-500
- Ring offset: 2px
- Classes: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

**Focus Trap in Modals**
- First focusable element receives focus on open
- Tab cycles through modal elements only
- Escape key closes modal

**Skip Links**
- Hidden by default
- Visible on focus
- Link: "Skip to main content"
- Position: Top-left, absolute

### ARIA Labels

**Form Inputs**
```html
<label for="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-helper"
  aria-required="true"
  aria-invalid={hasError}
/>
<p id="email-helper">We'll only use this to send your CV</p>
{hasError && <p role="alert">Please enter a valid email</p>}
```

**Buttons**
```html
<button aria-label="Close modal">
  <XIcon aria-hidden="true" />
</button>

<button>
  <span aria-hidden="true">+</span>
  <span>Create CV</span>
</button>
```

**Loading States**
```html
<div role="status" aria-live="polite">
  <span className="sr-only">Loading...</span>
  <SpinnerIcon aria-hidden="true" />
</div>
```

### Keyboard Navigation

**Essential Shortcuts**
- Tab: Next element
- Shift + Tab: Previous element
- Enter: Activate button/link
- Space: Activate button, toggle checkbox
- Escape: Close modal/dropdown
- Arrow keys: Navigate within list/menu

**Custom Interactive Elements**
- All clickable elements must be keyboard accessible
- Use button or link tags (not div with onClick)
- Provide visible focus states
- Support Enter and Space for activation

---

## Content Guidelines

### Tone of Voice

**Characteristics**
- Professional but friendly
- Clear and concise
- Helpful and educational
- Confident without being pushy
- UK English spelling and terminology

**Examples**

**Good**:
- "Build your CV in minutes"
- "ATS-friendly templates"
- "Choose a template that fits your background"
- "We'll help you create a professional CV"

**Bad**:
- "Create an AWESOME resume!!!"
- "Guaranteed to get you hired"
- "Beat the ATS system"
- "Land your dream job now!"

### Placeholder Examples

**Form Field Placeholders** (Entry-level appropriate)
- Name: "John Smith"
- Email: "john.smith@email.com"
- Phone: "07123 456789"
- Location: "London, UK"
- LinkedIn: "linkedin.com/in/johnsmith"
- Summary: "Recent graduate with a passion for..."
- Job Title: "Junior Software Developer"
- Company: "Tech Company Ltd"
- Degree: "BSc Computer Science"
- University: "University of Manchester"
- Project Name: "E-commerce Web App"
- Skills: "JavaScript, React, Node.js"

### Helper Text

**Purpose**: Reduce anxiety, provide context, give examples

**Examples**
- Email: "We'll only use this to send your CV"
- Phone: "Optional. UK format: 07123 456789"
- LinkedIn: "Optional but recommended for job applications"
- Summary: "2-3 sentences about your background and career goals"
- Experience bullets: "Start with action verbs: Built, Developed, Managed"
- Skills: "List your strongest skills first"

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install and configure TailwindCSS
- [ ] Set up CSS variables (globals.css)
- [ ] Configure font loading (Inter + Fira Code)
- [ ] Implement base button components
- [ ] Implement form input components
- [ ] Set up shadcn/ui components

### Phase 2: Core Components
- [ ] Stepper component
- [ ] Form blocks with validation
- [ ] Preview frame (split view + mobile tabs)
- [ ] Template cards
- [ ] Toast notifications
- [ ] Modal base component

### Phase 3: Layouts
- [ ] Header/navigation
- [ ] Footer
- [ ] Page layouts (home, builder, dashboard)
- [ ] Responsive breakpoints
- [ ] Mobile menu

### Phase 4: States
- [ ] Loading states (skeletons)
- [ ] Empty states
- [ ] Error states
- [ ] Success feedback

### Phase 5: Accessibility
- [ ] Focus management
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Contrast ratio validation

### Phase 6: Polish
- [ ] Animations and transitions
- [ ] Micro-interactions
- [ ] Print styles for CV templates
- [ ] Performance optimization

---

## Design Assets Delivery

### File Structure
```
design/
  tokens.md           - Design tokens reference
  components.md       - Component specifications
  templates.md        - CV template specifications
  tailwind-config.md  - TailwindCSS configuration
  design-handoff.md   - This file
  assets/             - Design assets (if applicable)
    icons/
    illustrations/
    template-thumbnails/
```

### Figma Handoff (If Applicable)
- Design file link: [To be added]
- Dev Mode enabled: Yes
- Inspect specifications
- Export assets (SVG for icons, PNG for thumbnails)
- Auto-layout specs documented

---

## Questions & Clarifications

If you need clarification on any design decision:

1. **Check the documentation first**
   - tokens.md for spacing/colors
   - components.md for component details
   - templates.md for CV templates

2. **Common questions answered**
   - Q: "What about dark mode?" A: Not in MVP scope
   - Q: "Mobile navigation pattern?" A: Hamburger menu
   - Q: "Animation library?" A: Use TailwindCSS transitions, framer-motion for complex animations
   - Q: "Icon library?" A: Lucide React (recommended for shadcn/ui)
   - Q: "Form validation library?" A: React Hook Form + Zod

3. **For new questions**
   - Document your decision in a design-decisions.md file
   - Share with team for alignment
   - Update this handoff document as needed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-09 | Initial design system and handoff |

---

**Design System Status**: ✅ Complete and Ready for Development

All design tokens, component specifications, and template requirements are documented and ready for frontend implementation. No blocking design decisions remain.

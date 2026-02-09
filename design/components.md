# Component Specifications

Comprehensive component library for UK Resume Builder MVP. All components designed for accessibility, trust, and entry-level user clarity.

---

## 1. Stepper Component

### Purpose
Guide users through the CV building process with clear progress indication and section navigation.

### Structure
```
[Progress Bar]
[Section Label] [Status Icons]
[Navigation Buttons]
```

### Anatomy

#### Progress Bar
- **Visual**: Horizontal bar with filled/unfilled segments
- **Mobile**: Condensed numeric indicator (e.g., "Step 2 of 6")
- **Desktop**: Full progress bar with section labels

#### Section Labels
1. Personal Details
2. Education
3. Work Experience (Optional)
4. Projects
5. Skills
6. Review

#### States
- **Current**: Blue background, white text, bold
- **Completed**: Green checkmark icon, slate text
- **Upcoming**: Gray background, muted text
- **Optional**: "(Optional)" suffix in smaller text

### Specifications

| Element | Mobile | Desktop |
|---------|--------|---------|
| Height | 60px | 80px |
| Padding | 16px | 24px |
| Background | White with shadow-sm | White with shadow-md |
| Border | Bottom: 1px solid slate-200 | Bottom: 1px solid slate-200 |

#### Progress Indicator (Mobile)
- Font: text-sm, font-semibold
- Color: slate-700
- Format: "Step {current} of {total}"

#### Progress Bar (Desktop)
- Height: 4px
- Background: slate-200
- Fill: blue-500
- Transition: width 300ms ease-in-out

#### Section Labels (Desktop)
- Font: text-sm, font-medium
- Spacing: Distributed evenly across bar
- Current: text-blue-600, bold
- Completed: text-slate-700
- Upcoming: text-slate-400

### Navigation Buttons

| Button | Style | Position | Behavior |
|--------|-------|----------|----------|
| Previous | Secondary (outline) | Left | Navigate to previous section, disabled on first step |
| Next | Primary (solid blue) | Right | Validate current section, navigate forward |
| Save & Exit | Ghost (text only) | Top-right | Save progress, return to dashboard (logged-in only) |

### Interactions
- **Keyboard**: Tab navigation, Enter to proceed
- **Click section label**: Navigate to that section (if already completed)
- **Auto-save**: Debounced save after 2s of inactivity (logged-in users)

### Example States

#### Desktop HTML Structure
```html
<div class="stepper-container bg-white shadow-md border-b border-slate-200">
  <div class="max-w-4xl mx-auto px-6 py-6">
    <!-- Progress bar -->
    <div class="h-1 bg-slate-200 rounded-full mb-6">
      <div class="h-1 bg-blue-500 rounded-full transition-all duration-300" style="width: 33%"></div>
    </div>

    <!-- Section labels -->
    <div class="flex justify-between mb-6">
      <button class="step-label completed">Personal</button>
      <button class="step-label current">Education</button>
      <button class="step-label upcoming">Experience</button>
      <button class="step-label upcoming">Projects</button>
      <button class="step-label upcoming">Skills</button>
      <button class="step-label upcoming">Review</button>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between">
      <button class="btn-secondary">Previous</button>
      <button class="btn-primary">Next: Work Experience</button>
    </div>
  </div>
</div>
```

---

## 2. Form Blocks

### Purpose
Consistent, accessible form inputs with helper text and validation for entry-level users.

### Base Structure
```
[Label] [Optional Badge]
[Input Field]
[Helper Text / Error Message]
[Character Count] (for text areas)
```

### Text Input Specification

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Height | 44px | `h-11` |
| Padding | 12px 16px | `px-4 py-3` |
| Font | 16px / 24px | `text-base` |
| Border | 1px solid slate-300 | `border border-slate-300` |
| Border Radius | 6px | `rounded-md` |
| Background | White | `bg-white` |

#### States

**Default**
- Border: slate-300
- Background: white
- Text: slate-900

**Focus**
- Border: blue-500 (2px)
- Ring: 2px blue-500 with 2px offset
- Classes: `focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

**Error**
- Border: red-500
- Background: red-50
- Classes: `border-red-500 bg-red-50`

**Disabled**
- Background: slate-100
- Text: slate-400
- Cursor: not-allowed
- Classes: `bg-slate-100 text-slate-400 cursor-not-allowed`

### Label Specification

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Font | 14px, font-medium | `text-sm font-medium` |
| Color | slate-700 | `text-slate-700` |
| Margin Bottom | 8px | `mb-2` |

**Optional Badge**
- Display: Inline, after label text
- Font: 12px, normal weight
- Color: slate-500
- Format: "(Optional)"
- Classes: `text-xs font-normal text-slate-500`

### Helper Text

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Font | 14px | `text-sm` |
| Color | slate-600 | `text-slate-600` |
| Margin Top | 6px | `mt-1.5` |

**Example Helper Texts** (Entry-friendly)
- Email: "We'll only use this to send your CV"
- Phone: "UK format: 07123 456789"
- LinkedIn: "Optional: e.g., linkedin.com/in/yourname"
- Summary: "2-3 sentences about your background and goals"

### Error Message

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Font | 14px | `text-sm` |
| Color | red-600 | `text-red-600` |
| Margin Top | 6px | `mt-1.5` |

### Text Area Specification

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Min Height | 120px | `min-h-[120px]` |
| Padding | 12px 16px | `px-4 py-3` |
| Resize | Vertical only | `resize-y` |

**Character Count**
- Position: Bottom-right, inside field
- Font: 12px
- Color: slate-500
- Format: "{current} / {max}"
- Classes: `text-xs text-slate-500`

### Multi-Entry Component (e.g., Projects)

**Add Button**
- Style: Ghost button with plus icon
- Text: "+ Add another project"
- Color: blue-600
- Classes: `text-blue-600 hover:text-blue-700 font-medium`

**Remove Button**
- Style: Ghost button with X icon
- Position: Top-right of entry
- Color: slate-400 hover red-500
- Classes: `text-slate-400 hover:text-red-500`

### Example HTML: Text Input with Helper

```html
<div class="form-field">
  <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    placeholder="your.email@example.com"
    class="w-full h-11 px-4 py-3 text-base border border-slate-300 rounded-md
           focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
           placeholder:text-slate-400"
  />
  <p class="mt-1.5 text-sm text-slate-600">
    We'll only use this to send your CV
  </p>
</div>
```

---

## 3. Preview Frame

### Purpose
Live, real-time preview of the CV as users fill in the form.

### Desktop Layout (>= 1024px)

**Split View**
- Form: 40% width (left panel)
- Preview: 60% width (right panel)
- Separator: 1px slate-200 border
- Sticky positioning for preview panel

**Preview Panel Specifications**
- Background: slate-50
- Padding: 32px
- Min Height: 100vh
- Shadow: inner shadow for depth

**Preview Content**
- A4 aspect ratio container
- Background: White
- Shadow: lg (floating effect)
- Scale: Fit to container (max 100%)
- Border: 1px slate-200

**Template Switcher**
- Position: Top of preview panel
- Style: Dropdown select
- Width: Full width of preview
- Margin Bottom: 24px

### Mobile Layout (< 768px)

**Tab Navigation**
- Tabs: "Edit" and "Preview"
- Active tab: Blue underline, bold text
- Inactive tab: Slate text, normal weight
- Tab container: Fixed to top, white background with shadow

**Tab Specifications**

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Height | 48px | `h-12` |
| Background | White | `bg-white` |
| Border Bottom | 1px slate-200 | `border-b border-slate-200` |
| Active Tab | Blue-600, bold, 2px bottom border | `text-blue-600 font-semibold border-b-2 border-blue-600` |
| Inactive Tab | Slate-600, normal | `text-slate-600 font-normal` |

**Preview Mode (Mobile)**
- Full width container
- Background: White
- Padding: 16px
- A4 preview scaled to fit mobile width

### Template Switcher Dropdown

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Height | 44px | `h-11` |
| Border | 1px slate-300 | `border border-slate-300` |
| Border Radius | 6px | `rounded-md` |
| Padding | 12px 16px | `px-4 py-3` |

**Dropdown Option**
- Template thumbnail (small preview)
- Template name
- "ATS-friendly" badge
- Current selection checkmark

### Live Update Behavior
- Debounce: 500ms after last keystroke
- Loading indicator: Subtle pulse on preview during update
- No full page refresh
- Preserve scroll position in preview

---

## 4. Template Cards

### Purpose
Display available CV templates in gallery or selection views.

### Card Specifications

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Width | 280px (desktop), 100% (mobile) | `w-full md:w-[280px]` |
| Border | 2px slate-200 (default), 2px blue-500 (selected) | `border-2 border-slate-200` |
| Border Radius | 8px | `rounded-lg` |
| Padding | 16px | `p-4` |
| Background | White | `bg-white` |
| Cursor | Pointer | `cursor-pointer` |
| Transition | All 200ms | `transition-all duration-200` |

### Anatomy

**Thumbnail**
- Aspect ratio: A4 (1:1.414)
- Width: 100% of card
- Border: 1px slate-200
- Border Radius: 4px
- Background: Slate-50 (placeholder)

**Template Name**
- Font: 16px, font-semibold
- Color: slate-900
- Margin Top: 12px

**ATS Badge**
- Background: emerald-100
- Text: emerald-700, 12px, font-medium
- Padding: 4px 8px
- Border Radius: full
- Margin Top: 8px
- Text: "ATS-friendly"

**Selection Indicator**
- Checkmark icon: blue-500
- Position: Top-right corner of card
- Size: 20px
- Background circle: white with shadow

### States

**Default**
- Border: slate-200
- Shadow: sm
- Hover: shadow-md, scale-105

**Selected**
- Border: blue-500 (2px)
- Shadow: md
- Background: blue-50

**Hover (not selected)**
- Border: slate-300
- Shadow: md
- Transform: scale(1.02)

### Example HTML

```html
<button class="template-card w-full md:w-[280px] p-4 bg-white border-2 border-slate-200
               rounded-lg shadow-sm hover:shadow-md hover:border-slate-300
               transition-all duration-200 cursor-pointer">
  <!-- Thumbnail -->
  <div class="aspect-[1/1.414] bg-slate-50 border border-slate-200 rounded">
    <img src="/templates/education-first-thumb.png" alt="Education-first template" class="w-full h-full object-cover" />
  </div>

  <!-- Name -->
  <h3 class="text-base font-semibold text-slate-900 mt-3">Education-first</h3>

  <!-- Badge -->
  <span class="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
    ATS-friendly
  </span>
</button>
```

---

## 5. Pricing Cards

### Purpose
Compare Free vs Paid Export Pass options.

### Card Specifications

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Width | 320px (desktop), 100% (mobile) | `w-full lg:w-80` |
| Padding | 24px | `p-6` |
| Border | 2px slate-200 (free), 2px blue-500 (paid) | `border-2` |
| Border Radius | 12px | `rounded-xl` |
| Background | White | `bg-white` |
| Shadow | md | `shadow-md` |

### Free Tier Card

**Header**
- Title: "Free Export"
- Font: 20px, font-bold
- Color: slate-900

**Price**
- Text: "£0"
- Font: 36px, font-bold
- Color: slate-900

**Features List**
- Icon: Checkmark (green-500) or X (slate-300)
- Font: 14px
- Color: slate-700
- Spacing: 12px between items

**Features**
- Watermarked PDF
- No account needed
- Standard quality
- Single download

**CTA Button**
- Text: "Export Free CV"
- Style: Secondary (outline)
- Width: Full

### Paid Tier Card

**Header**
- Title: "Export Pass"
- Badge: "24 hours" (blue-100 background, blue-700 text)
- Font: 20px, font-bold
- Color: slate-900

**Price**
- Text: "£4.99"
- Font: 36px, font-bold
- Color: blue-600
- Suffix: "one-off" (14px, slate-600)

**Features List**
- Unlimited exports (24h)
- No watermark
- High quality PDF
- Download history (if logged in)

**CTA Button**
- Text: "Get Export Pass"
- Style: Primary (solid blue)
- Width: Full

**Popular Badge** (Optional)
- Position: Top-right corner, overlapping card
- Background: blue-500
- Text: "Popular" (white, 12px, font-semibold)
- Padding: 4px 12px
- Border Radius: full

### Example HTML: Paid Card

```html
<div class="pricing-card w-full lg:w-80 p-6 bg-white border-2 border-blue-500 rounded-xl shadow-md relative">
  <!-- Popular badge -->
  <span class="absolute -top-3 right-4 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
    Popular
  </span>

  <!-- Header -->
  <div class="mb-4">
    <h3 class="text-xl font-bold text-slate-900">Export Pass</h3>
    <span class="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
      Valid 24 hours
    </span>
  </div>

  <!-- Price -->
  <div class="mb-6">
    <span class="text-4xl font-bold text-blue-600">£4.99</span>
    <span class="text-sm text-slate-600 ml-2">one-off</span>
  </div>

  <!-- Features -->
  <ul class="space-y-3 mb-6">
    <li class="flex items-start text-sm text-slate-700">
      <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor"><!-- checkmark --></svg>
      Unlimited exports for 24 hours
    </li>
    <li class="flex items-start text-sm text-slate-700">
      <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor"><!-- checkmark --></svg>
      No watermark
    </li>
    <li class="flex items-start text-sm text-slate-700">
      <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor"><!-- checkmark --></svg>
      High quality PDF
    </li>
  </ul>

  <!-- CTA -->
  <button class="w-full h-11 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
    Get Export Pass
  </button>
</div>
```

---

## 6. Paywall Modal

### Purpose
Prompt users to upgrade when attempting to export without an active pass.

### Modal Specifications

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Max Width | 480px | `max-w-md` |
| Padding | 32px | `p-8` |
| Border Radius | 16px | `rounded-2xl` |
| Background | White | `bg-white` |
| Shadow | 2xl | `shadow-2xl` |

**Backdrop**
- Background: rgba(15, 23, 42, 0.5) (slate-900 with 50% opacity)
- Blur: backdrop-blur-sm
- Z-index: 40

### Modal Anatomy

**Header**
- Icon: Lock or sparkle (blue-500)
- Title: "Unlock Your CV"
- Font: 24px, font-bold
- Color: slate-900

**Description**
- Text: "Get unlimited exports for 24 hours with no watermark"
- Font: 16px
- Color: slate-600
- Margin: 16px top and bottom

**Benefits List**
- Same as pricing card paid features
- Icons: Checkmarks (green-500)
- Font: 14px
- Spacing: 12px between items

**Price Display**
- Text: "£4.99 for 24 hours"
- Font: 20px, font-semibold
- Color: blue-600
- Background: blue-50
- Padding: 12px
- Border Radius: 8px

**Action Buttons**
- Primary: "Get Export Pass" (blue, solid)
- Secondary: "Continue with Watermark" (slate, outline)
- Spacing: 12px between buttons
- Width: Full

**Close Button**
- Position: Top-right corner
- Icon: X (slate-400)
- Size: 24px
- Hover: slate-600

### Modal Behavior
- Triggered: On export click when no active pass
- Close: Click backdrop, press Escape, click close button, or complete action
- Animation: Fade in + scale (300ms ease-out)
- Trap focus: Tab navigation stays within modal

---

## 7. Toast Notifications

### Purpose
Provide feedback for user actions (save, export, errors).

### Toast Specifications

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Max Width | 360px | `max-w-sm` |
| Padding | 16px | `p-4` |
| Border Radius | 8px | `rounded-lg` |
| Shadow | lg | `shadow-lg` |
| Position | Top-right (desktop), top-center (mobile) | Fixed positioning |

### Toast Types

#### Success
- Background: white
- Border Left: 4px solid green-500
- Icon: Checkmark (green-500)
- Text Color: slate-900

#### Error
- Background: white
- Border Left: 4px solid red-500
- Icon: Alert circle (red-500)
- Text Color: slate-900

#### Info
- Background: white
- Border Left: 4px solid blue-500
- Icon: Info circle (blue-500)
- Text Color: slate-900

#### Loading
- Background: white
- Border Left: 4px solid slate-400
- Icon: Spinner animation (slate-500)
- Text Color: slate-900

### Toast Anatomy

**Icon** (Left)
- Size: 20px
- Margin Right: 12px

**Content**
- Title: font-medium, 14px
- Description: font-normal, 14px (optional)

**Close Button** (Right)
- Icon: X (slate-400)
- Size: 16px
- Hover: slate-600

### Auto-dismiss
- Success: 3 seconds
- Error: 5 seconds
- Info: 4 seconds
- Loading: Manual dismiss only

### Animation
- Entry: Slide down + fade in (200ms)
- Exit: Fade out (150ms)
- Position: Stack vertically with 8px gap

### Example Messages

**Success**
- "CV saved successfully"
- "Export ready for download"
- "Changes saved"

**Error**
- "Save failed, retrying..."
- "Export failed. Please try again"
- "Network error. Check your connection"

**Info**
- "Exporting your CV..."
- "Saving changes..."

---

## 8. Empty/Error/Loading States

### Empty State (Dashboard)

**Specifications**
- Container: Centered, max-width 400px
- Padding: 64px vertical, 32px horizontal
- Text Align: Center

**Anatomy**
- Illustration: Simple icon or minimal graphic (slate-300)
- Size: 80px × 80px
- Margin Bottom: 24px

**Title**
- Text: "Create Your First CV"
- Font: 20px, font-bold
- Color: slate-900

**Description**
- Text: "Get started with a professional, ATS-friendly CV template"
- Font: 16px
- Color: slate-600
- Margin: 12px top and bottom

**CTA Button**
- Text: "+ Create CV"
- Style: Primary (solid blue)
- Icon: Plus icon
- Width: Auto (min 180px)

### Error State (General)

**Specifications**
- Container: Centered, max-width 480px
- Padding: 80px vertical, 32px horizontal

**Anatomy**
- Icon: Alert triangle (red-500)
- Size: 64px
- Margin Bottom: 24px

**Title**
- Text: "Something went wrong"
- Font: 24px, font-bold
- Color: slate-900

**Description**
- Text: Error message or generic "We're working on it"
- Font: 16px
- Color: slate-600
- Margin: 16px top and bottom

**Action Buttons**
- Primary: "Try Again" (blue, solid)
- Secondary: "Go Home" (slate, outline)
- Spacing: 12px between buttons

### Loading State (Skeleton)

**Skeleton Box Specifications**
- Background: slate-200
- Border Radius: 4px
- Animation: Pulse (1.5s infinite)

**Common Skeletons**

**Card Skeleton**
```
[Skeleton Rectangle: 280px × 200px]
[Skeleton Line: 60%, height 20px]
[Skeleton Line: 40%, height 16px]
```

**List Item Skeleton**
```
[Skeleton Circle: 40px] [Skeleton Lines: 2 lines, varying width]
```

**Full Page Loading**
- Spinner: 40px diameter, blue-500, centered
- Text: "Loading..." (slate-600, 16px)
- Background: white or transparent

---

## 9. Button System

### Button Sizes

| Size | Height | Padding | Font Size | Tailwind |
|------|--------|---------|-----------|----------|
| Small | 36px | 12px 16px | 14px | `h-9 px-4 text-sm` |
| Medium | 44px | 14px 20px | 16px | `h-11 px-5 text-base` |
| Large | 52px | 16px 24px | 16px | `h-13 px-6 text-base` |

### Button Variants

#### Primary (Solid Blue)
- Background: blue-600
- Text: white
- Hover: blue-700
- Active: blue-800
- Focus: ring-2 ring-blue-500 ring-offset-2
- Disabled: bg-slate-300, text-slate-500

#### Secondary (Outline)
- Background: transparent
- Border: 2px solid slate-300
- Text: slate-700
- Hover: bg-slate-50, border-slate-400
- Active: bg-slate-100
- Focus: ring-2 ring-slate-500 ring-offset-2

#### Ghost (Text Only)
- Background: transparent
- Text: blue-600
- Hover: bg-blue-50
- Active: bg-blue-100
- No border

#### Destructive (Red)
- Background: red-600
- Text: white
- Hover: red-700
- Active: red-800
- Used for delete actions

### Icon Buttons
- Size: 40px × 40px (square)
- Icon: 20px
- Padding: 10px
- Border Radius: 6px (md)

---

## 10. Accessibility Checklist

All components must meet:
- WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Focus indicators (visible ring, 3:1 contrast)
- Screen reader labels (aria-label, aria-describedby)
- Touch targets (min 44px × 44px on mobile)
- Error announcements (aria-live regions for dynamic content)

---

**Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Ready for Development

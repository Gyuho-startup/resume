# TailwindCSS Configuration

Complete TailwindCSS configuration for UK Resume Builder MVP. This file provides exact implementation details for integrating design tokens with TailwindCSS and shadcn/ui.

---

## Base Configuration

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px / 16px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px / 20px
        base: ['1rem', { lineHeight: '1.5rem' }],       // 16px / 24px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px / 28px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px / 28px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px / 32px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px / 40px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      },
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '11': '2.75rem',    // 44px (button height)
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
      },
      height: {
        '11': '2.75rem',    // 44px (standard button/input height)
        '13': '3.25rem',    // 52px (large button height)
      },
      maxWidth: {
        'screen-2xl': '1536px',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-out-to-top': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-100%)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-out-to-bottom': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.15s ease-in',
        'slide-in-top': 'slide-in-from-top 0.3s ease-out',
        'slide-out-top': 'slide-out-to-top 0.3s ease-in',
        'slide-in-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-out-bottom': 'slide-out-to-bottom 0.3s ease-in',
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
```

---

## CSS Variables (app/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background & Foreground */
    --background: 0 0% 100%;           /* White */
    --foreground: 222.2 84% 4.9%;      /* Slate-900 */

    /* Card */
    --card: 0 0% 100%;                 /* White */
    --card-foreground: 222.2 84% 4.9%; /* Slate-900 */

    /* Popover */
    --popover: 0 0% 100%;              /* White */
    --popover-foreground: 222.2 84% 4.9%; /* Slate-900 */

    /* Primary (Blue) */
    --primary: 217.2 91.2% 59.8%;      /* Blue-500 */
    --primary-foreground: 0 0% 100%;   /* White */

    /* Secondary (Slate) */
    --secondary: 210 40% 96.1%;        /* Slate-100 */
    --secondary-foreground: 222.2 47.4% 11.2%; /* Slate-900 */

    /* Muted */
    --muted: 210 40% 96.1%;            /* Slate-100 */
    --muted-foreground: 215.4 16.3% 46.9%; /* Slate-500 */

    /* Accent */
    --accent: 210 40% 96.1%;           /* Slate-100 */
    --accent-foreground: 222.2 47.4% 11.2%; /* Slate-900 */

    /* Destructive (Error) */
    --destructive: 0 84.2% 60.2%;      /* Red-500 */
    --destructive-foreground: 0 0% 100%; /* White */

    /* Border */
    --border: 214.3 31.8% 91.4%;       /* Slate-200 */
    --input: 214.3 31.8% 91.4%;        /* Slate-200 */

    /* Ring (Focus) */
    --ring: 217.2 91.2% 59.8%;         /* Blue-500 */

    /* Radius */
    --radius: 0.5rem;                  /* 8px */

    /* Font */
    --font-inter: 'Inter', sans-serif;
    --font-fira-code: 'Fira Code', monospace;
  }

  /* Dark mode (future implementation) */
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

---

## Custom Utility Classes

```css
@layer components {
  /* Button Base */
  .btn {
    @apply inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-200;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
    @apply disabled:pointer-events-none disabled:opacity-40;
  }

  /* Button Sizes */
  .btn-sm {
    @apply h-9 px-4 text-sm;
  }

  .btn-md {
    @apply h-11 px-5 text-base;
  }

  .btn-lg {
    @apply h-13 px-6 text-base;
  }

  /* Button Variants */
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800;
  }

  .btn-secondary {
    @apply bg-transparent border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100;
  }

  .btn-ghost {
    @apply bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100;
  }

  .btn-destructive {
    @apply bg-red-600 text-white hover:bg-red-700 active:bg-red-800;
  }

  /* Form Elements */
  .input {
    @apply w-full h-11 px-4 py-3 text-base bg-white border border-slate-300 rounded-md;
    @apply placeholder:text-slate-400;
    @apply focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
    @apply disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed;
  }

  .input-error {
    @apply border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500;
  }

  .textarea {
    @apply input min-h-[120px] resize-y;
  }

  .label {
    @apply block text-sm font-medium text-slate-700 mb-2;
  }

  .helper-text {
    @apply mt-1.5 text-sm text-slate-600;
  }

  .error-text {
    @apply mt-1.5 text-sm text-red-600;
  }

  /* Card Components */
  .card {
    @apply bg-white border border-slate-200 rounded-lg shadow-sm p-6;
  }

  .card-hover {
    @apply card transition-all duration-200 hover:shadow-md hover:border-slate-300;
  }

  /* Section Containers */
  .section {
    @apply py-12 md:py-16 lg:py-20;
  }

  .container-narrow {
    @apply container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .container-wide {
    @apply container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  /* Typography */
  .heading-1 {
    @apply text-3xl md:text-4xl font-bold text-slate-900 tracking-tight;
  }

  .heading-2 {
    @apply text-2xl md:text-3xl font-bold text-slate-900 tracking-tight;
  }

  .heading-3 {
    @apply text-xl md:text-2xl font-semibold text-slate-900;
  }

  .body-large {
    @apply text-lg text-slate-700 leading-relaxed;
  }

  .body {
    @apply text-base text-slate-700 leading-normal;
  }

  .body-small {
    @apply text-sm text-slate-600;
  }

  /* Badge */
  .badge {
    @apply inline-flex items-center px-2 py-1 text-xs font-medium rounded-full;
  }

  .badge-success {
    @apply badge bg-emerald-100 text-emerald-700;
  }

  .badge-warning {
    @apply badge bg-amber-100 text-amber-700;
  }

  .badge-error {
    @apply badge bg-red-100 text-red-700;
  }

  .badge-info {
    @apply badge bg-blue-100 text-blue-700;
  }

  /* Skeleton Loaders */
  .skeleton {
    @apply bg-slate-200 rounded animate-pulse;
  }

  .skeleton-text {
    @apply skeleton h-4;
  }

  .skeleton-heading {
    @apply skeleton h-8;
  }

  .skeleton-avatar {
    @apply skeleton w-10 h-10 rounded-full;
  }
}
```

---

## Responsive Utilities

### Breakpoint Usage Examples

```jsx
// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>

// Hide/show based on screen size
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>

// Builder layout
<div className="flex flex-col lg:flex-row">
  <div className="w-full lg:w-2/5">{/* Form */}</div>
  <div className="w-full lg:w-3/5">{/* Preview */}</div>
</div>
```

---

## Component Class Patterns

### Stepper
```jsx
<div className="bg-white shadow-md border-b border-slate-200">
  <div className="max-w-4xl mx-auto px-6 py-6">
    {/* Progress bar */}
    <div className="h-1 bg-slate-200 rounded-full mb-6">
      <div className="h-1 bg-blue-500 rounded-full transition-all duration-300"
           style={{ width: '33%' }} />
    </div>

    {/* Navigation */}
    <div className="flex justify-between">
      <button className="btn btn-secondary btn-md">Previous</button>
      <button className="btn btn-primary btn-md">Next</button>
    </div>
  </div>
</div>
```

### Template Card
```jsx
<button className="w-full md:w-[280px] p-4 bg-white border-2 border-slate-200
                   rounded-lg shadow-sm hover:shadow-md hover:border-slate-300
                   transition-all duration-200 cursor-pointer">
  <div className="aspect-[1/1.414] bg-slate-50 border border-slate-200 rounded">
    {/* Thumbnail */}
  </div>
  <h3 className="text-base font-semibold text-slate-900 mt-3">Template Name</h3>
  <span className="badge badge-success mt-2">ATS-friendly</span>
</button>
```

### Toast Notification
```jsx
<div className="fixed top-4 right-4 z-60 max-w-sm">
  <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4">
    <div className="flex items-start">
      <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">CV saved successfully</p>
      </div>
      <button className="ml-4 text-slate-400 hover:text-slate-600">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
```

### Form Field
```jsx
<div className="space-y-2">
  <label htmlFor="email" className="label">Email Address</label>
  <input
    type="email"
    id="email"
    className="input"
    placeholder="your.email@example.com"
  />
  <p className="helper-text">We'll only use this to send your CV</p>
</div>

{/* With Error State */}
<div className="space-y-2">
  <label htmlFor="email" className="label">Email Address</label>
  <input
    type="email"
    id="email"
    className="input input-error"
    placeholder="your.email@example.com"
  />
  <p className="error-text">Please enter a valid email address</p>
</div>
```

---

## Print Styles for CV Templates

```css
@layer base {
  @media print {
    @page {
      size: A4 portrait;
      margin: 20mm;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000000;
      background: white;
    }

    /* Hide UI elements */
    header, footer, nav, .no-print, button {
      display: none !important;
    }

    /* Prevent page breaks */
    section, .resume-section {
      page-break-inside: avoid;
    }

    h1, h2, h3 {
      page-break-after: avoid;
    }

    /* Override backgrounds for ATS */
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }

    /* Watermark for free tier */
    .watermark {
      position: fixed;
      bottom: 10mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9pt;
      color: #CCCCCC;
      opacity: 0.5;
    }
  }
}
```

---

## Font Configuration (app/layout.tsx)

```typescript
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const firaCode = localFont({
  src: [
    {
      path: '../public/fonts/FiraCode-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/FiraCode-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-fira-code',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

---

## Accessibility Classes

```css
@layer utilities {
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Focus visible (keyboard navigation) */
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
  }

  /* Skip to main content link */
  .skip-to-main {
    @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4;
    @apply z-50 bg-white px-4 py-2 rounded-md shadow-lg;
    @apply text-blue-600 font-semibold focus-visible-ring;
  }
}
```

---

## Usage Examples

### Page Layout
```jsx
<main className="min-h-screen bg-slate-50">
  <section className="section">
    <div className="container-narrow">
      <h1 className="heading-1 mb-6">Create Your CV</h1>
      <p className="body-large mb-8">
        Build a professional, ATS-friendly CV in minutes
      </p>
    </div>
  </section>
</main>
```

### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {templates.map(template => (
    <TemplateCard key={template.id} {...template} />
  ))}
</div>
```

### Split View (Builder)
```jsx
<div className="flex flex-col lg:flex-row min-h-screen">
  {/* Form Panel */}
  <div className="w-full lg:w-2/5 bg-white p-6 overflow-y-auto">
    <BuilderForm />
  </div>

  {/* Preview Panel */}
  <div className="w-full lg:w-3/5 bg-slate-50 p-8 overflow-y-auto lg:sticky lg:top-0 lg:h-screen">
    <CVPreview />
  </div>
</div>
```

---

## Performance Optimization

### Purge Configuration
TailwindCSS will automatically purge unused styles in production. Ensure all dynamic classes are safelisted:

```typescript
// tailwind.config.ts
module.exports = {
  // ...
  safelist: [
    // Dynamic progress widths
    { pattern: /^w-\[(\d+)%\]$/ },
    // Dynamic colors for badges
    'bg-emerald-100', 'text-emerald-700',
    'bg-blue-100', 'text-blue-700',
    'bg-amber-100', 'text-amber-700',
    'bg-red-100', 'text-red-700',
  ],
}
```

---

**Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Ready for Development

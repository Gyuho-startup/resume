# Design Tokens

Design tokens for UK Resume Builder MVP. All values are optimized for TailwindCSS + shadcn/ui integration.

## Typography Scale

### Font Families
- **Sans**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Mono**: "Fira Code", Consolas, Monaco, "Courier New", monospace

### Font Sizes & Line Heights

| Token | Size | Line Height | Usage | Tailwind Class |
|-------|------|-------------|-------|----------------|
| xs | 12px | 16px | Caption, metadata | `text-xs` |
| sm | 14px | 20px | Helper text, labels | `text-sm` |
| base | 16px | 24px | Body text, inputs | `text-base` |
| lg | 18px | 28px | Large body, lead text | `text-lg` |
| xl | 20px | 28px | Section headings | `text-xl` |
| 2xl | 24px | 32px | Page headings | `text-2xl` |
| 3xl | 30px | 36px | Hero headings (mobile) | `text-3xl` |
| 4xl | 36px | 40px | Hero headings (desktop) | `text-4xl` |

### Font Weights

| Token | Weight | Usage | Tailwind Class |
|-------|--------|-------|----------------|
| normal | 400 | Body text | `font-normal` |
| medium | 500 | Labels, emphasis | `font-medium` |
| semibold | 600 | Buttons, nav links | `font-semibold` |
| bold | 700 | Headings, important text | `font-bold` |

### Letter Spacing

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|----------------|
| tight | -0.025em | Headings | `tracking-tight` |
| normal | 0em | Body text | `tracking-normal` |
| wide | 0.025em | All caps text | `tracking-wide` |

## Spacing Scale

| Token | Value | Tailwind Class | Usage Examples |
|-------|-------|----------------|----------------|
| 0.5 | 2px | `space-0.5`, `p-0.5`, `m-0.5` | Fine adjustments |
| 1 | 4px | `space-1`, `p-1`, `m-1` | Tight spacing |
| 2 | 8px | `space-2`, `p-2`, `m-2` | Small gaps |
| 3 | 12px | `space-3`, `p-3`, `m-3` | Form field spacing |
| 4 | 16px | `space-4`, `p-4`, `m-4` | Card padding, button padding |
| 5 | 20px | `space-5`, `p-5`, `m-5` | Medium spacing |
| 6 | 24px | `space-6`, `p-6`, `m-6` | Section spacing |
| 8 | 32px | `space-8`, `p-8`, `m-8` | Large gaps |
| 10 | 40px | `space-10`, `p-10`, `m-10` | XL spacing |
| 12 | 48px | `space-12`, `p-12`, `m-12` | 2XL spacing |
| 16 | 64px | `space-16`, `p-16`, `m-16` | Hero padding |
| 20 | 80px | `space-20`, `p-20`, `m-20` | Section dividers |

## Color Palette

### Brand Colors

| Token | Hex | RGB | Usage | Tailwind Class |
|-------|-----|-----|-------|----------------|
| Primary-50 | #eff6ff | 239, 246, 255 | Lightest blue background | `bg-blue-50` |
| Primary-100 | #dbeafe | 219, 234, 254 | Light hover states | `bg-blue-100` |
| Primary-500 | #3b82f6 | 59, 130, 246 | Primary actions | `bg-blue-500` |
| Primary-600 | #2563eb | 37, 99, 235 | Primary hover | `bg-blue-600` |
| Primary-700 | #1d4ed8 | 29, 78, 216 | Primary pressed | `bg-blue-700` |

### Neutral Colors

| Token | Hex | RGB | Usage | Tailwind Class |
|-------|-----|-----|-------|----------------|
| Slate-50 | #f8fafc | 248, 250, 252 | Page background | `bg-slate-50` |
| Slate-100 | #f1f5f9 | 241, 245, 249 | Card background | `bg-slate-100` |
| Slate-200 | #e2e8f0 | 226, 232, 240 | Border default | `border-slate-200` |
| Slate-300 | #cbd5e1 | 203, 213, 225 | Border hover | `border-slate-300` |
| Slate-400 | #94a3b8 | 148, 163, 184 | Placeholder text | `text-slate-400` |
| Slate-500 | #64748b | 100, 116, 139 | Muted text | `text-slate-500` |
| Slate-600 | #475569 | 71, 85, 105 | Secondary text | `text-slate-600` |
| Slate-700 | #334155 | 51, 65, 85 | Body text | `text-slate-700` |
| Slate-900 | #0f172a | 15, 23, 42 | Headings, dark text | `text-slate-900` |
| White | #ffffff | 255, 255, 255 | White backgrounds | `bg-white` |

### Semantic Colors

#### Success (Green)
| Token | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| Success-50 | #f0fdf4 | Background | `bg-green-50` |
| Success-100 | #dcfce7 | Light state | `bg-green-100` |
| Success-500 | #22c55e | Success icons, badges | `bg-green-500` |
| Success-600 | #16a34a | Success buttons | `bg-green-600` |
| Success-700 | #15803d | Success pressed | `bg-green-700` |

#### Error (Red)
| Token | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| Error-50 | #fef2f2 | Error background | `bg-red-50` |
| Error-100 | #fee2e2 | Light error state | `bg-red-100` |
| Error-500 | #ef4444 | Error text, icons | `text-red-500` |
| Error-600 | #dc2626 | Error buttons | `bg-red-600` |
| Error-700 | #b91c1c | Error pressed | `bg-red-700` |

#### Warning (Amber)
| Token | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| Warning-50 | #fffbeb | Warning background | `bg-amber-50` |
| Warning-100 | #fef3c7 | Light warning | `bg-amber-100` |
| Warning-500 | #f59e0b | Warning icons | `text-amber-500` |
| Warning-600 | #d97706 | Warning buttons | `bg-amber-600` |

#### Info (Sky)
| Token | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| Info-50 | #f0f9ff | Info background | `bg-sky-50` |
| Info-100 | #e0f2fe | Light info | `bg-sky-100` |
| Info-500 | #0ea5e9 | Info icons | `text-sky-500` |
| Info-600 | #0284c7 | Info buttons | `bg-sky-600` |

### Special Purpose Colors

| Token | Hex | Usage | Tailwind Class |
|-------|-----|-----|----------------|
| Watermark | #94a3b8 | Free PDF watermark overlay | `text-slate-400` with opacity |
| Focus-ring | #3b82f6 | Keyboard focus outline | `ring-blue-500` |
| ATS-badge | #10b981 | "ATS-friendly" badge | `bg-emerald-500` |

## Border Radius

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|----------------|
| none | 0px | Sharp corners | `rounded-none` |
| sm | 2px | Small elements | `rounded-sm` |
| base | 4px | Default (buttons, inputs) | `rounded` |
| md | 6px | Cards, panels | `rounded-md` |
| lg | 8px | Modals, large cards | `rounded-lg` |
| xl | 12px | Hero cards | `rounded-xl` |
| 2xl | 16px | Feature blocks | `rounded-2xl` |
| full | 9999px | Pills, badges | `rounded-full` |

## Shadows

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|----------------|
| xs | 0 1px 2px 0 rgba(0,0,0,0.05) | Subtle lift | `shadow-xs` |
| sm | 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1) | Small cards | `shadow-sm` |
| base | 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1) | Default cards | `shadow` |
| md | 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) | Elevated cards | `shadow-md` |
| lg | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) | Modals, dropdowns | `shadow-lg` |
| xl | 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) | Overlays | `shadow-xl` |
| 2xl | 0 25px 50px -12px rgba(0,0,0,0.25) | Large modals | `shadow-2xl` |
| none | none | Remove shadow | `shadow-none` |

## Responsive Breakpoints

| Breakpoint | Min Width | Usage | Tailwind Prefix |
|------------|-----------|-------|-----------------|
| xs | - | Mobile (default) | No prefix |
| sm | 640px | Large mobile | `sm:` |
| md | 768px | Tablet | `md:` |
| lg | 1024px | Desktop | `lg:` |
| xl | 1280px | Wide desktop | `xl:` |
| 2xl | 1536px | Ultra-wide | `2xl:` |

### Application-Specific Breakpoints

- **Mobile**: < 768px
  - Single column layout
  - Stacked stepper
  - Tab-based preview (Edit / Preview tabs)
  - Full-width modals
  - Touch-optimized controls (min 44px targets)

- **Tablet**: 768px - 1024px
  - Adaptive two-column where appropriate
  - Stepper with compact labels
  - Preview panel in drawer or toggle
  - Larger touch targets

- **Desktop**: >= 1024px
  - Full split-view builder (40% form, 60% preview)
  - Inline stepper with full labels
  - Side-by-side preview
  - Hover states active

## Z-Index Scale

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|----------------|
| base | 0 | Default | `z-0` |
| dropdown | 10 | Dropdowns | `z-10` |
| sticky | 20 | Sticky headers | `z-20` |
| fixed | 30 | Fixed elements | `z-30` |
| modal-backdrop | 40 | Modal overlays | `z-40` |
| modal | 50 | Modal content | `z-50` |
| toast | 60 | Toast notifications | `z-60` |

## Transitions

| Token | Duration | Easing | Usage | Tailwind Class |
|-------|----------|--------|-------|----------------|
| fast | 150ms | ease-out | Hover states | `transition duration-150` |
| base | 200ms | ease-in-out | Default | `transition duration-200` |
| slow | 300ms | ease-in-out | Modals, drawers | `transition duration-300` |

## Opacity Scale

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|----------------|
| disabled | 0.4 | Disabled elements | `opacity-40` |
| muted | 0.6 | Muted text/icons | `opacity-60` |
| hover | 0.8 | Hover overlays | `opacity-80` |
| full | 1.0 | Default | `opacity-100` |

## Accessibility Notes

### Contrast Ratios (WCAG AA)
- **Normal text** (< 18px): Minimum 4.5:1
  - Slate-700 on White: 7.5:1 (Pass)
  - Slate-600 on White: 5.9:1 (Pass)
  - Slate-500 on White: 4.6:1 (Pass)
  - Blue-600 on White: 5.4:1 (Pass)

- **Large text** (>= 18px): Minimum 3:1
  - Slate-500 on White: 4.6:1 (Pass)
  - Blue-500 on White: 3.7:1 (Pass)

### Focus States
- All interactive elements must have visible focus ring
- Default: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Focus rings must have 3:1 contrast against background

### Touch Targets
- Minimum size: 44px × 44px (mobile)
- Desktop can use 40px × 40px minimum
- Spacing between targets: minimum 8px

---

## Implementation Notes for Developers

1. **TailwindCSS Setup**: These tokens align with Tailwind's default scale. Custom values are minimal.

2. **shadcn/ui Integration**: Use shadcn's CSS variable system for color theming. Map our semantic colors to their variable names.

3. **Dark Mode**: Not required for MVP. Design system is light-mode only.

4. **Print Styles**: CV templates require separate print-optimized tokens (see templates.md).

5. **Font Loading**: Use `next/font` to optimize Inter font loading. Include weights: 400, 500, 600, 700.

---

**Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Ready for Development

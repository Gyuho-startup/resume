import type { Template, TemplateSlug } from '@/types/resume';

/**
 * Available CV templates
 * Synced with Supabase templates table (seeds/templates.sql)
 */
export const TEMPLATES: Template[] = [
  {
    id: '1', // Will be replaced by actual UUIDs from Supabase
    name: 'Education-First',
    slug: 'education-first',
    description: 'Ideal for recent graduates. Highlights education and academic achievements at the top.',
    isAtsSafe: true,
  },
  {
    id: '2',
    name: 'Projects-First',
    slug: 'projects-first',
    description: 'Perfect for entry-level candidates with strong project portfolios. Showcases projects before experience.',
    isAtsSafe: true,
  },
  {
    id: '3',
    name: 'Skills-Emphasis',
    slug: 'skills-emphasis',
    description: 'Emphasizes technical and soft skills. Great for candidates with diverse skill sets.',
    isAtsSafe: true,
  },
  {
    id: '4',
    name: 'Minimal Classic',
    slug: 'minimal-classic',
    description: 'Traditional chronological layout. Clean and professional for any industry.',
    isAtsSafe: true,
  },
  {
    id: '5',
    name: 'Modern ATS-Safe',
    slug: 'modern-ats-safe',
    description: 'Contemporary design with subtle styling while maintaining ATS compatibility.',
    isAtsSafe: true,
  },
  {
    id: '6',
    name: 'Navy Executive',
    slug: 'navy-executive',
    description: 'Dark navy accents for a corporate, senior professional look.',
    isAtsSafe: true,
  },
  {
    id: '7',
    name: 'Two-Tone Header',
    slug: 'two-tone-header',
    description: 'Dark banner header with clean white body. Bold first impression.',
    isAtsSafe: true,
  },
  {
    id: '8',
    name: 'Green Accent',
    slug: 'green-accent',
    description: 'Fresh green accents. Great for sustainability, healthcare, and creative sectors.',
    isAtsSafe: true,
  },
  {
    id: '9',
    name: 'Burgundy Classic',
    slug: 'burgundy-classic',
    description: 'Rich burgundy tones for law, finance, and traditional professional roles.',
    isAtsSafe: true,
  },
  {
    id: '10',
    name: 'Compact Dense',
    slug: 'compact-dense',
    description: 'Fits maximum content on one page. Ideal for experienced candidates.',
    isAtsSafe: true,
  },
  {
    id: '11',
    name: 'Centered Formal',
    slug: 'centered-formal',
    description: 'Symmetrical centred layout. Elegant and formal for senior applications.',
    isAtsSafe: true,
  },
  {
    id: '12',
    name: 'Timeline Style',
    slug: 'timeline-style',
    description: 'Flowing vertical timeline layout. Clear chronological progression.',
    isAtsSafe: true,
  },
  {
    id: '13',
    name: 'Tech Focused',
    slug: 'tech-focused',
    description: 'Developer-optimised. Skills and projects front and centre.',
    isAtsSafe: true,
  },
  {
    id: '14',
    name: 'Academic CV',
    slug: 'academic-cv',
    description: 'Traditional academic format. Education and research prominently featured.',
    isAtsSafe: true,
  },
  {
    id: '15',
    name: 'Warm Professional',
    slug: 'warm-professional',
    description: 'Amber and warm tones for hospitality, marketing, and people-facing roles.',
    isAtsSafe: true,
  },
  {
    id: '16',
    name: 'Blue Stripe',
    slug: 'blue-stripe',
    description: 'Continuous blue left-stripe accent for visual consistency.',
    isAtsSafe: true,
  },
  {
    id: '17',
    name: 'Sharp Geometric',
    slug: 'sharp-geometric',
    description: 'Bold dark section headers with high contrast. Modern and striking.',
    isAtsSafe: true,
  },
  {
    id: '18',
    name: 'Clean Serif',
    slug: 'clean-serif',
    description: 'Serif typography for a refined, classical feel. Suits consulting and academia.',
    isAtsSafe: true,
  },
  {
    id: '19',
    name: 'Entry Level Friendly',
    slug: 'entry-level-friendly',
    description: 'Profile summary prominent. Optimised for graduates with no experience.',
    isAtsSafe: true,
  },
  {
    id: '20',
    name: 'Creative Minimal',
    slug: 'creative-minimal',
    description: 'Maximum whitespace, understated section labels. For creative industries.',
    isAtsSafe: true,
  },
];

export function getTemplateBySlug(slug: TemplateSlug): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getDefaultTemplate(): Template {
  return TEMPLATES[0]; // Education-First
}

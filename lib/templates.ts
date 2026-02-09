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
];

export function getTemplateBySlug(slug: TemplateSlug): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getDefaultTemplate(): Template {
  return TEMPLATES[0]; // Education-First
}

import type { ResumeSectionKey } from '@/types/resume';

export const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  'summary',
  'education',
  'experience',
  'projects',
  'skills',
  'certifications',
];

export const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  summary: 'Professional Summary',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  certifications: 'Certifications',
};

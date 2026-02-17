// Resume data structure for UK Resume Builder MVP
// Based on DB schema (resumes.data JSONB field)

export interface ResumePersonal {
  name: string;
  email: string;
  phone: string;
  city: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format or "Present"
  grade?: string; // e.g., "First Class Honours", "2:1"
  achievements?: string[];
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format or "Present"
  current: boolean;
  responsibilities: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  highlights: string[]; // CHANGED: was "description: string" - now array of bullet points for HR quality
  technologies: string[];
  url?: string;
  startDate?: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
  languages?: { name: string; proficiency: string }[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string; // YYYY-MM format
  url?: string;
}

// Sections that can be reordered by the user (personal is always the header)
export type ResumeSectionKey =
  | 'summary'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications';

export interface ResumeData {
  personal: ResumePersonal;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  certifications?: ResumeCertification[];
  summary?: string;
  sectionOrder?: ResumeSectionKey[]; // Stored in JSONB for persistence
}

// Template selection
export type TemplateSlug =
  | 'education-first'
  | 'projects-first'
  | 'skills-emphasis'
  | 'minimal-classic'
  | 'modern-ats-safe'
  | 'navy-executive'
  | 'two-tone-header'
  | 'green-accent'
  | 'burgundy-classic'
  | 'compact-dense'
  | 'centered-formal'
  | 'timeline-style'
  | 'tech-focused'
  | 'academic-cv'
  | 'warm-professional'
  | 'blue-stripe'
  | 'sharp-geometric'
  | 'clean-serif'
  | 'entry-level-friendly'
  | 'creative-minimal';

export interface Template {
  id: string;
  name: string;
  slug: TemplateSlug;
  description: string;
  isAtsSafe: boolean;
  previewImage?: string;
}

// Resume state (for builder)
export interface Resume {
  id?: string; // undefined for guest, UUID for logged-in
  userId?: string; // undefined for guest
  title: string;
  roleSlug?: string;
  country: string;
  templateSlug: TemplateSlug;
  sectionOrder: ResumeSectionKey[]; // User-defined section order
  data: ResumeData;
  createdAt?: string;
  updatedAt?: string;
}

// Builder step names
export type BuilderStep =
  | 'personal'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'review';

// Export options
export interface ExportOptions {
  templateSlug: TemplateSlug;
  watermark: boolean;
  format: 'pdf'; // Future: 'docx', 'txt'
}

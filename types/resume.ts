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
  description: string;
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

export interface ResumeData {
  personal: ResumePersonal;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  certifications?: ResumeCertification[];
  summary?: string; // Optional professional summary
}

// Template selection
export type TemplateSlug =
  | 'education-first'
  | 'projects-first'
  | 'skills-emphasis'
  | 'minimal-classic'
  | 'modern-ats-safe';

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

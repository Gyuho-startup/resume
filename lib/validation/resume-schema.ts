import { z } from 'zod';

// Zod schemas for validation (using react-hook-form)

export const personalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(20),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(2, 'Institution name required').max(200),
  degree: z.string().min(2, 'Degree required').max(200),
  field: z.string().max(200).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}$|^Present$/, 'Format: YYYY-MM or "Present"').optional(),
  grade: z.string().max(100).optional(),
  achievements: z.array(z.string().max(200)).optional(),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(2, 'Company name required').max(200),
  position: z.string().min(2, 'Position required').max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}$|^Present$/, 'Format: YYYY-MM or "Present"').optional(),
  current: z.boolean(),
  responsibilities: z.array(z.string().min(10, 'Too short').max(500)).min(1, 'Add at least one responsibility'),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Project name required').max(200),
  description: z.string().min(20, 'Description too short').max(500),
  technologies: z.array(z.string().max(50)).min(1, 'Add at least one technology'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional(),
});

export const skillsSchema = z.object({
  technical: z.array(z.string().max(50)).min(1, 'Add at least one technical skill'),
  soft: z.array(z.string().max(50)).min(1, 'Add at least one soft skill'),
  languages: z.array(z.object({
    name: z.string().max(50),
    proficiency: z.string().max(50),
  })).optional(),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Certification name required').max(200),
  issuer: z.string().min(2, 'Issuer required').max(200),
  date: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const resumeDataSchema = z.object({
  personal: personalSchema,
  education: z.array(educationSchema).min(1, 'Add at least one education entry'),
  experience: z.array(experienceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  skills: skillsSchema,
  certifications: z.array(certificationSchema).optional().default([]),
  summary: z.string().max(500).optional(),
});

export const resumeSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  title: z.string().min(3, 'Title too short').max(200),
  roleSlug: z.string().max(100).optional(),
  country: z.string().default('UK'),
  templateSlug: z.enum([
    'education-first',
    'projects-first',
    'skills-emphasis',
    'minimal-classic',
    'modern-ats-safe',
  ]),
  data: resumeDataSchema,
});

export type ResumeFormData = z.infer<typeof resumeSchema>;

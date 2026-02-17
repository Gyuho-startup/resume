import type { ResumeData } from '@/types/resume';

export type BlurIntensity = 'light' | 'medium' | 'heavy';
export type ResumeSectionKey = 'personal' | 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'certifications';

export interface SectionBlurConfig {
  blur: boolean;
  visibleItems?: number; // How many items to show before blurring
  blurIntensity?: BlurIntensity;
  showFirstNChars?: number; // For text fields, show first N characters
}

export interface PreviewBlurConfig {
  sections: {
    [K in ResumeSectionKey]?: SectionBlurConfig;
  };
}

// Default blur configuration - strategic sections blurred to create FOMO
export const DEFAULT_BLUR_CONFIG: PreviewBlurConfig = {
  sections: {
    personal: {
      blur: false, // Never blur - shows structure
    },
    summary: {
      blur: true,
      blurIntensity: 'medium',
      showFirstNChars: 50, // Show beginning, blur rest
    },
    experience: {
      blur: true,
      blurIntensity: 'heavy',
      visibleItems: 1, // Show first bullet point, blur rest
    },
    projects: {
      blur: true,
      blurIntensity: 'heavy',
      visibleItems: 1, // Show first highlight, blur rest
    },
    education: {
      blur: true,
      blurIntensity: 'light',
      visibleItems: 1, // Show degree, blur achievements
    },
    skills: {
      blur: true,
      blurIntensity: 'medium',
      visibleItems: 3, // Show 3 technical skills, blur rest
    },
    certifications: {
      blur: true,
      blurIntensity: 'light',
      visibleItems: 0, // Blur all certifications
    },
  },
};

/**
 * Formats partial resume data for preview display
 * Fills in placeholder data for empty sections
 * Marks sections for blurring based on configuration
 */
export function formatResumeForPreview(
  resumeData: Partial<ResumeData>,
  blurConfig: PreviewBlurConfig = DEFAULT_BLUR_CONFIG
): ResumeData & { _blurConfig: PreviewBlurConfig } {
  // Base structure with placeholders
  const previewData: ResumeData = {
    personal: resumeData.personal || {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+44 7XXX XXXXXX',
      city: 'London, UK',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: resumeData.summary ||
      'Complete your CV to unlock your professional summary highlighting your key strengths and career goals.',
    experience: resumeData.experience || [
      {
        id: 'preview-exp-1',
        company: 'Your Company',
        position: 'Your Role',
        location: 'Location',
        startDate: '',
        endDate: '',
        current: false,
        responsibilities: [
          'Continue building to see your experience formatted professionally',
          'Each role will have 3-5 achievement-focused bullet points',
          'All following ATS-friendly best practices',
        ],
      },
    ],
    projects: resumeData.projects || [
      {
        id: 'preview-proj-1',
        name: 'Your Project',
        highlights: [
          'Continue to unlock your project details',
          'Technical achievements with metrics',
          'Impact and results highlighted',
        ],
        technologies: ['Technology 1', 'Technology 2', 'Technology 3'],
        url: '',
        startDate: '',
        endDate: '',
      },
    ],
    education: resumeData.education || [
      {
        id: 'preview-edu-1',
        institution: 'Your University',
        degree: 'Your Degree',
        field: 'Your Field',
        startDate: '',
        endDate: '',
        grade: '',
        achievements: [
          'Continue to add your academic achievements',
          'Relevant coursework and honors',
        ],
      },
    ],
    skills: resumeData.skills || {
      technical: ['Skill 1', 'Skill 2', 'Skill 3', 'And more...'],
      soft: ['Soft skill 1', 'Soft skill 2', 'Soft skill 3'],
      languages: [
        { name: 'English', proficiency: 'Native' },
      ],
    },
    certifications: resumeData.certifications || [],
  };

  // Attach blur configuration to data
  return {
    ...previewData,
    _blurConfig: blurConfig,
  } as ResumeData & { _blurConfig: PreviewBlurConfig };
}

/**
 * Checks if a section should be blurred based on configuration
 */
export function shouldBlurSection(
  sectionKey: ResumeSectionKey,
  blurConfig: PreviewBlurConfig = DEFAULT_BLUR_CONFIG
): boolean {
  return blurConfig.sections[sectionKey]?.blur ?? false;
}

/**
 * Gets the blur intensity for a section
 */
export function getBlurIntensity(
  sectionKey: ResumeSectionKey,
  blurConfig: PreviewBlurConfig = DEFAULT_BLUR_CONFIG
): BlurIntensity {
  return blurConfig.sections[sectionKey]?.blurIntensity ?? 'medium';
}

/**
 * Gets the number of visible items before blurring
 */
export function getVisibleItemCount(
  sectionKey: ResumeSectionKey,
  blurConfig: PreviewBlurConfig = DEFAULT_BLUR_CONFIG
): number {
  return blurConfig.sections[sectionKey]?.visibleItems ?? 0;
}

/**
 * Determines if we have enough data to show a meaningful preview
 * If less than 3 fields are populated, suggest showing template mockup instead
 */
export function hasMinimalPreviewData(resumeData: Partial<ResumeData>): boolean {
  let populatedFields = 0;

  if (resumeData.personal?.name && resumeData.personal.name !== 'Your Name') populatedFields++;
  if (resumeData.experience && resumeData.experience.length > 0) populatedFields++;
  if (resumeData.projects && resumeData.projects.length > 0) populatedFields++;
  if (resumeData.education && resumeData.education.length > 0) populatedFields++;
  if (resumeData.skills?.technical && resumeData.skills.technical.length > 0) populatedFields++;

  return populatedFields >= 3;
}

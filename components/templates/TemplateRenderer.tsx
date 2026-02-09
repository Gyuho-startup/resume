import type { TemplateSlug, ResumeData } from '@/types/resume';
import EducationFirstTemplate from './EducationFirstTemplate';
// TODO: Import other templates when implemented
// import ProjectsFirstTemplate from './ProjectsFirstTemplate';
// import SkillsEmphasisTemplate from './SkillsEmphasisTemplate';
// import MinimalClassicTemplate from './MinimalClassicTemplate';
// import ModernAtsSafeTemplate from './ModernAtsSafeTemplate';

interface TemplateRendererProps {
  templateSlug: TemplateSlug;
  data: ResumeData;
  watermark?: boolean;
}

/**
 * Central template renderer
 * Routes to correct template component based on slug
 */
export default function TemplateRenderer({
  templateSlug,
  data,
  watermark = false,
}: TemplateRendererProps) {
  switch (templateSlug) {
    case 'education-first':
      return <EducationFirstTemplate data={data} watermark={watermark} />;

    case 'projects-first':
      // TODO: Implement ProjectsFirstTemplate
      return <EducationFirstTemplate data={data} watermark={watermark} />;

    case 'skills-emphasis':
      // TODO: Implement SkillsEmphasisTemplate
      return <EducationFirstTemplate data={data} watermark={watermark} />;

    case 'minimal-classic':
      // TODO: Implement MinimalClassicTemplate
      return <EducationFirstTemplate data={data} watermark={watermark} />;

    case 'modern-ats-safe':
      // TODO: Implement ModernAtsSafeTemplate
      return <EducationFirstTemplate data={data} watermark={watermark} />;

    default:
      return <EducationFirstTemplate data={data} watermark={watermark} />;
  }
}

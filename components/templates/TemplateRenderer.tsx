import type { TemplateSlug, ResumeData, ResumeSectionKey } from '@/types/resume';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';
import EducationFirstTemplate from './EducationFirstTemplate';
import ProjectsFirstTemplate from './ProjectsFirstTemplate';
import SkillsEmphasisTemplate from './SkillsEmphasisTemplate';
import MinimalClassicTemplate from './MinimalClassicTemplate';
import ModernAtsSafeTemplate from './ModernAtsSafeTemplate';
import NavyExecutiveTemplate from './NavyExecutiveTemplate';
import TwoToneHeaderTemplate from './TwoToneHeaderTemplate';
import GreenAccentTemplate from './GreenAccentTemplate';
import BurgundyClassicTemplate from './BurgundyClassicTemplate';
import CompactDenseTemplate from './CompactDenseTemplate';
import CenteredFormalTemplate from './CenteredFormalTemplate';
import TimelineStyleTemplate from './TimelineStyleTemplate';
import TechFocusedTemplate from './TechFocusedTemplate';
import AcademicCvTemplate from './AcademicCvTemplate';
import WarmProfessionalTemplate from './WarmProfessionalTemplate';
import BlueStripeTemplate from './BlueStripeTemplate';
import SharpGeometricTemplate from './SharpGeometricTemplate';
import CleanSerifTemplate from './CleanSerifTemplate';
import EntryLevelFriendlyTemplate from './EntryLevelFriendlyTemplate';
import CreativeMinimalTemplate from './CreativeMinimalTemplate';

interface TemplateRendererProps {
  templateSlug: TemplateSlug;
  data: ResumeData;
  sectionOrder?: ResumeSectionKey[]; // NEW
  watermark?: boolean;
}

/**
 * Central template renderer
 * Routes to correct template component based on slug
 */
export default function TemplateRenderer({ templateSlug, data, sectionOrder, watermark = false }: TemplateRendererProps) {
  const resolvedSectionOrder = sectionOrder ?? DEFAULT_SECTION_ORDER;

  switch (templateSlug) {
    case 'education-first':
      return <EducationFirstTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'projects-first':
      return <ProjectsFirstTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'skills-emphasis':
      return <SkillsEmphasisTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'minimal-classic':
      return <MinimalClassicTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'modern-ats-safe':
      return <ModernAtsSafeTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'navy-executive':
      return <NavyExecutiveTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'two-tone-header':
      return <TwoToneHeaderTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'green-accent':
      return <GreenAccentTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'burgundy-classic':
      return <BurgundyClassicTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'compact-dense':
      return <CompactDenseTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'centered-formal':
      return <CenteredFormalTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'timeline-style':
      return <TimelineStyleTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'tech-focused':
      return <TechFocusedTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'academic-cv':
      return <AcademicCvTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'warm-professional':
      return <WarmProfessionalTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'blue-stripe':
      return <BlueStripeTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'sharp-geometric':
      return <SharpGeometricTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'clean-serif':
      return <CleanSerifTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'entry-level-friendly':
      return <EntryLevelFriendlyTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    case 'creative-minimal':
      return <CreativeMinimalTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
    default:
      return <EducationFirstTemplate data={data} sectionOrder={resolvedSectionOrder} watermark={watermark} />;
  }
}

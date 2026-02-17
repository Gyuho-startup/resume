'use client';

import type { ResumeData } from '@/types/resume';
import { formatResumeForPreview, getBlurIntensity, getVisibleItemCount, hasMinimalPreviewData, type ResumeSectionKey } from '@/lib/coach/resume-preview-formatter';

interface PaymentGateResumePreviewProps {
  resumeData: Partial<ResumeData>;
  className?: string;
}

export default function PaymentGateResumePreview({
  resumeData,
  className = '',
}: PaymentGateResumePreviewProps) {
  // Check if we have enough data for a meaningful preview
  const hasEnoughData = hasMinimalPreviewData(resumeData);

  // Debug: Log resume data to console
  console.log('[PaymentGateResumePreview] resumeData:', resumeData);
  console.log('[PaymentGateResumePreview] hasEnoughData:', hasEnoughData);

  // Format resume data with blur configuration
  const previewData = formatResumeForPreview(resumeData);
  const blurConfig = previewData._blurConfig;

  // Helper function to get blur CSS classes
  const getBlurClasses = (sectionKey: ResumeSectionKey): string => {
    const intensity = getBlurIntensity(sectionKey, blurConfig);
    const blurMap = {
      light: 'backdrop-blur-sm opacity-60',
      medium: 'backdrop-blur-md opacity-50',
      heavy: 'backdrop-blur-lg opacity-40',
    };
    return blurMap[intensity];
  };

  // Helper to check if item should be visible or blurred
  const shouldShowItem = (sectionKey: ResumeSectionKey, index: number): boolean => {
    const visibleCount = getVisibleItemCount(sectionKey, blurConfig);
    return index < visibleCount;
  };

  // Always show preview with collected data, even if minimal
  // This creates FOMO by showing what they've built so far

  return (
    <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Preview Label */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-center">
        <p className="text-xs font-semibold tracking-wide">📄 YOUR CV SO FAR</p>
      </div>

      {/* Resume Content - A4 aspect ratio */}
      <div className="p-6 max-h-[500px] overflow-y-auto text-xs">
        {/* Personal Info */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">{previewData.personal.name}</h1>
          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
            {previewData.personal.email && <p>{previewData.personal.email}</p>}
            {previewData.personal.phone && <p>{previewData.personal.phone}</p>}
            {previewData.personal.city && <p>{previewData.personal.city}</p>}
          </div>
        </div>

        {/* Summary - Partially blurred */}
        {previewData.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
            <div className="relative">
              <p className="text-xs text-slate-700 leading-relaxed">
                {previewData.summary.substring(0, 50)}
                <span className={`inline-block ${getBlurClasses('summary')}`}>
                  {previewData.summary.substring(50)}
                </span>
              </p>
              {blurConfig.sections.summary?.blur && (
                <div className="absolute right-0 top-0 text-blue-600 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience - First item visible, rest blurred */}
        {previewData.experience && previewData.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">EXPERIENCE</h2>
            {previewData.experience.map((exp, idx) => (
              <div key={exp.id} className={`mb-3 relative ${!shouldShowItem('experience', idx) ? 'pointer-events-none' : ''}`}>
                <div className={!shouldShowItem('experience', idx) ? getBlurClasses('experience') : ''}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                      <p className="text-slate-700">{exp.company}</p>
                    </div>
                    <p className="text-slate-600 text-xs">{exp.startDate || 'Present'}</p>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {exp.responsibilities.slice(0, shouldShowItem('experience', idx) ? 1 : exp.responsibilities.length).map((resp, i) => (
                      <li key={i} className="text-xs">{resp}</li>
                    ))}
                  </ul>
                </div>
                {!shouldShowItem('experience', idx) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-blue-600">Unlock</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects - First highlight visible, rest blurred */}
        {previewData.projects && previewData.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">PROJECTS</h2>
            {previewData.projects.map((project, idx) => (
              <div key={project.id} className={`mb-3 relative ${!shouldShowItem('projects', idx) ? 'pointer-events-none' : ''}`}>
                <div className={!shouldShowItem('projects', idx) ? getBlurClasses('projects') : ''}>
                  <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {project.highlights.slice(0, shouldShowItem('projects', idx) ? 1 : project.highlights.length).map((highlight, i) => (
                      <li key={i} className="text-xs">{highlight}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-medium">Tech:</span> {project.technologies.slice(0, 3).join(', ')}
                    {project.technologies.length > 3 && '...'}
                  </p>
                </div>
                {!shouldShowItem('projects', idx) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-blue-600">Unlock</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education - Lightly blurred */}
        {previewData.education && previewData.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">EDUCATION</h2>
            {previewData.education.map((edu, idx) => (
              <div key={edu.id} className={`mb-2 ${!shouldShowItem('education', idx) ? getBlurClasses('education') : ''}`}>
                <h3 className="font-semibold text-slate-900">{edu.degree} in {edu.field}</h3>
                <p className="text-slate-700">{edu.institution}</p>
                <p className="text-slate-600 text-xs">{edu.endDate || 'Expected'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills - Show 3, blur rest */}
        {previewData.skills && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">SKILLS</h2>
            <div className="relative">
              <p className="text-xs text-slate-700">
                <span className="font-medium">Technical:</span>{' '}
                {previewData.skills.technical.slice(0, 3).join(', ')}
                {previewData.skills.technical.length > 3 && (
                  <span className={`inline-block ${getBlurClasses('skills')}`}>
                    {', ' + previewData.skills.technical.slice(3).join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
}

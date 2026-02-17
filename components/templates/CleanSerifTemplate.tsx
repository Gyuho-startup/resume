import React from 'react';
import type { ResumeData, ResumeSectionKey } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  watermark?: boolean;
}

/**
 * Clean Serif Template (slug: clean-serif)
 * ATS-friendly: One-column, no tables, no icons, standard headings
 * Serif typography — suited for consulting, academia, refined roles
 * Only name and section headings use serif; body text is sans-serif
 */
export default function CleanSerifTemplate({ data, sectionOrder, watermark = false }: TemplateProps) {
  const { personal, education, experience, projects, skills, certifications, summary } = data;

  const sectionMap: Record<ResumeSectionKey, React.ReactNode> = {
    summary: summary ? (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-400 pb-1 mb-3 font-serif italic">
          Profile
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </section>
    ) : null,

    education: education.length > 0 ? (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-400 pb-1 mb-3 font-serif italic">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="page-break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {edu.degree}
                  {edu.field && `, ${edu.field}`}
                </h3>
                <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                  {edu.startDate} – {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm text-slate-700">{edu.institution}</p>
              {edu.grade && (
                <p className="text-sm text-slate-600 mt-0.5">
                  <span className="font-medium">Grade:</span> {edu.grade}
                </p>
              )}
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="mt-2 ml-5 space-y-1">
                  {edu.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-sm text-slate-700 list-disc">
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    experience: experience.length > 0 ? (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-400 pb-1 mb-3 font-serif italic">
          Experience
        </h2>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="page-break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900">{exp.position}</h3>
                <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                {exp.company}
                {exp.location && ` · ${exp.location}`}
              </p>
              <ul className="ml-5 space-y-1">
                {exp.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-sm text-slate-700 list-disc">
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    projects: projects.length > 0 ? (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-400 pb-1 mb-3 font-serif italic">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="page-break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
                {(project.startDate || project.endDate) && (
                  <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                    {project.startDate}
                    {project.endDate && ` – ${project.endDate}`}
                  </span>
                )}
              </div>
              {/* SCHEMA CHANGE: Render highlights as bullets (HR-quality format) */}
              {project.highlights && project.highlights.length > 0 && (
                <ul className="ml-5 space-y-1 mb-2">
                  {project.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-slate-700 list-disc">
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              {project.technologies.length > 0 && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Technologies:</span>{' '}
                  {project.technologies.join(', ')}
                </p>
              )}
              {project.url && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">URL:</span> {project.url}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: (skills.technical.length > 0 || skills.soft.length > 0 || (skills.languages && skills.languages.length > 0)) ? (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-400 pb-1 mb-3 font-serif italic">
          Skills
        </h2>
        <div className="space-y-2">
          {skills.technical.length > 0 && (
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Technical:</span>{' '}
              {skills.technical.join(', ')}
            </p>
          )}
          {skills.soft.length > 0 && (
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Soft Skills:</span>{' '}
              {skills.soft.join(', ')}
            </p>
          )}
          {skills.languages && skills.languages.length > 0 && (
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Languages:</span>{' '}
              {skills.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </p>
          )}
        </div>
      </section>
    ) : null,

    certifications: certifications && certifications.length > 0 ? (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-400 pb-1 mb-3 font-serif italic">
          Certifications
        </h2>
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="page-break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-slate-900">{cert.name}</h3>
                <span className="text-sm text-slate-600 whitespace-nowrap ml-4">{cert.date}</span>
              </div>
              <p className="text-sm text-slate-700">{cert.issuer}</p>
              {cert.url && (
                <p className="text-sm text-slate-600">{cert.url}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-lg relative print:shadow-none">
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 print:opacity-20">
          <div className="text-8xl font-bold text-slate-400 rotate-[-45deg] select-none">FREE EXPORT</div>
        </div>
      )}

      {/* Header — always first */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-serif">{personal.name}</h1>
        <p className="text-sm text-slate-600 font-serif tracking-wide">
          {[personal.email, personal.phone, personal.city, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join(' · ')}
        </p>
        <div className="border-b border-slate-400 mt-3" />
      </header>

      {/* Sections rendered in user-defined order */}
      {sectionOrder.map((key) => (
        <React.Fragment key={key}>{sectionMap[key]}</React.Fragment>
      ))}
    </div>
  );
}

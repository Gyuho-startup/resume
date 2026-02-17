import React from 'react';
import type { ResumeData, ResumeSectionKey } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  watermark?: boolean;
}

/**
 * Compact Dense Template (slug: compact-dense)
 * ATS-friendly: One-column, no tables, no icons, standard headings
 * Maximum content on one page. Very tight spacing.
 * Summary shown inline below header — not part of sectionOrder loop.
 */
export default function CompactDenseTemplate({ data, sectionOrder, watermark = false }: TemplateProps) {
  const { personal, education, experience, projects, skills, certifications, summary } = data;

  const sectionMap: Record<ResumeSectionKey, React.ReactNode> = {
    // Summary is rendered inline directly below the header in this template
    summary: null,

    education: education.length > 0 ? (
      <section>
        <h2 className="text-xs font-bold uppercase text-slate-700 mb-1 mt-3">Education</h2>
        <div className="space-y-1">
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-semibold text-slate-900">
                  {edu.degree}{edu.field && ` in ${edu.field}`}
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {edu.startDate} – {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-xs text-slate-700">{edu.institution}{edu.grade && ` · Grade: ${edu.grade}`}</p>
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="ml-3 space-y-0.5 mt-0.5">
                  {edu.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-xs text-slate-700 list-disc">
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

    skills: (skills.technical.length > 0 || skills.soft.length > 0 || (skills.languages && skills.languages.length > 0)) ? (
      <section>
        <h2 className="text-xs font-bold uppercase text-slate-700 mb-1 mt-3">Skills</h2>
        <div className="space-y-1">
          {skills.technical.length > 0 && (
            <p className="text-xs text-slate-700">
              <span className="font-semibold">Technical: </span>
              {skills.technical.join(', ')}
            </p>
          )}
          {skills.soft.length > 0 && (
            <p className="text-xs text-slate-700">
              <span className="font-semibold">Soft Skills: </span>
              {skills.soft.join(', ')}
            </p>
          )}
          {skills.languages && skills.languages.length > 0 && (
            <p className="text-xs text-slate-700">
              <span className="font-semibold">Languages: </span>
              {skills.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </p>
          )}
        </div>
      </section>
    ) : null,

    experience: experience.length > 0 ? (
      <section>
        <h2 className="text-xs font-bold uppercase text-slate-700 mb-1 mt-3">Experience</h2>
        <div className="space-y-1">
          {experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-semibold text-slate-900">{exp.position}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {exp.startDate} – {exp.current ? 'Present' : (exp.endDate || 'Present')}
                </span>
              </div>
              <p className="text-xs text-slate-700 mb-0.5">
                {exp.company}{exp.location && ` · ${exp.location}`}
              </p>
              <ul className="ml-3 space-y-0.5">
                {exp.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-xs text-slate-700 list-disc">
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
      <section>
        <h2 className="text-xs font-bold uppercase text-slate-700 mb-1 mt-3">Projects</h2>
        <div className="space-y-1">
          {projects.map((project) => (
            <div key={project.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-semibold text-slate-900">{project.name}</h3>
                {project.startDate && (
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {project.startDate}{project.endDate && ` – ${project.endDate}`}
                  </span>
                )}
              </div>
              {/* SCHEMA CHANGE: Render highlights as bullets (HR-quality format) */}
              {project.highlights && project.highlights.length > 0 && (
                <ul className="ml-3 space-y-0.5 mb-1">
                  {project.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-xs text-slate-700 list-disc">
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-600">
                <span className="font-medium">Tech: </span>
                {project.technologies.join(', ')}
                {project.url && <span className="ml-2">· {project.url}</span>}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    certifications: certifications && certifications.length > 0 ? (
      <section>
        <h2 className="text-xs font-bold uppercase text-slate-700 mb-1 mt-3">Certifications</h2>
        <div className="space-y-1">
          {certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-semibold text-slate-900">{cert.name}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{cert.date}</span>
              </div>
              <p className="text-xs text-slate-700">
                {cert.issuer}{cert.url && ` · ${cert.url}`}
              </p>
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

      {/* Header — single line, always first */}
      <header className="mb-3 pb-2 border-b border-slate-400">
        <div className="flex items-baseline justify-between flex-wrap gap-x-4">
          <h1 className="text-xl font-bold text-slate-900">{personal.name}</h1>
          <p className="text-xs text-slate-600">
            {[personal.email, personal.phone, personal.city, personal.linkedin].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      {/* Inline summary — shown directly below header in this template */}
      {summary && (
        <p className="text-xs text-slate-700 mb-2 leading-snug">{summary}</p>
      )}

      {/* Sections rendered in user-defined order (summary key returns null, handled above) */}
      {sectionOrder.map((key) => (
        <React.Fragment key={key}>{sectionMap[key]}</React.Fragment>
      ))}
    </div>
  );
}

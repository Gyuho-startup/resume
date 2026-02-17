import React from 'react';
import type { ResumeData, ResumeSectionKey } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  watermark?: boolean;
}

/**
 * Tech Focused Template (slug: tech-focused)
 * ATS-friendly: One-column, no tables, no icons, standard headings
 * Developer-optimised. Skills and projects prominent.
 */
export default function TechFocusedTemplate({ data, sectionOrder, watermark = false }: TemplateProps) {
  const { personal, education, experience, projects, skills, certifications, summary } = data;

  const sectionMap: Record<ResumeSectionKey, React.ReactNode> = {
    summary: summary ? (
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">&#9656;</span> Summary
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </section>
    ) : null,

    education: education.length > 0 ? (
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">&#9656;</span> Education
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {edu.degree}{edu.field && ` in ${edu.field}`}
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4 font-mono">
                  {edu.startDate} – {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm text-slate-700">{edu.institution}</p>
              {edu.grade && (
                <p className="text-xs text-slate-600 mt-0.5">Grade: {edu.grade}</p>
              )}
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="mt-1.5 ml-4 space-y-1">
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
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">&#9656;</span> Experience
        </h2>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900">{exp.position}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4 font-mono">
                  {exp.startDate} – {exp.current ? 'Present' : (exp.endDate || 'Present')}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-1">
                {exp.company}{exp.location && ` / ${exp.location}`}
              </p>
              <ul className="ml-4 space-y-1">
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
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">&#9656;</span> Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id}>
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
                {project.startDate && (
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4 font-mono">
                    {project.startDate}{project.endDate && ` – ${project.endDate}`}
                  </span>
                )}
              </div>
              {/* SCHEMA CHANGE: Render highlights as bullets (HR-quality format) */}
              {project.highlights && project.highlights.length > 0 && (
                <ul className="ml-4 space-y-1 mb-2">
                  {project.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-slate-700 list-disc">
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-600 font-mono">
                {project.technologies.join(' · ')}
              </p>
              {project.url && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">{project.url}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: (skills.technical.length > 0 || skills.soft.length > 0 || (skills.languages && skills.languages.length > 0)) ? (
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">&#9656;</span> Skills
        </h2>
        <div className="space-y-2">
          {skills.technical.length > 0 && (
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Technical: </span>
              {skills.technical.join(', ')}
            </p>
          )}
          {skills.soft.length > 0 && (
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Soft Skills: </span>
              {skills.soft.join(', ')}
            </p>
          )}
          {skills.languages && skills.languages.length > 0 && (
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Languages: </span>
              {skills.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </p>
          )}
        </div>
      </section>
    ) : null,

    certifications: certifications && certifications.length > 0 ? (
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">&#9656;</span> Certifications
        </h2>
        <div className="space-y-2">
          {certifications.map((cert) => (
            <div key={cert.id}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-slate-900">{cert.name}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4 font-mono">{cert.date}</span>
              </div>
              <p className="text-sm text-slate-700">{cert.issuer}</p>
              {cert.url && <p className="text-xs text-slate-500 font-mono">{cert.url}</p>}
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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 font-mono">{personal.name}</h1>
        <p className="text-sm text-slate-500 font-mono">
          {[personal.email, personal.phone, personal.city, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join(' / ')}
        </p>
      </header>

      {/* Sections rendered in user-defined order */}
      {sectionOrder.map((key) => (
        <React.Fragment key={key}>{sectionMap[key]}</React.Fragment>
      ))}
    </div>
  );
}

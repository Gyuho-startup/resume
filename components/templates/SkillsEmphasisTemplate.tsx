import React from 'react';
import type { ResumeData, ResumeSectionKey } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  watermark?: boolean;
}

/**
 * Skills-Emphasis Template
 * ATS-friendly: One-column, no tables, no icons, standard headings
 * Left border accent header, shaded section labels, skills on top
 * Ideal for technical roles with a diverse skill set
 */
export default function SkillsEmphasisTemplate({ data, sectionOrder, watermark = false }: TemplateProps) {
  const { personal, education, experience, projects, skills, certifications, summary } = data;

  const sectionMap: Record<ResumeSectionKey, React.ReactNode> = {
    summary: summary ? (
      <section className="mb-6">
        <div className="bg-slate-100 px-3 py-1.5 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Summary</h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </section>
    ) : null,

    skills: (skills.technical.length > 0 || skills.soft.length > 0 || (skills.languages && skills.languages.length > 0)) ? (
      <section className="mb-6">
        <div className="bg-slate-100 px-3 py-1.5 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Skills</h2>
        </div>
        <div className="space-y-2">
          {skills.technical.length > 0 && (
            <div>
              <span className="font-semibold text-slate-900 text-sm">Technical: </span>
              <span className="text-slate-700 text-sm">{skills.technical.join(', ')}</span>
            </div>
          )}
          {skills.soft.length > 0 && (
            <div>
              <span className="font-semibold text-slate-900 text-sm">Soft Skills: </span>
              <span className="text-slate-700 text-sm">{skills.soft.join(', ')}</span>
            </div>
          )}
          {skills.languages && skills.languages.length > 0 && (
            <div>
              <span className="font-semibold text-slate-900 text-sm">Languages: </span>
              <span className="text-slate-700 text-sm">
                {skills.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
              </span>
            </div>
          )}
        </div>
      </section>
    ) : null,

    education: education.length > 0 ? (
      <section className="mb-6">
        <div className="bg-slate-100 px-3 py-1.5 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Education</h2>
        </div>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-semibold text-slate-900">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </h3>
                <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                  {edu.startDate} – {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-1">{edu.institution}</p>
              {edu.grade && (
                <p className="text-sm text-slate-600 italic">Grade: {edu.grade}</p>
              )}
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="mt-2 ml-4 space-y-1">
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

    projects: projects.length > 0 ? (
      <section className="mb-6">
        <div className="bg-slate-100 px-3 py-1.5 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Projects</h2>
        </div>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                {(project.startDate || project.endDate) && (
                  <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                    {project.startDate}
                    {project.endDate && ` – ${project.endDate}`}
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
              {project.technologies.length > 0 && (
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Technologies: </span>
                  {project.technologies.join(', ')}
                </div>
              )}
              {project.url && (
                <p className="text-sm text-slate-600 mt-1">URL: {project.url}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    experience: experience.length > 0 ? (
      <section className="mb-6">
        <div className="bg-slate-100 px-3 py-1.5 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Experience</h2>
        </div>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-semibold text-slate-900">{exp.position}</h3>
                <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                {exp.company}
                {exp.location && ` · ${exp.location}`}
              </p>
              {exp.responsibilities.length > 0 && (
                <ul className="ml-4 space-y-1">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx} className="text-sm text-slate-700 list-disc">
                      {resp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    certifications: certifications && certifications.length > 0 ? (
      <section className="mb-6">
        <div className="bg-slate-100 px-3 py-1.5 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Certifications</h2>
        </div>
        <div className="space-y-2">
          {certifications.map((cert) => (
            <div key={cert.id}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-slate-900">{cert.name}</h3>
                <span className="text-sm text-slate-600 whitespace-nowrap ml-4">{cert.date}</span>
              </div>
              <p className="text-sm text-slate-700">{cert.issuer}</p>
              {cert.url && <p className="text-sm text-slate-600">{cert.url}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-lg relative print:shadow-none">
      {/* Watermark overlay */}
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 print:opacity-20">
          <div className="text-8xl font-bold text-slate-400 rotate-[-45deg] select-none">
            FREE EXPORT
          </div>
        </div>
      )}

      {/* Personal Information (Header) — left border accent, always first */}
      <header className="border-l-4 border-blue-600 pl-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">{personal.name}</h1>
        <p className="text-sm text-slate-600">
          {personal.email} · {personal.phone} · {personal.city}
        </p>
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <p className="text-sm text-slate-600">
            {[personal.linkedin, personal.github, personal.portfolio]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </header>

      {/* Sections rendered in user-defined order */}
      {sectionOrder.map((key) => (
        <React.Fragment key={key}>{sectionMap[key]}</React.Fragment>
      ))}
    </div>
  );
}

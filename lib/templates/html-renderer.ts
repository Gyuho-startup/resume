/**
 * Server-side HTML renderer for resume templates.
 *
 * Pure TypeScript string generation — no React, no react-dom/server.
 * This avoids Next.js 15 restrictions on react-dom/server in route handlers,
 * while producing print-quality HTML that closely mirrors each React template.
 *
 * Used by /api/export to generate the HTML sent to the Cloudflare Worker.
 */

import type { ResumeData, ResumeSectionKey, TemplateSlug } from '@/types/resume';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionRenderers {
  [key: string]: (data: ResumeData) => string;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function esc(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function watermarkCSS(show: boolean): string {
  if (!show) return '';
  return `
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 96px;
    font-weight: 900;
    color: rgba(148, 163, 184, 0.08);
    pointer-events: none;
    z-index: 0;
    white-space: nowrap;
    letter-spacing: 0.1em;
    font-family: Arial, sans-serif;
  }`;
}

function watermarkDiv(show: boolean): string {
  return show ? '<div class="watermark">FREE EXPORT</div>' : '';
}

// ---------------------------------------------------------------------------
// Section renderers (shared across templates)
// ---------------------------------------------------------------------------

function renderSummary(data: ResumeData, styles: { heading: string; text: string; section: string }): string {
  if (!data.summary) return '';
  return `<section style="${styles.section}">
    <h2 style="${styles.heading}">Professional Summary</h2>
    <p style="${styles.text}">${esc(data.summary)}</p>
  </section>`;
}

function renderEducation(data: ResumeData, styles: { heading: string; text: string; section: string; subheading: string; small: string }): string {
  if (!data.education || data.education.length === 0) return '';
  const items = data.education.map(edu => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <h3 style="${styles.subheading}">${esc(edu.degree)}${edu.field ? ` in ${esc(edu.field)}` : ''}</h3>
        <span style="${styles.small}">${esc(edu.startDate)} – ${esc(edu.endDate || 'Present')}</span>
      </div>
      <p style="${styles.text}">${esc(edu.institution)}</p>
      ${edu.grade ? `<p style="${styles.small}font-style:italic;">Grade: ${esc(edu.grade)}</p>` : ''}
      ${edu.achievements && edu.achievements.length > 0 ? `<ul style="margin:6px 0 0 18px;padding:0;">${edu.achievements.map(a => `<li style="${styles.text}margin-bottom:2px;">${esc(a)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
  return `<section style="${styles.section}">
    <h2 style="${styles.heading}">Education</h2>
    ${items}
  </section>`;
}

function renderExperience(data: ResumeData, styles: { heading: string; text: string; section: string; subheading: string; small: string }): string {
  if (!data.experience || data.experience.length === 0) return '';
  const items = data.experience.map(exp => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <h3 style="${styles.subheading}">${esc(exp.position)}</h3>
        <span style="${styles.small}">${esc(exp.startDate)} – ${esc(exp.current ? 'Present' : exp.endDate || 'Present')}</span>
      </div>
      <p style="${styles.text}">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ''}</p>
      ${exp.responsibilities.length > 0 ? `<ul style="margin:6px 0 0 18px;padding:0;">${exp.responsibilities.map(r => `<li style="${styles.text}margin-bottom:2px;">${esc(r)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
  return `<section style="${styles.section}">
    <h2 style="${styles.heading}">Experience</h2>
    ${items}
  </section>`;
}

function renderProjects(data: ResumeData, styles: { heading: string; text: string; section: string; subheading: string; small: string }): string {
  if (!data.projects || data.projects.length === 0) return '';
  const items = data.projects.map(p => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <h3 style="${styles.subheading}">${esc(p.name)}</h3>
        ${p.startDate ? `<span style="${styles.small}">${esc(p.startDate)}${p.endDate ? ` – ${esc(p.endDate)}` : ''}</span>` : ''}
      </div>
      ${p.highlights && p.highlights.length > 0 ? `
        <ul style="margin:8px 0 8px 16px;list-style-type:disc;">
          ${p.highlights.map(h => `<li style="${styles.text}">${esc(h)}</li>`).join('')}
        </ul>
      ` : ''}
      <p style="${styles.small}"><strong>Technologies:</strong> ${esc(p.technologies.join(', '))}</p>
      ${p.url ? `<p style="${styles.small}">${esc(p.url)}</p>` : ''}
    </div>`).join('');
  return `<section style="${styles.section}">
    <h2 style="${styles.heading}">Projects</h2>
    ${items}
  </section>`;
}

function renderSkills(data: ResumeData, styles: { heading: string; text: string; section: string }): string {
  if (!data.skills) return '';
  const { technical, soft, languages } = data.skills;
  const lines: string[] = [];
  if (technical && technical.length > 0)
    lines.push(`<p style="${styles.text}"><strong>Technical:</strong> ${esc(technical.join(', '))}</p>`);
  if (soft && soft.length > 0)
    lines.push(`<p style="${styles.text}"><strong>Soft Skills:</strong> ${esc(soft.join(', '))}</p>`);
  if (languages && languages.length > 0)
    lines.push(`<p style="${styles.text}"><strong>Languages:</strong> ${esc(languages.map(l => `${l.name} (${l.proficiency})`).join(', '))}</p>`);
  if (lines.length === 0) return '';
  return `<section style="${styles.section}">
    <h2 style="${styles.heading}">Skills</h2>
    ${lines.join('')}
  </section>`;
}

function renderCertifications(data: ResumeData, styles: { heading: string; text: string; section: string; subheading: string; small: string }): string {
  if (!data.certifications || data.certifications.length === 0) return '';
  const items = data.certifications.map(c => `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <h3 style="${styles.subheading}">${esc(c.name)}</h3>
        <span style="${styles.small}">${esc(c.date)}</span>
      </div>
      <p style="${styles.text}">${esc(c.issuer)}</p>
    </div>`).join('');
  return `<section style="${styles.section}">
    <h2 style="${styles.heading}">Certifications</h2>
    ${items}
  </section>`;
}

// ---------------------------------------------------------------------------
// Per-template HTML generators
// ---------------------------------------------------------------------------

function renderEducationFirst(data: ResumeData, sectionOrder: ResumeSectionKey[], watermark: boolean): string {
  const styles = {
    section: 'margin-bottom:22px;',
    heading: 'font-size:15pt;font-weight:700;color:#0f172a;border-bottom:1px solid #cbd5e1;padding-bottom:3px;margin:0 0 10px;',
    subheading: 'font-size:11pt;font-weight:600;color:#0f172a;margin:0 0 2px;',
    text: 'font-size:10pt;color:#334155;margin:0 0 4px;',
    small: 'font-size:9pt;color:#475569;margin:0;',
  };

  const sectionFns: Record<ResumeSectionKey, () => string> = {
    summary: () => renderSummary(data, styles),
    education: () => renderEducation(data, styles),
    experience: () => renderExperience(data, styles),
    projects: () => renderProjects(data, styles),
    skills: () => renderSkills(data, styles),
    certifications: () => renderCertifications(data, styles),
  };

  const { personal } = data;
  const sectionsHtml = sectionOrder.map(k => sectionFns[k]?.() ?? '').join('');

  return `
  <body style="font-family:Arial,'Helvetica Neue',sans-serif;font-size:11pt;color:#1e293b;background:#fff;margin:0;padding:40px;position:relative;">
    ${watermarkDiv(watermark)}
    <header style="border-bottom:2px solid #0f172a;padding-bottom:14px;margin-bottom:22px;">
      <h1 style="font-size:22pt;font-weight:700;color:#0f172a;margin:0 0 6px;">${esc(personal.name)}</h1>
      <div style="font-size:10pt;color:#475569;">
        ${[personal.email, personal.phone, personal.city].filter(Boolean).map(esc).join(' &bull; ')}
        ${[personal.linkedin, personal.github, personal.portfolio].filter(Boolean).length > 0
          ? '<br>' + [personal.linkedin, personal.github, personal.portfolio].filter(Boolean).map(esc).join(' &bull; ')
          : ''}
      </div>
    </header>
    ${sectionsHtml}
  </body>`;
}

function renderMinimalClassic(data: ResumeData, sectionOrder: ResumeSectionKey[], watermark: boolean): string {
  const styles = {
    section: 'margin-bottom:18px;',
    heading: 'font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;border-top:1px solid #e2e8f0;padding-top:8px;margin:0 0 8px;',
    subheading: 'font-size:10pt;font-weight:600;color:#0f172a;margin:0 0 2px;',
    text: 'font-size:10pt;color:#334155;margin:0 0 3px;',
    small: 'font-size:9pt;color:#64748b;font-style:italic;margin:0;',
  };

  const sectionFns: Record<ResumeSectionKey, () => string> = {
    summary: () => renderSummary(data, styles),
    education: () => renderEducation(data, styles),
    experience: () => renderExperience(data, styles),
    projects: () => renderProjects(data, styles),
    skills: () => renderSkills(data, styles),
    certifications: () => renderCertifications(data, styles),
  };

  const { personal } = data;
  const sectionsHtml = sectionOrder.map(k => sectionFns[k]?.() ?? '').join('');

  return `
  <body style="font-family:Georgia,'Times New Roman',serif;font-size:11pt;color:#1e293b;background:#fff;margin:0;padding:40px;position:relative;">
    ${watermarkDiv(watermark)}
    <header style="text-align:center;margin-bottom:20px;">
      <h1 style="font-size:20pt;font-weight:700;color:#0f172a;letter-spacing:0.05em;margin:0 0 8px;">${esc(personal.name)}</h1>
      <div style="font-size:9pt;color:#64748b;">
        ${[personal.email, personal.phone, personal.city].filter(Boolean).map(esc).join(' &bull; ')}
        ${[personal.linkedin, personal.github, personal.portfolio].filter(Boolean).length > 0
          ? '<br>' + [personal.linkedin, personal.github, personal.portfolio].filter(Boolean).map(esc).join(' &bull; ')
          : ''}
      </div>
    </header>
    ${sectionsHtml}
  </body>`;
}

function renderModernAtsSafe(data: ResumeData, sectionOrder: ResumeSectionKey[], watermark: boolean): string {
  const styles = {
    section: 'margin-bottom:20px;',
    heading: 'font-size:11pt;font-weight:700;color:#1d4ed8;border-bottom:2px solid #dbeafe;padding-bottom:4px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;',
    subheading: 'font-size:10.5pt;font-weight:600;color:#0f172a;margin:0 0 2px;',
    text: 'font-size:10pt;color:#374151;margin:0 0 4px;',
    small: 'font-size:9pt;color:#6b7280;margin:0;',
  };

  const sectionFns: Record<ResumeSectionKey, () => string> = {
    summary: () => renderSummary(data, styles),
    education: () => renderEducation(data, styles),
    experience: () => renderExperience(data, styles),
    projects: () => renderProjects(data, styles),
    skills: () => renderSkills(data, styles),
    certifications: () => renderCertifications(data, styles),
  };

  const { personal } = data;
  const sectionsHtml = sectionOrder.map(k => sectionFns[k]?.() ?? '').join('');

  return `
  <body style="font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;color:#1e293b;background:#fff;margin:0;padding:0;position:relative;">
    ${watermarkDiv(watermark)}
    <header style="background:#1e3a8a;color:#fff;padding:28px 40px 20px;">
      <h1 style="font-size:22pt;font-weight:700;margin:0 0 8px;color:#fff;">${esc(personal.name)}</h1>
      <div style="font-size:10pt;color:#bfdbfe;">
        ${[personal.email, personal.phone, personal.city].filter(Boolean).map(esc).join(' &bull; ')}
        ${[personal.linkedin, personal.github, personal.portfolio].filter(Boolean).length > 0
          ? '<br>' + [personal.linkedin, personal.github, personal.portfolio].filter(Boolean).map(esc).join(' &bull; ')
          : ''}
      </div>
    </header>
    <div style="padding:30px 40px;">
      ${sectionsHtml}
    </div>
  </body>`;
}

function renderProjectsFirst(data: ResumeData, sectionOrder: ResumeSectionKey[], watermark: boolean): string {
  // Reuse EducationFirst style but with a different default order (handled by sectionOrder param)
  return renderEducationFirst(data, sectionOrder, watermark);
}

function renderSkillsEmphasis(data: ResumeData, sectionOrder: ResumeSectionKey[], watermark: boolean): string {
  const styles = {
    section: 'margin-bottom:20px;',
    heading: 'font-size:11pt;font-weight:700;color:#0f172a;border-left:4px solid #0f172a;padding-left:10px;margin:0 0 10px;',
    subheading: 'font-size:10.5pt;font-weight:600;color:#0f172a;margin:0 0 2px;',
    text: 'font-size:10pt;color:#334155;margin:0 0 4px;',
    small: 'font-size:9pt;color:#64748b;margin:0;',
  };

  const sectionFns: Record<ResumeSectionKey, () => string> = {
    summary: () => renderSummary(data, styles),
    education: () => renderEducation(data, styles),
    experience: () => renderExperience(data, styles),
    projects: () => renderProjects(data, styles),
    skills: () => renderSkills(data, styles),
    certifications: () => renderCertifications(data, styles),
  };

  const { personal } = data;
  const sectionsHtml = sectionOrder.map(k => sectionFns[k]?.() ?? '').join('');

  return `
  <body style="font-family:Arial,'Helvetica Neue',sans-serif;font-size:11pt;color:#1e293b;background:#fff;margin:0;padding:40px;position:relative;">
    ${watermarkDiv(watermark)}
    <header style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #0f172a;">
      <h1 style="font-size:21pt;font-weight:700;color:#0f172a;margin:0 0 6px;">${esc(personal.name)}</h1>
      <div style="font-size:10pt;color:#475569;">
        ${[personal.email, personal.phone, personal.city].filter(Boolean).map(esc).join(' &bull; ')}
        ${[personal.linkedin, personal.github, personal.portfolio].filter(Boolean).length > 0
          ? '<br>' + [personal.linkedin, personal.github, personal.portfolio].filter(Boolean).map(esc).join(' &bull; ')
          : ''}
      </div>
    </header>
    ${sectionsHtml}
  </body>`;
}

// ---------------------------------------------------------------------------
// Template router
// ---------------------------------------------------------------------------

function renderBody(templateSlug: TemplateSlug, data: ResumeData, sectionOrder: ResumeSectionKey[], watermark: boolean): string {
  switch (templateSlug) {
    case 'education-first':
    case 'projects-first':
      return renderProjectsFirst(data, sectionOrder, watermark);
    case 'minimal-classic':
      return renderMinimalClassic(data, sectionOrder, watermark);
    case 'modern-ats-safe':
      return renderModernAtsSafe(data, sectionOrder, watermark);
    case 'skills-emphasis':
      return renderSkillsEmphasis(data, sectionOrder, watermark);
    default:
      // All other templates fall back to the clean education-first style
      return renderEducationFirst(data, sectionOrder, watermark);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a complete HTML document for the given template and resume data.
 * No React or react-dom/server dependency — safe to use in Next.js route handlers.
 */
export function renderTemplateToFullHtml(
  templateSlug: TemplateSlug,
  data: ResumeData,
  sectionOrder: ResumeSectionKey[],
  watermark: boolean
): string {
  const bodyHtml = renderBody(templateSlug, data, sectionOrder, watermark);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    html { margin: 0; padding: 0; }
    ul { list-style-type: disc; }
    ${watermarkCSS(watermark)}
  </style>
</head>
${bodyHtml}
</html>`;
}

import type { ResumeData, ResumeSkills } from '@/types/resume';
import type { ParsedBlock } from './types';
import { emptyResumeData } from '@/lib/sample-data';

/**
 * Merges AI-extracted data into the current resumeData state.
 * Existing values are never overwritten with empty/falsy values.
 */
export function mergeAIDataIntoResume(
  blocks: ParsedBlock[],
  currentData: Partial<ResumeData>
): Partial<ResumeData> {
  let updated: Partial<ResumeData> = { ...currentData };

  for (const block of blocks) {
    if (block.tag === 'RESUME') {
      const parsed = tryParseResumeJSON(block.content);
      if (parsed) {
        updated = deepMergeResume(updated, parsed);
      }
    }

    if (block.tag === 'STRENGTHS') {
      const strengths = block.content
        .split('|')
        .map(s => s.trim())
        .filter(Boolean);
      const current: ResumeSkills = updated.skills ?? emptyResumeData.skills;
      updated = {
        ...updated,
        skills: {
          ...current,
          soft: mergeUniqueStrings(current.soft, strengths),
        },
      };
    }

    if (block.tag === 'SUMMARY') {
      // Only use the summary if it is substantial and there is nothing already set
      if (block.content.length > 50 && !updated.summary) {
        updated = { ...updated, summary: block.content };
      }
    }
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function tryParseResumeJSON(content: string): Partial<ResumeData> | null {
  try {
    // The AI may wrap the JSON in a fenced code block; extract the JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const raw = JSON.parse(jsonMatch[0]);
    return sanitizeResumeData(raw);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeResumeData(raw: any): Partial<ResumeData> {
  const result: Partial<ResumeData> = {};

  if (raw.personal && typeof raw.personal === 'object') {
    result.personal = {
      name: raw.personal.name ?? '',
      email: raw.personal.email ?? '',
      phone: raw.personal.phone ?? '',
      city: raw.personal.city ?? '',
      ...(raw.personal.linkedin ? { linkedin: raw.personal.linkedin } : {}),
      ...(raw.personal.github ? { github: raw.personal.github } : {}),
      ...(raw.personal.portfolio ? { portfolio: raw.personal.portfolio } : {}),
    };
  }

  if (raw.summary && typeof raw.summary === 'string') {
    result.summary = raw.summary;
  }

  if (Array.isArray(raw.education)) {
    result.education = raw.education.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any, i: number) => ({
        id: e.id || `edu-ai-${i}`,
        institution: e.institution || '',
        degree: e.degree || '',
        ...(e.field ? { field: e.field } : {}),
        startDate: e.startDate || '',
        ...(e.endDate ? { endDate: e.endDate } : {}),
        ...(e.grade ? { grade: e.grade } : {}),
        achievements: Array.isArray(e.achievements) ? e.achievements : [],
      })
    );
  }

  if (Array.isArray(raw.experience)) {
    result.experience = raw.experience.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any, i: number) => ({
        id: e.id || `exp-ai-${i}`,
        company: e.company || '',
        position: e.position || '',
        ...(e.location ? { location: e.location } : {}),
        startDate: e.startDate || '',
        ...(e.endDate ? { endDate: e.endDate } : {}),
        current: Boolean(e.current),
        responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : [],
      })
    );
  }

  if (Array.isArray(raw.projects)) {
    result.projects = raw.projects.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any, i: number) => ({
        id: p.id || `proj-ai-${i}`,
        name: p.name || '',
        // SCHEMA CHANGE: highlights array replaces description string
        // Backward compatibility: convert old description to highlights array
        highlights: Array.isArray(p.highlights)
          ? p.highlights
          : p.description
          ? [p.description] // Convert old string to single-item array
          : [],
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        ...(p.url ? { url: p.url } : {}),
        ...(p.startDate ? { startDate: p.startDate } : {}),
        ...(p.endDate ? { endDate: p.endDate } : {}),
      })
    );
  }

  if (raw.skills && typeof raw.skills === 'object') {
    // The AI system prompt teaches the AI to return languages as strings,
    // but ResumeSkills.languages is { name, proficiency }[]. We normalise here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawLanguages: any[] = Array.isArray(raw.skills.languages)
      ? raw.skills.languages
      : [];

    result.skills = {
      technical: Array.isArray(raw.skills.technical) ? raw.skills.technical : [],
      soft: Array.isArray(raw.skills.soft) ? raw.skills.soft : [],
      languages: rawLanguages.map(lang => {
        if (typeof lang === 'string') {
          return { name: lang, proficiency: 'Fluent' };
        }
        return {
          name: lang.name || '',
          proficiency: lang.proficiency || 'Fluent',
        };
      }),
    };
  }

  return result;
}

function deepMergeResume(
  current: Partial<ResumeData>,
  incoming: Partial<ResumeData>
): Partial<ResumeData> {
  const result: Partial<ResumeData> = { ...current };

  if (incoming.personal) {
    result.personal = { ...(current.personal ?? ({} as ResumeData['personal'])), ...incoming.personal };
  }
  if (incoming.summary) {
    result.summary = incoming.summary;
  }
  if (incoming.education?.length) {
    result.education = incoming.education;
  }
  if (incoming.experience?.length) {
    result.experience = incoming.experience;
  }
  if (incoming.projects?.length) {
    result.projects = incoming.projects;
  }
  if (incoming.skills) {
    const currentSkills = current.skills ?? emptyResumeData.skills;
    result.skills = {
      technical: mergeUniqueStrings(currentSkills.technical, incoming.skills.technical),
      soft: mergeUniqueStrings(currentSkills.soft, incoming.skills.soft),
      languages: incoming.skills.languages ?? currentSkills.languages ?? [],
    };
  }

  return result;
}

function mergeUniqueStrings(existing: string[], incoming: string[]): string[] {
  const combined = [...existing];
  for (const item of incoming) {
    if (!combined.includes(item)) {
      combined.push(item);
    }
  }
  return combined;
}

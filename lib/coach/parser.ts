import type { ParsedBlock, ResponseTag } from './types';

/**
 * Parses tagged AI responses into structured blocks.
 *
 * The AI returns text where each block starts with a tag on its own line:
 *   QUESTION: <inline content or empty, followed by indented lines>
 *   SUMMARY: ...
 *   RESUME: <JSON>
 *   STAR: <structured text>
 *   STRENGTHS: Skill A | Skill B | Skill C
 */
export function parseCoachResponse(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split('\n');

  let currentTag: ResponseTag | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const tagMatch = line.match(/^(QUESTION|SUMMARY|RESUME|STAR|STRENGTHS):\s*(.*)/);
    if (tagMatch) {
      // Flush the previous block before starting a new one
      if (currentTag !== null && currentLines.length > 0) {
        blocks.push({ tag: currentTag, content: currentLines.join('\n').trim() });
      }
      currentTag = tagMatch[1] as ResponseTag;
      // The rest of the tag line (after "TAG: ") is the first content line
      currentLines = tagMatch[2] ? [tagMatch[2]] : [];
    } else if (currentTag !== null) {
      currentLines.push(line);
    }
  }

  // Flush the final block
  if (currentTag !== null && currentLines.length > 0) {
    blocks.push({ tag: currentTag, content: currentLines.join('\n').trim() });
  }

  // Fallback: if the AI returned no recognised tags, treat the whole response as a QUESTION
  if (blocks.length === 0 && text.trim()) {
    blocks.push({ tag: 'QUESTION', content: text.trim() });
  }

  return blocks;
}

/**
 * Converts parsed blocks into a single human-readable string for the chat UI.
 *
 * - QUESTION / SUMMARY: shown as-is
 * - STRENGTHS: presented as a comma-separated list with a header
 * - STAR: presented with a header
 * - RESUME: replaced with a friendly confirmation message (the raw JSON is
 *   never shown to the user — only the preview panel reflects the data)
 */
export function getDisplayText(blocks: ParsedBlock[]): string {
  return blocks
    .map(block => {
      switch (block.tag) {
        case 'QUESTION':
          return block.content;

        case 'SUMMARY':
          return `**Summary so far:** ${block.content}`;

        case 'STRENGTHS':
          return `**Your key strengths:** ${block.content
            .split('|')
            .map(s => s.trim())
            .filter(Boolean)
            .join(', ')}`;

        case 'STAR':
          return `**Experience structured:**\n${block.content}`;

        case 'RESUME':
          return `I've drafted your CV based on our conversation! You can see it updating in the preview on the right.`;

        default:
          return block.content;
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Converts parsed blocks into TTS-friendly text (no markdown, natural speech).
 * Used for voice output only — the chat UI still uses getDisplayText().
 */
export function getVoiceText(blocks: ParsedBlock[]): string {
  return blocks
    .map(block => {
      switch (block.tag) {
        case 'QUESTION':
          // Strip markdown for natural speech
          return stripMarkdown(block.content);

        case 'SUMMARY':
          // SUMMARY is for internal AI tracking only - NEVER read aloud
          return '';

        case 'STRENGTHS':
          // Convert to natural speech: "I noticed you've got Python, teamwork, and problem solving"
          const skills = block.content
            .split('|')
            .map(s => s.trim())
            .filter(Boolean);
          if (skills.length === 0) return '';
          if (skills.length === 1) return `I noticed you've got ${skills[0]}`;
          const lastSkill = skills[skills.length - 1];
          const otherSkills = skills.slice(0, -1).join(', ');
          return `I noticed you've got ${otherSkills}, and ${lastSkill}`;

        case 'STAR':
          // Just speak the structured experience naturally
          return stripMarkdown(block.content);

        case 'RESUME':
          // Brief confirmation
          return "Alright, I've updated your CV with what we just talked about!";

        default:
          return stripMarkdown(block.content);
      }
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Strips markdown formatting for natural TTS speech.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/\*([^*]+)\*/g, '$1')      // *italic*
    .replace(/`([^`]+)`/g, '$1')        // `code`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url)
    .replace(/^#+\s+/gm, '')            // # headings
    .trim();
}

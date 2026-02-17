/**
 * Bullet Auto-Improvement System
 *
 * Automatically regenerates weak bullets using AI
 * Max 2 iterations per bullet to avoid infinite loops
 * Target: 85-90% of final bullets pass validation
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  validateBullet,
  generateImprovementPrompt,
  type BulletValidationResult
} from './bullet-validator';

const MAX_IMPROVEMENT_ITERATIONS = 2;
const TARGET_SCORE = 60;

export interface ImprovementResult {
  originalBullet: string;
  finalBullet: string;
  iterations: number;
  improved: boolean;
  finalScore: number;
  validationHistory: BulletValidationResult[];
}

/**
 * Attempt to improve a single bullet using AI
 * Returns the best version found (original or improved)
 */
export async function improveBullet(
  bullet: string,
  context: { userInput: string; section: string },
  anthropicClient: Anthropic
): Promise<ImprovementResult> {
  const validationHistory: BulletValidationResult[] = [];
  let currentBullet = bullet;
  let iterations = 0;

  // Validate original bullet
  const initialValidation = validateBullet(bullet);
  validationHistory.push(initialValidation);

  // If already good, return as-is
  if (initialValidation.isValid) {
    return {
      originalBullet: bullet,
      finalBullet: bullet,
      iterations: 0,
      improved: false,
      finalScore: initialValidation.score.overall,
      validationHistory
    };
  }

  // Try to improve up to MAX_IMPROVEMENT_ITERATIONS times
  while (iterations < MAX_IMPROVEMENT_ITERATIONS) {
    iterations++;

    const validation = validateBullet(currentBullet);

    // If current version is good enough, stop
    if (validation.isValid) {
      return {
        originalBullet: bullet,
        finalBullet: currentBullet,
        iterations,
        improved: true,
        finalScore: validation.score.overall,
        validationHistory
      };
    }

    // Generate improvement prompt
    const prompt = generateImprovementPrompt(currentBullet, validation, context);

    try {
      // Call Claude to regenerate bullet
      const message = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 200, // Bullets are short
        temperature: 0.3, // Low temperature for consistency
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Extract improved bullet from response
      const improvedBullet = extractBulletFromResponse(message.content);

      if (improvedBullet && improvedBullet !== currentBullet) {
        currentBullet = improvedBullet;
        const newValidation = validateBullet(currentBullet);
        validationHistory.push(newValidation);

        // If improved enough, stop
        if (newValidation.score.overall >= TARGET_SCORE) {
          return {
            originalBullet: bullet,
            finalBullet: currentBullet,
            iterations,
            improved: true,
            finalScore: newValidation.score.overall,
            validationHistory
          };
        }
      } else {
        // AI didn't generate a new bullet, stop trying
        break;
      }
    } catch (error) {
      console.error('[Bullet Improver] API error:', error);
      break; // Don't retry on API errors
    }
  }

  // Return best version found (could still be below threshold)
  const finalValidation = validateBullet(currentBullet);
  return {
    originalBullet: bullet,
    finalBullet: currentBullet,
    iterations,
    improved: currentBullet !== bullet,
    finalScore: finalValidation.score.overall,
    validationHistory
  };
}

/**
 * Extract clean bullet text from Claude's response
 * Handles various response formats (quotes, markdown, etc.)
 */
function extractBulletFromResponse(content: Anthropic.ContentBlock[]): string | null {
  // Extract text from content blocks
  const textContent = content
    .filter(block => block.type === 'text')
    .map(block => (block as Anthropic.TextBlock).text)
    .join('\n')
    .trim();

  if (!textContent) return null;

  // Remove common artifacts
  let cleaned = textContent
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/^-\s*/, '') // Remove leading dash
    .replace(/^\*\s*/, '') // Remove leading asterisk
    .replace(/^✅\s*/, '') // Remove checkmark
    .replace(/^Improved bullet:\s*/i, '') // Remove label
    .replace(/^Rewritten:\s*/i, '') // Remove label
    .trim();

  // Take first line if multiple lines
  const firstLine = cleaned.split('\n')[0].trim();

  return firstLine || null;
}

/**
 * Improve all bullets in a list
 * Returns improved bullets and statistics
 */
export interface BulletBatchImprovementResult {
  originalBullets: string[];
  improvedBullets: string[];
  totalImproved: number;
  totalIterations: number;
  passRateBefore: number;
  passRateAfter: number;
  results: ImprovementResult[];
}

export async function improveBulletBatch(
  bullets: string[],
  context: { userInput: string; section: string },
  anthropicClient: Anthropic
): Promise<BulletBatchImprovementResult> {
  const results: ImprovementResult[] = [];

  // Improve each bullet sequentially (to avoid rate limits)
  for (const bullet of bullets) {
    const result = await improveBullet(bullet, context, anthropicClient);
    results.push(result);
  }

  // Calculate statistics
  const originalBullets = results.map(r => r.originalBullet);
  const improvedBullets = results.map(r => r.finalBullet);
  const totalImproved = results.filter(r => r.improved).length;
  const totalIterations = results.reduce((sum, r) => sum + r.iterations, 0);

  const passedBefore = results.filter(r => r.validationHistory[0].isValid).length;
  const passedAfter = results.filter(r => r.finalScore >= TARGET_SCORE).length;

  return {
    originalBullets,
    improvedBullets,
    totalImproved,
    totalIterations,
    passRateBefore: (passedBefore / bullets.length) * 100,
    passRateAfter: (passedAfter / bullets.length) * 100,
    results
  };
}

/**
 * Generate human-readable improvement report
 */
export function generateImprovementReport(result: BulletBatchImprovementResult): string {
  const report = [
    '=== BULLET IMPROVEMENT REPORT ===',
    '',
    `Total bullets: ${result.originalBullets.length}`,
    `Improved: ${result.totalImproved} (${((result.totalImproved / result.originalBullets.length) * 100).toFixed(1)}%)`,
    `Total AI iterations: ${result.totalIterations}`,
    `Pass rate before: ${result.passRateBefore.toFixed(1)}%`,
    `Pass rate after: ${result.passRateAfter.toFixed(1)}%`,
    `Improvement: +${(result.passRateAfter - result.passRateBefore).toFixed(1)}%`,
    '',
    '=== INDIVIDUAL IMPROVEMENTS ===',
    ''
  ];

  result.results.forEach((r, index) => {
    const scoreChange = r.finalScore - r.validationHistory[0].score.overall;
    const status = r.improved ? '✅ IMPROVED' : '➖ UNCHANGED';

    report.push(
      `Bullet ${index + 1}: ${status}`,
      `  Before (${Math.round(r.validationHistory[0].score.overall)}/100): "${r.originalBullet}"`,
      `  After  (${Math.round(r.finalScore)}/100): "${r.finalBullet}"`,
      `  Change: ${scoreChange > 0 ? '+' : ''}${Math.round(scoreChange)} points`,
      `  Iterations: ${r.iterations}`,
      ''
    );
  });

  return report.join('\n');
}

/**
 * HR-Quality Bullet Point Validator
 *
 * Validates CV bullet points using a 4-dimensional scoring system:
 * 1. Action Verb (0-100): Strong verbs like "Built", "Led" vs weak "Worked", "Helped"
 * 2. Tools/Technologies (0-100): Specific tools mentioned (React, Python, etc.)
 * 3. Result/Outcome (0-100): Clear result stated ("resulting in", "improving")
 * 4. Metrics (0-100): Quantifiable data (percentages, numbers, time saved)
 *
 * Overall score: Average of 4 dimensions
 * Pass threshold: 60/100
 *
 * Target: 85-90% of generated bullets pass validation
 */

export interface BulletScore {
  actionVerb: number;
  tools: number;
  result: number;
  metric: number;
  overall: number;
}

export interface BulletValidationResult {
  isValid: boolean;
  score: BulletScore;
  feedback: string[];
  suggestions: string[];
}

// Strong action verbs (HR-approved)
const STRONG_VERBS = [
  'led', 'developed', 'implemented', 'designed', 'built', 'created',
  'optimized', 'optimised', 'reduced', 'increased', 'achieved', 'delivered',
  'managed', 'coordinated', 'analyzed', 'analysed', 'improved', 'launched',
  'established', 'streamlined', 'enhanced', 'automated', 'migrated', 'refactored',
  'architected', 'deployed', 'orchestrated', 'spearheaded', 'pioneered',
  'transformed', 'scaled', 'accelerated', 'expanded', 'negotiated'
];

// Weak verbs to avoid
const WEAK_VERBS = [
  'worked', 'helped', 'assisted', 'participated', 'involved',
  'responsible', 'tasked', 'used', 'did', 'made', 'contributed'
];

/**
 * Main validation function
 * Returns detailed scoring and actionable feedback
 */
export function validateBullet(bullet: string): BulletValidationResult {
  const scores = {
    actionVerb: checkActionVerb(bullet),
    tools: checkTools(bullet),
    result: checkResult(bullet),
    metric: checkMetric(bullet)
  };

  const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;

  const feedback: string[] = [];
  const suggestions: string[] = [];

  // Generate specific feedback based on scores
  if (scores.actionVerb < 60) {
    feedback.push('Weak or missing action verb');
    suggestions.push('Start with a strong action verb: Built, Developed, Led, Implemented, Optimized');
  }

  if (scores.tools < 60) {
    feedback.push('No tools or technologies mentioned');
    suggestions.push('Add specific tools: "using React and Node.js", "with Python and SQL"');
  }

  if (scores.result < 60) {
    feedback.push('No clear result or outcome');
    suggestions.push('Add outcome: "resulting in 40% improvement", "leading to £10k savings"');
  }

  if (scores.metric < 60) {
    feedback.push('No quantifiable metrics');
    suggestions.push('Add numbers: percentages (40%), user counts (500+), time saved (10 hours/week)');
  }

  return {
    isValid: overall >= 60,
    score: { ...scores, overall },
    feedback,
    suggestions
  };
}

/**
 * Check 1: Action Verb Quality
 * Strong verbs = 100, Weak verbs = 30, None = 0
 */
function checkActionVerb(bullet: string): number {
  const firstWord = bullet.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();

  if (STRONG_VERBS.includes(firstWord)) return 100;
  if (WEAK_VERBS.includes(firstWord)) return 30;

  // Check for past tense verb (general pattern)
  if (/^[a-z]+ed$/i.test(firstWord)) return 60;

  // No clear action verb
  return 0;
}

/**
 * Check 2: Tools/Technologies Mentioned
 * 2+ tools = 100, 1 tool = 70, None = 0
 */
function checkTools(bullet: string): number {
  // Common tools/technologies patterns
  const toolPatterns = [
    // Framework/Language names
    /\b(React|Vue|Angular|Svelte|Next\.js|Nuxt|TypeScript|JavaScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/i,

    // Backend/Database
    /\b(Node\.js|Express|Django|Flask|Spring|Rails|Laravel|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b/i,

    // Cloud/DevOps
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitHub Actions|GitLab CI|Terraform|Ansible)\b/i,

    // Tools/Methodologies
    /\b(Git|Jira|Confluence|Slack|Figma|Agile|Scrum|Kanban|CI\/CD|TDD|REST|GraphQL|gRPC)\b/i,

    // Data/Analytics
    /\b(SQL|NoSQL|Pandas|NumPy|TensorFlow|PyTorch|Tableau|Power BI|Excel|Google Analytics)\b/i,

    // Generic tool patterns
    /using\s+[\w\s,&.+-]+/i,
    /with\s+[\w\s,&.+-]+/i,
    /via\s+[\w\s,&.+-]+/i,
    /in\s+[\w\s,&.+-]+/i
  ];

  const uniqueMatches = new Set<string>();

  toolPatterns.forEach(pattern => {
    const matches = bullet.match(pattern);
    if (matches) {
      matches.forEach(match => uniqueMatches.add(match.toLowerCase()));
    }
  });

  const matchCount = uniqueMatches.size;

  if (matchCount >= 2) return 100;
  if (matchCount === 1) return 70;
  return 0;
}

/**
 * Check 3: Result/Outcome Stated
 * Clear result = 100, Implied result = 70, None = 0
 */
function checkResult(bullet: string): number {
  // Result indicators
  const resultKeywords = [
    'resulting in', 'leading to', 'which', 'enabling', 'to achieve',
    'that', 'improving', 'reducing', 'increasing', 'enhancing'
  ];

  // Outcome-focused verbs
  const outcomeVerbs = [
    /improved\s+\w+/i,
    /reduced\s+\w+/i,
    /increased\s+\w+/i,
    /enhanced\s+\w+/i,
    /streamlined\s+\w+/i,
    /delivered\s+\w+/i,
    /achieved\s+\w+/i,
    /accelerated\s+\w+/i,
    /optimized\s+\w+/i,
    /optimised\s+\w+/i
  ];

  const hasKeyword = resultKeywords.some(kw => bullet.toLowerCase().includes(kw));
  const hasOutcomeVerb = outcomeVerbs.some(pattern => pattern.test(bullet));

  if (hasKeyword && hasOutcomeVerb) return 100;
  if (hasKeyword || hasOutcomeVerb) return 70;
  return 0;
}

/**
 * Check 4: Quantifiable Metrics
 * 2+ metrics = 100, 1 metric = 80, None = 0
 */
function checkMetric(bullet: string): number {
  const metricPatterns = [
    // Percentages
    /\d+%/,
    /\d+\s*percent/i,

    // Multipliers
    /\d+x/i,
    /\d+-fold/i,

    // User/customer counts
    /\d+[km]?\+?\s*(users|customers|students|members|people|clients|visitors|downloads)/i,

    // Money
    /[£$€]\d+[km]?/,
    /\d+[km]?\s*(pounds|dollars|euros)/i,

    // Time
    /\d+\s*(hours?|days?|weeks?|months?|years?)/i,
    /\d+:\d+/,  // HH:MM format

    // Team size
    /\d+\s*-?\s*(person|people|member|team|developer|engineer)/i,

    // Ratings/scores
    /\d+\.\d+\s*(star|rating|score)/i,
    /\d+\/\d+/,  // 4/5, 9/10

    // Performance metrics
    /\d+\.\d+[smh]/i,  // 800ms, 2.5s, 1.2h
    /\d+\s*(ms|seconds?|minutes?)/i,

    // Rankings
    /\b(first|second|third|1st|2nd|3rd)\s*(place|prize|rank)/i,

    // Scale indicators
    /\d+[km]?\+/,  // 500+, 10k+
    /over\s+\d+/i,
    /more than\s+\d+/i,
    /up to\s+\d+/i
  ];

  const matchCount = metricPatterns.filter(pattern => pattern.test(bullet)).length;

  if (matchCount >= 2) return 100;
  if (matchCount === 1) return 80;
  return 0;
}

/**
 * Generate improvement prompt for AI to regenerate weak bullets
 */
export function generateImprovementPrompt(
  bullet: string,
  validation: BulletValidationResult,
  context: { userInput: string; section: string }
): string {
  return `
The following bullet point needs improvement to meet HR quality standards:

CURRENT BULLET:
"${bullet}"

QUALITY SCORES:
- Action verb: ${validation.score.actionVerb}/100 ${validation.score.actionVerb < 60 ? '❌' : '✅'}
- Tools/technologies: ${validation.score.tools}/100 ${validation.score.tools < 60 ? '❌' : '✅'}
- Result/outcome: ${validation.score.result}/100 ${validation.score.result < 60 ? '❌' : '✅'}
- Metrics: ${validation.score.metric}/100 ${validation.score.metric < 60 ? '❌' : '✅'}
- OVERALL: ${Math.round(validation.score.overall)}/100 ${validation.score.overall < 60 ? '❌ FAIL' : '✅ PASS'}

WHAT'S MISSING:
${validation.feedback.map(f => `- ${f}`).join('\n')}

HOW TO IMPROVE:
${validation.suggestions.map(s => `- ${s}`).join('\n')}

ORIGINAL USER DESCRIPTION:
"${context.userInput}"

CONTEXT:
Section: ${context.section}

TASK:
Rewrite this bullet to score 80+ overall. Follow the formula:
[Strong Action Verb] + [Specific Tools] + [Clear Result] + [Quantifiable Metric]

EXAMPLES OF EXCELLENT BULLETS (80-100 score):
✅ "Built React-based event management platform for 200+ students, increasing attendance by 35%"
✅ "Led team of 4 developers using Agile methodology, delivering project 2 weeks ahead of schedule"
✅ "Optimized SQL queries reducing page load time from 3s to 800ms, improving user satisfaction by 40%"

Return ONLY the improved bullet point (no explanation, no quotes).
  `.trim();
}

/**
 * Validate multiple bullets and return aggregate statistics
 */
export interface BulletBatchValidation {
  totalBullets: number;
  passedBullets: number;
  failedBullets: number;
  passRate: number;
  averageScore: number;
  results: BulletValidationResult[];
}

export function validateBulletBatch(bullets: string[]): BulletBatchValidation {
  const results = bullets.map(validateBullet);

  const passedBullets = results.filter(r => r.isValid).length;
  const failedBullets = results.length - passedBullets;
  const averageScore = results.reduce((sum, r) => sum + r.score.overall, 0) / results.length;

  return {
    totalBullets: bullets.length,
    passedBullets,
    failedBullets,
    passRate: (passedBullets / bullets.length) * 100,
    averageScore,
    results
  };
}

/**
 * Generate detailed report for debugging/analytics
 */
export function generateValidationReport(validation: BulletBatchValidation): string {
  const report = [
    '=== BULLET QUALITY VALIDATION REPORT ===',
    '',
    `Total bullets: ${validation.totalBullets}`,
    `Passed (≥60): ${validation.passedBullets} (${validation.passRate.toFixed(1)}%)`,
    `Failed (<60): ${validation.failedBullets}`,
    `Average score: ${validation.averageScore.toFixed(1)}/100`,
    '',
    '=== INDIVIDUAL SCORES ===',
    ''
  ];

  validation.results.forEach((result, index) => {
    const status = result.isValid ? '✅ PASS' : '❌ FAIL';
    report.push(
      `Bullet ${index + 1}: ${status} (${Math.round(result.score.overall)}/100)`,
      `  - Action verb: ${result.score.actionVerb}/100`,
      `  - Tools: ${result.score.tools}/100`,
      `  - Result: ${result.score.result}/100`,
      `  - Metric: ${result.score.metric}/100`
    );

    if (!result.isValid) {
      report.push(`  - Issues: ${result.feedback.join(', ')}`);
    }

    report.push('');
  });

  return report.join('\n');
}

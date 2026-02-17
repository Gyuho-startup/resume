/**
 * Bullet Validator Test Suite
 *
 * Tests the HR-quality validation system with real-world examples
 * Target: 85-90% pass rate on well-formed bullets
 */

import {
  validateBullet,
  validateBulletBatch,
  generateValidationReport,
  type BulletValidationResult
} from './bullet-validator';

// ========================================
// TEST CASES: STRONG BULLETS (Should Pass)
// ========================================

const STRONG_BULLETS = [
  // Perfect bullets (90-100 score expected)
  "Built React-based event management platform for 200+ students, increasing attendance by 35%",
  "Led team of 4 developers using Agile methodology, delivering project 2 weeks ahead of schedule",
  "Optimized SQL queries reducing page load time from 3s to 800ms, improving user satisfaction by 40%",
  "Designed Python automation script processing 1000+ daily invoices, saving 10 hours/week",
  "Implemented JWT-based authentication system with role-based access control, reducing unauthorized access by 95%",

  // Good bullets (70-90 score expected)
  "Developed full-stack web application using React and Node.js, serving 500+ users",
  "Managed social media campaigns reaching 10k+ followers, increasing engagement by 25%",
  "Created automated testing suite using Jest and Cypress, reducing bugs by 60%",
  "Launched mobile app with Flutter, achieving 4.8-star rating from 1000+ downloads",
  "Coordinated team of 5 volunteers, organizing 3 events with 300+ total attendees",
];

// ========================================
// TEST CASES: WEAK BULLETS (Should Fail)
// ========================================

const WEAK_BULLETS = [
  // No metrics
  "Worked on a website using React",
  "Helped the team with customer service",
  "Responsible for testing and debugging",

  // No tools
  "Improved the system performance significantly",
  "Managed a project successfully",

  // No result
  "Used Python and SQL for data analysis",
  "Participated in team meetings and discussions",

  // Weak verb + vague
  "Assisted with various tasks",
  "Involved in the development process",
  "Contributed to team success"
];

// ========================================
// RUN TESTS
// ========================================

console.log('🧪 BULLET VALIDATOR TEST SUITE\n');
console.log('Target: 85-90% pass rate for strong bullets\n');
console.log('=' .repeat(60));

// Test 1: Strong bullets should pass
console.log('\n📊 TEST 1: STRONG BULLETS (Expected: 90-100% pass rate)');
console.log('=' .repeat(60));

const strongResults = validateBulletBatch(STRONG_BULLETS);
console.log(generateValidationReport(strongResults));

if (strongResults.passRate >= 85) {
  console.log('✅ TEST PASSED: Strong bullets achieve target pass rate');
} else {
  console.log(`❌ TEST FAILED: Pass rate ${strongResults.passRate.toFixed(1)}% is below 85% target`);
}

// Test 2: Weak bullets should fail
console.log('\n📊 TEST 2: WEAK BULLETS (Expected: 0-20% pass rate)');
console.log('=' .repeat(60));

const weakResults = validateBulletBatch(WEAK_BULLETS);
console.log(generateValidationReport(weakResults));

if (weakResults.passRate <= 20) {
  console.log('✅ TEST PASSED: Weak bullets correctly identified');
} else {
  console.log(`❌ TEST FAILED: Pass rate ${weakResults.passRate.toFixed(1)}% is too high (should be ≤20%)`);
}

// Test 3: Individual component scoring
console.log('\n📊 TEST 3: COMPONENT SCORING BREAKDOWN');
console.log('=' .repeat(60));

const testBullet = "Built React dashboard serving 500+ users, improving response time by 40%";
const result = validateBullet(testBullet);

console.log(`\nTest bullet: "${testBullet}"\n`);
console.log('Score breakdown:');
console.log(`  Action verb:  ${result.score.actionVerb}/100 ${'█'.repeat(result.score.actionVerb / 10)}`);
console.log(`  Tools:        ${result.score.tools}/100 ${'█'.repeat(result.score.tools / 10)}`);
console.log(`  Result:       ${result.score.result}/100 ${'█'.repeat(result.score.result / 10)}`);
console.log(`  Metric:       ${result.score.metric}/100 ${'█'.repeat(result.score.metric / 10)}`);
console.log(`  OVERALL:      ${Math.round(result.score.overall)}/100 ${result.isValid ? '✅ PASS' : '❌ FAIL'}`);

// Test 4: Improvement suggestions
console.log('\n📊 TEST 4: IMPROVEMENT SUGGESTIONS');
console.log('=' .repeat(60));

const weakBullet = "Worked on customer service";
const weakResult = validateBullet(weakBullet);

console.log(`\nWeak bullet: "${weakBullet}"`);
console.log(`Overall score: ${Math.round(weakResult.score.overall)}/100 ❌ FAIL\n`);
console.log('Feedback:');
weakResult.feedback.forEach(f => console.log(`  • ${f}`));
console.log('\nSuggestions:');
weakResult.suggestions.forEach(s => console.log(`  • ${s}`));

// Test 5: Edge cases
console.log('\n📊 TEST 5: EDGE CASES');
console.log('=' .repeat(60));

const edgeCases = [
  { bullet: "", desc: "Empty string" },
  { bullet: "Built", desc: "Single word" },
  { bullet: "Led team successfully", desc: "No metrics or tools" },
  { bullet: "Improved performance by 50% using React and reducing load time by 2s", desc: "Multiple metrics" }
];

edgeCases.forEach(({ bullet, desc }) => {
  const result = validateBullet(bullet);
  console.log(`\n${desc}: "${bullet}"`);
  console.log(`  Score: ${Math.round(result.score.overall)}/100 ${result.isValid ? '✅' : '❌'}`);
});

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📈 SUMMARY');
console.log('=' .repeat(60));
console.log(`Strong bullets pass rate: ${strongResults.passRate.toFixed(1)}% (target: ≥85%)`);
console.log(`Weak bullets pass rate: ${weakResults.passRate.toFixed(1)}% (target: ≤20%)`);
console.log(`Average score (strong): ${strongResults.averageScore.toFixed(1)}/100`);
console.log(`Average score (weak): ${weakResults.averageScore.toFixed(1)}/100`);

const overallSuccess = strongResults.passRate >= 85 && weakResults.passRate <= 20;
console.log(`\n${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

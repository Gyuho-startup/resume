#!/usr/bin/env tsx
/**
 * Test script for token-based payment gate
 * Simulates API calls and verifies payment gate triggers at $0.02
 */

// Simulate token usage calculation
function calculateCost(inputTokens: number, outputTokens: number): number {
  const INPUT_COST_PER_MILLION = 3.0;
  const OUTPUT_COST_PER_MILLION = 15.0;

  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  return inputCost + outputCost;
}

// Test scenarios (updated for $0.02 threshold)
const scenarios = [
  {
    name: "Turn 1: Below new threshold",
    input: 1000,
    output: 500,
    expectedCost: 0.0105,
    shouldTrigger: false,
  },
  {
    name: "Turn 1: Well below threshold",
    input: 800,
    output: 200,
    expectedCost: 0.0054,
    shouldTrigger: false,
  },
  {
    name: "Turn 2: Cumulative still below threshold",
    input: 600,
    output: 300,
    expectedCost: 0.0063,
    existingCost: 0.0054,
    cumulativeCost: 0.0117,
    shouldTrigger: false,
  },
  {
    name: "Turn 3: Cumulative should trigger",
    input: 800,
    output: 400,
    expectedCost: 0.0084,
    existingCost: 0.0117,
    cumulativeCost: 0.0201,
    shouldTrigger: true,
  },
  {
    name: "Minimal conversation",
    input: 500,
    output: 200,
    expectedCost: 0.0045,
    shouldTrigger: false,
  },
  {
    name: "Large single conversation",
    input: 2000,
    output: 1000,
    expectedCost: 0.021,
    shouldTrigger: true,
  },
];

console.log("🧪 Testing Token-Based Payment Gate\n");
console.log("=" .repeat(60));
console.log("Pricing: Input=$3/M tokens, Output=$15/M tokens");
console.log("Threshold: $0.02 USD cumulative cost");
console.log("=" .repeat(60) + "\n");

let passed = 0;
let failed = 0;

for (const scenario of scenarios) {
  console.log(`\n📝 ${scenario.name}`);
  console.log("-".repeat(60));

  const cost = calculateCost(scenario.input, scenario.output);
  const cumulativeCost = scenario.existingCost
    ? scenario.existingCost + cost
    : cost;

  console.log(`Input tokens:  ${scenario.input.toLocaleString()}`);
  console.log(`Output tokens: ${scenario.output.toLocaleString()}`);
  console.log(`Turn cost:     $${cost.toFixed(4)}`);

  if (scenario.existingCost !== undefined) {
    console.log(`Existing cost: $${scenario.existingCost.toFixed(4)}`);
    console.log(`Cumulative:    $${cumulativeCost.toFixed(4)}`);
  }

  const shouldTrigger = cumulativeCost >= 0.02;
  const matches = shouldTrigger === scenario.shouldTrigger;

  console.log(`\nPayment gate: ${shouldTrigger ? "🔒 TRIGGERED" : "✅ NOT TRIGGERED"}`);
  console.log(`Expected:     ${scenario.shouldTrigger ? "🔒 TRIGGERED" : "✅ NOT TRIGGERED"}`);

  if (matches) {
    console.log("✅ PASS");
    passed++;
  } else {
    console.log("❌ FAIL");
    failed++;
  }
}

console.log("\n" + "=".repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log("\n" + "=".repeat(60));

if (failed === 0) {
  console.log("\n🎉 All tests passed! Payment gate logic is working correctly.\n");
  process.exit(0);
} else {
  console.log("\n❌ Some tests failed. Please review the logic.\n");
  process.exit(1);
}

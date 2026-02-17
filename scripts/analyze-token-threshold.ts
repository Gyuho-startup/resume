#!/usr/bin/env tsx
/**
 * Analyze token usage threshold rationale
 */

interface ConversationScenario {
  name: string;
  description: string;
  inputTokens: number;
  outputTokens: number;
  turns: number;
}

function calculateCost(input: number, output: number): number {
  return (input / 1_000_000) * 3.0 + (output / 1_000_000) * 15.0;
}

const scenarios: ConversationScenario[] = [
  {
    name: "최소한의 대화 (짧은 답변)",
    description: "Q: 어떤 직무 찾으세요? A: 프론트엔드 개발자요",
    inputTokens: 300,
    outputTokens: 150,
    turns: 1,
  },
  {
    name: "보통 대화 (중간 길이)",
    description: "경험에 대해 2-3문장으로 설명",
    inputTokens: 600,
    outputTokens: 300,
    turns: 1,
  },
  {
    name: "상세한 대화 (긴 답변)",
    description: "프로젝트 경험을 여러 문단으로 자세히 설명",
    inputTokens: 1200,
    outputTokens: 600,
    turns: 1,
  },
  {
    name: "매우 상세한 답변",
    description: "이력서에 들어갈 모든 내용을 한번에 설명",
    inputTokens: 2000,
    outputTokens: 1000,
    turns: 1,
  },
  {
    name: "3턴 짧은 대화 (누적)",
    description: "여러 짧은 질문-답변 반복",
    inputTokens: 400 * 3,
    outputTokens: 250 * 3,
    turns: 3,
  },
  {
    name: "5턴 보통 대화 (누적)",
    description: "정상적인 인터뷰 진행",
    inputTokens: 500 * 5,
    outputTokens: 300 * 5,
    turns: 5,
  },
];

console.log("🎯 토큰 사용량 임계값 분석\n");
console.log("=".repeat(80));
console.log("현재 설정: $0.01 USD (결제 게이트 트리거)");
console.log("가격 정책: Input=$3/M tokens, Output=$15/M tokens");
console.log("=".repeat(80) + "\n");

console.log("📊 일반적인 대화 패턴별 비용 분석:\n");

scenarios.forEach((scenario, idx) => {
  const cost = calculateCost(scenario.inputTokens, scenario.outputTokens);
  const percentOfThreshold = (cost / 0.01) * 100;
  const willTrigger = cost >= 0.01;

  console.log(`${idx + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log(`   - Input: ${scenario.inputTokens.toLocaleString()} tokens`);
  console.log(`   - Output: ${scenario.outputTokens.toLocaleString()} tokens`);
  if (scenario.turns > 1) {
    console.log(`   - 턴 수: ${scenario.turns}턴 (누적)`);
  }
  console.log(`   - 비용: $${cost.toFixed(4)} (임계값의 ${percentOfThreshold.toFixed(0)}%)`);
  console.log(`   - 결제 게이트: ${willTrigger ? "🔒 트리거됨" : "✅ 통과"}`);
  console.log();
});

console.log("\n" + "=".repeat(80));
console.log("\n💡 주요 인사이트:\n");

// Calculate break-even points
const minTokensToTrigger = {
  inputOnly: Math.ceil(0.01 / 3.0 * 1_000_000),
  outputOnly: Math.ceil(0.01 / 15.0 * 1_000_000),
  balanced: Math.ceil((0.01 / 18.0) * 1_000_000), // assuming 1:1 ratio
};

console.log("1. 최소 토큰 수 (결제 게이트 트리거):");
console.log(`   - Input만: ${minTokensToTrigger.inputOnly.toLocaleString()} tokens`);
console.log(`   - Output만: ${minTokensToTrigger.outputOnly.toLocaleString()} tokens`);
console.log(`   - 균형(1:1): Input ${Math.ceil(minTokensToTrigger.balanced / 2).toLocaleString()} + Output ${Math.ceil(minTokensToTrigger.balanced / 2).toLocaleString()} tokens\n`);

console.log("2. 실제 대화 패턴 분석:");
console.log(`   - 짧은 답변 (300/150): 임계값의 ${((calculateCost(300, 150) / 0.01) * 100).toFixed(0)}%`);
console.log(`   - 보통 답변 (600/300): 임계값의 ${((calculateCost(600, 300) / 0.01) * 100).toFixed(0)}%`);
console.log(`   - 상세한 답변 (1200/600): 임계값의 ${((calculateCost(1200, 600) / 0.01) * 100).toFixed(0)}%`);
console.log(`   - 매우 상세 (2000/1000): 임계값의 ${((calculateCost(2000, 1000) / 0.01) * 100).toFixed(0)}%\n`);

console.log("3. 누적 대화 시나리오:");
const turnsToTrigger = Math.ceil(0.01 / calculateCost(500, 300));
console.log(`   - 보통 대화(500/300) 기준: 약 ${turnsToTrigger}턴에 트리거`);
console.log(`   - 짧은 대화(300/150) 기준: 약 ${Math.ceil(0.01 / calculateCost(300, 150))}턴에 트리거\n`);

console.log("\n" + "=".repeat(80));
console.log("\n🎯 임계값 설정 고려사항:\n");

console.log("현재 $0.01 임계값의 의미:");
console.log("• 장점:");
console.log("  - 사용자가 충분한 가치(1-2턴 상세 대화)를 경험한 후 결제 요청");
console.log("  - 악의적 API 남용 방지 (무료로 무한 사용 불가)");
console.log("  - 서비스 비용 예측 가능");
console.log("\n• 단점:");
console.log("  - 매우 상세한 첫 응답 시 즉시 트리거 가능");
console.log("  - 사용자가 충분한 가치를 느끼기 전에 결제 요청될 수 있음");

console.log("\n💰 대안 임계값 제안:\n");

const alternatives = [
  { threshold: 0.005, description: "더 빠른 수익화, 하지만 사용자 이탈 위험" },
  { threshold: 0.01, description: "⭐ 현재 설정 (균형잡힌 선택)" },
  { threshold: 0.02, description: "더 많은 무료 체험, 수익화 지연" },
  { threshold: 0.05, description: "매우 관대한 무료 체험 (5턴 이상 보장)" },
];

alternatives.forEach(alt => {
  const turnsAt500_300 = Math.ceil(alt.threshold / calculateCost(500, 300));
  console.log(`${alt.threshold === 0.01 ? "⭐" : " "} $${alt.threshold.toFixed(3)}: ${alt.description}`);
  console.log(`    → 보통 대화 기준 약 ${turnsAt500_300}턴 보장`);
});

console.log("\n" + "=".repeat(80));
console.log("\n✅ 결론: $0.01은 합리적인 초기 설정이나, 실제 사용 패턴 분석 후 조정 권장\n");

import { formatCents } from '@/lib/money';
import type { SimulationResult } from '@/simulation/types';
import type { ScenarioDelta } from '@/simulation/comparison';
import type { RecommendationType } from './agent-types';
import type { MenuAnalysis } from './menu-profit-agent';
import type { StaffingAnalysis } from './staffing-agent';

export interface AdvisorInput {
  scenarioName: string;
  scenarioType: string;
  baseline: SimulationResult;
  scenario: SimulationResult;
  delta: ScenarioDelta;
  dataQualityScore: number;
  menuAnalysis: MenuAnalysis;
  staffingAnalysis: StaffingAnalysis;
}

export function generateRecommendation(input: AdvisorInput): RecommendationType {
  const { delta, dataQualityScore, staffingAnalysis, baseline, scenario, scenarioName } = input;

  // Decision
  type DecisionKey = 'RECOMMENDED' | 'NOT_RECOMMENDED' | 'TEST_FIRST' | 'NEED_MORE_DATA';
  let decision: DecisionKey;

  if (dataQualityScore < 50) {
    decision = 'NEED_MORE_DATA';
  } else if (delta.netProfitDeltaCents < -10_000 && delta.revenueChangePercent < -5) {
    decision = 'NOT_RECOMMENDED';
  } else if (
    delta.netProfitDeltaCents > 0 &&
    delta.avgWaitRiskDelta <= 10 &&
    staffingAnalysis.bottleneckCount <= baseline.bottlenecks.length
  ) {
    decision = 'RECOMMENDED';
  } else {
    decision = 'TEST_FIRST';
  }

  // Confidence
  type ConfidenceKey = 'LOW' | 'MEDIUM' | 'HIGH';
  let confidence: ConfidenceKey;
  if (dataQualityScore < 70) {
    confidence = 'LOW';
  } else if (Math.abs(delta.netProfitDeltaCents) > 50_000 && delta.avgWaitRiskDelta <= 5) {
    confidence = 'HIGH';
  } else {
    confidence = 'MEDIUM';
  }

  // Evidence
  const evidence: string[] = [];
  if (delta.revenueDeltaCents !== 0) {
    const dir = delta.revenueDeltaCents > 0 ? 'increases' : 'decreases';
    evidence.push(
      `Estimated weekly revenue ${dir} by ${formatCents(Math.abs(delta.revenueDeltaCents))} (${delta.revenueChangePercent.toFixed(1)}%)`,
    );
  }
  if (delta.netProfitDeltaCents !== 0) {
    const dir = delta.netProfitDeltaCents > 0 ? 'improves' : 'decreases';
    evidence.push(
      `Estimated net profit ${dir} by ${formatCents(Math.abs(delta.netProfitDeltaCents))} per week`,
    );
  }
  if (Math.abs(delta.ordersDelta) >= 1) {
    const dir = delta.ordersDelta > 0 ? 'more' : 'fewer';
    evidence.push(`Approximately ${Math.abs(Math.round(delta.ordersDelta))} ${dir} orders per week`);
  }
  if (delta.avgWaitRiskDelta > 5) {
    evidence.push(
      `Wait risk increases by ${delta.avgWaitRiskDelta.toFixed(0)} points — higher kitchen/service load`,
    );
  }
  if (input.menuAnalysis.suggestions.length > 0) {
    evidence.push(input.menuAnalysis.suggestions[0]);
  }

  // Risks
  const risks: string[] = [];
  const newBottlenecks = scenario.bottlenecks.length - baseline.bottlenecks.length;
  if (newBottlenecks > 0) risks.push(`${newBottlenecks} new capacity bottleneck(s) introduced`);
  if (delta.avgWaitRiskDelta > 10) risks.push('Significant wait risk increase — service quality may suffer');
  if (delta.foodCostPercentDelta > 2) risks.push(`Food cost % rises by ${delta.foodCostPercentDelta.toFixed(1)} pts`);
  if (delta.laborCostPercentDelta > 2) risks.push(`Labor cost % rises by ${delta.laborCostPercentDelta.toFixed(1)} pts`);
  if (risks.length === 0) risks.push('No significant operational risks identified from simulation data');

  // Summary templates
  const summaries: Record<DecisionKey, string> = {
    RECOMMENDED: `"${scenarioName}" shows a net profit improvement of ${formatCents(delta.netProfitDeltaCents)} per week with acceptable risk. Data supports implementing this change.`,
    NOT_RECOMMENDED: `"${scenarioName}" reduces estimated net profit by ${formatCents(Math.abs(delta.netProfitDeltaCents))} per week. Current data does not support this change.`,
    TEST_FIRST: `"${scenarioName}" shows ${delta.netProfitDeltaCents > 0 ? `a potential gain of ${formatCents(delta.netProfitDeltaCents)}` : 'mixed results'} but carries operational risk. Test for 2–4 weeks before committing.`,
    NEED_MORE_DATA: `Data quality score is ${dataQualityScore}/100 — not enough reliable data for a confident recommendation. Add more menu items, staff shifts, and fixed costs, then re-run.`,
  };

  const nextActions: Record<DecisionKey, string> = {
    RECOMMENDED: 'Implement the change. Run a new simulation after 2 weeks of real data.',
    NOT_RECOMMENDED: 'Keep current operations. Explore menu pricing or staffing efficiency improvements instead.',
    TEST_FIRST: 'Run a 2–4 week pilot. Compare actual performance to this simulation before deciding permanently.',
    NEED_MORE_DATA: 'Complete restaurant setup: add ≥5 menu items, operating hours, and staff shifts, then re-simulate.',
  };

  return {
    decision,
    confidence,
    summary: summaries[decision],
    expectedImpact: {
      revenueDeltaCents: Math.round(delta.revenueDeltaCents),
      profitDeltaCents: Math.round(delta.netProfitDeltaCents),
      laborCostDeltaCents: Math.round(delta.laborCostDeltaCents),
      foodCostDeltaCents: Math.round(delta.foodCostDeltaCents),
      waitRiskDelta: delta.avgWaitRiskDelta,
    },
    evidence,
    assumptions: scenario.assumptions,
    risks,
    nextAction: nextActions[decision],
  };
}

import type { Restaurant, MenuItem, StaffRole, StaffShift, OperatingHour } from '@prisma/client';
import type { SimulationResult } from '@/simulation/types';
import type { ScenarioDelta } from '@/simulation/comparison';
import type { RecommendationType, AgentActivity } from './agent-types';
import { calculateDataQualityScore } from './setup-agent';
import { analyzeMenu } from './menu-profit-agent';
import { analyzeStaffing } from './staffing-agent';
import { generateRecommendation } from './decision-advisor-agent';

export interface PipelineInput {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  staffRoles: StaffRole[];
  staffShifts: StaffShift[];
  hours: OperatingHour[];
  baseline: SimulationResult;
  scenario: SimulationResult;
  delta: ScenarioDelta;
  scenarioName: string;
  scenarioType: string;
}

export interface PipelineResult {
  dataQualityScore: number;
  recommendation: RecommendationType;
  agentActivities: AgentActivity[];
}

export async function runDecisionPipeline(input: PipelineInput): Promise<PipelineResult> {
  // Setup Agent
  const { score: dataQualityScore, summary: qualitySummary } = (() => {
    const result = calculateDataQualityScore(input);
    const label =
      result.score >= 80 ? 'Data quality: READY' : `Data quality: ${result.score}/100 — partial`;
    return { score: result.score, summary: label };
  })();

  // Menu Profit Agent
  const menuAnalysis = analyzeMenu(input.baseline.menuItemResults, input.menuItems);

  // Staffing Agent
  const staffingAnalysis = analyzeStaffing(
    input.baseline.byDay,
    input.baseline.byHour,
    input.baseline.bottlenecks,
  );

  // Decision Advisor Agent
  const recommendation = generateRecommendation({
    scenarioName: input.scenarioName,
    scenarioType: input.scenarioType,
    baseline: input.baseline,
    scenario: input.scenario,
    delta: input.delta,
    dataQualityScore,
    menuAnalysis,
    staffingAnalysis,
  });

  const agentActivities: AgentActivity[] = [
    { agent: 'Setup Agent', finding: `Data quality ${dataQualityScore}/100 — ${dataQualityScore >= 80 ? 'ready' : 'partial'}` },
    { agent: 'Menu Profit Agent', finding: menuAnalysis.summary },
    { agent: 'Staffing Agent', finding: staffingAnalysis.summary },
    { agent: 'Decision Advisor', finding: `${recommendation.decision} (${recommendation.confidence} confidence)` },
  ];

  return { dataQualityScore, recommendation, agentActivities };
}

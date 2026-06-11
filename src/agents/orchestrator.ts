import { z } from 'zod';
import type { Restaurant, MenuItem, StaffRole, StaffShift, OperatingHour } from '@prisma/client';
import type { SimulationResult } from '@/simulation/types';
import type { ScenarioDelta } from '@/simulation/comparison';
import type { RecommendationType, AgentActivity } from './agent-types';
import { calculateDataQualityScore } from './setup-agent';
import { analyzeMenu } from './menu-profit-agent';
import { analyzeStaffing } from './staffing-agent';
import { generateRecommendation } from './decision-advisor-agent';
import { getLlmProvider } from './providers/provider-factory';
import { formatCents } from '@/lib/money';

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

const ADVISOR_SYSTEM = `You are the Decision Advisor for RestTwin AI, a restaurant simulation platform.
You receive structured simulation data and a deterministic recommendation. Rewrite the summary and nextAction in clear, direct, restaurant-owner-friendly language.
Rules:
- Be specific: include exact dollar amounts and percentages from the data when relevant
- Be direct: lead with the verdict, follow with the key reason
- No filler phrases ("Based on the simulation", "It appears that", "I recommend")
- Summary: 2–3 sentences max
- Next action: 1 concrete, actionable sentence
Return only valid JSON with exactly two keys: {"summary": "...", "nextAction": "..."}`;

const NarrativeSchema = z.object({
  summary: z.string().min(10),
  nextAction: z.string().min(10),
});

export async function runDecisionPipeline(input: PipelineInput): Promise<PipelineResult> {
  // Setup Agent
  const { score: dataQualityScore } = (() => {
    const result = calculateDataQualityScore(input);
    return { score: result.score };
  })();

  // Menu Profit Agent
  const menuAnalysis = analyzeMenu(input.baseline.menuItemResults, input.menuItems);

  // Staffing Agent
  const staffingAnalysis = analyzeStaffing(
    input.baseline.byDay,
    input.baseline.byHour,
    input.baseline.bottlenecks,
  );

  // Decision Advisor Agent (deterministic — numbers, decision, confidence, evidence, risks)
  const deterministicRec = generateRecommendation({
    scenarioName: input.scenarioName,
    scenarioType: input.scenarioType,
    baseline: input.baseline,
    scenario: input.scenario,
    delta: input.delta,
    dataQualityScore,
    menuAnalysis,
    staffingAnalysis,
  });

  // LLM narrative enhancement — rewrites summary + nextAction with natural prose
  let recommendation = deterministicRec;
  try {
    const provider = getLlmProvider();
    const prompt = JSON.stringify({
      scenarioName: input.scenarioName,
      scenarioType: input.scenarioType,
      decision: deterministicRec.decision,
      confidence: deterministicRec.confidence,
      revenueDelta: `${deterministicRec.expectedImpact.revenueDeltaCents >= 0 ? '+' : ''}${formatCents(deterministicRec.expectedImpact.revenueDeltaCents)}/week`,
      netProfitDelta: `${deterministicRec.expectedImpact.profitDeltaCents >= 0 ? '+' : ''}${formatCents(deterministicRec.expectedImpact.profitDeltaCents)}/week`,
      waitRiskDelta: deterministicRec.expectedImpact.waitRiskDelta,
      menuSummary: menuAnalysis.summary,
      menuSuggestions: menuAnalysis.suggestions,
      staffingSummary: staffingAnalysis.summary,
      dataQualityScore,
      evidence: deterministicRec.evidence,
      risks: deterministicRec.risks,
      // Fallback values — mock returns these as-is
      summary: deterministicRec.summary,
      nextAction: deterministicRec.nextAction,
    });

    const narrative = await provider.generateStructured({
      system: ADVISOR_SYSTEM,
      prompt,
      schemaName: 'NarrativeEnhancement',
      schema: NarrativeSchema,
    });

    recommendation = {
      ...deterministicRec,
      summary: narrative.summary,
      nextAction: narrative.nextAction,
    };
  } catch {
    // LLM failure is non-fatal — keep deterministic output
  }

  const agentActivities: AgentActivity[] = [
    { agent: 'Setup Agent', finding: `Data quality ${dataQualityScore}/100 — ${dataQualityScore >= 80 ? 'ready' : 'partial'}` },
    { agent: 'Menu Profit Agent', finding: menuAnalysis.summary },
    { agent: 'Staffing Agent', finding: staffingAnalysis.summary },
    { agent: 'Decision Advisor', finding: `${recommendation.decision} (${recommendation.confidence} confidence)` },
  ];

  return { dataQualityScore, recommendation, agentActivities };
}

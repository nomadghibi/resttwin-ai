'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { formatCents } from '@/lib/money';
import { DeltaBadge } from '@/components/delta-badge';
import { RecommendationCard } from '@/components/recommendation-card';
import { WeeklyChart } from '@/components/charts/weekly-chart';
import { CostBreakdownChart } from '@/components/charts/cost-breakdown-chart';
import { runScenarioAction } from './actions';
import type { ScenarioRunState } from './actions';
import type { SimulationResult } from '@/simulation/types';
import type { ScenarioDelta } from '@/simulation/comparison';
import type { RecommendationType, AgentActivity } from '@/agents/agent-types';
import { SCENARIO_TYPE_LABELS } from '@/lib/validation/scenario';

type ScenarioWithRec = Prisma.ScenarioGetPayload<{ include: { recommendation: true } }>;

type Props = {
  scenario: ScenarioWithRec;
  baselineResult: SimulationResult | null;
  scenarioResult: SimulationResult | null;
  delta: ScenarioDelta | null;
  persistedActivities?: AgentActivity[] | null;
  persistedQualityScore?: number | null;
};

function pct(n: number) { return `${n.toFixed(1)}%`; }

export function ComparisonView({ scenario, baselineResult, scenarioResult, delta, persistedActivities, persistedQualityScore }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<ScenarioRunState>(null);

  // Use in-session result if just ran, otherwise fall back to persisted DB data
  const displayActivities = lastRun?.agentActivities ?? persistedActivities;
  const displayQualityScore = lastRun?.dataQualityScore ?? persistedQualityScore;

  function handleRun() {
    setError(null);
    setLastRun(null);
    const fd = new FormData();
    fd.append('scenarioId', scenario.id);
    startTransition(async () => {
      const result = await runScenarioAction(null, fd);
      if (result?.success) {
        setLastRun(result);
        router.refresh();
      } else {
        setError(result?.message ?? 'Run failed.');
      }
    });
  }

  const rec = scenario.recommendation
    ? {
        decision: scenario.recommendation.decision,
        confidence: scenario.recommendation.confidence,
        summary: scenario.recommendation.summary,
        expectedImpact: scenario.recommendation.expectedImpactJson as RecommendationType['expectedImpact'],
        evidence: scenario.recommendation.evidenceJson as string[],
        assumptions: scenario.recommendation.assumptionsJson as string[],
        risks: scenario.recommendation.risksJson as string[],
        nextAction: scenario.recommendation.nextAction,
      } as RecommendationType
    : null;

  const hasResult = !!scenarioResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{scenario.name}</h1>
          <p className="text-sm text-gray-500">
            {SCENARIO_TYPE_LABELS[scenario.type]} · created {new Date(scenario.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!baselineResult && (
            <p className="text-sm text-amber-600">Run a baseline simulation first.</p>
          )}
          <button
            onClick={handleRun}
            disabled={isPending || !baselineResult}
            className="rounded bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {isPending ? 'Running…' : hasResult ? 'Re-run Scenario' : 'Run Scenario'}
          </button>
        </div>
      </div>

      {/* Comparison table */}
      {baselineResult && hasResult && delta && (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Baseline</th>
                  <th className="px-4 py-3">Scenario</th>
                  <th className="px-4 py-3">Delta</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Revenue',
                    base: formatCents(baselineResult.totals.revenueCents),
                    scen: formatCents(scenarioResult.totals.revenueCents),
                    delta: <DeltaBadge value={delta.revenueDeltaCents} format="cents" />,
                  },
                  {
                    label: 'Food cost',
                    base: `${pct(baselineResult.totals.avgFoodCostPercent)} (${formatCents(baselineResult.totals.foodCostCents)})`,
                    scen: `${pct(scenarioResult.totals.avgFoodCostPercent)} (${formatCents(scenarioResult.totals.foodCostCents)})`,
                    delta: <DeltaBadge value={delta.foodCostDeltaCents} format="cents" invert />,
                  },
                  {
                    label: 'Labor cost',
                    base: `${pct(baselineResult.totals.avgLaborCostPercent)} (${formatCents(baselineResult.totals.laborCostCents)})`,
                    scen: `${pct(scenarioResult.totals.avgLaborCostPercent)} (${formatCents(scenarioResult.totals.laborCostCents)})`,
                    delta: <DeltaBadge value={delta.laborCostDeltaCents} format="cents" invert />,
                  },
                  {
                    label: 'Fixed costs',
                    base: formatCents(baselineResult.totals.fixedCostCents),
                    scen: formatCents(scenarioResult.totals.fixedCostCents),
                    delta: <DeltaBadge value={delta.fixedCostDeltaCents} format="cents" invert />,
                  },
                  {
                    label: 'Est. net profit',
                    base: formatCents(baselineResult.totals.estimatedNetProfitCents),
                    scen: formatCents(scenarioResult.totals.estimatedNetProfitCents),
                    delta: <DeltaBadge value={delta.netProfitDeltaCents} format="cents" />,
                  },
                  {
                    label: 'Avg wait risk',
                    base: `${baselineResult.totals.avgWaitRisk.toFixed(0)}/100`,
                    scen: `${scenarioResult.totals.avgWaitRisk.toFixed(0)}/100`,
                    delta: <DeltaBadge value={delta.avgWaitRiskDelta} format="number" invert />,
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                    <td className="px-4 py-3 text-gray-600">{row.base}</td>
                    <td className="px-4 py-3 text-gray-900">{row.scen}</td>
                    <td className="px-4 py-3">{row.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly revenue chart */}
          <div className="rounded-lg border bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-gray-700">Weekly Revenue Comparison</p>
            <WeeklyChart baseline={baselineResult.byDay} scenario={scenarioResult.byDay} />
          </div>

          {/* Cost breakdown charts side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-white p-5">
              <p className="mb-1 text-sm font-semibold text-gray-700">Baseline — Cost Breakdown</p>
              <p className="mb-3 text-xs text-gray-400">Costs vs. revenue line</p>
              <CostBreakdownChart byDay={baselineResult.byDay} totals={baselineResult.totals} />
            </div>
            <div className="rounded-lg border bg-white p-5">
              <p className="mb-1 text-sm font-semibold text-gray-700">Scenario — Cost Breakdown</p>
              <p className="mb-3 text-xs text-gray-400">Costs vs. revenue line</p>
              <CostBreakdownChart byDay={scenarioResult.byDay} totals={scenarioResult.totals} />
            </div>
          </div>
        </>
      )}

      {/* Recommendation */}
      {rec && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-900">AI Recommendation</h2>
          <RecommendationCard recommendation={rec} scenarioName={scenario.name} />
        </div>
      )}

      {!hasResult && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No results yet — run the scenario to see the comparison.</p>
        </div>
      )}

      {/* Agent activity feed */}
      {displayActivities && displayActivities.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700">
            Agent Pipeline
            {displayQualityScore !== null && displayQualityScore !== undefined && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                Data quality: {displayQualityScore}/100
              </span>
            )}
          </p>
          <div className="rounded-lg border bg-white divide-y">
            {displayActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-3">
                <span className="mt-0.5 w-32 shrink-0 text-xs font-semibold text-gray-500">
                  {a.agent}
                </span>
                <span className="text-sm text-gray-700">{a.finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

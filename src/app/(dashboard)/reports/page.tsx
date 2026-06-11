import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant } from '@/server/services/restaurant';
import { getBaselineRuns } from '@/server/services/simulation';
import { getScenarios } from '@/server/services/scenario';
import { prisma } from '@/lib/db';
import { ReportView } from '@/features/reports/report-view';
import { compareSimulations } from '@/simulation/comparison';
import type { SimulationResult } from '@/simulation/types';
import type { RecommendationType } from '@/agents/agent-types';
import Link from 'next/link';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ scenarioId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);
  if (!restaurant) redirect('/setup');

  const baselineRuns = await getBaselineRuns(session.user.id, session.user.organizationId);
  const baselineResult = (baselineRuns[0]?.resultJson as unknown as SimulationResult) ?? null;

  if (!baselineResult) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">
          Run a <Link href="/simulations" className="underline">baseline simulation</Link> first to generate a report.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const scenarios = await getScenarios(session.user.id, session.user.organizationId);
  const ranScenarios = scenarios.filter((s) => s.scenarioRunId);

  let selectedScenario = sp.scenarioId
    ? ranScenarios.find((s) => s.id === sp.scenarioId)
    : ranScenarios[0] ?? null;

  let scenarioResult: SimulationResult | null = null;
  if (selectedScenario?.scenarioRunId) {
    const run = await prisma.simulationRun.findUnique({ where: { id: selectedScenario.scenarioRunId } });
    scenarioResult = (run?.resultJson as unknown as SimulationResult) ?? null;
  }

  const delta =
    baselineResult && scenarioResult ? compareSimulations(baselineResult, scenarioResult) : null;

  const recommendation = selectedScenario?.recommendation
    ? ({
        decision: selectedScenario.recommendation.decision,
        confidence: selectedScenario.recommendation.confidence,
        summary: selectedScenario.recommendation.summary,
        expectedImpact: selectedScenario.recommendation.expectedImpactJson as RecommendationType['expectedImpact'],
        evidence: selectedScenario.recommendation.evidenceJson as string[],
        assumptions: selectedScenario.recommendation.assumptionsJson as string[],
        risks: selectedScenario.recommendation.risksJson as string[],
        nextAction: selectedScenario.recommendation.nextAction,
      } as RecommendationType)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Scenario selector */}
      {ranScenarios.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-sm text-gray-500">Scenario:</span>
          <Link
            href="/reports"
            className={`rounded px-3 py-1 text-sm ${!selectedScenario ? 'bg-gray-900 text-white' : 'border text-gray-700 hover:bg-gray-50'}`}
          >
            Baseline only
          </Link>
          {ranScenarios.map((s) => (
            <Link
              key={s.id}
              href={`/reports?scenarioId=${s.id}`}
              className={`rounded px-3 py-1 text-sm ${selectedScenario?.id === s.id ? 'bg-gray-900 text-white' : 'border text-gray-700 hover:bg-gray-50'}`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <ReportView
        restaurant={restaurant}
        baselineResult={baselineResult}
        scenarioName={selectedScenario?.name}
        scenarioResult={scenarioResult}
        delta={delta}
        recommendation={recommendation}
      />
    </div>
  );
}

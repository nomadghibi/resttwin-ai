import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getScenario } from '@/server/services/scenario';
import { getBaselineRuns } from '@/server/services/simulation';
import { prisma } from '@/lib/db';
import { ComparisonView } from '@/features/scenarios/comparison-view';
import { compareSimulations } from '@/simulation/comparison';
import type { SimulationResult } from '@/simulation/types';
import Link from 'next/link';

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  let scenario;
  try {
    scenario = await getScenario(session.user.id, session.user.organizationId, id);
  } catch {
    redirect('/scenarios');
  }

  // Latest baseline
  const baselineRuns = await getBaselineRuns(session.user.id, session.user.organizationId);
  const baselineRun = scenario.baselineRunId
    ? await prisma.simulationRun.findUnique({ where: { id: scenario.baselineRunId } })
    : baselineRuns[0] ?? null;

  // Scenario run
  const scenarioRun = scenario.scenarioRunId
    ? await prisma.simulationRun.findUnique({ where: { id: scenario.scenarioRunId } })
    : null;

  const baselineResult = (baselineRun?.resultJson as unknown as SimulationResult) ?? null;
  const scenarioResult = (scenarioRun?.resultJson as unknown as SimulationResult) ?? null;
  const delta =
    baselineResult && scenarioResult ? compareSimulations(baselineResult, scenarioResult) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-sm text-gray-500">
        <Link href="/scenarios" className="hover:underline">
          ← Scenarios
        </Link>
      </div>
      <ComparisonView
        scenario={scenario}
        baselineResult={baselineResult}
        scenarioResult={scenarioResult}
        delta={delta}
      />
    </div>
  );
}

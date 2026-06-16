import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant } from '@/server/services/restaurant';
import { getBaselineRuns } from '@/server/services/simulation';
import { getScenarios } from '@/server/services/scenario';
import { prisma } from '@/lib/db';
import { DashboardView } from '@/features/dashboard/dashboard-view';
import type { SimulationResult } from '@/simulation/types';
import type { RecommendationType } from '@/agents/agent-types';
import { calculateDataQualityScore } from '@/agents/setup-agent';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);

  if (!restaurant) {
    redirect('/setup');
  }

  const [baselineRuns, scenarios, menuItems, staffRoles, staffShifts, hours] = await Promise.all([
    getBaselineRuns(session.user.id, session.user.organizationId),
    getScenarios(session.user.id, session.user.organizationId),
    prisma.menuItem.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.staffRole.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.staffShift.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.operatingHour.findMany({ where: { restaurantId: restaurant.id } }),
  ]);

  const dataQuality = calculateDataQualityScore({ restaurant, menuItems, staffRoles, staffShifts, hours });

  const latestRun = baselineRuns[0] ?? null;
  const baselineResult = (latestRun?.resultJson as unknown as SimulationResult) ?? null;

  // Latest ran scenario + its result for chart overlay
  const latestRanScenario = scenarios.find((s) => s.scenarioRunId && s.recommendation);
  const latestRecommendation = latestRanScenario?.recommendation
    ? ({
        decision: latestRanScenario.recommendation.decision,
        confidence: latestRanScenario.recommendation.confidence,
        summary: latestRanScenario.recommendation.summary,
        expectedImpact: latestRanScenario.recommendation.expectedImpactJson as RecommendationType['expectedImpact'],
        evidence: latestRanScenario.recommendation.evidenceJson as string[],
        assumptions: latestRanScenario.recommendation.assumptionsJson as string[],
        risks: latestRanScenario.recommendation.risksJson as string[],
        nextAction: latestRanScenario.recommendation.nextAction,
      } as RecommendationType)
    : null;

  let latestScenarioResult: SimulationResult | null = null;
  if (latestRanScenario?.scenarioRunId) {
    const run = await prisma.simulationRun.findUnique({
      where: { id: latestRanScenario.scenarioRunId },
    });
    latestScenarioResult = (run?.resultJson as unknown as SimulationResult) ?? null;
  }

  return (
    <DashboardView
      restaurantName={restaurant.name}
      baselineResult={baselineResult}
      latestRecommendation={latestRecommendation}
      scenarioName={latestRanScenario?.name}
      latestScenarioResult={latestScenarioResult}
      dataQualityScore={dataQuality.score}
      dataQualityMissing={dataQuality.missing}
      dataQualityReadiness={dataQuality.readiness}
    />
  );
}

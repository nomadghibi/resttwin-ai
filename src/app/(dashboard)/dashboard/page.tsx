import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant } from '@/server/services/restaurant';
import { getBaselineRuns } from '@/server/services/simulation';
import { getScenarios } from '@/server/services/scenario';
import { DashboardView } from '@/features/dashboard/dashboard-view';
import type { SimulationResult } from '@/simulation/types';
import type { RecommendationType } from '@/agents/agent-types';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);

  if (!restaurant) {
    redirect('/setup');
  }

  const [baselineRuns, scenarios] = await Promise.all([
    getBaselineRuns(session.user.id, session.user.organizationId),
    getScenarios(session.user.id, session.user.organizationId),
  ]);

  const latestRun = baselineRuns[0] ?? null;
  const baselineResult = (latestRun?.resultJson as unknown as SimulationResult) ?? null;

  // Get latest recommendation from most recent run scenario
  const latestRanScenario = scenarios.find((s) => s.recommendation);
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

  return (
    <DashboardView
      restaurantName={restaurant.name}
      baselineResult={baselineResult}
      latestRecommendation={latestRecommendation}
      scenarioName={latestRanScenario?.name}
    />
  );
}

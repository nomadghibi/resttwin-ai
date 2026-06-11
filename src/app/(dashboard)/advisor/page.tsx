import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRestaurant } from '@/server/services/restaurant';
import { getScenarios } from '@/server/services/scenario';
import { RecommendationCard } from '@/components/recommendation-card';
import type { RecommendationType } from '@/agents/agent-types';

const QUESTION_SCENARIOS = [
  { question: 'Should I raise prices?', type: 'PRICE_CHANGE_PERCENT', hint: 'Try 8% price increase' },
  { question: 'Should I open Monday?', type: 'HOURS_CHANGE', hint: 'Simulate opening a closed day' },
  { question: 'Should I add delivery?', type: 'DELIVERY_TOGGLE', hint: 'Model delivery demand + margin impact' },
  { question: 'What if I run a promotion?', type: 'PROMOTION', hint: 'Boost demand, optional discount' },
  { question: 'Do I need more staff?', type: 'STAFFING_CHANGE', hint: 'Add/remove a role for a specific day' },
];

export default async function AdvisorPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);
  if (!restaurant) redirect('/setup');

  const scenarios = await getScenarios(session.user.id, session.user.organizationId);
  const ranScenarios = scenarios.filter((s) => s.recommendation);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Advisor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Structured what-if analysis for {restaurant.name}. Create a scenario to get a recommendation.
        </p>
      </div>

      {/* Question → scenario routing */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Common questions
        </h2>
        <div className="space-y-2">
          {QUESTION_SCENARIOS.map((q) => (
            <Link
              key={q.type}
              href={`/scenarios?new=1`}
              className="flex items-center justify-between rounded-lg border bg-white p-4 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                <p className="text-xs text-gray-500 mt-0.5">{q.hint}</p>
              </div>
              <span className="text-xs text-gray-400">Create scenario →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Past recommendations */}
      {ranScenarios.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recent recommendations
          </h2>
          <div className="space-y-4">
            {ranScenarios.slice(0, 5).map((s) => {
              if (!s.recommendation) return null;
              const rec: RecommendationType = {
                decision: s.recommendation.decision,
                confidence: s.recommendation.confidence,
                summary: s.recommendation.summary,
                expectedImpact: s.recommendation.expectedImpactJson as RecommendationType['expectedImpact'],
                evidence: s.recommendation.evidenceJson as string[],
                assumptions: s.recommendation.assumptionsJson as string[],
                risks: s.recommendation.risksJson as string[],
                nextAction: s.recommendation.nextAction,
              };
              return (
                <div key={s.id}>
                  <Link href={`/scenarios/${s.id}`} className="text-xs text-gray-400 hover:underline mb-2 block">
                    {s.name} →
                  </Link>
                  <RecommendationCard recommendation={rec} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {ranScenarios.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No recommendations yet.</p>
          <p className="mt-1 text-xs text-gray-400">Run a baseline simulation, then create and run a scenario.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/simulations" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
              Run Baseline
            </Link>
            <Link href="/scenarios?new=1" className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              New Scenario
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

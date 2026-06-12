import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRestaurant } from '@/server/services/restaurant';
import { getScenarios } from '@/server/services/scenario';
import { getRoles } from '@/server/services/staffing';
import { ScenarioBuilder } from '@/features/scenarios/scenario-builder';
import { SCENARIO_TYPE_LABELS } from '@/lib/validation/scenario';

const VALID_TYPES = [
  'PRICE_CHANGE_PERCENT',
  'STAFFING_CHANGE',
  'HOURS_CHANGE',
  'DELIVERY_TOGGLE',
  'PROMOTION',
] as const;
type ScenarioType = (typeof VALID_TYPES)[number];

export default async function ScenariosPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; template?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);
  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scenarios</h1>
        <p className="mt-4 text-sm text-gray-500">
          Complete <a href="/setup" className="underline">restaurant setup</a> first.
        </p>
      </div>
    );
  }

  const [scenarios, roles] = await Promise.all([
    getScenarios(session.user.id, session.user.organizationId),
    getRoles(session.user.id, session.user.organizationId),
  ]);

  const sp = await searchParams;
  const templateParam = sp.template && (VALID_TYPES as readonly string[]).includes(sp.template)
    ? (sp.template as ScenarioType)
    : null;
  const showNew = sp.new === '1' || templateParam !== null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scenarios</h1>
          <p className="mt-1 text-sm text-gray-500">{restaurant.name}</p>
        </div>
        {!showNew && (
          <Link
            href="/scenarios?new=1"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + New Scenario
          </Link>
        )}
      </div>

      {showNew && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose scenario type</h2>
            <Link href="/scenarios" className="text-sm text-gray-500 hover:underline">Cancel</Link>

          </div>
          <ScenarioBuilder roles={roles} initialType={templateParam} />
        </div>
      )}

      {scenarios.length === 0 && !showNew ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No scenarios yet.</p>
          <p className="mt-1 text-xs text-gray-400">Run a baseline simulation first, then create a what-if scenario.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/simulations" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
              Run Baseline
            </Link>
            <Link href="/scenarios?new=1" className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              + New Scenario
            </Link>
          </div>
        </div>
      ) : (
        scenarios.length > 0 && (
          <div className="space-y-2">
            {scenarios.map((s) => (
              <Link
                key={s.id}
                href={`/scenarios/${s.id}`}
                className="block rounded-lg border bg-white p-5 hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {SCENARIO_TYPE_LABELS[s.type]} · {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {s.recommendation ? (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        s.recommendation.decision === 'RECOMMENDED' ? 'bg-green-100 text-green-800' :
                        s.recommendation.decision === 'NOT_RECOMMENDED' ? 'bg-red-100 text-red-800' :
                        s.recommendation.decision === 'TEST_FIRST' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {s.recommendation.decision.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not run yet</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}

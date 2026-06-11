import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant } from '@/server/services/restaurant';
import { getBaselineRuns } from '@/server/services/simulation';
import { BaselinePanel } from '@/features/simulations/baseline-panel';

export default async function SimulationsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);

  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulations</h1>
        <p className="mt-4 text-sm text-gray-500">
          Complete{' '}
          <a href="/setup" className="underline">
            restaurant setup
          </a>{' '}
          before running simulations.
        </p>
      </div>
    );
  }

  const runs = await getBaselineRuns(session.user.id, session.user.organizationId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulations</h1>
        <p className="mt-1 text-sm text-gray-500">
          {restaurant.name} — 7-day baseline estimate
        </p>
      </div>
      <BaselinePanel runs={runs} />
    </div>
  );
}

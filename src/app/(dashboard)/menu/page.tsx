import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMenuItems } from '@/server/services/menu';
import { getRestaurant } from '@/server/services/restaurant';
import { getBaselineRuns } from '@/server/services/simulation';
import { MenuTable } from '@/features/menu/menu-table';
import { MenuPerformancePanel } from '@/features/menu/performance-panel';
import { analyzeMenu } from '@/agents/menu-profit-agent';
import type { SimulationResult } from '@/simulation/types';

export default async function MenuPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);

  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        <p className="mt-4 text-sm text-gray-500">
          Complete{' '}
          <a href="/setup" className="underline">
            restaurant setup
          </a>{' '}
          before adding menu items.
        </p>
      </div>
    );
  }

  const [items, baselineRuns] = await Promise.all([
    getMenuItems(session.user.id, session.user.organizationId),
    getBaselineRuns(session.user.id, session.user.organizationId),
  ]);

  const latestResult = baselineRuns[0]?.resultJson as unknown as SimulationResult | undefined;
  const analysis =
    latestResult && items.length > 0
      ? analyzeMenu(latestResult.menuItemResults, items)
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        <p className="mt-1 text-sm text-gray-500">{restaurant.name}</p>
      </div>

      <MenuTable items={items} />

      {analysis ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Item Performance</h2>
            <p className="text-xs text-gray-400">Based on latest baseline simulation</p>
          </div>
          <MenuPerformancePanel analysis={analysis} />
        </div>
      ) : items.length > 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center">
          <p className="text-sm text-gray-500">Run a baseline simulation to see item performance.</p>
          <a href="/simulations" className="mt-2 inline-block text-xs text-gray-400 underline hover:text-gray-600">
            Go to Simulations →
          </a>
        </div>
      ) : null}
    </div>
  );
}

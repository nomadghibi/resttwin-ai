import { auth } from '@/auth';
import Link from 'next/link';
import { listRestaurants, getRestaurant } from '@/server/services/restaurant';
import { setActiveRestaurantAction } from './switcher-actions';

export async function RestaurantSwitcher() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return null;

  const [restaurants, active] = await Promise.all([
    listRestaurants(session.user.id, session.user.organizationId),
    getRestaurant(session.user.id, session.user.organizationId),
  ]);

  if (restaurants.length === 0) return null;

  return (
    <div className="mb-6 border-b border-gray-700 pb-4">
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Restaurant
      </p>
      <div className="space-y-0.5">
        {restaurants.map((r) => (
          <form key={r.id} action={setActiveRestaurantAction.bind(null, r.id)}>
            <button
              type="submit"
              className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${
                r.id === active?.id
                  ? 'bg-gray-700 font-medium text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {r.name}
            </button>
          </form>
        ))}
      </div>
      <Link
        href="/setup?new=1"
        className="mt-2 block rounded px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300"
      >
        + Add restaurant
      </Link>
    </div>
  );
}

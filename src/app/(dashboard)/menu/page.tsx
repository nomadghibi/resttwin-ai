import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMenuItems } from '@/server/services/menu';
import { getRestaurant } from '@/server/services/restaurant';
import { MenuTable } from '@/features/menu/menu-table';

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

  const items = await getMenuItems(session.user.id, session.user.organizationId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        <p className="mt-1 text-sm text-gray-500">{restaurant.name}</p>
      </div>
      <MenuTable items={items} />
    </div>
  );
}

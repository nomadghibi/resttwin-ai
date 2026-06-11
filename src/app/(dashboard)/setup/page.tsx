import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant, getHours } from '@/server/services/restaurant';
import { RestaurantForm } from '@/features/restaurant/restaurant-form';
import { HoursEditor } from '@/features/restaurant/hours-editor';

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);

  const hours = restaurant
    ? await getHours(session.user.id, session.user.organizationId, restaurant.id)
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Setup</h1>
        <p className="mt-1 text-sm text-gray-500">
          {restaurant ? 'Edit your restaurant profile.' : 'Set up your digital twin.'}
        </p>
      </div>

      <RestaurantForm restaurant={restaurant} />

      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Operating Hours</h2>
        <HoursEditor
          initial={hours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            isOpen: h.isOpen,
            openTime: h.openTime,
            closeTime: h.closeTime,
          }))}
        />
      </div>
    </div>
  );
}

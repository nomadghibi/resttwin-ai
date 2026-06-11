import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant } from '@/server/services/restaurant';
import { getRoles, getShifts } from '@/server/services/staffing';
import { RolesTable } from '@/features/staffing/roles-table';
import { ScheduleTable } from '@/features/staffing/schedule-table';

export default async function StaffingPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);

  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staffing</h1>
        <p className="mt-4 text-sm text-gray-500">
          Complete{' '}
          <a href="/setup" className="underline">
            restaurant setup
          </a>{' '}
          before adding staff.
        </p>
      </div>
    );
  }

  const [roles, shifts] = await Promise.all([
    getRoles(session.user.id, session.user.organizationId),
    getShifts(session.user.id, session.user.organizationId),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staffing</h1>
        <p className="mt-1 text-sm text-gray-500">{restaurant.name}</p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Staff Roles</h2>
        <RolesTable roles={roles} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Weekly Schedule</h2>
        <ScheduleTable shifts={shifts} roles={roles} />
      </section>
    </div>
  );
}

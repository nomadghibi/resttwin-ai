import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getRestaurant } from '@/server/services/restaurant';

export async function OnboardingProgress() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return null;

  const restaurant = await getRestaurant(session.user.id, session.user.organizationId);
  if (!restaurant) return null;

  const [menuCount, staffCount, hoursCount, simCount] = await Promise.all([
    prisma.menuItem.count({ where: { restaurantId: restaurant.id } }),
    prisma.staffRole.count({ where: { restaurantId: restaurant.id } }),
    prisma.operatingHour.count({ where: { restaurantId: restaurant.id, isOpen: true } }),
    prisma.simulationRun.count({
      where: { restaurantId: restaurant.id, type: 'BASELINE', status: 'COMPLETED' },
    }),
  ]);

  const steps = [
    { label: 'Profile', done: true, href: '/setup' },
    { label: 'Hours', done: hoursCount > 0, href: '/setup' },
    { label: 'Menu items', done: menuCount > 0, href: '/menu' },
    { label: 'Staff roles', done: staffCount > 0, href: '/staffing' },
    { label: 'First simulation', done: simCount > 0, href: '/simulations' },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div className="mb-4 border-b border-gray-700 pb-4">
      <div className="flex items-center justify-between mb-1 px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Setup</span>
        <span className="text-xs text-gray-500">{completed}/{steps.length}</span>
      </div>
      <div className="mx-3 h-1 rounded bg-gray-700 mb-2">
        <div className="h-1 rounded bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-col gap-0.5">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className={`flex items-center gap-2 rounded px-3 py-0.5 text-xs transition-colors hover:bg-gray-800 ${
              step.done ? 'text-emerald-400' : 'text-gray-400'
            }`}
          >
            <span className="w-3 shrink-0">{step.done ? '✓' : '○'}</span>
            <span>{step.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

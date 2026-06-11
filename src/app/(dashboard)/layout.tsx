import Link from 'next/link';
import { Suspense } from 'react';
import { RestaurantSwitcher } from '@/features/restaurant/restaurant-switcher';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/onboarding', label: '✦ Setup Guide' },
  { href: '/setup', label: 'Setup' },
  { href: '/menu', label: 'Menu' },
  { href: '/staffing', label: 'Staffing' },
  { href: '/simulations', label: 'Simulations' },
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/advisor', label: 'Advisor' },
  { href: '/reports', label: 'Reports' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col bg-gray-900 p-4 text-white">
        <div className="mb-6 text-lg font-bold tracking-tight">RestTwin AI</div>
        <Suspense fallback={null}>
          <RestaurantSwitcher />
        </Suspense>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}

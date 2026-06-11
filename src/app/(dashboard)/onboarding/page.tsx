import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRestaurant } from '@/server/services/restaurant';
import { getMenuItems } from '@/server/services/menu';
import { getRoles } from '@/server/services/staffing';
import { OnboardingWizard } from '@/features/onboarding/wizard';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const [restaurant, menuItems, staffRoles] = await Promise.all([
    getRestaurant(session.user.id, session.user.organizationId).catch(() => null),
    getMenuItems(session.user.id, session.user.organizationId).catch(() => []),
    getRoles(session.user.id, session.user.organizationId).catch(() => []),
  ]);

  return (
    <OnboardingWizard
      restaurant={restaurant}
      menuItems={menuItems}
      staffRoles={staffRoles}
    />
  );
}

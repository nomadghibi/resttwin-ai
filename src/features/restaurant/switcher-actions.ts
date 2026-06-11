'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { setActiveRestaurantId } from '@/lib/active-restaurant';
import { getRestaurantByIdAndOrg } from '@/server/repositories/restaurant';

export async function setActiveRestaurantAction(restaurantId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) redirect('/login');

  const restaurant = await getRestaurantByIdAndOrg(restaurantId, session.user.organizationId);
  if (!restaurant) return;

  await setActiveRestaurantId(restaurantId);
  redirect('/dashboard');
}

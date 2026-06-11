import { requireOrgAccess } from './auth';
import * as repo from '@/server/repositories/restaurant';
import type { RestaurantProfileInput, HourRowInput } from '@/lib/validation/restaurant';
import { NotFoundError } from '@/lib/errors';

export async function getRestaurant(userId: string, organizationId: string) {
  await requireOrgAccess(userId, organizationId);
  return repo.getRestaurantByOrg(organizationId);
}

export async function saveRestaurant(
  userId: string,
  organizationId: string,
  data: RestaurantProfileInput,
) {
  await requireOrgAccess(userId, organizationId);
  return repo.upsertRestaurant(organizationId, data);
}

export async function getHours(userId: string, organizationId: string, restaurantId: string) {
  await requireOrgAccess(userId, organizationId);
  return repo.getOperatingHours(restaurantId);
}

export async function saveHours(
  userId: string,
  organizationId: string,
  restaurantId: string,
  hours: HourRowInput[],
) {
  await requireOrgAccess(userId, organizationId);
  const restaurant = await repo.getRestaurantByOrg(organizationId);
  if (!restaurant || restaurant.id !== restaurantId) {
    throw new NotFoundError('Restaurant not found');
  }
  return repo.upsertOperatingHours(restaurantId, hours);
}

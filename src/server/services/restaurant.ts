import { requireOrgAccess } from './auth';
import * as repo from '@/server/repositories/restaurant';
import { getActiveRestaurantId } from '@/lib/active-restaurant';
import type { RestaurantProfileInput, HourRowInput } from '@/lib/validation/restaurant';
import { NotFoundError } from '@/lib/errors';

export async function getRestaurant(userId: string, organizationId: string) {
  await requireOrgAccess(userId, organizationId);
  const activeId = await getActiveRestaurantId();
  if (activeId) {
    const r = await repo.getRestaurantByIdAndOrg(activeId, organizationId);
    if (r) return r;
  }
  return repo.getRestaurantByOrg(organizationId);
}

export async function listRestaurants(userId: string, organizationId: string) {
  await requireOrgAccess(userId, organizationId);
  return repo.getRestaurantsByOrg(organizationId);
}

export async function createRestaurant(
  userId: string,
  organizationId: string,
  data: RestaurantProfileInput,
) {
  await requireOrgAccess(userId, organizationId);
  return repo.createRestaurant(organizationId, data);
}

export async function updateRestaurant(
  userId: string,
  organizationId: string,
  restaurantId: string,
  data: RestaurantProfileInput,
) {
  await requireOrgAccess(userId, organizationId);
  const r = await repo.getRestaurantByIdAndOrg(restaurantId, organizationId);
  if (!r) throw new NotFoundError('Restaurant not found');
  return repo.updateRestaurant(restaurantId, data);
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

import { requireOrgAccess } from './auth';
import * as repo from '@/server/repositories/menu';
import { getRestaurantByOrg } from '@/server/repositories/restaurant';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { dollarsToCents } from '@/lib/money';
import type { MenuItemFormInput } from '@/lib/validation/menu';

async function resolveRestaurant(userId: string, organizationId: string) {
  await requireOrgAccess(userId, organizationId);
  const restaurant = await getRestaurantByOrg(organizationId);
  if (!restaurant) throw new NotFoundError('No restaurant found. Complete setup first.');
  return restaurant;
}

export async function getMenuItems(userId: string, organizationId: string) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  return repo.getMenuItems(restaurant.id);
}

export async function saveMenuItem(
  userId: string,
  organizationId: string,
  input: MenuItemFormInput,
) {
  const restaurant = await resolveRestaurant(userId, organizationId);

  const payload = {
    name: input.name,
    category: input.category,
    priceCents: dollarsToCents(input.priceDollars),
    foodCostCents: dollarsToCents(input.foodCostDollars),
    prepMinutes: input.prepMinutes,
    popularityWeight: input.popularityWeight,
  };

  if (input.id) {
    const item = await repo.getMenuItemById(input.id);
    if (!item || item.restaurantId !== restaurant.id) throw new ForbiddenError();
    return repo.updateMenuItem(input.id, payload);
  }

  return repo.createMenuItem(restaurant.id, payload);
}

export async function toggleMenuItem(
  userId: string,
  organizationId: string,
  itemId: string,
) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  const item = await repo.getMenuItemById(itemId);
  if (!item || item.restaurantId !== restaurant.id) throw new ForbiddenError();
  return repo.updateMenuItem(itemId, { isActive: !item.isActive });
}

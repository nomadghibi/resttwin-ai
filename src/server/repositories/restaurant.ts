import { prisma } from '@/lib/db';
import type { RestaurantProfileInput, HourRowInput } from '@/lib/validation/restaurant';
import { BusinessModel } from '@prisma/client';

export async function getRestaurantByOrg(organizationId: string) {
  return prisma.restaurant.findFirst({ where: { organizationId } });
}

export async function upsertRestaurant(
  organizationId: string,
  data: RestaurantProfileInput,
) {
  const existing = await getRestaurantByOrg(organizationId);

  const payload = {
    name: data.name,
    restaurantType: data.restaurantType,
    addressText: data.addressText,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    businessModel: data.businessModel as BusinessModel,
    seatingCapacity: data.seatingCapacity,
    avgTableTurnMinutes: data.avgTableTurnMinutes,
    monthlyRent: Math.round(data.monthlyRentDollars * 100),
    monthlyUtilities: Math.round(data.monthlyUtilitiesDollars * 100),
    monthlyOtherFixedCosts: Math.round(data.monthlyOtherDollars * 100),
    targetFoodCostPercent: data.targetFoodCostPct,
    targetLaborCostPercent: data.targetLaborCostPct,
  };

  if (existing) {
    return prisma.restaurant.update({ where: { id: existing.id }, data: payload });
  }

  return prisma.restaurant.create({ data: { ...payload, organizationId } });
}

export async function getOperatingHours(restaurantId: string) {
  return prisma.operatingHour.findMany({
    where: { restaurantId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

export async function upsertOperatingHours(restaurantId: string, hours: HourRowInput[]) {
  for (const h of hours) {
    await prisma.operatingHour.upsert({
      where: { restaurantId_dayOfWeek: { restaurantId, dayOfWeek: h.dayOfWeek } },
      update: { isOpen: h.isOpen, openTime: h.openTime, closeTime: h.closeTime },
      create: {
        restaurantId,
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
      },
    });
  }
}

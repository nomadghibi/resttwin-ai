import type { Restaurant, MenuItem, OperatingHour, Prisma } from '@prisma/client';
import type { SimulationInput } from './types';

type ShiftWithRole = Prisma.StaffShiftGetPayload<{ include: { staffRole: true } }>;

export interface RestaurantSnapshot {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  shifts: ShiftWithRole[];
  hours: OperatingHour[];
}

export function buildSnapshot(data: RestaurantSnapshot): SimulationInput {
  const { restaurant, menuItems, shifts, hours } = data;

  return {
    restaurantType: restaurant.restaurantType,
    businessModel: restaurant.businessModel,
    seatingCapacity: restaurant.seatingCapacity,
    avgTableTurnMinutes: restaurant.avgTableTurnMinutes,
    monthlyRentCents: restaurant.monthlyRent,
    monthlyUtilitiesCents: restaurant.monthlyUtilities,
    monthlyOtherFixedCostsCents: restaurant.monthlyOtherFixedCosts,
    menuItems: menuItems
      .filter((m) => m.isActive)
      .map((m) => ({
        id: m.id,
        name: m.name,
        priceCents: m.priceCents,
        foodCostCents: m.foodCostCents,
        prepMinutes: m.prepMinutes,
        popularityWeight: m.popularityWeight,
      })),
    shifts: shifts.map((s) => ({
      staffRoleId: s.staffRoleId,
      roleName: s.staffRole.name,
      hourlyWageCents: s.staffRole.hourlyWageCents,
      capacityImpact: s.staffRole.capacityImpact as 'KITCHEN' | 'SERVICE' | 'CASHIER' | 'DELIVERY',
      defaultProductivity: s.staffRole.defaultProductivity,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      quantity: s.quantity,
    })),
    hours: hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      isOpen: h.isOpen,
      openTime: h.openTime,
      closeTime: h.closeTime,
    })),
    demandMultiplier: 1.0,
    deliveryEnabled: false,
  };
}

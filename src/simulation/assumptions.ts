export const DAY_MULTIPLIERS: Record<number, number> = {
  0: 0.75, // Sunday
  1: 0.55, // Monday
  2: 0.65, // Tuesday
  3: 0.75, // Wednesday
  4: 0.90, // Thursday
  5: 1.25, // Friday
  6: 1.20, // Saturday
};

export const HOUR_MULTIPLIERS: Record<number, number> = {
  7: 0.25, 8: 0.35, 9: 0.30, 10: 0.35,
  11: 0.75, 12: 1.00, 13: 0.85, 14: 0.55,
  15: 0.35, 16: 0.45, 17: 0.90, 18: 1.25,
  19: 1.20, 20: 0.85, 21: 0.45, 22: 0.25,
};

const BASE_DEMAND_MAP: Record<string, number> = {
  PIZZA: 18,
  CAFE: 14,
  CAFÉ: 14,
  CASUAL_DINING: 16,
  FAST_CASUAL: 22,
  FAST_FOOD: 22,
  SEAFOOD: 15,
  MEXICAN: 18,
  ITALIAN: 16,
  BBQ: 15,
  FOOD_TRUCK: 12,
  FINE_DINING: 12,
  BAR_GRILL: 16,
  GENERIC: 15,
};

export function getBaseDemand(restaurantType: string): number {
  const key = restaurantType
    .toUpperCase()
    .replace(/[\s\-/&]+/g, '_')
    .replace(/[^A-Z_]/g, '');
  return BASE_DEMAND_MAP[key] ?? BASE_DEMAND_MAP.GENERIC;
}

export function getDayMultiplier(day: number): number {
  return DAY_MULTIPLIERS[day] ?? 0.75;
}

export function getHourMultiplier(hour: number): number {
  return HOUR_MULTIPLIERS[hour] ?? 0.10;
}

// Orders per hour per kitchen/service staff unit
export const KITCHEN_ORDERS_PER_STAFF = 20;
export const SERVICE_ORDERS_PER_STAFF = 18;

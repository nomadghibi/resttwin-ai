import type { Restaurant, MenuItem, StaffRole, StaffShift, OperatingHour } from '@prisma/client';

export interface DataQualityResult {
  score: number;
  missing: string[];
  readiness: 'NOT_READY' | 'PARTIAL' | 'READY';
}

export function calculateDataQualityScore(data: {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  staffRoles: StaffRole[];
  staffShifts: StaffShift[];
  hours: OperatingHour[];
}): DataQualityResult {
  const missing: string[] = [];
  let score = 0;

  // Restaurant profile (30 pts)
  if (data.restaurant) {
    score += 15;
    if (data.restaurant.monthlyRent > 0 || data.restaurant.monthlyUtilities > 0) score += 10;
    else missing.push('Monthly fixed costs (rent, utilities)');
    if (data.restaurant.seatingCapacity > 0) score += 5;
  } else {
    missing.push('Restaurant profile');
  }

  // Operating hours (15 pts)
  const openDays = data.hours.filter((h) => h.isOpen).length;
  if (openDays >= 5) score += 15;
  else if (openDays >= 1) score += 8;
  else missing.push('Operating hours (at least 1 open day)');

  // Menu items (25 pts)
  const activeItems = data.menuItems.filter((m) => m.isActive).length;
  if (activeItems >= 5) score += 25;
  else if (activeItems >= 3) score += 15;
  else if (activeItems >= 1) score += 8;
  else missing.push('Menu items (at least 5 recommended)');

  // Staff roles (15 pts)
  if (data.staffRoles.length >= 2) score += 15;
  else if (data.staffRoles.length >= 1) score += 8;
  else missing.push('Staff roles');

  // Shifts (15 pts)
  if (data.staffShifts.length >= 4) score += 15;
  else if (data.staffShifts.length >= 1) score += 8;
  else missing.push('Staff shifts');

  const readiness: DataQualityResult['readiness'] =
    score >= 80 ? 'READY' : score >= 50 ? 'PARTIAL' : 'NOT_READY';

  return { score, missing, readiness };
}

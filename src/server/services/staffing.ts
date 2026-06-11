import * as repo from '@/server/repositories/staffing';
import { getRestaurant } from './restaurant';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { dollarsToCents } from '@/lib/money';
import type { StaffRoleFormInput, StaffShiftFormInput } from '@/lib/validation/staffing';
import type { CapacityImpact } from '@prisma/client';

async function resolveRestaurant(userId: string, organizationId: string) {
  const restaurant = await getRestaurant(userId, organizationId);
  if (!restaurant) throw new NotFoundError('No restaurant found. Complete setup first.');
  return restaurant;
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getRoles(userId: string, organizationId: string) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  return repo.getStaffRoles(restaurant.id);
}

export async function saveRole(
  userId: string,
  organizationId: string,
  input: StaffRoleFormInput,
) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  const payload = {
    name: input.name,
    hourlyWageCents: dollarsToCents(input.hourlyWageDollars),
    capacityImpact: input.capacityImpact as CapacityImpact,
    defaultProductivity: input.defaultProductivity,
  };

  if (input.id) {
    const role = await repo.getStaffRoleById(input.id);
    if (!role || role.restaurantId !== restaurant.id) throw new ForbiddenError();
    return repo.updateStaffRole(input.id, payload);
  }

  return repo.createStaffRole(restaurant.id, payload);
}

export async function deleteRole(userId: string, organizationId: string, roleId: string) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  const role = await repo.getStaffRoleById(roleId);
  if (!role || role.restaurantId !== restaurant.id) throw new ForbiddenError();
  return repo.deleteStaffRole(roleId);
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export async function getShifts(userId: string, organizationId: string) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  return repo.getStaffShifts(restaurant.id);
}

export async function saveShift(
  userId: string,
  organizationId: string,
  input: StaffShiftFormInput,
) {
  const restaurant = await resolveRestaurant(userId, organizationId);

  const role = await repo.getStaffRoleById(input.staffRoleId);
  if (!role || role.restaurantId !== restaurant.id) throw new ForbiddenError('Invalid role');

  const payload = {
    staffRoleId: input.staffRoleId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    quantity: input.quantity,
  };

  if (input.id) {
    const shift = await repo.getStaffShiftById(input.id);
    if (!shift || shift.restaurantId !== restaurant.id) throw new ForbiddenError();
    return repo.updateStaffShift(input.id, payload);
  }

  return repo.createStaffShift(restaurant.id, payload);
}

export async function deleteShift(userId: string, organizationId: string, shiftId: string) {
  const restaurant = await resolveRestaurant(userId, organizationId);
  const shift = await repo.getStaffShiftById(shiftId);
  if (!shift || shift.restaurantId !== restaurant.id) throw new ForbiddenError();
  return repo.deleteStaffShift(shiftId);
}

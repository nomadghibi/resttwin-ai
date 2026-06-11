import { prisma } from '@/lib/db';
import type { CapacityImpact } from '@prisma/client';

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getStaffRoles(restaurantId: string) {
  return prisma.staffRole.findMany({
    where: { restaurantId },
    orderBy: { name: 'asc' },
  });
}

export async function getStaffRoleById(id: string) {
  return prisma.staffRole.findUnique({ where: { id } });
}

export async function createStaffRole(
  restaurantId: string,
  data: {
    name: string;
    hourlyWageCents: number;
    capacityImpact: CapacityImpact;
    defaultProductivity: number;
  },
) {
  return prisma.staffRole.create({ data: { restaurantId, ...data } });
}

export async function updateStaffRole(
  id: string,
  data: {
    name?: string;
    hourlyWageCents?: number;
    capacityImpact?: CapacityImpact;
    defaultProductivity?: number;
  },
) {
  return prisma.staffRole.update({ where: { id }, data });
}

export async function deleteStaffRole(id: string) {
  await prisma.$transaction(async (tx) => {
    await tx.staffShift.deleteMany({ where: { staffRoleId: id } });
    await tx.staffRole.delete({ where: { id } });
  });
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export async function getStaffShifts(restaurantId: string) {
  return prisma.staffShift.findMany({
    where: { restaurantId },
    include: { staffRole: true },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

export async function getStaffShiftById(id: string) {
  return prisma.staffShift.findUnique({ where: { id } });
}

export async function createStaffShift(
  restaurantId: string,
  data: {
    staffRoleId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    quantity: number;
  },
) {
  return prisma.staffShift.create({ data: { restaurantId, ...data } });
}

export async function updateStaffShift(
  id: string,
  data: {
    staffRoleId?: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    quantity?: number;
  },
) {
  return prisma.staffShift.update({ where: { id }, data });
}

export async function deleteStaffShift(id: string) {
  return prisma.staffShift.delete({ where: { id } });
}

import { prisma } from '@/lib/db';
import { getRestaurant } from './restaurant';
import { buildSnapshot } from '@/simulation/snapshot';
import { runSimulation } from '@/simulation/engine';
import { NotFoundError } from '@/lib/errors';

export async function runBaselineSimulation(userId: string, organizationId: string) {
  const restaurant = await getRestaurant(userId, organizationId);
  if (!restaurant) throw new NotFoundError('No restaurant found. Complete setup first.');

  const [menuItems, shifts, hours] = await Promise.all([
    prisma.menuItem.findMany({ where: { restaurantId: restaurant.id, isActive: true } }),
    prisma.staffShift.findMany({
      where: { restaurantId: restaurant.id },
      include: { staffRole: true },
    }),
    prisma.operatingHour.findMany({ where: { restaurantId: restaurant.id } }),
  ]);

  if (menuItems.length === 0) throw new Error('Add at least one active menu item before simulating.');
  if (hours.length === 0) throw new Error('Configure operating hours before simulating.');

  const snapshot = buildSnapshot({ restaurant, menuItems, shifts, hours });
  const result = runSimulation(snapshot);

  const run = await prisma.simulationRun.create({
    data: {
      restaurantId: restaurant.id,
      organizationId,
      type: 'BASELINE',
      status: 'COMPLETED',
      inputSnapshotJson: snapshot as object,
      resultJson: result as object,
    },
  });

  return { run, result, snapshot };
}

export async function getBaselineRuns(userId: string, organizationId: string) {
  const restaurant = await getRestaurant(userId, organizationId);
  if (!restaurant) return [];

  return prisma.simulationRun.findMany({
    where: { restaurantId: restaurant.id, type: 'BASELINE', status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

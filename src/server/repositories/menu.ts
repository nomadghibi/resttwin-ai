import { prisma } from '@/lib/db';

export async function getMenuItems(restaurantId: string) {
  return prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: [{ isActive: 'desc' }, { category: 'asc' }, { name: 'asc' }],
  });
}

export async function getMenuItemById(id: string) {
  return prisma.menuItem.findUnique({ where: { id } });
}

export async function createMenuItem(
  restaurantId: string,
  data: {
    name: string;
    category: string;
    priceCents: number;
    foodCostCents: number;
    prepMinutes: number;
    popularityWeight: number;
  },
) {
  return prisma.menuItem.create({ data: { restaurantId, ...data } });
}

export async function updateMenuItem(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    priceCents: number;
    foodCostCents: number;
    prepMinutes: number;
    popularityWeight: number;
    isActive: boolean;
  }>,
) {
  return prisma.menuItem.update({ where: { id }, data });
}

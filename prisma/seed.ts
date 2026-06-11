import { PrismaClient, BusinessModel, CapacityImpact, MembershipRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const HOURS = [
  { dayOfWeek: 0, isOpen: true,  openTime: '11:00', closeTime: '21:00' }, // Sun
  { dayOfWeek: 1, isOpen: false, openTime: '11:00', closeTime: '22:00' }, // Mon closed
  { dayOfWeek: 2, isOpen: true,  openTime: '11:00', closeTime: '22:00' }, // Tue
  { dayOfWeek: 3, isOpen: true,  openTime: '11:00', closeTime: '22:00' }, // Wed
  { dayOfWeek: 4, isOpen: true,  openTime: '11:00', closeTime: '22:00' }, // Thu
  { dayOfWeek: 5, isOpen: true,  openTime: '11:00', closeTime: '23:00' }, // Fri
  { dayOfWeek: 6, isOpen: true,  openTime: '11:00', closeTime: '23:00' }, // Sat
];

const MENU_ITEMS = [
  { name: 'Classic Burger',    category: 'Mains',     priceCents: 1499, foodCostCents: 450,  prepMinutes: 8,  popularityWeight: 2.0 },
  { name: 'Caesar Salad',      category: 'Starters',  priceCents: 1199, foodCostCents: 300,  prepMinutes: 5,  popularityWeight: 1.5 },
  { name: 'Pasta Carbonara',   category: 'Mains',     priceCents: 1399, foodCostCents: 400,  prepMinutes: 12, popularityWeight: 1.8 },
  { name: 'Chicken Wings',     category: 'Starters',  priceCents: 1299, foodCostCents: 350,  prepMinutes: 15, popularityWeight: 1.6 },
  { name: 'Ribeye Steak',      category: 'Mains',     priceCents: 2899, foodCostCents: 1200, prepMinutes: 20, popularityWeight: 0.8 },
  { name: 'Fish & Chips',      category: 'Mains',     priceCents: 1599, foodCostCents: 500,  prepMinutes: 12, popularityWeight: 1.2 },
  { name: 'Cheesecake',        category: 'Desserts',  priceCents: 799,  foodCostCents: 200,  prepMinutes: 2,  popularityWeight: 1.0 },
  { name: 'House Lager (pint)',category: 'Drinks',    priceCents: 599,  foodCostCents: 150,  prepMinutes: 1,  popularityWeight: 2.5 },
  { name: 'Soft Drink',        category: 'Drinks',    priceCents: 349,  foodCostCents: 50,   prepMinutes: 1,  popularityWeight: 2.0 },
];

// Open days (Mon=1 closed, so 0,2,3,4,5,6)
const OPEN_DAYS = [0, 2, 3, 4, 5, 6];

async function main() {
  console.log('Seeding demo data...');

  // Org + user + membership
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-001' },
    update: {},
    create: {
      id: 'demo-org-001',
      name: 'Corner Bistro Co.',
    },
  });

  const passwordHash = await bcrypt.hash('demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@resttwin.ai' },
    update: {},
    create: {
      name: 'Demo Owner',
      email: 'demo@resttwin.ai',
      passwordHash,
    },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: MembershipRole.OWNER,
    },
  });

  // Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'demo-restaurant-001' },
    update: {},
    create: {
      id: 'demo-restaurant-001',
      organizationId: org.id,
      name: 'The Corner Bistro',
      restaurantType: 'Casual Dining',
      addressText: '123 Main St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
      businessModel: BusinessModel.DINE_IN,
      seatingCapacity: 60,
      avgTableTurnMinutes: 75,
      monthlyRent: 400000,
      monthlyUtilities: 80000,
      monthlyOtherFixedCosts: 60000,
      targetFoodCostPercent: 30,
      targetLaborCostPercent: 32,
    },
  });

  // Operating hours
  for (const h of HOURS) {
    await prisma.operatingHour.upsert({
      where: { restaurantId_dayOfWeek: { restaurantId: restaurant.id, dayOfWeek: h.dayOfWeek } },
      update: h,
      create: { restaurantId: restaurant.id, ...h },
    });
  }

  // Menu items
  for (const item of MENU_ITEMS) {
    const existing = await prisma.menuItem.findFirst({
      where: { restaurantId: restaurant.id, name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({ data: { restaurantId: restaurant.id, ...item } });
    }
  }

  // Staff roles
  const roles = [
    { name: 'Line Cook',      hourlyWageCents: 1800, capacityImpact: CapacityImpact.KITCHEN,  defaultProductivity: 1.0 },
    { name: 'Server',         hourlyWageCents: 1200, capacityImpact: CapacityImpact.SERVICE,  defaultProductivity: 1.0 },
    { name: 'Host / Cashier', hourlyWageCents: 1400, capacityImpact: CapacityImpact.CASHIER,  defaultProductivity: 1.0 },
    { name: 'Dishwasher',     hourlyWageCents: 1500, capacityImpact: CapacityImpact.KITCHEN,  defaultProductivity: 0.8 },
  ];

  const createdRoles: Record<string, string> = {};
  for (const role of roles) {
    let existing = await prisma.staffRole.findFirst({
      where: { restaurantId: restaurant.id, name: role.name },
    });
    if (!existing) {
      existing = await prisma.staffRole.create({
        data: { restaurantId: restaurant.id, ...role },
      });
    }
    createdRoles[role.name] = existing.id;
  }

  // Staff shifts (open days only)
  const shifts = [
    { roleName: 'Line Cook',      startTime: '10:00', endTime: '22:00', quantity: 2 },
    { roleName: 'Server',         startTime: '16:00', endTime: '22:00', quantity: 3 },
    { roleName: 'Host / Cashier', startTime: '16:00', endTime: '22:00', quantity: 1 },
    { roleName: 'Dishwasher',     startTime: '10:00', endTime: '22:00', quantity: 1 },
  ];

  for (const day of OPEN_DAYS) {
    for (const shift of shifts) {
      const existing = await prisma.staffShift.findFirst({
        where: {
          restaurantId: restaurant.id,
          staffRoleId: createdRoles[shift.roleName],
          dayOfWeek: day,
        },
      });
      if (!existing) {
        await prisma.staffShift.create({
          data: {
            restaurantId: restaurant.id,
            staffRoleId: createdRoles[shift.roleName]!,
            dayOfWeek: day,
            startTime: shift.startTime,
            endTime: shift.endTime,
            quantity: shift.quantity,
          },
        });
      }
    }
  }

  console.log('Seed complete.');
  console.log('  Org:', org.name);
  console.log('  User: demo@resttwin.ai / demo1234');
  console.log('  Restaurant:', restaurant.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

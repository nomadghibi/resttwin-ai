import { describe, it, expect } from 'vitest';
import { runSimulation } from '../engine';
import type { SimulationInput } from '../types';

const BASE_MENU = [
  { id: 'item-1', name: 'Burger', priceCents: 1499, foodCostCents: 450, prepMinutes: 8, popularityWeight: 1 },
  { id: 'item-2', name: 'Salad',  priceCents: 1199, foodCostCents: 300, prepMinutes: 5, popularityWeight: 1 },
];

const BASE_SHIFTS = [
  {
    staffRoleId: 'r1', roleName: 'Cook',
    hourlyWageCents: 1800, capacityImpact: 'KITCHEN' as const,
    defaultProductivity: 1.0, dayOfWeek: 0, startTime: '11:00', endTime: '22:00', quantity: 2,
  },
  {
    staffRoleId: 'r2', roleName: 'Server',
    hourlyWageCents: 1200, capacityImpact: 'SERVICE' as const,
    defaultProductivity: 1.0, dayOfWeek: 0, startTime: '11:00', endTime: '22:00', quantity: 3,
  },
];

// Sunday open only (day 0), all other days closed
const BASE_HOURS = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  isOpen: i === 0,
  openTime: '11:00',
  closeTime: '22:00',
}));

const baseInput: SimulationInput = {
  restaurantType: 'Casual Dining',
  businessModel: 'DINE_IN',
  seatingCapacity: 50,
  avgTableTurnMinutes: 60,
  monthlyRentCents: 400_000,
  monthlyUtilitiesCents: 80_000,
  monthlyOtherFixedCostsCents: 60_000,
  menuItems: BASE_MENU,
  shifts: BASE_SHIFTS,
  hours: BASE_HOURS,
};

describe('runSimulation', () => {
  it('closed days produce zero orders', () => {
    const result = runSimulation(baseInput);
    const closedDays = result.byDay.filter((d) => d.dayOfWeek !== 0);
    for (const d of closedDays) {
      expect(d.orders).toBe(0);
      expect(d.revenueCents).toBe(0);
    }
  });

  it('revenue equals orders × weighted-average price', () => {
    const result = runSimulation(baseInput);
    // Equal popularity → avg price = (1499 + 1199) / 2 = 1349
    // Rounding totalOrders to int can cause up to 1-order difference in revenue
    const avgPrice = (1499 + 1199) / 2;
    const diff = Math.abs(result.totals.revenueCents - result.totals.orders * avgPrice);
    expect(diff).toBeLessThan(avgPrice); // within 1 order's revenue
  });

  it('labor cost equals shift-hours × wage × quantity', () => {
    const result = runSimulation(baseInput);
    // Day 0 open 11:00–22:00 = 11 hours
    // Cook:   11 × 1800 × 2 = 39 600 cents
    // Server: 11 × 1200 × 3 = 39 600 cents  → total 79 200
    const expected = 11 * 1800 * 2 + 11 * 1200 * 3;
    expect(result.totals.laborCostCents).toBeCloseTo(expected, 0);
  });

  it('food cost percent calculates correctly', () => {
    const result = runSimulation(baseInput);
    // avg food cost / avg price = 375 / 1349 ≈ 27.8%
    const expectedPct = ((450 + 300) / 2 / ((1499 + 1199) / 2)) * 100;
    expect(result.totals.avgFoodCostPercent).toBeCloseTo(expectedPct, 1);
  });

  it('demand multiplier scales orders linearly', () => {
    const base = runSimulation(baseInput);
    const doubled = runSimulation({ ...baseInput, demandMultiplier: 2.0 });
    expect(doubled.totals.orders).toBeCloseTo(base.totals.orders * 2, 0);
  });

  it('bottleneck appears when kitchen capacity is zero but orders exist', () => {
    const input: SimulationInput = {
      ...baseInput,
      shifts: baseInput.shifts.filter((s) => s.capacityImpact !== 'KITCHEN'),
    };
    const result = runSimulation(input);
    const kitchenBottlenecks = result.bottlenecks.filter((b) => b.type === 'KITCHEN');
    expect(kitchenBottlenecks.length).toBeGreaterThan(0);
  });

  it('delivery toggle boosts orders by ~15%', () => {
    const base = runSimulation(baseInput);
    const delivery = runSimulation({ ...baseInput, deliveryEnabled: true });
    // Compare revenue ratio (avoids integer-rounding mismatch on orders)
    const ratio = delivery.totals.revenueCents / base.totals.revenueCents;
    expect(ratio).toBeCloseTo(1.15, 1);
  });

  it('delivery fee reduces net profit vs gross', () => {
    const result = runSimulation({ ...baseInput, deliveryEnabled: true, deliveryFeePercent: 18 });
    const grossMinusCosts =
      result.totals.revenueCents -
      result.totals.foodCostCents -
      result.totals.laborCostCents -
      result.totals.fixedCostCents;
    expect(result.totals.estimatedNetProfitCents).toBeLessThan(grossMinusCosts);
  });

  it('fixed cost equals approx 12/52 of monthly total', () => {
    const result = runSimulation(baseInput);
    const monthlyTotal = 400_000 + 80_000 + 60_000;
    const expected = Math.round((monthlyTotal * 12) / 52);
    expect(result.totals.fixedCostCents).toBeCloseTo(expected, 0);
  });

  it('menu item results sum to weekly totals', () => {
    const result = runSimulation(baseInput);
    const sumRev = result.menuItemResults.reduce((s, m) => s + m.revenueCents, 0);
    expect(sumRev).toBeCloseTo(result.totals.revenueCents, 0);
  });
});

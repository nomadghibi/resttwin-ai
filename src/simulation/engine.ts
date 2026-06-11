import {
  getBaseDemand,
  getDayMultiplier,
  getHourMultiplier,
  KITCHEN_ORDERS_PER_STAFF,
  SERVICE_ORDERS_PER_STAFF,
} from './assumptions';
import type {
  SimulationInput,
  SimulationResult,
  SimulationShiftInput,
  DayResult,
  HourResult,
  Bottleneck,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

function getOpenHours(
  hoursMap: Map<number, { isOpen: boolean; openTime: string; closeTime: string }>,
  day: number,
): number[] {
  const h = hoursMap.get(day);
  if (!h || !h.isOpen) return [];
  const open = parseHour(h.openTime);
  const close = parseHour(h.closeTime);
  const result: number[] = [];
  for (let hr = open; hr < close; hr++) result.push(hr);
  return result;
}

function isShiftActive(shift: SimulationShiftInput, hour: number): boolean {
  return hour >= parseHour(shift.startTime) && hour < parseHour(shift.endTime);
}

function safeUtil(orders: number, capacity: number): number {
  if (capacity <= 0) return orders > 0 ? 10 : 0; // 10 = way over capacity
  return orders / capacity;
}

function kitchenCapacity(shifts: SimulationShiftInput[]): number {
  return shifts
    .filter((s) => s.capacityImpact === 'KITCHEN')
    .reduce((sum, s) => sum + s.quantity * s.defaultProductivity * KITCHEN_ORDERS_PER_STAFF, 0);
}

function serviceCapacity(shifts: SimulationShiftInput[]): number {
  return shifts
    .filter((s) => s.capacityImpact === 'SERVICE')
    .reduce((sum, s) => sum + s.quantity * s.defaultProductivity * SERVICE_ORDERS_PER_STAFF, 0);
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export function runSimulation(input: SimulationInput): SimulationResult {
  const baseDemand = getBaseDemand(input.restaurantType);
  const scenarioMultiplier = input.demandMultiplier ?? 1.0;
  const deliveryBoost = input.deliveryEnabled ? 1.15 : 1.0;

  const totalPopWeight = input.menuItems.reduce((s, m) => s + m.popularityWeight, 0);

  // Build hours lookup
  const hoursMap = new Map(
    input.hours.map((h) => [
      h.dayOfWeek,
      { isOpen: h.isOpen, openTime: h.openTime, closeTime: h.closeTime },
    ]),
  );

  // Pre-calculate open hours to allocate fixed costs
  const openHrsByDay = new Map<number, number[]>();
  let totalOpenHours = 0;
  for (let d = 0; d < 7; d++) {
    const hrs = getOpenHours(hoursMap, d);
    openHrsByDay.set(d, hrs);
    totalOpenHours += hrs.length;
  }

  const weeklyFixedCents =
    ((input.monthlyRentCents + input.monthlyUtilitiesCents + input.monthlyOtherFixedCostsCents) *
      12) /
    52;
  const fixedCostPerHour = totalOpenHours > 0 ? weeklyFixedCents / totalOpenHours : 0;

  const dayResults: DayResult[] = [];
  const hourResults: HourResult[] = [];
  const bottlenecks: Bottleneck[] = [];
  const menuItemOrdersAccum: Record<string, number> = {};

  // Main loop
  for (let day = 0; day < 7; day++) {
    const openHrs = openHrsByDay.get(day) ?? [];
    const dayMult = getDayMultiplier(day);
    const shiftsForDay = input.shifts.filter((s) => s.dayOfWeek === day);

    let dayOrders = 0,
      dayRevenue = 0,
      dayFoodCost = 0,
      dayLabor = 0;
    let dayKitchenUtilSum = 0,
      dayServiceUtilSum = 0,
      dayWaitRiskSum = 0;

    for (const hour of openHrs) {
      const hourMult = getHourMultiplier(hour);
      const hourOrders = baseDemand * dayMult * hourMult * scenarioMultiplier * deliveryBoost;

      // Menu item allocation
      let hourRevenue = 0;
      let hourFoodCost = 0;
      if (totalPopWeight > 0) {
        for (const item of input.menuItems) {
          const itemOrders = hourOrders * (item.popularityWeight / totalPopWeight);
          menuItemOrdersAccum[item.id] = (menuItemOrdersAccum[item.id] ?? 0) + itemOrders;
          hourRevenue += itemOrders * item.priceCents;
          hourFoodCost += itemOrders * item.foodCostCents;
        }
      }

      // Labor
      const activeShifts = shiftsForDay.filter((s) => isShiftActive(s, hour));
      const hourLabor = activeShifts.reduce(
        (sum, s) => sum + s.hourlyWageCents * s.quantity,
        0,
      );

      // Capacity & utilization
      const kitCap = kitchenCapacity(activeShifts);
      const svcCap = serviceCapacity(activeShifts);
      const kitUtil = safeUtil(hourOrders, kitCap);
      const svcUtil = safeUtil(hourOrders, svcCap);
      const waitRisk = Math.min(100, Math.max(kitUtil, svcUtil) * 100);

      if (kitUtil > 0.9) {
        bottlenecks.push({
          type: 'KITCHEN',
          dayOfWeek: day,
          hour,
          utilization: kitUtil,
          message: `Kitchen at ${Math.round(kitUtil * 100)}% capacity (day ${day}, ${hour}:00)`,
        });
      }
      if (svcUtil > 0.9) {
        bottlenecks.push({
          type: 'SERVICE',
          dayOfWeek: day,
          hour,
          utilization: svcUtil,
          message: `Service at ${Math.round(svcUtil * 100)}% capacity (day ${day}, ${hour}:00)`,
        });
      }

      hourResults.push({
        dayOfWeek: day,
        hour,
        orders: hourOrders,
        revenueCents: hourRevenue,
        laborCostCents: hourLabor,
        kitchenUtilization: kitUtil,
        serviceUtilization: svcUtil,
      });

      dayOrders += hourOrders;
      dayRevenue += hourRevenue;
      dayFoodCost += hourFoodCost;
      dayLabor += hourLabor;
      dayKitchenUtilSum += kitUtil;
      dayServiceUtilSum += svcUtil;
      dayWaitRiskSum += waitRisk;
    }

    const hourCount = openHrs.length;
    dayResults.push({
      dayOfWeek: day,
      orders: dayOrders,
      revenueCents: dayRevenue,
      foodCostCents: dayFoodCost,
      laborCostCents: dayLabor,
      kitchenUtilization: hourCount > 0 ? dayKitchenUtilSum / hourCount : 0,
      serviceUtilization: hourCount > 0 ? dayServiceUtilSum / hourCount : 0,
      waitRisk: hourCount > 0 ? dayWaitRiskSum / hourCount : 0,
    });
  }

  // Build menu item results
  const menuItemResults = input.menuItems.map((item) => {
    const orders = menuItemOrdersAccum[item.id] ?? 0;
    const rev = orders * item.priceCents;
    const fc = orders * item.foodCostCents;
    return {
      id: item.id,
      name: item.name,
      orders,
      revenueCents: rev,
      foodCostCents: fc,
      grossMarginCents: rev - fc,
    };
  });

  // Aggregate totals
  const totalOrders = dayResults.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = dayResults.reduce((s, d) => s + d.revenueCents, 0);
  const totalFoodCost = dayResults.reduce((s, d) => s + d.foodCostCents, 0);
  const totalLabor = dayResults.reduce((s, d) => s + d.laborCostCents, 0);
  const totalFixed = Math.round(weeklyFixedCents);

  const deliveryFeeCents = input.deliveryEnabled
    ? Math.round(totalRevenue * ((input.deliveryFeePercent ?? 18) / 100))
    : 0;

  const grossProfit = totalRevenue - totalFoodCost;
  const netProfit = totalRevenue - totalFoodCost - totalLabor - totalFixed - deliveryFeeCents;

  const openDays = dayResults.filter((d) => d.orders > 0);
  const avgWaitRisk =
    openDays.length > 0
      ? openDays.reduce((s, d) => s + d.waitRisk, 0) / openDays.length
      : 0;

  const assumptions = [
    `Base demand: ${baseDemand} orders/hr for "${input.restaurantType}"`,
    'Day-of-week and hour-of-day demand multipliers applied',
    `Kitchen: ${KITCHEN_ORDERS_PER_STAFF} orders/hr per staff unit; Service: ${SERVICE_ORDERS_PER_STAFF} orders/hr`,
    `Fixed costs allocated across ${totalOpenHours} open hours this week`,
    ...(input.deliveryEnabled
      ? [`Delivery fee: ${input.deliveryFeePercent ?? 18}% of revenue deducted`]
      : []),
  ];

  return {
    period: 'WEEK',
    totals: {
      orders: Math.round(totalOrders),
      revenueCents: Math.round(totalRevenue),
      foodCostCents: Math.round(totalFoodCost),
      laborCostCents: Math.round(totalLabor),
      fixedCostCents: totalFixed,
      grossProfitCents: Math.round(grossProfit),
      estimatedNetProfitCents: Math.round(netProfit),
      avgFoodCostPercent: totalRevenue > 0 ? (totalFoodCost / totalRevenue) * 100 : 0,
      avgLaborCostPercent: totalRevenue > 0 ? (totalLabor / totalRevenue) * 100 : 0,
      avgWaitRisk,
    },
    byDay: dayResults,
    byHour: hourResults,
    menuItemResults,
    bottlenecks,
    assumptions,
  };
}

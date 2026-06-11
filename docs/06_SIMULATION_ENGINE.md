# Simulation Engine Spec

## Purpose

Model restaurant operations well enough to support MVP what-if decisions.

## Principle

Use simple, explainable assumptions first. Accuracy improves later with real POS and market data.

## Simulation period

MVP runs a 7-day simulation with hourly buckets.

```text
7 days x up to 24 hourly buckets = simple, fast, explainable
```

## Required inputs

Restaurant:

- restaurantType
- businessModel
- seatingCapacity
- avgTableTurnMinutes
- operating hours
- fixed monthly costs

Menu:

- price
- food cost
- prep minutes
- popularity weight

Staffing:

- staff role
- hourly wage
- day/time shifts
- quantity
- productivity

Assumptions:

- base demand by restaurant type
- day-of-week multipliers
- hour-of-day multipliers
- delivery demand multiplier
- promotion multiplier

## MVP default demand multipliers

### Day of week

```ts
const dayMultipliers = {
  0: 0.75, // Sunday
  1: 0.55, // Monday
  2: 0.65, // Tuesday
  3: 0.75, // Wednesday
  4: 0.9,  // Thursday
  5: 1.25, // Friday
  6: 1.2,  // Saturday
};
```

### Hour of day

```ts
const hourMultipliers = {
  7: 0.25, 8: 0.35, 9: 0.3, 10: 0.35,
  11: 0.75, 12: 1.0, 13: 0.85, 14: 0.55,
  15: 0.35, 16: 0.45, 17: 0.9, 18: 1.25,
  19: 1.2, 20: 0.85, 21: 0.45, 22: 0.25,
};
```

## Restaurant type base demand

Use orders per open hour before multipliers:

```ts
const restaurantTypeBaseDemand = {
  PIZZA: 18,
  CAFE: 14,
  CASUAL_DINING: 16,
  FAST_CASUAL: 22,
  SEAFOOD: 15,
  MEXICAN: 18,
  ITALIAN: 16,
  BBQ: 15,
  FOOD_TRUCK: 12,
  GENERIC: 15,
};
```

## Core calculations

### Hourly demand

```text
hourlyOrders = baseDemand * dayMultiplier * hourMultiplier * scenarioDemandMultiplier
```

### Menu item allocation

Distribute orders by `popularityWeight` among active menu items.

```text
itemOrders = hourlyOrders * itemPopularityWeight / totalPopularityWeight
```

### Revenue

```text
revenue = sum(itemOrders * itemPrice)
```

### Food cost

```text
foodCost = sum(itemOrders * itemFoodCost)
```

### Labor cost

```text
laborCost = sum(shiftHoursInBucket * roleHourlyWage * quantity)
```

### Kitchen capacity

Simplified:

```text
kitchenCapacityOrdersPerHour = sum(kitchenStaffQuantity * roleProductivity * 20)
```

### Service capacity

Simplified:

```text
serviceCapacityOrdersPerHour = sum(serviceStaffQuantity * roleProductivity * 18)
```

### Bottleneck

```text
kitchenUtilization = hourlyOrders / kitchenCapacityOrdersPerHour
serviceUtilization = hourlyOrders / serviceCapacityOrdersPerHour
```

If utilization > 0.9: high risk.
If utilization > 1.0: bottleneck.

### Wait risk score

0-100 score:

```text
waitRisk = max(kitchenUtilization, serviceUtilization) * 100
```

Cap at 100.

### Fixed cost allocation

```text
weeklyFixedCost = monthlyFixedCost * 12 / 52
hourlyFixedCost = weeklyFixedCost / openHoursPerWeek
```

### Profit

```text
grossProfit = revenue - foodCost
estimatedNetProfit = revenue - foodCost - laborCost - allocatedFixedCost
```

## Scenario transforms

### PRICE_CHANGE_PERCENT

Increase or decrease selected item prices.

Demand elasticity MVP rule:

```text
If price increase <= 5%, demand multiplier = 0.98
If price increase <= 10%, demand multiplier = 0.94
If price increase <= 15%, demand multiplier = 0.88
If price increase > 15%, demand multiplier = 0.80
```

### STAFFING_CHANGE

Add or remove role quantity for selected dayparts.

### HOURS_CHANGE

Change open/closed days or hours.

### DELIVERY_TOGGLE

If delivery enabled:

- Demand multiplier +15%
- Average margin penalty: deliveryFeePercent default 18% of revenue
- Kitchen utilization increases from more orders

### PROMOTION

- Demand multiplier from user input
- Optional discount percent reduces price

## Simulation output shape

```ts
interface SimulationResult {
  period: 'WEEK';
  totals: {
    orders: number;
    revenueCents: number;
    foodCostCents: number;
    laborCostCents: number;
    fixedCostCents: number;
    grossProfitCents: number;
    estimatedNetProfitCents: number;
    avgFoodCostPercent: number;
    avgLaborCostPercent: number;
    avgWaitRisk: number;
  };
  byDay: DaySimulationResult[];
  byHour: HourSimulationResult[];
  menuItemResults: MenuItemSimulationResult[];
  bottlenecks: Bottleneck[];
  assumptions: string[];
}
```

## Unit tests required

- Price increase changes revenue and demand.
- Labor cost equals shift hours x wage x quantity.
- Food cost percentage calculates correctly.
- Delivery increases orders but reduces margin.
- Bottleneck appears when demand exceeds capacity.
- Closed day produces zero orders.

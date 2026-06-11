export interface SimulationMenuInput {
  id: string;
  name: string;
  priceCents: number;
  foodCostCents: number;
  prepMinutes: number;
  popularityWeight: number;
}

export interface SimulationShiftInput {
  staffRoleId: string;
  roleName: string;
  hourlyWageCents: number;
  capacityImpact: 'KITCHEN' | 'SERVICE' | 'CASHIER' | 'DELIVERY';
  defaultProductivity: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  quantity: number;
}

export interface SimulationHourInput {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface SimulationInput {
  restaurantType: string;
  businessModel: string;
  seatingCapacity: number;
  avgTableTurnMinutes: number;
  monthlyRentCents: number;
  monthlyUtilitiesCents: number;
  monthlyOtherFixedCostsCents: number;
  menuItems: SimulationMenuInput[];
  shifts: SimulationShiftInput[];
  hours: SimulationHourInput[];
  // Scenario overrides (baseline = defaults below)
  demandMultiplier?: number;
  deliveryEnabled?: boolean;
  deliveryFeePercent?: number;
}

export interface DayResult {
  dayOfWeek: number;
  orders: number;
  revenueCents: number;
  foodCostCents: number;
  laborCostCents: number;
  kitchenUtilization: number;
  serviceUtilization: number;
  waitRisk: number;
}

export interface HourResult {
  dayOfWeek: number;
  hour: number;
  orders: number;
  revenueCents: number;
  laborCostCents: number;
  kitchenUtilization: number;
  serviceUtilization: number;
}

export interface MenuItemSimulationResult {
  id: string;
  name: string;
  orders: number;
  revenueCents: number;
  foodCostCents: number;
  grossMarginCents: number;
}

export interface Bottleneck {
  type: 'KITCHEN' | 'SERVICE';
  dayOfWeek: number;
  hour: number;
  utilization: number;
  message: string;
}

export interface SimulationTotals {
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
}

export interface SimulationResult {
  period: 'WEEK';
  totals: SimulationTotals;
  byDay: DayResult[];
  byHour: HourResult[];
  menuItemResults: MenuItemSimulationResult[];
  bottlenecks: Bottleneck[];
  assumptions: string[];
}

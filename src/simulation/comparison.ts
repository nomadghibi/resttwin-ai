import type { SimulationResult } from './types';

export interface ScenarioDelta {
  revenueDeltaCents: number;
  revenueChangePercent: number;
  foodCostDeltaCents: number;
  foodCostPercentDelta: number;
  laborCostDeltaCents: number;
  laborCostPercentDelta: number;
  fixedCostDeltaCents: number;
  netProfitDeltaCents: number;
  netProfitChangePercent: number;
  ordersDelta: number;
  avgWaitRiskDelta: number;
}

export function compareSimulations(
  baseline: SimulationResult,
  scenario: SimulationResult,
): ScenarioDelta {
  const b = baseline.totals;
  const s = scenario.totals;

  return {
    revenueDeltaCents: s.revenueCents - b.revenueCents,
    revenueChangePercent:
      b.revenueCents > 0 ? ((s.revenueCents - b.revenueCents) / b.revenueCents) * 100 : 0,
    foodCostDeltaCents: s.foodCostCents - b.foodCostCents,
    foodCostPercentDelta: s.avgFoodCostPercent - b.avgFoodCostPercent,
    laborCostDeltaCents: s.laborCostCents - b.laborCostCents,
    laborCostPercentDelta: s.avgLaborCostPercent - b.avgLaborCostPercent,
    fixedCostDeltaCents: s.fixedCostCents - b.fixedCostCents,
    netProfitDeltaCents: s.estimatedNetProfitCents - b.estimatedNetProfitCents,
    netProfitChangePercent:
      b.estimatedNetProfitCents !== 0
        ? ((s.estimatedNetProfitCents - b.estimatedNetProfitCents) /
            Math.abs(b.estimatedNetProfitCents)) *
          100
        : 0,
    ordersDelta: s.orders - b.orders,
    avgWaitRiskDelta: s.avgWaitRisk - b.avgWaitRisk,
  };
}

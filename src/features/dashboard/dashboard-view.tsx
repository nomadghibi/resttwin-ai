'use client';

import Link from 'next/link';
import { KpiCard } from '@/components/kpi-card';
import { WeeklyChart } from '@/components/charts/weekly-chart';
import { CostBreakdownChart } from '@/components/charts/cost-breakdown-chart';
import { RecommendationCard } from '@/components/recommendation-card';
import type { SimulationResult } from '@/simulation/types';
import type { RecommendationType } from '@/agents/agent-types';
import { formatCents } from '@/lib/money';

type Props = {
  restaurantName: string;
  baselineResult: SimulationResult | null;
  latestRecommendation: RecommendationType | null;
  scenarioName?: string;
  latestScenarioResult?: SimulationResult | null;
};

const QUICK_SCENARIOS = [
  { label: 'Raise prices 8%', href: '/scenarios?template=PRICE_CHANGE_PERCENT' },
  { label: 'Open Monday', href: '/scenarios?template=HOURS_CHANGE' },
  { label: 'Add delivery', href: '/scenarios?template=DELIVERY_TOGGLE' },
  { label: 'Run promotion', href: '/scenarios?template=PROMOTION' },
];

export function DashboardView({
  restaurantName,
  baselineResult,
  latestRecommendation,
  scenarioName,
  latestScenarioResult,
}: Props) {
  if (!baselineResult) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">{restaurantName}</p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm font-medium text-gray-700">Finish setup to run your first simulation.</p>
          <p className="mt-1 text-xs text-gray-500">Add menu items, staff, and operating hours.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/setup" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
              Go to Setup
            </Link>
            <Link href="/simulations" className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Run Simulation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const t = baselineResult.totals;
  const netColor: 'green' | 'red' | 'neutral' = t.estimatedNetProfitCents >= 0 ? 'green' : 'red';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">{restaurantName} — 7-day estimate</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Est. Weekly Revenue" value={formatCents(t.revenueCents)} />
        <KpiCard label="Food Cost %" value={`${t.avgFoodCostPercent.toFixed(1)}%`} subValue={formatCents(t.foodCostCents)} />
        <KpiCard label="Labor Cost %" value={`${t.avgLaborCostPercent.toFixed(1)}%`} subValue={formatCents(t.laborCostCents)} />
        <KpiCard label="Fixed Costs" value={formatCents(t.fixedCostCents)} subValue="per week" />
        <KpiCard label="Est. Net Profit" value={formatCents(t.estimatedNetProfitCents)} highlight={netColor} />
        <KpiCard label="Avg Wait Risk" value={`${t.avgWaitRisk.toFixed(0)}/100`} highlight={t.avgWaitRisk > 70 ? 'red' : t.avgWaitRisk > 40 ? 'neutral' : 'green'} />
      </div>

      {/* Bottleneck alerts */}
      {baselineResult.bottlenecks.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            ⚠ {baselineResult.bottlenecks.length} capacity bottleneck(s)
          </p>
          {baselineResult.bottlenecks.slice(0, 3).map((b, i) => (
            <p key={i} className="text-xs text-yellow-700">{b.message}</p>
          ))}
        </div>
      )}

      {/* Weekly revenue chart — baseline + latest scenario overlay */}
      <div className="rounded-lg border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Weekly Revenue by Day</p>
          {latestScenarioResult && scenarioName && (
            <p className="text-xs text-gray-400">vs. {scenarioName}</p>
          )}
        </div>
        <WeeklyChart
          baseline={baselineResult.byDay}
          scenario={latestScenarioResult?.byDay}
        />
      </div>

      {/* Cost breakdown chart */}
      <div className="rounded-lg border bg-white p-5">
        <p className="mb-1 text-sm font-semibold text-gray-700">Daily Cost Breakdown</p>
        <p className="mb-3 text-xs text-gray-400">Stacked costs vs. revenue line — bar above line = unprofitable day</p>
        <CostBreakdownChart byDay={baselineResult.byDay} totals={baselineResult.totals} />
      </div>

      {/* Latest recommendation */}
      {latestRecommendation && (
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700">Latest Recommendation</p>
          <RecommendationCard recommendation={latestRecommendation} scenarioName={scenarioName} />
        </div>
      )}

      {/* Scenario quick-starts */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Quick-start a scenario</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SCENARIOS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

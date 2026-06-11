'use client';

import type { Restaurant } from '@prisma/client';
import type { SimulationResult } from '@/simulation/types';
import type { ScenarioDelta } from '@/simulation/comparison';
import type { RecommendationType } from '@/agents/agent-types';
import { formatCents } from '@/lib/money';
import { RecommendationCard } from '@/components/recommendation-card';

type Props = {
  restaurant: Restaurant;
  baselineResult: SimulationResult;
  scenarioName?: string;
  scenarioResult?: SimulationResult | null;
  delta?: ScenarioDelta | null;
  recommendation?: RecommendationType | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 text-sm text-gray-500 w-40">{label}</td>
      <td className="py-2 text-sm font-medium text-gray-900">{value}</td>
    </tr>
  );
}

function pct(n: number) { return `${n.toFixed(1)}%`; }

export function ReportView({ restaurant, baselineResult, scenarioName, scenarioResult, delta, recommendation }: Props) {
  const bt = baselineResult.totals;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4 print:px-0">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">Report</h1>
        <button
          onClick={() => window.print()}
          className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Header — visible in print */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gray-900">{restaurant.name} — Simulation Report</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Restaurant profile */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-800">Restaurant Profile</h2>
        <table className="w-full">
          <tbody>
            <Row label="Type" value={restaurant.restaurantType} />
            <Row label="Location" value={[restaurant.city, restaurant.state].filter(Boolean).join(', ') || restaurant.addressText || '—'} />
            <Row label="Seating" value={`${restaurant.seatingCapacity} seats`} />
            <Row label="Monthly rent" value={formatCents(restaurant.monthlyRent)} />
            <Row label="Monthly utilities" value={formatCents(restaurant.monthlyUtilities)} />
            <Row label="Other fixed costs" value={formatCents(restaurant.monthlyOtherFixedCosts)} />
          </tbody>
        </table>
      </section>

      {/* Baseline KPIs */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-800">Baseline — 7-Day Estimate</h2>
        <table className="w-full">
          <tbody>
            <Row label="Revenue" value={formatCents(bt.revenueCents)} />
            <Row label="Food cost" value={`${pct(bt.avgFoodCostPercent)} (${formatCents(bt.foodCostCents)})`} />
            <Row label="Labor cost" value={`${pct(bt.avgLaborCostPercent)} (${formatCents(bt.laborCostCents)})`} />
            <Row label="Fixed costs" value={formatCents(bt.fixedCostCents)} />
            <Row label="Gross profit" value={formatCents(bt.grossProfitCents)} />
            <Row label="Est. net profit" value={formatCents(bt.estimatedNetProfitCents)} />
            <Row label="Avg wait risk" value={`${bt.avgWaitRisk.toFixed(0)}/100`} />
          </tbody>
        </table>
      </section>

      {/* Scenario comparison */}
      {scenarioResult && delta && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">Scenario: {scenarioName}</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-semibold text-gray-500">
                <th className="pb-2 pr-4 w-40">Metric</th>
                <th className="pb-2 pr-4">Baseline</th>
                <th className="pb-2 pr-4">Scenario</th>
                <th className="pb-2">Delta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Revenue', base: bt.revenueCents, scen: scenarioResult.totals.revenueCents, d: delta.revenueDeltaCents },
                { label: 'Net profit', base: bt.estimatedNetProfitCents, scen: scenarioResult.totals.estimatedNetProfitCents, d: delta.netProfitDeltaCents },
                { label: 'Food cost', base: bt.foodCostCents, scen: scenarioResult.totals.foodCostCents, d: delta.foodCostDeltaCents },
                { label: 'Labor cost', base: bt.laborCostCents, scen: scenarioResult.totals.laborCostCents, d: delta.laborCostDeltaCents },
              ].map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="py-2 pr-4 text-sm text-gray-500">{row.label}</td>
                  <td className="py-2 pr-4 text-sm">{formatCents(row.base)}</td>
                  <td className="py-2 pr-4 text-sm">{formatCents(row.scen)}</td>
                  <td className={`py-2 text-sm font-medium ${row.d > 0 ? 'text-green-700' : row.d < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {row.d > 0 ? '+' : ''}{formatCents(row.d)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Recommendation */}
      {recommendation && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">AI Recommendation</h2>
          <RecommendationCard recommendation={recommendation} scenarioName={scenarioName} />
        </section>
      )}

      {/* Assumptions */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-800">Simulation Assumptions</h2>
        <ul className="space-y-1">
          {baselineResult.assumptions.map((a, i) => (
            <li key={i} className="text-xs text-gray-600">• {a}</li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-gray-400 print:block">
        Generated by RestTwin AI · {new Date().toLocaleString()} · Estimates only — not guaranteed.
      </p>
    </div>
  );
}

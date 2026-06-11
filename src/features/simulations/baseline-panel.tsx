'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SimulationRun } from '@prisma/client';
import { formatCents } from '@/lib/money';
import { runBaselineAction } from './actions';
import type { SimulationResult } from '@/simulation/types';

type Props = { runs: SimulationRun[] };

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

function ResultSummary({ result }: { result: SimulationResult }) {
  const t = result.totals;
  const netColor =
    t.estimatedNetProfitCents >= 0 ? 'text-green-700' : 'text-red-700';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: 'Revenue', value: formatCents(t.revenueCents) },
        { label: 'Food cost', value: `${pct(t.avgFoodCostPercent)} (${formatCents(t.foodCostCents)})` },
        { label: 'Labor cost', value: `${pct(t.avgLaborCostPercent)} (${formatCents(t.laborCostCents)})` },
        { label: 'Est. net profit', value: formatCents(t.estimatedNetProfitCents), color: netColor },
      ].map((kpi) => (
        <div key={kpi.label} className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">{kpi.label}</p>
          <p className={`mt-1 text-lg font-bold ${kpi.color ?? 'text-gray-900'}`}>{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

function RunRow({ run }: { run: SimulationRun }) {
  const result = run.resultJson as unknown as SimulationResult;
  const t = result?.totals;
  const netColor = (t?.estimatedNetProfitCents ?? 0) >= 0 ? 'text-green-700' : 'text-red-700';
  return (
    <tr className="border-b last:border-0 text-sm">
      <td className="px-4 py-3 text-gray-500">
        {new Date(run.createdAt).toLocaleString()}
      </td>
      <td className="px-4 py-3">{t ? formatCents(t.revenueCents) : '—'}</td>
      <td className="px-4 py-3">{t ? pct(t.avgFoodCostPercent) : '—'}</td>
      <td className="px-4 py-3">{t ? pct(t.avgLaborCostPercent) : '—'}</td>
      <td className={`px-4 py-3 font-medium ${netColor}`}>
        {t ? formatCents(t.estimatedNetProfitCents) : '—'}
      </td>
    </tr>
  );
}

export function BaselinePanel({ runs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRun() {
    setError(null);
    startTransition(async () => {
      const result = await runBaselineAction(null, new FormData());
      if (result?.success) {
        router.refresh();
      } else {
        setError(result?.message ?? 'Simulation failed.');
      }
    });
  }

  const latestResult =
    runs.length > 0 ? (runs[0].resultJson as unknown as SimulationResult) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleRun}
          disabled={isPending}
          className="rounded bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? 'Running…' : 'Run Baseline Simulation'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {latestResult && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Latest Result — 7-Day Estimate
          </h2>
          <ResultSummary result={latestResult} />

          {latestResult.bottlenecks.length > 0 && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ⚠ {latestResult.bottlenecks.length} capacity bottleneck
                {latestResult.bottlenecks.length > 1 ? 's' : ''} detected
              </p>
              <ul className="space-y-1">
                {latestResult.bottlenecks.slice(0, 5).map((b, i) => (
                  <li key={i} className="text-xs text-yellow-700">
                    {b.message}
                  </li>
                ))}
                {latestResult.bottlenecks.length > 5 && (
                  <li className="text-xs text-yellow-600">
                    …and {latestResult.bottlenecks.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-lg border bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Assumptions
            </p>
            <ul className="space-y-1">
              {latestResult.assumptions.map((a, i) => (
                <li key={i} className="text-xs text-gray-600">
                  • {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {runs.length > 1 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Run History
          </h2>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Food %</th>
                  <th className="px-4 py-3">Labor %</th>
                  <th className="px-4 py-3">Net profit</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <RunRow key={run.id} run={run} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {runs.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No simulations run yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            Complete restaurant setup, menu, and staffing first.
          </p>
        </div>
      )}
    </div>
  );
}

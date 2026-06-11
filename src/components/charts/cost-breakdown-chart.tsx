'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { DayResult, SimulationTotals } from '@/simulation/types';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  byDay: DayResult[];
  totals: SimulationTotals;
};

function tooltipFormatter(value: number) {
  return `$${(value as number).toFixed(0)}`;
}

export function CostBreakdownChart({ byDay, totals }: Props) {
  const dailyFixedCents = Math.round(totals.fixedCostCents / 7);

  const data = Array.from({ length: 7 }, (_, i) => {
    const d = byDay.find((x) => x.dayOfWeek === i);
    if (!d || d.revenueCents === 0) {
      return { day: DAY_SHORT[i], revenue: 0, food: 0, labor: 0, fixed: 0 };
    }
    return {
      day: DAY_SHORT[i],
      revenue: Math.round(d.revenueCents / 100),
      food: Math.round(d.foodCostCents / 100),
      labor: Math.round(d.laborCostCents / 100),
      fixed: Math.round(dailyFixedCents / 100),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} width={52} />
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
        <Bar dataKey="food" name="Food cost" stackId="costs" fill="#f87171" />
        <Bar dataKey="labor" name="Labor cost" stackId="costs" fill="#fb923c" />
        <Bar dataKey="fixed" name="Fixed (daily)" stackId="costs" fill="#facc15" radius={[3, 3, 0, 0]} />
        <Line
          dataKey="revenue"
          name="Revenue"
          type="monotone"
          stroke="#374151"
          strokeWidth={2}
          dot={{ r: 3, fill: '#374151' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

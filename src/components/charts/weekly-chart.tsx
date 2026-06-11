'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayData = { dayOfWeek: number; revenueCents: number };

type Props = {
  baseline: DayData[];
  scenario?: DayData[];
};

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function WeeklyChart({ baseline, scenario }: Props) {
  const data = Array.from({ length: 7 }, (_, i) => {
    const b = baseline.find((d) => d.dayOfWeek === i);
    const s = scenario?.find((d) => d.dayOfWeek === i);
    return {
      day: DAY_SHORT[i],
      baseline: b ? Math.round(b.revenueCents / 100) : 0,
      ...(scenario ? { scenario: s ? Math.round(s.revenueCents / 100) : 0 } : {}),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} width={52} />
        <Tooltip formatter={(v: number) => dollars(v * 100)} />
        {scenario && <Legend />}
        <Bar dataKey="baseline" fill="#374151" name="Baseline" radius={[3, 3, 0, 0]} />
        {scenario && <Bar dataKey="scenario" fill="#6366f1" name="Scenario" radius={[3, 3, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

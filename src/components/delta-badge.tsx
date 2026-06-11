type Props = {
  value: number;
  format?: 'cents' | 'percent' | 'number';
  invert?: boolean; // true = positive delta is bad (e.g. cost %)
};

function fmt(value: number, format: Props['format']) {
  if (format === 'cents') return `$${(Math.abs(value) / 100).toFixed(0)}`;
  if (format === 'percent') return `${Math.abs(value).toFixed(1)}%`;
  return String(Math.round(Math.abs(value)));
}

export function DeltaBadge({ value, format = 'cents', invert = false }: Props) {
  if (Math.abs(value) < 0.01) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const isPositive = value > 0;
  const isGood = invert ? !isPositive : isPositive;
  const arrow = isPositive ? '▲' : '▼';
  const color = isGood ? 'text-green-700' : 'text-red-600';

  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {fmt(value, format)}
    </span>
  );
}

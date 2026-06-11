import { DeltaBadge } from './delta-badge';

type Props = {
  label: string;
  value: string;
  subValue?: string;
  delta?: number;
  deltaFormat?: 'cents' | 'percent' | 'number';
  deltaInvert?: boolean;
  highlight?: 'green' | 'red' | 'neutral';
};

export function KpiCard({ label, value, subValue, delta, deltaFormat, deltaInvert, highlight }: Props) {
  const borderColor =
    highlight === 'green'
      ? 'border-l-green-500'
      : highlight === 'red'
        ? 'border-l-red-500'
        : 'border-l-gray-300';

  return (
    <div className={`rounded-lg border border-l-4 bg-white p-5 ${borderColor}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="mt-0.5 text-sm text-gray-500">{subValue}</p>}
      {delta !== undefined && (
        <div className="mt-2">
          <DeltaBadge value={delta} format={deltaFormat} invert={deltaInvert} />
          <span className="ml-1 text-xs text-gray-400">vs baseline</span>
        </div>
      )}
    </div>
  );
}

import type { MenuAnalysis, MenuItemClassification } from '@/agents/menu-profit-agent';

const CLASS_CONFIG: Record<
  MenuItemClassification['classification'],
  { label: string; bg: string; text: string; dot: string }
> = {
  STAR:      { label: 'Star',      bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  WORKHORSE: { label: 'Workhorse', bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  GEM:       { label: 'Gem',       bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  WEAK:      { label: 'Weak',      bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400' },
};

type Props = { analysis: MenuAnalysis };

export function MenuPerformancePanel({ analysis }: Props) {
  const summary = [
    { key: 'STAR'      as const, label: 'Stars',      count: analysis.stars },
    { key: 'WORKHORSE' as const, label: 'Workhorses', count: analysis.workhorses },
    { key: 'GEM'       as const, label: 'Gems',       count: analysis.classifications.filter(c => c.classification === 'GEM').length },
    { key: 'WEAK'      as const, label: 'Weak',       count: analysis.weak },
  ];

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {summary.map((s) => {
          const cfg = CLASS_CONFIG[s.key];
          return (
            <div key={s.key} className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${cfg.bg} ${cfg.text}`}>
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              {s.count} {s.label}
            </div>
          );
        })}
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
          {analysis.suggestions.map((s, i) => (
            <p key={i} className="text-sm text-amber-800">• {s}</p>
          ))}
        </div>
      )}

      {/* Per-item classifications */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Margin %</th>
              <th className="px-4 py-3">Est. orders/wk</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {analysis.classifications
              .sort((a, b) => {
                const order = { STAR: 0, WORKHORSE: 1, GEM: 2, WEAK: 3 };
                return order[a.classification] - order[b.classification];
              })
              .map((c) => {
                const cfg = CLASS_CONFIG[c.classification];
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.marginPct.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-700">{Math.round(c.orders)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.note}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { RecommendationType } from '@/agents/agent-types';
import { formatCents } from '@/lib/money';

const DECISION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  RECOMMENDED: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Recommended' },
  NOT_RECOMMENDED: { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Not Recommended' },
  TEST_FIRST: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⚑ Test First' },
  NEED_MORE_DATA: { bg: 'bg-gray-100', text: 'text-gray-700', label: '? Need More Data' },
};

const CONFIDENCE_STYLES: Record<string, string> = {
  HIGH: 'bg-green-50 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LOW: 'bg-gray-50 text-gray-600 border-gray-200',
};

type Props = {
  recommendation: RecommendationType;
  scenarioName?: string;
};

export function RecommendationCard({ recommendation: r, scenarioName }: Props) {
  const decStyle = DECISION_STYLES[r.decision] ?? DECISION_STYLES.NEED_MORE_DATA;
  const confStyle = CONFIDENCE_STYLES[r.confidence] ?? CONFIDENCE_STYLES.LOW;

  return (
    <div className="rounded-lg border bg-white p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${decStyle.bg} ${decStyle.text}`}>
          {decStyle.label}
        </span>
        <span className={`rounded border px-2 py-0.5 text-xs font-medium ${confStyle}`}>
          {r.confidence} confidence
        </span>
        {scenarioName && <span className="text-sm text-gray-500">{scenarioName}</span>}
      </div>

      <p className="text-sm text-gray-800">{r.summary}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { label: 'Revenue impact', value: r.expectedImpact.revenueDeltaCents, invert: false },
          { label: 'Profit impact', value: r.expectedImpact.profitDeltaCents, invert: false },
          { label: 'Labor cost delta', value: r.expectedImpact.laborCostDeltaCents, invert: true },
          { label: 'Food cost delta', value: r.expectedImpact.foodCostDeltaCents, invert: true },
        ].map((kpi) => {
          const isPos = kpi.value > 0;
          const isGood = kpi.invert ? !isPos : isPos;
          const color = kpi.value === 0 ? 'text-gray-500' : isGood ? 'text-green-700' : 'text-red-600';
          return (
            <div key={kpi.label} className="rounded bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className={`text-sm font-semibold ${color}`}>
                {kpi.value === 0 ? '—' : `${kpi.value > 0 ? '+' : ''}${formatCents(kpi.value)}`}
              </p>
            </div>
          );
        })}
      </div>

      {r.evidence.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Evidence</p>
          <ul className="space-y-0.5">
            {r.evidence.map((e, i) => (
              <li key={i} className="text-xs text-gray-700">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {r.risks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Risks</p>
          <ul className="space-y-0.5">
            {r.risks.map((risk, i) => (
              <li key={i} className="text-xs text-orange-700">⚠ {risk}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Next action</p>
        <p className="text-sm text-blue-800">{r.nextAction}</p>
      </div>
    </div>
  );
}

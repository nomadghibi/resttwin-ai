import type { DayResult, HourResult, Bottleneck } from '@/simulation/types';

export interface StaffingAnalysis {
  bottleneckCount: number;
  peakRiskDay: number | null;
  avgLaborCostPercent: number;
  understaffedHours: number;
  overstaffedDays: number;
  summary: string;
  suggestions: string[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function analyzeStaffing(
  byDay: DayResult[],
  byHour: HourResult[],
  bottlenecks: Bottleneck[],
): StaffingAnalysis {
  const bottleneckCount = bottlenecks.length;

  const peakRiskDay =
    byDay.reduce<{ day: number; risk: number } | null>((max, d) => {
      if (!max || d.waitRisk > max.risk) return { day: d.dayOfWeek, risk: d.waitRisk };
      return max;
    }, null)?.day ?? null;

  const openHours = byHour.filter((h) => h.orders > 0);
  const avgLaborPct =
    openHours.reduce((sum, h) => {
      const rev = h.revenueCents;
      return sum + (rev > 0 ? (h.laborCostCents / rev) * 100 : 0);
    }, 0) / Math.max(1, openHours.length);

  const understaffedHours = bottlenecks.filter((b) => b.utilization > 1.0).length;

  const overstaffedDays = byDay.filter(
    (d) => d.orders > 0 && d.laborCostCents > d.revenueCents * 0.4,
  ).length;

  const suggestions: string[] = [];
  if (bottleneckCount > 0) {
    const kitBottlenecks = bottlenecks.filter((b) => b.type === 'KITCHEN');
    const svcBottlenecks = bottlenecks.filter((b) => b.type === 'SERVICE');
    if (kitBottlenecks.length > 0)
      suggestions.push(`Kitchen is at capacity during ${kitBottlenecks.length} hour(s) — consider adding a cook.`);
    if (svcBottlenecks.length > 0)
      suggestions.push(`Service is strained during ${svcBottlenecks.length} hour(s) — add a server for peak times.`);
  }
  if (peakRiskDay !== null && bottleneckCount > 0) {
    suggestions.push(`${DAY_NAMES[peakRiskDay]} has the highest wait risk — prioritise staffing that day.`);
  }
  if (overstaffedDays > 0) {
    suggestions.push(`${overstaffedDays} day(s) have labor cost above 40% of revenue — review shift quantities.`);
  }

  const summary =
    bottleneckCount === 0
      ? 'No capacity bottlenecks detected this week.'
      : `${bottleneckCount} bottleneck hour(s) detected — peak risk on ${peakRiskDay !== null ? DAY_NAMES[peakRiskDay] : 'unknown'}.`;

  return {
    bottleneckCount,
    peakRiskDay,
    avgLaborCostPercent: avgLaborPct,
    understaffedHours,
    overstaffedDays,
    summary,
    suggestions,
  };
}

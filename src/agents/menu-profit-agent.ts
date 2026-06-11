import type { MenuItemSimulationResult } from '@/simulation/types';
import { grossMarginPct } from '@/lib/money';

export interface MenuItemClassification {
  id: string;
  name: string;
  marginPct: number;
  orders: number;
  classification: 'STAR' | 'WORKHORSE' | 'GEM' | 'WEAK';
  note: string;
}

export interface MenuAnalysis {
  classifications: MenuItemClassification[];
  stars: number;
  workhorses: number;
  weak: number;
  summary: string;
  suggestions: string[];
}

export function analyzeMenu(
  itemResults: MenuItemSimulationResult[],
  menuItems: { id: string; priceCents: number; foodCostCents: number }[],
): MenuAnalysis {
  const priceMap = new Map(menuItems.map((m) => [m.id, m]));
  const avgOrders =
    itemResults.reduce((s, i) => s + i.orders, 0) / Math.max(1, itemResults.length);

  const classifications: MenuItemClassification[] = itemResults.map((item) => {
    const raw = priceMap.get(item.id);
    const margin = raw ? grossMarginPct(raw.priceCents, raw.foodCostCents) : 0;
    const highMargin = margin >= 65;
    const highDemand = item.orders >= avgOrders;

    let classification: MenuItemClassification['classification'];
    let note: string;

    if (highMargin && highDemand) {
      classification = 'STAR';
      note = 'High margin, high demand — protect and promote.';
    } else if (!highMargin && highDemand) {
      classification = 'WORKHORSE';
      note = 'High demand but low margin — consider a small price increase.';
    } else if (highMargin && !highDemand) {
      classification = 'GEM';
      note = 'High margin, low demand — promote or feature more prominently.';
    } else {
      classification = 'WEAK';
      note = 'Low margin and low demand — review pricing or consider removing.';
    }

    return { id: item.id, name: item.name, marginPct: margin, orders: item.orders, classification, note };
  });

  const stars = classifications.filter((c) => c.classification === 'STAR').length;
  const workhorses = classifications.filter((c) => c.classification === 'WORKHORSE').length;
  const weak = classifications.filter((c) => c.classification === 'WEAK').length;

  const suggestions: string[] = [];
  if (workhorses > 0) suggestions.push(`${workhorses} high-demand item(s) could support a small price increase.`);
  if (weak > 0) suggestions.push(`${weak} weak item(s) are dragging average margin — review or replace.`);
  const gems = classifications.filter((c) => c.classification === 'GEM');
  if (gems.length > 0) suggestions.push(`"${gems[0].name}" is a hidden gem — try promoting it.`);

  const summary = `${stars} star item(s), ${workhorses} workhorse(s), ${weak} weak item(s) identified.`;

  return { classifications, stars, workhorses, weak, summary, suggestions };
}

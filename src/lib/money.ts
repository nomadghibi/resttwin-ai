export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function grossMarginPct(priceCents: number, foodCostCents: number): number {
  if (priceCents === 0) return 0;
  return ((priceCents - foodCostCents) / priceCents) * 100;
}

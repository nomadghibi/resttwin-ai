import type { SimulationInput } from './types';

function priceElasticity(percent: number): number {
  if (percent <= 0) return 1.0;
  if (percent <= 5) return 0.98;
  if (percent <= 10) return 0.94;
  if (percent <= 15) return 0.88;
  return 0.80;
}

export function applyPriceChange(
  input: SimulationInput,
  params: { percent: number; itemIds: string[] },
): SimulationInput {
  const priceMult = 1 + params.percent / 100;
  const demandMult = priceElasticity(params.percent);
  const menuItems = input.menuItems.map((m) =>
    params.itemIds.length === 0 || params.itemIds.includes(m.id)
      ? { ...m, priceCents: Math.round(m.priceCents * priceMult) }
      : m,
  );
  return { ...input, menuItems, demandMultiplier: (input.demandMultiplier ?? 1) * demandMult };
}

export function applyStaffingChange(
  input: SimulationInput,
  params: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roleName: string;
    quantityDelta: number;
  },
): SimulationInput {
  const shifts = [...input.shifts];
  const idx = shifts.findIndex(
    (s) => s.dayOfWeek === params.dayOfWeek && s.roleName === params.roleName,
  );

  if (idx >= 0) {
    const newQty = shifts[idx].quantity + params.quantityDelta;
    if (newQty <= 0) {
      shifts.splice(idx, 1);
    } else {
      shifts[idx] = { ...shifts[idx], quantity: newQty };
    }
  } else if (params.quantityDelta > 0) {
    const roleRef = input.shifts.find((s) => s.roleName === params.roleName);
    if (roleRef) {
      shifts.push({
        ...roleRef,
        dayOfWeek: params.dayOfWeek,
        startTime: params.startTime,
        endTime: params.endTime,
        quantity: params.quantityDelta,
      });
    }
  }

  return { ...input, shifts };
}

export function applyHoursChange(
  input: SimulationInput,
  params: { dayOfWeek: number; isOpen: boolean; openTime?: string; closeTime?: string },
): SimulationInput {
  const hours = input.hours.map((h) =>
    h.dayOfWeek === params.dayOfWeek
      ? {
          ...h,
          isOpen: params.isOpen,
          openTime: params.openTime ?? h.openTime,
          closeTime: params.closeTime ?? h.closeTime,
        }
      : h,
  );
  return { ...input, hours };
}

export function applyDeliveryToggle(
  input: SimulationInput,
  params: { enabled: boolean; deliveryFeePercent?: number },
): SimulationInput {
  return {
    ...input,
    deliveryEnabled: params.enabled,
    deliveryFeePercent: params.deliveryFeePercent ?? 18,
  };
}

export function applyPromotion(
  input: SimulationInput,
  params: { demandMultiplierPercent: number; discountPercent?: number; itemIds?: string[] },
): SimulationInput {
  const demandBoost = 1 + params.demandMultiplierPercent / 100;
  let menuItems = input.menuItems;

  if (params.discountPercent && params.discountPercent > 0) {
    const discMult = 1 - params.discountPercent / 100;
    menuItems = input.menuItems.map((m) =>
      !params.itemIds || params.itemIds.length === 0 || params.itemIds.includes(m.id)
        ? { ...m, priceCents: Math.round(m.priceCents * discMult) }
        : m,
    );
  }

  return { ...input, menuItems, demandMultiplier: (input.demandMultiplier ?? 1) * demandBoost };
}

export function applyScenarioTransform(
  input: SimulationInput,
  type: string,
  parameters: unknown,
): SimulationInput {
  const p = parameters as Record<string, unknown>;
  switch (type) {
    case 'PRICE_CHANGE_PERCENT':
      return applyPriceChange(input, p as Parameters<typeof applyPriceChange>[1]);
    case 'STAFFING_CHANGE':
      return applyStaffingChange(input, p as Parameters<typeof applyStaffingChange>[1]);
    case 'HOURS_CHANGE':
      return applyHoursChange(input, p as Parameters<typeof applyHoursChange>[1]);
    case 'DELIVERY_TOGGLE':
      return applyDeliveryToggle(input, p as Parameters<typeof applyDeliveryToggle>[1]);
    case 'PROMOTION':
      return applyPromotion(input, p as Parameters<typeof applyPromotion>[1]);
    default:
      return input;
  }
}

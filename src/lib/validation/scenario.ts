import { z } from 'zod';

export const ScenarioCreateSchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  type: z.enum([
    'PRICE_CHANGE_PERCENT',
    'STAFFING_CHANGE',
    'HOURS_CHANGE',
    'DELIVERY_TOGGLE',
    'PROMOTION',
  ]),
  parametersJson: z.string().min(2, 'Parameters required'),
});

export type ScenarioCreateInput = z.infer<typeof ScenarioCreateSchema>;

export const SCENARIO_TYPE_LABELS: Record<string, string> = {
  PRICE_CHANGE_PERCENT: 'Price Change',
  STAFFING_CHANGE: 'Staffing Change',
  HOURS_CHANGE: 'Hours Change',
  DELIVERY_TOGGLE: 'Add / Remove Delivery',
  PROMOTION: 'Run Promotion',
};

export const SCENARIO_TYPE_DESCRIPTIONS: Record<string, string> = {
  PRICE_CHANGE_PERCENT: 'Raise or lower menu prices and model demand elasticity.',
  STAFFING_CHANGE: 'Add or remove staff for a specific day and time.',
  HOURS_CHANGE: 'Open or close a day, or change operating times.',
  DELIVERY_TOGGLE: 'Simulate adding delivery — more orders, lower margin.',
  PROMOTION: 'Boost demand with a promotion; optionally apply a discount.',
};

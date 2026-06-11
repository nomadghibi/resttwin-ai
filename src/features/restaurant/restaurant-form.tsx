'use client';

import { useActionState } from 'react';
import { saveProfileAction } from './actions';
import type { Restaurant } from '@prisma/client';

const RESTAURANT_TYPES = [
  'Casual Dining',
  'Fast Casual',
  'Fast Food',
  'Fine Dining',
  'Café / Coffee Shop',
  'Bar & Grill',
  'Food Truck',
  'Other',
];

const BUSINESS_MODELS = [
  { value: 'DINE_IN', label: 'Dine-in' },
  { value: 'TAKEOUT', label: 'Takeout' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'HYBRID', label: 'Hybrid' },
];

type Props = { restaurant: Restaurant | null };

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const selectCls = inputCls;

export function RestaurantForm({ restaurant: r }: Props) {
  const [state, formAction, isPending] = useActionState(saveProfileAction, null);
  const err = state?.errors ?? {};

  const d = {
    name: r?.name ?? '',
    restaurantType: r?.restaurantType ?? '',
    addressText: r?.addressText ?? '',
    city: r?.city ?? '',
    state: r?.state ?? '',
    postalCode: r?.postalCode ?? '',
    country: r?.country ?? 'US',
    businessModel: r?.businessModel ?? 'DINE_IN',
    seatingCapacity: r?.seatingCapacity ?? 50,
    avgTableTurnMinutes: r?.avgTableTurnMinutes ?? 60,
    monthlyRentDollars: r ? (r.monthlyRent / 100).toFixed(2) : '0',
    monthlyUtilitiesDollars: r ? (r.monthlyUtilities / 100).toFixed(2) : '0',
    monthlyOtherDollars: r ? (r.monthlyOtherFixedCosts / 100).toFixed(2) : '0',
    targetFoodCostPct: r?.targetFoodCostPercent ?? 30,
    targetLaborCostPct: r?.targetLaborCostPercent ?? 32,
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {state.message}
        </div>
      )}
      {state?.message && !state.success && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      {/* Basics */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Restaurant Basics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Restaurant name" error={(err as Record<string, string[]>).name?.[0]}>
            <input name="name" defaultValue={d.name} className={inputCls} />
          </Field>
          <Field label="Type" error={(err as Record<string, string[]>).restaurantType?.[0]}>
            <select name="restaurantType" defaultValue={d.restaurantType} className={selectCls}>
              <option value="">Select type…</option>
              {RESTAURANT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Business model" error={(err as Record<string, string[]>).businessModel?.[0]}>
            <select name="businessModel" defaultValue={d.businessModel} className={selectCls}>
              {BUSINESS_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Location */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Location
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Address" error={(err as Record<string, string[]>).addressText?.[0]}>
              <input name="addressText" defaultValue={d.addressText} className={inputCls} />
            </Field>
          </div>
          <Field label="City" error={(err as Record<string, string[]>).city?.[0]}>
            <input name="city" defaultValue={d.city} className={inputCls} />
          </Field>
          <Field label="State" error={(err as Record<string, string[]>).state?.[0]}>
            <input name="state" defaultValue={d.state} className={inputCls} />
          </Field>
          <Field label="Postal code" error={(err as Record<string, string[]>).postalCode?.[0]}>
            <input name="postalCode" defaultValue={d.postalCode} className={inputCls} />
          </Field>
          <Field label="Country" error={(err as Record<string, string[]>).country?.[0]}>
            <input name="country" defaultValue={d.country} maxLength={2} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Capacity */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Capacity &amp; Operations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seating capacity" error={(err as Record<string, string[]>).seatingCapacity?.[0]}>
            <input
              name="seatingCapacity"
              type="number"
              min={1}
              defaultValue={d.seatingCapacity}
              className={inputCls}
            />
          </Field>
          <Field
            label="Avg table turn (minutes)"
            error={(err as Record<string, string[]>).avgTableTurnMinutes?.[0]}
          >
            <input
              name="avgTableTurnMinutes"
              type="number"
              min={5}
              defaultValue={d.avgTableTurnMinutes}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Fixed costs */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Monthly Fixed Costs (USD)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rent" error={(err as Record<string, string[]>).monthlyRentDollars?.[0]}>
            <input
              name="monthlyRentDollars"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d.monthlyRentDollars}
              className={inputCls}
            />
          </Field>
          <Field label="Utilities" error={(err as Record<string, string[]>).monthlyUtilitiesDollars?.[0]}>
            <input
              name="monthlyUtilitiesDollars"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d.monthlyUtilitiesDollars}
              className={inputCls}
            />
          </Field>
          <Field label="Other" error={(err as Record<string, string[]>).monthlyOtherDollars?.[0]}>
            <input
              name="monthlyOtherDollars"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d.monthlyOtherDollars}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Targets */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Cost Targets (%)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Target food cost %" error={(err as Record<string, string[]>).targetFoodCostPct?.[0]}>
            <input
              name="targetFoodCostPct"
              type="number"
              min={1}
              max={100}
              step="0.1"
              defaultValue={d.targetFoodCostPct}
              className={inputCls}
            />
          </Field>
          <Field
            label="Target labor cost %"
            error={(err as Record<string, string[]>).targetLaborCostPct?.[0]}
          >
            <input
              name="targetLaborCostPct"
              type="number"
              min={1}
              max={100}
              step="0.1"
              defaultValue={d.targetLaborCostPct}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createScenarioAction } from './actions';
import { SCENARIO_TYPE_LABELS, SCENARIO_TYPE_DESCRIPTIONS } from '@/lib/validation/scenario';
import type { StaffRole } from '@prisma/client';

const TYPES = [
  'PRICE_CHANGE_PERCENT',
  'STAFFING_CHANGE',
  'HOURS_CHANGE',
  'DELIVERY_TOGGLE',
  'PROMOTION',
] as const;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';

type ScenarioType = (typeof TYPES)[number];
type Props = { roles: StaffRole[] };

function buildDefaultName(type: ScenarioType, params: Record<string, string>): string {
  switch (type) {
    case 'PRICE_CHANGE_PERCENT':
      return `${params.percent ?? ''}% price ${Number(params.percent) >= 0 ? 'increase' : 'decrease'}`;
    case 'STAFFING_CHANGE':
      return `${params.quantityDelta ?? ''} ${params.roleName ?? 'staff'} on ${DAY_NAMES[Number(params.dayOfWeek ?? 0)]}`;
    case 'HOURS_CHANGE':
      return `${params.isOpen === 'false' ? 'Close' : 'Open'} ${DAY_NAMES[Number(params.dayOfWeek ?? 0)]}`;
    case 'DELIVERY_TOGGLE':
      return params.enabled === 'false' ? 'Remove delivery' : 'Add delivery';
    case 'PROMOTION':
      return `+${params.demandMultiplierPercent ?? ''}% demand promotion`;
    default:
      return '';
  }
}

function buildParams(type: ScenarioType, fields: Record<string, string>): object {
  switch (type) {
    case 'PRICE_CHANGE_PERCENT':
      return { percent: Number(fields.percent ?? 0), itemIds: [] };
    case 'STAFFING_CHANGE':
      return {
        dayOfWeek: Number(fields.dayOfWeek ?? 0),
        startTime: fields.startTime ?? '16:00',
        endTime: fields.endTime ?? '22:00',
        roleName: fields.roleName ?? '',
        quantityDelta: Number(fields.quantityDelta ?? 1),
      };
    case 'HOURS_CHANGE':
      return {
        dayOfWeek: Number(fields.dayOfWeek ?? 0),
        isOpen: fields.isOpen !== 'false',
        openTime: fields.openTime,
        closeTime: fields.closeTime,
      };
    case 'DELIVERY_TOGGLE':
      return {
        enabled: fields.enabled !== 'false',
        deliveryFeePercent: Number(fields.deliveryFeePercent ?? 18),
      };
    case 'PROMOTION':
      return {
        demandMultiplierPercent: Number(fields.demandMultiplierPercent ?? 20),
        discountPercent: Number(fields.discountPercent ?? 0),
        itemIds: [],
      };
  }
}

export function ScenarioBuilder({ roles }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<ScenarioType | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedType) return;
    const params = buildParams(selectedType, fields);
    const name = fields.name || buildDefaultName(selectedType, fields);

    const fd = new FormData();
    fd.append('name', name);
    fd.append('type', selectedType);
    fd.append('parametersJson', JSON.stringify(params));

    setError(null);
    startTransition(async () => {
      const result = await createScenarioAction(null, fd);
      if (result?.message) setError(result.message);
      // redirect happens server-side on success
    });
  }

  if (!selectedType) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setSelectedType(t); setFields({}); }}
            className="rounded-lg border bg-white p-5 text-left hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <p className="text-sm font-semibold text-gray-900">{SCENARIO_TYPE_LABELS[t]}</p>
            <p className="mt-1 text-xs text-gray-500">{SCENARIO_TYPE_DESCRIPTIONS[t]}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{SCENARIO_TYPE_LABELS[selectedType]}</h3>
        <button onClick={() => setSelectedType(null)} className="text-sm text-gray-500 hover:underline">
          ← Back
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Scenario name</label>
          <input
            value={fields.name ?? ''}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={buildDefaultName(selectedType, fields) || 'Enter scenario name'}
            className={inputCls}
          />
        </div>

        {/* Type-specific params */}
        {selectedType === 'PRICE_CHANGE_PERCENT' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Price change % (positive = increase, negative = decrease)
            </label>
            <input
              type="number"
              step="1"
              min="-50"
              max="100"
              value={fields.percent ?? '8'}
              onChange={(e) => setField('percent', e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-400">Applies to all menu items. Demand elasticity applied automatically.</p>
          </div>
        )}

        {selectedType === 'STAFFING_CHANGE' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Day</label>
              <select value={fields.dayOfWeek ?? '5'} onChange={(e) => setField('dayOfWeek', e.target.value)} className={inputCls}>
                {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select value={fields.roleName ?? ''} onChange={(e) => setField('roleName', e.target.value)} className={inputCls}>
                <option value="">Select role…</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start time</label>
              <input type="time" value={fields.startTime ?? '16:00'} onChange={(e) => setField('startTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End time</label>
              <input type="time" value={fields.endTime ?? '22:00'} onChange={(e) => setField('endTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity change (+/-)</label>
              <input type="number" value={fields.quantityDelta ?? '1'} onChange={(e) => setField('quantityDelta', e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        {selectedType === 'HOURS_CHANGE' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Day</label>
              <select value={fields.dayOfWeek ?? '1'} onChange={(e) => setField('dayOfWeek', e.target.value)} className={inputCls}>
                {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Open that day?</label>
              <select value={fields.isOpen ?? 'true'} onChange={(e) => setField('isOpen', e.target.value)} className={inputCls}>
                <option value="true">Open</option>
                <option value="false">Closed</option>
              </select>
            </div>
            {fields.isOpen !== 'false' && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Open time</label>
                  <input type="time" value={fields.openTime ?? '11:00'} onChange={(e) => setField('openTime', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Close time</label>
                  <input type="time" value={fields.closeTime ?? '22:00'} onChange={(e) => setField('closeTime', e.target.value)} className={inputCls} />
                </div>
              </>
            )}
          </div>
        )}

        {selectedType === 'DELIVERY_TOGGLE' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Enable delivery?</label>
              <select value={fields.enabled ?? 'true'} onChange={(e) => setField('enabled', e.target.value)} className={inputCls}>
                <option value="true">Enable delivery</option>
                <option value="false">Disable delivery</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Platform fee %</label>
              <input type="number" min="0" max="40" step="1" value={fields.deliveryFeePercent ?? '18'} onChange={(e) => setField('deliveryFeePercent', e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        {selectedType === 'PROMOTION' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Demand boost %</label>
              <input type="number" min="0" max="200" step="5" value={fields.demandMultiplierPercent ?? '20'} onChange={(e) => setField('demandMultiplierPercent', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Discount % (0 = no discount)</label>
              <input type="number" min="0" max="100" step="5" value={fields.discountPercent ?? '0'} onChange={(e) => setField('discountPercent', e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create Scenario'}
        </button>
      </form>
    </div>
  );
}

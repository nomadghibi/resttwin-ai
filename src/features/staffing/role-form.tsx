'use client';

import type { StaffRole } from '@prisma/client';
import { centsToDollars } from '@/lib/money';

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';

const CAPACITY_OPTIONS = [
  { value: 'KITCHEN', label: 'Kitchen' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'DELIVERY', label: 'Delivery' },
];

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

type Errors = Partial<Record<string, string[]>>;

type Props = {
  role?: StaffRole | null;
  isPending: boolean;
  errors?: Errors;
  message?: string;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
};

export function RoleForm({ role, isPending, errors = {}, message, onSubmit, onCancel }: Props) {
  const d = {
    name: role?.name ?? '',
    hourlyWageDollars: role ? centsToDollars(role.hourlyWageCents).toFixed(2) : '',
    capacityImpact: role?.capacityImpact ?? 'SERVICE',
    defaultProductivity: role?.defaultProductivity ?? 1.0,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {role ? 'Edit role' : 'Add role'}
      </h3>

      {message && !Object.keys(errors).length && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        {role && <input type="hidden" name="id" value={role.id} />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Field label="Role name" error={errors.name?.[0]}>
              <input name="name" defaultValue={d.name} required className={inputCls} />
            </Field>
          </div>

          <Field label="Wage / hr ($)" error={errors.hourlyWageDollars?.[0]}>
            <input
              name="hourlyWageDollars"
              type="number"
              min="0"
              step="0.01"
              defaultValue={d.hourlyWageDollars}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Capacity impact" error={errors.capacityImpact?.[0]}>
            <select name="capacityImpact" defaultValue={d.capacityImpact} className={inputCls}>
              {CAPACITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Productivity (×)" error={errors.defaultProductivity?.[0]}>
            <input
              name="defaultProductivity"
              type="number"
              min="0.1"
              max="5"
              step="0.1"
              defaultValue={d.defaultProductivity}
              required
              className={inputCls}
            />
          </Field>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

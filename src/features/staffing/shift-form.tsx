'use client';

import type { StaffRole, StaffShift } from '@prisma/client';

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Errors = Partial<Record<string, string[]>>;

type Props = {
  shift?: StaffShift | null;
  roles: StaffRole[];
  defaultDay?: number;
  isPending: boolean;
  errors?: Errors;
  message?: string;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
};

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

export function ShiftForm({
  shift,
  roles,
  defaultDay = 0,
  isPending,
  errors = {},
  message,
  onSubmit,
  onCancel,
}: Props) {
  const d = {
    staffRoleId: shift?.staffRoleId ?? roles[0]?.id ?? '',
    dayOfWeek: shift?.dayOfWeek ?? defaultDay,
    startTime: shift?.startTime ?? '11:00',
    endTime: shift?.endTime ?? '22:00',
    quantity: shift?.quantity ?? 1,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {shift ? 'Edit shift' : 'Add shift'}
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
        {shift && <input type="hidden" name="id" value={shift.id} />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Day" error={errors.dayOfWeek?.[0]}>
            <select name="dayOfWeek" defaultValue={d.dayOfWeek} className={inputCls}>
              {DAY_NAMES.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-1 lg:col-span-2">
            <Field label="Role" error={errors.staffRoleId?.[0]}>
              <select name="staffRoleId" defaultValue={d.staffRoleId} className={inputCls}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Start" error={errors.startTime?.[0]}>
            <input
              name="startTime"
              type="time"
              defaultValue={d.startTime}
              required
              className={inputCls}
            />
          </Field>

          <Field label="End" error={errors.endTime?.[0]}>
            <input
              name="endTime"
              type="time"
              defaultValue={d.endTime}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Quantity" error={errors.quantity?.[0]}>
            <input
              name="quantity"
              type="number"
              min="1"
              max="20"
              defaultValue={d.quantity}
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

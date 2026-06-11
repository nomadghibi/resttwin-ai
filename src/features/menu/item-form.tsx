'use client';

import type { MenuItem } from '@prisma/client';
import { centsToDollars } from '@/lib/money';

type Errors = Partial<Record<string, string[]>>;

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';

const CATEGORY_SUGGESTIONS = ['Starters', 'Mains', 'Sides', 'Desserts', 'Drinks', 'Specials'];

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

type Props = {
  item?: MenuItem | null;
  isPending: boolean;
  errors?: Errors;
  message?: string;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
};

export function ItemForm({ item, isPending, errors = {}, message, onSubmit, onCancel }: Props) {
  const d = {
    name: item?.name ?? '',
    category: item?.category ?? '',
    priceDollars: item ? centsToDollars(item.priceCents).toFixed(2) : '',
    foodCostDollars: item ? centsToDollars(item.foodCostCents).toFixed(2) : '',
    prepMinutes: item?.prepMinutes ?? 10,
    popularityWeight: item?.popularityWeight ?? 1,
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {item ? 'Edit item' : 'Add item'}
      </h3>

      {message && !Object.keys(errors).length && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {item && <input type="hidden" name="id" value={item.id} />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <Field label="Name" error={errors.name?.[0]}>
              <input name="name" defaultValue={d.name} required className={inputCls} />
            </Field>
          </div>

          <Field label="Category" error={errors.category?.[0]}>
            <input
              name="category"
              defaultValue={d.category}
              list="category-suggestions"
              required
              className={inputCls}
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Price ($)" error={errors.priceDollars?.[0]}>
            <input
              name="priceDollars"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={d.priceDollars}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Food cost ($)" error={errors.foodCostDollars?.[0]}>
            <input
              name="foodCostDollars"
              type="number"
              min="0"
              step="0.01"
              defaultValue={d.foodCostDollars}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Prep (min)" error={errors.prepMinutes?.[0]}>
            <input
              name="prepMinutes"
              type="number"
              min="1"
              max="480"
              defaultValue={d.prepMinutes}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Popularity (0.1–10)" error={errors.popularityWeight?.[0]}>
            <input
              name="popularityWeight"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              defaultValue={d.popularityWeight}
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

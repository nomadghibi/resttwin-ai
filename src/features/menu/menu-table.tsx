'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@prisma/client';
import { formatCents, grossMarginPct } from '@/lib/money';
import { saveMenuItemAction, toggleMenuItemAction } from './actions';
import { ItemForm } from './item-form';
import type { FormActionState } from '@/features/restaurant/actions';

type Props = { items: MenuItem[] };

function MarginBadge({ priceCents, foodCostCents }: { priceCents: number; foodCostCents: number }) {
  const pct = grossMarginPct(priceCents, foodCostCents);
  const color =
    pct >= 70
      ? 'bg-green-100 text-green-800'
      : pct >= 50
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

export function MenuTable({ items }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'add' | 'edit'>('idle');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formErrors, setFormErrors] = useState<FormActionState>(null);

  function openAdd() {
    setEditingItem(null);
    setFormErrors(null);
    setMode('add');
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setFormErrors(null);
    setMode('edit');
  }

  function closeForm() {
    setMode('idle');
    setEditingItem(null);
    setFormErrors(null);
  }

  function handleSave(fd: FormData) {
    startTransition(async () => {
      const result = await saveMenuItemAction(null, fd);
      if (result?.success) {
        router.refresh();
        closeForm();
      } else {
        setFormErrors(result);
      }
    });
  }

  function handleToggle(item: MenuItem) {
    const fd = new FormData();
    fd.append('id', item.id);
    startTransition(async () => {
      await toggleMenuItemAction(null, fd);
      router.refresh();
    });
  }

  const showForm = mode === 'add' || mode === 'edit';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} items</p>
        {!showForm && (
          <button
            onClick={openAdd}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Add item
          </button>
        )}
      </div>

      {showForm && (
        <ItemForm
          item={editingItem}
          isPending={isPending}
          errors={formErrors?.errors as Record<string, string[]> | undefined}
          message={formErrors?.message}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}

      {items.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No menu items yet.</p>
          <p className="mt-1 text-xs text-gray-400">Add at least 5 items for a useful simulation.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Food cost</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Prep</th>
                <th className="px-4 py-3">Popularity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b last:border-0 ${!item.isActive ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3">{formatCents(item.priceCents)}</td>
                  <td className="px-4 py-3">{formatCents(item.foodCostCents)}</td>
                  <td className="px-4 py-3">
                    <MarginBadge
                      priceCents={item.priceCents}
                      foodCostCents={item.foodCostCents}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.prepMinutes}m</td>
                  <td className="px-4 py-3 text-gray-600">{item.popularityWeight.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        disabled={isPending}
                        className="text-xs text-blue-600 hover:underline disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={isPending}
                        className="text-xs text-gray-500 hover:underline disabled:opacity-40"
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { StaffRole } from '@prisma/client';
import { formatCents } from '@/lib/money';
import { saveRoleAction, deleteRoleAction } from './actions';
import { RoleForm } from './role-form';
import type { FormActionState } from '@/features/restaurant/actions';

const CAPACITY_LABELS: Record<string, string> = {
  KITCHEN: 'Kitchen',
  SERVICE: 'Service',
  CASHIER: 'Cashier',
  DELIVERY: 'Delivery',
};

type Props = { roles: StaffRole[] };

export function RolesTable({ roles }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'add' | 'edit'>('idle');
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [formState, setFormState] = useState<FormActionState>(null);

  function openAdd() {
    setEditingRole(null);
    setFormState(null);
    setMode('add');
  }

  function openEdit(role: StaffRole) {
    setEditingRole(role);
    setFormState(null);
    setMode('edit');
  }

  function close() {
    setMode('idle');
    setEditingRole(null);
    setFormState(null);
  }

  function handleSave(fd: FormData) {
    startTransition(async () => {
      const result = await saveRoleAction(null, fd);
      if (result?.success) {
        router.refresh();
        close();
      } else {
        setFormState(result);
      }
    });
  }

  function handleDelete(role: StaffRole) {
    if (!confirm(`Delete "${role.name}"? All shifts for this role will also be removed.`)) return;
    const fd = new FormData();
    fd.append('id', role.id);
    startTransition(async () => {
      await deleteRoleAction(null, fd);
      router.refresh();
    });
  }

  const showForm = mode !== 'idle';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{roles.length} roles</p>
        {!showForm && (
          <button
            onClick={openAdd}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Add role
          </button>
        )}
      </div>

      {showForm && (
        <RoleForm
          role={editingRole}
          isPending={isPending}
          errors={formState?.errors as Record<string, string[]> | undefined}
          message={formState?.message}
          onSubmit={handleSave}
          onCancel={close}
        />
      )}

      {roles.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center">
          <p className="text-sm text-gray-500">No staff roles yet.</p>
          <p className="mt-1 text-xs text-gray-400">Add roles to estimate labor costs.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Wage / hr</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Productivity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                  <td className="px-4 py-3">{formatCents(role.hourlyWageCents)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {CAPACITY_LABELS[role.capacityImpact]}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {role.defaultProductivity.toFixed(1)}×
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(role)}
                        disabled={isPending}
                        className="text-xs text-blue-600 hover:underline disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        disabled={isPending}
                        className="text-xs text-red-500 hover:underline disabled:opacity-40"
                      >
                        Delete
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

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Prisma, StaffRole, StaffShift } from '@prisma/client';
import { formatCents } from '@/lib/money';
import { saveShiftAction, deleteShiftAction } from './actions';
import { ShiftForm } from './shift-form';
import type { FormActionState } from '@/features/restaurant/actions';

type ShiftWithRole = Prisma.StaffShiftGetPayload<{ include: { staffRole: true } }>;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseTimeHours(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

function shiftHours(start: string, end: string): number {
  const h = parseTimeHours(end) - parseTimeHours(start);
  return h > 0 ? h : 0;
}

function dailyLaborCents(shifts: ShiftWithRole[]): number {
  return shifts.reduce((sum, s) => {
    return sum + s.staffRole.hourlyWageCents * shiftHours(s.startTime, s.endTime) * s.quantity;
  }, 0);
}

type Props = { shifts: ShiftWithRole[]; roles: StaffRole[] };

export function ScheduleTable({ shifts, roles }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingShift, setEditingShift] = useState<ShiftWithRole | null>(null);
  const [addDay, setAddDay] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormActionState>(null);

  const showForm = editingShift !== null || addDay !== null;

  function openAdd(day: number) {
    setEditingShift(null);
    setAddDay(day);
    setFormState(null);
  }

  function openEdit(shift: ShiftWithRole) {
    setEditingShift(shift);
    setAddDay(null);
    setFormState(null);
  }

  function close() {
    setEditingShift(null);
    setAddDay(null);
    setFormState(null);
  }

  function handleSave(fd: FormData) {
    startTransition(async () => {
      const result = await saveShiftAction(null, fd);
      if (result?.success) {
        router.refresh();
        close();
      } else {
        setFormState(result);
      }
    });
  }

  function handleDelete(shift: ShiftWithRole) {
    const fd = new FormData();
    fd.append('id', shift.id);
    startTransition(async () => {
      await deleteShiftAction(null, fd);
      router.refresh();
    });
  }

  // Group shifts by day
  const byDay = new Map<number, ShiftWithRole[]>();
  for (let d = 0; d < 7; d++) byDay.set(d, []);
  for (const s of shifts) byDay.get(s.dayOfWeek)?.push(s);

  if (roles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center">
        <p className="text-sm text-gray-500">Add staff roles before scheduling shifts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{shifts.length} shifts scheduled</p>
      </div>

      {showForm && (
        <ShiftForm
          shift={editingShift ?? undefined}
          roles={roles}
          defaultDay={addDay ?? editingShift?.dayOfWeek ?? 0}
          isPending={isPending}
          errors={formState?.errors as Record<string, string[]> | undefined}
          message={formState?.message}
          onSubmit={handleSave}
          onCancel={close}
        />
      )}

      <div className="space-y-2">
        {Array.from(byDay.entries()).map(([day, dayShifts]) => {
          const laborCents = dailyLaborCents(dayShifts);
          return (
            <div key={day} className="rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">{DAY_NAMES[day]}</span>
                  {dayShifts.length > 0 && (
                    <span className="text-xs text-gray-500">
                      est. {formatCents(Math.round(laborCents))} labor
                    </span>
                  )}
                </div>
                {!showForm && (
                  <button
                    onClick={() => openAdd(day)}
                    disabled={isPending}
                    className="text-xs text-blue-600 hover:underline disabled:opacity-40"
                  >
                    + Add shift
                  </button>
                )}
              </div>

              {dayShifts.length === 0 ? (
                <p className="px-4 py-3 text-xs text-gray-400">No shifts.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {dayShifts.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium text-gray-700">
                          {s.staffRole.name}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {s.startTime} – {s.endTime}
                          <span className="ml-1 text-xs text-gray-400">
                            ({shiftHours(s.startTime, s.endTime).toFixed(1)}h)
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600">×{s.quantity}</td>
                        <td className="px-4 py-2 text-xs text-gray-400">
                          {formatCents(
                            Math.round(
                              s.staffRole.hourlyWageCents *
                                shiftHours(s.startTime, s.endTime) *
                                s.quantity,
                            ),
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              disabled={isPending}
                              className="text-xs text-blue-600 hover:underline disabled:opacity-40"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

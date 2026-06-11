'use client';

import { useState, useTransition } from 'react';
import { saveHoursAction } from './actions';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type HourRow = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const DEFAULT_HOURS: HourRow[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  isOpen: i !== 1,
  openTime: '11:00',
  closeTime: '22:00',
}));

type Props = { initial: HourRow[] };

export function HoursEditor({ initial }: Props) {
  const [hours, setHours] = useState<HourRow[]>(
    initial.length === 7 ? initial : DEFAULT_HOURS,
  );
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function update(dayOfWeek: number, patch: Partial<HourRow>) {
    setHours((prev) => prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('hours', JSON.stringify(hours));
    startTransition(async () => {
      const result = await saveHoursAction(null, fd);
      setMessage({
        text: result?.message ?? (result?.success ? 'Saved.' : 'Error saving hours.'),
        ok: !!result?.success,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded border px-4 py-3 text-sm ${
            message.ok
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Open</th>
              <th className="px-4 py-3">Opens</th>
              <th className="px-4 py-3">Closes</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((row) => (
              <tr key={row.dayOfWeek} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-gray-700">{DAY_NAMES[row.dayOfWeek]}</td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={row.isOpen}
                    onChange={(e) => update(row.dayOfWeek, { isOpen: e.target.checked })}
                    className="h-4 w-4 cursor-pointer accent-gray-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={row.openTime}
                    disabled={!row.isOpen}
                    onChange={(e) => update(row.dayOfWeek, { openTime: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={row.closeTime}
                    disabled={!row.isOpen}
                    onChange={(e) => update(row.dayOfWeek, { closeTime: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save Hours'}
      </button>
    </form>
  );
}

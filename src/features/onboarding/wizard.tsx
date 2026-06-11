'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Restaurant, MenuItem, StaffRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { saveProfileAction, saveHoursAction } from '@/features/restaurant/actions';
import { saveMenuItemAction } from '@/features/menu/actions';
import { saveRoleAction } from '@/features/staffing/actions';
import { formatCents } from '@/lib/money';

const STEPS = [
  { id: 1, label: 'Basics' },
  { id: 2, label: 'Hours' },
  { id: 3, label: 'Costs' },
  { id: 4, label: 'Menu' },
  { id: 5, label: 'Staff' },
  { id: 6, label: 'Review' },
];

const RESTAURANT_TYPES = ['Casual Dining', 'Fast Casual', 'Fast Food', 'Fine Dining', 'Café / Coffee Shop', 'Bar & Grill', 'Food Truck', 'Other'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const inputCls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
const selectCls = inputCls;

type HourRow = { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string };

const DEFAULT_HOURS: HourRow[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i, isOpen: i !== 1, openTime: '11:00', closeTime: '22:00',
}));

type Props = {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  staffRoles: StaffRole[];
};

export function OnboardingWizard({ restaurant, menuItems, staffRoles }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(() => {
    if (!restaurant) return 1;
    if (menuItems.length === 0) return 4;
    if (staffRoles.length === 0) return 5;
    return 6;
  });
  const [isPending, startTransition] = useTransition();
  const [hours, setHours] = useState<HourRow[]>(DEFAULT_HOURS);

  function updateHour(dayOfWeek: number, patch: Partial<HourRow>) {
    setHours(h => h.map(r => r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r));
  }

  function next() { setStep(s => Math.min(s + 1, 6)); }
  function back() { setStep(s => Math.max(s - 1, 1)); }

  // Step 1 — Restaurant basics
  function submitBasics(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Fill defaults for cost fields so schema passes
    fd.set('monthlyRentDollars', String(restaurant?.monthlyRent ? restaurant.monthlyRent / 100 : 0));
    fd.set('monthlyUtilitiesDollars', String(restaurant?.monthlyUtilities ? restaurant.monthlyUtilities / 100 : 0));
    fd.set('monthlyOtherDollars', String(restaurant?.monthlyOtherFixedCosts ? restaurant.monthlyOtherFixedCosts / 100 : 0));
    fd.set('targetFoodCostPct', String(restaurant?.targetFoodCostPercent ?? 30));
    fd.set('targetLaborCostPct', String(restaurant?.targetLaborCostPercent ?? 32));
    startTransition(async () => {
      const result = await saveProfileAction(null, fd);
      if (result?.success) { toast.success('Restaurant saved.'); next(); }
      else toast.error(result?.message ?? 'Save failed.');
    });
  }

  // Step 2 — Hours
  function submitHours(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('hours', JSON.stringify(hours));
    startTransition(async () => {
      const result = await saveHoursAction(null, fd);
      if (result?.success) { toast.success('Hours saved.'); next(); }
      else toast.error(result?.message ?? 'Save failed.');
    });
  }

  // Step 3 — Costs
  function submitCosts(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Fill non-cost fields from existing restaurant or defaults
    fd.set('name', restaurant?.name ?? '');
    fd.set('restaurantType', restaurant?.restaurantType ?? 'Casual Dining');
    fd.set('businessModel', restaurant?.businessModel ?? 'DINE_IN');
    fd.set('addressText', restaurant?.addressText ?? '');
    fd.set('city', restaurant?.city ?? '');
    fd.set('state', restaurant?.state ?? '');
    fd.set('postalCode', restaurant?.postalCode ?? '');
    fd.set('country', restaurant?.country ?? 'US');
    startTransition(async () => {
      const result = await saveProfileAction(null, fd);
      if (result?.success) { toast.success('Costs saved.'); next(); }
      else toast.error(result?.message ?? 'Save failed.');
    });
  }

  // Step 4 — Menu item
  function submitMenuItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveMenuItemAction(null, fd);
      if (result?.success) { toast.success('Menu item added.'); router.refresh(); }
      else toast.error(result?.message ?? 'Save failed.');
    });
  }

  // Step 5 — Staff role
  function submitRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveRoleAction(null, fd);
      if (result?.success) { toast.success('Role added.'); router.refresh(); }
      else toast.error(result?.message ?? 'Save failed.');
    });
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Set up your digital twin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex justify-between">
          {STEPS.map(s => (
            <span key={s.id} className={`text-xs ${s.id === step ? 'font-semibold text-foreground' : s.id < step ? 'text-primary' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Restaurant basics</CardTitle>
            <CardDescription>Name, type, and seating capacity.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitBasics} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Restaurant name</Label>
                <Input name="name" required defaultValue={restaurant?.name ?? ''} placeholder="The Corner Bistro" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <select name="restaurantType" defaultValue={restaurant?.restaurantType ?? ''} required className={selectCls}>
                    <option value="">Select…</option>
                    {RESTAURANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Business model</Label>
                  <select name="businessModel" defaultValue={restaurant?.businessModel ?? 'DINE_IN'} className={selectCls}>
                    <option value="DINE_IN">Dine-in</option>
                    <option value="TAKEOUT">Takeout</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Seating capacity</Label>
                  <Input name="seatingCapacity" type="number" min="1" required defaultValue={restaurant?.seatingCapacity ?? 50} />
                </div>
                <div className="space-y-1.5">
                  <Label>Avg table turn (min)</Label>
                  <Input name="avgTableTurnMinutes" type="number" min="5" required defaultValue={restaurant?.avgTableTurnMinutes ?? 60} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input name="city" defaultValue={restaurant?.city ?? ''} placeholder="Austin" />
              </div>
              <WizardFooter step={step} back={back} isPending={isPending} isFirst />
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Hours */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Operating hours</CardTitle>
            <CardDescription>Set which days you are open and your hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitHours} className="space-y-4">
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted text-left text-xs font-medium text-muted-foreground">
                      <th className="px-3 py-2">Day</th>
                      <th className="px-3 py-2">Open</th>
                      <th className="px-3 py-2">Opens</th>
                      <th className="px-3 py-2">Closes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map(row => (
                      <tr key={row.dayOfWeek} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{DAY_NAMES[row.dayOfWeek]}</td>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={row.isOpen} onChange={e => updateHour(row.dayOfWeek, { isOpen: e.target.checked })} className="h-4 w-4 accent-primary" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="time" value={row.openTime} disabled={!row.isOpen} onChange={e => updateHour(row.dayOfWeek, { openTime: e.target.value })} className="rounded border px-2 py-1 text-sm disabled:opacity-40" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="time" value={row.closeTime} disabled={!row.isOpen} onChange={e => updateHour(row.dayOfWeek, { closeTime: e.target.value })} className="rounded border px-2 py-1 text-sm disabled:opacity-40" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <WizardFooter step={step} back={back} isPending={isPending} />
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Costs */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly fixed costs</CardTitle>
            <CardDescription>Enter your monthly overheads in USD.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitCosts} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Rent ($)</Label>
                  <Input name="monthlyRentDollars" type="number" min="0" step="0.01" defaultValue={restaurant ? (restaurant.monthlyRent / 100).toFixed(2) : '0'} />
                </div>
                <div className="space-y-1.5">
                  <Label>Utilities ($)</Label>
                  <Input name="monthlyUtilitiesDollars" type="number" min="0" step="0.01" defaultValue={restaurant ? (restaurant.monthlyUtilities / 100).toFixed(2) : '0'} />
                </div>
                <div className="space-y-1.5">
                  <Label>Other ($)</Label>
                  <Input name="monthlyOtherDollars" type="number" min="0" step="0.01" defaultValue={restaurant ? (restaurant.monthlyOtherFixedCosts / 100).toFixed(2) : '0'} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Target food cost %</Label>
                  <Input name="targetFoodCostPct" type="number" min="1" max="100" step="0.1" defaultValue={restaurant?.targetFoodCostPercent ?? 30} />
                </div>
                <div className="space-y-1.5">
                  <Label>Target labor cost %</Label>
                  <Input name="targetLaborCostPct" type="number" min="1" max="100" step="0.1" defaultValue={restaurant?.targetLaborCostPercent ?? 32} />
                </div>
              </div>
              <WizardFooter step={step} back={back} isPending={isPending} />
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Menu */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>Add at least 3 items. The simulation distributes demand by popularity weight.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {menuItems.length > 0 && (
              <div className="space-y-1">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{formatCents(item.priceCents)}</span>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={submitMenuItem} className="space-y-3 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground">Add item</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input name="name" required placeholder="Chicken Burger" />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input name="category" required placeholder="Mains" />
                </div>
                <div className="space-y-1.5">
                  <Label>Price ($)</Label>
                  <Input name="priceDollars" type="number" min="0.01" step="0.01" required placeholder="14.99" />
                </div>
                <div className="space-y-1.5">
                  <Label>Food cost ($)</Label>
                  <Input name="foodCostDollars" type="number" min="0" step="0.01" required placeholder="4.50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Prep (min)</Label>
                  <Input name="prepMinutes" type="number" min="1" required defaultValue="10" />
                </div>
                <div className="space-y-1.5">
                  <Label>Popularity (0.1–10)</Label>
                  <Input name="popularityWeight" type="number" min="0.1" max="10" step="0.1" required defaultValue="1" />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
                + Add item
              </Button>
            </form>
            <WizardFooter step={step} back={back} isPending={isPending} nextDisabled={menuItems.length < 3} nextLabel={menuItems.length < 3 ? `Add ${3 - menuItems.length} more item${3 - menuItems.length > 1 ? 's' : ''}` : undefined} onNext={next} noSubmit />
          </CardContent>
        </Card>
      )}

      {/* Step 5: Staff */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Staff roles</CardTitle>
            <CardDescription>Add at least 1 role to estimate labor costs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {staffRoles.length > 0 && (
              <div className="space-y-1">
                {staffRoles.map(role => (
                  <div key={role.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-medium">{role.name}</span>
                    <span className="text-muted-foreground">{formatCents(role.hourlyWageCents)}/hr</span>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={submitRole} className="space-y-3 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground">Add role</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Role name</Label>
                  <Input name="name" required placeholder="Line Cook" />
                </div>
                <div className="space-y-1.5">
                  <Label>Wage / hr ($)</Label>
                  <Input name="hourlyWageDollars" type="number" min="0" step="0.01" required placeholder="18.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Capacity impact</Label>
                  <select name="capacityImpact" defaultValue="KITCHEN" className={selectCls}>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="SERVICE">Service</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Productivity (×)</Label>
                  <Input name="defaultProductivity" type="number" min="0.1" max="5" step="0.1" required defaultValue="1.0" />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
                + Add role
              </Button>
            </form>
            <WizardFooter step={step} back={back} isPending={isPending} nextDisabled={staffRoles.length < 1} onNext={next} noSubmit />
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Digital twin ready ✓</CardTitle>
            <CardDescription>Your restaurant is configured. Run a simulation to see your 7-day estimate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <Readiness label="Restaurant profile" ok={!!restaurant} />
              <Readiness label={`Menu (${menuItems.length} items)`} ok={menuItems.length >= 3} />
              <Readiness label={`Staff (${staffRoles.length} roles)`} ok={staffRoles.length >= 1} />
            </div>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button onClick={() => router.push('/simulations')} className="flex-1">
                Run baseline simulation →
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
                Go to dashboard
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={back} className="w-full">
              ← Back
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Readiness({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 ${ok ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <span className={ok ? 'text-green-600' : 'text-yellow-600'}>{ok ? '✓' : '!'}</span>
      <span className={`text-xs font-medium ${ok ? 'text-green-800' : 'text-yellow-800'}`}>{label}</span>
    </div>
  );
}

function WizardFooter({
  step, back, isPending, isFirst = false,
  nextDisabled = false, nextLabel, onNext, noSubmit = false,
}: {
  step: number;
  back: () => void;
  isPending: boolean;
  isFirst?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  noSubmit?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {!isFirst ? (
        <Button type="button" variant="ghost" size="sm" onClick={back}>← Back</Button>
      ) : <div />}
      {noSubmit ? (
        <Button type="button" disabled={nextDisabled || isPending} onClick={onNext} size="sm">
          {nextLabel ?? 'Next →'}
        </Button>
      ) : (
        <Button type="submit" disabled={nextDisabled || isPending} size="sm">
          {isPending ? 'Saving…' : (nextLabel ?? 'Save & continue →')}
        </Button>
      )}
    </div>
  );
}

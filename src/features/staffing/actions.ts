'use server';

import { auth } from '@/auth';
import { StaffRoleFormSchema, StaffShiftFormSchema } from '@/lib/validation/staffing';
import * as staffingService from '@/server/services/staffing';
import type { FormActionState } from '@/features/restaurant/actions';

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function saveRoleAction(
  _prev: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  const result = StaffRoleFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  try {
    await staffingService.saveRole(session.user.id, session.user.organizationId, result.data);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to save role.' };
  }

  return { success: true, message: result.data.id ? 'Role updated.' : 'Role added.' };
}

export async function deleteRoleAction(
  _prev: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  const id = formData.get('id') as string;
  if (!id) return { message: 'Missing ID' };

  try {
    await staffingService.deleteRole(session.user.id, session.user.organizationId, id);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to delete role.' };
  }

  return { success: true };
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export async function saveShiftAction(
  _prev: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  const result = StaffShiftFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  try {
    await staffingService.saveShift(session.user.id, session.user.organizationId, result.data);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to save shift.' };
  }

  return { success: true, message: result.data.id ? 'Shift updated.' : 'Shift added.' };
}

export async function deleteShiftAction(
  _prev: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  const id = formData.get('id') as string;
  if (!id) return { message: 'Missing ID' };

  try {
    await staffingService.deleteShift(session.user.id, session.user.organizationId, id);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to delete shift.' };
  }

  return { success: true };
}

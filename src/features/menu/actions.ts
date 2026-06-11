'use server';

import { auth } from '@/auth';
import { MenuItemFormSchema } from '@/lib/validation/menu';
import * as menuService from '@/server/services/menu';
import type { FormActionState } from '@/features/restaurant/actions';

export async function saveMenuItemAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return { message: 'Unauthorized' };
  }

  const raw = Object.fromEntries(formData.entries());
  const result = MenuItemFormSchema.safeParse(raw);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    await menuService.saveMenuItem(session.user.id, session.user.organizationId, result.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save item.';
    return { message: msg };
  }

  return { success: true, message: result.data.id ? 'Item updated.' : 'Item added.' };
}

export async function toggleMenuItemAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return { message: 'Unauthorized' };
  }

  const itemId = formData.get('id') as string;
  if (!itemId) return { message: 'Missing item ID' };

  try {
    await menuService.toggleMenuItem(session.user.id, session.user.organizationId, itemId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle item.';
    return { message: msg };
  }

  return { success: true };
}

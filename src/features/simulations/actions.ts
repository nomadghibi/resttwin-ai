'use server';

import { auth } from '@/auth';
import * as simulationService from '@/server/services/simulation';
import type { FormActionState } from '@/features/restaurant/actions';

export async function runBaselineAction(
  _prev: FormActionState | null,
  _formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  try {
    await simulationService.runBaselineSimulation(session.user.id, session.user.organizationId);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Simulation failed.' };
  }

  return { success: true, message: 'Baseline simulation complete.' };
}

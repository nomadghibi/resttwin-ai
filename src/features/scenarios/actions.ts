'use server';

import { auth } from '@/auth';
import { ScenarioCreateSchema } from '@/lib/validation/scenario';
import * as scenarioService from '@/server/services/scenario';
import type { FormActionState } from '@/features/restaurant/actions';
import { redirect } from 'next/navigation';

export async function createScenarioAction(
  _prev: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  const result = ScenarioCreateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  let scenario;
  try {
    let params: object;
    try {
      params = JSON.parse(result.data.parametersJson);
    } catch {
      return { errors: { parametersJson: ['Invalid JSON parameters'] } };
    }
    scenario = await scenarioService.createScenario(
      session.user.id,
      session.user.organizationId,
      result.data.name,
      result.data.type,
      params,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to create scenario.' };
  }

  redirect(`/scenarios/${scenario.id}`);
}

export async function runScenarioAction(
  _prev: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return { message: 'Unauthorized' };

  const scenarioId = formData.get('scenarioId') as string;
  if (!scenarioId) return { message: 'Missing scenario ID' };

  try {
    await scenarioService.runScenario(session.user.id, session.user.organizationId, scenarioId);
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Scenario run failed.' };
  }

  return { success: true, message: 'Scenario run complete.' };
}

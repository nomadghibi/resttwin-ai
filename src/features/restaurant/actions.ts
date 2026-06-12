'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { MembershipRole } from '@prisma/client';
import {
  RestaurantProfileSchema,
  OperatingHoursSchema,
  RegisterSchema,
} from '@/lib/validation/restaurant';
import * as restaurantService from '@/server/services/restaurant';
import { setActiveRestaurantId } from '@/lib/active-restaurant';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormActionState<TFields extends string = string> = {
  success?: boolean;
  message?: string;
  errors?: Partial<Record<TFields | '_', string[]>>;
} | null;

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) return 'Invalid email or password.';
    throw error; // rethrow NEXT_REDIRECT
  }
  return null;
}

export async function registerAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const raw = Object.fromEntries(formData.entries());
  const result = RegisterSchema.safeParse(raw);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password, orgName } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ['Email already in use'] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { name: orgName } });
    const user = await tx.user.create({ data: { name, email, passwordHash } });
    await tx.membership.create({
      data: { userId: user.id, organizationId: org.id, role: MembershipRole.OWNER },
    });
  });

  // Sign in after registration (throws NEXT_REDIRECT on success)
  try {
    await signIn('credentials', { email, password, redirectTo: '/onboarding' });
  } catch (error) {
    if (error instanceof AuthError) {
      return { errors: { _: ['Account created but sign-in failed. Please log in.'] } };
    }
    throw error;
  }

  return { success: true };
}

// ─── Demo login ───────────────────────────────────────────────────────────────

export async function demoLoginAction() {
  try {
    await signIn('credentials', {
      email: 'demo@resttwin.ai',
      password: 'demo1234',
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) return;
    throw error;
  }
}

// ─── Restaurant profile ───────────────────────────────────────────────────────

export async function saveProfileAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return { message: 'Unauthorized', errors: {} };
  }

  const raw = Object.fromEntries(formData.entries());
  const restaurantId = typeof raw.restaurantId === 'string' ? raw.restaurantId : undefined;
  const result = RestaurantProfileSchema.safeParse(raw);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  let isCreate = false;
  try {
    if (restaurantId) {
      await restaurantService.updateRestaurant(
        session.user.id,
        session.user.organizationId,
        restaurantId,
        result.data,
      );
    } else {
      const created = await restaurantService.createRestaurant(
        session.user.id,
        session.user.organizationId,
        result.data,
      );
      await setActiveRestaurantId(created.id);
      isCreate = true;
    }
  } catch {
    return { message: 'Failed to save restaurant. Please try again.' };
  }

  if (isCreate) redirect('/setup');
  return { success: true, message: 'Restaurant profile saved.' };
}

// ─── Operating hours ──────────────────────────────────────────────────────────

export async function saveHoursAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return { message: 'Unauthorized', errors: {} };
  }

  const json = formData.get('hours');
  if (typeof json !== 'string') return { message: 'Invalid hours data' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { message: 'Invalid hours JSON' };
  }

  const result = OperatingHoursSchema.safeParse(parsed);
  if (!result.success) {
    return { message: 'Invalid hours data', errors: { _: [result.error.message] } };
  }

  const restaurant = await restaurantService.getRestaurant(
    session.user.id,
    session.user.organizationId,
  );
  if (!restaurant) return { message: 'Create your restaurant profile first.' };

  try {
    await restaurantService.saveHours(
      session.user.id,
      session.user.organizationId,
      restaurant.id,
      result.data,
    );
  } catch {
    return { message: 'Failed to save hours. Please try again.' };
  }

  return { success: true, message: 'Operating hours saved.' };
}

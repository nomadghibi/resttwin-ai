'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/features/restaurant/actions';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'orgName' | '_', string[]>>;

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const errors = (state?.errors ?? {}) as Errors;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Create account</h1>

        {errors._?.[0] && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors._[0]}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Your name</label>
            <input name="name" type="text" required className={inputCls} />
            {errors.name?.[0] && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" required autoComplete="email" className={inputCls} />
            {errors.email?.[0] && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Min 8 characters"
              className={inputCls}
            />
            {errors.password?.[0] && (
              <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Restaurant name</label>
            <input name="orgName" type="text" required className={inputCls} />
            {errors.orgName?.[0] && (
              <p className="mt-1 text-xs text-red-600">{errors.orgName[0]}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-gray-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

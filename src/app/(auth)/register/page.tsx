'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/features/restaurant/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'orgName' | '_', string[]>>;

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const errors = (state?.errors ?? {}) as Errors;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Set up your restaurant digital twin in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          {errors._?.[0] && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors._[0]}
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" required placeholder="Jane Smith" />
              {errors.name?.[0] && <p className="text-xs text-destructive">{errors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" placeholder="jane@restaurant.com" />
              {errors.email?.[0] && <p className="text-xs text-destructive">{errors.email[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Min 8 characters" />
              {errors.password?.[0] && <p className="text-xs text-destructive">{errors.password[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Restaurant name</Label>
              <Input id="orgName" name="orgName" required placeholder="The Corner Bistro" />
              {errors.orgName?.[0] && <p className="text-xs text-destructive">{errors.orgName[0]}</p>}
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="ml-1 font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

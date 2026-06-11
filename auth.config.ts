import type { NextAuthConfig } from 'next-auth';

// Edge-compatible config — no Prisma or Node-only deps here.
// middleware.ts imports this; src/auth.ts extends it.
export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isAuthRoute = pathname === '/login' || pathname === '/register';

      if (!isAuthRoute) {
        if (!isLoggedIn) return false; // redirect to /login
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
};

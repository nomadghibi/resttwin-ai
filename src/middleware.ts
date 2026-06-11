import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Skip static files, images, and all /api routes (protected at handler level)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

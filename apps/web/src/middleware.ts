import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that are always public (no auth check)
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/',
  '/games(.*)',
  '/courses(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that are NOT public
  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // Redirect to /login manually instead of using auth().protect()
      // which reads the corrupted NEXT_PUBLIC_CLERK_SIGN_IN_URL env var
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/__clerk/(.*)'],
};
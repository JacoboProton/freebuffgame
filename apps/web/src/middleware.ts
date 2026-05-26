import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that are always public (no auth check)
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/',
  '/games(.*)',
  '/courses(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Only protect routes that are NOT public
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/__clerk/(.*)'],
};
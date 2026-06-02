'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useMemo } from 'react';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const clerkProps = useMemo(() => {
    // Use window.location.origin to build correct URLs dynamically
    // This bypasses corrupted NEXT_PUBLIC_CLERK_* env vars from Git Bash builds
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    return {
      signInUrl: '/login',
      signUpUrl: '/register',
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
      allowedRedirectOrigins: [
        'http://localhost:3000',
        'https://freebuffgame-web.onrender.com',
        'https://rxktk3y4.insforge.site',
        /^https:\/\/.*\.vercel\.app$/,
      ],
    };
  }, []);

  return (
    <ClerkProvider {...clerkProps}>
      {children}
    </ClerkProvider>
  );
}

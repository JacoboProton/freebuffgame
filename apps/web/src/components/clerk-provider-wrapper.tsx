'use client';

import { ClerkProvider } from '@clerk/nextjs';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/register"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      allowedRedirectOrigins={[
        'http://localhost:3000',
        'https://freebuffgame-web.onrender.com',
        'https://rxktk3y4.insforge.site',
        /^https:\/\/.*\.vercel\.app$/,
      ]}
    >
      {children}
    </ClerkProvider>
  );
}

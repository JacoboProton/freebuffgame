'use client';

import dynamic from 'next/dynamic';
import { ClerkProvider } from '@clerk/nextjs';

// Dynamically import ClerkProvider to avoid SSR issues during static generation
const ClerkProviderNoSSR = dynamic(
  () => Promise.resolve(ClerkProvider),
  { ssr: false }
);

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProviderNoSSR
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
    </ClerkProviderNoSSR>
  );
}

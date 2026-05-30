import { serve } from 'inngest/next';
import { inngest, functions } from '@/lib/inngest-client';

// Export the Inngest handler for Vercel (Next.js App Router)
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
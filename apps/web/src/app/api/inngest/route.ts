import { serve } from 'inngest/next';
import { inngest, functions } from '@/lib/inngest-client';

// Export the Inngest handler for Vercel (Next.js App Router)
const handler = serve({
  client: inngest,
  functions,
});

const routeContext = { params: Promise.resolve({}) };

export const GET = (request: Request) => handler.GET(request as never, routeContext as never);
export const POST = (request: Request) => handler.POST(request as never, routeContext as never);
export const PUT = (request: Request) => handler.PUT(request as never, routeContext as never);

import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Duobi-Jac - Aprende Jugando',
    template: '%s | Duobi-Jac',
  },
  description: 'Plataforma educativa gamificada donde puedes aprender jugando con cursos interactivos, logros y recompensas.',
  keywords: ['educación', 'cursos', 'gamificación', 'aprendizaje', 'juegos'],
  authors: [{ name: 'Duobi-Jac Team' }],
  openGraph: {
    title: 'Duobi-Jac - Aprende Jugando',
    description: 'Plataforma educativa gamificada',
    url: 'https://rxktk3y4.insforge.site',
    siteName: 'Duobi-Jac',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang='es'>
        <body>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
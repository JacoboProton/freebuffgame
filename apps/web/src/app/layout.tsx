import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Nunito, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/components/ui/toast';
import { PushProvider } from '@/components/push-provider';
import { ThemeProvider } from '@/components/theme-toggle';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

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
        <body className={`${inter.variable} ${nunito.variable} ${jetbrainsMono.variable}`}>
          <QueryProvider>
            <ToastProvider>
                  <PushProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </PushProvider>
            </ToastProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
import type { Metadata } from 'next';
import { HeaderWithAuth } from '@/components/user-button';

export const metadata: Metadata = {
  title: 'Cursos',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderWithAuth />
      {children}
    </>
  );
}
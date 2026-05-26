import { HomePage } from '@/components/home-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aprende Jugando',
};

export default function Page() {
  return <HomePage />;
}
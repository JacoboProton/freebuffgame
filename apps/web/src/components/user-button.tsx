'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationsBell } from './notifications-bell';

export function UserButtonWithData() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <Link href='/login'>
        <Badge variant='secondary' className='cursor-pointer'>
          Iniciar Sesión
        </Badge>
      </Link>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <NotificationsBell />
      <Badge variant='secondary' className='gap-1'>
        <Zap className='w-4 h-4 text-yellow-500' />
        {user.primaryEmailAddress?.emailAddress || user.firstName || 'Usuario'}
      </Badge>
      <UserButton afterSignOutUrl='/' />
    </div>
  );
}

export function HeaderWithAuth() {
  const { isSignedIn } = useUser();

  return (
    <header className='bg-white shadow-card sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <Link href={isSignedIn ? '/dashboard' : '/'} className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center'>
              <span className='text-2xl'>🐐</span>
            </div>
            <span className='font-bold text-xl'>Duobi-Jac</span>
          </Link>
          <UserButtonWithData />
        </div>
      </div>
    </header>
  );
}
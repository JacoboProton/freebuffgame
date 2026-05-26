'use client';

import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ streak, className, size = 'md' }: StreakCounterProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const isHotStreak = streak >= 7;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold',
        sizes[size],
        isHotStreak && 'text-accent-coral',
        className
      )}
    >
      <Flame
        className={cn(
          iconSizes[size],
          'fill-current',
          isHotStreak && 'animate-pulse'
        )}
      />
      <span>{streak}</span>
    </div>
  );
}
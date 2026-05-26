'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
}

export function ProgressBar({ value, max = 100, className, showLabel = false, variant = 'default' }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const variants = { default: 'bg-primary', success: 'bg-green-500', warning: 'bg-accent-coral' };
  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500 ease-out', variants[variant])} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</span>}
    </div>
  );
}

export function XPBar({ currentXP, level, className }: XPBarProps) {
  const xpInLevel = currentXP % 500;
  const percentage = (xpInLevel / 500) * 100;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-secondary rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{xpInLevel}/500 XP</span>
    </div>
  );
}

interface XPBarProps { currentXP: number; level: number; className?: string; }

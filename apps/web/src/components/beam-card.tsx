'use client';

import { HTMLAttributes } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const BorderBeamCornerCutCard = dynamic(
  () => import('@/components/neonblade-ui/border-beam-corner-cut-card').then((m) => m.BorderBeamCornerCutCard),
  { ssr: false }
);

interface BeamCardProps extends HTMLAttributes<HTMLDivElement> {
  beamColor?: string;
  corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'all';
  variant?: 'single' | 'dual' | 'gradient-sweep' | 'rainbow' | 'pulse';
  duration?: number;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  dark?: boolean;
}

function BeamCard({
  beamColor = '#22c55e',
  corner = 'bottom-right',
  variant = 'single',
  duration = 4,
  glowIntensity = 'low',
  dark = false,
  className,
  children,
  ...props
}: BeamCardProps) {
  return (
    <BorderBeamCornerCutCard
      beamColor={beamColor}
      corner={corner}
      variant={variant}
      duration={duration}
      glowIntensity={glowIntensity}
      bgColor={dark ? '#111827' : 'white'}
      className={cn('rounded-xl', className)}
      {...props}
    >
      {children}
    </BorderBeamCornerCutCard>
  );
}

export { BeamCard };

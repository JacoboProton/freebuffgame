'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
});

interface SplineSceneProps {
  scene?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SplineScene({ scene, className = '', style }: SplineSceneProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !scene || !scene.includes('spline.design')) {
    return null;
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <Spline scene={scene} />
    </div>
  );
}

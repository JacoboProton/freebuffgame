'use client';

import { motion } from 'framer-motion';

interface SplineHoverEffectProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  glowColor?: string;
  glowIntensity?: number;
}

export function SplineHoverEffect({
  children,
  className = '',
  scale = 1.02,
  glowColor = 'rgba(34, 197, 94, 0.3)',
  glowIntensity = 20,
}: SplineHoverEffectProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        scale,
        filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
      {/* Glow effect layer */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        whileHover={{
          opacity: 1,
        }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
          mixBlendMode: 'overlay',
        }}
      />
    </motion.div>
  );
}

'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SplineTiltEffectProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnabled?: boolean;
  glareColor?: string;
  scale?: number;
  perspective?: number;
}

export function SplineTiltEffect({
  children,
  className = '',
  tiltAmount = 15,
  glareEnabled = true,
  glareColor = 'rgba(255, 255, 255, 0.4)',
  scale = 1.02,
  perspective = 1000,
}: SplineTiltEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = (-mouseY / (rect.height / 2)) * tiltAmount;
      const rotateY = (mouseX / (rect.width / 2)) * tiltAmount;

      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;

      setTilt({ x: rotateX, y: rotateY });
      setGlarePosition({ x: glareX, y: glareY });
    },
    [tiltAmount]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: `${perspective}px` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? scale : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.5,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}

        {/* Glare effect */}
        {glareEnabled && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              opacity: isHovered ? 0.6 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(
                circle at ${glarePosition.x}% ${glarePosition.y}%,
                ${glareColor} 0%,
                transparent 50%
              )`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

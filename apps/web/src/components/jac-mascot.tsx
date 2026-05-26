'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type JacMood = 'idle' | 'happy' | 'sad' | 'celebrating' | 'thinking' | 'encouraging';

interface JacMascotProps {
  mood?: JacMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showMessage?: boolean;
}

// Jac the goat mascot SVG component with different moods
export function JacMascot({ 
  mood = 'idle', 
  message, 
  size = 'md', 
  className = '',
  showMessage = true 
}: JacMascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const getAnimation = () => {
    switch (mood) {
      case 'idle':
        return {
          y: [0, -4, 0],
          transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        };
      case 'happy':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          transition: { repeat: Infinity, duration: 0.5 }
        };
      case 'sad':
        return {
          y: [0, 2, 0],
          rotate: [0, -3, 3, 0],
          transition: { repeat: Infinity, duration: 3 }
        };
      case 'celebrating':
        return {
          y: [0, -15, 0],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.15, 1],
          transition: { repeat: Infinity, duration: 0.4 }
        };
      case 'thinking':
        return {
          rotate: [0, -2, 2, 0],
          transition: { repeat: Infinity, duration: 1.5 }
        };
      case 'encouraging':
        return {
          x: [0, 5, 0, -5, 0],
          y: [0, -3, 0, -3, 0],
          transition: { repeat: Infinity, duration: 1 }
        };
      default:
        return {};
    }
  };

  const getEyesExpression = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return { eyeY: 8, eyeScale: 1.2 };
      case 'sad':
        return { eyeY: 10, eyeScale: 0.8 };
      case 'thinking':
        return { eyeY: 9, eyeScale: 1 };
      default:
        return { eyeY: 9, eyeScale: 1 };
    }
  };

  const { eyeY, eyeScale } = getEyesExpression();

  const getMouthPath = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return 'M 28 18 Q 32 24 36 18'; // Big smile
      case 'sad':
        return 'M 28 22 Q 32 18 36 22'; // Frown
      case 'thinking':
        return 'M 30 20 Q 32 19 34 20'; // Small mouth
      default:
        return 'M 28 19 Q 32 21 36 19'; // Neutral smile
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={getAnimation()}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
        >
          {/* Goat body */}
          <ellipse cx="32" cy="40" rx="18" ry="16" fill="#F5E6D3" />
          
          {/* Goat head */}
          <ellipse cx="32" cy="28" rx="14" ry="12" fill="#F5E6D3" />
          
          {/* Ears */}
          <ellipse cx="18" cy="22" rx="6" ry="4" fill="#F5E6D3" transform="rotate(-30 18 22)" />
          <ellipse cx="46" cy="22" rx="6" ry="4" fill="#F5E6D3" transform="rotate(30 46 22)" />
          
          {/* Inner ears */}
          <ellipse cx="18" cy="22" rx="4" ry="2.5" fill="#E8D4C4" transform="rotate(-30 18 22)" />
          <ellipse cx="46" cy="22" rx="4" ry="2.5" fill="#E8D4C4" transform="rotate(30 46 22)" />
          
          {/* Horns */}
          <path
            d="M 20 16 Q 16 8 12 6"
            stroke="#8B7355"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 44 16 Q 48 8 52 6"
            stroke="#8B7355"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Eyes */}
          <motion.g
            animate={{ scaleY: mood === 'sad' ? 0.7 : 1 }}
          >
            <ellipse 
              cx="26" cy={eyeY} 
              rx={4 * eyeScale} 
              ry={3.5 * eyeScale} 
              fill="#2D2D2D" 
            />
            <ellipse 
              cx="38" cy={eyeY} 
              rx={4 * eyeScale} 
              ry={3.5 * eyeScale} 
              fill="#2D2D2D" 
            />
            {/* Eye shine */}
            <circle cx="27" cy={eyeY - 1} r="1.5" fill="white" />
            <circle cx="39" cy={eyeY - 1} r="1.5" fill="white" />
          </motion.g>
          
          {/* Nose */}
          <ellipse cx="32" cy="24" rx="4" ry="3" fill="#E8D4C4" />
          
          {/* Mouth */}
          <motion.path
            d={getMouthPath()}
            stroke="#2D2D2D"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={mood === 'happy' || mood === 'celebrating' ? {
              d: ['M 28 18 Q 32 24 36 18', 'M 28 18 Q 32 26 36 18', 'M 28 18 Q 32 24 36 18']
            } : {}}
          />
          
          {/* Cheeks (blush) */}
          {(mood === 'happy' || mood === 'celebrating') && (
            <>
              <ellipse cx="20" cy="26" rx="4" ry="3" fill="#FFB6C1" opacity="0.6" />
              <ellipse cx="44" cy="26" rx="4" ry="3" fill="#FFB6C1" opacity="0.6" />
            </>
          )}
          
          {/* Legs */}
          <rect x="22" y="52" width="6" height="10" rx="3" fill="#F5E6D3" />
          <rect x="36" y="52" width="6" height="10" rx="3" fill="#F5E6D3" />
          
          {/* Hooves */}
          <rect x="22" y="58" width="6" height="4" rx="2" fill="#4A4A4A" />
          <rect x="36" y="58" width="6" height="4" rx="2" fill="#4A4A4A" />
          
          {/* Tail */}
          <motion.path
            d="M 50 38 Q 56 36 54 42 Q 52 46 50 44"
            stroke="#F5E6D3"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={mood === 'celebrating' ? {
              rotate: [0, 15, -15, 0],
              originX: '50%',
              originY: '40%'
            } : {}}
          />
          
          {/* Celebration sparkles */}
          <AnimatePresence>
            {mood === 'celebrating' && (
              <>
                <motion.circle
                  cx="10" cy="20" r="2"
                  fill="#FFD700"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [-5, -10, -15] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                />
                <motion.circle
                  cx="54" cy="15" r="1.5"
                  fill="#FFD700"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [-5, -10, -15] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                />
                <motion.circle
                  cx="8" cy="35" r="1.5"
                  fill="#FFD700"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [-3, -8, -12] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.6 }}
                />
              </>
            )}
          </AnimatePresence>
        </svg>
        
        {/* Mood indicator above head */}
        <AnimatePresence>
          {mood === 'celebrating' && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-2xl">✨</span>
            </motion.div>
          )}
          {mood === 'sad' && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-lg">💧</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            className="absolute -top-2 left-full ml-2 bg-white rounded-2xl px-4 py-2 shadow-lg border border-gray-100 max-w-[200px]"
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            style={{ top: size === 'sm' ? '-10px' : size === 'lg' ? '10px' : '0' }}
          >
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
            {/* Bubble tail */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Confetti celebration effect
interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ show, onComplete }: ConfettiProps) {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const colors = ['#22C55E', '#FACC15', '#F97316', '#3B82F6', '#EC4899'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    drift: (Math.random() - 0.5) * 100,
  }));

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: '-20px',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
              initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: '120vh',
                x: particle.drift,
                opacity: [1, 1, 0],
                rotate: Math.random() * 720,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// XP Popup animation
interface XPPopupProps {
  xp: number;
  show: boolean;
  position?: 'center' | 'top' | 'bottom';
}

export function XPPopup({ xp, show, position = 'center' }: XPPopupProps) {
  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-1/4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-1/4 left-1/2 -translate-x-1/2',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="text-2xl">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JacMascot;
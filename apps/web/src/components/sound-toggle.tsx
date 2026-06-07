'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSplinePreferences } from '@/components/visual/useSplinePreferences';

export function SoundToggle() {
  const { soundEnabled, setSoundEnabled } = useSplinePreferences();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setSoundEnabled(!soundEnabled)}
      className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      title={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
      aria-label={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5 text-primary" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-400" />
      )}
    </motion.button>
  );
}

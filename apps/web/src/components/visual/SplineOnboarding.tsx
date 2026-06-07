'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Move3D, Eye, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface SplineOnboardingProps {
  onComplete?: () => void;
  storageKey?: string;
}

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  animation: {
    rotate?: number[];
    scale?: number[];
    x?: number[];
    y?: number[];
  };
}

const steps: OnboardingStep[] = [
  {
    icon: <MousePointer2 className="w-6 h-6" />,
    title: 'Pasa el cursor',
    description: 'Pasa el mouse sobre la escena 3D para activar el efecto de brillo.',
    animation: { x: [0, 20, 0], y: [0, -10, 0] },
  },
  {
    icon: <Move3D className="w-6 h-6" />,
    title: 'Mueve el cursor',
    description: 'Mueve el mouse en diferentes direcciones para ver el efecto de parallax/tilt 3D.',
    animation: { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] },
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Descubre más',
    description: 'Mantén el cursor sobre la escena para ver información detallada.',
    animation: { scale: [1, 1.1, 1], y: [0, -5, 0] },
  },
];

export function SplineOnboarding({
  onComplete,
  storageKey = 'spline-onboarding-seen',
}: SplineOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(storageKey);
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
    onComplete?.();
  }, [storageKey, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Onboarding interactivo de escenas 3D"
          onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-[340px] rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">Interactive 3D</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Interactúa con las escenas</h3>
            </div>

            {/* Step content */}
            <div className="px-6 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Animated icon */}
                  <motion.div
                    animate={step.animation}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-400/10 flex items-center justify-center text-primary mb-4"
                  >
                    {step.icon}
                  </motion.div>

                  <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-4">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'bg-primary w-6' : 'bg-gray-200 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {currentStep === steps.length - 1 ? '¡Entendido!' : 'Siguiente'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

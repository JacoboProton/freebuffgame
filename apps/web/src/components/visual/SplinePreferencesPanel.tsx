'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Rotate3d,
  Sun,
  Volume2,
  VolumeX,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
  Accessibility,
} from 'lucide-react';
import { useSplinePreferences } from './useSplinePreferences';

interface SplinePreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const glareColors = [
  { label: 'Verde', value: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' },
  { label: 'Azul', value: 'rgba(59, 130, 246, 0.3)', color: '#3B82F6' },
  { label: 'Púrpura', value: 'rgba(168, 85, 247, 0.3)', color: '#A855F7' },
  { label: 'Ámbar', value: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B' },
  { label: 'Rosa', value: 'rgba(236, 72, 153, 0.3)', color: '#EC4899' },
  { label: 'Blanco', value: 'rgba(255, 255, 255, 0.4)', color: '#FFFFFF' },
];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0 mr-3">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function Slider({
  value,
  onChange,
  min,
  max,
  step,
  label,
  displayValue,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  displayValue: string;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
      />
    </div>
  );
}

export function SplinePreferencesPanel({ isOpen, onClose }: SplinePreferencesPanelProps) {
  const prefs = useSplinePreferences();
  const [expandedSection, setExpandedSection] = useState<string | null>('tilt');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed right-4 top-20 z-50 w-80 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100"
            style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-gray-900">Preferencias 3D</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="p-4 space-y-1">
            {/* Tilt Section */}
            <Section
              title="Efecto Tilt"
              icon={<Rotate3d className="w-4 h-4" />}
              isExpanded={expandedSection === 'tilt'}
              onToggle={() => toggleSection('tilt')}
            >
              <Toggle
                checked={prefs.tiltEnabled}
                onChange={prefs.setTiltEnabled}
                label="Activar tilt 3D"
                description="Efecto parallax al mover el cursor"
              />
              {prefs.tiltEnabled && (
                <Slider
                  value={prefs.tiltAmount}
                  onChange={prefs.setTiltAmount}
                  min={0}
                  max={20}
                  step={1}
                  label="Intensidad"
                  displayValue={`${prefs.tiltAmount}°`}
                />
              )}
            </Section>

            {/* Glare Section */}
            <Section
              title="Efecto Glare"
              icon={<Sun className="w-4 h-4" />}
              isExpanded={expandedSection === 'glare'}
              onToggle={() => toggleSection('glare')}
            >
              <Toggle
                checked={prefs.glareEnabled}
                onChange={prefs.setGlareEnabled}
                label="Activar glare"
                description="Brillo que sigue al cursor"
              />
              {prefs.glareEnabled && (
                <div className="py-2">
                  <span className="text-sm font-medium text-gray-800 block mb-2">Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {glareColors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => prefs.setGlareColor(c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          prefs.glareColor === c.value
                            ? 'border-primary scale-110 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ background: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Hover Section */}
            <Section
              title="Efecto Hover"
              icon={<Sparkles className="w-4 h-4" />}
              isExpanded={expandedSection === 'hover'}
              onToggle={() => toggleSection('hover')}
            >
              <Slider
                value={prefs.hoverScale}
                onChange={prefs.setHoverScale}
                min={1}
                max={1.2}
                step={0.01}
                label="Escala al hover"
                displayValue={`${prefs.hoverScale.toFixed(2)}x`}
              />
            </Section>

            {/* Sound Section */}
            <Section
              title="Sonidos"
              icon={prefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              isExpanded={expandedSection === 'sound'}
              onToggle={() => toggleSection('sound')}
            >
              <Toggle
                checked={prefs.soundEnabled}
                onChange={prefs.setSoundEnabled}
                label="Sonidos de feedback"
                description="Sonidos sutiles al interactuar"
              />
              {prefs.soundEnabled && (
                <Slider
                  value={prefs.soundVolume}
                  onChange={prefs.setSoundVolume}
                  min={0}
                  max={1}
                  step={0.05}
                  label="Volumen"
                  displayValue={`${Math.round(prefs.soundVolume * 100)}%`}
                />
              )}
            </Section>

            {/* Accessibility Section */}
            <Section
              title="Accesibilidad"
              icon={<Accessibility className="w-4 h-4" />}
              isExpanded={expandedSection === 'accessibility'}
              onToggle={() => toggleSection('accessibility')}
            >
              <Toggle
                checked={prefs.reducedMotion}
                onChange={prefs.setReducedMotion}
                label="Movimiento reducido"
                description="Deshabilita animaciones complejas"
              />
              <Toggle
                checked={prefs.showOnboarding}
                onChange={prefs.setShowOnboarding}
                label="Mostrar onboarding"
                description="Tutorial interactivo de escenas 3D"
              />
            </Section>

            {/* Debug Section */}
            <Section
              title="Depuración"
              icon={<Gauge className="w-4 h-4" />}
              isExpanded={expandedSection === 'debug'}
              onToggle={() => toggleSection('debug')}
            >
              <Toggle
                checked={prefs.showPerformance}
                onChange={prefs.setShowPerformance}
                label="Monitor de rendimiento"
                description="Mostrar FPS, tiempo de carga, memoria"
              />
            </Section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-4 py-3 border-t border-gray-100"
            style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }}
          >
            <button
              onClick={prefs.resetToDefaults}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer valores predeterminados
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Section wrapper component
function Section({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-medium text-gray-800">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

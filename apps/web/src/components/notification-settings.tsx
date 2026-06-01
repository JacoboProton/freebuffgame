'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, BellOff, Check, Settings, Save } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface NotificationPreferences {
  email: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    achievements: boolean;
    courseUpdates: boolean;
    newCourses: boolean;
    promotions: boolean;
  };
  push: {
    lessonReminders: boolean;
    streakAlerts: boolean;
    achievementUnlocks: boolean;
    leaderboardUpdates: boolean;
    socialInteractions: boolean;
  };
  inApp: {
    showAchievementPopups: boolean;
    showXpGain: boolean;
    showStreakReminders: boolean;
    soundEffects: boolean;
  };
}

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      dailyReminders: true,
      weeklyProgress: true,
      achievements: true,
      courseUpdates: true,
      newCourses: false,
      promotions: false,
    },
    push: {
      lessonReminders: true,
      streakAlerts: true,
      achievementUnlocks: true,
      leaderboardUpdates: false,
      socialInteractions: false,
    },
    inApp: {
      showAchievementPopups: true,
      showXpGain: true,
      showStreakReminders: true,
      soundEffects: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const togglePreference = (
    category: 'email' | 'push' | 'inApp',
    key: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Configuración de Notificaciones</h3>
              <p className="text-sm text-gray-500">Elige cómo quieres recibir actualizaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Email Notifications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-gray-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Notificaciones por Email</h4>
          </div>
          <div className="space-y-3 pl-7">
            {Object.entries(preferences.email).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatPreferenceKey(key)}
                </span>
                <ToggleSwitch
                  enabled={value}
                  onChange={() => togglePreference('email', key)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Notificaciones Push</h4>
          </div>
          <div className="space-y-3 pl-7">
            {Object.entries(preferences.push).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatPreferenceKey(key)}
                </span>
                <ToggleSwitch
                  enabled={value}
                  onChange={() => togglePreference('push', key)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Notificaciones en App</h4>
          </div>
          <div className="space-y-3 pl-7">
            {Object.entries(preferences.inApp).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatPreferenceKey(key)}
                </span>
                <ToggleSwitch
                  enabled={value}
                  onChange={() => togglePreference('inApp', key)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn('flex-1', saved && 'bg-green-500 hover:bg-green-600')}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                ¡Guardado!
              </>
            ) : isSaving ? (
              'Guardando...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Preferencias
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors',
        enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
      )}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

// Format preference key to readable text
function formatPreferenceKey(key: string): string {
  const keyMap: Record<string, string> = {
    dailyReminders: 'Recordatorios diarios de estudio',
    weeklyProgress: 'Resumen de progreso semanal',
    achievements: 'Nuevos logros desbloqueados',
    courseUpdates: 'Actualizaciones de cursos inscritos',
    newCourses: 'Nuevos cursos disponibles',
    promotions: 'Promociones y ofertas especiales',
    lessonReminders: 'Recordatorios para continuar lecciones',
    streakAlerts: 'Alertas de racha y peligro de perderla',
    achievementUnlocks: 'Notificaciones de logros',
    leaderboardUpdates: 'Actualizaciones del leaderboard',
    socialInteractions: 'Interacciones con otros usuarios',
    showAchievementPopups: 'Mostrar popups de logros',
    showXpGain: 'Mostrar ganancia de XP en tiempo real',
    showStreakReminders: 'Recordatorios para mantener racha',
    soundEffects: 'Efectos de sonido',
  };
  return keyMap[key] || key;
}

// Compact notification settings button
export function NotificationSettingsButton() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(true)}
        className="text-gray-500 hover:text-primary"
      >
        <Bell className="w-4 h-4" />
      </Button>
      <NotificationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
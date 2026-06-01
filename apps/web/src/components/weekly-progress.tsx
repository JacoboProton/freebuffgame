'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Zap, Target, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayData {
  day: string;
  date: string;
  xp: number;
  lessons: number;
  goals: number;
  isToday?: boolean;
}

interface WeeklyProgressProps {
  className?: string;
  compact?: boolean;
}

export function WeeklyProgress({ className, compact = false }: WeeklyProgressProps) {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching weekly data
    // In production, this would fetch from your API
    const today = new Date();
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    const data: DayData[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + 1 + i);
      
      data.push({
        day: weekDays[i],
        date: date.toISOString().split('T')[0],
        xp: Math.floor(Math.random() * 300) + (i === today.getDay() - 1 ? 150 : 0),
        lessons: Math.floor(Math.random() * 4),
        goals: Math.random() > 0.3 ? 1 : 0,
        isToday: i === today.getDay() - 1,
      });
    }
    
    setWeekData(data);
    setIsLoading(false);
  }, []);

  const maxXP = Math.max(...weekData.map((d) => d.xp), 1);
  const totalXP = weekData.reduce((acc, d) => acc + d.xp, 0);
  const totalLessons = weekData.reduce((acc, d) => acc + d.lessons, 0);
  const completedGoals = weekData.filter((d) => d.goals > 0).length;

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse', className)}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="flex justify-between h-32">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-8 bg-gray-200 dark:bg-gray-700 rounded-t" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Tu Semana</h3>
            <p className="text-sm text-gray-500">Resumen de actividad</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalXP} XP</p>
          <p className="text-xs text-gray-500">esta semana</p>
        </div>
      </div>

      {/* Stats Row */}
      {!compact && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalLessons}</p>
            <p className="text-xs text-gray-500">Lecciones</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalXP}</p>
            <p className="text-xs text-gray-500">XP Total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <Target className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{completedGoals}/7</p>
            <p className="text-xs text-gray-500">Metas</p>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {weekData.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 flex flex-col items-center gap-2"
          >
            {/* XP value */}
            {!compact && (
              <span className="text-xs font-medium text-gray-500">{day.xp}</span>
            )}
            
            {/* Bar */}
            <div className="w-full flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: `${(day.xp / maxXP) * 100}%`,
                }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                className={cn(
                  'w-full rounded-t-lg transition-colors',
                  day.isToday
                    ? 'bg-gradient-to-t from-primary to-primary/60'
                    : day.xp > 0
                    ? 'bg-primary/40'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
                style={{ minHeight: day.xp > 0 ? '8px' : '4px' }}
              />
            </div>

            {/* Day label */}
            <div className="text-center">
              <span
                className={cn(
                  'text-xs font-medium',
                  day.isToday
                    ? 'text-primary font-bold'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {day.day}
              </span>
              {day.isToday && (
                <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Week summary */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Promedio diario</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.round(totalXP / 7)} XP/día
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Compact version for dashboard
export function WeeklyProgressCompact() {
  return <WeeklyProgress compact />;
}
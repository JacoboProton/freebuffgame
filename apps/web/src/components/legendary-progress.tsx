'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Zap, Target, BookOpen, Clock, Code } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LegendaryAchievementProgress {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  current: number;
  target: number;
  percentage: number;
  detail: string;
}

interface LegendaryProgressData {
  achievements: LegendaryAchievementProgress[];
  unlockedCount: number;
  totalCount: number;
  metrics: {
    completedFinalExams: number;
    totalFinalExams: number;
    perfectFinalExams: number;
    completedCourses: number;
    totalCourses: number;
    totalTimeOnExamsSeconds: number;
    completedCodingLessons: number;
    totalCodingLessons: number;
  };
}

const ACHIEVEMENT_BG: Record<string, string> = {
  all_final_exams: 'from-amber-400 to-yellow-500',
  perfect_final_exams: 'from-purple-400 to-pink-500',
  all_courses_complete: 'from-emerald-400 to-teal-500',
  speed_master: 'from-blue-400 to-cyan-500',
  code_master: 'from-orange-400 to-red-500',
};

const ACHIEVEMENT_CARD_BG: Record<string, string> = {
  all_final_exams: 'bg-amber-50 border-amber-200',
  perfect_final_exams: 'bg-purple-50 border-purple-200',
  all_courses_complete: 'bg-emerald-50 border-emerald-200',
  speed_master: 'bg-blue-50 border-blue-200',
  code_master: 'bg-orange-50 border-orange-200',
};

export function LegendaryProgressCard() {
  const [data, setData] = useState<LegendaryProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/achievements/legendary-progress');
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch legendary progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return null;

  const { achievements, unlockedCount, totalCount } = data;
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const allUnlocked = unlockedCount === totalCount;

  return (
    <Card className="overflow-hidden border-2 border-amber-200">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                🏛️
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Progreso de Logros Legendarios</h3>
                <p className="text-xs text-gray-500">
                  {allUnlocked
                    ? '¡Todos los logros legendarios desbloqueados!'
                    : `${unlockedCount}/${totalCount} desbloqueados — ${lockedAchievements.length} por desbloquear`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {allUnlocked ? (
                <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  Legendario
                </Badge>
              ) : (
                <div className="text-right mr-2">
                  <div className="text-lg font-bold text-amber-700">{Math.round((unlockedCount / totalCount) * 100)}%</div>
                </div>
              )}
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="mt-3">
            <ProgressBar
              value={(unlockedCount / totalCount) * 100}
              className="h-2 bg-amber-100"
            />
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-white">
              {achievements.map((ach) => (
                <motion.div
                  key={ach.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    ach.unlocked
                      ? "border-green-200 bg-green-50/50"
                      : ACHIEVEMENT_CARD_BG[ach.key] || 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                      ach.unlocked
                        ? "bg-green-100"
                        : "bg-white/80"
                    )}>
                      {ach.unlocked ? ach.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-800">{ach.title}</h4>
                        {ach.unlocked && (
                          <Badge className="bg-green-100 text-green-700 text-xs border-green-200">
                            ✓ Desbloqueado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{ach.description}</p>

                      {/* Progress bar */}
                      <div className="mb-1.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">{ach.detail}</span>
                          <span className={cn(
                            "font-semibold",
                            ach.unlocked ? "text-green-600" : "text-amber-600"
                          )}>
                            {ach.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ach.percentage}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={cn(
                              "h-full rounded-full",
                              ach.unlocked
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : `bg-gradient-to-r ${ACHIEVEMENT_BG[ach.key] || 'from-gray-400 to-gray-500'}`
                            )}
                          />
                        </div>
                      </div>

                      {/* XP reward */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-purple-600 font-medium">+{ach.xpReward} XP</span>
                        {!ach.unlocked && (
                          <span className="text-xs text-gray-400">
                            {ach.key === 'speed_master'
                              ? `${Math.round(data.metrics.totalTimeOnExamsSeconds / 60)} min / 60 min`
                              : `${ach.current}/${ach.target}`
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Quick metrics summary */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-gray-500">Exámenes</span>
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    {data.metrics.completedFinalExams}/{data.metrics.totalFinalExams}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-gray-500">Cursos</span>
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    {data.metrics.completedCourses}/{data.metrics.totalCourses}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Code className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-gray-500">Código</span>
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    {data.metrics.completedCodingLessons}/{data.metrics.totalCodingLessons}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

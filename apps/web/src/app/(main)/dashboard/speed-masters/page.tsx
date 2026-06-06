'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Sparkles, Star, Calendar, Clock, Zap, Award, Timer, TrendingDown, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SpeedMasterEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string | null;
  xp: number;
  level: number;
  totalTimeSeconds: number;
  totalTimeMinutes: number;
  avgTimePerExamSeconds: number;
  avgTimePerExamFormatted: string;
  unlockedAt: string;
  isCurrentUser: boolean;
}

interface SpeedMastersData {
  leaderboard: SpeedMasterEntry[];
  totalSpeedMasters: number;
  achievement: {
    key: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
  } | null;
  thresholdMinutes: number;
  period: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatTimePrecise(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Period = 'all' | 'week' | 'month';

const PERIOD_OPTIONS: { value: Period; label: string; icon: string }[] = [
  { value: 'all', label: 'Todo el tiempo', icon: '🏆' },
  { value: 'week', label: 'Esta semana', icon: '📅' },
  { value: 'month', label: 'Este mes', icon: '📆' },
];

export default function SpeedMastersPage() {
  const [data, setData] = useState<SpeedMastersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('all');

  useEffect(() => {
    fetchSpeedMasters(period);
  }, [period]);

  const fetchSpeedMasters = async (p: Period) => {
    setData(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard/speed-masters?period=${p}`);
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch speed masters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
          </motion.div>
        );
      case 2:
        return <Trophy className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Trophy className="w-7 h-7 text-amber-600" />;
      default:
        return (
          <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold text-sm">
            #{rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-yellow-300 shadow-md';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUserEntry = data?.leaderboard?.find(e => e.isCurrentUser);
  const fastestEntry = data?.leaderboard?.[0];

  // Calculate stats
  const avgTotalTime = data?.leaderboard?.length
    ? Math.round(data.leaderboard.reduce((acc, e) => acc + e.totalTimeSeconds, 0) / data.leaderboard.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/leaderboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver al Leaderboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ⚡
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Velocistas Absolutos
          </h1>
          <p className="text-gray-500 text-lg">
            Los maestros más rápidos — completaron todos los exámenes finales en menos de 60 minutos
          </p>
        </motion.div>

        {/* Time Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <Filter className="w-4 h-4 text-gray-400" />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                period === opt.value
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-800">{data?.totalSpeedMasters || 0}</div>
            <div className="text-xs text-blue-600">Velocistas</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Timer className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">
              {fastestEntry ? formatTimePrecise(fastestEntry.totalTimeSeconds) : '--'}
            </div>
            <div className="text-xs text-green-600">Tiempo más rápido</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {data?.leaderboard?.length ? formatTime(avgTotalTime) : '--'}
            </div>
            <div className="text-xs text-purple-600">Tiempo promedio</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-800">+{data?.achievement?.xpReward || 800}</div>
            <div className="text-xs text-amber-600">XP por logro</div>
          </Card>
        </motion.div>

        {/* Current User Banner */}
        {currentUserEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 opacity-75 blur-sm animate-pulse" />
              <div className="relative bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-400 rounded-2xl p-6 text-center">
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-blue-800 mb-1">
                  ¡Eres un Velocista Absoluto! ⚡
                </h3>
                <p className="text-sm text-blue-700">
                  Completaste los 4 exámenes finales en{' '}
                  <span className="font-bold">{formatTimePrecise(currentUserEntry.totalTimeSeconds)}</span>
                  {' '}— tu nombre está en este leaderboard legendario.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Fastest Speed Master Spotlight */}
        {fastestEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-2 border-blue-300 shadow-lg">
              <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 px-6 py-3 text-white text-center">
                <span className="font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Velocista Más Rápido de la Historia
                  <Trophy className="w-5 h-5" />
                </span>
              </div>
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Avatar className="w-20 h-20 mx-auto border-4 border-blue-400 shadow-lg mb-3">
                    <AvatarImage src={fastestEntry.avatar || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white text-3xl font-bold">
                      {fastestEntry.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{fastestEntry.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Nivel {fastestEntry.level} • {fastestEntry.xp.toLocaleString()} XP
                </p>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    <Timer className="w-3 h-3 mr-1" />
                    {formatTimePrecise(fastestEntry.totalTimeSeconds)} total
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Promedio: {fastestEntry.avgTimePerExamFormatted} /examen
                  </Badge>
                </div>
                <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  Desde {formatDate(fastestEntry.unlockedAt)}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Ranking de Velocistas</h2>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  ⚡ {data?.thresholdMinutes || 60} min máximo
                </Badge>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {!data?.leaderboard || data.leaderboard.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-7xl mb-4 grayscale opacity-50"
                  >
                    ⚡
                  </motion.div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    Sé el primero en ser Velocista
                  </h4>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Completa todos los exámenes finales en menos de 60 minutos para ganar este logro legendario
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    Explorar Cursos
                  </Link>
                </div>
              ) : (
                data.leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(0.5 + index * 0.05, 1.5) }}
                    className={cn(
                      "px-6 py-4 flex items-center gap-4 transition-all",
                      getRankBg(entry.rank),
                      entry.isCurrentUser && "ring-2 ring-blue-400 ring-inset"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className={cn(
                      "border-2",
                      entry.rank === 1 ? "w-14 h-14 border-blue-400 shadow-md" : "w-11 h-11 border-white"
                    )}>
                      <AvatarImage src={entry.avatar || ''} />
                      <AvatarFallback className={cn(
                        "text-white font-bold",
                        entry.rank === 1 ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-lg" : "bg-gradient-to-br from-cyan-400 to-teal-500"
                      )}>
                        {entry.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-semibold truncate",
                          entry.rank === 1 ? "text-blue-800 text-lg" : "text-gray-800"
                        )}>
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs border-blue-200">
                            Tú
                          </Badge>
                        )}
                        {entry.rank === 1 && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs border-yellow-200">
                            👑 Más rápido
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          Nivel {entry.level}
                        </span>
                        <span>•</span>
                        <span>{entry.xp.toLocaleString()} XP</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.unlockedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Time display */}
                    <div className="text-right flex-shrink-0">
                      <div className={cn(
                        "text-xl font-bold tabular-nums",
                        entry.rank === 1 ? "text-blue-700" : entry.rank <= 3 ? "text-cyan-700" : "text-gray-700"
                      )}>
                        {formatTimePrecise(entry.totalTimeSeconds)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Promedio: {entry.avgTimePerExamFormatted}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 text-center border-t border-blue-100">
              <p className="text-xs text-blue-700 font-medium flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Ordenados por tiempo total en exámenes — más rápido = mejor
                <Sparkles className="w-3 h-3" />
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

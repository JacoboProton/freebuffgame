'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Sparkles, Star, Calendar, Users, Award, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfettiCelebration } from '@/components/jac-mascot';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

interface MastersEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  unlockedAt: string;
  isCurrentUser: boolean;
}

interface AchievementInfo {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface MastersData {
  leaderboard: MastersEntry[];
  totalMasters: number;
  achievement: AchievementInfo;
}

export default function MastersPage() {
  const { user: clerkUser } = useUser();
  const [data, setData] = useState<MastersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await fetch('/api/leaderboard/masters');
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
        // Trigger celebration if current user is a master
        const isMaster = result.data.leaderboard?.some(
          (e: MastersEntry) => e.isCurrentUser
        );
        if (isMaster && !hasTriggered) {
          setTimeout(() => {
            setShowCelebration(true);
            setHasTriggered(true);
            setTimeout(() => setShowCelebration(false), 5000);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch masters:', error);
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
          <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold">
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

  const currentUserIsMaster = data?.leaderboard?.some(e => e.isCurrentUser);
  const firstMaster = data?.leaderboard?.[0];

  return (
    <div className="min-h-screen bg-background">
      <ConfettiCelebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

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
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎓
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            Maestros del Conocimiento
          </h1>
          <p className="text-gray-500 text-lg">
            Los usuarios que han aprobado todos los exámenes finales
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-800">{data?.totalMasters || 0}</div>
            <div className="text-xs text-amber-600">Maestros</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800">+{data?.achievement.xpReward || 500}</div>
            <div className="text-xs text-purple-600">XP por logro</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-800">4</div>
            <div className="text-xs text-blue-600">Exámenes finales</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">100%</div>
            <div className="text-xs text-green-600">Aprobación</div>
          </Card>
        </motion.div>

        {/* Current User Banner */}
        {currentUserIsMaster && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 opacity-75 blur-sm animate-pulse" />
              <div className="relative bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-6 text-center">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-amber-800 mb-1">
                  ¡Eres un Maestro del Conocimiento! 🎓
                </h3>
                <p className="text-sm text-amber-700">
                  Has aprobado todos los exámenes finales. Tu nombre aparece en este leaderboard legendario.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* First Master Spotlight */}
        {firstMaster && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-2 border-yellow-300 shadow-lg">
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 px-6 py-3 text-white text-center">
                <span className="font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Primer Maestro de la Historia
                  <Trophy className="w-5 h-5" />
                </span>
              </div>
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Avatar className="w-20 h-20 mx-auto border-4 border-yellow-400 shadow-lg mb-3">
                    <AvatarImage src={firstMaster.avatar || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-3xl font-bold">
                      {firstMaster.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{firstMaster.name}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Nivel {firstMaster.level} • {firstMaster.xp.toLocaleString()} XP
                </p>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  Maestro desde {formatDate(firstMaster.unlockedAt)}
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
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <h2 className="font-bold text-lg">Ranking Completo de Maestros</h2>
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
                    🎓
                  </motion.div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    Sé el primero en lograrlo
                  </h4>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Aprobar todos los exámenes finales de los cursos para convertirte en el primer Maestro del Conocimiento
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
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
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={cn(
                      "px-6 py-4 flex items-center gap-4 transition-all",
                      getRankBg(entry.rank),
                      entry.isCurrentUser && "ring-2 ring-amber-400 ring-inset"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className={cn(
                      "border-2",
                      entry.rank === 1 ? "w-14 h-14 border-yellow-400 shadow-md" : "w-11 h-11 border-white"
                    )}>
                      <AvatarImage src={entry.avatar || ''} />
                      <AvatarFallback className={cn(
                        "text-white font-bold",
                        entry.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-lg" : "bg-gradient-to-br from-amber-400 to-orange-500"
                      )}>
                        {entry.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-semibold truncate",
                          entry.rank === 1 ? "text-amber-800 text-lg" : "text-gray-800"
                        )}>
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs border-amber-200">
                            Tú
                          </Badge>
                        )}
                        {entry.rank === 1 && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs border-yellow-200">
                            👑 Primero
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
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 text-center border-t border-amber-100">
              <p className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Ordenados por fecha de desbloqueo — los primeros en lograrlo quedan arriba
                <Sparkles className="w-3 h-3" />
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

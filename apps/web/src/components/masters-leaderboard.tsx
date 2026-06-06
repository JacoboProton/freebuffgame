'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Calendar, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface MastersLeaderboardData {
  leaderboard: MastersEntry[];
  totalMasters: number;
  achievement: {
    key: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
  };
}

export function MastersLeaderboard() {
  const [data, setData] = useState<MastersLeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await fetch('/api/leaderboard/masters');
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch masters leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-lg" />
          </motion.div>
        );
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="animate-pulse h-6 bg-white/20 rounded w-1/3" />
        </div>
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-5 text-white relative overflow-hidden">
        {/* Animated sparkles in header */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -10, -20],
              x: [0, (i % 2 === 0 ? 1 : -1) * 5],
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
            }}
            className="absolute text-white/30"
            style={{ left: `${15 + i * 14}%`, top: '50%' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl"
            >
              🎓
            </motion.div>
            <div>
              <h3 className="font-bold text-lg">Maestros del Conocimiento</h3>
              <p className="text-sm text-white/80">
                {data?.totalMasters || 0} {data?.totalMasters === 1 ? 'maestro' : 'maestros'} {data?.totalMasters === 1 ? 'ha' : 'han'} desbloqueado este logro
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{data?.achievement.xpReward || 500} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-50">
        {(!data?.leaderboard || data.leaderboard.length === 0) ? (
          <div className="px-6 py-12 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4 grayscale opacity-50"
            >
              🎓
            </motion.div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Ningún Maestro aún</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Sé el primero en aprobar todos los exámenes finales de los cursos para aparecer aquí
            </p>
          </div>
        ) : (
          data.leaderboard.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                "px-6 py-4 flex items-center gap-4 transition-all",
                getRankBg(entry.rank),
                entry.isCurrentUser && "ring-2 ring-amber-400 ring-inset"
              )}
            >
              {/* Rank */}
              <div className="w-10 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className={cn(
                "border-2",
                entry.rank === 1 ? "w-12 h-12 border-yellow-400 shadow-md" : "w-10 h-10 border-white"
              )}>
                <AvatarImage src={entry.avatar || ''} />
                <AvatarFallback className={cn(
                  "text-white font-bold text-sm",
                  entry.rank === 1
                    ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                    : "bg-gradient-to-br from-amber-400 to-orange-500"
                )}>
                  {entry.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Name & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold truncate",
                    entry.rank === 1 ? "text-amber-800" : "text-gray-800"
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
                  <span>Nivel {entry.level}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.unlockedAt).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <span className="font-bold text-amber-600 text-lg">
                  {entry.xp.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1">XP</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-center border-t border-amber-100">
        <p className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Ordenados por fecha de desbloqueo — los primeros en lograrlo quedan arriba
          <Sparkles className="w-3 h-3" />
        </p>
      </div>
    </div>
  );
}

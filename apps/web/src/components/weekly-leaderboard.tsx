'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  weeklyXp: number;
  isCurrentUser: boolean;
  reward?: {
    type: string;
    amount: number;
  };
}

interface WeeklyReward {
  weekStart: string;
  topThree: {
    first?: { xpBonus: number; badge?: string };
    second?: { xpBonus: number; badge?: string };
    third?: { xpBonus: number; badge?: string };
  };
}

export function WeeklyLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weekReward, setWeekReward] = useState<WeeklyReward | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
    fetchWeekReward();
  }, []);

  useEffect(() => {
    // Update countdown every minute
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [weekReward]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/weekly-leaderboard');
      const data = await res.json();
      if (data.status === 'success') {
        setLeaderboard(data.data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekReward = async () => {
    try {
      const res = await fetch('/api/weekly-leaderboard/reward');
      const data = await res.json();
      if (data.status === 'success') {
        setWeekReward(data.data);
        updateCountdown(data.data.weekStart);
      }
    } catch (error) {
      console.error('Failed to fetch week reward:', error);
    }
  };

  const updateCountdown = (weekStart?: string) => {
    if (!weekStart && weekReward) {
      weekStart = weekReward.weekStart;
    }
    if (!weekStart) return;

    const now = new Date();
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const diff = nextWeek.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    setTimeLeft(`${days}d ${hours}h`);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-lg">Clasificación Semanal</h3>
          </div>
          {timeLeft && (
            <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 inline mr-1" />
              {timeLeft} restantes
            </div>
          )}
        </div>
      </div>

      {/* Rewards Info */}
      {weekReward && (
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
          <div className="flex items-center gap-4 text-sm">
            {weekReward.topThree.first && (
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Star className="w-4 h-4" />
                <span>1º: {weekReward.topThree.first.xpBonus} XP</span>
              </div>
            )}
            {weekReward.topThree.second && (
              <div className="flex items-center gap-1 text-gray-500">
                <Star className="w-4 h-4" />
                <span>2º: {weekReward.topThree.second.xpBonus} XP</span>
              </div>
            )}
            {weekReward.topThree.third && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Star className="w-4 h-4" />
                <span>3º: {weekReward.topThree.third.xpBonus} XP</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {leaderboard.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay datos esta semana todavía</p>
            <p className="text-sm">¡Sé el primero en ganar XP!</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`px-6 py-3 flex items-center gap-4 ${entry.isCurrentUser ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} ${getRankBg(entry.rank)}`}
            >
              {/* Rank */}
              <div className="w-10 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {entry.name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {entry.name}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      Tú
                    </span>
                  )}
                </div>
                {entry.reward && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {entry.reward.type === 'xp_bonus' ? `+${entry.reward.amount} XP bonus` : entry.reward.type}
                  </span>
                )}
              </div>

              {/* XP */}
              <div className="text-right">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {entry.weeklyXp.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1">XP</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-center">
        <p className="text-sm text-gray-500">
          Las recompensas se entregan automáticamente al finalizar la semana
        </p>
      </div>
    </div>
  );
}
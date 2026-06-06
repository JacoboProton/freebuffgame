'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Star, Calendar, Users, Award, Clock, Crown, Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HallOfFameEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string | null;
  xp: number;
  level: number;
  totalLegendaryCount: number;
  firstLegendaryAt: string;
  achievements: { key: string; title: string; description: string; icon: string; xpReward: number; unlockedAt: string }[];
}

interface HallOfFameData {
  hallOfFame: HallOfFameEntry[];
  totalLegendaryUsers: number;
  totalLegendaryAchievements: number;
  legendaryAchievements: { key: string; title: string; description: string; icon: string; xpReward: number }[];
}

const ACHIEVEMENT_BG: Record<string, string> = {
  all_final_exams: 'bg-amber-50 border-amber-200',
  perfect_final_exams: 'bg-purple-50 border-purple-200',
  all_courses_complete: 'bg-emerald-50 border-emerald-200',
  speed_master: 'bg-blue-50 border-blue-200',
  code_master: 'bg-orange-50 border-orange-200',
};

export default function PublicHallOfFamePage() {
  const [data, setData] = useState<HallOfFameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Hall of Fame | Duobi-Jac';
    fetchHallOfFame();
  }, []);

  const fetchHallOfFame = async () => {
    try {
      const res = await fetch('/api/leaderboard/hall-of-fame');
      const result = await res.json();
      if (result.status === 'success') setData(result.data);
    } catch (error) {
      console.error('Failed to fetch Hall of Fame:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Crown className="w-9 h-9 text-yellow-500 drop-shadow-lg" />
          </motion.div>
        );
      case 2: return <Trophy className="w-7 h-7 text-gray-400" />;
      case 3: return <Trophy className="w-7 h-7 text-amber-600" />;
      default:
        return <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold text-sm">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-yellow-300 shadow-lg';
      case 2: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-sm';
      case 3: return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm';
      default: return 'bg-white border-gray-100';
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-100 rounded-2xl" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const topUser = data?.hallOfFame?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple public header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-gray-800">Duobi-Jac</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cursos</Link>
            <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-4">🏛️</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            Hall of Fame
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Los usuarios más legendarios de la plataforma — desbloqueadores de logros épicos
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Users className="w-6 h-6 text-yellow-600" /></div>
            <div className="text-2xl font-bold text-yellow-800">{data?.totalLegendaryUsers || 0}</div>
            <div className="text-xs text-yellow-600">Usuarios Legendarios</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Award className="w-6 h-6 text-purple-600" /></div>
            <div className="text-2xl font-bold text-purple-800">{data?.totalLegendaryAchievements || 0}</div>
            <div className="text-xs text-purple-600">Logros Legendarios</div>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 col-span-2 md:col-span-1">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Flame className="w-6 h-6 text-amber-600" /></div>
            <div className="text-2xl font-bold text-amber-800">5</div>
            <div className="text-xs text-amber-600">Tipos de Logros</div>
          </Card>
        </motion.div>

        {/* First Legend Spotlight */}
        {topUser && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <Card className="overflow-hidden border-2 border-yellow-300 shadow-lg">
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 px-6 py-3 text-white text-center">
                <span className="font-bold flex items-center justify-center gap-2"><Crown className="w-5 h-5" /> Leyenda Más Emblemática <Crown className="w-5 h-5" /></span>
              </div>
              <CardContent className="p-6 text-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Avatar className="w-24 h-24 mx-auto border-4 border-yellow-400 shadow-lg mb-3">
                    <AvatarImage src={topUser.avatar || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-4xl font-bold">{topUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{topUser.name}</h3>
                <p className="text-sm text-gray-500 mb-3">Nivel {topUser.level} • {topUser.xp.toLocaleString()} XP</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Flame className="w-3 h-3 mr-1" />{topUser.totalLegendaryCount} logros legendarios</Badge>
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200"><Calendar className="w-3 h-3 mr-1" />Desde {formatDate(topUser.firstLegendaryAt)}</Badge>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {topUser.achievements.map((ach) => (
                    <div key={ach.key} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium", ACHIEVEMENT_BG[ach.key] || 'bg-gray-50 border-gray-200')}>
                      <span>{ach.icon}</span><span>{ach.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-6 py-4 text-white">
              <div className="flex items-center gap-2"><Trophy className="w-5 h-5" /><h2 className="font-bold text-lg">Hall of Fame — Ranking Legendario</h2></div>
            </div>
            <div className="divide-y divide-gray-50">
              {!data?.hallOfFame || data.hallOfFame.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="text-7xl mb-4 grayscale opacity-50">🏛️</div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">Sé el primero en entrar al Hall of Fame</h4>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">Desbloquea un logro legendario para ganar tu lugar entre las leyendas de la plataforma</p>
                  <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg">
                    <Sparkles className="w-4 h-4" /> Crear Cuenta Gratis
                  </Link>
                </div>
              ) : (
                data.hallOfFame.map((entry, index) => {
                  const isExpanded = expandedUser === entry.userId;
                  return (
                    <motion.div key={entry.userId} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(0.5 + index * 0.05, 1.5) }}>
                      <div className={cn("px-6 py-4 flex items-center gap-4 transition-all cursor-pointer hover:bg-gray-50/50", getRankBg(entry.rank))} onClick={() => setExpandedUser(isExpanded ? null : entry.userId)}>
                        <div className="w-12 flex justify-center">{getRankIcon(entry.rank)}</div>
                        <Avatar className={cn("border-2", entry.rank === 1 ? "w-14 h-14 border-yellow-400 shadow-md" : "w-11 h-11 border-white")}>
                          <AvatarImage src={entry.avatar || ''} />
                          <AvatarFallback className={cn("text-white font-bold", entry.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-lg" : "bg-gradient-to-br from-amber-400 to-orange-500")}>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-semibold truncate", entry.rank === 1 ? "text-amber-800 text-lg" : "text-gray-800")}>{entry.name}</span>
                            {entry.rank === 1 && <Badge className="bg-yellow-100 text-yellow-700 text-xs border-yellow-200">👑 #1</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />Nivel {entry.level}</span>
                            <span>•</span><span>{entry.xp.toLocaleString()} XP</span>
                            <span>•</span><span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{entry.totalLegendaryCount} logro{entry.totalLegendaryCount > 1 ? 's' : ''}</span>
                            <span>•</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(entry.firstLegendaryAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">{entry.achievements.map((ach) => <span key={ach.key} className="text-sm" title={ach.title}>{ach.icon}</span>)}</div>
                        </div>
                        <div className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</div>
                      </div>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-50 border-t border-gray-100">
                          <div className="px-6 py-4 ml-16">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">Logros Legendarios Desbloqueados</h4>
                            <div className="grid gap-2">
                              {entry.achievements.map((ach) => (
                                <div key={ach.key} className={cn("flex items-center justify-between p-3 rounded-xl border", ACHIEVEMENT_BG[ach.key] || 'bg-gray-50 border-gray-200')}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{ach.icon}</span>
                                    <div><div className="font-semibold text-sm text-gray-800">{ach.title}</div><div className="text-xs text-gray-500">{ach.description}</div></div>
                                  </div>
                                  <div className="text-right"><div className="text-xs text-gray-400">{formatDateTime(ach.unlockedAt)}</div><div className="text-xs font-semibold text-purple-600">+{ach.xpReward} XP</div></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-50 text-center border-t border-amber-100">
              <p className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />Ordenados por número de logros legendarios — los más legendarios quedan arriba<Sparkles className="w-3 h-3" />
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Achievement Legend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
          <Card className="p-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" />Leyenda de Logros Legendarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data?.legendaryAchievements?.map((ach) => (
                <div key={ach.key} className={cn("flex items-center gap-3 p-3 rounded-xl border", ACHIEVEMENT_BG[ach.key] || 'bg-gray-50 border-gray-200')}>
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-gray-800">{ach.title}</div><div className="text-xs text-gray-500 truncate">{ach.description}</div></div>
                  <div className="text-sm font-bold text-purple-600">+{ach.xpReward}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Quieres unirte a las leyendas?</h3>
            <p className="text-gray-500 mb-4">Comienza a aprender hoy y desbloquea logros legendarios para entrar en el Hall of Fame</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg">
              Empezar Gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

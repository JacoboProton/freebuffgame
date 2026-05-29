'use client';

import { useEffect, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ShoppingBag, User, BookOpen, Zap, Target, Flame, TrendingUp, Award, Gamepad2, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress';
import { useUserStore, calculateLevel, xpToNextLevel, progressToNextLevel } from '@/stores/user-store';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { AdminAccessModal } from '@/components/admin-access-modal';

// Separate component for payment success handling (requires Suspense for useSearchParams)
function PaymentSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess } = useToast();
  const { fetchStats } = useUserStore();

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const coursePurchased = searchParams.get('course_purchased');
    
    if (paymentStatus === 'success' && coursePurchased) {
      showSuccess(
        '¡Compra exitosa! 🎉',
        'Ahora tienes acceso completo al curso.'
      );
      router.replace('/dashboard');
      fetchStats();
    } else if (paymentStatus === 'cancelled') {
      // Just clean the URL, no toast needed for cancellation
      router.replace('/dashboard');
    }
  }, [searchParams, router, showSuccess, fetchStats]);

  return null;
}

// Progress Ring Component
function ProgressRing({ progress, size = 120, strokeWidth = 10 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// Daily Goal Card Component
function DailyGoalCard({ goal }: { goal: any }) {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 transition-all ${
        goal.completed 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-100 bg-white hover:border-primary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          goal.completed ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'
        }`}>
          {goal.type === 'xp' && <Zap className="w-5 h-5" />}
          {goal.type === 'lessons' && <BookOpen className="w-5 h-5" />}
          {goal.type === 'streak' && <Flame className="w-5 h-5" />}
          {goal.type === 'games' && <Target className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{goal.title}</h4>
            {goal.completed && (
              <Badge variant="success" className="text-xs">Completado</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">{goal.description}</p>
          <div className="flex items-center gap-2">
            <ProgressBar value={progress} className="flex-1 h-2" />
            <span className="text-xs font-medium text-gray-600">
              {goal.current}/{goal.target}
            </span>
          </div>
          {!goal.completed && (
            <p className="text-xs text-primary mt-1">+{goal.xpReward} XP</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Streak Flame Component
function StreakFlame({ streak, isToday }: { streak: number; isToday: boolean }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={isToday ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: isToday ? Infinity : 0, duration: 2 }}
      className="flex items-center gap-2"
    >
      <div className={`relative ${streak >= 7 ? 'drop-shadow-lg' : ''}`}>
        <Flame className={`w-8 h-8 ${streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
        {streak >= 7 && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -inset-1 bg-orange-400 rounded-full blur-md -z-10"
          />
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-orange-500">{streak}</span>
        <span className="text-sm text-gray-500 ml-1">días</span>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { stats, dailyGoals, fetchStats, fetchDailyGoals, isLoading } = useUserStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (stats) {
      fetchDailyGoals();
    }
  }, [stats, fetchDailyGoals]);

  const handleUserMode = () => {
    // Normal user mode - close modal and stay on dashboard
  };

  const handleAdminMode = () => {
    // Admin mode - go to admin dashboard
    router.push('/dashboard/admin');
  };

  const level = stats ? calculateLevel(stats.xp) : 1;
  const xpProgress = stats ? progressToNextLevel(stats.xp) : 0;
  const nextLevelXP = stats ? xpToNextLevel(stats.xp) : 500;
  const currentXP = stats ? stats.xp % 500 : 0;

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-500">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  const completedGoals = dailyGoals.filter(g => g.completed).length;
  const totalGoalsXP = dailyGoals.reduce((acc, g) => acc + (g.completed ? g.xpReward : 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Access Modal */}
      <AdminAccessModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onUserMode={handleUserMode}
        onAdminMode={handleAdminMode}
      />

      {/* Stripe payment success handler - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <PaymentSuccessHandler />
      </Suspense>

      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-2xl">🐐</span>
              </div>
              <span className="font-bold text-xl">Duobi-Jac</span>
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                {stats?.coins || 0} monedas
              </Badge>
              <Link href={`/dashboard/profile/${user?.name?.toLowerCase() || 'profile'}`}>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user?.name || 'Mi Perfil'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminModal(true)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            ¡Bienvenido de nuevo, {user?.name || 'Aprendiz'}! 🎉
          </h1>
          <p className="text-gray-500">Continúa tu viaje de aprendizaje</p>
        </motion.div>

        {/* Daily Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Metas Diarias</h2>
              <Badge variant="secondary">{completedGoals}/{dailyGoals.length} completadas</Badge>
            </div>
            {totalGoalsXP > 0 && (
              <Badge variant="success" className="gap-1">
                <Zap className="w-4 h-4" />+{totalGoalsXP} XP hoy
              </Badge>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyGoals.map((goal) => (
              <DailyGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </motion.div>

        {/* Stats Grid with Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          {/* Level with Progress Ring */}
          <Card className="md:col-span-2 flex items-center gap-6 p-6">
            <ProgressRing progress={xpProgress} size={100} strokeWidth={8} />
            <div>
              <div className="text-4xl font-bold text-primary mb-1">Nivel {level}</div>
              <p className="text-sm text-gray-500 mb-2">
                {currentXP} / 500 XP para el siguiente nivel
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">
                  {nextLevelXP} XP restante
                </span>
              </div>
            </div>
          </Card>

          {/* Streak */}
          <Card className="p-6">
            <div className="text-sm text-gray-500 mb-2">Racha Actual</div>
            <StreakFlame streak={stats?.currentStreak ?? 0} isToday={(stats?.currentStreak ?? 0) > 0} />
            {(stats?.longestStreak ?? 0) > (stats?.currentStreak ?? 0) && (
              <p className="text-xs text-gray-400 mt-2">
                Récord: {stats?.longestStreak} días 🔥
              </p>
            )}
          </Card>

          {/* Coins */}
          <Card className="p-6">
            <div className="text-sm text-gray-500 mb-2">Monedas</div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-yellow-500">{stats?.coins || 0}</span>
              <span className="text-2xl">🪙</span>
            </div>
          </Card>
        </motion.div>

        {/* XP Progress Bar - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Progreso de XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-2">
                <span className="font-semibold text-lg">{stats?.xp || 0} XP</span>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-gray-500">{500} XP</span>
              </div>
              <p className="text-sm text-gray-500">
                {nextLevelXP} XP para subir al nivel {level + 1}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions + Stats Summary */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continuar Aprendiendo
                  </Button>
                </Link>
                <Link href="/dashboard/leaderboard" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Leaderboard
                  </Button>
                </Link>
                <Link href="/dashboard/notifications" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Historial de notificaciones
                  </Button>
                </Link>
                <Link href="/games" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Jugar Minijuegos
                  </Button>
                </Link>
                <Link href="/dashboard/shop" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Tienda de recompensas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Tu Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium">Lecciones completadas</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{stats?.lessonsCompleted || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="font-medium">Logros obtenidos</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{stats?.achievementsUnlocked || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-medium">Cursos completados</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{stats?.completedCourses || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
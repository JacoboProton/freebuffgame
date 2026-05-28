'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Trophy, BookOpen, Calendar, Zap, Shield, Star, Flame, Target, TrendingUp, Award, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { userAPI, achievementsAPI, coursesAPI, fetchAPI } from '@/lib/api-client';
import { useUserStore, calculateLevel, xpToNextLevel, progressToNextLevel } from '@/stores/user-store';
import { ConfettiCelebration } from '@/components/jac-mascot';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  lessonsCompleted: number;
  totalTimeSpent: number;
  enrolledCourses: number;
  completedCourses: number;
}

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: string | null;
}

interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  startedAt: string;
}

interface ActivityEntry {
  id: string;
  type: 'lesson_completed' | 'course_enrolled' | 'achievement_unlocked' | 'streak_milestone' | 'level_up';
  title: string;
  description: string;
  timestamp: string;
  xpEarned?: number;
  icon: string;
}

const activityTypeConfig = {
  lesson_completed: { icon: '📚', color: 'bg-blue-100 text-blue-700' },
  course_enrolled: { icon: '🎓', color: 'bg-purple-100 text-purple-700' },
  achievement_unlocked: { icon: '🏆', color: 'bg-yellow-100 text-yellow-700' },
  streak_milestone: { icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  level_up: { icon: '⬆️', color: 'bg-green-100 text-green-700' },
};

export default function ProfilePage() {
  const params = useParams();
  const { user: clerkUser, isSignedIn } = useUser();
  const { stats, fetchStats } = useUserStore();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);

  const isOwnProfile = params.username?.toString().toLowerCase() === clerkUser?.username?.toLowerCase() ||
                       params.username?.toString().toLowerCase() === 'me';

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Load user stats
      const statsResponse = await userAPI.getStats();
      const statsData = statsResponse.stats;
      
      setProfile({
        id: statsData.id,
        name: statsData.name || clerkUser?.fullName || 'Usuario',
        email: statsData.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '',
        avatar: statsData.avatar,
        level: statsData.level || calculateLevel(statsData.xp),
        xp: statsData.xp || 0,
        coins: statsData.coins || 0,
        currentStreak: statsData.currentStreak || 0,
        longestStreak: statsData.longestStreak || 0,
        createdAt: statsData.memberSince || statsData.createdAt || new Date().toISOString(),
        lessonsCompleted: statsData.lessonsCompleted || 0,
        totalTimeSpent: statsData.totalTimeSpent || 0,
        enrolledCourses: statsData.enrolledCourses || 0,
        completedCourses: statsData.completedCourses || 0,
      });

      // Load achievements
      try {
        const achievementsResponse = await achievementsAPI.getAll();
        setAchievements(achievementsResponse.achievements || []);
      } catch (err) {
        console.error('Error loading achievements:', err);
      }

      // Load enrolled courses
      try {
        const enrollmentsResponse = await coursesAPI.getEnrollments();
        setEnrollments(enrollmentsResponse.enrollments || []);
      } catch (err) {
        console.error('Error loading enrollments:', err);
      }

      // Generate demo activity for now (in real app, this would come from API)
      setRecentActivity([
        { id: '1', type: 'level_up', title: 'Subiste a nivel ' + (statsData.level || 1), description: '¡Sigue así!', timestamp: new Date().toISOString(), icon: '⬆️' },
        { id: '2', type: 'lesson_completed', title: 'Completaste una lección', description: '+20 XP', timestamp: new Date(Date.now() - 86400000).toISOString(), xpEarned: 20, icon: '📚' },
        { id: '3', type: 'streak_milestone', title: 'Racha de 5 días', description: '¡Impresionante!', timestamp: new Date(Date.now() - 172800000).toISOString(), icon: '🔥' },
      ]);

    } catch (err) {
      console.error('Error loading profile:', err);
      // Demo data fallback
      setProfile({
        id: 'demo',
        name: clerkUser?.fullName || 'Usuario Demo',
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || 'demo@example.com',
        avatar: clerkUser?.imageUrl,
        level: 12,
        xp: 2450,
        coins: 1250,
        currentStreak: 7,
        longestStreak: 14,
        createdAt: '2024-01-15',
        lessonsCompleted: 42,
        totalTimeSpent: 3600,
        enrolledCourses: 5,
        completedCourses: 2,
      });
      setAchievements([
        { id: '1', key: 'first-course', title: 'Primer Curso', description: 'Completaste tu primer curso', icon: '🎓', xpReward: 50, unlockedAt: '2024-01-20' },
        { id: '2', key: 'streak-7', title: 'Racha de 7 días', description: '7 días consecutivos de aprendizaje', icon: '🔥', xpReward: 30, unlockedAt: '2024-02-01' },
        { id: '3', key: 'first-lesson', title: 'Primera Lección', description: 'Completaste tu primera lección', icon: '📖', xpReward: 10, unlockedAt: '2024-01-15' },
        { id: '4', key: 'social-butterfly', title: 'Mariposa Social', description: 'Conecta con 5 estudiantes', icon: '🦋', xpReward: 40, unlockedAt: null },
        { id: '5', key: 'night-owl', title: 'Noctámbulo', description: 'Estudia después de medianoche', icon: '🦉', xpReward: 20, unlockedAt: '2024-02-10' },
        { id: '6', key: 'perfectionist', title: 'Perfeccionista', description: '100% en un quiz', icon: '💯', xpReward: 50, unlockedAt: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Usuario no encontrado</h2>
          <p className="text-gray-500 mb-4">No pudimos cargar el perfil de este usuario.</p>
          <Link href="/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const level = calculateLevel(profile.xp);
  const xpInLevel = profile.xp % 500;
  const xpProgress = progressToNextLevel(profile.xp);
  const xpNeeded = xpToNextLevel(profile.xp);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="min-h-screen bg-background">
      <ConfettiCelebration show={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al Dashboard</span>
            </Link>
            {isOwnProfile && (
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-accent-mint" />
            <CardContent className="p-6 -mt-16">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar with level badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Avatar className="w-32 h-32 text-5xl border-4 border-white shadow-lg">
                    <AvatarImage src={profile.avatar || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent-mint text-white text-5xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                    {level}
                  </div>
                </motion.div>
                
                {/* User Info */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                  <p className="text-gray-500 text-sm mb-3">
                    Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </p>
                  
                  {/* Level Progress */}
                  <div className="max-w-xs mx-auto md:mx-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">Nivel {level}</span>
                      <span className="text-gray-500">{xpNeeded} XP para nivel {level + 1}</span>
                    </div>
                    <ProgressBar value={xpProgress} className="h-2" />
                  </div>
                </div>

                {/* Coins Badge */}
                {isOwnProfile && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center gap-1 bg-gradient-to-br from-yellow-100 to-amber-100 px-6 py-4 rounded-2xl border border-yellow-200"
                  >
                    <div className="flex items-center gap-2 text-amber-600">
                      <Zap className="w-6 h-6" />
                      <span className="text-2xl font-bold">{profile.coins.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">Monedas</span>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card hoverable className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{level}</div>
            <div className="text-sm text-gray-500">Nivel</div>
          </Card>
          <Card hoverable className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{profile.completedCourses}/{profile.enrolledCourses}</div>
            <div className="text-sm text-gray-500">Cursos</div>
          </Card>
          <Card hoverable className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{unlockedAchievements}/{achievements.length}</div>
            <div className="text-sm text-gray-500">Logros</div>
          </Card>
          <Card hoverable className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{profile.currentStreak}</div>
            <div className="text-sm text-gray-500">Racha 🔥</div>
          </Card>
        </motion.div>

        {/* Detailed Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-4 mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-lg font-bold">{profile.xp.toLocaleString()} XP</div>
                <div className="text-xs text-gray-500">Total acumulado</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(profile.totalTimeSpent / 60)}h</div>
                <div className="text-xs text-gray-500">Tiempo de estudio</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-lg font-bold">{profile.longestStreak} días</div>
                <div className="text-xs text-gray-500">Mejor racha</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="w-4 h-4" />
                Logros
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Actividad
              </TabsTrigger>
            </TabsList>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => {
                  const unlocked = !!achievement.unlockedAt;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={cn(
                        "text-center p-4 transition-all duration-300",
                        !unlocked && "opacity-50 grayscale"
                      )}>
                        <CardContent className="p-0">
                          <div className={cn(
                            "text-5xl mb-3 transition-transform duration-300",
                            unlocked && "hover:scale-110"
                          )}>
                            {achievement.icon}
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{achievement.description}</p>
                          {unlocked ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {new Date(achievement.unlockedAt!).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              🔒 Bloqueado
                            </Badge>
                          )}
                          {unlocked && (
                            <div className="mt-2 text-xs text-yellow-600 font-medium flex items-center justify-center gap-1">
                              <Star className="w-3 h-3" />
                              +{achievement.xpReward} XP
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-4">
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay cursos enrollados</h3>
                    <p className="text-gray-500 mb-4">¡Explora cursos y comienza tu aprendizaje!</p>
                    <Link href="/courses">
                      <Button>Explorar Cursos</Button>
                    </Link>
                  </div>
                ) : (
                  enrollments.map((enrollment) => (
                    <motion.div
                      key={enrollment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card hoverable className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{enrollment.title}</h3>
                            <p className="text-sm text-gray-500">
                              {enrollment.completedLessons}/{enrollment.totalLessons} lecciones completadas
                            </p>
                          </div>
                          <Badge variant={enrollment.progress === 100 ? 'success' : 'secondary'}>
                            {enrollment.progress}%
                          </Badge>
                        </div>
                        <ProgressBar value={enrollment.progress} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Iniciado {new Date(enrollment.startedAt).toLocaleDateString('es-ES')}
                          </span>
                          <Link href={`/learn/${enrollment.courseId}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              {enrollment.progress === 100 ? 'Revisar' : 'Continuar'}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4">
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin actividad reciente</h3>
                    <p className="text-gray-500">¡Completa lecciones para ver tu actividad aquí!</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => {
                    const config = activityTypeConfig[activity.type] || activityTypeConfig.lesson_completed;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border"
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", config.color)}>
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div className="text-right">
                          {activity.xpEarned && (
                            <span className="text-sm font-medium text-yellow-500">+{activity.xpEarned} XP</span>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

// cn is imported from @/lib/utils
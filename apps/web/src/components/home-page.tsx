'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Users, BookOpen, ChevronRight, Flame, Star, TrendingUp, ArrowRight, Target, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { useUserStore, calculateLevel, xpToNextLevel, progressToNextLevel } from '@/stores/user-store';
import { coursesAPI } from '@/lib/api-client';
import { SplineScene } from '@/components/visual/SplineScene';

interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  lessonsCount: number;
  studentsCount: number;
  progress?: number;
}

const categoryIcons: Record<string, string> = {
  Programacion: '💻',
  Idiomas: '🗣️',
  'IA & Tech': '🤖',
  Finanzas: '💰',
  Cocina: '🍳',
  default: '📚',
};

const difficultyColors = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced: 'bg-rose-50 text-rose-700 border-rose-200',
};

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function HomePage() {
  const { user, isSignedIn } = useUser();
  const { stats, fetchStats } = useUserStore();
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const coursesResponse = await coursesAPI.getAll();
      const courses = (coursesResponse.courses || []).slice(0, 4).map((c: any) => ({
        ...c,
        lessonsCount: c.lessonsCount || 0,
        studentsCount: c.studentsCount || 0,
      }));
      setFeaturedCourses(courses);
    } catch {
      setFeaturedCourses([
        { id: '1', title: 'Fundamentos de IA', description: 'Aprende los conceptos básicos de la IA.', category: 'IA & Tech', difficulty: 'beginner', estimatedHours: 8, lessonsCount: 15, studentsCount: 1234 },
        { id: '2', title: 'Python para Todos', description: 'Desde cero hasta programar en Python.', category: 'Programacion', difficulty: 'beginner', estimatedHours: 15, lessonsCount: 25, studentsCount: 3421 },
        { id: '3', title: 'Inglés para Principiantes', description: 'Domina las bases del inglés.', category: 'Idiomas', difficulty: 'beginner', estimatedHours: 12, lessonsCount: 20, studentsCount: 2341 },
        { id: '4', title: 'Finanzas Personales', description: 'Gestiona tu dinero e inversiones.', category: 'Finanzas', difficulty: 'beginner', estimatedHours: 6, lessonsCount: 12, studentsCount: 892 },
      ]);
    } finally {
      setLoadingCourses(false);
    }
    if (isSignedIn) fetchStats();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const level = stats ? calculateLevel(stats.xp) : 1;
  const xpProgress = stats ? progressToNextLevel(stats.xp) : 0;
  const xpNeeded = stats ? xpToNextLevel(stats.xp) : 500;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-secondary/6 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-amber-500/4 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="secondary" className="border border-primary/20 gap-1.5 px-3 py-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Plataforma de aprendizaje
                </Badge>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight">
                Aprende con{' '}
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  propósito
                </span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                Cursos interactivos, gamificación y progreso tangible.
                Conviértete en la mejor versión de ti mismo.
              </p>

              {/* User stats if signed in */}
              <AnimatePresence>
                {isSignedIn && stats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-gray-800">
                            {user?.firstName || user?.fullName || 'Aprendiz'}
                          </span>
                          <span className="text-xs text-gray-400">{xpNeeded} XP → nivel {level + 1}</span>
                        </div>
                        <ProgressBar value={xpProgress} className="h-1.5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-1.5 text-orange-500">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{stats.currentStreak}</span>
                        <span className="text-xs text-gray-400">racha</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{stats.xp}</span>
                        <span className="text-xs text-gray-400">XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold">{stats.achievementsUnlocked}</span>
                        <span className="text-xs text-gray-400">logros</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-3">
                <Link href="/courses">
                  <Button size="lg" className="gap-2 group shadow-sm">
                    Explorar Cursos
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary">Mi Dashboard</Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="lg" variant="outline">Crear Cuenta Gratis</Button>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Hero visual — 3D Spline scene placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-8 bg-gradient-to-br from-primary/20 via-emerald-400/10 to-secondary/15 rounded-full blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 shadow-sm"><SplineScene className="w-full aspect-square" />
                  {/* Fallback abstract visualization */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary/30 to-emerald-500/20 rounded-3xl rotate-12 blur-[1px]" />
                      <div className="absolute inset-0 w-32 h-32 bg-gradient-to-tl from-secondary/20 to-primary/30 rounded-3xl -rotate-6 flex items-center justify-center">
                        <Target className="w-10 h-10 text-primary/40" />
                      </div>
                    </div>
                  </div>
                </div>
                {isSignedIn && stats && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                    className="absolute -top-3 -right-3 bg-gradient-to-br from-primary to-emerald-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg"
                  >
                    <div className="text-center">
                      <div className="text-lg leading-none">{level}</div>
                      <div className="text-[8px] opacity-80 tracking-wider">NIVEL</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Cursos Destacados</h2>
              <p className="text-gray-400">Los más populares de esta semana</p>
            </div>
            <Link href="/courses" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-0 overflow-hidden">
                  <div className="h-32 bg-gray-100 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/learn/${course.id}`}>
                    <Card hoverable className="p-0 overflow-hidden h-full flex flex-col group border border-gray-100">
                      <div className="h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                        <span className="text-4xl opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300">
                          {categoryIcons[course.category] || categoryIcons.default}
                        </span>
                        {course.progress !== undefined && course.progress > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="success" className="text-xs">{course.progress}%</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2 flex-1">{course.description}</p>
                        <div className="flex items-center gap-2 mt-auto">
                          <Badge className={`text-[10px] ${difficultyColors[course.difficulty]}`}>
                            {difficultyLabels[course.difficulty]}
                          </Badge>
                          <span className="text-[10px] text-gray-300 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />{course.lessonsCount}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Estudiantes', icon: Users },
              { value: '200+', label: 'Lecciones', icon: BookOpen },
              { value: '15', label: 'Categorías', icon: TrendingUp },
              { value: '95%', label: 'Satisfacción', icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-3">¿Por qué Duobi-Jac?</h2>
            <p className="text-gray-400 max-w-md mx-auto">Diseñado para que aprendas de forma efectiva y disfrutes el proceso.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'XP y Niveles',
                description: 'Gana experiencia con cada lección y sube de nivel. Cada acción tiene un impacto medible.',
                color: 'from-amber-500/10 to-amber-500/5',
                iconColor: 'text-amber-500',
                stat: isSignedIn && stats ? `${stats.xp} XP acumulados` : null,
              },
              {
                icon: Trophy,
                title: 'Logros',
                description: 'Desbloquea achievements al completar metas. Colecciónalos y demuestra tu progreso.',
                color: 'from-primary/10 to-primary/5',
                iconColor: 'text-primary',
                stat: null,
              },
              {
                icon: Flame,
                title: 'Racha Diaria',
                description: 'Mantén tu racha para multiplicar recompensas. La constancia es la clave del dominio.',
                color: 'from-rose-500/10 to-rose-500/5',
                iconColor: 'text-rose-500',
                stat: isSignedIn && stats && stats.currentStreak > 0 ? `${stats.currentStreak} días activos` : null,
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hoverable className="p-6 h-full border border-gray-100">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  {feature.stat && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xs font-medium text-gray-500">{feature.stat}</span>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 text-center"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Únete a miles de estudiantes construyendo nuevas habilidades cada día.
              </p>
              {!isSignedIn && (
                <Link href="/register">
                  <Button size="lg" className="gap-2 bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
                    Comenzar Gratis
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Users, BookOpen, Gamepad2, ShoppingBag, ChevronRight, Flame, Star, TrendingUp } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { useUserStore, calculateLevel, xpToNextLevel, progressToNextLevel } from '@/stores/user-store';
import { coursesAPI } from '@/lib/api-client';
import { JacMascot } from '@/components/jac-mascot';

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

const categoryEmojis: Record<string, string> = {
  'Programacion': '💻',
  'Idiomas': '🗣️',
  'IA & Tech': '🤖',
  'Finanzas': '💰',
  'Cocina': '🍳',
  'default': '📚',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

export function HomePage() {
  const { user, isSignedIn } = useUser();
  const { stats, fetchStats, isLoading: statsLoading } = useUserStore();
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load featured courses from API
      const coursesResponse = await coursesAPI.getAll();
      const courses = (coursesResponse.courses || []).slice(0, 4).map((c: any) => ({
        ...c,
        lessonsCount: c.lessonsCount || 0,
        studentsCount: c.studentsCount || 0,
      }));
      setFeaturedCourses(courses);
    } catch (err) {
      console.error('Error loading courses:', err);
      // Fallback demo courses
      setFeaturedCourses([
        { id: '1', title: 'Fundamentos de IA', description: 'Aprende los conceptos básicos de la IA, machine learning y redes neuronales.', category: 'IA & Tech', difficulty: 'beginner', estimatedHours: 8, lessonsCount: 15, studentsCount: 1234 },
        { id: '2', title: 'Python para Todos', description: 'Desde cero hasta programar tus primeros scripts en Python.', category: 'Programacion', difficulty: 'beginner', estimatedHours: 15, lessonsCount: 25, studentsCount: 3421 },
        { id: '3', title: 'Inglés para Principiantes', description: 'Domina las bases del inglés con lecciones interactivas.', category: 'Idiomas', difficulty: 'beginner', estimatedHours: 12, lessonsCount: 20, studentsCount: 2341 },
        { id: '4', title: 'Finanzas Personales', description: 'Aprende a gestionar tu dinero y hacer inversiones.', category: 'Finanzas', difficulty: 'beginner', estimatedHours: 6, lessonsCount: 12, studentsCount: 892 },
      ]);
    } finally {
      setLoadingCourses(false);
    }

    // Load user stats if signed in
    if (isSignedIn) {
      fetchStats();
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🐐</div>
      </div>
    );
  }

  const level = stats ? calculateLevel(stats.xp) : 1;
  const xpProgress = stats ? progressToNextLevel(stats.xp) : 0;
  const xpNeeded = stats ? xpToNextLevel(stats.xp) : 500;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-6xl opacity-20"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-20 text-4xl opacity-20"
          >
            🌟
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/4 text-5xl opacity-10"
          >
            🐐
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-4xl">🐐</span>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Aprende con Jac
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Tu cabrito te espera para{' '}
                <span className="text-primary">aprender</span>!
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-lg">
                Conviértete en el mejor version de ti mismo con cursos interactivos, gamificación y tu mascota virtual favorita.
              </p>

              {/* User stats if signed in */}
              <AnimatePresence>
                {isSignedIn && stats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-primary/10"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800">
                            {user?.firstName || user?.fullName || 'Aprendiz'}
                          </span>
                          <span className="text-sm text-gray-500">{xpNeeded} XP para nivel {level + 1}</span>
                        </div>
                        <ProgressBar value={xpProgress} className="h-2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{stats.currentStreak}</span>
                        <span className="text-xs text-gray-500">racha</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{stats.xp}</span>
                        <span className="text-xs text-gray-500">XP</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-green-500">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold">{stats.achievementsUnlocked}</span>
                        <span className="text-xs text-gray-500">logros</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-3">
                <Link href="/courses">
                  <Button size="lg" className="gap-2 group">
                    <BookOpen className="w-5 h-5" />
                    Explorar Cursos
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary" className="gap-2">
                      <Zap className="w-5 h-5" />
                      Mi Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="gap-2">
                      Crear Cuenta Gratis
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Hero mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-9xl"
                >
                  🐐
                </motion.div>
                {isSignedIn && stats && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 -right-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg"
                  >
                    <div className="text-center">
                      <div className="text-lg leading-none">{level}</div>
                      <div className="text-[8px]">NIVEL</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Cursos Destacados</h2>
              <p className="text-gray-500">Los más populares de esta semana</p>
            </div>
            <Link href="/courses" className="flex items-center gap-1 text-primary hover:underline font-medium">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-0 overflow-hidden">
                  <div className="h-32 bg-gray-200 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
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
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/learn/${course.id}`}>
                    <Card hoverable className="p-0 overflow-hidden h-full flex flex-col group">
                      <div className="h-28 bg-gradient-to-br from-primary/20 to-accent-mint/20 flex items-center justify-center relative overflow-hidden">
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {categoryEmojis[course.category] || categoryEmojis.default}
                        </span>
                        {course.progress !== undefined && course.progress > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="success" className="text-xs">
                              {course.progress}% completado
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                          <Badge className={difficultyColors[course.difficulty]}>
                            {course.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessonsCount} lecciones
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
      <section className="py-12 bg-gradient-to-r from-primary/5 to-accent-mint/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white rounded-2xl shadow-md"
            >
              <div className="text-4xl font-bold text-primary mb-1">50K+</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" /> Estudiantes
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white rounded-2xl shadow-md"
            >
              <div className="text-4xl font-bold text-primary mb-1">200+</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4" /> Lecciones
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white rounded-2xl shadow-md"
            >
              <div className="text-4xl font-bold text-primary mb-1">15</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" /> Categorías
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white rounded-2xl shadow-md"
            >
              <div className="text-4xl font-bold text-primary mb-1">95%</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <Star className="w-4 h-4" /> Satisfacción
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">¿Por qué elegir Duobi-Jac?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }}>
              <Card hoverable className="p-6 h-full border-2 border-transparent hover:border-primary/20">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">XP y Niveles</h3>
                <p className="text-gray-500">Gana experiencia con cada lección y sube de nivel. ¡Cada acción cuenta!</p>
                {isSignedIn && stats && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-xl">
                    <div className="text-sm text-primary font-medium">¡Ya tienes {stats.xp} XP!</div>
                  </div>
                )}
              </Card>
            </motion.div>
            <motion.div whileHover={{ y: -5 }}>
              <Card hoverable className="p-6 h-full border-2 border-transparent hover:border-accent-coral/20">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl flex items-center justify-center mb-4">
                  <Trophy className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Logros</h3>
                <p className="text-gray-500">Desbloquea achievements al completar metas. ¡Colecciónalos todos!</p>
              </Card>
            </motion.div>
            <motion.div whileHover={{ y: -5 }}>
              <Card hoverable className="p-6 h-full border-2 border-transparent hover:border-accent-mint/20">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-2xl flex items-center justify-center mb-4">
                  <Flame className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Racha</h3>
                <p className="text-gray-500">Mantén tu racha diaria para multiplicar recompensas. ¡No pierdas el impulso!</p>
                {isSignedIn && stats && stats.currentStreak > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="text-primary font-bold">{stats.currentStreak} días</span>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">¿Listo para empezar tu viaje?</h2>
            <p className="text-lg text-white/80 mb-8">
              Únete a miles de estudiantes que ya están aprendiendo con Duobi-Jac
            </p>
            {!isSignedIn && (
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90">
                  <Zap className="w-5 h-5" />
                  Crear Cuenta Gratis
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
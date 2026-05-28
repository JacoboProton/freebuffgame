'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Users, Clock, TrendingUp, Filter, ChevronRight, CheckCircle2, Play } from 'lucide-react';
import { CoursePaymentModal } from '@/components/course-payment-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { coursesAPI, userAPI, paymentsAPI } from '@/lib/api-client';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/toast';
import { Crown, Lock } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  lessonsCount: number;
  studentsCount: number;
  imageUrl?: string;
  modulesCount?: number;
  isPro?: boolean;
  price?: number;
  requiredLevel?: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  title: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

const categories = ['Todos', 'Programacion', 'Idiomas', 'IA & Tech', 'Finanzas', 'Cocina', 'Oficios', 'Diseño', 'Marketing'];

const categoryEmojis: Record<string, string> = {
  'Programacion': '💻',
  'Idiomas': '🗣️',
  'IA & Tech': '🤖',
  'Finanzas': '💰',
  'Cocina': '🍳',
  'Diseño': '🎨',
  'Marketing': '📈',
  'Oficios': '🔧',
  'default': '📚',
};

const difficultyConfig = {
  beginner: { label: 'Principiante', color: 'bg-green-100 text-green-700 border-green-200', icon: '🌱' },
  intermediate: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🌿' },
  advanced: { label: 'Avanzado', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔥' },
};

const categoryColors: Record<string, string> = {
  'Programacion': 'from-blue-500/20 to-blue-600/10',
  'Idiomas': 'from-purple-500/20 to-purple-600/10',
  'IA & Tech': 'from-cyan-500/20 to-cyan-600/10',
  'Finanzas': 'from-emerald-500/20 to-emerald-600/10',
  'Cocina': 'from-orange-500/20 to-orange-600/10',
  'Diseño': 'from-pink-500/20 to-pink-600/10',
  'Marketing': 'from-amber-500/20 to-amber-600/10',
  'Oficios': 'from-orange-600/20 to-orange-700/10',
  'default': 'from-primary/20 to-primary/10',
};

export default function CoursesPage() {
  const { isSignedIn, user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set<string>());
  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast();

  // Check for payment success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      showSuccessToast('¡Compra realizada con éxito!');
      // Clean URL
      window.history.replaceState({}, '', '/courses');
    }
  }, [showSuccessToast]);

  // Fetch user level from API and purchases
  useEffect(() => {
    if (isSignedIn) {
      loadUserData();
    }
  }, [isSignedIn]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load courses from API
      const coursesResponse = await coursesAPI.getAll();
      // API returns { status, data: { courses } } so we need to extract correctly
      const coursesData = (coursesResponse as any).data?.courses || (coursesResponse as any).courses || [];
      setCourses(coursesData);

      // Load user enrollments if signed in
      if (isSignedIn) {
        try {
          const enrollmentsResponse = await coursesAPI.getEnrollments();
          setEnrollments(enrollmentsResponse.enrollments || []);
        } catch (err) {
          console.error('Error loading enrollments:', err);
        }
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      console.log('API URL being used:', 'http://localhost:3001/api/courses');
      // Demo data fallback
      setCourses([
        { id: '1', title: 'Fundamentos de IA', description: 'Aprende los conceptos básicos de la IA, machine learning y redes neuronales.', category: 'IA & Tech', difficulty: 'beginner', estimatedHours: 8, lessonsCount: 15, studentsCount: 1234 },
        { id: '2', title: 'Python para Todos', description: 'Desde cero hasta programar tus primeros scripts en Python.', category: 'Programacion', difficulty: 'beginner', estimatedHours: 15, lessonsCount: 25, studentsCount: 3421 },
        { id: '3', title: 'Inglés para Principiantes', description: 'Domina las bases del inglés con lecciones interactivas.', category: 'Idiomas', difficulty: 'beginner', estimatedHours: 12, lessonsCount: 20, studentsCount: 2341 },
        { id: '4', title: 'Finanzas Personales', description: 'Aprende a gestionar tu dinero y hacer inversiones.', category: 'Finanzas', difficulty: 'intermediate', estimatedHours: 6, lessonsCount: 12, studentsCount: 892 },
        { id: '5', title: 'Desarrollo Web Moderno', description: 'HTML, CSS, JavaScript y React desde cero.', category: 'Programacion', difficulty: 'intermediate', estimatedHours: 20, lessonsCount: 30, studentsCount: 2100 },
        { id: '6', title: 'Cocina Saludable', description: 'Recetas nutritivas y deliciosas para el día a día.', category: 'Cocina', difficulty: 'beginner', estimatedHours: 5, lessonsCount: 10, studentsCount: 567 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load user level from API and purchased courses
  const loadUserData = async () => {
    try {
      // Get user stats from API (has the real level from database)
      const statsResponse = await userAPI.getStats();
      if (statsResponse.stats?.level) {
        setUserLevel(statsResponse.stats.level);
      }

      // Get purchased PRO courses
      try {
        const purchasesResponse = await paymentsAPI.getPurchases();
        if (purchasesResponse.purchases) {
          const purchasedIds = new Set(purchasesResponse.purchases.map((p: any) => p.courseId));
          setPurchasedCourseIds(purchasedIds);
        }
      } catch (err) {
        console.error('Error loading purchases:', err);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                       c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Todos' || c.category === selectedCategory;
    const matchEnrolled = !showEnrolledOnly || enrollments.some(e => e.courseId === c.id);
    return matchSearch && matchCat && matchEnrolled;
  });

  const getEnrollmentProgress = (courseId: string): number => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };

  const isEnrolled = (courseId: string): boolean => {
    return enrollments.some(e => e.courseId === courseId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl">🐐</span>
              </div>
              <span className="font-bold text-xl">Duobi-Jac</span>
            </Link>
            {isSignedIn && enrollments.length > 0 && (
              <Button 
                variant={showEnrolledOnly ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setShowEnrolledOnly(!showEnrolledOnly)}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Mis Cursos ({enrollments.length})
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {showEnrolledOnly ? 'Mis Cursos' : 'Explorar Cursos'}
          </h1>
          <p className="text-gray-500">
            {showEnrolledOnly 
              ? `Tienes ${enrollments.length} cursos en progreso`
              : 'Descubre contenido de calidad en cualquier tema'
            }
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Buscar cursos..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-12 h-11"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={selectedCategory === cat ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat !== 'Todos' && categoryEmojis[cat] && <span className="mr-1">{categoryEmojis[cat]}</span>}
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-0 overflow-hidden">
                <div className="h-36 bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {showEnrolledOnly ? 'No tienes cursos enrollados' : 'No se encontraron cursos'}
            </h3>
            <p className="text-gray-500 mb-4">
              {showEnrolledOnly 
                ? 'Explora y enrolla en cursos para comenzar tu aprendizaje'
                : 'Intenta con otra búsqueda o categoría'
              }
            </p>
            {showEnrolledOnly ? (
              <Button onClick={() => setShowEnrolledOnly(false)}>
                Ver todos los cursos
              </Button>
            ) : (
              <Button onClick={() => { setSearch(''); setSelectedCategory('Todos'); }}>
                Limpiar filtros
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, index) => {
              const enrolled = isEnrolled(course.id);
              const progress = getEnrollmentProgress(course.id);
              const difficulty = difficultyConfig[course.difficulty] || difficultyConfig.beginner;
              const bgGradient = categoryColors[course.category] || categoryColors.default;
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/learn/${course.id}`}>
                    <Card hoverable className={cn(
                      "p-0 overflow-hidden h-full flex flex-col group transition-all duration-300",
                      enrolled && "ring-2 ring-primary ring-offset-2"
                    )}>
                      {/* Course Image/Gradient */}
                      <div className={cn(
                        "h-36 relative flex items-center justify-center bg-gradient-to-br p-6",
                        bgGradient
                      )}>
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {categoryEmojis[course.category] || categoryEmojis.default}
                        </span>
                        
                        {/* Enrolled badge */}
                        {enrolled && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-primary text-white gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Enrolled
                            </Badge>
                          </div>
                        )}
                        
                        {/* Difficulty and PRO badges */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          {course.isPro && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1 shadow-lg">
                              <Crown className="w-3 h-3" />
                              PRO
                            </Badge>
                          )}
                          {(course.price || 0) > 0 && (
                            <Badge className="bg-emerald-500 text-white gap-1 shadow-lg">
                              ${((course.price || 0) / 100).toFixed(2)}
                            </Badge>
                          )}
                          <Badge className={difficulty.color}>
                            {difficulty.icon} {difficulty.label}
                          </Badge>
                        </div>
                        
                        {/* Continue button for enrolled courses */}
                        {enrolled && progress > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute bottom-3 right-3"
                          >
                            <div className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg">
                              <Play className="w-5 h-5 text-primary fill-primary" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                          {course.description}
                        </p>
                        
                        {/* Progress bar for enrolled courses */}
                        {enrolled && progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progreso</span>
                              <span className="font-medium text-primary">{progress}%</span>
                            </div>
                            <ProgressBar value={progress} variant="success" />
                          </div>
                        )}
                        
                          {/* Price and Purchase button for paid courses that user hasn't purchased */}
                        {(course.price || 0) > 0 && !purchasedCourseIds.has(course.id) && (
                          <div className="mt-3 pt-3 border-t">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedCourse(course);
                                setPaymentModalOpen(true);
                              }}
                              className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <Crown className="w-4 h-4" />
                              Desbloquear ${((course.price || 0) / 100).toFixed(2)}
                            </button>
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.estimatedHours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessonsCount} lecciones
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.studentsCount.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      {/* Payment Modal */}
      <CoursePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        userLevel={userLevel}
        isPurchased={selectedCourse ? purchasedCourseIds.has(selectedCourse.id) : false}
        onSuccess={() => {
          loadData();
          loadUserData(); // Reload to update purchase status
        }}
      />

      {/* Stats Footer */}
        {!loading && filtered.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-accent-mint/5 rounded-2xl"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{courses.length} cursos disponibles</p>
                  <p className="text-sm text-gray-500">de {categories.length - 1} categorías</p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  Ver mi progreso
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
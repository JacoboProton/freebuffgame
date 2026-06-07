'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen, Users, Clock, TrendingUp, ChevronRight, CheckCircle2, Play, Crown, Code, Globe, Brain, DollarSign, ChefHat, Paintbrush, Megaphone, Wrench, Layers } from 'lucide-react';
import { HerramientasIcon, MaterialesIcon, TecnicasIcon, ProyectosIcon, AvanzadasIcon } from '@/components/carpentry-icons';
import { CoursePaymentModal } from '@/components/course-payment-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useClerkAPIs } from '@/lib/clerk-api';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/toast';
import type { ElementType } from 'react';

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
  isPro?: boolean;
  price?: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  title: string;
  progress: number;
}

const categories = ['Todos', 'Programacion', 'Idiomas', 'IA & Tech', 'Finanzas', 'Cocina', 'Oficios', 'Diseño', 'Marketing'];

const categoryConfig: Record<string, { icon: ElementType; color: string }> = {
  'Programacion': { icon: Code, color: 'from-blue-500/10 to-blue-600/5' },
  'Idiomas': { icon: Globe, color: 'from-purple-500/10 to-purple-600/5' },
  'IA & Tech': { icon: Brain, color: 'from-cyan-500/10 to-cyan-600/5' },
  'Finanzas': { icon: DollarSign, color: 'from-emerald-500/10 to-emerald-600/5' },
  'Cocina': { icon: ChefHat, color: 'from-orange-500/10 to-orange-600/5' },
  'Diseño': { icon: Paintbrush, color: 'from-pink-500/10 to-pink-600/5' },
  'Marketing': { icon: Megaphone, color: 'from-amber-500/10 to-amber-600/5' },
  'Oficios': { icon: Wrench, color: 'from-orange-600/10 to-orange-700/5' },
  'default': { icon: Layers, color: 'from-primary/10 to-primary/5' },
};

// Carpentry module icons for course-carpinteria-pro
const carpentryModuleIcons = [
  { icon: HerramientasIcon, label: 'Herramientas' },
  { icon: MaterialesIcon, label: 'Materiales' },
  { icon: TecnicasIcon, label: 'Técnicas' },
  { icon: ProyectosIcon, label: 'Proyectos' },
  { icon: AvanzadasIcon, label: 'Avanzado' },
];

const difficultyConfig = {
  beginner: { label: 'Principiante', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  intermediate: { label: 'Intermedio', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  advanced: { label: 'Avanzado', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

export default function CoursesPage() {
  const { coursesAPI, userAPI, paymentsAPI } = useClerkAPIs();
  const { isSignedIn } = useUser();
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
  const { showSuccess: showSuccessToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      showSuccessToast('¡Compra realizada con éxito!');
      window.history.replaceState({}, '', '/courses');
    }
  }, [showSuccessToast]);

  useEffect(() => { if (isSignedIn) loadUserData(); }, [isSignedIn]);
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const coursesResponse = await coursesAPI.getAll();
      const coursesData = (coursesResponse as any).data?.courses || (coursesResponse as any).courses || [];
      setCourses(coursesData);
      if (isSignedIn) {
        try {
          const enrollmentsResponse = await coursesAPI.getEnrollments();
          setEnrollments(enrollmentsResponse.enrollments || []);
        } catch { /* continue */ }
      }
    } catch {
      setCourses([
        { id: '1', title: 'Fundamentos de IA', description: 'Conceptos básicos de IA y machine learning.', category: 'IA & Tech', difficulty: 'beginner', estimatedHours: 8, lessonsCount: 15, studentsCount: 1234 },
        { id: '2', title: 'Python para Todos', description: 'Desde cero hasta programar en Python.', category: 'Programacion', difficulty: 'beginner', estimatedHours: 15, lessonsCount: 25, studentsCount: 3421 },
        { id: '3', title: 'Inglés para Principiantes', description: 'Domina las bases del inglés.', category: 'Idiomas', difficulty: 'beginner', estimatedHours: 12, lessonsCount: 20, studentsCount: 2341 },
        { id: '4', title: 'Finanzas Personales', description: 'Gestiona tu dinero e inversiones.', category: 'Finanzas', difficulty: 'intermediate', estimatedHours: 6, lessonsCount: 12, studentsCount: 892 },
      ]);
    } finally { setLoading(false); }
  };

  const loadUserData = async () => {
    try {
      const statsResponse = await userAPI.getStats();
      if (statsResponse.stats?.level) setUserLevel(statsResponse.stats.level);
      try {
        const purchasesResponse = await paymentsAPI.getPurchases() as any;
        const purchases = purchasesResponse?.data?.purchases || purchasesResponse?.purchases || [];
        if (purchases.length > 0) setPurchasedCourseIds(new Set<string>(purchases.map((p: any) => p.courseId)));
      } catch { /* continue */ }
    } catch { /* continue */ }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Todos' || c.category === selectedCategory;
    const matchEnrolled = !showEnrolledOnly || enrollments.some(e => e.courseId === c.id);
    return matchSearch && matchCat && matchEnrolled;
  });

  const getEnrollmentProgress = (courseId: string): number => enrollments.find(e => e.courseId === courseId)?.progress || 0;
  const isEnrolled = (courseId: string): boolean => enrollments.some(e => e.courseId === courseId);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Duobi-Jac</span>
          </Link>
          {isSignedIn && enrollments.length > 0 && (
            <Button variant={showEnrolledOnly ? 'primary' : 'ghost'} size="sm" onClick={() => setShowEnrolledOnly(!showEnrolledOnly)} className="gap-2">
              <BookOpen className="w-4 h-4" />Mis Cursos ({enrollments.length})
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {showEnrolledOnly ? 'Mis Cursos' : 'Explorar Cursos'}
          </h1>
          <p className="text-gray-400">
            {showEnrolledOnly ? `Tienes ${enrollments.length} cursos en progreso` : 'Descubre contenido de calidad en cualquier tema'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <Input placeholder="Buscar cursos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-12 h-11 border-gray-200" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'ghost'} size="sm" onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-0 overflow-hidden">
                <div className="h-36 bg-gray-100 animate-pulse" />
                <CardContent className="p-5">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {showEnrolledOnly ? 'No tienes cursos enrollados' : 'No se encontraron cursos'}
            </h3>
            <p className="text-gray-400 mb-6">
              {showEnrolledOnly ? 'Explora y enrolla en cursos para comenzar' : 'Intenta con otra búsqueda o categoría'}
            </p>
            <Button onClick={() => showEnrolledOnly ? setShowEnrolledOnly(false) : (setSearch(''), setSelectedCategory('Todos'))}>
              {showEnrolledOnly ? 'Ver todos los cursos' : 'Limpiar filtros'}
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, index) => {
              const enrolled = isEnrolled(course.id);
              const progress = getEnrollmentProgress(course.id);
              const difficulty = difficultyConfig[course.difficulty] || difficultyConfig.beginner;
              const catConfig = categoryConfig[course.category] || categoryConfig.default;
              const CatIcon = catConfig.icon;

              return (
                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link href={`/learn/${course.id}`}>
                    <Card hoverable className={cn("p-0 overflow-hidden h-full flex flex-col group border border-gray-100 transition-all duration-300", enrolled && "ring-2 ring-primary/20")}>
                      <div className={cn("h-36 relative flex items-center justify-center bg-gradient-to-br p-6", catConfig.color)}>
                        {course.id === 'course-carpinteria-pro' ? (
                          <div className="flex items-center gap-1">
                            {carpentryModuleIcons.map((mod, i) => (
                              <div key={i} className="flex flex-col items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-all duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                                <mod.icon size={28} className="group-hover:scale-110 transition-transform duration-300" />
                                <span className="text-[8px] text-gray-500 font-medium hidden sm:block">{mod.label}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <CatIcon className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                        )}
                        {enrolled && (<div className="absolute top-3 left-3"><Badge className="bg-primary text-white gap-1"><CheckCircle2 className="w-3 h-3" />Enrolled</Badge></div>)}
                        <div className="absolute top-3 right-3 flex gap-2">
                          {course.isPro && (<Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1 shadow-lg"><Crown className="w-3 h-3" />PRO</Badge>)}
                          {(course.price || 0) > 0 && (<Badge className="bg-emerald-500 text-white shadow-lg">${((course.price || 0) / 100).toFixed(2)}</Badge>)}
                          <Badge className={difficulty.color}>{difficulty.label}</Badge>
                        </div>
                        {enrolled && progress > 0 && (<div className="absolute bottom-3 right-3"><div className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg"><Play className="w-5 h-5 text-primary fill-primary" /></div></div>)}
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1 text-gray-900">{course.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
                        {enrolled && progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Progreso</span>
                              <span className="font-medium text-primary">{progress}%</span>
                            </div>
                            <ProgressBar value={progress} variant="success" />
                          </div>
                        )}
                        {(course.price || 0) > 0 && !purchasedCourseIds.has(course.id) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedCourse(course); setPaymentModalOpen(true); }} className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                              <Crown className="w-4 h-4" />Desbloquear ${((course.price || 0) / 100).toFixed(2)}
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-300 pt-3 border-t border-gray-50">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.estimatedHours}h</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessonsCount} lecciones</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.studentsCount.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <CoursePaymentModal isOpen={paymentModalOpen} onClose={() => { setPaymentModalOpen(false); setSelectedCourse(null); }} course={selectedCourse} userLevel={userLevel} isPurchased={selectedCourse ? purchasedCourseIds.has(selectedCourse.id) : false} onSuccess={() => { loadData(); loadUserData(); }} />

        {!loading && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-gray-400" /></div>
                <div>
                  <p className="font-semibold text-gray-900">{courses.length} cursos disponibles</p>
                  <p className="text-sm text-gray-400">de {categories.length - 1} categorías</p>
                </div>
              </div>
              <Link href="/dashboard"><Button variant="ghost" className="gap-2">Ver mi progreso<ChevronRight className="w-4 h-4" /></Button></Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

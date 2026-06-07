'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, BookOpen, ChevronRight, CheckCircle2, Play, Crown, Lock, Layers, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { useClerkAPIs } from '@/lib/clerk-api';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { HerramientasIcon, MaterialesIcon, TecnicasIcon, ProyectosIcon, AvanzadasIcon } from '@/components/carpentry-icons';
import { CourseReviews } from '@/components/course-reviews';

interface Module {
  id: string;
  title: string;
  order: number;
  lessons?: { id: string; title: string; type: string; xpReward: number; order: number }[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  isPro?: boolean;
  price?: number;
  modules?: Module[];
  lessonsCount?: number;
  studentsCount?: number;
}

// Carpentry module icons mapped by order
const carpentryIcons: Record<number, React.FC<{ size?: number; className?: string }>> = {
  1: HerramientasIcon,
  2: MaterialesIcon,
  3: TecnicasIcon,
  4: ProyectosIcon,
  5: AvanzadasIcon,
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Principiante', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  intermediate: { label: 'Intermedio', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  advanced: { label: 'Avanzado', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

const moduleColors = [
  'from-emerald-500/10 to-emerald-600/5',
  'from-amber-500/10 to-amber-600/5',
  'from-blue-500/10 to-blue-600/5',
  'from-purple-500/10 to-purple-600/5',
  'from-rose-500/10 to-rose-600/5',
];

const lessonTypeIcons: Record<string, string> = {
  multiple_choice: '📝',
  true_false: '✅',
  fill_blank: '✏️',
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { coursesAPI } = useClerkAPIs();
  const { isSignedIn } = useUser();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(courseId);
      setCourse(response.course);

      if (isSignedIn) {
        try {
          const enrollmentsResponse = await coursesAPI.getEnrollments();
          const enrollments = enrollmentsResponse.enrollments || [];
          const isEnrolled = enrollments.some((e: any) => e.courseId === courseId);
          setEnrolled(isEnrolled);

          if (isEnrolled) {
            // Fetch current lesson to get progress data including completed lesson IDs
            const currentResponse = await coursesAPI.getCurrentLesson(courseId).catch(() => null) as any;
            if (currentResponse?.completedLessonIds) {
              setCompletedLessonIds(new Set(currentResponse.completedLessonIds));
            }
          }
        } catch { /* continue */ }
      }
    } catch (err: any) {
      setError(err.message || 'Curso no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    try {
      setEnrolling(true);
      setEnrollError(null);
      await coursesAPI.enroll(courseId);
      setEnrolled(true);
    } catch (err: any) {
      setEnrollError(err.message || 'Error al inscribirse');
    } finally {
      setEnrolling(false);
    }
  };

  const isCarpentry = courseId === 'course-carpinteria-pro';
  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
  const completedTotal = completedLessonIds.size;
  const overallProgress = totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Curso no encontrado</h2>
          <p className="text-gray-500 mb-4">{error || 'No pudimos cargar este curso'}</p>
          <Link href="/courses">
            <Button>Volver a Cursos</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const difficulty = difficultyConfig[course.difficulty] || difficultyConfig.beginner;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Cursos</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className={difficulty.color}>{difficulty.label}</Badge>
            {course.isPro && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1"><Crown className="w-3 h-3" />PRO</Badge>}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Course Title & Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-500 text-lg max-w-2xl">{course.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.estimatedHours}h estimadas</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{totalLessons} lecciones</span>
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" />{course.modules?.length || 0} módulos</span>
          </div>

          {/* Overall Progress */}
          {enrolled && totalLessons > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Progreso del Curso</span>
                </div>
                <span className="text-sm font-bold text-primary">{overallProgress}%</span>
              </div>
              <ProgressBar value={overallProgress} variant="success" />
              <p className="text-xs text-gray-400 mt-1.5">{completedTotal} de {totalLessons} lecciones completadas</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 flex items-center gap-4">
            {enrolled ? (
              <Link href={`/learn/${courseId}`}>
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" /> Continuar Curso
                </Button>
              </Link>
            ) : (
              <>
                <Button size="lg" className="gap-2" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Inscribiendo...' : isSignedIn ? 'Inscribirme Gratis' : 'Iniciar para Inscribirme'}
                </Button>
                {enrollError && <span className="text-sm text-rose-500">{enrollError}</span>}
              </>
            )}
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="mb-8">                <h2 className="text-xl font-bold text-gray-900 mb-6">Módulos del Curso</h2>
          <p className="text-sm text-gray-400 mb-6">{course.modules?.length || 0} módulos · {totalLessons} lecciones · {course.estimatedHours}h de contenido</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(course.modules || [])
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((mod, index) => {
                const ModuleIcon = isCarpentry ? carpentryIcons[mod.order] : null;
                const color = moduleColors[index % moduleColors.length];
                const lessonCount = mod.lessons?.length || 0;
                const completedCount = mod.lessons?.filter(l => completedLessonIds.has(l.id)).length || 0;
                const moduleCompleted = lessonCount > 0 && completedCount === lessonCount;
                const moduleCompletedCount = completedCount;
                const moduleProgressPct = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card hoverable className={cn("p-0 overflow-hidden h-full flex flex-col border border-gray-100 transition-all duration-300", enrolled && "hover:shadow-lg")}>
                      {/* Module Header with Icon */}
                      <div className={cn("relative p-5 bg-gradient-to-br flex items-center gap-4", color)}>
                        {ModuleIcon ? (
                          <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                            <ModuleIcon size={32} />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                            <span className="text-2xl font-bold text-gray-400">{mod.order}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Módulo {mod.order}</div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{mod.title}</h3>
                        </div>
                        {enrolled ? (
                          <Badge className={cn(
                            "text-[10px] shrink-0",
                            moduleCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-white/80 text-gray-600"
                          )}>
                            {moduleCompleted ? (
                              <><CheckCircle2 className="w-3 h-3 mr-0.5" />Completado</>
                            ) : (
                              `${moduleCompletedCount}/${lessonCount}`
                            )}
                          </Badge>
                        ) : (
                          <Badge className="bg-white/80 text-gray-600 text-[10px] shrink-0">{lessonCount} lecciones</Badge>
                        )}
                      </div>

                      {/* Lessons List */}
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="space-y-2 flex-1">
                          {/* Module progress bar */}
                          {enrolled && lessonCount > 0 && (
                            <div className="mb-3">
                              <ProgressBar value={moduleProgressPct} variant={moduleCompleted ? 'success' : 'default'} />
                            </div>
                          )}

                          {(mod.lessons || [])
                            .sort((a, b) => a.order - b.order)
                            .slice(0, 5)
                            .map((lesson, li) => {
                              const isCompleted = completedLessonIds.has(lesson.id);
                              return (
                                <div key={lesson.id} className="flex items-center gap-2 text-sm">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <span className="text-xs">{lessonTypeIcons[lesson.type] || '📖'}</span>
                                  )}
                                  <span className={cn("truncate flex-1", isCompleted ? "text-gray-400 line-through" : "text-gray-600")}>{lesson.title}</span>
                                  <span className="text-[10px] text-amber-500 font-medium shrink-0">+{lesson.xpReward} XP</span>
                                </div>
                              );
                            })}
                          {lessonCount > 5 && (
                            <div className="text-xs text-gray-400 text-center pt-1">
                              +{lessonCount - 5} lecciones más
                            </div>
                          )}
                        </div>

                        {/* Module Footer */}
                        {enrolled && (
                          <Link href={`/learn/${courseId}`} className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                            Comenzar módulo <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Course Overview & Instructor Info */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* What you'll learn */}
            <div className="md:col-span-2">
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">¿Qué aprenderás?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Fundamentos y conceptos esenciales',
                    'Técnicas prácticas y ejercicios',
                    'Proyectos reales para tu portafolio',
                    'Mejores prácticas de la industria',
                    'Herramientas y recursos recomendados',
                    'Certificado de completación',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Course Info Card */}
            <div>
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Información del Curso</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duración</span>
                    <span className="font-medium">{course.estimatedHours} horas</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Nivel</span>
                    <Badge className={difficulty.color} variant="secondary">{difficulty.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Módulos</span>
                    <span className="font-medium">{course.modules?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Lecciones</span>
                    <span className="font-medium">{totalLessons}</span>
                  </div>
                  {course.isPro && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Precio</span>
                      <span className="font-bold text-primary">${((course.price || 0) / 100).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">DJ</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Duobi-Jac</p>
                      <p className="text-xs text-gray-400">Instructor</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reseñas del Curso</h2>
          <CourseReviews courseId={courseId} isEnrolled={enrolled} />
        </div>
      </main>
    </div>
  );
}

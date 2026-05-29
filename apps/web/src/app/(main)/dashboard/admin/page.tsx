'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, ChevronRight, ChevronDown, Plus, Edit2, Trash2,
  BarChart3, Crown, TrendingUp, GraduationCap, Trophy, DollarSign,
  Shield, Settings, Bell, CreditCard, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClerkAPI } from '@/lib/clerk-api';
import { CourseModal } from '@/components/admin/course-modal';
import { ModuleModal } from '@/components/admin/module-modal';
import { LessonModal } from '@/components/admin/lesson-modal';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { UserManagement } from '@/components/admin/user-management';
import { Analytics } from '@/components/admin/analytics';
import { ContentModeration } from '@/components/admin/content-moderation';
import { SystemSettings } from '@/components/admin/system-settings';
import { NotificationManagement } from '@/components/admin/notification-management';
import { WebhookTest } from '@/components/admin/webhook-test';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  completionRate: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  currentStreak: number;
  createdAt: string;
  _count: { enrollments: number; achievements: number };
}

interface Module {
  id: string;
  title: string;
  order: number;
  _count: { lessons: number };
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: any;
  xpReward: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  isPublished: boolean;
  isPro?: boolean;
  price?: number;
  requiredLevel?: number;
  modules: Module[];
  _count: { enrollments: number };
}

interface AdminStats {
  stats: DashboardStats;
  recentUsers: { id: string; name: string; email: string; createdAt: string }[];
}

export default function AdminPage() {
  const router = useRouter();
  const { fetchAPI } = useClerkAPI();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Verify admin access from sessionStorage
  useEffect(() => {
    const adminAccess = sessionStorage.getItem('adminAccess');
    if (adminAccess !== 'true') {
      // No admin access - redirect to dashboard
      router.replace('/dashboard');
    }
  }, [router]);

  // Modal states
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<{ courseId: string; module: Module } | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'course' | 'module' | 'lesson'; id: string; name: string } | null>(null);
  
  // Verify admin access AND load data in single effect to prevent flash
  useEffect(() => {
    const adminAccess = sessionStorage.getItem('adminAccess');
    if (adminAccess !== 'true') {
      router.replace('/dashboard');
      return;
    }
    loadAdminData();
  }, [router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const statsData = await fetchAPI<{ stats: DashboardStats }>('/admin/stats');
      setStats(statsData.stats);

      const coursesData = await fetchAPI<{ courses: Course[] }>('/admin/courses');
      setCourses(coursesData.courses);

    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // CRUD Handlers
  const handleOpenCourseModal = (course?: Course) => {
    setEditingCourse(course || null);
    setCourseModalOpen(true);
  };

  const handleOpenModuleModal = (courseId: string, module?: Module) => {
    setSelectedCourseId(courseId);
    setEditingModule(module ? { courseId, module } : null);
    setModuleModalOpen(true);
  };

  const handleOpenLessonModal = async (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId);
    
    if (lesson) {
      // Fetch full lesson data including content
      try {
        const data = await fetchAPI<{ lesson: Lesson }>(`/admin/lessons/${lesson.id}`);
        setEditingLesson({ moduleId, lesson: data.lesson });
      } catch {
        setEditingLesson({ moduleId, lesson });
      }
    } else {
      setEditingLesson(null);
    }
    setLessonModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      let endpoint = '';
      switch (deletingItem.type) {
        case 'course':
          endpoint = `/admin/courses/${deletingItem.id}`;
          break;
        case 'module':
          endpoint = `/admin/modules/${deletingItem.id}`;
          break;
        case 'lesson':
          endpoint = `/admin/lessons/${deletingItem.id}`;
          break;
      }
      
      await fetchAPI(endpoint, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setDeletingItem(null);
      loadAdminData();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-mint rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-gray-500">Gestiona usuarios, cursos y contenido</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-admin-100">Admin</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                // Clear admin session storage
                sessionStorage.removeItem('adminAccess');
                sessionStorage.removeItem('adminToken');
                // Call logout endpoint to clear admin cookie
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin-auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                  });
                } catch (e) {
                  // Ignore errors, just clear local state
                }
                router.push('/dashboard');
              }}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Salir del Modo Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Resumen
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" /> Usuarios
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" /> Cursos
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-2">
              <Shield className="w-4 h-4" /> Moderación
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" /> Notificaciones
            </TabsTrigger>
            <TabsTrigger value="webhook" className="gap-2">
              <CreditCard className="w-4 h-4" /> Webhooks
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-gray-500">Usuarios</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                    <p className="text-sm text-gray-500">Cursos</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalEnrollments || 0}</p>
                    <p className="text-sm text-gray-500">Enrollments</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                    <p className="text-sm text-gray-500">Tasa completación</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* PRO Courses Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {courses.filter(c => c.isPro).length > 0 && (
                <>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{courses.filter(c => c.isPro).length}</p>
                        <p className="text-sm text-gray-500">Cursos PRO</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          ${(courses.filter(c => c.isPro).reduce((sum, c) => sum + (c.price || 0), 0) / 100).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-500">Total precios</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </motion.div>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.totalUsers === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay usuarios registrados</p>
                  ) : (
                    <div className="grid gap-3">
                      {Array.from({ length: Math.min(5, stats?.totalUsers || 0) }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold">{(i + 1).toString()}</span>
                            </div>
                            <div>
                              <p className="font-medium">Usuario #{i + 1}</p>
                              <p className="text-sm text-gray-500">usuario{i + 1}@example.com</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Nuevo</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{courses.length} cursos</p>
              <Button onClick={() => handleOpenCourseModal()}>
                <Plus className="w-4 h-4 mr-1" /> Nuevo Curso
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {courses.map((course) => (
                    <div key={course.id}>
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCourseExpand(course.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            course.isPublished ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <BookOpen className={`w-5 h-5 ${course.isPublished ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{course.title}</p>
                              <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                                {course.difficulty}
                              </Badge>
                              {course.isPro && (
                                <Badge variant="default" className="bg-purple-500">
                                  <Crown className="w-3 h-3 mr-1" /> PRO
                                </Badge>
                              )}
                              {course.isPublished ? (
                                <Badge variant="default" className="bg-green-500">Publicado</Badge>
                              ) : (
                                <Badge variant="secondary">Borrador</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{course.category} • {course.estimatedHours}h</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{course._count.enrollments} estudiantes</span>
                          <span className="text-sm text-gray-500">{course.modules?.length || 0} módulos</span>
                          <Badge variant="secondary">
                            {course.modules?.reduce((acc, m) => acc + (m._count?.lessons || 0), 0) || 0} lecciones
                          </Badge>
                          {expandedCourse === course.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedCourse === course.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-4 pb-4 bg-gray-50"
                        >
                          <div className="space-y-2 pt-2">
                            {course.modules?.map((module, mIndex) => (
                              <div key={module.id} className="bg-white p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">Módulo {mIndex + 1}: {module.title}</p>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModuleModal(course.id, module);
                                      }}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingItem({ type: 'module', id: module.id, name: module.title });
                                        setDeleteConfirmOpen(true);
                                      }}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{module._count?.lessons || 0} lecciones</p>
                                {/* Lessons would be loaded separately if needed */}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4 flex-wrap">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenModuleModal(course.id)}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Añadir módulo
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenCourseModal(course)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" /> Editar curso
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setDeletingItem({ type: 'course', id: course.id, name: course.title });
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Eliminar curso
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <ContentModeration />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhook">
            <WebhookTest />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSuccess={loadAdminData}
        course={editingCourse || undefined}
      />

      <ModuleModal
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        onSuccess={loadAdminData}
        courseId={selectedCourseId}
        module={editingModule?.module}
      />

      <LessonModal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        onSuccess={loadAdminData}
        moduleId={selectedModuleId}
        lesson={editingLesson?.lesson}
      />

      <DeleteConfirm
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        itemName={deletingItem?.name || ''}
        itemType={deletingItem?.type || 'course'}
      />
    </div>
  );
}
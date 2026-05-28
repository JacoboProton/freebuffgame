'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, Trophy, TrendingUp, Search, 
  ChevronRight, ChevronDown, Plus, Edit2, Trash2,
  BarChart3, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAPI } from '@/lib/api-client';

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

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  isPublished: boolean;
  modules: { id: string; title: string; _count: { lessons: number } }[];
  _count: { enrollments: number };
}

interface AdminStats {
  stats: DashboardStats;
  recentUsers: { id: string; name: string; email: string; createdAt: string }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsData = await fetchAPI<{ stats: DashboardStats }>('/admin/stats');
      setStats(statsData.stats);

      // Load users
      const usersData = await fetchAPI<{ users: User[] }>('/admin/users');
      setUsers(usersData.users);

      // Load courses
      const coursesData = await fetchAPI<{ courses: Course[] }>('/admin/courses');
      setCourses(coursesData.courses);

    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

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
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" /> Cursos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats Cards */}
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
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Buscar usuarios por nombre o email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Badge variant="secondary">{filteredUsers.length} usuarios</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-semibold">Usuario</th>
                        <th className="text-left p-4 font-semibold">Nivel</th>
                        <th className="text-left p-4 font-semibold">XP</th>
                        <th className="text-left p-4 font-semibold">Racha</th>
                        <th className="text-left p-4 font-semibold">Cursos</th>
                        <th className="text-left p-4 font-semibold">Logros</th>
                        <th className="text-left p-4 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">Nivel {user.level}</Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-yellow-600 font-medium">{user.xp.toLocaleString()} XP</span>
                          </td>
                          <td className="p-4">
                            <span className="text-orange-500">🔥 {user.currentStreak}</span>
                          </td>
                          <td className="p-4">
                            {user._count.enrollments}
                          </td>
                          <td className="p-4">
                            {user._count.achievements}
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
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
                          <span className="text-sm text-gray-500">{course.modules.length} módulos</span>
                          <Badge variant="secondary">
                            {course.modules.reduce((acc, m) => acc + m._count.lessons, 0)} lecciones
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
                            {course.modules.map((module, mIndex) => (
                              <div key={module.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Módulo {mIndex + 1}: {module.title}</p>
                                  <p className="text-sm text-gray-500">{module._count.lessons} lecciones</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">
                              <Plus className="w-4 h-4 mr-1" /> Añadir módulo
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit2 className="w-4 h-4 mr-1" /> Editar curso
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
        </Tabs>
      </main>
    </div>
  );
}
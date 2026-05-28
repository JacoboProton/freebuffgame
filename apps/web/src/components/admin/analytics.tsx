'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsersLast7Days: number;
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    totalCompletions: number;
    totalLessonsCompleted: number;
    totalAchievementsUnlocked: number;
    totalGameSessions: number;
    completionRate: number;
    activeRate: number;
  };
  revenue: {
    total: number;
    transactions: number;
  };
  userGrowth: Record<string, number>;
  categoryStats: Record<string, { enrollments: number; completions: number }>;
}

const defaultAnalytics: AnalyticsData = {
  overview: {
    totalUsers: 0,
    activeUsersLast7Days: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    totalCompletions: 0,
    totalLessonsCompleted: 0,
    totalAchievementsUnlocked: 0,
    totalGameSessions: 0,
    completionRate: 0,
    activeRate: 0,
  },
  revenue: {
    total: 0,
    transactions: 0,
  },
  userGrowth: {},
  categoryStats: {},
};

export function Analytics() {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetchAPI<{ data: AnalyticsData }>('/admin/analytics'),
  });

  const { data: courseAnalyticsResponse } = useQuery({
    queryKey: ['admin-analytics-courses'],
    queryFn: () => fetchAPI<{ data: { courses: any[] } }>('/admin/analytics/courses'),
  });

  const { data: userAnalyticsResponse } = useQuery({
    queryKey: ['admin-analytics-users'],
    queryFn: () => fetchAPI<{ data: { topUsers: any[] } }>('/admin/analytics/users'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">Cargando análisis...</div>
    );
  }

  const analytics = analyticsResponse?.data || defaultAnalytics;
  const courses = courseAnalyticsResponse?.data?.courses || [];
  const topUsers = userAnalyticsResponse?.data?.topUsers || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Usuarios"
          value={analytics.overview.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Activos (7 días)"
          value={analytics.overview.activeUsersLast7Days}
          icon="🟢"
          color="green"
          subtitle={`${analytics.overview.activeRate}% del total`}
        />
        <StatCard
          title="Cursos"
          value={analytics.overview.totalCourses}
          icon="📚"
          color="purple"
          subtitle={`${analytics.overview.publishedCourses} publicados`}
        />
        <StatCard
          title="Inscripciones"
          value={analytics.overview.totalEnrollments}
          icon="📝"
          color="amber"
          subtitle={`${analytics.overview.completionRate}% completado`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Lecciones"
          value={analytics.overview.totalLessonsCompleted}
          icon="✅"
          color="emerald"
          small
        />
        <StatCard
          title="Logros"
          value={analytics.overview.totalAchievementsUnlocked}
          icon="🏆"
          color="yellow"
          small
        />
        <StatCard
          title="Partidas"
          value={analytics.overview.totalGameSessions}
          icon="🎮"
          color="rose"
          small
        />
        <StatCard
          title="Completados"
          value={analytics.overview.totalCompletions}
          icon="🎓"
          color="cyan"
          small
        />
        <StatCard
          title="Ingresos"
          value={formatCurrency(analytics.revenue.total)}
          icon="💰"
          color="green"
          small
          subtitle={`${analytics.revenue.transactions} transacciones`}
        />
      </div>

      {/* User Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold mb-4">📈 Crecimiento de Usuarios</h3>
        <div className="h-48 flex items-end gap-1">
          {Object.entries(analytics.userGrowth).map(([month, count]) => {
            const maxCount = Math.max(...Object.values(analytics.userGrowth), 1);
            const height = (count / maxCount) * 100;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:from-blue-600 hover:to-blue-400"
                  style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                  title={`${month}: ${count} usuarios`}
                />
                <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left">
                  {month.substring(5)}
                </span>
              </div>
            );
          })}
        </div>
        {Object.keys(analytics.userGrowth).length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay datos de crecimiento aún</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4">📊 Inscripciones por Categoría</h3>
          <div className="space-y-4">
            {Object.entries(analytics.categoryStats).map(([category, stats]) => {
              const total = stats.enrollments;
              const completionRate = total > 0 ? Math.round((stats.completions / total) * 100) : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-gray-500">
                      {total} inscriptos • {stats.completions} completados
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">{completionRate}% tasa de finalización</p>
                </div>
              );
            })}
            {Object.keys(analytics.categoryStats).length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay datos de categorías aún</p>
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4">🏆 Top 10 Usuarios</h3>
          <div className="space-y-3">
            {topUsers.slice(0, 10).map((user: any, index: number) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-400 text-amber-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-500">{user.xp.toLocaleString()} XP</p>
                  <p className="text-xs text-gray-500">Nivel {user.level}</p>
                </div>
              </div>
            ))}
            {topUsers.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay usuarios aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Analytics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold mb-4">📚 Rendimiento de Cursos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Curso</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Inscritos</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Completados</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Tasa</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {courses.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[200px]">{course.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{course.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {course.isPublished ? (
                      <span className="text-green-500">✓ Publicado</span>
                    ) : (
                      <span className="text-gray-400">Borrador</span>
                    )}
                    {course.isPro && (
                      <Badge variant="default" className="ml-2 bg-amber-500">PRO</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium">{course.totalEnrollments}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-green-600">{course.totalCompletions}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{course.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay cursos aún</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
  small,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
  small?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-4 ${small ? '' : 'p-6'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`${small ? 'text-xs' : 'text-sm'} font-medium opacity-80`}>{title}</span>
      </div>
      <p className={`font-bold ${small ? 'text-xl' : 'text-3xl'}`}>
        {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
      </p>
      {subtitle && (
        <p className="text-xs opacity-60 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
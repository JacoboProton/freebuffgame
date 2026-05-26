import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, ShoppingBag, User, BookOpen, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress';

export const metadata: Metadata = { title: 'Dashboard' };

// Demo user stats - in production these would come from the API/store
const userStats = {
  name: 'JacoboProton',
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  coins: 1250,
  streak: 7,
  completedCourses: 4,
  totalAchievements: 15,
  rank: '#42',
};

const recentActivity = [
  { type: 'lesson', text: 'Completó Lección: Introducción a la IA', xp: 20, time: 'hace 2 horas' },
  { type: 'achievement', text: 'Desbloqueó: Primer Curso', xp: 50, time: 'hace 5 horas' },
  { type: 'course', text: 'Inició: Python para Todos', xp: 0, time: 'hace 1 día' },
];

export default function DashboardPage() {
  const xpProgress = (userStats.xp / userStats.xpToNextLevel) * 100;

  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-white shadow-card sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center'>
                <span className='text-2xl'>🐐</span>
              </div>
              <span className='font-bold text-xl'>Duobi-Jac</span>
            </Link>
            <div className='flex items-center gap-4'>
              <Badge variant='secondary' className='gap-1'>
                <Zap className='w-4 h-4 text-yellow-500' />
                {userStats.coins} monedas
              </Badge>
              <Link href='/dashboard/profile/jacoboproton'>
                <Button variant='ghost' size='sm'>
                  <User className='w-4 h-4 mr-2' />
                  {userStats.name}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>¡Bienvenido de vuelta, {userStats.name}! 🎉</h1>
          <p className='text-gray-500'>Continúa tu viaje de aprendizaje</p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-primary'>{userStats.level}</div>
              <div className='text-sm text-gray-500'>Nivel</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-yellow-500'>{userStats.coins}</div>
              <div className='text-sm text-gray-500'>Monedas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-orange-500'>{userStats.streak} 🔥</div>
              <div className='text-sm text-gray-500'>Racha</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-purple-500'>{userStats.rank}</div>
              <div className='text-sm text-gray-500'>Ranking</div>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='w-5 h-5 text-primary' />
              Progreso de XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4 mb-2'>
              <span className='font-semibold'>{userStats.xp} XP</span>
              <ProgressBar value={xpProgress} className='flex-1' />
              <span className='text-gray-500'>{userStats.xpToNextLevel} XP</span>
            </div>
            <p className='text-sm text-gray-500'>
              {userStats.xpToNextLevel - userStats.xp} XP para subir al nivel {userStats.level + 1}
            </p>
          </CardContent>
        </Card>

        <div className='grid md:grid-cols-2 gap-8'>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='w-5 h-5 text-primary' />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Link href='/courses' className='block'>
                <Button variant='outline' className='w-full justify-start'>
                  <BookOpen className='w-4 h-4 mr-2' />
                  Continuar Aprendiendo
                </Button>
              </Link>
              <Link href='/dashboard/leaderboard' className='block'>
                <Button variant='outline' className='w-full justify-start'>
                  <Trophy className='w-4 h-4 mr-2' />
                  Ver Leaderboard
                </Button>
              </Link>
              <Link href='/dashboard/shop' className='block'>
                <Button variant='outline' className='w-full justify-start'>
                  <ShoppingBag className='w-4 h-4 mr-2' />
                  Tienda de recompensas
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='w-5 h-5 text-primary' />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentActivity.map((activity, index) => (
                  <div key={index} className='flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0'>
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                      {activity.type === 'lesson' && <BookOpen className='w-4 h-4 text-primary' />}
                      {activity.type === 'achievement' && <Trophy className='w-4 h-4 text-yellow-500' />}
                      {activity.type === 'course' && <Target className='w-4 h-4 text-purple-500' />}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm'>{activity.text}</p>
                      <p className='text-xs text-gray-400'>{activity.time}</p>
                    </div>
                    {activity.xp > 0 && (
                      <Badge variant='success' className='text-xs'>+{activity.xp} XP</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Summary */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-8'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
                  <BookOpen className='w-6 h-6 text-green-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>{userStats.completedCourses}</div>
                  <div className='text-sm text-gray-500'>Cursos completados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center'>
                  <Trophy className='w-6 h-6 text-yellow-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>{userStats.totalAchievements}</div>
                  <div className='text-sm text-gray-500'>Logros obtenidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center'>
                  <Zap className='w-6 h-6 text-orange-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>{userStats.xp}</div>
                  <div className='text-sm text-gray-500'>XP Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
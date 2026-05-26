import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Settings, Trophy, BookOpen, Calendar, Zap, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Perfil de ${params.username}` };
}

// Demo user data
const userData = {
  username: 'JacoboProton',
  displayName: 'Jacobo García',
  joinedDate: 'Enero 2024',
  bio: 'Aprendiz apasionado de tecnología y programación. Siempre buscando nuevos conocimientos 🚀',
  location: 'Madrid, España',
  level: 12,
  xp: 2450,
  coins: 1250,
  streak: 7,
  rank: '#42',
  totalCourses: 8,
  completedCourses: 4,
  totalAchievements: 15,
};

const achievements = [
  { id: 'first-course', name: 'Primer Curso', description: 'Completaste tu primer curso', icon: '🎓', unlocked: true, date: 'Ene 2024' },
  { id: 'streak-7', name: 'Racha de 7 días', description: '7 días consecutivos de aprendizaje', icon: '🔥', unlocked: true, date: 'Feb 2024' },
  { id: 'code-master', name: 'Código Maestro', description: '100XP en un día', icon: '💻', unlocked: true, date: 'Mar 2024' },
  { id: 'social-butterfly', name: 'Mariposa Social', description: 'Conecta con 5 estudiantes', icon: '🦋', unlocked: false, date: null },
  { id: 'night-owl', name: 'Noctámbulo', description: 'Estudia después de medianoche', icon: '🦉', unlocked: true, date: 'Abr 2024' },
  { id: 'perfectionist', name: 'Perfeccionista', description: '100% en un quiz', icon: '💯', unlocked: false, date: null },
];

const enrolledCourses = [
  { id: 'python-basics', name: 'Python para Todos', progress: 75, totalLessons: 20, completedLessons: 15 },
  { id: 'web-dev', name: 'Desarrollo Web Moderno', progress: 30, totalLessons: 25, completedLessons: 8 },
  { id: 'ai-intro', name: 'Introducción a la IA', progress: 10, totalLessons: 15, completedLessons: 2 },
];

export default function ProfilePage({ params }: Props) {
  const isOwnProfile = params.username.toLowerCase() === 'jacoboproton';

  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-white shadow-card sticky top-0 z-50'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/dashboard' className='flex items-center gap-2 text-gray-600 hover:text-gray-900'>
              <ArrowLeft className='w-5 h-5' />
              <span className='font-medium'>Volver al Dashboard</span>
            </Link>
            {isOwnProfile && (
              <Button variant='ghost' size='sm'>
                <Settings className='w-4 h-4 mr-2' />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 py-8'>
        {/* Profile Header */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row items-center gap-6'>
              <div className='relative'>
                <Avatar className='w-32 h-32 text-5xl'>
                  <AvatarImage src='' />
                  <AvatarFallback className='bg-primary/10 text-5xl'>🐐</AvatarFallback>
                </Avatar>
                <div className='absolute -bottom-2 -right-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold'>
                  {userData.level}
                </div>
              </div>
              
              <div className='text-center md:text-left flex-1'>
                <h1 className='text-2xl font-bold'>{userData.displayName}</h1>
                <p className='text-gray-500'>@{userData.username}</p>
                <p className='text-sm mt-2'>{userData.bio}</p>
                
                <div className='flex items-center gap-4 mt-4 justify-center md:justify-start text-sm text-gray-500'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    Joined {userData.joinedDate}
                  </span>
                  <span className='flex items-center gap-1'>
                    📍 {userData.location}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className='flex flex-col items-center gap-2 bg-amber-50 px-4 py-3 rounded-lg'>
                  <div className='flex items-center gap-1 text-amber-500'>
                    <Zap className='w-5 h-5' />
                    <span className='text-xl font-bold'>{userData.coins}</span>
                  </div>
                  <span className='text-xs text-amber-600'>Monedas</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-primary'>{userData.level}</div>
              <div className='text-sm text-gray-500'>Nivel</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-green-500'>{userData.completedCourses}/{userData.totalCourses}</div>
              <div className='text-sm text-gray-500'>Cursos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-purple-500'>{userData.totalAchievements}</div>
              <div className='text-sm text-gray-500'>Logros</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-3xl font-bold text-orange-500'>{userData.streak} 🔥</div>
              <div className='text-sm text-gray-500'>Racha</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='achievements'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='achievements' className='gap-2'>
              <Trophy className='w-4 h-4' />
              Logros
            </TabsTrigger>
            <TabsTrigger value='courses' className='gap-2'>
              <BookOpen className='w-4 h-4' />
              Cursos
            </TabsTrigger>
          </TabsList>

          <TabsContent value='achievements' className='mt-4'>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`text-center ${!achievement.unlocked ? 'opacity-50 grayscale' : ''}`}
                >
                  <CardContent className='p-4'>
                    <div className='text-4xl mb-2'>{achievement.icon}</div>
                    <h3 className='font-semibold text-sm'>{achievement.name}</h3>
                    <p className='text-xs text-gray-500 mt-1'>{achievement.description}</p>
                    {achievement.unlocked && achievement.date && (
                      <Badge variant='success' className='mt-2 text-xs'>
                        {achievement.date}
                      </Badge>
                    )}
                    {!achievement.unlocked && (
                      <Badge variant='default' className='mt-2 text-xs'>
                        Bloqueado
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='courses' className='mt-4'>
            <div className='space-y-4'>
              {enrolledCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-semibold'>{course.name}</h3>
                      <Badge variant='secondary'>{course.progress}%</Badge>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                      <div 
                        className='bg-primary h-2 rounded-full transition-all' 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className='text-sm text-gray-500'>
                      {course.completedLessons}/{course.totalLessons} lecciones completadas
                    </p>
                    <Link href={`/learn/${course.id}`}>
                      <Button variant='outline' size='sm' className='mt-3'>
                        Continuar
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Medal, Crown, ArrowLeft, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = { title: 'Leaderboard' };

// Demo leaderboard data
const leaderboardData = [
  { rank: 1, name: 'MariaGarcia', level: 45, xp: 12450, avatar: '👑', country: '🇪🇸' },
  { rank: 2, name: 'TechNinja99', level: 42, xp: 11200, avatar: '🥷', country: '🇺🇸' },
  { rank: 3, name: 'LearningHero', level: 40, xp: 10800, avatar: '🦸', country: '🇬🇧' },
  { rank: 4, name: 'CodeMaster', level: 38, xp: 9500, avatar: '💻', country: '🇩🇪' },
  { rank: 5, name: 'StudyChamp', level: 35, xp: 8900, avatar: '📚', country: '🇫🇷' },
  { rank: 42, name: 'JacoboProton', level: 12, xp: 2450, avatar: '🐐', country: '🇪🇸', isCurrentUser: true },
  { rank: 43, name: 'NewLearner', level: 11, xp: 2200, avatar: '🌱', country: '🇲🇽' },
  { rank: 44, name: 'StudentX', level: 10, xp: 2000, avatar: '📖', country: '🇧🇷' },
  { rank: 45, name: 'Beginner01', level: 9, xp: 1800, avatar: '🎯', country: '🇮🇳' },
];

const weeklyData = [...leaderboardData].slice(0, 6).map((user, i) => ({
  ...user,
  rank: i + 1,
  weeklyXp: Math.floor(Math.random() * 500) + 100,
}));

const friendsData = [
  { rank: 5, name: 'MariaGarcia', level: 45, xp: 12450, avatar: '👑' },
  { rank: 42, name: 'JacoboProton', level: 12, xp: 2450, avatar: '🐐', isCurrentUser: true },
  { rank: 89, name: 'AmigoReal', level: 8, xp: 1200, avatar: '🤖' },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className='w-5 h-5 text-yellow-500' />;
  if (rank === 2) return <Medal className='w-5 h-5 text-gray-400' />;
  if (rank === 3) return <Medal className='w-5 h-5 text-amber-600' />;
  return <span className='font-bold text-gray-400 w-6 text-center'>{rank}</span>;
}

function getRankBgColor(rank: number) {
  if (rank === 1) return 'bg-yellow-50 border-yellow-200';
  if (rank === 2) return 'bg-gray-50 border-gray-200';
  if (rank === 3) return 'bg-amber-50 border-amber-200';
  return '';
}

export default function LeaderboardPage() {
  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-white shadow-card sticky top-0 z-50'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <Link href='/dashboard' className='flex items-center gap-2 text-gray-600 hover:text-gray-900'>
            <ArrowLeft className='w-5 h-5' />
            <span className='font-medium'>Volver al Dashboard</span>
          </Link>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2 flex items-center justify-center gap-3'>
            <Trophy className='w-10 h-10 text-yellow-500' />
            Leaderboard
          </h1>
          <p className='text-gray-500'>Compite con otros aprendices y sube en el ranking</p>
        </div>

        {/* Top 3 Podium */}
        <div className='flex items-end justify-center gap-4 mb-8'>
          {/* 2nd place */}
          <div className='text-center'>
            <div className='text-5xl mb-2'>{weeklyData[1].avatar}</div>
            <div className='bg-gray-200 rounded-t-lg px-6 py-3'>
              <div className='font-bold'>{weeklyData[1].name}</div>
              <div className='text-sm text-gray-600'>Lv. {weeklyData[1].level}</div>
              <div className='text-sm font-semibold text-gray-500'>{weeklyData[1].weeklyXp} XP</div>
            </div>
            <div className='bg-gray-300 rounded-b-lg py-2 px-4'>
              <Medal className='w-6 h-6 text-gray-400 mx-auto' />
            </div>
          </div>

          {/* 1st place */}
          <div className='text-center'>
            <div className='text-6xl mb-2'>{weeklyData[0].avatar}</div>
            <div className='bg-yellow-200 rounded-t-lg px-8 py-4'>
              <div className='font-bold text-lg'>{weeklyData[0].name}</div>
              <div className='text-sm text-yellow-700'>Lv. {weeklyData[0].level}</div>
              <div className='text-sm font-bold text-yellow-800'>{weeklyData[0].weeklyXp} XP</div>
            </div>
            <div className='bg-yellow-300 rounded-b-lg py-3 px-6'>
              <Crown className='w-8 h-8 text-yellow-600 mx-auto' />
            </div>
          </div>

          {/* 3rd place */}
          <div className='text-center'>
            <div className='text-5xl mb-2'>{weeklyData[2].avatar}</div>
            <div className='bg-amber-100 rounded-t-lg px-6 py-3'>
              <div className='font-bold'>{weeklyData[2].name}</div>
              <div className='text-sm text-amber-700'>Lv. {weeklyData[2].level}</div>
              <div className='text-sm font-semibold text-amber-600'>{weeklyData[2].weeklyXp} XP</div>
            </div>
            <div className='bg-amber-200 rounded-b-lg py-2 px-4'>
              <Medal className='w-6 h-6 text-amber-600 mx-auto' />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='global' className='mb-6'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='global'>Global</TabsTrigger>
            <TabsTrigger value='weekly'>Semanal</TabsTrigger>
            <TabsTrigger value='friends'>Amigos</TabsTrigger>
          </TabsList>

          <TabsContent value='global' className='mt-4'>
            <Card>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  {leaderboardData.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-4 p-4 ${user.isCurrentUser ? 'bg-primary/10' : ''} ${getRankBgColor(user.rank)}`}
                    >
                      <div className='w-12 text-center'>{getRankIcon(user.rank)}</div>
                      <div className='text-3xl'>{user.avatar}</div>
                      <div className='flex-1'>
                        <div className='font-semibold'>
                          {user.name}
                          {user.isCurrentUser && <Badge variant='secondary' className='ml-2 text-xs'>Tú</Badge>}
                        </div>
                        <div className='text-sm text-gray-500'>Nivel {user.level}</div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-lg'>{user.xp.toLocaleString()}</div>
                        <div className='text-xs text-gray-400'>XP total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='weekly' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='w-5 h-5 text-yellow-500' />
                  Ranking Semanal
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  {weeklyData.map((user, index) => (
                    <div
                      key={user.name}
                      className='flex items-center gap-4 p-4'
                    >
                      <div className='w-12 text-center font-bold text-lg'>#{index + 1}</div>
                      <div className='text-3xl'>{user.avatar}</div>
                      <div className='flex-1'>
                        <div className='font-semibold'>{user.name}</div>
                        <div className='text-sm text-gray-500'>Nivel {user.level}</div>
                      </div>
                      <Badge variant='success'>+{user.weeklyXp} XP</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='friends' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Amigos</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  {friendsData.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-4 p-4 ${user.isCurrentUser ? 'bg-primary/5' : ''}`}
                    >
                      <div className='w-12 text-center font-bold text-lg'>#{user.rank}</div>
                      <div className='text-3xl'>{user.avatar}</div>
                      <div className='flex-1'>
                        <div className='font-semibold'>
                          {user.name}
                          {user.isCurrentUser && <Badge variant='secondary' className='ml-2 text-xs'>Tú</Badge>}
                        </div>
                        <div className='text-sm text-gray-500'>Nivel {user.level}</div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold'>{user.xp.toLocaleString()} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Your Position */}
        <Card className='bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20'>
          <CardContent className='p-6 text-center'>
            <h3 className='text-lg font-semibold mb-2'>Tu Posición</h3>
            <div className='text-4xl font-bold text-primary mb-1'>#{leaderboardData[5].rank}</div>
            <p className='text-gray-600'>
              Nivel {leaderboardData[5].level} • {leaderboardData[5].xp.toLocaleString()} XP total
            </p>
            <p className='text-sm text-gray-500 mt-2'>
              ¡Sigue aprendiendo para subir en el ranking! 📚
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
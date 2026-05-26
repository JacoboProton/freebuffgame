import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, Coins, ArrowLeft, Gift, Zap, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Tienda' };

// Demo user coins
const userCoins = 1250;

// Shop items data
const shopItems = [
  {
    id: 'avatar-flame',
    name: 'Avatar Flamante',
    description: 'Un avatar único con llamas animadas',
    price: 500,
    icon: '🔥',
    category: 'avatar',
    rarity: 'rare',
  },
  {
    id: 'badge-pro',
    name: 'Insignia Pro',
    description: 'Muestra tu compromiso con el aprendizaje',
    price: 750,
    icon: '⭐',
    category: 'badge',
    rarity: 'epic',
  },
  {
    id: 'theme-cyber',
    name: 'Tema Ciberseguridad',
    description: 'Tema visual futurista para tu perfil',
    price: 300,
    icon: '💻',
    category: 'theme',
    rarity: 'rare',
  },
  {
    id: 'emoji-pack-1',
    name: 'Pack Emojis Educación',
    description: '10 emojis únicos para comentarios',
    price: 200,
    icon: '📚',
    category: 'emoji',
    rarity: 'common',
  },
  {
    id: 'frame-gold',
    name: 'Marco Dorado',
    description: 'Marco dorado para tu avatar',
    price: 600,
    icon: '👑',
    category: 'frame',
    rarity: 'rare',
  },
  {
    id: 'title-veteran',
    name: 'Título Veterano',
    description: 'Muestra tu experiencia en el plataforma',
    price: 1000,
    icon: '🎖️',
    category: 'title',
    rarity: 'legendary',
  },
];

const categories = [
  { id: 'all', name: 'Todos', icon: ShoppingBag },
  { id: 'avatar', name: 'Avatares', icon: Sparkles },
  { id: 'badge', name: 'Insignias', icon: Shield },
  { id: 'theme', name: 'Temas', icon: Zap },
  { id: 'emoji', name: 'Emojis', icon: Gift },
];

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'legendary': return 'text-orange-500 border-orange-200 bg-orange-50';
    case 'epic': return 'text-purple-500 border-purple-200 bg-purple-50';
    case 'rare': return 'text-blue-500 border-blue-200 bg-blue-50';
    default: return 'text-gray-500 border-gray-200 bg-gray-50';
  }
}

function getRarityLabel(rarity: string) {
  switch (rarity) {
    case 'legendary': return 'Legendario';
    case 'epic': return 'Épico';
    case 'rare': return 'Raro';
    default: return 'Común';
  }
}

export default function ShopPage() {
  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-white shadow-card sticky top-0 z-50'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/dashboard' className='flex items-center gap-2 text-gray-600 hover:text-gray-900'>
              <ArrowLeft className='w-5 h-5' />
              <span className='font-medium'>Volver al Dashboard</span>
            </Link>
            <Badge variant='secondary' className='gap-1 text-amber-500'>
              <Coins className='w-4 h-4' />
              <span className='font-bold'>{userCoins}</span>
            </Badge>
          </div>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2 flex items-center justify-center gap-3'>
            <ShoppingBag className='w-10 h-10 text-primary' />
            Tienda de Recompensas
          </h1>
          <p className='text-gray-500'>Canjea tus monedas por artículos únicos</p>
          <div className='mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full'>
            <Coins className='w-5 h-5 text-amber-500' />
            <span className='font-semibold'>Tienes {userCoins} monedas</span>
          </div>
        </div>

        {/* Categories */}
        <div className='flex gap-2 mb-8 overflow-x-auto pb-2'>
          {categories.map((cat) => (
            <Button key={cat.id} variant='outline' size='sm' className='gap-2 whitespace-nowrap'>
              <cat.icon className='w-4 h-4' />
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Shop Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {shopItems.map((item) => {
            const canAfford = userCoins >= item.price;
            return (
              <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-lg ${!canAfford ? 'opacity-60' : ''}`}>
                <div className={`h-24 flex items-center justify-center ${getRarityColor(item.rarity)}`}>
                  <span className='text-5xl'>{item.icon}</span>
                </div>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h3 className='font-semibold'>{item.name}</h3>
                      <Badge className={`text-xs mt-1 ${getRarityColor(item.rarity)}`}>
                        {getRarityLabel(item.rarity)}
                      </Badge>
                    </div>
                  </div>
                  <p className='text-sm text-gray-500 mb-4'>{item.description}</p>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1 text-amber-500'>
                      <Coins className='w-4 h-4' />
                      <span className='font-bold'>{item.price}</span>
                    </div>
                    <Button 
                      size='sm' 
                      disabled={!canAfford}
                      variant={canAfford ? 'primary' : 'outline'}
                    >
                      {canAfford ? 'Canjear' : 'Sin saldo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Box */}
        <Card className='mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20'>
          <CardContent className='p-6'>
            <h3 className='font-semibold mb-2 flex items-center gap-2'>
              <Zap className='w-5 h-5 text-primary' />
              ¿Cómo obtener más monedas?
            </h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Completa cursos → Recibe XP → Desbloquea logros</li>
              <li>• Mantén tu racha de aprendizaje diario</li>
              <li>• Participa en desafíos semanales</li>
              <li>• Invita amigos al plataforma</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
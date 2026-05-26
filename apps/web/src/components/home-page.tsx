'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Trophy, Users, BookOpen, Gamepad2, ShoppingBag } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex justify-center mb-6">
              <span className="text-8xl">🐐</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">Duobi-Jac</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Aprende cualquier cosa con tu cabrito favorito!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="gap-2"><BookOpen className="w-5 h-5" />Explorar Cursos</Button>
              </Link>
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2"><Zap className="w-5 h-5" />Ir al Dashboard</Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button variant="secondary" size="lg">Iniciar Sesión</Button>
                </SignInButton>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center"><div className="text-3xl font-bold text-primary">50K+</div><div className="text-gray-500">Estudiantes</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-primary">200+</div><div className="text-gray-500">Lecciones</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-primary">15</div><div className="text-gray-500">Categorias</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-primary">95%</div><div className="text-gray-500">Satisfaccion</div></div>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Por que elegir Duobi-Jac?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card hoverable className="p-6"><div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-primary" /></div><h3 className="text-xl font-bold mb-2">XP y Niveles</h3><p className="text-gray-500">Gana experiencia con cada leccion y sube de nivel!</p></Card>
            <Card hoverable className="p-6"><div className="w-12 h-12 bg-accent-coral/10 rounded-xl flex items-center justify-center mb-4"><Trophy className="w-6 h-6 text-accent-coral" /></div><h3 className="text-xl font-bold mb-2">Logros</h3><p className="text-gray-500">Desbloquea achievements al completar metas!</p></Card>
            <Card hoverable className="p-6"><div className="w-12 h-12 bg-accent-yellow/10 rounded-xl flex items-center justify-center mb-4"><Users className="w-6 h-6 text-accent-yellow" /></div><h3 className="text-xl font-bold mb-2">Comunidad</h3><p className="text-gray-500">Compite con amigos en el leaderboard!</p></Card>
            <Card hoverable className="p-6"><div className="w-12 h-12 bg-accent-mint/10 rounded-xl flex items-center justify-center mb-4"><Gamepad2 className="w-6 h-6 text-accent-mint" /></div><h3 className="text-xl font-bold mb-2">Mini-Juegos</h3><p className="text-gray-500">Repasa lo aprendido con juegos divertidos!</p></Card>
            <Card hoverable className="p-6"><div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4"><ShoppingBag className="w-6 h-6 text-purple-600" /></div><h3 className="text-xl font-bold mb-2">Tienda</h3><p className="text-gray-500">Usa tus monedas para comprar avatares unicos!</p></Card>
            <Card hoverable className="p-6"><div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4"><span className="text-2xl">🔥</span></div><h3 className="text-xl font-bold mb-2">Racha</h3><p className="text-gray-500">Mantén tu racha diaria para multiplicar recompensas!</p></Card>
          </div>
        </div>
      </section>
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Listo para empezar?</h2>
          <p className="text-lg text-white/80 mb-8">Unete a miles de estudiantes que ya estan aprendiendo con Duobi-Jac</p>
          {!isSignedIn && (
            <Link href="/register"><Button size="lg" variant="secondary" className="gap-2">Crear Cuenta Gratis</Button></Link>
          )}
        </div>
      </section>
    </div>
  );
}

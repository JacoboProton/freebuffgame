'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  lessonsCount: number;
  studentsCount: number;
}

const categories = ['Todos', 'Programacion', 'Idiomas', 'IA & Tech', 'Finanzas', 'Cocina'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const demoCourses: Course[] = [
      { id: '1', title: 'Fundamentos de IA', description: 'Aprende los conceptos basicos de la IA, machine learning y redes neuronales.', category: 'IA & Tech', difficulty: 'beginner', estimatedHours: 8, lessonsCount: 15, studentsCount: 1234 },
      { id: '2', title: 'Ingles para Principiantes', description: 'Domina las bases del ingles con lecciones interactivas.', category: 'Idiomas', difficulty: 'beginner', estimatedHours: 12, lessonsCount: 20, studentsCount: 2341 },
      { id: '3', title: 'Finanzas Personales', description: 'Aprende a gestionar tu dinero y hacer inversiones.', category: 'Finanzas', difficulty: 'beginner', estimatedHours: 6, lessonsCount: 12, studentsCount: 892 },
      { id: '4', title: 'Python para Todos', description: 'Desde cero hasta programar tus primeros scripts en Python.', category: 'Programacion', difficulty: 'beginner', estimatedHours: 15, lessonsCount: 25, studentsCount: 3421 },
    ];
    setTimeout(() => { setCourses(demoCourses); setLoading(false); }, 500);
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Todos' || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl">🐐</span>
            </div>
            <span className="font-bold text-xl">Duobi-Jac</span>
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Explorar Cursos</h1>
        <p className="text-gray-500 mb-6">Descubre contenido de calidad en cualquier tema</p>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Buscar cursos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-12" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'ghost'} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="p-0 overflow-hidden">
                <div className="h-32 bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron cursos</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, index) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card hoverable className="p-0 overflow-hidden h-full flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-5xl">📚</span>
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <Badge variant={course.difficulty === 'beginner' ? 'success' : 'default'}>{course.difficulty}</Badge>
                      <span className="text-xs text-gray-400">{course.lessonsCount} lecciones</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

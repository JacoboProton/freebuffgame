'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClerkAPI } from '@/lib/clerk-api';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course?: {
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
  };
}

const CATEGORIES = [
  'Programación',
  'Matemáticas',
  'Idiomas',
  'Ciencias',
  'Negocios',
  'Diseño',
  'IA & Tech',
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export function CourseModal({ isOpen, onClose, onSuccess, course }: CourseModalProps) {
  const { fetchAPI } = useClerkAPI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programación',
    difficulty: 'beginner',
    estimatedHours: 1,
    isPublished: false,
    isPro: false,
    price: 0,
    requiredLevel: 0,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours,
        isPublished: course.isPublished,
        isPro: course.isPro || false,
        price: course.price || 0,
        requiredLevel: course.requiredLevel || 0,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Programación',
        difficulty: 'beginner',
        estimatedHours: 1,
        isPublished: false,
        isPro: false,
        price: 0,
        requiredLevel: 0,
      });
    }
  }, [course, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (course) {
        await fetchAPI(`/admin/courses/${course.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchAPI('/admin/courses', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving course:', err);
      alert('Error al guardar el curso');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ej: JavaScript Fundamentals"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el curso..."
              className="w-full p-3 border rounded-lg min-h-[100px] resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border rounded-lg bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dificultad</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-3 border rounded-lg bg-white"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Horas estimadas</label>
              <Input
                type="number"
                min="1"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium">Publicado</span>
              </label>
            </div>
          </div>

          {/* PRO Fields */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.isPro}
                onChange={(e) => setFormData({ ...formData, isPro: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="font-medium">Curso PRO</span>
              <Badge variant="default" className="bg-purple-500">Pago</Badge>
            </div>

            {formData.isPro && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio (centavos)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="500 = $5.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nivel requerido</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.requiredLevel}
                    onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
                    placeholder="0 = cualquier nivel"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {course ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
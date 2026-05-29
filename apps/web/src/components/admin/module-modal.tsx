'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClerkAPI } from '@/lib/clerk-api';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
  module?: {
    id: string;
    title: string;
    order: number;
  };
}

export function ModuleModal({ isOpen, onClose, onSuccess, courseId, module }: ModuleModalProps) {
  const { fetchAPI } = useClerkAPI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    order: 0,
  });

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        order: module.order,
      });
    } else {
      setFormData({
        title: '',
        order: 0,
      });
    }
  }, [module, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (module) {
        await fetchAPI(`/admin/modules/${module.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchAPI(`/admin/courses/${courseId}/modules`, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving module:', err);
      alert('Error al guardar el módulo');
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
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {module ? 'Editar Módulo' : 'Añadir Módulo'}
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
            <label className="block text-sm font-medium mb-1">Título del Módulo</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ej: Introducción a JavaScript"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Orden</label>
            <Input
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {module ? 'Guardar' : 'Añadir'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
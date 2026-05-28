'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  itemName?: string;
  itemType?: 'course' | 'module' | 'lesson' | 'user';
  message?: string;
}

export function DeleteConfirm({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  title = 'Confirmar eliminación',
  itemName = '',
  itemType = 'course',
  message
}: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const messages: Record<string, { description: string; warning: string | null }> = {
    course: {
      description: 'Este curso será eliminado permanentemente, incluyendo todos sus módulos y lecciones.',
      warning: 'Los estudiantes perderán acceso a este curso.',
    },
    module: {
      description: 'Este módulo y todas sus lecciones serán eliminados permanentemente.',
      warning: null,
    },
    lesson: {
      description: 'Esta lección será eliminada permanentemente.',
      warning: null,
    },
    user: {
      description: 'Este usuario será eliminado permanentemente, incluyendo todos sus datos.',
      warning: 'Esta acción no se puede deshacer.',
    },
  };

  const msg = messages[itemType] || messages.course;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {itemName && <p className="font-medium text-lg mb-2">{itemName}</p>}
            {message ? (
              <p className="text-sm text-gray-600">{message}</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">{msg.description}</p>
                {msg.warning && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{msg.warning}</p>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
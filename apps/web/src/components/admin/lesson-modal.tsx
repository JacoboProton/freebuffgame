'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClerkAPI } from '@/lib/clerk-api';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  moduleId: string;
  lesson?: {
    id: string;
    title: string;
    type: string;
    content: any;
    xpReward: number;
    order: number;
  };
}

const LESSON_TYPES = [
  { value: 'multiple_choice', label: 'Opción Múltiple' },
  { value: 'true_false', label: 'Verdadero/Falso' },
  { value: 'fill_blank', label: 'Completar Espacios' },
  { value: 'matching', label: 'Emparejar' },
];

interface MultipleChoiceContent {
  question: string;
  options: string[];
  correctIndex: number;
}

interface TrueFalseContent {
  statement: string;
  correctAnswer: boolean;
}

interface FillBlankContent {
  sentence: string;
  correctAnswer: string;
  hint?: string;
}

interface MatchingContent {
  pairs: { left: string; right: string }[];
}

type ContentType = MultipleChoiceContent | TrueFalseContent | FillBlankContent | MatchingContent;

export function LessonModal({ isOpen, onClose, onSuccess, moduleId, lesson }: LessonModalProps) {
  const { fetchAPI } = useClerkAPI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'multiple_choice',
    content: {} as ContentType,
    xpReward: 20,
    order: 0,
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        type: lesson.type,
        content: typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content,
        xpReward: lesson.xpReward,
        order: lesson.order,
      });
    } else {
      // Default content based on type
      setFormData({
        title: '',
        type: 'multiple_choice',
        content: { question: '', options: ['', '', '', ''], correctIndex: 0 },
        xpReward: 20,
        order: 0,
      });
    }
  }, [lesson, isOpen]);

  const handleTypeChange = (type: string) => {
    let defaultContent: ContentType;
    switch (type) {
      case 'multiple_choice':
        defaultContent = { question: '', options: ['', '', '', ''], correctIndex: 0 };
        break;
      case 'true_false':
        defaultContent = { statement: '', correctAnswer: true };
        break;
      case 'fill_blank':
        defaultContent = { sentence: '', correctAnswer: '', hint: '' };
        break;
      case 'matching':
        defaultContent = { pairs: [{ left: '', right: '' }] };
        break;
      default:
        defaultContent = { question: '', options: ['', '', '', ''], correctIndex: 0 };
    }
    setFormData({ ...formData, type, content: defaultContent });
  };

  const updateContent = (updates: Partial<ContentType>) => {
    setFormData({ ...formData, content: { ...formData.content, ...updates } as ContentType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        xpReward: formData.xpReward,
        order: formData.order,
      };

      if (lesson) {
        await fetchAPI(`/admin/lessons/${lesson.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAPI(`/admin/modules/${moduleId}/lessons`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving lesson:', err);
      alert('Error al guardar la lección');
    } finally {
      setLoading(false);
    }
  };

  const renderContentEditor = () => {
    switch (formData.type) {
      case 'multiple_choice':
        const mc = formData.content as MultipleChoiceContent;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Pregunta</label>
              <Input
                value={mc.question}
                onChange={(e) => updateContent({ question: e.target.value })}
                placeholder="Escribe la pregunta..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Opciones</label>
              {mc.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={mc.correctIndex === i}
                    onChange={() => updateContent({ correctIndex: i } as any)}
                    className="w-4 h-4"
                  />
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...mc.options];
                      newOptions[i] = e.target.value;
                      updateContent({ options: newOptions });
                    }}
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'true_false':
        const tf = formData.content as TrueFalseContent;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Enunciado</label>
              <textarea
                value={tf.statement}
                onChange={(e) => updateContent({ statement: e.target.value })}
                placeholder="Escribe el enunciado..."
                className="w-full p-3 border rounded-lg min-h-[80px] resize-y"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Respuesta correcta</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={tf.correctAnswer === true}
                    onChange={() => updateContent({ correctAnswer: true })}
                    className="w-4 h-4"
                  />
                  <span>Verdadero</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={tf.correctAnswer === false}
                    onChange={() => updateContent({ correctAnswer: false })}
                    className="w-4 h-4"
                  />
                  <span>Falso</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'fill_blank':
        const fb = formData.content as FillBlankContent;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Oración (usa ___ para el espacio)
              </label>
              <Input
                value={fb.sentence}
                onChange={(e) => updateContent({ sentence: e.target.value })}
                placeholder="La IA que aprende de datos se llama ___ learning"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Respuesta correcta</label>
              <Input
                value={fb.correctAnswer}
                onChange={(e) => updateContent({ correctAnswer: e.target.value })}
                placeholder="machine"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pista (opcional)</label>
              <Input
                value={fb.hint || ''}
                onChange={(e) => updateContent({ hint: e.target.value })}
                placeholder="Es una palabra de dos partes"
              />
            </div>
          </div>
        );

      case 'matching':
        const mg = formData.content as MatchingContent;
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Pares de emparejamiento</label>
            {mg.pairs.map((pair, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={pair.left}
                  onChange={(e) => {
                    const newPairs = [...mg.pairs];
                    newPairs[i] = { ...pair, left: e.target.value };
                    updateContent({ pairs: newPairs });
                  }}
                  placeholder="Izquierda"
                  className="flex-1"
                />
                <span>=</span>
                <Input
                  value={pair.right}
                  onChange={(e) => {
                    const newPairs = [...mg.pairs];
                    newPairs[i] = { ...pair, right: e.target.value };
                    updateContent({ pairs: newPairs });
                  }}
                  placeholder="Derecha"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPairs = mg.pairs.filter((_, idx) => idx !== i);
                    updateContent({ pairs: newPairs });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateContent({ pairs: [...mg.pairs, { left: '', right: '' }] } as any)}
            >
              <Plus className="w-4 h-4 mr-1" /> Añadir par
            </Button>
          </div>
        );

      default:
        return null;
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
              {lesson ? 'Editar Lección' : 'Añadir Lección'}
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
              placeholder="ej: ¿Qué es JavaScript?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de pregunta</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white"
              >
                {LESSON_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">XP reward</label>
              <Input
                type="number"
                min="0"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
              />
            </div>
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Contenido</label>
            {renderContentEditor()}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {lesson ? 'Guardar' : 'Añadir'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
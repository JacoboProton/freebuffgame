'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit, Eye, Check, Clock, X } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  isPublished: boolean;
  moduleCount: number;
  lessonCount: number;
}

interface InstructorApplication {
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function InstructorDashboard() {
  const [application, setApplication] = useState<InstructorApplication | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    checkApplication();
    fetchMyCourses();
  }, []);

  const checkApplication = async () => {
    try {
      const res = await fetch('/api/instructors/application');
      const data = await res.json();
      if (data.status === 'success') {
        setApplication(data.data);
      }
    } catch (error) {
      console.error('Failed to check application:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const res = await fetch('/api/instructors/courses');
      const data = await res.json();
      if (data.status === 'success') {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const submitApplication = async (formData: { bio: string; expertise: string }) => {
    setApplying(true);
    try {
      const res = await fetch('/api/instructors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setApplication({ status: 'pending', createdAt: new Date().toISOString() });
        setShowApplyForm(false);
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Not an instructor yet - show apply button
  if (!application) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <h3 className="font-bold text-lg">Panel de Instructor</h3>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            ¿Quieres crear tus propios cursos?
          </h4>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Conviértete en instructor y comparte tu conocimiento creando cursos interactivos 
            para la comunidad de FreeBuffGame.
          </p>
          
          {showApplyForm ? (
            <ApplyForm onSubmit={submitApplication} onCancel={() => setShowApplyForm(false)} applying={applying} />
          ) : (
            <button
              onClick={() => setShowApplyForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              Solicitar ser Instructor
            </button>
          )}
        </div>
      </div>
    );
  }

  // Application pending
  if (application.status === 'pending') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-lg">Solicitud Pendiente</h3>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tu solicitud está en revisión
          </h4>
          <p className="text-sm text-gray-500">
            Te notificaremos cuando sea aprobada. Biasanya memakan waktu 1-3 hari kerja.
          </p>
        </div>
      </div>
    );
  }

  // Application rejected
  if (application.status === 'rejected') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5" />
            <h3 className="font-bold text-lg">Solicitud Rechazada</h3>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <X className="w-16 h-16 mx-auto mb-4 text-red-300" />
          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tu solicitud fue rechazada
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Puedes volver a aplicar después de 30 días.
          </p>
          <button
            onClick={() => setShowApplyForm(true)}
            className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            Ver información
          </button>
        </div>
      </div>
    );
  }

  // Approved instructor - show dashboard
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <h3 className="font-bold text-lg">Panel de Instructor</h3>
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Verificado
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{courses.length}</div>
          <div className="text-xs text-gray-500">Cursos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {courses.filter(c => c.isPublished).length}
          </div>
          <div className="text-xs text-gray-500">Publicados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {courses.reduce((acc, c) => acc + c.lessonCount, 0)}
          </div>
          <div className="text-xs text-gray-500">Lecciones</div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Crear Nuevo Curso
        </button>
      </div>

      {/* Course List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {courses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No has creado ningún curso todavía</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {course.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>{course.moduleCount} módulos</span>
                  <span>•</span>
                  <span>{course.lessonCount} lecciones</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.5 rounded ${
                    course.isPublished 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {course.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ApplyForm({ onSubmit, onCancel, applying }: { onSubmit: (data: { bio: string; expertise: string }) => void; onCancel: () => void; applying: boolean }) {
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ bio, expertise });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
          Biografía
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          rows={3}
          placeholder="Cuéntanos sobre ti y tu experiencia..."
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
          Área de experiencia
        </label>
        <input
          type="text"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="Ej: Programación, Finanzas, Idiomas..."
          required
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={applying}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
        >
          {applying ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </div>
    </form>
  );
}
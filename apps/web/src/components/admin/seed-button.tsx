'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SeedButtonProps {
  fetchAPI: <T>(endpoint: string, options?: any) => Promise<T>;
}

export function SeedButton({ fetchAPI }: SeedButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const handleSeed = async () => {
    if (!confirm('¿Estás seguro? Esto recreará/actualizará todos los datos demo (cursos, logros, juegos, shop items). Los datos existentes se actualizarán con upsert.')) {
      return;
    }

    setStatus('loading');
    setMessage('Ejecutando seed... esto puede tardar 30-60 segundos.');

    try {
      const result = await fetchAPI<{ message: string }>('/admin/seed', {
        method: 'POST',
      });
      if (isMountedRef.current) {
        setStatus('success');
        setMessage(result.message || 'Seed ejecutado exitosamente.');
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setStatus('error');
        setMessage(error.message || 'Error al ejecutar el seed.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSeed}
          disabled={status === 'loading'}
          variant={status === 'success' ? 'primary' : 'outline'}
          className={`gap-2 ${
            status === 'loading'
              ? 'opacity-70 cursor-not-allowed'
              : status === 'success'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : status === 'error'
              ? 'border-red-300 text-red-600 hover:bg-red-50'
              : ''
          }`}
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {status === 'loading' ? 'Ejecutando...' : status === 'success' ? 'Completado' : status === 'error' ? 'Reintentar' : 'Ejecutar Seed'}
        </Button>
        {status !== 'idle' && (
          <button
            onClick={() => { setStatus('idle'); setMessage(''); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Limpiar estado
          </button>
        )}
      </div>
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : status === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

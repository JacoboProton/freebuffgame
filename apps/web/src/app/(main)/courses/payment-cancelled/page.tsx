'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const courseIdParam = searchParams.get('course');
    if (courseIdParam) {
      setCourseId(courseIdParam);
      // Could fetch course title here if needed
      setCourseTitle('el curso');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 p-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Pago cancelado
        </motion.h1>

        <motion.p 
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {courseId ? (
            <>No te preocupes, no se ha realizado ningún cargo. Puedes intentar nuevamente cuando quieras.</>
          ) : (
            <>No te preocupes, no se ha realizado ningún cargo. Puedes volver a intentarlo cuando quieras.</>
          )}
        </motion.p>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {courseId && (
            <Link
              href={`/courses/${courseId}`}
              className="block w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Ver el curso →
            </Link>
          )}
          
          <Link
            href="/courses"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Explorar cursos
          </Link>

          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 text-amber-600 font-medium hover:underline"
          >
            Volver al dashboard
          </Link>
        </motion.div>

        <motion.p 
          className="text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ¿Tienes preguntas? <Link href="/dashboard" className="text-amber-600 hover:underline">Contacta al soporte</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
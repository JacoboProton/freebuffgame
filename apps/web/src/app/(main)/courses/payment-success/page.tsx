'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { paymentsAPI } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { getToken, isSignedIn } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchaseVerified, setPurchaseVerified] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPurchase = async () => {
      const courseIdParam = searchParams.get('course_purchased');
      const paymentStatus = searchParams.get('payment');
      
      if (!isSignedIn) {
        setError('Por favor inicia sesión para verificar tu compra');
        setIsVerifying(false);
        return;
      }

      if (paymentStatus !== 'success' || !courseIdParam) {
        setError('No se encontró información del pago');
        setIsVerifying(false);
        return;
      }

      setCourseId(courseIdParam);

      try {
        // Get Clerk token for authentication
        const clerkToken = isSignedIn ? (await getToken()) ?? undefined : undefined;
        
        // Verify the purchase
        const purchases = await paymentsAPI.getPurchases(clerkToken);
        
        const purchase = purchases.purchases?.find(
          (p: any) => p.courseId === courseIdParam || p.course?.id === courseIdParam
        );

        if (purchase) {
          setPurchaseVerified(true);
          setCourseTitle(purchase.course?.title || 'El curso');
        } else {
          // Purchase might still be processing via webhook
          setCourseTitle('El curso');
        }
      } catch (err: any) {
        console.error('Error verifying purchase:', err);
        setError(err?.message || 'Error al verificar la compra');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPurchase();
  }, [searchParams, isSignedIn]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Verificando tu pago...</h2>
          <p className="text-emerald-200 mt-2">Esto puede tomar unos segundos</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/courses"
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Volver a los cursos
            </Link>
          </>
        ) : (
          <>
            <motion.div
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <motion.h1 
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ¡Pago completado! 🎉
            </motion.h1>

            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {purchaseVerified ? (
                <>Has comprado exitosamente <strong>{courseTitle}</strong></>
              ) : (
                <>Tu compra está siendo procesada. En breve tendrás acceso al curso.</>
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
                  href={`/learn/${courseId}`}
                  className="block w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Ir al curso →
                </Link>
              )}
              
              <Link
                href="/dashboard"
                className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver mi progreso
              </Link>

              <Link
                href="/courses"
                className="block w-full px-6 py-3 text-emerald-600 font-medium hover:underline"
              >
                Explorar más cursos
              </Link>
            </motion.div>

            {purchaseVerified && (
              <motion.p 
                className="text-sm text-gray-500 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Tu acceso al curso ya está activo. ¡Disfruta el aprendizaje!
              </motion.p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
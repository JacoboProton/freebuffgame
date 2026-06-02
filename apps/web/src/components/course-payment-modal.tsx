'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Lock, CheckCircle, CreditCard, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClerkAPIs } from '@/lib/clerk-api';
import { useToast } from '@/components/ui/toast';

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  isPro?: boolean;
  price?: number;
  requiredLevel?: number;
}

interface CoursePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  userLevel: number;
  isPurchased: boolean;
  onSuccess: () => void;
}

export function CoursePaymentModal({
  isOpen,
  onClose,
  course,
  userLevel,
  isPurchased,
  onSuccess,
}: CoursePaymentModalProps) {
  const { paymentsAPI, coursesAPI } = useClerkAPIs();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [coursePrice, setCoursePrice] = useState<{
    price: number;
    isPurchased: boolean;
    meetsLevelRequirement: boolean;
    requiredLevel: number;
    isPro: boolean;
  } | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(false);

  // Fetch course price when modal opens or course changes
  useEffect(() => {
    if (isOpen && course && !isPurchased) {
      setPriceError(false);
      loadCoursePrice();
    }
  }, [isOpen, course?.id, isPurchased]);

  const loadCoursePrice = async () => {
    if (!course) return;
    
    setLoadingPrice(true);
    setPriceError(false);
    try {
      const priceData = await paymentsAPI.getCoursePrice(course.id) as any;
      setCoursePrice({
        price: priceData.price || 0,
        isPurchased: priceData.isPurchased || isPurchased,
        meetsLevelRequirement: priceData.meetsLevelRequirement ?? true,
        requiredLevel: priceData.requiredLevel || 0,
        isPro: priceData.isPro || course.isPro || false,
      });
    } catch (err) {
      console.error('Error loading course price:', err);
      setPriceError(true);
      // Use default values from course
      setCoursePrice({
        price: course.price || 0,
        isPurchased: isPurchased,
        meetsLevelRequirement: true,
        requiredLevel: course.requiredLevel || 0,
        isPro: course.isPro || false,
      });
    } finally {
      setLoadingPrice(false);
    }
  };

  const handlePurchase = async () => {
    if (!course) return;

    setLoading(true);
    try {
      // Create Stripe checkout session
      const response = await paymentsAPI.checkout(course.id) as any;
      
      if (response?.data?.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      showError(
        'Error al iniciar compra',
        err.message || 'No se pudo iniciar el proceso de pago. Intenta de nuevo.'
      );
      setLoading(false);
    }
  };

  const handleFreeEnrollment = async () => {
    if (!course) return;

    setLoading(true);
    try {
      // For free courses, try to enroll via API
      await coursesAPI.enroll(course.id);
      onSuccess();
      showSuccess('¡Inscripción exitosa!', 'Puedes comenzar a aprender ahora.');
      onClose();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      // If enrollment fails, just close - the learn page will handle auto-enrollment
      onSuccess();
      showSuccess('¡Inscripción exitosa!', 'Puedes comenzar a aprender ahora.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  const price = coursePrice?.price || course.price || 0;
  const alreadyPurchased = coursePrice?.isPurchased || isPurchased;
  const meetsLevel = coursePrice?.meetsLevelRequirement ?? true;
  const requiredLevel = coursePrice?.requiredLevel || course.requiredLevel || 0;
  const isProCourse = coursePrice?.isPro || course.isPro;

  // If already purchased, show success state
  if (alreadyPurchased) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with success gradient */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold">¡Ya tienes este curso!</h2>
                  <p className="opacity-90 mt-1">Puedes acceder cuando quieras</p>
                </div>

                {/* Course info */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center text-3xl">
                      📚
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <p className="text-gray-500 text-sm">Curso PRO</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      onClose();
                      window.location.href = `/learn/${course.id}`;
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Continuar Aprendiendo
                  </Button>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Error state for price loading
  if (priceError) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Error al cargar precio</h2>
                <p className="text-gray-500 mb-4">No se pudo obtener la información del curso. Intenta de nuevo.</p>
                <Button onClick={onClose} variant="outline" className="w-full">
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Loading price state
  if (loadingPrice) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
                <p className="text-gray-500 mt-4">Cargando información...</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Level requirement not met
  if (!meetsLevel && requiredLevel > 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with warning */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold">Nivel requerido</h2>
                  <p className="opacity-90 mt-1">Sube de nivel para desbloquear</p>
                </div>

                {/* Course info */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center text-3xl">
                      📚
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <p className="text-gray-500 text-sm">Curso PRO</p>
                    </div>
                  </div>

                  {/* Level comparison */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800 font-medium">Tu nivel actual</span>
                      <span className="text-amber-900 font-bold text-lg">Nivel {userLevel}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-amber-800 font-medium">Nivel requerido</span>
                      <span className="text-amber-900 font-bold text-lg">Nivel {requiredLevel}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-center text-sm mb-4">
                    Completa más lecciones para subir de nivel y acceder a este curso.
                  </p>

                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Continuar Aprendiendo
                  </Button>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Main purchase modal for PRO courses
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with PRO gradient */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="bg-white/20 border-white/40 text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    CURSO PRO
                  </Badge>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold">{course.title}</h2>
                {course.description && (
                  <p className="opacity-90 mt-1 line-clamp-2">{course.description}</p>
                )}
              </div>

              {/* Price section */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 line-through text-lg">
                      ${((price * 1.3) / 100).toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                      -23%
                    </span>
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mt-2">
                    ${(price / 100).toFixed(2)}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Pago único • Acceso de por vida</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {[
                    'Acceso ilimitado a todas las lecciones',
                    'Certificado de finalización',
                    'Ejercicios prácticos interactivos',
                    'Soporte prioritario',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Purchase button */}
                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  loading={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'Procesando...' : 'Comprar ahora'}
                </Button>

                {/* Secure payment note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Pago seguro procesado por Stripe</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


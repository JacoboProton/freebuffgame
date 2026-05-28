'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Lock, X, Check, AlertCircle, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { paymentsAPI } from '@/lib/api-client';

interface CoursePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    isPro?: boolean;
    price?: number;
    requiredLevel?: number;
  } | null;
  userLevel: number;
  isPurchased?: boolean;
  onSuccess?: () => void;
}

export function CoursePaymentModal({
  isOpen,
  onClose,
  course,
  userLevel,
  isPurchased = false,
  onSuccess,
}: CoursePaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<{
    isPurchased: boolean;
    isPro: boolean;
    price: number;
    requiredLevel: number;
    meetsLevelRequirement: boolean;
  } | null>(null);
  const { getToken } = useAuth();
  const { showError, showSuccess } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && course) {
      setError(null);
      // Fetch price data from API with Clerk token
      getToken().then(token => {
        return paymentsAPI.getCoursePrice(course.id, token || undefined).then(data => {
          setPriceData({
            isPurchased: data.isPurchased,
            isPro: data.isPro,
            price: data.price,
            requiredLevel: data.requiredLevel,
            meetsLevelRequirement: data.meetsLevelRequirement,
          });
        });
      }).catch(err => {
        // If API call fails (401 = not authenticated), use course props as fallback
        console.log('Using course props as fallback for price data');
        setPriceData(null);
      });
    } else if (!isOpen) {
      setPriceData(null);
    }
  }, [isOpen, course, getToken]);

  if (!course) return null;

  const handlePurchase = async () => {
    if (!course) return;
    setIsLoading(true);
    setError(null);

    try {
      // Get Clerk token for authentication
      const clerkToken = await getToken();

      // Use priceData from API if available, otherwise use course props
      const purchaseData = priceData || {
        isPurchased: isPurchased,
        isPro: course.isPro,
        price: course.price || 0,
        requiredLevel: course.requiredLevel || 0,
        meetsLevelRequirement: true,
      };

      if (purchaseData.isPurchased) {
        showSuccess('¡Ya tienes este curso!');
        onClose();
        return;
      }

      if (!purchaseData.meetsLevelRequirement) {
        setError(`Necesitas nivel ${purchaseData.requiredLevel || 0} para desbloquear este curso PRO. Tu nivel actual: ${userLevel}`);
        setIsLoading(false);
        return;
      }

      // Create checkout session with Clerk token
      const checkoutData = await paymentsAPI.checkout(course.id, clerkToken || undefined);

      if (checkoutData.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutData.checkoutUrl;
      }
    } catch (err: any) {
      const message = err?.message || 'Error al procesar el pago';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const priceInUSD = (course.price || 0) / 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header with PRO gradient */}
              <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Curso PRO</h2>
                    <p className="text-white/80 text-sm">Contenido premium exclusivo</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Course info */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant="warning" className="gap-1">
                      <Crown className="w-3 h-3" />
                      Contenido PRO
                    </Badge>
                    {(course.requiredLevel || 0) > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" />
                        Nivel {course.requiredLevel}+
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-gray-700">¿Qué incluye?</h4>
                  <ul className="space-y-2">
                    {[
                      'Lecciones avanzadas exclusivas',
                      'Proyectos prácticos del mundo real',
                      'Certificado de finalización',
                      'Acceso directo al instructor',
                      'Recursos descargables premium',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Level requirement warning - hide if already purchased */}
                {(course.requiredLevel || 0) > 0 && userLevel < (course.requiredLevel || 0) && !isPurchased && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 text-sm">Nivel requerido</p>
                        <p className="text-amber-700 text-sm">
                          Necesitas nivel <strong>{course.requiredLevel || 0}</strong> para desbloquear este curso.
                          Tu nivel actual: <strong>{userLevel}</strong>
                        </p>
                        <p className="text-amber-600 text-xs mt-1">
                          Sigue aprendiendo para alcanzar el nivel requerido.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}



                {/* Purchase status or price */}
                {(priceData?.isPurchased || isPurchased) ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">¡Ya tienes este curso!</p>
                        <p className="text-green-600 text-sm">Tienes acceso completo al contenido PRO</p>
                      </div>
                    </div>
                  </div>
                ) : (priceData?.price || course.price || 0) > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Precio del curso</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${((priceData?.price || course.price || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pago único • Acceso de por vida
                    </p>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    {isPurchased ? 'Cerrar' : 'Cancelar'}
                  </Button>
                  {!isPurchased && !(priceData?.isPurchased) && (
                    <Button
                      onClick={handlePurchase}
                      isLoading={isLoading}
                      disabled={priceData ? !priceData.meetsLevelRequirement : ((course.requiredLevel || 0) > 0 && userLevel < (course.requiredLevel || 0))}
                      className="flex-1 gap-2"
                      style={{
                        background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                      }}
                    >
                      {(priceData?.price || course.price || 0) > 0 ? (
                        <>
                          <Crown className="w-4 h-4" />
                          Desbloquear por ${((priceData?.price || course.price || 0) / 100).toFixed(2)}
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          Desbloquear Gratis
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Secure payment note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
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
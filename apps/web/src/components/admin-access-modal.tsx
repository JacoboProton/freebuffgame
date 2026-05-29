'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserMode: () => void;
  onAdminMode: () => void;
}

export function AdminAccessModal({ isOpen, onClose, onUserMode, onAdminMode }: AdminAccessModalProps) {
  const [step, setStep] = useState<'select' | 'password'>('select');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showError } = useToast();

  const handleUserMode = () => {
    onUserMode();
    onClose();
  };

  const handleAdminClick = () => {
    setStep('password');
    setError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Ingresa la contraseña');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/admin-auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        sessionStorage.setItem('adminAccess', 'true');
        onAdminMode();
        onClose();
        setStep('select');
        setPassword('');
      } else {
        setError(data.message || 'Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al verificar. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    setStep('select');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Modo de Acceso</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'select' ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-center mb-6">
                      ¿Cómo quieres acceder al panel?
                    </p>
                    
                    <div className="grid gap-3">
                      {/* User Mode */}
                      <button
                        onClick={handleUserMode}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                          <User className="w-6 h-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-gray-900">Modo Usuario</h3>
                          <p className="text-sm text-gray-500">Ver contenido y progreso personal</p>
                        </div>
                      </button>

                      {/* Admin Mode */}
                      <button
                        onClick={handleAdminClick}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-amber-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                          <Shield className="w-6 h-6 text-amber-600 group-hover:text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-gray-900">Modo Administrador</h3>
                          <p className="text-sm text-gray-500">Acceso completo al panel de control</p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Password Step */
                  <div>
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                      ← Volver
                    </button>
                    
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ingresa la contraseña de admin
                      </h3>
                      <p className="text-sm text-gray-500">
                        Solo usuarios autorizados pueden acceder
                      </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Contraseña de administrador"
                          className="pr-10"
                          error={error}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Verificando...' : 'Acceder como Admin'}
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 text-center">
                <p className="text-xs text-gray-400">
                  Sesión válida hasta cerrar el navegador
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
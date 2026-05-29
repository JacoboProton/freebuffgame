'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Clock, DollarSign, User, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClerkAPI } from '@/lib/clerk-api';

interface StripeSession {
  id: string;
  paymentStatus: string;
  status: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
  courseId: string | undefined;
  userId: string | undefined;
  createdAt: string;
  completedAt: string | null;
}

interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  stripePaymentId: string | null;
  amountPaid: number;
  purchasedAt: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string; category: string };
}

interface StripeStatus {
  stripeConfigured: boolean;
  webhookSecretSet: boolean;
}

export function WebhookTest() {
  const { fetchAPI } = useClerkAPI();
  const [sessions, setSessions] = useState<StripeSession[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'purchases' | 'manual'>('sessions');
  
  // Manual verification form
  const [manualForm, setManualForm] = useState({
    sessionId: '',
    courseId: '',
    userId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [fetchAPI]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, sessionsRes, purchasesRes] = await Promise.all([
        fetchAPI<{ data: StripeStatus }>('/payments/admin/stripe-status'),
        fetchAPI<{ data: { sessions: StripeSession[] } }>('/payments/admin/sessions?limit=20'),
        fetchAPI<{ data: { purchases: Purchase[] } }>('/payments/admin/purchases?limit=50'),
      ]);
      
      setStripeStatus(statusRes.data);
      setSessions(sessionsRes.data.sessions);
      setPurchases(purchasesRes.data.purchases);
    } catch (err: any) {
      console.error('Error loading webhook test data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPurchase = async (sessionId: string) => {
    try {
      setVerifying(sessionId);
      const result = await fetchAPI<{ data: any }>('/payments/admin/verify-purchase', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
      
      alert(`✅ ${result.data.message}`);
      loadData(); // Refresh data
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult(null);
    
    const hasSessionId = !!manualForm.sessionId.trim();
    const hasCourseAndUser = !!manualForm.courseId.trim() && !!manualForm.userId.trim();
    
    if (!hasSessionId && !hasCourseAndUser) {
      setVerificationResult({ error: 'Por favor ingresa sessionId de Stripe O (courseId + userId)' });
      return;
    }
    
    if (hasSessionId && hasCourseAndUser) {
      setVerificationResult({ error: 'Solo puedes usar un método: sessionId de Stripe O (courseId + userId), no ambos' });
      return;
    }

    try {
      setVerifying('manual');
      const body: any = {};
      if (manualForm.sessionId) body.sessionId = manualForm.sessionId.trim();
      if (manualForm.courseId) body.courseId = manualForm.courseId.trim();
      if (manualForm.userId) body.userId = manualForm.userId.trim();
      
      const result = await fetchAPI<{ data: any }>('/payments/admin/verify-purchase', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      setVerificationResult(result.data);
      // Clear form on success
      if (result.data.verified) {
        setManualForm({ sessionId: '', courseId: '', userId: '' });
      }
      loadData(); // Refresh
    } catch (err: any) {
      setVerificationResult({ error: err.message || 'Error al verificar compra' });
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Pagado</Badge>;
    }
    if (paymentStatus === 'unpaid') {
      return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  if (error && sessions.length === 0 && purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-600">{error}</p>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe Status Banner */}
      {stripeStatus && (
        <Card className={stripeStatus.stripeConfigured ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {stripeStatus.stripeConfigured ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                )}
                <div>
                  <p className="font-semibold">
                    {stripeStatus.stripeConfigured ? 'Stripe Configurado' : 'Stripe No Configurado'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {stripeStatus.stripeConfigured 
                      ? 'Webhook secret: ' + (stripeStatus.webhookSecretSet ? '✓ Configurado' : '✗ No configurado')
                      : 'Añade STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET al archivo .env'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === 'sessions' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Sesiones Stripe ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === 'purchases' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Compras ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === 'manual' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Verificación Manual
        </button>
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Sesiones de Stripe Checkout
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No hay sesiones de Stripe aún
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-white px-2 py-1 rounded">{session.id}</code>
                          {getStatusBadge(session.status, session.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {session.amountTotal ? (session.amountTotal / 100).toFixed(2) : '0'} {session.currency?.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {session.customerEmail || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(session.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {session.courseId && (
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            Course ID: {session.courseId}
                          </div>
                        )}
                        {session.userId && (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="w-4 h-4 text-blue-500" />
                            User ID: {session.userId}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {session.paymentStatus === 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyPurchase(session.id)}
                            disabled={verifying === session.id}
                          >
                            {verifying === session.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Verificar y Registrar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Compras Registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No hay compras registradas aún
              </p>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{purchase.course.title}</span>
                          <Badge variant="secondary">{purchase.course.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {purchase.user.name} ({purchase.user.email})
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {(purchase.amountPaid / 100).toFixed(2)} USD
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(purchase.purchasedAt).toLocaleString()}
                          </span>
                        </div>
                        {purchase.stripePaymentId && (
                          <div className="text-xs text-gray-500">
                            Payment ID: <code className="bg-white px-1 rounded">{purchase.stripePaymentId}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Verification Tab */}
      {activeTab === 'manual' && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Verificación Manual de Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Usa esta herramienta para verificar y registrar compras cuando el webhook de Stripe falla. 
                Puedes verificar una sesión de Stripe existente o crear una compra manualmente para testing.
              </p>
              
              <form onSubmit={handleManualVerify} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Session ID de Stripe (opcional)</label>
                    <Input
                      placeholder="cs_live_..."
                      value={manualForm.sessionId}
                      onChange={(e) => setManualForm({ ...manualForm, sessionId: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si proporcionas un sessionId, se verificará con Stripe
                    </p>
                  </div>
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Course ID (requerido para compra manual)</label>
                      <Input
                        placeholder="course-xxx"
                        value={manualForm.courseId}
                        onChange={(e) => setManualForm({ ...manualForm, courseId: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">User ID (requerido para compra manual)</label>
                      <Input
                        placeholder="user_xxx"
                        value={manualForm.userId}
                        onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={verifying === 'manual'}
                  className="w-full md:w-auto"
                >
                  {verifying === 'manual' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verificar y Registrar Compra
                    </>
                  )}
                </Button>
              </form>

              {/* Result */}
              {verificationResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg ${
                    verificationResult.error 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  {verificationResult.error ? (
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Error: {verificationResult.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">{verificationResult.message}</span>
                      </div>
                      {verificationResult.purchase && (
                        <div className="text-sm text-green-600 ml-7">
                          Purchase ID: {verificationResult.purchase.id} | 
                          Enrolled: {verificationResult.enrolled ? '✓' : '✗'}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Instrucciones de Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p><strong>Para probar el flujo completo:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Ve a la sección "Sesiones Stripe" para ver las sesiones</li>
                <li>Si no hay sesiones, completa un checkout de prueba en la app usando la tarjeta <code>4242 4242 4242 4242</code></li>
                <li>Copia el Session ID de la sesión completada</li>
                <li>Pega el Session ID en la sección "Verificación Manual" y haz clic en verificar</li>
                <li>La compra se registrará y el usuario quedará inscrito</li>
              </ol>
              <p className="mt-3"><strong>Para crear compra manual sin Stripe:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Ingresa el Course ID y User ID del usuario</li>
                <li>Haz clic en "Verificar y Registrar Compra"</li>
                <li>La compra se registrará directamente (sin verificar con Stripe)</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
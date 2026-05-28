'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Send, Users, Trash2, Check, CheckCheck, Mail, Megaphone, Trophy, Zap } from 'lucide-react';

interface Notification {
  id: string;
  userId: string | null;
  type: 'system' | 'achievement' | 'course' | 'streak' | 'broadcast';
  title: string;
  message: string;
  data: any | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface NotificationTemplate {
  id: string;
  key: string;
  title: string;
  message: string;
  type: string;
  variables: string[];
  isActive: boolean;
}

const typeConfig = {
  system: { label: 'Sistema', color: 'bg-gray-100 text-gray-700', icon: Bell },
  achievement: { label: 'Logro', color: 'bg-yellow-100 text-yellow-700', icon: Trophy },
  course: { label: 'Curso', color: 'bg-blue-100 text-blue-700', icon: Mail },
  streak: { label: 'Racha', color: 'bg-orange-100 text-orange-700', icon: Zap },
  broadcast: { label: 'Broadcast', color: 'bg-purple-100 text-purple-700', icon: Megaphone },
};

interface SendNotificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function SendNotificationModal({ onClose, onSuccess }: SendNotificationModalProps) {
  const [formData, setFormData] = useState({
    type: 'broadcast',
    title: '',
    message: '',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.type === 'broadcast') {
        const result = await fetchAPI<{ data: { count: number; message: string } }>('/admin/notifications/broadcast', {
          method: 'POST',
          body: JSON.stringify({ title: data.title, message: data.message }),
        });
        return result;
      }
      return fetchAPI('/admin/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      onSuccess();
    },
    onError: (err: any) => {
      setError(err?.message || 'Error al enviar');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Título y mensaje son requeridos');
      return;
    }
    setError('');
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Enviar Notificación</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Notificación</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="broadcast">Broadcast (Todos los usuarios)</option>
              <option value="system">Sistema</option>
              <option value="achievement">Logro</option>
              <option value="course">Curso</option>
              <option value="streak">Racha</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título de la notificación"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensaje</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Contenido del mensaje..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
              required
            />
          </div>

          {formData.type === 'broadcast' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Esta notificación será enviada a TODOS los usuarios registrados.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? 'Enviando...' : (
                <>
                  <Send className="w-4 h-4 mr-1" /> Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NotificationManagement() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTemplatesTab, setShowTemplatesTab] = useState(false);

  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery<{ data: { notifications: Notification[]; pagination: any } }>({
    queryKey: ['admin-notifications', typeFilter],
    queryFn: () => {
      const url = typeFilter ? `/admin/notifications?type=${typeFilter}` : '/admin/notifications';
      return fetchAPI<{ data: { notifications: Notification[]; pagination: any } }>(url);
    },
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery<{ data: { templates: NotificationTemplate[] } }>({
    queryKey: ['notification-templates'],
    queryFn: () => fetchAPI<{ data: { templates: NotificationTemplate[] } }>('/admin/notifications/templates'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(`/admin/notifications/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(`/admin/notifications/${id}/read`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return fetchAPI('/admin/notifications/read-all', { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      return fetchAPI('/admin/notifications/clear-all', { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const notifications = notificationsData?.data?.notifications || [];
  const templates = templatesData?.data?.templates || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Gestión de Notificaciones</h2>
            <p className="text-sm text-gray-500">Envía y gestiona notificaciones a los usuarios</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplatesTab(!showTemplatesTab)}>
            {showTemplatesTab ? 'Ver Notificaciones' : 'Ver Plantillas'}
          </Button>
          <Button onClick={() => setShowSendModal(true)}>
            <Send className="w-4 h-4 mr-1" /> Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-xs text-gray-500">Sin leer</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => markAllReadMutation.mutate()}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Marcar</p>
              <p className="text-xs text-gray-500">Leer todas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:bg-red-50" onClick={() => {
          if (confirm('¿Eliminar todas las notificaciones leídas?')) {
            clearAllMutation.mutate();
          }
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Limpiar</p>
              <p className="text-xs text-gray-500">Leídas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        <Button variant={typeFilter === null ? 'primary' : 'outline'} size="sm" onClick={() => setTypeFilter(null)}>
          Todas
        </Button>
        {Object.entries(typeConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Button key={key} variant={typeFilter === key ? 'primary' : 'outline'} size="sm" onClick={() => setTypeFilter(key)}>
              <Icon className="w-4 h-4 mr-1" /> {config.label}
            </Button>
          );
        })}
      </div>

      {showTemplatesTab ? (
        /* Templates View */
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Plantillas de Notificación</h3>
          {templatesLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando plantillas...</div>
          ) : templates.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay plantillas creadas</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const config = typeConfig[template.type as keyof typeof typeConfig] || typeConfig.system;

                return (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{template.title}</h4>
                          <p className="text-xs text-gray-400 font-mono">{template.key}</p>
                        </div>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.message}</p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {template.variables.map((v) => (
                            <span key={v} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {`{${v}}`}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                        <span className="text-xs text-gray-400">
                          {template.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => {
                          // Use template - open modal with pre-filled data
                          setShowSendModal(true);
                        }}>
                          Usar Plantilla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Notifications View */
        <>
          {notificationsLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando notificaciones...</div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.system;
                const Icon = config.icon;

                return (
                  <Card key={notification.id} className={`${notification.isRead ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-400">{formatDate(notification.createdAt)}</span>
                            {notification.user && (
                              <span className="text-xs text-gray-500">Para: {notification.user.name}</span>
                            )}
                            {notification.type === 'broadcast' && (
                              <Badge variant="secondary">Broadcast</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button size="sm" variant="ghost" onClick={() => markReadMutation.mutate(notification.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="hover:text-red-500" onClick={() => deleteMutation.mutate(notification.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <SendNotificationModal
          onClose={() => setShowSendModal(false)}
          onSuccess={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
}
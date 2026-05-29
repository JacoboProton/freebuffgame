'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClerkAPI } from '@/lib/clerk-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save, Plus, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'general' | 'features' | 'limits' | 'content';
  label: string;
  description: string | null;
  isPublic: boolean;
  updatedAt: string;
}

interface SettingsModalProps {
  setting: SystemSetting | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SettingsModal({ setting, onClose, onSuccess }: SettingsModalProps) {
  const { fetchAPI } = useClerkAPI();
  const [formData, setFormData] = useState({
    key: setting?.key || '',
    value: setting?.value || '',
    type: setting?.type || 'string',
    category: setting?.category || 'general',
    label: setting?.label || '',
    description: setting?.description || '',
    isPublic: setting?.isPublic || false,
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return fetchAPI(`/admin/settings/${data.key}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      onSuccess();
    },
    onError: (err: any) => {
      setError(err?.message || 'Error al guardar');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          {setting ? 'Editar Configuración' : 'Nueva Configuración'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clave</label>
            <Input
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value.replace(/\//g, '_') })}
              placeholder="setting_key_name"
              disabled={!!setting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            {formData.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, value: 'true' })}
                  className={`flex-1 p-2 rounded-lg border ${formData.value === 'true' ? 'bg-green-100 border-green-500' : 'bg-gray-50'}`}
                >
                  <Check className="w-4 h-4 mr-1 inline" /> Activado
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, value: 'false' })}
                  className={`flex-1 p-2 rounded-lg border ${formData.value === 'false' ? 'bg-red-100 border-red-500' : 'bg-gray-50'}`}
                >
                  <X className="w-4 h-4 mr-1 inline" /> Desactivado
                </button>
              </div>
            ) : (
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Valor de la configuración"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="string">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Booleano</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="general">General</option>
                <option value="features">Características</option>
                <option value="limits">Límites</option>
                <option value="content">Contenido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Etiqueta</label>
            <Input
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Nombre visible"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className="flex items-center gap-2"
            >
              {formData.isPublic ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-sm">Visible para usuarios</span>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const categoryLabels = {
  general: { label: 'General', color: 'bg-gray-100 text-gray-700' },
  features: { label: 'Características', color: 'bg-blue-100 text-blue-700' },
  limits: { label: 'Límites', color: 'bg-purple-100 text-purple-700' },
  content: { label: 'Contenido', color: 'bg-green-100 text-green-700' },
};

export function SystemSettings() {
  const { fetchAPI } = useClerkAPI();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: { settings: SystemSetting[] } }>({
    queryKey: ['admin-settings', categoryFilter],
    queryFn: () => {
      const url = categoryFilter ? `/admin/settings?category=${categoryFilter}` : '/admin/settings';
      return fetchAPI<{ data: { settings: SystemSetting[] } }>(url);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      return fetchAPI(`/admin/settings/${key}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  const settings = data?.data?.settings || [];

  const filteredSettings = settings.filter((s) =>
    s.key.toLowerCase().includes(search.toLowerCase()) ||
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayValue = (setting: SystemSetting) => {
    if (setting.type === 'boolean') {
      return setting.value === 'true' ? 'Activado' : 'Desactivado';
    }
    return setting.value;
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'string': return 'Texto';
      case 'number': return 'Número';
      case 'boolean': return 'Sí/No';
      case 'json': return 'JSON';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Configuración del Sistema</h2>
            <p className="text-sm text-gray-500">Gestiona settings y configuraciones de la plataforma</p>
          </div>
        </div>

        <Button onClick={() => { setEditingSetting(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Nueva Configuración
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Buscar configuraciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <div className="flex gap-2">
          <Button
            variant={categoryFilter === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            Todas
          </Button>
          {Object.entries(categoryLabels).map(([key, config]) => (
            <Button
              key={key}
              variant={categoryFilter === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Settings Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando configuraciones...</div>
      ) : filteredSettings.length === 0 ? (
        <Card className="p-12 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay configuraciones {categoryFilter ? `en ${categoryLabels[categoryFilter as keyof typeof categoryLabels].label}` : ''}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSettings.map((setting) => {
            const config = categoryLabels[setting.category as keyof typeof categoryLabels];

            return (
              <Card key={setting.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{setting.label}</h4>
                        {setting.isPublic && (
                          <Badge variant="secondary" className="text-xs">Público</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{setting.key}</p>
                    </div>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>

                  {setting.description && (
                    <p className="text-sm text-gray-500 mb-3">{setting.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {getDisplayValue(setting)}
                      </span>
                      <span className="text-xs text-gray-400">{formatType(setting.type)}</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingSetting(setting); setShowModal(true); }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:text-red-500"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${setting.label}"?`)) {
                            deleteMutation.mutate(setting.key);
                          }
                        }}
                      >
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

      {/* Modal */}
      {showModal && (
        <SettingsModal
          setting={editingSetting}
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
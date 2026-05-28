'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Trash2, Filter } from 'lucide-react';

interface ContentReport {
  id: string;
  reporterId: string;
  targetType: 'course' | 'lesson' | 'module' | 'user';
  targetId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  reviewedBy: string | null;
  reviewedAt: string | null;
  actionTaken: string | null;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
}

interface ReportsResponse {
  reports: ContentReport[];
  pagination: { page: number; pages: number; total: number };
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  reviewed: { label: 'Revisado', color: 'bg-blue-100 text-blue-700', icon: Eye },
  dismissed: { label: 'Descartado', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  action_taken: { label: 'Accion Tomada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const reasonLabels = {
  spam: 'Spam',
  inappropriate: 'Contenido Inapropiado',
  harassment: 'Acoso',
  other: 'Otro',
};

export function ContentModeration() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: ReportsResponse }>({
    queryKey: ['moderation-reports', page, statusFilter],
    queryFn: () => fetchAPI<{ data: ReportsResponse }>(
      `/admin/moderation/reports?status=${statusFilter}&page=${page}&limit=10`
    ),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, actionTaken }: { id: string; status: string; actionTaken?: string }) => {
      return fetchAPI(`/admin/moderation/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, actionTaken }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-reports'] });
      setSelectedReport(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(`/admin/moderation/reports/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-reports'] });
      setSelectedReport(null);
    },
  });

  const reports = data?.data?.reports || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Moderación de Contenido</h2>
            <p className="text-sm text-gray-500">Gestiona reportes de usuarios y contenido flagged</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['pending', 'reviewed', 'dismissed', 'action_taken', 'all'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {status === 'all' ? 'Todos' : status === 'action_taken' ? 'Acción Tomada' : statusConfig[status as keyof typeof statusConfig]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {['pending', 'reviewed', 'dismissed', 'action_taken'].map((status) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          const count = reports.filter((r) => r.status === status).length;

          return (
            <Card key={status} className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => { setStatusFilter(status); setPage(1); }}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count || pagination.total}</p>
                  <p className="text-xs text-gray-500">{config.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando reportes...</div>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay reportes {statusFilter !== 'all' && statusFilter !== 'pending' ? `(${statusFilter})` : ''}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const config = statusConfig[report.status];
            const Icon = config.icon;

            return (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="capitalize">
                            {report.targetType}
                          </Badge>
                          <Badge className={config.color}>
                            {config.label}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {reasonLabels[report.reason]}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mb-1">
                          Reportado por: {report.reporter.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.description || 'Sin descripción'}
                        </p>
                        {report.actionTaken && (
                          <p className="text-sm text-green-600 mt-1">
                            Acción: {report.actionTaken}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reviewMutation.mutate({ id: report.id, status: 'reviewed' })}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Revisar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500"
                            onClick={() => reviewMutation.mutate({ id: report.id, status: 'dismissed' })}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Descartar
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedReport(report)}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:text-red-500"
                        onClick={() => deleteMutation.mutate(report.id)}
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Anterior
          </Button>
          <span className="px-4 py-2 text-sm">Página {page} de {pagination.pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
            Siguiente
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Detalles del Reporte</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Tipo de Objetivo</label>
                  <p className="font-medium capitalize">{selectedReport.targetType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">ID del Objetivo</label>
                  <p className="font-medium text-sm font-mono">{selectedReport.targetId}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Razón</label>
                <p className="font-medium">{reasonLabels[selectedReport.reason]}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Descripción</label>
                <p className="text-sm">{selectedReport.description || 'Sin descripción'}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Reportado por</label>
                <p className="text-sm">{selectedReport.reporter.name} ({selectedReport.reporter.email})</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Fecha</label>
                <p className="text-sm">{formatDate(selectedReport.createdAt)}</p>
              </div>

              {selectedReport.reviewedAt && (
                <div>
                  <label className="text-sm text-gray-500">Revisado</label>
                  <p className="text-sm">{formatDate(selectedReport.reviewedAt)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedReport.status === 'pending' && (
                <>
                  <Button
                    onClick={() => reviewMutation.mutate({ id: selectedReport.id, status: 'action_taken', actionTaken: 'Contenido eliminado' })}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Tomar Acción
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => reviewMutation.mutate({ id: selectedReport.id, status: 'dismissed' })}
                    className="flex-1"
                  >
                    Descartar
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => setSelectedReport(null)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
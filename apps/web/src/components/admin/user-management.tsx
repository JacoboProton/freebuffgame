'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirm } from './delete-confirm';

interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  role: string;
  createdAt: string;
  lastActiveAt: string;
  _count: {
    enrollments: number;
    achievements: number;
    gameScores: number;
    purchases: number;
  };
}

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    xp: user?.xp || 0,
    level: user?.level || 1,
    coins: user?.coins || 0,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    role: user?.role || 'user',
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return fetchAPI(`/admin/users/${user?.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">XP</label>
              <Input
                type="number"
                value={formData.xp}
                onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nivel</label>
              <Input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monedas</label>
              <Input
                type="number"
                value={formData.coins}
                onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Racha Actual</label>
              <Input
                type="number"
                value={formData.currentStreak}
                onChange={(e) => setFormData({ ...formData, currentStreak: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
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

export function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => fetchAPI<{ data: { users: User[]; pagination: { page: number; pages: number; total: number } } }>(
      `/admin/users?page=${page}&limit=20&search=${search}`
    ),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return fetchAPI(`/admin/users/${userId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToDelete(null);
    },
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />
        <span className="text-sm text-gray-500">
          {pagination.total} usuario{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron usuarios</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Nivel</th>
                <th className="px-4 py-3 text-left text-sm font-medium">XP</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actividad</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estadísticas</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {users.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Nivel {user.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-amber-500 font-medium">{user.xp.toLocaleString()} XP</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-gray-500">Último: {getRelativeTime(user.lastActiveAt)}</p>
                      <p className="text-xs text-gray-400">Registro: {formatDate(user.createdAt)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                        {user._count?.enrollments || 0} cursos
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded">
                        {user._count?.achievements || 0} logros
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailUser(user)}
                        title="Ver detalles"
                      >
                        👁️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        title="Editar"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserToDelete(user.id)}
                        title="Eliminar"
                        className="hover:text-red-500"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-sm">
            Página {page} de {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => setSelectedUser(null)}
        />
      )}

      {/* Delete Confirmation */}
      {userToDelete && (
        <DeleteConfirm
          title="Eliminar Usuario"
          message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
          onConfirm={() => deleteMutation.mutate(userToDelete)}
          onClose={() => setUserToDelete(null)}
        />
      )}

      {/* User Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {detailUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{detailUser.name}</h2>
                <p className="text-gray-500">{detailUser.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {detailUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{detailUser.level}</p>
                <p className="text-sm text-gray-500">Nivel</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{detailUser.xp.toLocaleString()}</p>
                <p className="text-sm text-gray-500">XP Total</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{detailUser.coins}</p>
                <p className="text-sm text-gray-500">Monedas</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-500">Racha Actual</span>
                <span className="font-medium">🔥 {detailUser.currentStreak} días</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-500">Racha Más Larga</span>
                <span className="font-medium">⭐ {detailUser.longestStreak} días</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-500">Cursos Inscritos</span>
                <span className="font-medium">{detailUser._count?.enrollments || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-500">Logros Desbloqueados</span>
                <span className="font-medium">{detailUser._count?.achievements || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-500">Partidas Jugadas</span>
                <span className="font-medium">{detailUser._count?.gameScores || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Miembro desde</span>
                <span className="font-medium">{formatDate(detailUser.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setSelectedUser(detailUser)} className="flex-1">
                Editar Usuario
              </Button>
              <Button variant="ghost" onClick={() => setDetailUser(null)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { apiClient, API_BASE_URL } from '../../shared/api';

export const menuService = {
  getAll: () => apiClient('/admin/menu-items'),

  create: (data) => apiClient('/admin/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiClient(`/admin/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  remove: (id) => apiClient(`/admin/menu-items/${id}`, { method: 'DELETE' }),

  // FormData upload — must bypass apiClient's Content-Type: application/json
  upload: async (id, file) => {
    const token = localStorage.getItem('admin_token');
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API_BASE_URL}/admin/menu-items/${id}/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });

    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir el archivo');
    }

    return res.json();
  },

  reorder: (items) => apiClient('/admin/menu-items/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }),
};

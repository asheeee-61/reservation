import { CONFIG } from '../config';
export const API_BASE_URL = CONFIG.API_BASE_URL;

const cache = new Map();
const CACHEABLE_ENDPOINTS = [
  '/admin/zones',
  '/admin/events',
  '/config'
];

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('admin_token');
  const method = options.method || 'GET';

  // Module-level caching for static data
  if (method === 'GET' && CACHEABLE_ENDPOINTS.includes(endpoint.split('?')[0])) {
    if (cache.has(endpoint)) {
      return cache.get(endpoint);
    }
  }

  // Clear relevant cache on mutations
  if (method !== 'GET') {
    const basesToClear = [];
    if (endpoint.includes('/admin/zones')) basesToClear.push('/admin/zones');
    if (endpoint.includes('/admin/events')) basesToClear.push('/admin/events');
    if (endpoint.includes('/admin/config') || endpoint.includes('/config')) basesToClear.push('/config');
    
    for (const key of cache.keys()) {
      if (basesToClear.some(base => key.includes(base))) {
        cache.delete(key);
      }
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle auth errors globally:
  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    throw new Error('Sesión expirada');
  }

  // Handle not found:
  if (response.status === 404) {
    throw new Error('Recurso no encontrado');
  }

  // Handle server errors:
  if (response.status >= 500) {
    throw new Error('Error del servidor');
  }

  if (!response.ok) {
    let errorMessage = 'Error desconocido';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  const result = response.status === 204 ? null : await response.json();

  // Store in cache if cacheable
  if (method === 'GET' && CACHEABLE_ENDPOINTS.includes(endpoint.split('?')[0])) {
    cache.set(endpoint, result);
  }

  return result;
};

export const clearCache = (endpoint) => {
  if (endpoint) {
    cache.delete(endpoint);
  } else {
    cache.clear();
  }
};

export const mockFetch = (data, delay = 1000) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Alias requested in user prompt
export const apiFetch = apiClient;

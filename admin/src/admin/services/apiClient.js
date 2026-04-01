export const API_BASE_URL = 'http://localhost:8000/api';

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
    if (endpoint.includes('/admin/zones')) cache.delete('/admin/zones');
    if (endpoint.includes('/admin/events')) cache.delete('/admin/events');
    if (endpoint.includes('/admin/config')) cache.delete('/admin/config');
    if (endpoint.includes('/config')) cache.delete('/config');
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

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      // Potential redirect if needed
    }
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  const result = await response.json();

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

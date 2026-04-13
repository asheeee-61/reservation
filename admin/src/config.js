export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  NOTICE_URL: import.meta.env.VITE_NOTICE_SYSTEM_URL || 'http://localhost:3001',
  NOTICE_TOKEN: import.meta.env.VITE_NOTICE_TOKEN || '',
};

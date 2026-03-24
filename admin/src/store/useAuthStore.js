import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('admin_token') || null,
  user: null,
  login: (token, user) => {
    localStorage.setItem('admin_token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, user: null });
  }
}));

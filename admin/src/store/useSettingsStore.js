import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

export const useSettingsStore = create((set) => ({
  globalHours: {
    openingTime: '09:00',
    closingTime: '00:00',
    defaultInterval: 30
  },
  loading: false,
  fetchGlobalHours: async () => {
    set({ loading: true });
    try {
      const data = await apiClient('/config');
      set({ 
        globalHours: {
          openingTime: data.global_opening_time || '09:00',
          closingTime: data.global_closing_time || '00:00',
          defaultInterval: data.default_interval || 30
        },
        loading: false
      });
    } catch (e) {
      console.error('Failed to fetch global hours', e);
      set({ loading: false });
    }
  },
  setGlobalHours: (hours) => set({ globalHours: hours })
}));

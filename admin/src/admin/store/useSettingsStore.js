import { create } from 'zustand';
import { apiClient } from '../../shared/api';

export const useSettingsStore = create((set) => ({
  globalHours: {
    openingTime: '09:00',
    closingTime: '00:00',
    defaultInterval: 30
  },
  globalSettings: {
    minGuests: 1,
    maxGuests: 10
  },
  adminCalendar: {
    schedule: {},
    blockedDays: []
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
          defaultInterval: data.default_interval || 30,
          whatsapp_phone: data.whatsapp_phone || '',
          instagram_username: data.instagram_username || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          address: data.address || '',
          review_link: data.review_link || '',
          google_maps_link: data.google_maps_link || '',
          menu_pdf_url: data.menu_pdf_url || '',
          reservation_link: data.reservation_link || '',
          logo_url: data.logo_url || '',
        },
        globalSettings: {
          minGuests: data.minGuests || 1,
          maxGuests: data.maxGuests || 10,
          openingTime: data.global_opening_time || '09:00',
          closingTime: data.global_closing_time || '00:00'
        },
        adminCalendar: {
          schedule: data.schedule || {},
          blockedDays: data.blockedDays || []
        },
        loading: false
      });
    } catch (e) {
      console.error('Failed to fetch global config', e);
      set({ loading: false });
    }
  },
  setGlobalHours: (hours) => set((state) => ({ globalHours: { ...state.globalHours, ...hours } }))
}));

import { create } from 'zustand';

export const useReservationStore = create((set) => ({
  date: new Date().toISOString().split('T')[0],
  guests: 2,
  selectedSlot: null, // { time, area }
  userData: {
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  },
  config: null,
  showTerms: false,
  loading: false,
  error: null,
  
  setDate: (date) => set({ date, selectedSlot: null }),
  setGuests: (guests) => set({ guests, selectedSlot: null }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setUserData: (userData) => set((state) => ({ userData: { ...state.userData, ...userData } })),
  setConfig: (config) => set({ config }),
  setShowTerms: (showTerms) => set({ showTerms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set((state) => ({
    date: new Date().toISOString().split('T')[0],
    guests: state.config?.minGuests || 1,
    selectedSlot: null,
    userData: { name: '', email: '', phone: '', specialRequests: '' },
    loading: false,
    error: null
  }))
}));

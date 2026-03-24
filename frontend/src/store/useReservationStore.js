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
  step: 'selection', // 'selection' | 'confirmation' | 'success'
  reservationId: null,
  config: null,
  showTerms: false,
  loading: false,
  error: null,
  
  setStep: (step) => set({ step }),
  setReservationId: (reservationId) => set({ reservationId }),
  setDate: (date) => set({ date, selectedSlot: null }),
  setGuests: (guests) => set({ guests, selectedSlot: null }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setUserData: (userData) => set((state) => ({ userData: { ...state.userData, ...userData } })),
  setConfig: (config) => set({ config }),
  setShowTerms: (showTerms) => set({ showTerms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set((state) => ({
    step: 'selection',
    reservationId: null,
    date: new Date().toISOString().split('T')[0],
    guests: state.config?.minGuests || 1,
    selectedSlot: null,
    userData: { name: '', email: '', phone: '', specialRequests: '' },
    loading: false,
    error: null
  }))
}));

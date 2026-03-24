import { create } from 'zustand';

export const useReservationStore = create((set) => ({
  date: null, // yyyy-mm-dd format
  guests: 2,
  selectedTime: null, // "12:00" format
  userData: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  },
  loading: false,
  error: null,
  
  setDate: (date) => set({ date, selectedTime: null }),
  setGuests: (guests) => set({ guests, selectedTime: null }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setUserData: (userData) => set((state) => ({ userData: { ...state.userData, ...userData } })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    date: null,
    guests: 2,
    selectedTime: null,
    userData: { firstName: '', lastName: '', email: '', phone: '', specialRequests: '' },
    loading: false,
    error: null
  })
}));

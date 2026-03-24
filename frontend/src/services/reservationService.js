import { mockFetch } from './apiClient';

const API_BASE_URL = 'http://localhost:8000/api';

export const getConfig = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  } catch (e) {
    console.error(e);
    // Fallback if backend is down
    return {
      maxGuests: 10, minGuests: 1,
      restaurant: {
        name: "Hotaru Madrid",
        address: "Calle de Alcalá 99, 28009 Madrid",
        lat: 40.4214, lng: -3.6846
      }
    };
  }
};

export const getAvailableSlots = async (date, guests) => {
  // Mock remaining for slots logic until backend logic is developed
  const mockSlots = [
    { time: "18:00", available: true },
    { time: "18:30", available: true },
    { time: "19:00", available: false },
    { time: "19:30", available: true },
    { time: "20:00", available: true },
    { time: "20:30", available: true },
  ];
  return mockFetch(mockSlots, 800);
};

export const createReservation = async (reservationData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    
    if (!res.ok) throw new Error('Failed to book');
    
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return { success: false, message: 'API error' };
  }
};

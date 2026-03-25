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
  if (!date) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/slots?date=${date}&guests=${guests}`);
    if (!res.ok) throw new Error('Failed to fetch slots');
    const data = await res.json();
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const createReservation = async (reservationData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    
    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        // Extract first validation error
        const firstErrorKey = Object.keys(data.errors)[0];
        throw new Error(data.errors[firstErrorKey][0]);
      }
      throw new Error(data.message || 'Failed to book');
    }
    
    return data;
  } catch (e) {
    console.error(e);
    return { success: false, message: e.message || 'API error' };
  }
};

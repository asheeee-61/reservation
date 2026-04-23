import { mockFetch } from '../../shared/api';
import { CONFIG } from '../../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

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
      business: {
        name: "Hechizo Hookah Lounge",
        address: "Cam. de los Romanos, 91, 30820 Alcantarilla, Murcia, Spain",
        lat: 37.96453860395277, lng: -1.2172339712475693
      },
      logo_url: null,
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
export const getZones = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/zones`);
    if (!res.ok) throw new Error('Failed to fetch zones');
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getEvents = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/events`);
    if (!res.ok) throw new Error('Failed to fetch special events');
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

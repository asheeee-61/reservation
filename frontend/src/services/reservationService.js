import { mockFetch } from './apiClient';

export const getConfig = async () => {
  return mockFetch({
    maxGuests: 10,
    minGuests: 1,
    restaurant: {
      name: "Hotaru Madrid", // Dynamic name from "server"
      address: "Calle de Alcalá 99, 28009 Madrid", // Dynamic location address
      lat: 40.4214, // Real coordinates for Alcalá 99
      lng: -3.6846
    }
  }, 500);
};

export const getAvailableSlots = async (date, guests) => {
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
  return mockFetch({
    success: true,
    reservationId: `#${Math.floor(1000 + Math.random() * 9000)}`
  }, 1200);
};

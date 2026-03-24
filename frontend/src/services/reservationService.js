import { mockFetch } from './apiClient';

export const getAvailableSlots = async (date, guests) => {
  // Simulate latency
  const mockSlots = [
    { time: "11:30", available: false },
    { time: "12:00", available: true },
    { time: "12:30", available: false },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "18:00", available: true },
    { time: "18:30", available: false },
    { time: "19:00", available: true },
    { time: "19:30", available: true },
    { time: "20:00", available: false },
  ];
  return mockFetch(mockSlots, 800);
};

export const createReservation = async (reservationData) => {
  // Return success
  return mockFetch({
    success: true,
    reservationId: `RES-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
  }, 1200);
};

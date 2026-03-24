export const API_BASE_URL = 'https://api.example.com/v1'; // Dummy for future usage

// Generic mock fetcher function
export const mockFetch = (data, delay = 1000) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

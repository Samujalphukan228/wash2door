// src/lib/api/bookings.js
import apiClient from './client';

export const bookingsApi = {
  // Create new booking
  createBooking: async (data) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  // Get my bookings
  getMyBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/bookings/my-bookings?${params.toString()}`);
    return response.data;
  },

  // Get single booking
  getBooking: async (bookingId) => {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    const response = await apiClient.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
};
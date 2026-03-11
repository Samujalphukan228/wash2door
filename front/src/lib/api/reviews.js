// src/lib/api/reviews.js
import apiClient from './client';

export const reviewsApi = {
  // Create review
  createReview: async (data) => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  // Get my reviews
  getMyReviews: async (page = 1, limit = 10) => {
    const response = await apiClient.get(
      `/reviews/my-reviews?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Check if can review a booking
  canReview: async (bookingId) => {
    const response = await apiClient.get(`/reviews/can-review/${bookingId}`);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, data) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};
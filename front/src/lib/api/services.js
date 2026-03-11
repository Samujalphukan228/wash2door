// src/lib/api/services.js
import apiClient from './client';

export const servicesApi = {
  // Get all active services (public)
  getServices: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get(`/public/services?${params.toString()}`);
    return response.data;
  },

  // Get single service details (public)
  getServiceDetails: async (serviceId) => {
    const response = await apiClient.get(`/public/services/${serviceId}`);
    return response.data;
  },

  // Get service with pricing for booking
  getServicePricing: async (serviceId) => {
    const response = await apiClient.get(`/bookings/pricing/${serviceId}`);
    return response.data;
  },

  // Get service reviews (public)
  getServiceReviews: async (serviceId, options = {}) => {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.rating) params.append('rating', options.rating.toString());

    const response = await apiClient.get(
      `/public/services/${serviceId}/reviews?${params.toString()}`
    );
    return response.data;
  },

  // Get categories (public)
  getCategories: async () => {
    const response = await apiClient.get('/public/categories');
    return response.data;
  },

  // Check availability
  checkAvailability: async (serviceId, date) => {
    const response = await apiClient.get(
      `/bookings/availability?serviceId=${serviceId}&date=${date}`
    );
    return response.data;
  },
};
// src/services/publicService.js

import axiosInstance from '@/lib/axios';

const publicService = {
    // Get active services (public)
    getActiveServices: async (params) => {
        const response = await axiosInstance.get('/public/services', { params });
        return response.data;
    },

    // Get featured services
    getFeaturedServices: async (limit = 6) => {
        const response = await axiosInstance.get('/public/services/featured', {
            params: { limit }
        });
        return response.data;
    },

    // Get service details
    getServiceDetails: async (serviceId) => {
        const response = await axiosInstance.get(`/public/services/${serviceId}`);
        return response.data;
    },

    // Get service reviews
    getServiceReviews: async (serviceId, params) => {
        const response = await axiosInstance.get(
            `/public/services/${serviceId}/reviews`,
            { params }
        );
        return response.data;
    },

    // Get categories
    getCategories: async (withServiceCount = true) => {
        const response = await axiosInstance.get('/public/categories', {
            params: { withServiceCount }
        });
        return response.data;
    },

    // Check availability
    checkAvailability: async (serviceId, date) => {
        const response = await axiosInstance.get('/public/availability', {
            params: { serviceId, date }
        });
        return response.data;
    }
};

export default publicService;
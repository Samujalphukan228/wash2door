import axiosInstance from '@/lib/axios';

const publicService = {
    getActiveServices: async (params) => {
        const response = await axiosInstance.get('/public/services', { params });
        return response.data;
    },

    getFeaturedServices: async (limit = 6) => {
        const response = await axiosInstance.get('/public/services/featured', {
            params: { limit }
        });
        return response.data;
    },

    getServiceDetails: async (serviceId) => {
        const response = await axiosInstance.get(`/public/services/${serviceId}`);
        return response.data;
    },

    getServiceReviews: async (serviceId, params) => {
        const response = await axiosInstance.get(
            `/public/services/${serviceId}/reviews`,
            { params }
        );
        return response.data;
    },

    getCategories: async (withServiceCount = true) => {
        const response = await axiosInstance.get('/public/categories', {
            params: { withServiceCount }
        });
        return response.data;
    },

    checkAvailability: async (serviceId, date) => {
        const response = await axiosInstance.get('/public/availability', {
            params: { serviceId, date }
        });
        return response.data;
    }
};

export default publicService;
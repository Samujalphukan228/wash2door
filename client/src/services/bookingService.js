// src/services/bookingService.js - FIXED

import axiosInstance from '@/lib/axios';

const bookingService = {
    // Get service pricing
    getServicePricing: async (serviceId) => {
        const response = await axiosInstance.get(`/bookings/pricing/${serviceId}`);
        return response.data;
    },

    // ✅ FIXED: Check availability (no serviceId needed)
    checkAvailability: async (date) => {
        const response = await axiosInstance.get('/bookings/availability', {
            params: { date }
        });
        return response.data;
    },

    // Create booking (requires auth)
    create: async (bookingData) => {
        const response = await axiosInstance.post('/bookings', bookingData);
        return response.data;
    },

    // Get my bookings
    getMyBookings: async (params) => {
        const response = await axiosInstance.get('/bookings/my-bookings', { params });
        return response.data;
    },

    // Get single booking
    getById: async (bookingId) => {
        const response = await axiosInstance.get(`/bookings/${bookingId}`);
        return response.data;
    },

    // Cancel booking
    cancel: async (bookingId, reason) => {
        const response = await axiosInstance.put(
            `/bookings/${bookingId}/cancel`,
            { reason }
        );
        return response.data;
    },

    // Reschedule booking
    reschedule: async (bookingId, newDate, newTimeSlot) => {
        const response = await axiosInstance.put(
            `/bookings/${bookingId}/reschedule`,
            { newDate, newTimeSlot }
        );
        return response.data;
    }
};

export default bookingService;
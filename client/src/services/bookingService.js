import axiosInstance from '@/lib/axios';

const bookingService = {
    getServicePricing: async (serviceId) => {
        const response = await axiosInstance.get(`/bookings/pricing/${serviceId}`);
        return response.data;
    },

    checkAvailability: async (date, includeAdminSlots = false) => {
        const response = await axiosInstance.get('/bookings/availability', {
            params: { 
                date,
                includeAdminSlots: includeAdminSlots ? 'true' : undefined
            }
        });
        return response.data;
    },

    create: async (bookingData) => {
        const response = await axiosInstance.post('/bookings', bookingData);
        return response.data;
    },

    getMyBookings: async (params) => {
        const response = await axiosInstance.get('/bookings/my-bookings', { params });
        return response.data;
    },

    getById: async (bookingId) => {
        const response = await axiosInstance.get(`/bookings/${bookingId}`);
        return response.data;
    },

    cancel: async (bookingId, reason) => {
        const response = await axiosInstance.put(
            `/bookings/${bookingId}/cancel`,
            { reason }
        );
        return response.data;
    },

    reschedule: async (bookingId, newDate, newTimeSlot) => {
        const response = await axiosInstance.put(
            `/bookings/${bookingId}/reschedule`,
            { newDate, newTimeSlot }
        );
        return response.data;
    }
};

export default bookingService;
// src/services/adminService.js

import axiosInstance from '@/lib/axios';

const adminService = {

    // ============================================
    // Dashboard
    // ============================================
    getDashboardStats: async () => {
        const response = await axiosInstance.get('/admin/dashboard/stats');
        return response.data;
    },

    // ============================================
    // Users
    // ============================================
    getAllUsers: async (params) => {
        const response = await axiosInstance.get('/admin/users', { params });
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await axiosInstance.get(`/admin/users/${userId}`);
        return response.data;
    },

    blockUser: async (userId, reason) => {
        const response = await axiosInstance.put(
            `/admin/users/${userId}/block`,
            { reason }
        );
        return response.data;
    },

    unblockUser: async (userId) => {
        const response = await axiosInstance.put(`/admin/users/${userId}/unblock`);
        return response.data;
    },

    changeUserRole: async (userId, role) => {
        const response = await axiosInstance.put(
            `/admin/users/${userId}/role`,
            { role }
        );
        return response.data;
    },

    // ============================================
    // Bookings
    // ============================================
    getAllBookings: async (params) => {
        const response = await axiosInstance.get('/admin/bookings', { params });
        return response.data;
    },

    getBookingById: async (bookingId) => {
        const response = await axiosInstance.get(`/admin/bookings/${bookingId}`);
        return response.data;
    },

    updateBookingStatus: async (bookingId, status, reason) => {
        const response = await axiosInstance.put(
            `/admin/bookings/${bookingId}/status`,
            { status, reason }
        );
        return response.data;
    },

    createAdminBooking: async (data) => {
        const response = await axiosInstance.post('/admin/bookings', data);
        return response.data;
    },

    // ============================================
    // Walk-in Customers
    // ============================================
    searchWalkInCustomers: async (query) => {
        const response = await axiosInstance.get('/admin/walkin-customers/search', {
            params: { q: query }
        });
        return response.data;
    },

    getRecentWalkInCustomers: async (limit = 5) => {
        const response = await axiosInstance.get('/admin/walkin-customers/recent', {
            params: { limit }
        });
        return response.data;
    },

    getAllWalkInCustomers: async (params) => {
        const response = await axiosInstance.get('/admin/walkin-customers', { params });
        return response.data;
    },

    getWalkInCustomerById: async (customerId) => {
        const response = await axiosInstance.get(`/admin/walkin-customers/${customerId}`);
        return response.data;
    },

    createWalkInCustomer: async (data) => {
        const response = await axiosInstance.post('/admin/walkin-customers', data);
        return response.data;
    },

    updateWalkInCustomer: async (customerId, data) => {
        const response = await axiosInstance.put(
            `/admin/walkin-customers/${customerId}`,
            data
        );
        return response.data;
    },

    deleteWalkInCustomer: async (customerId) => {
        const response = await axiosInstance.delete(`/admin/walkin-customers/${customerId}`);
        return response.data;
    },

    // ============================================
    // Reviews
    // ============================================
    getAllReviews: async (params) => {
        const response = await axiosInstance.get('/admin/reviews', { params });
        return response.data;
    },

    toggleReviewVisibility: async (reviewId) => {
        const response = await axiosInstance.put(`/admin/reviews/${reviewId}/toggle`);
        return response.data;
    },

    // ============================================
    // Reports
    // ============================================
    getRevenueReport: async (params) => {
        const response = await axiosInstance.get('/admin/reports/revenue', { params });
        return response.data;
    },

    getBookingReport: async (params) => {
        const response = await axiosInstance.get('/admin/reports/bookings', { params });
        return response.data;
    }
};

export default adminService;
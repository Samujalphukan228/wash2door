import axiosInstance from '@/lib/axios';

const adminService = {

    // ============================================
    // DASHBOARD
    // ============================================
    getDashboardStats: async () => {
        const response = await axiosInstance.get('/admin/dashboard/stats');
        return response.data;
    },

    // ============================================
    // USERS
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
    // BOOKINGS
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

    getBookingCleanupStats: async () => {
        const response = await axiosInstance.get('/admin/bookings/cleanup/stats');
        return response.data;
    },

    cleanupOldBookings: async (olderThanDays = 90, status = 'completed', dryRun = false) => {
        const response = await axiosInstance.delete('/admin/bookings/cleanup', {
            params: {
                olderThanDays,
                status,
                dryRun: dryRun ? 'true' : 'false'
            }
        });
        return response.data;
    },

    // ============================================
    // WALK-IN CUSTOMERS
    // ============================================
    getAllWalkInCustomers: async (params) => {
        const response = await axiosInstance.get('/admin/walkin-customers', { params });
        return response.data;
    },

    getRecentWalkInCustomers: async (limit = 5) => {
        const response = await axiosInstance.get('/admin/walkin-customers/recent', {
            params: { limit }
        });
        return response.data;
    },

    searchWalkInCustomers: async (query) => {
        const response = await axiosInstance.get('/admin/walkin-customers/search', {
            params: { q: query }
        });
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
        const response = await axiosInstance.delete(
            `/admin/walkin-customers/${customerId}`
        );
        return response.data;
    },

    // ✅ NEW: Fix all old customers missing address/city
    bulkUpdateWalkInCustomers: async () => {
        const response = await axiosInstance.put(
            '/admin/walkin-customers/bulk-update'
        );
        return response.data;
    },

    // ============================================
    // REPORTS
    // ============================================
    getRevenueReport: async (params) => {
        const response = await axiosInstance.get('/admin/reports/revenue', { params });
        return response.data;
    },

    getBookingReport: async (params) => {
        const response = await axiosInstance.get('/admin/reports/bookings', { params });
        return response.data;
    },

    // ============================================
    // REVIEWS
    // ============================================
    getAllReviews: async (params) => {
        const response = await axiosInstance.get('/admin/reviews', { params });
        return response.data;
    },

    toggleReviewVisibility: async (reviewId) => {
        const response = await axiosInstance.put(`/admin/reviews/${reviewId}/toggle`);
        return response.data;
    }

};

export default adminService;
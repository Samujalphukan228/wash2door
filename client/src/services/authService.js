// src/services/authService.js

import axiosInstance from '@/lib/axios';

const authService = {
    // Register
    register: async (data) => {
        const response = await axiosInstance.post('/auth/register', data);
        return response.data;
    },

    // Verify OTP
    verifyOTP: async (email, otp) => {
        const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    // Resend OTP
    resendOTP: async (email) => {
        const response = await axiosInstance.post('/auth/resend-otp', { email });
        return response.data;
    },

    // Login
    login: async (email, password) => {
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    },

    // Get current user
    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },

    // Get user stats
    getUserStats: async () => {
        const response = await axiosInstance.get('/auth/me/stats');
        return response.data;
    },

    // Refresh token
    refreshToken: async () => {
        const response = await axiosInstance.post('/auth/refresh-token');
        return response.data;
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await axiosInstance.put('/auth/update-profile', data);
        return response.data;
    },

    // Update avatar
    updateAvatar: async (formData) => {
        const response = await axiosInstance.put('/auth/update-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Change password
    changePassword: async (data) => {
        const response = await axiosInstance.put('/auth/change-password', data);
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (token, password) => {
        const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
            password
        });
        return response.data;
    },

    // Deactivate account
    deactivateAccount: async (password) => {
        const response = await axiosInstance.delete('/auth/deactivate', {
            data: { password }
        });
        return response.data;
    }
};

export default authService;
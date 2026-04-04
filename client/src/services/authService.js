import axiosInstance from '@/lib/axios';

const authService = {
    register: async (data) => {
        const response = await axiosInstance.post('/auth/register', data);
        return response.data;
    },

    verifyOTP: async (email, otp) => {
        const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resendOTP: async (email) => {
        const response = await axiosInstance.post('/auth/resend-otp', { email });
        return response.data;
    },

    login: async (email, password) => {
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },

    getUserStats: async () => {
        const response = await axiosInstance.get('/auth/me/stats');
        return response.data;
    },

    refreshToken: async () => {
        const response = await axiosInstance.post('/auth/refresh-token');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await axiosInstance.put('/auth/update-profile', data);
        return response.data;
    },

    updateAvatar: async (formData) => {
        const response = await axiosInstance.put('/auth/update-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    changePassword: async (data) => {
        const response = await axiosInstance.put('/auth/change-password', data);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
            password
        });
        return response.data;
    },

    deactivateAccount: async (password) => {
        const response = await axiosInstance.delete('/auth/deactivate', {
            data: { password }
        });
        return response.data;
    }
};

export default authService;
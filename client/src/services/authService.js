import axiosInstance from '@/lib/axios';

const authService = {

    // Login
    login: async (email, password) => {
        const response = await axiosInstance.post('/auth/login', {
            email,
            password
        });
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

    // Refresh token
    refreshToken: async () => {
        const response = await axiosInstance.post('/auth/refresh-token');
        return response.data;
    },

    // Change password
    changePassword: async (data) => {
        const response = await axiosInstance.put(
            '/auth/change-password',
            data
        );
        return response.data;
    }
};

export default authService;
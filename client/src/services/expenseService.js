import axiosInstance from '@/lib/axios';

const expenseService = {
    getCategories: async () => {
        const response = await axiosInstance.get('/expenses/categories');
        return response.data;
    },

    createCategory: async (categoryName) => {
        const response = await axiosInstance.post('/expenses/categories', { categoryName });
        return response.data;
    },

    updateCategory: async (categoryId, categoryName) => {
        const response = await axiosInstance.put(`/expenses/categories/${categoryId}`, { categoryName });
        return response.data;
    },

    deleteCategory: async (categoryId) => {
        const response = await axiosInstance.delete(`/expenses/categories/${categoryId}`);
        return response.data;
    },

    getAll: async (params) => {
        const response = await axiosInstance.get('/expenses', { params });
        return response.data;
    },

    getById: async (expenseId) => {
        const response = await axiosInstance.get(`/expenses/${expenseId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axiosInstance.post('/expenses', data);
        return response.data;
    },

    update: async (expenseId, data) => {
        const response = await axiosInstance.put(`/expenses/${expenseId}`, data);
        return response.data;
    },

    delete: async (expenseId) => {
        const response = await axiosInstance.delete(`/expenses/${expenseId}`);
        return response.data;
    },

    getSummary: async (params) => {
        const response = await axiosInstance.get('/expenses/summary', { params });
        return response.data;
    }
};

export default expenseService;
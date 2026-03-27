import axiosInstance from '@/lib/axios';

const expenseService = {
    // Create category
    createCategory: async (categoryData) => {
        const response = await axiosInstance.post('/expenses/category', categoryData);
        return response.data;
    },

    // Get all categories
    getAllCategories: async () => {
        const response = await axiosInstance.get('/expenses/categories');
        return response.data;
    },

    // Add expense
    addExpense: async (expenseData) => {
        const response = await axiosInstance.post('/expenses/add', expenseData);
        return response.data;
    },

    // Cleanup old expenses
    cleanupOldExpenses: async () => {
        const response = await axiosInstance.delete('/expenses/cleanup');
        return response.data;
    }
};

export default expenseService;
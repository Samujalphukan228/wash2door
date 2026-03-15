// src/services/subcategoryService.js

import axiosInstance from '@/lib/axios';

const subcategoryService = {
    // Get all subcategories
    getAll: async (params) => {
        const response = await axiosInstance.get('/subcategories', { params });
        return response.data;
    },

    // Get subcategories by category (for dropdown/filter)
    getByCategory: async (categoryId) => {
        const response = await axiosInstance.get(`/subcategories/category/${categoryId}`);
        return response.data;
    },

    // Get single subcategory
    getById: async (subcategoryId) => {
        const response = await axiosInstance.get(`/subcategories/${subcategoryId}`);
        return response.data;
    },

    // Create subcategory
    create: async (formData) => {
        const response = await axiosInstance.post('/subcategories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Update subcategory
    update: async (subcategoryId, formData) => {
        const response = await axiosInstance.put(
            `/subcategories/${subcategoryId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // Delete subcategory
    delete: async (subcategoryId) => {
        const response = await axiosInstance.delete(`/subcategories/${subcategoryId}`);
        return response.data;
    },

    // Toggle active status
    toggleStatus: async (subcategoryId) => {
        const response = await axiosInstance.patch(`/subcategories/${subcategoryId}/toggle`);
        return response.data;
    },

    // Reorder subcategories
    reorder: async (orderedIds) => {
        const response = await axiosInstance.put('/subcategories/reorder/bulk', {
            orderedIds
        });
        return response.data;
    }
};

export default subcategoryService;
// src/services/categoryService.js - COMPLETE FILE

import axiosInstance from '@/lib/axios';

const categoryService = {
    getAll: async (params) => {
        const response = await axiosInstance.get('/categories', { params });
        return response.data;
    },

    getById: async (categoryId) => {
        const response = await axiosInstance.get(`/categories/${categoryId}`);
        return response.data;
    },

    create: async (formData) => {
        const response = await axiosInstance.post('/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (categoryId, formData) => {
        const response = await axiosInstance.put(
            `/categories/${categoryId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    delete: async (categoryId) => {
        const response = await axiosInstance.delete(`/categories/${categoryId}`);
        return response.data;
    },

    toggleStatus: async (categoryId) => {
        const response = await axiosInstance.patch(`/categories/${categoryId}/toggle`);
        return response.data;
    },

    reorder: async (orderedIds) => {
        const response = await axiosInstance.put('/categories/reorder/bulk', {
            orderedIds
        });
        return response.data;
    }
};

export default categoryService;
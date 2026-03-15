// src/services/serviceService.js - COMPLETE FILE

import axiosInstance from '@/lib/axios';

const serviceService = {
    // Get all services (admin)
    getAll: async (params) => {
        const response = await axiosInstance.get('/services', { params });
        return response.data;
    },

    // Get single service
    getById: async (serviceId) => {
        const response = await axiosInstance.get(`/services/${serviceId}`);
        return response.data;
    },

    // Create service
    create: async (formData) => {
        const response = await axiosInstance.post('/services', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Update service
    update: async (serviceId, formData) => {
        const response = await axiosInstance.put(
            `/services/${serviceId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // Delete service
    delete: async (serviceId) => {
        const response = await axiosInstance.delete(`/services/${serviceId}`);
        return response.data;
    },

    // Toggle featured status
    toggleFeatured: async (serviceId) => {
        const response = await axiosInstance.patch(`/services/${serviceId}/featured`);
        return response.data;
    },

    // Toggle active status
    toggleActive: async (serviceId) => {
        const response = await axiosInstance.patch(`/services/${serviceId}/active`);
        return response.data;
    },

    // Reorder services
    reorder: async (orderedIds) => {
        const response = await axiosInstance.put('/services/reorder/bulk', {
            orderedIds
        });
        return response.data;
    },

    // Set primary image
    setPrimaryImage: async (serviceId, imageId) => {
        const response = await axiosInstance.put(
            `/services/${serviceId}/images/${imageId}/primary`
        );
        return response.data;
    },

    // Delete image
    deleteImage: async (serviceId, imageId) => {
        const response = await axiosInstance.delete(
            `/services/${serviceId}/images/${imageId}`
        );
        return response.data;
    },

    // Add variant
    addVariant: async (serviceId, formData) => {
        const response = await axiosInstance.post(
            `/services/${serviceId}/variants`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // Update variant
    updateVariant: async (serviceId, variantId, formData) => {
        const response = await axiosInstance.put(
            `/services/${serviceId}/variants/${variantId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // Delete variant
    deleteVariant: async (serviceId, variantId) => {
        const response = await axiosInstance.delete(
            `/services/${serviceId}/variants/${variantId}`
        );
        return response.data;
    }
};

export default serviceService;
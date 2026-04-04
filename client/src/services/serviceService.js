import axiosInstance from '@/lib/axios';

const serviceService = {
    getAll: async (params) => {
        const response = await axiosInstance.get('/services', { params });
        return response.data;
    },

    getById: async (serviceId) => {
        const response = await axiosInstance.get(`/services/${serviceId}`);
        return response.data;
    },

    create: async (formData) => {
        const response = await axiosInstance.post('/services', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (serviceId, formData) => {
        const response = await axiosInstance.put(
            `/services/${serviceId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    delete: async (serviceId) => {
        const response = await axiosInstance.delete(`/services/${serviceId}`);
        return response.data;
    },

    toggleFeatured: async (serviceId) => {
        const response = await axiosInstance.patch(`/services/${serviceId}/featured`);
        return response.data;
    },

    toggleActive: async (serviceId) => {
        const response = await axiosInstance.patch(`/services/${serviceId}/active`);
        return response.data;
    },

    reorder: async (orderedIds) => {
        const response = await axiosInstance.put('/services/reorder/bulk', {
            orderedIds
        });
        return response.data;
    },

    setPrimaryImage: async (serviceId, imageId) => {
        const response = await axiosInstance.put(
            `/services/${serviceId}/images/${imageId}/primary`
        );
        return response.data;
    },

    deleteImage: async (serviceId, imageId) => {
        const response = await axiosInstance.delete(
            `/services/${serviceId}/images/${imageId}`
        );
        return response.data;
    },

    addVariant: async (serviceId, formData) => {
        const response = await axiosInstance.post(
            `/services/${serviceId}/variants`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    updateVariant: async (serviceId, variantId, formData) => {
        const response = await axiosInstance.put(
            `/services/${serviceId}/variants/${variantId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    deleteVariant: async (serviceId, variantId) => {
        const response = await axiosInstance.delete(
            `/services/${serviceId}/variants/${variantId}`
        );
        return response.data;
    }
};

export default serviceService;
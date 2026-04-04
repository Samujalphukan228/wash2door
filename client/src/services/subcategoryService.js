import axiosInstance from '@/lib/axios';

const subcategoryService = {
    create: async (formData) => {
        try {
            const response = await axiosInstance.post('/subcategories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/subcategories', { params });

            if (response.data?.success) {
                return {
                    success: true,
                    data: {
                        subcategories: response.data.data || []
                    }
                };
            }

            return {
                success: true,
                data: {
                    subcategories: response.data?.data || []
                }
            };
        } catch (error) {
            throw error;
        }
    },

    getByCategory: async (categoryId, options = {}) => {
        try {
            if (!categoryId) {
                return {
                    success: true,
                    data: {
                        subcategories: []
                    }
                };
            }

            const params = {
                includeInactive: true,
                limit: 1000,
                ...options
            };

            const response = await axiosInstance.get(`/subcategories/category/${categoryId}`, { params });

            if (response.data?.success) {
                return {
                    success: true,
                    data: {
                        subcategories: Array.isArray(response.data.data) 
                            ? response.data.data 
                            : []
                    }
                };
            }

            return {
                success: true,
                data: {
                    subcategories: Array.isArray(response.data?.data) 
                        ? response.data.data 
                        : []
                }
            };
        } catch (error) {
            return {
                success: true,
                data: {
                    subcategories: []
                }
            };
        }
    },

    getById: async (subcategoryId) => {
        try {
            const response = await axiosInstance.get(`/subcategories/${subcategoryId}`);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (subcategoryId, formData) => {
        try {
            const response = await axiosInstance.put(
                `/subcategories/${subcategoryId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (subcategoryId) => {
        try {
            const response = await axiosInstance.delete(`/subcategories/${subcategoryId}`);

            if (response.data?.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleStatus: async (subcategoryId) => {
        try {
            const response = await axiosInstance.patch(
                `/subcategories/${subcategoryId}/toggle`
            );

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    reorder: async (orderedIds) => {
        try {
            const response = await axiosInstance.put(
                '/subcategories/reorder/bulk',
                { orderedIds }
            );

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPublicByCategory: async (categoryId) => {
        try {
            const response = await axiosInstance.get('/public/subcategories', {
                params: {
                    category: categoryId,
                    isActive: true
                }
            });

            if (response.data?.success) {
                return {
                    success: true,
                    data: {
                        subcategories: response.data.data || []
                    }
                };
            }

            return {
                success: true,
                data: {
                    subcategories: response.data?.data || []
                }
            };
        } catch (error) {
            return {
                success: true,
                data: {
                    subcategories: []
                }
            };
        }
    }
};

export default subcategoryService;
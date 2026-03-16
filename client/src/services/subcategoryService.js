// src/services/subcategoryService.js

import axiosInstance from '@/lib/axios';

const subcategoryService = {
    // Create a new subcategory
    create: async (formData) => {
        try {
            const response = await axiosInstance.post('/subcategories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('✅ Create subcategory response:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ Create subcategory error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Get all subcategories (with filters)
    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/subcategories', { params });

            console.log('✅ Get all subcategories response:', {
                total: response.data?.data?.length,
                data: response.data?.data?.map(s => ({
                    id: s._id,
                    name: s.name,
                    isActive: s.isActive
                }))
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
            console.error('❌ Get all subcategories error:', error.message);
            throw error;
        }
    },

    // Get subcategories by category ID - MAIN METHOD
    getByCategory: async (categoryId, options = {}) => {
        try {
            if (!categoryId) {
                console.error('❌ No categoryId provided');
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

            console.log('🔄 Fetching subcategories:', {
                categoryId,
                params,
                endpoint: `/subcategories/category/${categoryId}`
            });

            const response = await axiosInstance.get(`/subcategories/category/${categoryId}`, { params });

            console.log('✅ Get subcategories by category response:', {
                categoryId,
                status: response.status,
                total: response.data?.data?.length,
                data: response.data?.data?.map(s => ({
                    id: s._id,
                    name: s.name,
                    isActive: s.isActive,
                    displayOrder: s.displayOrder,
                    icon: s.icon
                }))
            });

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
            console.error('❌ getByCategory error:', {
                categoryId,
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    params: error.config?.params
                }
            });
            
            // Return empty array instead of throwing
            return {
                success: true,
                data: {
                    subcategories: []
                }
            };
        }
    },

    // Get single subcategory by ID
    getById: async (subcategoryId) => {
        try {
            const response = await axiosInstance.get(`/subcategories/${subcategoryId}`);

            console.log('✅ Get subcategory by ID response:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ Get subcategory by ID error:', error.message);
            throw error;
        }
    },

    // Update subcategory
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

            console.log('✅ Update subcategory response:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ Update subcategory error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Delete subcategory
    delete: async (subcategoryId) => {
        try {
            const response = await axiosInstance.delete(`/subcategories/${subcategoryId}`);

            console.log('✅ Delete subcategory response:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ Delete subcategory error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Toggle active/inactive status
    toggleStatus: async (subcategoryId) => {
        try {
            console.log('🔄 Toggling status for:', subcategoryId);

            const response = await axiosInstance.patch(
                `/subcategories/${subcategoryId}/toggle`
            );

            console.log('✅ Toggle status response:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ Toggle status error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Reorder subcategories
    reorder: async (orderedIds) => {
        try {
            const response = await axiosInstance.put(
                '/subcategories/reorder/bulk',
                { orderedIds }
            );

            console.log('✅ Reorder response:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ Reorder error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Get public subcategories (for frontend)
    getPublicByCategory: async (categoryId) => {
        try {
            const response = await axiosInstance.get('/public/subcategories', {
                params: {
                    category: categoryId,
                    isActive: true
                }
            });

            console.log('✅ Get public subcategories response:', response.data);

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
            console.error('❌ Get public subcategories error:', error.message);
            return {
                success: true,
                data: {
                    subcategories: []
                }
            };
        }
    }
};

// ✅ IMPORTANT: Export as default
export default subcategoryService;
// src/hooks/useServices.js - FIXED WITH REAL-TIME

import { useState, useCallback, useEffect } from 'react';
import serviceService from '@/services/serviceService';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

const useServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        page: 1
    });
    const { onServiceEvent } = useSocket();

    // Fetch all services
    const fetchAll = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await serviceService.getAll(params);
            
            if (response.success) {
                setServices(response.data);
                setPagination({
                    total: response.total,
                    pages: response.pages,
                    page: response.page
                });
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch services');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔥 ADDED: Real-time service updates
    useEffect(() => {
        const unsubscribe = onServiceEvent((event) => {
            console.log('🛠️ Service event:', event.type, event.data);

            if (event.type === 'created') {
                // Add new service to list
                setServices(prev => [event.data, ...prev]);
            } else if (event.type === 'updated') {
                // Update existing service
                setServices(prev => prev.map(s => 
                    s._id === event.data._id ? event.data : s
                ));
            } else if (event.type === 'deleted') {
                // Remove deleted service
                setServices(prev => prev.filter(s => s._id !== event.data.serviceId));
            }
        });

        return unsubscribe;
    }, [onServiceEvent]);

    // Fetch single
    const fetchOne = useCallback(async (serviceId) => {
        try {
            setLoading(true);
            const response = await serviceService.getById(serviceId);
            return response;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch service');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Create
    const create = useCallback(async (formData) => {
        try {
            setLoading(true);
            const response = await serviceService.create(formData);
            
            if (response.success) {
                // Don't manually add - socket will handle it
                toast.success('Service created successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to create service');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Update
    const update = useCallback(async (serviceId, formData) => {
        try {
            setLoading(true);
            const response = await serviceService.update(serviceId, formData);
            
            if (response.success) {
                // Don't manually update - socket will handle it
                toast.success('Service updated successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to update service');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete
    const remove = useCallback(async (serviceId) => {
        try {
            setLoading(true);
            const response = await serviceService.delete(serviceId);
            
            if (response.success) {
                // Don't manually remove - socket will handle it
                toast.success('Service deleted successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to delete service');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle featured
    const toggleFeatured = useCallback(async (serviceId) => {
        try {
            const response = await serviceService.toggleFeatured(serviceId);
            
            if (response.success) {
                // Don't manually update - socket will handle it
                toast.success('Featured status updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to update featured status');
            return { success: false };
        }
    }, []);

    // Toggle active
    const toggleActive = useCallback(async (serviceId) => {
        try {
            const response = await serviceService.toggleActive(serviceId);
            
            if (response.success) {
                // Don't manually update - socket will handle it
                toast.success('Active status updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to update active status');
            return { success: false };
        }
    }, []);

    // Reorder
    const reorder = useCallback(async (orderedIds) => {
        try {
            const response = await serviceService.reorder(orderedIds);
            
            if (response.success) {
                toast.success('Services reordered');
            }
            return response;
        } catch (err) {
            toast.error('Failed to reorder');
            return { success: false };
        }
    }, []);

    // Delete image
    const deleteImage = useCallback(async (serviceId, imageId) => {
        try {
            const response = await serviceService.deleteImage(serviceId, imageId);
            
            if (response.success) {
                // Socket will update
                toast.success('Image deleted');
            }
            return response;
        } catch (err) {
            toast.error('Failed to delete image');
            return { success: false };
        }
    }, []);

    // Set primary image
    const setPrimaryImage = useCallback(async (serviceId, imageId) => {
        try {
            const response = await serviceService.setPrimaryImage(serviceId, imageId);
            
            if (response.success) {
                // Socket will update
                toast.success('Primary image updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to set primary image');
            return { success: false };
        }
    }, []);

    // Add variant
    const addVariant = useCallback(async (serviceId, formData) => {
        try {
            const response = await serviceService.addVariant(serviceId, formData);
            
            if (response.success) {
                // Socket will update
                toast.success('Variant added successfully');
            }
            return response;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add variant');
            return { success: false };
        }
    }, []);

    // Update variant
    const updateVariant = useCallback(async (serviceId, variantId, formData) => {
        try {
            const response = await serviceService.updateVariant(serviceId, variantId, formData);
            
            if (response.success) {
                // Socket will update
                toast.success('Variant updated successfully');
            }
            return response;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update variant');
            return { success: false };
        }
    }, []);

    // Delete variant
    const deleteVariant = useCallback(async (serviceId, variantId) => {
        try {
            const response = await serviceService.deleteVariant(serviceId, variantId);
            
            if (response.success) {
                // Socket will update
                toast.success('Variant deleted successfully');
            }
            return response;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete variant');
            return { success: false };
        }
    }, []);

    return {
        services,
        loading,
        error,
        pagination,
        fetchAll,
        fetchOne,
        create,
        update,
        remove,
        toggleFeatured,
        toggleActive,
        reorder,
        deleteImage,
        setPrimaryImage,
        addVariant,
        updateVariant,
        deleteVariant
    };
};

export default useServices;
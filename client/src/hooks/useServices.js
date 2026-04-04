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

    useEffect(() => {
        const unsubscribe = onServiceEvent((event) => {
            if (event.type === 'created') {
                setServices(prev => [event.data, ...prev]);
            } else if (event.type === 'updated') {
                setServices(prev => prev.map(s => 
                    s._id === event.data._id ? event.data : s
                ));
            } else if (event.type === 'deleted') {
                setServices(prev => prev.filter(s => s._id !== event.data.serviceId));
            }
        });

        return unsubscribe;
    }, [onServiceEvent]);

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

    const create = useCallback(async (formData) => {
        try {
            setLoading(true);
            const response = await serviceService.create(formData);
            
            if (response.success) {
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

    const update = useCallback(async (serviceId, formData) => {
        try {
            setLoading(true);
            const response = await serviceService.update(serviceId, formData);
            
            if (response.success) {
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

    const remove = useCallback(async (serviceId) => {
        try {
            setLoading(true);
            const response = await serviceService.delete(serviceId);
            
            if (response.success) {
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

    const toggleFeatured = useCallback(async (serviceId) => {
        try {
            const response = await serviceService.toggleFeatured(serviceId);
            
            if (response.success) {
                toast.success('Featured status updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to update featured status');
            return { success: false };
        }
    }, []);

    const toggleActive = useCallback(async (serviceId) => {
        try {
            const response = await serviceService.toggleActive(serviceId);
            
            if (response.success) {
                toast.success('Active status updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to update active status');
            return { success: false };
        }
    }, []);

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

    const deleteImage = useCallback(async (serviceId, imageId) => {
        try {
            const response = await serviceService.deleteImage(serviceId, imageId);
            
            if (response.success) {
                toast.success('Image deleted');
            }
            return response;
        } catch (err) {
            toast.error('Failed to delete image');
            return { success: false };
        }
    }, []);

    const setPrimaryImage = useCallback(async (serviceId, imageId) => {
        try {
            const response = await serviceService.setPrimaryImage(serviceId, imageId);
            
            if (response.success) {
                toast.success('Primary image updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to set primary image');
            return { success: false };
        }
    }, []);

    const addVariant = useCallback(async (serviceId, formData) => {
        try {
            const response = await serviceService.addVariant(serviceId, formData);
            
            if (response.success) {
                toast.success('Variant added successfully');
            }
            return response;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add variant');
            return { success: false };
        }
    }, []);

    const updateVariant = useCallback(async (serviceId, variantId, formData) => {
        try {
            const response = await serviceService.updateVariant(serviceId, variantId, formData);
            
            if (response.success) {
                toast.success('Variant updated successfully');
            }
            return response;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update variant');
            return { success: false };
        }
    }, []);

    const deleteVariant = useCallback(async (serviceId, variantId) => {
        try {
            const response = await serviceService.deleteVariant(serviceId, variantId);
            
            if (response.success) {
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
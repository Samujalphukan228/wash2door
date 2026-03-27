import { useState, useCallback, useEffect } from 'react';
import subcategoryService from '@/services/subcategoryService';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

const useSubcategories = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { onSubcategoryEvent } = useSocket();

    // ============================================
    // 🔥 REAL-TIME SUBCATEGORY UPDATES
    // ============================================
    useEffect(() => {
        const unsubscribe = onSubcategoryEvent((event) => {
            console.log('📂 Subcategory event:', event.type, event.data);

            if (event.type === 'created') {
                // Add new subcategory to list
                setSubcategories(prev => [event.data, ...prev]);
            } else if (event.type === 'updated') {
                // Update existing subcategory
                setSubcategories(prev => prev.map(s => 
                    s._id === event.data._id ? event.data : s
                ));
            } else if (event.type === 'deleted') {
                // Remove deleted subcategory
                setSubcategories(prev => prev.filter(s => s._id !== event.data._id));
            }
        });

        return unsubscribe;
    }, [onSubcategoryEvent]);

    // Fetch all subcategories
    const fetchAll = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await subcategoryService.getAll(params);
            
            if (response.success) {
                setSubcategories(response.data.subcategories || []);
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch subcategories');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch by category
    const fetchByCategory = useCallback(async (categoryId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await subcategoryService.getByCategory(categoryId);
            
            if (response.success) {
                setSubcategories(response.data.subcategories || []);
            }
            return response;
        } catch (err) {
            setError(err.message);
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch single
    const fetchOne = useCallback(async (subcategoryId) => {
        try {
            setLoading(true);
            const response = await subcategoryService.getById(subcategoryId);
            return response;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch subcategory');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Create
    const create = useCallback(async (formData) => {
        try {
            setLoading(true);
            const response = await subcategoryService.create(formData);
            
            if (response.success) {
                // Don't manually add - socket will handle it
                toast.success('Subcategory created successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to create subcategory');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Update
    const update = useCallback(async (subcategoryId, formData) => {
        try {
            setLoading(true);
            const response = await subcategoryService.update(subcategoryId, formData);
            
            if (response.success) {
                // Don't manually update - socket will handle it
                toast.success('Subcategory updated successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to update subcategory');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete
    const remove = useCallback(async (subcategoryId) => {
        try {
            setLoading(true);
            const response = await subcategoryService.delete(subcategoryId);
            
            if (response.success) {
                // Don't manually remove - socket will handle it
                toast.success('Subcategory deleted successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to delete subcategory');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle status
    const toggleStatus = useCallback(async (subcategoryId) => {
        try {
            const response = await subcategoryService.toggleStatus(subcategoryId);
            
            if (response.success) {
                // Don't manually update - socket will handle it
                toast.success('Status updated');
            }
            return response;
        } catch (err) {
            toast.error('Failed to update status');
            return { success: false };
        }
    }, []);

    // Reorder
    const reorder = useCallback(async (orderedIds) => {
        try {
            const response = await subcategoryService.reorder(orderedIds);
            
            if (response.success) {
                toast.success('Subcategories reordered');
            }
            return response;
        } catch (err) {
            toast.error('Failed to reorder');
            return { success: false };
        }
    }, []);

    return {
        subcategories,
        loading,
        error,
        fetchAll,
        fetchByCategory,
        fetchOne,
        create,
        update,
        remove,
        toggleStatus,
        reorder
    };
};

export default useSubcategories;
import { useState, useCallback, useEffect } from 'react';
import categoryService from '@/services/categoryService';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        page: 1
    });
    const { onCategoryEvent } = useSocket();

    // ============================================
    // 🔥 REAL-TIME CATEGORY UPDATES
    // ============================================
    useEffect(() => {
        const unsubscribe = onCategoryEvent((event) => {
            console.log('📁 Category event:', event.type, event.data);

            if (event.type === 'created') {
                // Add new category to list
                setCategories(prev => [event.data, ...prev]);
                setPagination(prev => ({
                    ...prev,
                    total: prev.total + 1
                }));
            } else if (event.type === 'updated') {
                // Update existing category
                setCategories(prev => prev.map(c => 
                    c._id === event.data._id ? event.data : c
                ));
            } else if (event.type === 'deleted') {
                // Remove deleted category
                setCategories(prev => prev.filter(c => c._id !== event.data._id));
                setPagination(prev => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1)
                }));
            }
        });

        return unsubscribe;
    }, [onCategoryEvent]);

    // Fetch all categories
    const fetchAll = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.getAll(params);
            
            if (response.success) {
                setCategories(response.data);
                setPagination({
                    total: response.total,
                    pages: response.pages,
                    page: response.page
                });
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch categories');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch single
    const fetchOne = useCallback(async (categoryId) => {
        try {
            setLoading(true);
            const response = await categoryService.getById(categoryId);
            return response;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch category');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Create
    const create = useCallback(async (formData) => {
        try {
            setLoading(true);
            const response = await categoryService.create(formData);
            
            if (response.success) {
                // Don't manually add - socket will handle it
                toast.success('Category created successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to create category');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Update
    const update = useCallback(async (categoryId, formData) => {
        try {
            setLoading(true);
            const response = await categoryService.update(categoryId, formData);
            
            if (response.success) {
                // Don't manually update - socket will handle it
                toast.success('Category updated successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to update category');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete
    const remove = useCallback(async (categoryId) => {
        try {
            setLoading(true);
            const response = await categoryService.delete(categoryId);
            
            if (response.success) {
                // Don't manually remove - socket will handle it
                toast.success('Category deleted successfully');
            }
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.response?.data?.message || 'Failed to delete category');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle status
    const toggleStatus = useCallback(async (categoryId) => {
        try {
            const response = await categoryService.toggleStatus(categoryId);
            
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
            const response = await categoryService.reorder(orderedIds);
            
            if (response.success) {
                toast.success('Categories reordered');
            }
            return response;
        } catch (err) {
            toast.error('Failed to reorder');
            return { success: false };
        }
    }, []);

    return {
        categories,
        loading,
        error,
        pagination,
        fetchAll,
        fetchOne,
        create,
        update,
        remove,
        toggleStatus,
        reorder
    };
};

export default useCategories;
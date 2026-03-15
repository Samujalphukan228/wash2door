// src/hooks/useCategories.js

import { useState, useCallback } from 'react';
import categoryService from '@/services/categoryService';
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
                setCategories(prev => [...prev, response.data]);
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
                setCategories(prev =>
                    prev.map(c => c._id === categoryId ? response.data : c)
                );
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
                setCategories(prev => prev.filter(c => c._id !== categoryId));
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
                setCategories(prev =>
                    prev.map(c => c._id === categoryId 
                        ? { ...c, isActive: !c.isActive }
                        : c
                    )
                );
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
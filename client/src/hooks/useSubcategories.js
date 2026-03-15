// src/hooks/useSubcategories.js

import { useState, useCallback } from 'react';
import subcategoryService from '@/services/subcategoryService';
import toast from 'react-hot-toast';

const useSubcategories = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all subcategories
    const fetchAll = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await subcategoryService.getAll(params);
            
            if (response.success) {
                setSubcategories(response.data);
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
                setSubcategories(response.data);
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
                setSubcategories(prev => [...prev, response.data]);
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
                setSubcategories(prev =>
                    prev.map(s => s._id === subcategoryId ? response.data : s)
                );
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
                setSubcategories(prev => prev.filter(s => s._id !== subcategoryId));
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
                setSubcategories(prev =>
                    prev.map(s => s._id === subcategoryId 
                        ? { ...s, isActive: !s.isActive }
                        : s
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
// src/app/(dashboard)/admin/categories/page.js

'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CategoryCard from '@/components/admin/categories/CategoryCard';
import CreateCategoryModal from '@/components/admin/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';
import categoryService from '@/services/categoryService';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAll({ limit: 100 });
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!confirm('Delete this category? Services inside must be moved or deleted first.')) return;
        try {
            await categoryService.delete(categoryId);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            await categoryService.toggleStatus(category._id);
            toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Management
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white">
                            Categories
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black text-xs tracking-[0.15em] uppercase px-4 py-2.5 transition-colors self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Category
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Total', value: categories.length },
                        { label: 'Active', value: categories.filter(c => c.isActive).length },
                        { label: 'Inactive', value: categories.filter(c => !c.isActive).length }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-neutral-950 border border-neutral-800 p-4">
                            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-light text-white">
                                {loading ? (
                                    <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                                ) : stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                                <div className="h-32 bg-neutral-800 animate-pulse" />
                                <div className="h-4 w-3/4 bg-neutral-800 animate-pulse rounded" />
                                <div className="h-3 w-1/2 bg-neutral-900 animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-neutral-950 border border-neutral-800 px-6 py-16 text-center">
                        <p className="text-neutral-500 text-sm">No categories yet</p>
                        <p className="text-neutral-700 text-xs mt-1">
                            Create your first category to get started
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category._id}
                                category={category}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateCategoryModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchCategories();
                        toast.success('Category created!');
                    }}
                />
            )}

            {showEditModal && selectedCategory && (
                <EditCategoryModal
                    category={selectedCategory}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCategory(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedCategory(null);
                        fetchCategories();
                        toast.success('Category updated!');
                    }}
                />
            )}
        </DashboardLayout>
    );
}
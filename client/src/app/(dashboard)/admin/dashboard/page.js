'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CategoryCard from '@/components/admin/categories/CategoryCard';
import CreateCategoryModal from '@/components/admin/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';
import categoryService from '@/services/categoryService';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchCategories = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const response = await categoryService.getAll({ limit: 100 });
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
            setRefreshing(false);
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
            fetchCategories(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            await categoryService.toggleStatus(category._id);
            toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
            fetchCategories(true);
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        toast.success('Category created');
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedCategory(null);
        toast.success('Category updated');
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                                Categories
                            </h1>
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
                                    <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />
                                    <span className="text-xs text-zinc-500">Syncing</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500">
                            {loading ? (
                                <span className="inline-block w-32 h-3 rounded bg-zinc-800 animate-pulse" />
                            ) : (
                                <>
                                    <span className="text-white font-medium">{categories.length}</span> categories
                                </>
                            )}
                        </p>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => fetchCategories(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Category
                        </button>
                    </div>

                    {/* Mobile Refresh */}
                    <button
                        onClick={() => fetchCategories(true)}
                        disabled={refreshing}
                        className="sm:hidden p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Total', value: categories.length },
                        { label: 'Active', value: categories.filter(c => c.isActive).length },
                        { label: 'Inactive', value: categories.filter(c => !c.isActive).length }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-zinc-800/30 rounded-lg p-4">
                            <p className="text-xs text-zinc-500 mb-1">
                                {stat.label}
                            </p>
                            {loading ? (
                                <div className="h-7 w-8 bg-zinc-800 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-semibold text-white">
                                    {stat.value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                                <div className="h-32 bg-zinc-800 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                                    <div className="h-3 w-1/2 bg-zinc-800 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-20 text-center">
                        <p className="text-sm text-zinc-400">No categories yet</p>
                        <p className="text-xs text-zinc-600 mt-1">
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

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateCategoryModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showEditModal && selectedCategory && (
                <EditCategoryModal
                    category={selectedCategory}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCategory(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}
        </DashboardLayout>
    );
}
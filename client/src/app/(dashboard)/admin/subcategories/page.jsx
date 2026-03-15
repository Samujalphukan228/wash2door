'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import SubcategoryCard from '@/components/admin/subcategories/SubcategoryCard';
import CreateSubcategoryModal from '@/components/admin/subcategories/CreateSubcategoryModal';
import EditSubcategoryModal from '@/components/admin/subcategories/EditSubcategoryModal';
import subcategoryService from '@/services/subcategoryService';
import categoryService from '@/services/categoryService';
import { Plus, RefreshCw, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubcategoriesPage() {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryService.getAll({ limit: 100 });
            if (response.success) {
                setCategories(response.data);
                if (response.data.length > 0 && !selectedCategory) {
                    setSelectedCategory(response.data[0]._id);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        }
    }, [selectedCategory]);

    // Fetch subcategories
    const fetchSubcategories = useCallback(async (isRefresh = false) => {
        if (!selectedCategory) return;
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const response = await subcategoryService.getByCategory(selectedCategory);
            if (response.success) {
                setSubcategories(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch subcategories');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchSubcategories();
    }, [selectedCategory, fetchSubcategories]);

    const handleEdit = (subcategory) => {
        setSelectedSubcategory(subcategory);
        setShowEditModal(true);
    };

    const handleDelete = async (subcategoryId) => {
        if (!confirm('Delete this subcategory? Services inside must be moved or deleted first.')) return;
        try {
            await subcategoryService.delete(subcategoryId);
            toast.success('Subcategory deleted');
            fetchSubcategories(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete subcategory');
        }
    };

    const handleToggleStatus = async (subcategory) => {
        try {
            await subcategoryService.toggleStatus(subcategory._id);
            toast.success(`Subcategory ${subcategory.isActive ? 'deactivated' : 'activated'}`);
            fetchSubcategories(true);
        } catch (error) {
            toast.error('Failed to update subcategory');
        }
    };

    const currentCategory = categories.find(c => c._id === selectedCategory);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-28 sm:pb-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                                Subcategories
                            </h1>
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
                                    <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />
                                    <span className="text-xs text-zinc-500">Syncing</span>
                                </div>
                            )}
                        </div>
                        {currentCategory && (
                            <p className="text-sm text-zinc-500">
                                {loading ? (
                                    <span className="inline-block w-40 h-3 rounded bg-zinc-800 animate-pulse" />
                                ) : (
                                    <>Under <span className="text-white font-medium">{currentCategory.icon} {currentCategory.name}</span></>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => fetchSubcategories(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!selectedCategory}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Subcategory
                        </button>
                    </div>

                    {/* Mobile Refresh */}
                    <button
                        onClick={() => fetchSubcategories(true)}
                        disabled={refreshing}
                        className="sm:hidden p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Category Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`
                                shrink-0 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                                ${selectedCategory === cat._id
                                    ? 'bg-white text-black'
                                    : 'border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                                }
                            `}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Total', value: subcategories.length },
                        { label: 'Active', value: subcategories.filter(s => s.isActive).length },
                        { label: 'Inactive', value: subcategories.filter(s => !s.isActive).length }
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
                ) : subcategories.length === 0 ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-20 text-center">
                        <p className="text-sm text-zinc-400">No subcategories yet</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            Create your first subcategory to get started
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {subcategories.map((subcategory) => (
                            <SubcategoryCard
                                key={subcategory._id}
                                subcategory={subcategory}
                                categoryName={currentCategory?.name || ''}
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
                    disabled={!selectedCategory}
                    className="w-14 h-14 bg-white text-black rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </div>

            {/* Modals */}
            {showCreateModal && selectedCategory && (
                <CreateSubcategoryModal
                    categoryId={selectedCategory}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchSubcategories(true);
                        toast.success('Subcategory created');
                    }}
                />
            )}

            {showEditModal && selectedSubcategory && (
                <EditSubcategoryModal
                    subcategory={selectedSubcategory}
                    categoryName={currentCategory?.name || ''}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedSubcategory(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedSubcategory(null);
                        fetchSubcategories(true);
                        toast.success('Subcategory updated');
                    }}
                />
            )}
        </DashboardLayout>
    );
}
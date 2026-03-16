// src/app/admin/subcategories/page.jsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import SubcategoryCard from '@/components/admin/subcategories/SubcategoryCard';
import CreateSubcategoryModal from '@/components/admin/subcategories/CreateSubcategoryModal';
import EditSubcategoryModal from '@/components/admin/subcategories/EditSubcategoryModal';
import subcategoryService from '@/services/subcategoryService';
import categoryService from '@/services/categoryService';
import {
    Plus,
    RefreshCw,
    Layers,
    CheckCircle,
    XCircle,
    FolderOpen
} from 'lucide-react';
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
                const cats = response.data?.categories || response.data || [];
                setCategories(cats);
                if (cats.length > 0 && !selectedCategory) {
                    setSelectedCategory(cats[0]._id);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        }
    }, [selectedCategory]);

    // Fetch subcategories - FIXED: fetch ALL (active + inactive)
    const fetchSubcategories = useCallback(async (isRefresh = false) => {
        if (!selectedCategory) return;
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);

            // Try admin endpoint first, fallback to regular
            let response;
            try {
                response = await subcategoryService.getByCategory(selectedCategory, { includeInactive: true });
            } catch {
                response = await subcategoryService.getByCategory(selectedCategory);
            }

            if (response.success) {
                const subs = response.data?.subcategories || response.data || [];

                // Debug log
                console.log('📦 Subcategories fetched:', subs.length, subs.map(s => ({
                    name: s.name,
                    isActive: s.isActive
                })));

                setSubcategories(subs);
            }
        } catch (error) {
            console.error('Fetch subcategories error:', error);
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
        if (selectedCategory) {
            fetchSubcategories();
        }
    }, [selectedCategory, fetchSubcategories]);

    // Stats
    const stats = useMemo(() => ({
        total: subcategories.length,
        active: subcategories.filter(s => s.isActive === true).length,
        inactive: subcategories.filter(s => s.isActive === false).length
    }), [subcategories]);

    const currentCategory = categories.find(c => c._id === selectedCategory);

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
        const currentStatus = subcategory.isActive !== undefined ? subcategory.isActive : true;
        try {
            await subcategoryService.toggleStatus(subcategory._id);
            toast.success(`Subcategory ${currentStatus ? 'deactivated' : 'activated'}`);
            fetchSubcategories(true);
        } catch (error) {
            toast.error('Failed to update subcategory');
        }
    };

    const handleRefresh = () => {
        fetchSubcategories(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    // Full page loading
    if (loading && subcategories.length === 0 && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading subcategories...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

                    {/* Header */}
                    <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 pt-4 sm:pt-6">
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                                Manage
                            </p>
                            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                                Subcategories
                            </h1>
                            {currentCategory && !loading && (
                                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                                    Under <span className="text-gray-400">{currentCategory.icon} {currentCategory.name}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-gray-500">Syncing</span>
                                </div>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-40 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                disabled={!selectedCategory}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:bg-white/[0.06] disabled:text-gray-600 disabled:cursor-not-allowed transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New
                            </button>
                        </div>
                    </header>

                    {/* Category Selector */}
                    <div className="px-3 sm:px-4 md:px-6">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat._id)}
                                    className={`
                                        shrink-0 px-3 py-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap
                                        ${selectedCategory === cat._id
                                            ? 'bg-white/[0.08] border border-white/[0.15] text-white'
                                            : 'border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04]'
                                        }
                                    `}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6">
                        <StatCard
                            icon={Layers}
                            label="Total"
                            value={stats.total}
                            loading={loading}
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Active"
                            value={stats.active}
                            loading={loading}
                        />
                        <StatCard
                            icon={XCircle}
                            label="Inactive"
                            value={stats.inactive}
                            loading={loading}
                            highlight={stats.inactive > 0}
                        />
                    </div>

                    {/* Debug Info - Remove after fixing */}
                    {!loading && subcategories.length > 0 && (
                        <div className="px-3 sm:px-4 md:px-6">
                            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <p className="text-[10px] text-yellow-400 font-mono">
                                    Debug: {subcategories.map(s =>
                                        `${s.name}(${s.isActive === true ? '✅' : s.isActive === false ? '❌' : '❓' + String(s.isActive)})`
                                    ).join(' | ')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="px-3 sm:px-4 md:px-6 pb-6">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden"
                                    >
                                        <div className="h-32 sm:h-36 bg-white/[0.04] animate-pulse" />
                                        <div className="p-3 sm:p-4 space-y-3">
                                            <div className="h-3 w-16 bg-white/[0.06] rounded animate-pulse" />
                                            <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                                            <div className="h-3 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : subcategories.length === 0 ? (
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8">
                                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                                        <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-400 mb-1">No subcategories yet</p>
                                    <p className="text-[10px] sm:text-xs text-gray-600 text-center">
                                        Create your first subcategory to get started
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        disabled={!selectedCategory}
                                        className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-40"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Create Subcategory
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                </div>
            </div>

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!selectedCategory}
                    className="w-12 h-12 bg-white text-black rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
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

// === INLINE STAT CARD ===

function StatCard({ icon: Icon, label, value, loading, highlight }) {
    return (
        <div className={`
            bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all
            hover:bg-white/[0.04]
            ${highlight ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/[0.08]'}
        `}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                {loading ? (
                    <span className="inline-block h-6 w-8 bg-white/[0.06] animate-pulse rounded-md" />
                ) : (
                    value
                )}
            </p>
        </div>
    );
}
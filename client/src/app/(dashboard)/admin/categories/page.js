'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateCategoryModal from '@/components/admin/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';
import categoryService from '@/services/categoryService';
import Image from 'next/image';
import { 
    Plus, 
    RefreshCw, 
    Layers, 
    Pencil, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    ChevronRight,
    Search,
    X,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

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

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const query = searchQuery.toLowerCase();
        return categories.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query)
        );
    }, [categories, searchQuery]);

    const stats = useMemo(() => ({
        total: categories.length,
        active: categories.filter(c => c.isActive).length,
        inactive: categories.filter(c => !c.isActive).length,
        totalServices: categories.reduce((sum, c) => sum + (c.totalServices || 0), 0)
    }), [categories]);

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
        fetchCategories(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedCategory(null);
        toast.success('Category updated');
        fetchCategories(true);
    };

    if (loading && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading categories...</p>
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
                                Categories
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-gray-500">Syncing</span>
                                </div>
                            )}
                            <button
                                onClick={() => fetchCategories(true)}
                                disabled={refreshing}
                                className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-40 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Category
                            </button>
                        </div>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 px-3 sm:px-4 md:px-6">
                        <StatCard
                            icon={Layers}
                            label="Total"
                            value={stats.total}
                            sub="Categories"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Active"
                            value={stats.active}
                            sub="Visible to users"
                        />
                        <StatCard
                            icon={XCircle}
                            label="Inactive"
                            value={stats.inactive}
                            sub="Hidden"
                            highlight={stats.inactive > 0}
                        />
                        <StatCard
                            icon={Layers}
                            label="Services"
                            value={stats.totalServices}
                            sub="Across all categories"
                        />
                    </div>

                    {/* Search */}
                    <div className="px-3 sm:px-4 md:px-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-6">
                        {filteredCategories.length === 0 ? (
                            <EmptyState 
                                searchQuery={searchQuery}
                                onClear={() => setSearchQuery('')}
                                onCreate={() => setShowCreateModal(true)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {filteredCategories.map((category) => (
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

                </div>
            </div>

            {/* ✅ FIXED: Mobile FAB - Positioned above mobile nav */}
            <div className="sm:hidden fixed bottom-24 right-4 z-41">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform hover:shadow-2xl hover:shadow-white/20"
                    aria-label="Create new category"
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

// === COMPONENTS ===

function StatCard({ icon: Icon, label, value, sub, highlight }) {
    return (
        <div className={`
            bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all
            hover:bg-white/[0.04]
            ${highlight ? 'border-yellow-500/30 bg-yellow-500/[0.02]' : 'border-white/[0.08]'}
        `}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                {value}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 truncate">{sub}</p>
        </div>
    );
}

function CategoryCard({ category, onEdit, onDelete, onToggleStatus }) {
    const hasImage = category.image?.url && !category.image.url.includes('default');
    const isActionable = category.totalServices === 0;

    return (
        <div className={`
            bg-white/[0.02] border rounded-xl sm:rounded-2xl overflow-hidden transition-all
            hover:bg-white/[0.04] hover:border-white/[0.12]
            ${category.isActive ? 'border-white/[0.08]' : 'border-white/[0.05] opacity-60'}
        `}>
            {/* Image */}
            <div className="relative h-28 sm:h-32 bg-white/[0.02]">
                {hasImage ? (
                    <Image
                        src={category.image.url}
                        alt={category.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {category.icon ? (
                            <span className="text-4xl sm:text-5xl">{category.icon}</span>
                        ) : (
                            <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
                        )}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`
                        text-[9px] sm:text-[10px] font-medium px-2 py-1 rounded-lg
                        ${category.isActive 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-white/[0.06] text-gray-500 border border-white/[0.08]'
                        }
                    `}>
                        {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Order Badge */}
                {category.displayOrder !== undefined && (
                    <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white/50">
                            #{category.displayOrder}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm sm:text-base font-medium text-white truncate">
                        {category.name}
                    </h3>
                    {category.icon && (
                        <span className="text-base sm:text-lg shrink-0">{category.icon}</span>
                    )}
                </div>

                {category.description && (
                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {category.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-600">
                        {category.totalServices || 0} service{category.totalServices !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
                    <button
                        onClick={() => onEdit(category)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleStatus(category)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        {category.isActive 
                            ? <ToggleRight className="w-3 h-3" />
                            : <ToggleLeft className="w-3 h-3" />
                        }
                        {category.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                        onClick={() => onDelete(category._id)}
                        disabled={!isActionable}
                        className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.04] disabled:hover:text-gray-600 disabled:hover:border-white/[0.08] transition-all"
                        title={!isActionable ? 'Remove services first' : 'Delete'}
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ searchQuery, onClear, onCreate }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                {searchQuery ? (
                    <>
                        <p className="text-sm sm:text-base text-gray-400 mb-1">No results found</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 text-center mb-4">
                            No categories match "{searchQuery}"
                        </p>
                        <button
                            onClick={onClear}
                            className="text-xs text-white/60 hover:text-white transition-colors"
                        >
                            Clear search
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-sm sm:text-base text-gray-400 mb-1">No categories yet</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 text-center mb-4">
                            Create your first category to get started
                        </p>
                        <button
                            onClick={onCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Create Category
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
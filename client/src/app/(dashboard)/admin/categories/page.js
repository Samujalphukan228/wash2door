'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateCategoryModal from '@/components/admin/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';
import categoryService from '@/services/categoryService';
import { useSocket } from '@/context/SocketContext'; // ✅ ADDED
import Image from 'next/image';
import {
    Plus,
    RefreshCw,
    Layers,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Search,
    X,
    Loader2,
    Eye,
    ChevronDown,
    ChevronUp,
    Hash,
    Package,
    FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // ✅ ADDED: Get socket subscription method
    const { onCategoryEvent } = useSocket();

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

    // ============================================
    // 🔥 ADDED: Real-time category updates
    // ============================================
    useEffect(() => {
        const unsubscribe = onCategoryEvent((event) => {
            console.log('📁 Category event received:', event.type, event.data);

            if (event.type === 'created') {
                // Add new category to list
                setCategories(prev => {
                    // Check if already exists (avoid duplicates)
                    const exists = prev.find(c => c._id === event.data.categoryId);
                    if (exists) return prev;
                    
                    // Create category object from socket data
                    const newCategory = {
                        _id: event.data.categoryId,
                        name: event.data.name,
                        isActive: event.data.isActive,
                        totalServices: 0,
                        totalSubcategories: 0,
                        ...event.data
                    };
                    
                    return [newCategory, ...prev];
                });
            } else if (event.type === 'updated') {
                // Update existing category
                setCategories(prev => prev.map(c => 
                    c._id === event.data.categoryId 
                        ? { ...c, ...event.data, _id: event.data.categoryId }
                        : c
                ));
            } else if (event.type === 'deleted') {
                // Remove deleted category
                setCategories(prev => prev.filter(c => 
                    c._id !== event.data.categoryId && c._id !== event.data._id
                ));
            }
        });

        return unsubscribe;
    }, [onCategoryEvent]);

    const filteredCategories = useMemo(() => {
        if (!debouncedSearch.trim()) return categories;
        const query = debouncedSearch.toLowerCase();
        return categories.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query)
        );
    }, [categories, debouncedSearch]);

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
            // ✅ Socket will handle the update, but show success toast
            toast.success('Category deleted');
            // Optionally refresh to get accurate data
            fetchCategories(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            await categoryService.toggleStatus(category._id);
            // ✅ Socket will handle the update
            toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleRefresh = () => {
        fetchCategories(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        toast.success('Category created');
        // ✅ Socket will handle adding to list, but refresh for full data
        fetchCategories(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedCategory(null);
        toast.success('Category updated');
        // ✅ Socket will handle update, but refresh for full data
        fetchCategories(true);
    };

    // ── Loading State ───────────────────────────────────────────────────────
    if (loading && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <p className="text-sm text-gray-500">Loading categories...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">

                {/* ══════════════════════════════════════════════════════════ */}
                {/* STICKY HEADER                                              */}
                {/* ══════════════════════════════════════════════════════════ */}
                <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-white/[0.06]">
                    {/* Title Row */}
                    <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-semibold text-white leading-tight">Categories</h1>
                            <p className="text-[11px] text-gray-500">
                                {stats.total} total · {stats.active} active
                            </p>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 hover:text-white disabled:opacity-50 transition-all shrink-0"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Add Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add New</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>

                    {/* Search Row */}
                    <div className="px-4 pb-3 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full h-10 bg-white/[0.05] border-0 text-white text-sm placeholder-gray-500 pl-10 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Stats Toggle (Mobile) */}
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className={`
                                sm:hidden w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all
                                ${showStats ? 'bg-white text-black' : 'bg-white/[0.05] text-gray-400'}
                            `}
                        >
                            {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Collapsible Stats (Mobile) */}
                    {showStats && (
                        <div className="sm:hidden px-4 pb-3 grid grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-200">
                            <MiniStat label="Total" value={stats.total} />
                            <MiniStat label="Active" value={stats.active} />
                            <MiniStat label="Inactive" value={stats.inactive} highlight={stats.inactive > 0} />
                            <MiniStat label="Services" value={stats.totalServices} />
                        </div>
                    )}

                    {/* Desktop Stats Row */}
                    <div className="hidden sm:flex px-4 pb-3 gap-3">
                        <StatPill icon={Layers} label="Total" value={stats.total} />
                        <StatPill icon={Eye} label="Active" value={stats.active} />
                        <StatPill icon={Package} label="Services" value={stats.totalServices} />
                        {stats.inactive > 0 && (
                            <StatPill label="Inactive" value={stats.inactive} highlight />
                        )}
                    </div>
                </header>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* CATEGORIES GRID                                            */}
                {/* ══════════════════════════════════════════════════════════ */}
                <div className="px-4 py-4 pb-28 sm:pb-8">
                    {/* Search Result Info */}
                    {debouncedSearch && (
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] text-gray-500">
                                {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''} for
                            </span>
                            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-white/[0.08] text-[11px] text-gray-300">
                                "{debouncedSearch}"
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        </div>
                    )}

                    {loading ? (
                        <LoadingGrid />
                    ) : filteredCategories.length === 0 ? (
                        <EmptyState
                            searchQuery={debouncedSearch}
                            onClear={() => setSearchInput('')}
                            onCreate={() => setShowCreateModal(true)}
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-20 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform"
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

// ═══════════════════════════════════════════════════════════════════════════
// STAT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function MiniStat({ label, value, highlight = false }) {
    return (
        <div className={`
            p-2 rounded-xl text-center transition-all
            ${highlight ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/[0.03]'}
        `}>
            <p className={`text-lg font-bold ${highlight ? 'text-yellow-400' : 'text-white'}`}>
                {value}
            </p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</p>
        </div>
    );
}

function StatPill({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className={`
            inline-flex items-center gap-2 h-8 px-3 rounded-full transition-all
            ${highlight
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-white/[0.04] border border-white/[0.06]'
            }
        `}>
            {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
            <span className="text-xs text-gray-400">{label}</span>
            <span className={`text-xs font-semibold ${highlight ? 'text-yellow-400' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY CARD
// ═══════════════════════════════════════════════════════════════════════════

function CategoryCard({ category, onEdit, onDelete, onToggleStatus }) {
    const isActive = category.isActive !== undefined ? category.isActive : true;
    const hasImage = category.image?.url && !category.image.url.includes('default');
    const canDelete = (category.totalServices || 0) === 0;

    return (
        <div className={`
            bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl 
            flex flex-col overflow-hidden transition-all hover:bg-white/[0.04]
            ${!isActive ? 'opacity-50' : ''}
        `}>
            {/* Image */}
            <div className="relative h-32 sm:h-36 bg-white/[0.04]">
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
                            <span className="text-4xl">{category.icon}</span>
                        ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </div>
                        )}
                    </div>
                )}

                {/* Display Order Badge */}
                {category.displayOrder !== undefined && (
                    <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white/70 flex items-center gap-0.5">
                            <Hash className="w-2.5 h-2.5" />
                            {category.displayOrder}
                        </span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`
                        text-[9px] font-medium px-1.5 py-0.5 rounded
                        ${isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }
                    `}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                            {category.name}
                        </h3>
                    </div>
                    {category.icon && (
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                            <span className="text-sm">{category.icon}</span>
                        </div>
                    )}
                </div>

                {category.description && (
                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {category.description}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-3">
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {category.totalServices || 0} service{category.totalServices !== 1 ? 's' : ''}
                    </span>
                    {category.subcategoryCount > 0 && (
                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            {category.subcategoryCount} sub
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
                    <button
                        onClick={() => onEdit(category)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleStatus(category)}
                        className={`
                            flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 transition-all
                            ${isActive
                                ? 'hover:text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/20'
                                : 'hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                            }
                        `}
                    >
                        {isActive
                            ? <ToggleRight className="w-3 h-3" />
                            : <ToggleLeft className="w-3 h-3" />
                        }
                        {isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                        onClick={() => onDelete(category._id)}
                        disabled={!canDelete}
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-white/[0.04] disabled:hover:border-white/[0.08] transition-all"
                        title={canDelete ? 'Delete' : 'Remove services first'}
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING GRID
// ═══════════════════════════════════════════════════════════════════════════

function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden"
                >
                    <div className="h-32 sm:h-36 bg-white/[0.04] animate-pulse" />
                    <div className="p-3 sm:p-4 space-y-3">
                        <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                        <div className="h-3 w-1/3 bg-white/[0.03] rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState({ searchQuery, onClear, onCreate }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Layers className="w-7 h-7 text-gray-600" />
            </div>
            {searchQuery ? (
                <>
                    <p className="text-sm text-gray-400 mb-1">No results found</p>
                    <p className="text-xs text-gray-600 max-w-[200px]">
                        No categories match "{searchQuery}"
                    </p>
                    <button
                        onClick={onClear}
                        className="mt-4 text-xs text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                    >
                        Clear search
                    </button>
                </>
            ) : (
                <>
                    <p className="text-sm text-gray-400 mb-1">No categories yet</p>
                    <p className="text-xs text-gray-600 max-w-[200px]">
                        Create your first category to organize your services
                    </p>
                    <button
                        onClick={onCreate}
                        className="mt-4 flex items-center gap-2 h-9 px-4 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Category
                    </button>
                </>
            )}
        </div>
    );
}
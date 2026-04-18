'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateCategoryModal from '@/components/admin/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';
import categoryService from '@/services/categoryService';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import {
    Plus, RefreshCw, Layers, Pencil, Trash2,
    ToggleLeft, ToggleRight, Search, X, Loader2,
    Hash, Package, FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// DEBOUNCE HOOK
// ============================================

function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ============================================
// MAIN PAGE
// ============================================

export default function CategoriesPage() {
    const [categories, setCategories]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [refreshing, setRefreshing]         = useState(false);
    const [searchInput, setSearchInput]       = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCreateModal, setShowCreateModal]   = useState(false);
    const [showEditModal, setShowEditModal]       = useState(false);

    const debouncedSearch = useDebounce(searchInput, 300);
    const { onCategoryEvent } = useSocket();

    // ── Fetch ──
    const fetchCategories = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await categoryService.getAll({ limit: 100 });
            if (res.success) setCategories(res.data);
        } catch {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    // ── Real-time ──
    useEffect(() => {
        const unsub = onCategoryEvent((event) => {
            if (event.type === 'created') {
                setCategories((prev) => {
                    if (prev.find((c) => c._id === event.data.categoryId)) return prev;
                    return [{ _id: event.data.categoryId, name: event.data.name, isActive: event.data.isActive, totalServices: 0, totalSubcategories: 0, ...event.data }, ...prev];
                });
            } else if (event.type === 'updated') {
                setCategories((prev) =>
                    prev.map((c) => c._id === event.data.categoryId ? { ...c, ...event.data, _id: event.data.categoryId } : c)
                );
            } else if (event.type === 'deleted') {
                setCategories((prev) =>
                    prev.filter((c) => c._id !== event.data.categoryId && c._id !== event.data._id)
                );
            }
        });
        return unsub;
    }, [onCategoryEvent]);

    // ── Derived ──
    const filteredCategories = useMemo(() => {
        if (!debouncedSearch.trim()) return categories;
        const q = debouncedSearch.toLowerCase();
        return categories.filter((c) =>
            c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
        );
    }, [categories, debouncedSearch]);

    const stats = useMemo(() => ({
        total:         categories.length,
        active:        categories.filter((c) => c.isActive).length,
        inactive:      categories.filter((c) => !c.isActive).length,
        totalServices: categories.reduce((sum, c) => sum + (c.totalServices || 0), 0),
    }), [categories]);

    // ── Handlers ──
    const handleEdit         = (cat) => { setSelectedCategory(cat); setShowEditModal(true); };
    const handleRefresh      = () => { fetchCategories(true); toast.success('Refreshed', { duration: 1200 }); };
    const handleCreateSuccess = () => { setShowCreateModal(false); toast.success('Category created'); fetchCategories(true); };
    const handleEditSuccess   = () => { setShowEditModal(false); setSelectedCategory(null); toast.success('Category updated'); fetchCategories(true); };

    const handleDelete = async (categoryId) => {
        if (!confirm('Delete this category? Services inside must be moved first.')) return;
        try {
            await categoryService.delete(categoryId);
            toast.success('Category deleted');
            fetchCategories(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            await categoryService.toggleStatus(category._id);
            toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
        } catch {
            toast.error('Failed to update category');
        }
    };

    // ── Loading ──
    if (loading && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">Loading categories...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wide">Catalog</p>
                        <h1 className="text-base sm:text-lg font-semibold text-white">Categories</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {refreshing && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-white/30">Syncing</span>
                            </div>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all flex items-center justify-center"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add Category</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                <div className="grid grid-cols-4 gap-2">
                    <CatStat label="Total"    value={stats.total} />
                    <CatStat label="Active"   value={stats.active}   color="emerald" />
                    <CatStat label="Inactive" value={stats.inactive} color={stats.inactive > 0 ? 'amber' : undefined} />
                    <CatStat label="Services" value={stats.totalServices} />
                </div>

                {/* ── Search ── */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-white/20 transition-colors"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* ── Search result info ── */}
                {debouncedSearch && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/25">
                            {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''} for
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-white/50">
                            "{debouncedSearch}"
                            <button onClick={() => setSearchInput('')} className="text-white/25 hover:text-white/60 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    </div>
                )}

                {/* ── Grid ── */}
                {loading ? (
                    <LoadingGrid />
                ) : filteredCategories.length === 0 ? (
                    <EmptyState
                        searchQuery={debouncedSearch}
                        onClear={() => setSearchInput('')}
                        onCreate={() => setShowCreateModal(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-20 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform"
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
                    onClose={() => { setShowEditModal(false); setSelectedCategory(null); }}
                    onSuccess={handleEditSuccess}
                />
            )}
        </DashboardLayout>
    );
}

// ============================================
// CATEGORY STAT
// ============================================

function CatStat({ label, value, color }) {
    const colorMap = {
        emerald: 'text-emerald-400',
        amber:   'text-amber-400',
        red:     'text-red-400',
    };

    return (
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className={`text-sm sm:text-base font-bold tabular-nums ${color ? colorMap[color] : 'text-white'}`}>
                {value}
            </p>
            <p className="text-[9px] text-white/25 uppercase tracking-wide mt-0.5">{label}</p>
        </div>
    );
}

// ============================================
// CATEGORY CARD
// ============================================

function CategoryCard({ category, onEdit, onDelete, onToggleStatus }) {
    const isActive  = category.isActive !== undefined ? category.isActive : true;
    const hasImage  = category.image?.url && !category.image.url.includes('default');
    const canDelete = (category.totalServices || 0) === 0;

    return (
        <div className={`bg-neutral-950 border border-white/[0.08] rounded-xl flex flex-col overflow-hidden transition-all hover:border-white/[0.12] ${
            !isActive ? 'opacity-50' : ''
        }`}>
            {/* Image */}
            <div className="relative h-32 bg-white/[0.03]">
                {hasImage ? (
                    <Image src={category.image.url} alt={category.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                            <Layers className="w-4 h-4 text-white/20" />
                        </div>
                    </div>
                )}

                {/* Order badge */}
                {category.displayOrder !== undefined && (
                    <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white/50 flex items-center gap-0.5">
                            <Hash className="w-2.5 h-2.5" />
                            {category.displayOrder}
                        </span>
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                        isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/[0.06] text-white/30 border border-white/[0.08]'
                    }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col gap-2">
                {/* Name */}
                <div>
                    <h3 className="text-xs font-semibold text-white/80 truncate">{category.name}</h3>
                    {category.description && (
                        <p className="text-[10px] text-white/30 leading-relaxed mt-0.5 line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-white/25">
                        <Package className="w-3 h-3" />
                        {category.totalServices || 0} service{category.totalServices !== 1 ? 's' : ''}
                    </span>
                    {category.subcategoryCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-white/25">
                            <FolderOpen className="w-3 h-3" />
                            {category.subcategoryCount} sub
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                    <button
                        onClick={() => onEdit(category)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleStatus(category)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                            isActive
                                ? 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400'
                                : 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400'
                        }`}
                    >
                        {isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                        {isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                        onClick={() => onDelete(category._id)}
                        disabled={!canDelete}
                        title={canDelete ? 'Delete' : 'Remove services first'}
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-white/30 disabled:hover:bg-white/[0.04] disabled:hover:border-white/[0.06] transition-all"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// LOADING GRID
// ============================================

function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="h-32 bg-white/[0.04] animate-pulse" />
                    <div className="p-3 space-y-2">
                        <div className="h-3 w-2/3 bg-white/[0.06] rounded animate-pulse" />
                        <div className="h-2.5 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                        <div className="h-2.5 w-1/3 bg-white/[0.03] rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ searchQuery, onClear, onCreate }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Layers className="w-4 h-4 text-white/20" />
            </div>
            {searchQuery ? (
                <>
                    <p className="text-[11px] text-white/40 mb-0.5">No results found</p>
                    <p className="text-[10px] text-white/20">No categories match "{searchQuery}"</p>
                    <button
                        onClick={onClear}
                        className="mt-4 text-[10px] text-white/40 hover:text-white underline underline-offset-2 transition-colors"
                    >
                        Clear search
                    </button>
                </>
            ) : (
                <>
                    <p className="text-[11px] text-white/40 mb-0.5">No categories yet</p>
                    <p className="text-[10px] text-white/20 max-w-[180px]">
                        Create your first category to organize your services
                    </p>
                    <button
                        onClick={onCreate}
                        className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Category
                    </button>
                </>
            )}
        </div>
    );
}
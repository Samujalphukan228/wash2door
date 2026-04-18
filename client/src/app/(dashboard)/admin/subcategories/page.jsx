'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import SubcategoryCard from '@/components/admin/subcategories/SubcategoryCard';
import CreateSubcategoryModal from '@/components/admin/subcategories/CreateSubcategoryModal';
import EditSubcategoryModal from '@/components/admin/subcategories/EditSubcategoryModal';
import subcategoryService from '@/services/subcategoryService';
import categoryService from '@/services/categoryService';
import {
    Plus, RefreshCw, Layers, Search, X,
    Loader2, FolderOpen, Check,
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

export default function SubcategoriesPage() {
    const [subcategories, setSubcategories]   = useState([]);
    const [categories, setCategories]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [refreshing, setRefreshing]         = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [searchInput, setSearchInput]       = useState('');
    const [selectedCategory, setSelectedCategory]   = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal]     = useState(false);

    const debouncedSearch = useDebounce(searchInput, 300);

    // ── Fetch Categories ──
    const fetchCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const res = await categoryService.getAll({ limit: 100 });
            const cats = res.data?.categories || res.data || [];
            setCategories(cats);
            if (cats.length > 0 && !selectedCategory) setSelectedCategory(cats[0]._id);
            return cats;
        } catch {
            toast.error('Failed to fetch categories');
            return [];
        } finally {
            setLoadingCategories(false);
        }
    }, [selectedCategory]);

    // ── Fetch Subcategories ──
    const fetchSubcategories = useCallback(async (isRefresh = false) => {
        if (!selectedCategory) { setSubcategories([]); return; }
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await subcategoryService.getByCategory(selectedCategory, { includeInactive: 'true' });
            if (res.success && Array.isArray(res.data?.subcategories)) {
                setSubcategories(
                    [...res.data.subcategories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                );
            } else {
                setSubcategories([]);
            }
        } catch {
            toast.error('Failed to fetch subcategories');
            setSubcategories([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCategory]);

    // ── Init ──
    useEffect(() => {
        (async () => {
            const cats = await fetchCategories();
            if (cats.length > 0) setSelectedCategory(cats[0]._id);
        })();
    }, []);

    useEffect(() => {
        if (selectedCategory) fetchSubcategories(false);
    }, [selectedCategory, fetchSubcategories]);

    // ── Derived ──
    const filteredSubcategories = useMemo(() => {
        if (!debouncedSearch.trim()) return subcategories;
        const q = debouncedSearch.toLowerCase();
        return subcategories.filter((s) =>
            s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
        );
    }, [subcategories, debouncedSearch]);

    const stats = useMemo(() => ({
        total:    subcategories.length,
        active:   subcategories.filter((s) => s.isActive === true).length,
        inactive: subcategories.filter((s) => s.isActive === false).length,
    }), [subcategories]);

    const currentCategory = categories.find((c) => c._id === selectedCategory);

    // ── Handlers ──
    const handleCategoryChange = (id) => { setSelectedCategory(id); setSearchInput(''); };
    const handleEdit = (sub) => { setSelectedSubcategory(sub); setShowEditModal(true); };
    const handleRefresh = async () => { await fetchSubcategories(true); toast.success('Refreshed', { duration: 1200 }); };

    const handleDelete = async (subcategoryId) => {
        if (!confirm('Delete this subcategory? Services inside must be moved first.')) return;
        try {
            await subcategoryService.delete(subcategoryId);
            toast.success('Subcategory deleted');
            fetchSubcategories(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete subcategory');
        }
    };

    const handleToggleStatus = async (subcategory) => {
        const current = subcategory.isActive !== undefined ? subcategory.isActive : true;
        try {
            await subcategoryService.toggleStatus(subcategory._id);
            toast.success(`Subcategory ${current ? 'deactivated' : 'activated'}`);
            await new Promise((r) => setTimeout(r, 300));
            fetchSubcategories(true);
        } catch {
            toast.error('Failed to update subcategory status');
        }
    };

    // ── Loading ──
    if (loading && subcategories.length === 0 && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">
                            Loading subcategories...
                        </p>
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
                        <h1 className="text-base sm:text-lg font-semibold text-white">
                            Subcategories
                        </h1>
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
                            disabled={refreshing || !selectedCategory}
                            className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all flex items-center justify-center"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!selectedCategory}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add Subcategory</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* ── Category Tabs ── */}
                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                    <div className="flex gap-1.5 min-w-max p-1 bg-white/[0.04] rounded-lg">
                        {loadingCategories ? (
                            <div className="flex items-center gap-2 px-3 py-1.5">
                                <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                                <span className="text-[10px] text-white/30">Loading...</span>
                            </div>
                        ) : categories.length === 0 ? (
                            <p className="text-[10px] text-white/25 px-3 py-1.5">No categories available</p>
                        ) : (
                            categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryChange(cat._id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-md whitespace-nowrap transition-all ${
                                        selectedCategory === cat._id
                                            ? 'bg-white text-black'
                                            : 'text-white/40 hover:text-white/70'
                                    }`}
                                >
                                    {selectedCategory === cat._id ? (
                                        <Check className="w-3 h-3" />
                                    ) : cat.icon ? (
                                        <span className="text-[11px]">{cat.icon}</span>
                                    ) : null}
                                    {cat.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Stats + Search ── */}
                {selectedCategory && (
                    <div className="space-y-2.5">
                        {/* Stats strip */}
                        {!loading && (
                            <div className="grid grid-cols-3 gap-2">
                                <SubStat label="Total"    value={stats.total} />
                                <SubStat label="Active"   value={stats.active}   color="emerald" />
                                <SubStat label="Inactive" value={stats.inactive}
                                    color={stats.inactive > 0 ? 'amber' : undefined}
                                />
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search subcategories..."
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
                    </div>
                )}

                {/* ── Search result info ── */}
                {debouncedSearch && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/25">
                            {filteredSubcategories.length} result{filteredSubcategories.length !== 1 ? 's' : ''} for
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-white/50">
                            "{debouncedSearch}"
                            <button onClick={() => setSearchInput('')} className="text-white/25 hover:text-white/60 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    </div>
                )}

                {/* ── Content ── */}
                {!selectedCategory ? (
                    <EmptyState type="no-category" />
                ) : loading ? (
                    <LoadingGrid />
                ) : filteredSubcategories.length === 0 ? (
                    <EmptyState
                        type={debouncedSearch ? 'no-results' : 'empty'}
                        searchQuery={debouncedSearch}
                        onClear={() => setSearchInput('')}
                        onCreate={() => setShowCreateModal(true)}
                        categoryName={currentCategory?.name}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                        {filteredSubcategories.map((subcategory) => (
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
            <div className="sm:hidden fixed bottom-20 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!selectedCategory}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
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
                    onClose={() => { setShowEditModal(false); setSelectedSubcategory(null); }}
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

// ============================================
// SUB STAT
// ============================================

function SubStat({ label, value, color }) {
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
// LOADING GRID
// ============================================

function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {[...Array(4)].map((_, i) => (
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

function EmptyState({ type, searchQuery, onClear, onCreate, categoryName }) {
    const config = {
        'no-category': {
            icon: Layers,
            title: 'Select a category',
            subtitle: 'Choose a category above to view its subcategories',
        },
        'no-results': {
            icon: Search,
            title: 'No results found',
            subtitle: `No subcategories match "${searchQuery}"`,
        },
        'empty': {
            icon: FolderOpen,
            title: 'No subcategories yet',
            subtitle: `Create the first subcategory for ${categoryName || 'this category'}`,
        },
    };

    const { icon: Icon, title, subtitle } = config[type];

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-[11px] text-white/40 mb-0.5">{title}</p>
            <p className="text-[10px] text-white/20 max-w-[200px]">{subtitle}</p>

            {type === 'no-results' && onClear && (
                <button
                    onClick={onClear}
                    className="mt-4 text-[10px] text-white/40 hover:text-white underline underline-offset-2 transition-colors"
                >
                    Clear search
                </button>
            )}
            {type === 'empty' && onCreate && (
                <button
                    onClick={onCreate}
                    className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Create Subcategory
                </button>
            )}
        </div>
    );
}
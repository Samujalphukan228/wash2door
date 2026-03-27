'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateSubcategoryModal from '@/components/admin/subcategories/CreateSubcategoryModal';
import EditSubcategoryModal from '@/components/admin/subcategories/EditSubcategoryModal';
import subcategoryService from '@/services/subcategoryService';
import categoryService from '@/services/categoryService';
import Image from 'next/image';
import {
    Plus,
    RefreshCw,
    Layers,
    Search,
    X,
    Loader2,
    MoreVertical,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    FolderOpen,
    Package,
    Hash,
    Check
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

export default function SubcategoriesPage() {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const response = await categoryService.getAll({ limit: 100 });
            const cats = response.data?.categories || response.data || [];
            setCategories(cats);

            // Set first category as default
            if (cats.length > 0 && !selectedCategory) {
                setSelectedCategory(cats[0]._id);
            }

            return cats;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to fetch categories');
            return [];
        } finally {
            setLoadingCategories(false);
        }
    }, [selectedCategory]);

    // Fetch subcategories
    const fetchSubcategories = useCallback(async (isRefresh = false) => {
        if (!selectedCategory) {
            setSubcategories([]);
            return;
        }

        try {
            isRefresh ? setRefreshing(true) : setLoading(true);

            const response = await subcategoryService.getByCategory(selectedCategory, {
                includeInactive: 'true'
            });

            if (response.success && Array.isArray(response.data?.subcategories)) {
                const subs = response.data.subcategories
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                setSubcategories(subs);
            } else {
                setSubcategories([]);
            }
        } catch (error) {
            console.error('Failed to fetch subcategories:', error);
            toast.error('Failed to fetch subcategories');
            setSubcategories([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCategory]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            const cats = await fetchCategories();
            if (cats.length > 0) {
                setSelectedCategory(cats[0]._id);
            }
        };
        init();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchSubcategories(false);
        }
    }, [selectedCategory, fetchSubcategories]);

    // Filter subcategories by search
    const filteredSubcategories = useMemo(() => {
        if (!debouncedSearch.trim()) return subcategories;
        const query = debouncedSearch.toLowerCase();
        return subcategories.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.description?.toLowerCase().includes(query)
        );
    }, [subcategories, debouncedSearch]);

    // Stats
    const stats = useMemo(() => ({
        total: subcategories.length,
        active: subcategories.filter(s => s.isActive === true).length,
        inactive: subcategories.filter(s => s.isActive === false).length
    }), [subcategories]);

    const currentCategory = categories.find(c => c._id === selectedCategory);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSearchInput('');
    };

    const handleEdit = (subcategory) => {
        setSelectedSubcategory(subcategory);
        setShowEditModal(true);
    };

    const handleDelete = async (subcategoryId) => {
        if (!confirm('Delete this subcategory? Services inside must be moved or deleted first.')) {
            return;
        }
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
            await new Promise(resolve => setTimeout(resolve, 300));
            fetchSubcategories(true);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update subcategory status');
        }
    };

    const handleRefresh = async () => {
        await fetchSubcategories(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    // ── Loading State ───────────────────────────────────────────────────────
    if (loading && subcategories.length === 0 && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <p className="text-sm text-gray-500">Loading subcategories...</p>
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
                            <h1 className="text-base font-semibold text-white leading-tight">Subcategories</h1>
                            <p className="text-[11px] text-gray-500">
                                {currentCategory ? (
                                    <>
                                        <span className="text-gray-400">{currentCategory.icon} {currentCategory.name}</span>
                                        {' · '}{stats.total} total
                                    </>
                                ) : (
                                    'Select a category'
                                )}
                            </p>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || !selectedCategory}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 hover:text-white disabled:opacity-50 transition-all shrink-0"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Add Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!selectedCategory}
                            className="flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add New</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>

                    {/* Search Row */}
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search subcategories..."
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
                    </div>

                    {/* Category Tabs */}
                    <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            {loadingCategories ? (
                                <div className="flex items-center gap-2 h-8">
                                    <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Loading...</span>
                                </div>
                            ) : categories.length === 0 ? (
                                <p className="text-xs text-gray-500">No categories available</p>
                            ) : (
                                categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryChange(cat._id)}
                                        className={`
                                            h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5
                                            ${selectedCategory === cat._id
                                                ? 'bg-white text-black'
                                                : 'bg-white/[0.06] text-gray-400 hover:text-white'
                                            }
                                        `}
                                    >
                                        {selectedCategory === cat._id && <Check className="w-3 h-3" />}
                                        {cat.icon && selectedCategory !== cat._id && <span>{cat.icon}</span>}
                                        {cat.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    {selectedCategory && !loading && (
                        <div className="px-4 pb-3 flex gap-2">
                            <StatPill label="Total" value={stats.total} />
                            <StatPill label="Active" value={stats.active} />
                            {stats.inactive > 0 && (
                                <StatPill label="Inactive" value={stats.inactive} highlight />
                            )}
                        </div>
                    )}
                </header>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* SUBCATEGORIES LIST                                         */}
                {/* ══════════════════════════════════════════════════════════ */}
                <div className="px-4 py-4 pb-28 sm:pb-8">
                    {/* Search Result Info */}
                    {debouncedSearch && (
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] text-gray-500">
                                {filteredSubcategories.length} result{filteredSubcategories.length !== 1 ? 's' : ''} for
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

                    {!selectedCategory ? (
                        <EmptyState
                            type="no-category"
                            message="Select a category to view subcategories"
                        />
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
                        <div className="space-y-3">
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
            </div>

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-20 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!selectedCategory}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Create new subcategory"
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

// ═══════════════════════════════════════════════════════════════════════════
// STAT PILL
// ═══════════════════════════════════════════════════════════════════════════

function StatPill({ label, value, highlight = false }) {
    return (
        <div className={`
            inline-flex items-center gap-2 h-7 px-3 rounded-full text-xs transition-all
            ${highlight
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-white/[0.04] border border-white/[0.06]'
            }
        `}>
            <span className="text-gray-500">{label}</span>
            <span className={`font-semibold ${highlight ? 'text-yellow-400' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCATEGORY CARD
// ═══════════════════════════════════════════════════════════════════════════

function SubcategoryCard({ subcategory, categoryName, onEdit, onDelete, onToggleStatus }) {
    const [showActions, setShowActions] = useState(false);
    const menuRef = useRef(null);
    const hasImage = subcategory.image?.url && !subcategory.image.url.includes('default');
    const canDelete = (subcategory.totalServices || 0) === 0;

    // Close menu on outside click
    useEffect(() => {
        if (!showActions) return;
        const handle = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowActions(false);
            }
        };
        document.addEventListener('mousedown', handle);
        document.addEventListener('touchstart', handle);
        return () => {
            document.removeEventListener('mousedown', handle);
            document.removeEventListener('touchstart', handle);
        };
    }, [showActions]);

    return (
        <div className={`
            relative bg-white/[0.03] rounded-2xl overflow-visible transition-all
            ${!subcategory.isActive && 'opacity-50'}
        `}>
            <div className="flex gap-3 p-3">
                {/* Image / Icon */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white/[0.05] rounded-xl overflow-hidden shrink-0">
                    {hasImage ? (
                        <Image
                            src={subcategory.image.url}
                            alt={subcategory.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {subcategory.icon ? (
                                <span className="text-2xl sm:text-3xl">{subcategory.icon}</span>
                            ) : (
                                <FolderOpen className="w-6 h-6 text-gray-700" />
                            )}
                        </div>
                    )}

                    {/* Order Badge */}
                    {subcategory.displayOrder !== undefined && (
                        <div className="absolute bottom-1 left-1">
                            <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-black/70 text-white/60 flex items-center gap-0.5">
                                <Hash className="w-2 h-2" />
                                {subcategory.displayOrder}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-white truncate">
                                    {subcategory.name}
                                </h3>
                                {subcategory.icon && (
                                    <span className="text-sm shrink-0">{subcategory.icon}</span>
                                )}
                            </div>
                            {subcategory.description && (
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                    {subcategory.description}
                                </p>
                            )}
                        </div>

                        {/* Actions Menu */}
                        <div className="relative shrink-0" ref={menuRef}>
                            <button
                                onClick={() => setShowActions(v => !v)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/[0.05] transition-colors"
                                aria-label="More actions"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {showActions && (
                                <div className="absolute right-0 top-8 z-20 bg-[#1a1a1a] rounded-xl border border-white/[0.08] shadow-xl overflow-hidden min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150">
                                    <ActionItem
                                        icon={Pencil}
                                        label="Edit subcategory"
                                        onClick={() => { onEdit(subcategory); setShowActions(false); }}
                                    />
                                    <ActionItem
                                        icon={subcategory.isActive ? ToggleLeft : ToggleRight}
                                        label={subcategory.isActive ? 'Deactivate' : 'Activate'}
                                        onClick={() => { onToggleStatus(subcategory); setShowActions(false); }}
                                    />
                                    <div className="h-px bg-white/[0.06] mx-2" />
                                    <ActionItem
                                        icon={Trash2}
                                        label={canDelete ? 'Delete' : 'Has services'}
                                        onClick={() => {
                                            if (canDelete) {
                                                onDelete(subcategory._id);
                                            } else {
                                                toast.error('Remove services first');
                                            }
                                            setShowActions(false);
                                        }}
                                        danger
                                        disabled={!canDelete}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-gray-500">
                            <Package className="w-3 h-3" />
                            <span className="text-xs">
                                {subcategory.totalServices || 0} service{(subcategory.totalServices || 0) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`
                            text-[10px] px-2 py-0.5 rounded-full font-medium
                            ${subcategory.isActive
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-white/[0.05] text-gray-500'
                            }
                        `}>
                            {subcategory.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionItem({ icon: Icon, label, onClick, danger = false, disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors
                ${disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-gray-300 hover:bg-white/[0.05]'
                }
            `}
        >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING / EMPTY STATES
// ═══════════════════════════════════════════════════════════════════════════

function LoadingGrid() {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/[0.02] rounded-2xl animate-pulse">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/[0.05] rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-2/3 bg-white/[0.05] rounded-lg" />
                        <div className="h-3 w-1/2 bg-white/[0.04] rounded-lg" />
                        <div className="h-3 w-1/4 bg-white/[0.03] rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ type, searchQuery, onClear, onCreate, categoryName }) {
    const config = {
        'no-category': {
            icon: Layers,
            title: 'Select a category',
            subtitle: 'Choose a category above to view its subcategories'
        },
        'no-results': {
            icon: Search,
            title: 'No results found',
            subtitle: `No subcategories match "${searchQuery}"`
        },
        'empty': {
            icon: FolderOpen,
            title: 'No subcategories yet',
            subtitle: `Create your first subcategory for ${categoryName || 'this category'}`
        }
    };

    const { icon: Icon, title, subtitle } = config[type];

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-xs text-gray-600 max-w-[220px]">{subtitle}</p>

            {type === 'no-results' && onClear && (
                <button
                    onClick={onClear}
                    className="mt-4 text-xs text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                >
                    Clear search
                </button>
            )}

            {type === 'empty' && onCreate && (
                <button
                    onClick={onCreate}
                    className="mt-4 flex items-center gap-2 h-9 px-4 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Create Subcategory
                </button>
            )}
        </div>
    );
}
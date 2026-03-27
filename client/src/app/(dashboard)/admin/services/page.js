'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateServiceModal from '@/components/admin/services/CreateServiceModal';
import EditServiceModal from '@/components/admin/services/EditServiceModal';
import ServiceDetailModal from '@/components/admin/services/ServiceDetailModal';
import serviceService from '@/services/serviceService';
import categoryService from '@/services/categoryService';
import subcategoryService from '@/services/subcategoryService';
import Image from 'next/image';
import {
    Plus,
    RefreshCw,
    Search,
    X,
    ChevronRight,
    ChevronLeft,
    Eye,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Star,
    Clock,
    Package,
    Loader2,
    MoreVertical,
    IndianRupee,
    SlidersHorizontal,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    // Local search input — debounced before it hits filters
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 400);

    // Filter drawer visible on mobile
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        category: '',
        subcategory: '',
        search: ''
    });

    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const listTopRef = useRef(null);

    // Sync debounced search → filters
    useEffect(() => {
        setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ isActive: true, limit: 100 });
                if (response.success) {
                    const cats = response.data?.categories || response.data || [];
                    setCategories(Array.isArray(cats) ? cats : []);
                }
            } catch {
                console.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (!filters.category) {
            setSubcategories([]);
            return;
        }
        const fetchSubcategories = async () => {
            try {
                setLoadingSubcategories(true);
                const response = await subcategoryService.getByCategory(filters.category);
                let subs = [];
                if (response.data?.subcategories && Array.isArray(response.data.subcategories)) {
                    subs = response.data.subcategories;
                } else if (Array.isArray(response.data)) {
                    subs = response.data;
                }
                setSubcategories(Array.isArray(subs) ? subs : []);
            } catch {
                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        };
        fetchSubcategories();
    }, [filters.category]);

    // Fetch services
    const fetchServices = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '')
            );
            const response = await serviceService.getAll(params);
            if (response.success) {
                setServices(response.data);
                setTotal(response.total);
                setPages(response.pages);
            }
        } catch {
            toast.error('Failed to fetch services');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const hasActiveFilters = filters.category || filters.subcategory || filters.search;

    const selectedCategoryName = filters.category
        ? categories.find(c => c._id === filters.category)?.name
        : null;

    const selectedSubcategoryName = filters.subcategory
        ? subcategories.find(s => s._id === filters.subcategory)?.name
        : null;

    // ── Handlers ──────────────────────────────────────────────────────────────
    // ✅ FIX: Don't close drawer on category change - let user select subcategory too
    const handleCategoryChange = (categoryId) => {
        setFilters(prev => ({ ...prev, category: categoryId, subcategory: '', page: 1 }));
        // Drawer stays open - filters apply immediately in background
    };

    // ✅ FIX: Option to auto-close after subcategory selection (better UX)
    const handleSubcategoryChange = (subcategoryId, autoClose = false) => {
        setFilters(prev => ({ ...prev, subcategory: subcategoryId, page: 1 }));
        if (autoClose) {
            setShowFilterDrawer(false);
        }
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleView = (service) => {
        setSelectedService(service);
        setShowDetailModal(true);
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleDelete = async (serviceId) => {
        if (!confirm('Delete this service? This cannot be undone.')) return;
        try {
            await serviceService.delete(serviceId);
            toast.success('Service deleted');
            fetchServices(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleToggleActive = async (service) => {
        try {
            const formData = new FormData();
            formData.append('isActive', !service.isActive);
            await serviceService.update(service._id, formData);
            toast.success(`Service ${!service.isActive ? 'activated' : 'deactivated'}`);
            fetchServices(true);
        } catch {
            toast.error('Failed to update');
        }
    };

    const handleRefresh = () => {
        fetchServices(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    const handleClearAll = () => {
        setSearchInput('');
        setFilters(prev => ({ ...prev, category: '', subcategory: '', search: '', page: 1 }));
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading && services.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <p className="text-sm text-gray-500">Loading services...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">

                {/* HEADER */}
                <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-white/[0.06]">
                    <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-semibold text-white leading-tight">Services</h1>
                            <p className="text-[11px] text-gray-500">
                                {total} total
                                {hasActiveFilters && (
                                    <> · <span className="text-white">{total} result{total !== 1 ? 's' : ''}</span></>
                                )}
                            </p>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 hover:text-white disabled:opacity-50 transition-all shrink-0"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add New</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>

                    {/* Search + Filter trigger row */}
                    <div className="px-4 pb-3 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search services..."
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

                        {/* Filter button (mobile) */}
                        <button
                            onClick={() => setShowFilterDrawer(true)}
                            className={`
                                sm:hidden w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all relative
                                ${hasActiveFilters
                                    ? 'bg-white text-black'
                                    : 'bg-white/[0.05] text-gray-400'
                                }
                            `}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full text-black text-[9px] font-bold flex items-center justify-center border-2 border-black">
                                    {[filters.category, filters.subcategory].filter(Boolean).length || ''}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Desktop: category tabs inline in header */}
                    <div className="hidden sm:block px-4 pb-3 overflow-x-auto scrollbar-hide">
                        <CategoryTabs
                            categories={categories}
                            activeCategory={filters.category}
                            onSelect={handleCategoryChange}
                        />
                        {filters.category && (
                            <div className="mt-2">
                                <SubcategoryTabs
                                    subcategories={subcategories}
                                    activeSubcategory={filters.subcategory}
                                    loading={loadingSubcategories}
                                    categoryName={selectedCategoryName}
                                    onSelect={(id) => handleSubcategoryChange(id, false)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Active filter pills (desktop) */}
                    {hasActiveFilters && (
                        <div className="hidden sm:flex px-4 pb-3 items-center gap-2">
                            {selectedCategoryName && (
                                <FilterPill
                                    label={selectedCategoryName}
                                    onRemove={() => handleCategoryChange('')}
                                />
                            )}
                            {selectedSubcategoryName && (
                                <FilterPill
                                    label={selectedSubcategoryName}
                                    onRemove={() => handleSubcategoryChange('')}
                                />
                            )}
                            {filters.search && (
                                <FilterPill
                                    label={`"${filters.search}"`}
                                    onRemove={() => setSearchInput('')}
                                />
                            )}
                            <button
                                onClick={handleClearAll}
                                className="text-[11px] text-gray-500 hover:text-white transition-colors ml-auto"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </header>

                {/* SERVICES LIST */}
                <div ref={listTopRef} className="px-4 py-4 pb-8">
                    {/* Mobile active filters summary */}
                    {hasActiveFilters && (
                        <div className="sm:hidden flex items-center gap-2 mb-3 flex-wrap">
                            {selectedCategoryName && (
                                <FilterPill
                                    label={selectedCategoryName}
                                    onRemove={() => handleCategoryChange('')}
                                />
                            )}
                            {selectedSubcategoryName && (
                                <FilterPill
                                    label={selectedSubcategoryName}
                                    onRemove={() => handleSubcategoryChange('')}
                                />
                            )}
                            {filters.search && (
                                <FilterPill
                                    label={`"${filters.search}"`}
                                    onRemove={() => setSearchInput('')}
                                />
                            )}
                            <button
                                onClick={handleClearAll}
                                className="text-[11px] text-gray-500 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <LoadingGrid />
                    ) : services.length === 0 ? (
                        <EmptyState onClear={handleClearAll} hasFilters={!!hasActiveFilters} />
                    ) : (
                        <div className="space-y-3">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service._id}
                                    service={service}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleActive={handleToggleActive}
                                />
                            ))}
                        </div>
                    )}

                    {pages > 1 && !loading && (
                        <Pagination
                            currentPage={filters.page}
                            totalPages={pages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>

            {/* ✅ IMPROVED MOBILE FILTER DRAWER */}
            {showFilterDrawer && (
                <FilterDrawer
                    categories={categories}
                    subcategories={subcategories}
                    loadingSubcategories={loadingSubcategories}
                    activeCategory={filters.category}
                    activeSubcategory={filters.subcategory}
                    selectedCategoryName={selectedCategoryName}
                    totalResults={total}
                    isLoading={loading}
                    onCategoryChange={handleCategoryChange}
                    onSubcategoryChange={(id) => handleSubcategoryChange(id, true)} // Auto-close on subcategory
                    onClear={handleClearAll}
                    onClose={() => setShowFilterDrawer(false)}
                />
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateServiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchServices(true);
                    }}
                />
            )}

            {showEditModal && selectedService && (
                <EditServiceModal
                    service={selectedService}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedService(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedService(null);
                        fetchServices(true);
                        toast.success('Service updated!');
                    }}
                />
            )}

            {showDetailModal && selectedService && (
                <ServiceDetailModal
                    service={selectedService}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedService(null);
                    }}
                    onEdit={() => {
                        setShowDetailModal(false);
                        setShowEditModal(true);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ✅ IMPROVED FILTER DRAWER - Real-time updates with live result count
// ═══════════════════════════════════════════════════════════════════════════

function FilterDrawer({
    categories, subcategories, loadingSubcategories,
    activeCategory, activeSubcategory,
    selectedCategoryName,
    totalResults,
    isLoading,
    onCategoryChange, onSubcategoryChange,
    onClear, onClose
}) {
    const activeFiltersCount = [activeCategory, activeSubcategory].filter(Boolean).length;

    return (
        <>
            {/* Backdrop - slightly more transparent to show results updating */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed bottom-0 inset-x-0 z-50 bg-[#111] rounded-t-2xl border-t border-white/[0.08] max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header row */}
                <div className="flex items-center justify-between px-4 pb-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={onClear}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-gray-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-4 pb-6">
                    {/* Category label */}
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">Category</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        <FilterChip
                            label="All"
                            isActive={!activeCategory}
                            onClick={() => onCategoryChange('')}
                        />
                        {categories.map((cat) => (
                            <FilterChip
                                key={cat._id}
                                label={cat.name}
                                icon={cat.icon}
                                isActive={activeCategory === cat._id}
                                onClick={() => onCategoryChange(cat._id)}
                            />
                        ))}
                    </div>

                    {/* Subcategory - only show when category selected */}
                    {activeCategory && (
                        <>
                            <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">
                                {selectedCategoryName}
                            </p>
                            {loadingSubcategories ? (
                                <div className="flex items-center gap-2 h-8">
                                    <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Loading...</span>
                                </div>
                            ) : subcategories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    <FilterChip
                                        label={`All ${selectedCategoryName}`}
                                        isActive={!activeSubcategory}
                                        onClick={() => onSubcategoryChange('')}
                                        variant="secondary"
                                    />
                                    {subcategories.map((sub) => (
                                        <FilterChip
                                            key={sub._id}
                                            label={sub.name}
                                            icon={sub.icon}
                                            isActive={activeSubcategory === sub._id}
                                            onClick={() => onSubcategoryChange(sub._id)}
                                            variant="secondary"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-600">No subcategories available</p>
                            )}
                        </>
                    )}
                </div>

                {/* ✅ Live results button - shows count updating in real-time */}
                <div className="shrink-0 px-4 pb-8 pt-3 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="w-full h-11 bg-white text-black text-sm font-medium rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <span>Show {totalResults} result{totalResults !== 1 ? 's' : ''}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

// ✅ Reusable filter chip with checkmark for active state
function FilterChip({ label, icon, isActive, onClick, variant = 'primary' }) {
    const baseStyles = variant === 'primary'
        ? isActive
            ? 'bg-white text-black'
            : 'bg-white/[0.06] text-gray-400'
        : isActive
            ? 'bg-white/20 text-white'
            : 'bg-white/[0.04] text-gray-500';

    return (
        <button
            onClick={onClick}
            className={`
                h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all 
                flex items-center gap-1.5 active:scale-95
                ${baseStyles}
            `}
        >
            {isActive && <Check className="w-3 h-3" />}
            {icon && !isActive && <span className="text-sm">{icon}</span>}
            {label}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED FILTER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function CategoryTabs({ categories, activeCategory, onSelect }) {
    return (
        <div className="flex gap-2 min-w-max">
            <button
                onClick={() => onSelect('')}
                className={`h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    !activeCategory ? 'bg-white text-black' : 'bg-white/[0.06] text-gray-400 hover:text-white'
                }`}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat._id}
                    onClick={() => onSelect(cat._id)}
                    className={`
                        h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5
                        ${activeCategory === cat._id
                            ? 'bg-white text-black'
                            : 'bg-white/[0.06] text-gray-400 hover:text-white'
                        }
                    `}
                >
                    {cat.icon && <span className="text-sm">{cat.icon}</span>}
                    {cat.name}
                </button>
            ))}
        </div>
    );
}

function SubcategoryTabs({ subcategories, activeSubcategory, loading, categoryName, onSelect }) {
    if (loading) {
        return (
            <div className="flex items-center gap-2 h-7">
                <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
                <span className="text-[11px] text-gray-500">Loading...</span>
            </div>
        );
    }
    if (!subcategories.length) return null;

    return (
        <div className="flex gap-1.5 min-w-max">
            <button
                onClick={() => onSelect('')}
                className={`h-7 px-3 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    !activeSubcategory ? 'bg-white/20 text-white' : 'bg-white/[0.04] text-gray-500 hover:text-white'
                }`}
            >
                All {categoryName}
            </button>
            {subcategories.map((sub) => (
                <button
                    key={sub._id}
                    onClick={() => onSelect(sub._id)}
                    className={`
                        h-7 px-3 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1
                        ${activeSubcategory === sub._id
                            ? 'bg-white/20 text-white'
                            : 'bg-white/[0.04] text-gray-500 hover:text-white'
                        }
                    `}
                >
                    {sub.icon && <span>{sub.icon}</span>}
                    {sub.name}
                </button>
            ))}
        </div>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-white/[0.08] text-[11px] text-gray-300">
            {label}
            <button onClick={onRemove} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CARD
// ═══════════════════════════════════════════════════════════════════════════

function ServiceCard({ service, onView, onEdit, onDelete, onToggleActive }) {
    const [showActions, setShowActions] = useState(false);
    const menuRef = useRef(null);
    const primaryImage = service.images?.find(img => img.isPrimary) || service.images?.[0];
    const categoryName = service.category?.name || '';
    const subcategoryName = service.subcategory?.name || '';

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
        <div className={`relative bg-white/[0.03] rounded-2xl overflow-visible transition-opacity ${!service.isActive && 'opacity-50'}`}>
            <div className="flex gap-3 p-3">
                <button
                    className="relative w-20 h-20 bg-white/[0.05] rounded-xl overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    onClick={() => onView(service)}
                    aria-label={`View ${service.name}`}
                >
                    {primaryImage ? (
                        <Image
                            src={primaryImage.url}
                            alt={service.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-700" />
                        </div>
                    )}
                    {service.isFeatured && (
                        <div className="absolute top-1 left-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </div>
                    )}
                </button>

                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <button
                                className="text-sm font-medium text-white truncate block max-w-full text-left focus:outline-none"
                                onClick={() => onView(service)}
                            >
                                {service.name}
                            </button>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {categoryName}{subcategoryName && ` · ${subcategoryName}`}
                            </p>
                        </div>

                        <div className="relative shrink-0" ref={menuRef}>
                            <button
                                onClick={() => setShowActions(v => !v)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/[0.05] transition-colors"
                                aria-label="More actions"
                                aria-expanded={showActions}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {showActions && (
                                <div className="absolute right-0 top-8 z-20 bg-[#1a1a1a] rounded-xl border border-white/[0.08] shadow-xl overflow-hidden min-w-[148px]">
                                    <ActionItem icon={Eye} label="View details" onClick={() => { onView(service); setShowActions(false); }} />
                                    <ActionItem icon={Pencil} label="Edit service" onClick={() => { onEdit(service); setShowActions(false); }} />
                                    <ActionItem
                                        icon={service.isActive ? ToggleLeft : ToggleRight}
                                        label={service.isActive ? 'Deactivate' : 'Activate'}
                                        onClick={() => { onToggleActive(service); setShowActions(false); }}
                                    />
                                    <div className="h-px bg-white/[0.06] mx-2" />
                                    <ActionItem
                                        icon={Trash2}
                                        label="Delete"
                                        onClick={() => { onDelete(service._id); setShowActions(false); }}
                                        danger
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-0.5 text-white">
                            <IndianRupee className="w-3 h-3" />
                            <span className="text-sm font-semibold">
                                {service.price?.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{service.duration} min</span>
                        </div>
                        {service.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <Star className="w-3 h-3" />
                                <span className="text-xs">{service.averageRating?.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <span className={`
                            text-[10px] px-2 py-0.5 rounded-full font-medium
                            ${service.isActive
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-white/[0.05] text-gray-500'
                            }
                        `}>
                            {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {service.tier && service.tier !== 'basic' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 capitalize">
                                {service.tier}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionItem({ icon: Icon, label, onClick, danger = false }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-gray-300 hover:bg-white/[0.05]'
            }`}
        >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING / EMPTY
// ═══════════════════════════════════════════════════════════════════════════

function LoadingGrid() {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/[0.02] rounded-2xl animate-pulse">
                    <div className="w-20 h-20 bg-white/[0.05] rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-3/4 bg-white/[0.05] rounded-lg" />
                        <div className="h-3 w-1/2 bg-white/[0.04] rounded-lg" />
                        <div className="h-3 w-1/3 bg-white/[0.03] rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ onClear, hasFilters }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400 mb-1">No services found</p>
            <p className="text-xs text-gray-600 max-w-[180px]">
                {hasFilters
                    ? 'Try adjusting your filters'
                    : 'Add your first service to get started'
                }
            </p>
            {hasFilters && (
                <button
                    onClick={onClear}
                    className="mt-4 text-xs text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = useMemo(() => {
        const count = Math.min(5, totalPages);
        let start;
        if (totalPages <= 5) {
            start = 1;
        } else if (currentPage <= 3) {
            start = 1;
        } else if (currentPage >= totalPages - 2) {
            start = totalPages - 4;
        } else {
            start = currentPage - 2;
        }
        return Array.from({ length: count }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-center gap-1 pt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`
                        w-9 h-9 rounded-xl text-xs font-medium transition-all
                        ${currentPage === page
                            ? 'bg-white text-black'
                            : 'text-gray-500 hover:bg-white/[0.05]'
                        }
                    `}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
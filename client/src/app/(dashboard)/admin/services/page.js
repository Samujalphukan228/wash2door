'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateServiceModal from '@/components/admin/services/CreateServiceModal';
import EditServiceModal from '@/components/admin/services/EditServiceModal';
import ServiceDetailModal from '@/components/admin/services/ServiceDetailModal';
import serviceService from '@/services/serviceService';
import categoryService from '@/services/categoryService';
import subcategoryService from '@/services/subcategoryService';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import {
    Plus, RefreshCw, Search, X,
    ChevronRight, ChevronLeft, Eye, Pencil, Trash2,
    ToggleLeft, ToggleRight, Star, Clock, Package,
    Loader2, IndianRupee, SlidersHorizontal, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// DEBOUNCE HOOK
// ============================================

function useDebounce(value, delay = 400) {
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

export default function ServicesPage() {
    const [services, setServices]             = useState([]);
    const [categories, setCategories]         = useState([]);
    const [subcategories, setSubcategories]   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [refreshing, setRefreshing]         = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [total, setTotal]                   = useState(0);
    const [pages, setPages]                   = useState(1);
    const [searchInput, setSearchInput]       = useState('');
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [selectedService, setSelectedService]   = useState(null);
    const [showCreateModal, setShowCreateModal]   = useState(false);
    const [showEditModal, setShowEditModal]       = useState(false);
    const [showDetailModal, setShowDetailModal]   = useState(false);

    const [filters, setFilters] = useState({
        page: 1, limit: 12, category: '', subcategory: '', search: '',
    });

    const debouncedSearch = useDebounce(searchInput, 400);
    const listTopRef = useRef(null);
    const { onServiceEvent } = useSocket();

    // ── Sync search → filters ──
    useEffect(() => {
        setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);

    // ── Fetch Categories ──
    useEffect(() => {
        (async () => {
            try {
                const res = await categoryService.getAll({ isActive: true, limit: 100 });
                if (res.success) {
                    const cats = res.data?.categories || res.data || [];
                    setCategories(Array.isArray(cats) ? cats : []);
                }
            } catch {}
        })();
    }, []);

    // ── Fetch Subcategories ──
    useEffect(() => {
        if (!filters.category) { setSubcategories([]); return; }
        (async () => {
            try {
                setLoadingSubcategories(true);
                const res = await subcategoryService.getByCategory(filters.category);
                const subs = res.data?.subcategories && Array.isArray(res.data.subcategories)
                    ? res.data.subcategories
                    : Array.isArray(res.data) ? res.data : [];
                setSubcategories(subs);
            } catch {
                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        })();
    }, [filters.category]);

    // ── Fetch Services ──
    const fetchServices = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '')
            );
            const res = await serviceService.getAll(params);
            if (res.success) {
                setServices(res.data);
                setTotal(res.total);
                setPages(res.pages);
            }
        } catch {
            toast.error('Failed to fetch services');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    // ── Real-time ──
    useEffect(() => {
        const unsub = onServiceEvent((event) => {
            if (event.type === 'created' && filters.page === 1) {
                setServices((prev) => {
                    if (prev.find((s) => s._id === event.data.serviceId)) return prev;
                    const ns = { _id: event.data.serviceId, images: [], averageRating: 0, ...event.data };
                    const updated = [ns, ...prev];
                    if (updated.length > filters.limit) updated.pop();
                    return updated;
                });
                setTotal((p) => p + 1);
            } else if (event.type === 'updated') {
                setServices((prev) => prev.map((s) =>
                    s._id === event.data.serviceId
                        ? { ...s, ...event.data, _id: event.data.serviceId, category: event.data.category || s.category, subcategory: event.data.subcategory || s.subcategory, images: event.data.images || s.images }
                        : s
                ));
            } else if (event.type === 'deleted') {
                setServices((prev) => prev.filter((s) => s._id !== event.data.serviceId && s._id !== event.data._id));
                setTotal((p) => Math.max(0, p - 1));
            }
        });
        return unsub;
    }, [onServiceEvent, filters.page, filters.limit]);

    // ── Derived ──
    const hasActiveFilters    = filters.category || filters.subcategory || filters.search;
    const selectedCategoryName    = filters.category    ? categories.find((c) => c._id === filters.category)?.name    : null;
    const selectedSubcategoryName = filters.subcategory ? subcategories.find((s) => s._id === filters.subcategory)?.name : null;

    // ── Handlers ──
    const handleCategoryChange    = (id) => setFilters((p) => ({ ...p, category: id, subcategory: '', page: 1 }));
    const handleSubcategoryChange = (id, autoClose = false) => { setFilters((p) => ({ ...p, subcategory: id, page: 1 })); if (autoClose) setShowFilterDrawer(false); };
    const handlePageChange = (page) => { setFilters((p) => ({ ...p, page })); listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const handleView       = (s) => { setSelectedService(s); setShowDetailModal(true); };
    const handleEdit       = (s) => { setSelectedService(s); setShowEditModal(true); };
    const handleRefresh    = () => { fetchServices(true); toast.success('Refreshed', { duration: 1200 }); };
    const handleClearAll   = () => { setSearchInput(''); setFilters((p) => ({ ...p, category: '', subcategory: '', search: '', page: 1 })); };

    const handleDelete = async (serviceId) => {
        if (!confirm('Delete this service? This cannot be undone.')) return;
        try {
            await serviceService.delete(serviceId);
            toast.success('Service deleted');
            fetchServices(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleToggleActive = async (service) => {
        try {
            const fd = new FormData();
            fd.append('isActive', !service.isActive);
            await serviceService.update(service._id, fd);
            toast.success(`Service ${!service.isActive ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update');
        }
    };

    // ── Loading ──
    if (loading && services.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">Loading services...</p>
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
                        <h1 className="text-base sm:text-lg font-semibold text-white">Services</h1>
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
                            <span className="hidden sm:inline">Add Service</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* ── Category Tabs ── */}
                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                    <div className="flex gap-1.5 min-w-max p-1 bg-white/[0.04] rounded-lg">
                        <button
                            onClick={() => handleCategoryChange('')}
                            className={`px-3 py-2 text-[11px] font-medium rounded-md whitespace-nowrap transition-all ${
                                !filters.category ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryChange(cat._id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-md whitespace-nowrap transition-all ${
                                    filters.category === cat._id
                                        ? 'bg-white text-black'
                                        : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                {filters.category === cat._id ? (
                                    <Check className="w-3 h-3" />
                                ) : cat.icon ? (
                                    <span className="text-[11px]">{cat.icon}</span>
                                ) : null}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Subcategory Tabs (when category selected) ── */}
                {filters.category && (
                    <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                        {loadingSubcategories ? (
                            <div className="flex items-center gap-2 h-8 px-1">
                                <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                                <span className="text-[10px] text-white/25">Loading...</span>
                            </div>
                        ) : subcategories.length > 0 ? (
                            <div className="flex gap-1.5 min-w-max">
                                <button
                                    onClick={() => handleSubcategoryChange('')}
                                    className={`px-2.5 py-1.5 text-[10px] font-medium rounded-lg whitespace-nowrap transition-all ${
                                        !filters.subcategory
                                            ? 'bg-white/[0.10] text-white'
                                            : 'bg-white/[0.03] text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    All {selectedCategoryName}
                                </button>
                                {subcategories.map((sub) => (
                                    <button
                                        key={sub._id}
                                        onClick={() => handleSubcategoryChange(sub._id)}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg whitespace-nowrap transition-all ${
                                            filters.subcategory === sub._id
                                                ? 'bg-white/[0.10] text-white'
                                                : 'bg-white/[0.03] text-white/30 hover:text-white/60'
                                        }`}
                                    >
                                        {sub.icon && <span>{sub.icon}</span>}
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}

                {/* ── Search + Filter ── */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search services..."
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

                    {/* Mobile filter button */}
                    <button
                        onClick={() => setShowFilterDrawer(true)}
                        className={`sm:hidden relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            hasActiveFilters
                                ? 'bg-white text-black'
                                : 'bg-white/[0.04] border border-white/[0.06] text-white/40'
                        }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {hasActiveFilters && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full text-black text-[9px] font-bold flex items-center justify-center border-2 border-black">
                                {[filters.category, filters.subcategory].filter(Boolean).length || ''}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Active filter pills ── */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedCategoryName && (
                            <FilterPill label={selectedCategoryName} onRemove={() => handleCategoryChange('')} />
                        )}
                        {selectedSubcategoryName && (
                            <FilterPill label={selectedSubcategoryName} onRemove={() => handleSubcategoryChange('')} />
                        )}
                        {filters.search && (
                            <FilterPill label={`"${filters.search}"`} onRemove={() => setSearchInput('')} />
                        )}
                        <button
                            onClick={handleClearAll}
                            className="text-[10px] text-white/30 hover:text-white transition-colors ml-auto"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── Grid ── */}
                <div ref={listTopRef}>
                    {loading ? (
                        <LoadingGrid />
                    ) : services.length === 0 ? (
                        <EmptyState onClear={handleClearAll} hasFilters={!!hasActiveFilters} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-20 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </div>

            {/* Mobile Filter Drawer */}
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
                    onSubcategoryChange={(id) => handleSubcategoryChange(id, true)}
                    onClear={handleClearAll}
                    onClose={() => setShowFilterDrawer(false)}
                />
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateServiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); fetchServices(true); toast.success('Service created'); }}
                />
            )}
            {showEditModal && selectedService && (
                <EditServiceModal
                    service={selectedService}
                    onClose={() => { setShowEditModal(false); setSelectedService(null); }}
                    onSuccess={() => { setShowEditModal(false); setSelectedService(null); fetchServices(true); toast.success('Service updated!'); }}
                />
            )}
            {showDetailModal && selectedService && (
                <ServiceDetailModal
                    service={selectedService}
                    onClose={() => { setShowDetailModal(false); setSelectedService(null); }}
                    onEdit={() => { setShowDetailModal(false); setShowEditModal(true); }}
                />
            )}
        </DashboardLayout>
    );
}

// ============================================
// FILTER DRAWER (Mobile)
// ============================================

function FilterDrawer({
    categories, subcategories, loadingSubcategories,
    activeCategory, activeSubcategory, selectedCategoryName,
    totalResults, isLoading,
    onCategoryChange, onSubcategoryChange, onClear, onClose,
}) {
    const activeCount = [activeCategory, activeSubcategory].filter(Boolean).length;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed bottom-0 inset-x-0 z-50 bg-neutral-950 rounded-t-2xl border border-white/[0.08] border-b-0 max-h-[75vh] flex flex-col">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-9 h-[3px] rounded-full bg-white/10" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">Filters</span>
                        {activeCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeCount > 0 && (
                            <button
                                onClick={onClear}
                                className="text-[10px] text-white/30 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                    {/* Category */}
                    <div>
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-2">Category</p>
                        <div className="flex flex-wrap gap-1.5">
                            <FilterChip label="All" isActive={!activeCategory} onClick={() => onCategoryChange('')} />
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
                    </div>

                    {/* Subcategory */}
                    {activeCategory && (
                        <div>
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-2">
                                {selectedCategoryName}
                            </p>
                            {loadingSubcategories ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                                    <span className="text-[10px] text-white/25">Loading...</span>
                                </div>
                            ) : subcategories.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    <FilterChip
                                        label={`All ${selectedCategoryName}`}
                                        isActive={!activeSubcategory}
                                        onClick={() => onSubcategoryChange('')}
                                        secondary
                                    />
                                    {subcategories.map((sub) => (
                                        <FilterChip
                                            key={sub._id}
                                            label={sub.name}
                                            icon={sub.icon}
                                            isActive={activeSubcategory === sub._id}
                                            onClick={() => onSubcategoryChange(sub._id)}
                                            secondary
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-white/20">No subcategories available</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer button */}
                <div className="shrink-0 px-4 py-3 pb-8 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-white text-black text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</>
                        ) : (
                            `Show ${totalResults} result${totalResults !== 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

function FilterChip({ label, icon, isActive, onClick, secondary = false }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all active:scale-95 ${
                secondary
                    ? isActive
                        ? 'bg-white/[0.10] text-white border border-white/[0.12]'
                        : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/60'
                    : isActive
                        ? 'bg-white text-black'
                        : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70'
            }`}
        >
            {isActive && <Check className="w-3 h-3" />}
            {icon && !isActive && <span className="text-[10px]">{icon}</span>}
            {label}
        </button>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] text-white/40">
            {label}
            <button onClick={onRemove} className="text-white/25 hover:text-white/60 transition-colors">
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

// ============================================
// SERVICE CARD
// ============================================

function ServiceCard({ service, onView, onEdit, onDelete, onToggleActive }) {
    const primaryImage   = service.images?.find((img) => img.isPrimary) || service.images?.[0];
    const categoryName   = service.category?.name || '';
    const subcategoryName = service.subcategory?.name || '';
    const isActive       = service.isActive !== undefined ? service.isActive : true;

    return (
        <div className={`bg-neutral-950 border border-white/[0.08] rounded-xl flex flex-col overflow-hidden transition-all hover:border-white/[0.12] ${
            !isActive ? 'opacity-50' : ''
        }`}>
            {/* Image */}
            <button
                onClick={() => onView(service)}
                className="relative h-32 bg-white/[0.03] w-full focus:outline-none"
            >
                {primaryImage ? (
                    <Image src={primaryImage.url} alt={service.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                            <Package className="w-4 h-4 text-white/20" />
                        </div>
                    </div>
                )}

                {/* Featured */}
                {service.isFeatured && (
                    <div className="absolute top-2 left-2">
                        <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            Featured
                        </span>
                    </div>
                )}

                {/* Status */}
                <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                        isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/[0.06] text-white/30 border border-white/[0.08]'
                    }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </button>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col gap-2">
                {/* Name + category */}
                <div>
                    <p className="text-[9px] text-white/25 truncate uppercase tracking-wide">
                        {categoryName}{subcategoryName && ` · ${subcategoryName}`}
                    </p>
                    <button
                        onClick={() => onView(service)}
                        className="text-[11px] font-semibold text-white/80 truncate block max-w-full text-left mt-0.5 hover:text-white transition-colors"
                    >
                        {service.name}
                    </button>
                </div>

                {/* Price + Duration + Rating */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 text-white">
                        <IndianRupee className="w-3 h-3" />
                        <span className="text-xs font-bold tabular-nums">
                            {service.price?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-white/25">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{service.duration} min</span>
                    </div>
                    {service.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-white/25">
                            <Star className="w-3 h-3" />
                            <span className="text-[10px]">{service.averageRating?.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06] mt-auto">
                    <button
                        onClick={() => onView(service)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Eye className="w-3 h-3" />
                        View
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleActive(service)}
                        title={isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 transition-all ${
                            isActive
                                ? 'hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20'
                                : 'hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                        }`}
                    >
                        {isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
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
                        <div className="h-2.5 w-1/3 bg-white/[0.06] rounded animate-pulse" />
                        <div className="h-3 w-2/3 bg-white/[0.06] rounded animate-pulse" />
                        <div className="h-2.5 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ onClear, hasFilters }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Package className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-[11px] text-white/40 mb-0.5">No services found</p>
            <p className="text-[10px] text-white/20 max-w-[180px]">
                {hasFilters ? 'Try adjusting your filters' : 'Add your first service to get started'}
            </p>
            {hasFilters && (
                <button
                    onClick={onClear}
                    className="mt-4 text-[10px] text-white/40 hover:text-white underline underline-offset-2 transition-colors"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

// ============================================
// PAGINATION
// ============================================

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = useMemo(() => {
        const count = Math.min(5, totalPages);
        let start =
            totalPages <= 5 ? 1 :
            currentPage <= 3 ? 1 :
            currentPage >= totalPages - 2 ? totalPages - 4 :
            currentPage - 2;
        return Array.from({ length: count }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-center gap-1 pt-5">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`w-8 h-8 rounded-lg text-[10px] font-medium transition-all ${
                        currentPage === page
                            ? 'bg-white text-black'
                            : 'text-white/30 hover:text-white hover:bg-white/[0.04]'
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
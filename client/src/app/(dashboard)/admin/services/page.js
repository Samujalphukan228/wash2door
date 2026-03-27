'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    Tag,
    Clock,
    Package,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

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

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ isActive: true, limit: 100 });
                if (response.success) {
                    const cats = response.data?.categories || response.data || [];
                    setCategories(Array.isArray(cats) ? cats : []);
                }
            } catch (error) {
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
            } catch (error) {
                console.error('Failed to load subcategories:', error);
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
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await serviceService.getAll(params);
            if (response.success) {
                setServices(response.data);
                setTotal(response.total);
                setPages(response.pages);
            }
        } catch (error) {
            toast.error('Failed to fetch services');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Stats
    const stats = useMemo(() => ({
        total: total,
        active: services.filter(s => s.isActive).length,
        inactive: services.filter(s => !s.isActive).length,
        featured: services.filter(s => s.isFeatured).length
    }), [services, total]);

    // Handlers
    const handleCategoryChange = (categoryId) => {
        setFilters(prev => ({ 
            ...prev, 
            category: categoryId, 
            subcategory: '', // Reset subcategory when category changes
            page: 1 
        }));
    };

    const handleSubcategoryChange = (subcategoryId) => {
        setFilters(prev => ({ 
            ...prev, 
            subcategory: subcategoryId, 
            page: 1 
        }));
    };

    const handleSearch = (search) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleRefresh = () => {
        fetchServices(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    const handleClearAll = () => {
        setFilters(prev => ({ 
            ...prev, 
            category: '', 
            subcategory: '', 
            search: '', 
            page: 1 
        }));
    };

    // Get selected category name
    const selectedCategoryName = filters.category 
        ? categories.find(c => c._id === filters.category)?.name 
        : null;

    // Get selected subcategory name
    const selectedSubcategoryName = filters.subcategory 
        ? subcategories.find(s => s._id === filters.subcategory)?.name 
        : null;

    if (loading && services.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading services...</p>
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
                                Services
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
                                onClick={handleRefresh}
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
                                New Service
                            </button>
                        </div>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6">
                        <StatCard icon={Package} value={stats.total} label="Total" />
                        <StatCard icon={CheckCircle2} value={stats.active} label="Active" />
                        <StatCard icon={XCircle} value={stats.inactive} label="Inactive" highlight={stats.inactive > 0} />
                        <StatCard icon={Star} value={stats.featured} label="Featured" />
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* FILTER BAR                                                      */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <div className="px-3 sm:px-4 md:px-6 space-y-3">
                        
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search services..."
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                            />
                            {filters.search && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* ─────────────────────────────────────────────────────────── */}
                        {/* CATEGORY BUTTONS - Row 1                                    */}
                        {/* ─────────────────────────────────────────────────────────── */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {/* All Button */}
                            <button
                                onClick={() => handleCategoryChange('')}
                                className={`
                                    shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all
                                    ${!filters.category
                                        ? 'bg-white text-black'
                                        : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                    }
                                `}
                            >
                                All Services
                            </button>

                            {/* Category Buttons */}
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryChange(cat._id)}
                                    className={`
                                        shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                                        ${filters.category === cat._id
                                            ? 'bg-white text-black'
                                            : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                        }
                                    `}
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* ─────────────────────────────────────────────────────────── */}
                        {/* SUBCATEGORY BUTTONS - Row 2 (Only shows when category selected) */}
                        {/* ─────────────────────────────────────────────────────────── */}
                        {filters.category && (
                            <div className="pl-4 border-l-2 border-white/[0.08]">
                                {loadingSubcategories ? (
                                    <div className="flex items-center gap-2 py-2">
                                        <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
                                        <span className="text-xs text-gray-500">Loading...</span>
                                    </div>
                                ) : subcategories.length > 0 ? (
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {/* All in this category */}
                                        <button
                                            onClick={() => handleSubcategoryChange('')}
                                            className={`
                                                shrink-0 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all
                                                ${!filters.subcategory
                                                    ? 'bg-white/90 text-black'
                                                    : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-white hover:bg-white/[0.06]'
                                                }
                                            `}
                                        >
                                            All {selectedCategoryName}
                                        </button>

                                        {/* Subcategory Buttons */}
                                        {subcategories.map((sub) => (
                                            <button
                                                key={sub._id}
                                                onClick={() => handleSubcategoryChange(sub._id)}
                                                className={`
                                                    shrink-0 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1
                                                    ${filters.subcategory === sub._id
                                                        ? 'bg-white/90 text-black'
                                                        : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-white hover:bg-white/[0.06]'
                                                    }
                                                `}
                                            >
                                                {sub.icon && <span>{sub.icon}</span>}
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-600 py-1.5">
                                        No subcategories in {selectedCategoryName}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Active Filter Info */}
                        {(filters.category || filters.subcategory || filters.search) && (
                            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                                <p className="text-xs text-gray-500">
                                    <span className="text-white font-medium">{total}</span>
                                    {' '}{total === 1 ? 'service' : 'services'}
                                    {selectedCategoryName && (
                                        <>
                                            {' '}in{' '}
                                            <span className="text-white">{selectedCategoryName}</span>
                                        </>
                                    )}
                                    {selectedSubcategoryName && (
                                        <>
                                            {' '}→{' '}
                                            <span className="text-white">{selectedSubcategoryName}</span>
                                        </>
                                    )}
                                    {filters.search && (
                                        <>
                                            {' '}matching{' '}
                                            <span className="text-white">"{filters.search}"</span>
                                        </>
                                    )}
                                </p>
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Services Grid */}
                    <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-6">
                        <ServicesGrid
                            services={services}
                            loading={loading}
                            total={total}
                            pages={pages}
                            currentPage={filters.page}
                            onPageChange={handlePageChange}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                        />
                    </div>

                </div>
            </div>

            {/* Mobile FAB Button */}
            <div className="sm:hidden fixed bottom-24 right-4 z-41">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform"
                    aria-label="Create new service"
                >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </div>

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

// === COMPONENTS ===

function StatCard({ icon: Icon, value, label, highlight }) {
    return (
        <div className={`
            bg-white/[0.02] border rounded-xl p-2.5 sm:p-3 transition-all text-center
            ${highlight ? 'border-yellow-500/30' : 'border-white/[0.08]'}
        `}>
            <Icon className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
            <p className="text-base sm:text-lg font-bold text-white">{value}</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
        </div>
    );
}

function ServicesGrid({ services, loading, total, pages, currentPage, onPageChange, onView, onEdit, onDelete, onToggleActive }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="h-40 sm:h-44 bg-white/[0.04] animate-pulse" />
                        <div className="p-3 sm:p-4 space-y-3">
                            <div className="h-4 w-3/4 bg-white/[0.06] animate-pulse rounded-lg" />
                            <div className="h-3 w-1/2 bg-white/[0.04] animate-pulse rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 mb-1">No services found</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 text-center">
                        Try a different category or create a new service
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {services.map((service) => (
                    <ServiceCard
                        key={service._id}
                        service={service}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <p className="text-[10px] sm:text-xs text-gray-500">
                        Page {currentPage} of {pages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                            let page;
                            if (pages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= pages - 2) {
                                page = pages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`
                                        w-8 h-8 text-xs font-medium rounded-lg transition-all
                                        ${currentPage === page
                                            ? 'bg-white text-black'
                                            : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ServiceCard({ service, onView, onEdit, onDelete, onToggleActive }) {
    const primaryImage = service.images?.find(img => img.isPrimary) || service.images?.[0];
    const categoryName = service.category?.name || 'Uncategorized';
    const categoryIcon = service.category?.icon || '';
    const subcategoryName = service.subcategory?.name || '';
    const subcategoryIcon = service.subcategory?.icon || '';

    return (
        <div className={`
            bg-white/[0.02] border rounded-xl sm:rounded-2xl overflow-hidden transition-all
            hover:bg-white/[0.04] hover:border-white/[0.12] group
            ${service.isActive ? 'border-white/[0.08]' : 'border-white/[0.05] opacity-60'}
        `}>
            {/* Image */}
            <div className="relative h-36 sm:h-44 bg-white/[0.02]">
                {primaryImage ? (
                    <Image
                        src={primaryImage.url}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-700" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Category & Subcategory */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="text-[9px] sm:text-[10px] border border-white/[0.12] bg-black/60 backdrop-blur-sm text-white/70 px-2 py-1 rounded-lg">
                        {categoryIcon} {categoryName}
                    </span>
                    {subcategoryName && (
                        <span className="text-[8px] sm:text-[9px] border border-white/[0.08] bg-black/50 backdrop-blur-sm text-white/50 px-1.5 py-0.5 rounded-md">
                            {subcategoryIcon} {subcategoryName}
                        </span>
                    )}
                </div>

                {/* Status */}
                <div className="absolute top-2 right-2">
                    <span className={`
                        text-[9px] sm:text-[10px] px-2 py-1 rounded-lg font-medium
                        ${service.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/[0.06] text-gray-500 border border-white/[0.08]'
                        }
                    `}>
                        {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Featured */}
                {service.isFeatured && (
                    <div className="absolute bottom-2 left-2">
                        <span className="text-[9px] sm:text-[10px] bg-white text-black px-2 py-1 rounded-lg font-medium">
                            ★ Featured
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
                <h3 className="text-sm font-medium text-white truncate mb-2">
                    {service.name}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-gray-600" />
                        <span className="text-[10px] sm:text-xs text-gray-500">
                            ₹{service.price?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-600" />
                        <span className="text-[10px] sm:text-xs text-gray-500">
                            {service.duration}min
                        </span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <Star className="w-3 h-3 text-gray-600" />
                        <span className="text-[10px] sm:text-xs text-gray-500">
                            {service.averageRating?.toFixed(1) || '0.0'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-3 border-t border-white/[0.06]">
                    <button
                        onClick={() => onView(service)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Eye className="w-3 h-3" />
                        View
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleActive(service)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        {service.isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                        {service.isActive ? 'Off' : 'On'}
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
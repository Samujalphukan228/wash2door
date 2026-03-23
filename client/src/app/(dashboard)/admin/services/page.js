'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import CreateServiceModal from '@/components/admin/services/CreateServiceModal';
import EditServiceModal from '@/components/admin/services/EditServiceModal';
import ServiceDetailModal from '@/components/admin/services/ServiceDetailModal';
import serviceService from '@/services/serviceService';
import categoryService from '@/services/categoryService';
import Image from 'next/image';
import {
    Plus,
    RefreshCw,
    Search,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
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
    SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        category: '',
        tier: '',
        isActive: '',
        search: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ isActive: true, limit: 100 });
                if (response.success) setCategories(response.data);
            } catch (error) {
                console.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

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
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
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

    const activeFiltersCount = [filters.category, filters.tier, filters.isActive, filters.search].filter(Boolean).length;

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
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 px-3 sm:px-4 md:px-6">
                        <StatCard
                            icon={Package}
                            label="Total"
                            value={stats.total}
                            sub="Services"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Active"
                            value={stats.active}
                            sub="Visible"
                        />
                        <StatCard
                            icon={XCircle}
                            label="Inactive"
                            value={stats.inactive}
                            sub="Hidden"
                            highlight={stats.inactive > 0}
                        />
                        <StatCard
                            icon={Star}
                            label="Featured"
                            value={stats.featured}
                            sub="Highlighted"
                        />
                    </div>

                    {/* Filters */}
                    <FilterBar
                        filters={filters}
                        categories={categories}
                        onFilterChange={handleFilterChange}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        activeCount={activeFiltersCount}
                    />

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

            {/* ✅ FIXED: Mobile FAB Button - Above mobile nav */}
            <div className="sm:hidden fixed bottom-24 right-4 z-41">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform hover:shadow-2xl hover:shadow-white/20"
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

function FilterBar({ filters, categories, onFilterChange, showFilters, setShowFilters, activeCount }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            onFilterChange({ search: searchInput });
        }
    };

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({
            search: '',
            category: '',
            tier: '',
            isActive: ''
        });
    };

    const tierOptions = [
        { value: '', label: 'All Tiers' },
        { value: 'basic', label: 'Basic' },
        { value: 'standard', label: 'Standard' },
        { value: 'premium', label: 'Premium' },
        { value: 'custom', label: 'Custom' }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];

    return (
        <div className="space-y-3 px-3 sm:px-4 md:px-6">
            {/* Search & Filter Row */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => onFilterChange({ search: searchInput })}
                        placeholder="Search services..."
                        className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                    />
                    {searchInput && (
                        <button
                            onClick={() => {
                                setSearchInput('');
                                onFilterChange({ search: '' });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category - Desktop */}
                <div className="hidden sm:block relative">
                    <select
                        value={filters.category}
                        onChange={(e) => onFilterChange({ category: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        <option value="" className="bg-black">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id} className="bg-black">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Tier - Desktop */}
                <div className="hidden sm:block relative">
                    <select
                        value={filters.tier}
                        onChange={(e) => onFilterChange({ tier: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        {tierOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-black">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Status - Desktop */}
                <div className="hidden lg:block relative">
                    <select
                        value={filters.isActive}
                        onChange={(e) => onFilterChange({ isActive: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-black">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Filter Toggle - Mobile */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`
                        sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                        ${showFilters
                            ? 'border-white/[0.15] bg-white/[0.06] text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-gray-400'
                        }
                    `}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-semibold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Clear - Desktop */}
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Mobile Filters */}
            {showFilters && (
                <div className="sm:hidden grid grid-cols-2 gap-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    <div className="relative">
                        <select
                            value={filters.category}
                            onChange={(e) => onFilterChange({ category: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            <option value="" className="bg-black">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id} className="bg-black">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={filters.tier}
                            onChange={(e) => onFilterChange({ tier: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            {tierOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-black">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="relative col-span-2">
                        <select
                            value={filters.isActive}
                            onChange={(e) => onFilterChange({ isActive: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-black">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Active Filter Pills */}
            {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {filters.category && (
                        <FilterPill
                            label={categories.find(c => c._id === filters.category)?.name || 'Category'}
                            onRemove={() => onFilterChange({ category: '' })}
                        />
                    )}
                    {filters.tier && (
                        <FilterPill
                            label={filters.tier}
                            onRemove={() => onFilterChange({ tier: '' })}
                        />
                    )}
                    {filters.isActive && (
                        <FilterPill
                            label={filters.isActive === 'true' ? 'Active' : 'Inactive'}
                            onRemove={() => onFilterChange({ isActive: '' })}
                        />
                    )}
                    {filters.search && (
                        <FilterPill
                            label={`"${filters.search}"`}
                            onRemove={() => {
                                setSearchInput('');
                                onFilterChange({ search: '' });
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] sm:text-xs text-gray-400">
            <span className="capitalize">{label}</span>
            <button
                onClick={onRemove}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
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
                        Create your first service to get started
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Grid */}
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
                        Page {currentPage} of {pages} · {total} services
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

    const tierStyles = {
        basic: 'border-white/[0.08] text-gray-500',
        standard: 'border-white/[0.12] text-gray-400',
        premium: 'border-white/25 text-white',
        custom: 'border-white/[0.15] text-gray-300'
    };

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

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                    <span className="text-[9px] sm:text-[10px] border border-white/[0.12] bg-black/60 backdrop-blur-sm text-white/70 px-2 py-1 rounded-lg">
                        {categoryIcon} {categoryName}
                    </span>
                </div>

                {/* Tier Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`text-[9px] sm:text-[10px] border px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm capitalize ${tierStyles[service.tier] || tierStyles.basic}`}>
                        {service.tier || 'basic'}
                    </span>
                </div>

                {/* Featured Badge */}
                {service.isFeatured && (
                    <div className="absolute bottom-2 left-2">
                        <span className="text-[9px] sm:text-[10px] bg-white text-black px-2 py-1 rounded-lg font-medium">
                            ★ Featured
                        </span>
                    </div>
                )}

                {/* Image Count */}
                {service.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2">
                        <span className="text-[9px] sm:text-[10px] bg-black/60 backdrop-blur-sm text-white/50 px-2 py-1 rounded-lg">
                            {service.images.length} photos
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
                <h3 className="text-sm font-medium text-white truncate mb-1">
                    {service.name}
                </h3>

                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed mb-3">
                    {service.tier.charAt(0).toUpperCase() + service.tier.slice(1)} Tier Service
                </p>

                {/* Stats Row */}
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
                            {service.duration} min
                        </span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <Star className="w-3 h-3 text-gray-600" />
                        <span className="text-[10px] sm:text-xs text-gray-500">
                            {service.averageRating?.toFixed(1) || '0.0'}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                    <span className={`
                        text-[9px] sm:text-[10px] px-2 py-1 rounded-lg font-medium
                        ${service.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/[0.06] text-gray-500 border border-white/[0.08]'
                        }
                    `}>
                        {service.isActive ? 'Active' : 'Inactive'}
                    </span>
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
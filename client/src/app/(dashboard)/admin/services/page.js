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
    Clock,
    Package,
    Loader2,
    MoreVertical,
    IndianRupee
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
        featured: services.filter(s => s.isFeatured).length
    }), [services, total]);

    // Handlers
    const handleCategoryChange = (categoryId) => {
        setFilters(prev => ({ 
            ...prev, 
            category: categoryId, 
            subcategory: '',
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

    const selectedCategoryName = filters.category 
        ? categories.find(c => c._id === filters.category)?.name 
        : null;

    const selectedSubcategoryName = filters.subcategory 
        ? subcategories.find(s => s._id === filters.subcategory)?.name 
        : null;

    const hasActiveFilters = filters.category || filters.subcategory || filters.search;

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
                
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* HEADER - Clean & Simple                                         */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-white/[0.06]">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                            <h1 className="text-base font-semibold text-white">Services</h1>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                {total} total · {stats.active} active
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 hover:text-white disabled:opacity-50 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            
                            {/* Desktop only - New Service button */}
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add New
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search services..."
                                className="w-full h-10 bg-white/[0.05] border-0 text-white text-sm placeholder-gray-500 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                            />
                            {filters.search && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* CATEGORY TABS                                                   */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="sticky top-[105px] z-20 bg-black border-b border-white/[0.04]">
                    <div className="px-4 py-2.5 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            <button
                                onClick={() => handleCategoryChange('')}
                                className={`
                                    h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all
                                    ${!filters.category
                                        ? 'bg-white text-black'
                                        : 'bg-white/[0.06] text-gray-400 active:bg-white/[0.1]'
                                    }
                                `}
                            >
                                All
                            </button>

                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryChange(cat._id)}
                                    className={`
                                        h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5
                                        ${filters.category === cat._id
                                            ? 'bg-white text-black'
                                            : 'bg-white/[0.06] text-gray-400 active:bg-white/[0.1]'
                                        }
                                    `}
                                >
                                    {cat.icon && <span className="text-sm">{cat.icon}</span>}
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subcategory Pills */}
                    {filters.category && (
                        <div className="px-4 pb-2.5 overflow-x-auto scrollbar-hide">
                            {loadingSubcategories ? (
                                <div className="flex items-center gap-2 h-7">
                                    <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
                                    <span className="text-[11px] text-gray-500">Loading...</span>
                                </div>
                            ) : subcategories.length > 0 ? (
                                <div className="flex gap-1.5 min-w-max">
                                    <button
                                        onClick={() => handleSubcategoryChange('')}
                                        className={`
                                            h-7 px-3 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all
                                            ${!filters.subcategory
                                                ? 'bg-white/20 text-white'
                                                : 'bg-white/[0.04] text-gray-500 active:bg-white/[0.08]'
                                            }
                                        `}
                                    >
                                        All {selectedCategoryName}
                                    </button>

                                    {subcategories.map((sub) => (
                                        <button
                                            key={sub._id}
                                            onClick={() => handleSubcategoryChange(sub._id)}
                                            className={`
                                                h-7 px-3 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1
                                                ${filters.subcategory === sub._id
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white/[0.04] text-gray-500 active:bg-white/[0.08]'
                                                }
                                            `}
                                        >
                                            {sub.icon && <span>{sub.icon}</span>}
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] text-gray-600 h-7 flex items-center">
                                    No subcategories
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* ACTIVE FILTERS BAR                                              */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {hasActiveFilters && (
                    <div className="px-4 py-2 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                <span className="text-white font-medium">{total}</span>
                                {' '}result{total !== 1 ? 's' : ''}
                                {selectedCategoryName && (
                                    <span className="text-gray-500"> in {selectedCategoryName}</span>
                                )}
                                {selectedSubcategoryName && (
                                    <span className="text-gray-500"> › {selectedSubcategoryName}</span>
                                )}
                            </p>
                            <button
                                onClick={handleClearAll}
                                className="text-[11px] text-gray-500 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SERVICES LIST                                                   */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="px-4 py-4 pb-28 sm:pb-6">
                    {loading ? (
                        <LoadingGrid />
                    ) : services.length === 0 ? (
                        <EmptyState />
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

                            {/* Pagination */}
                            {pages > 1 && (
                                <Pagination
                                    currentPage={filters.page}
                                    totalPages={pages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MOBILE FAB                                                      */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <button
                onClick={() => setShowCreateModal(true)}
                className="sm:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-white text-black rounded-2xl shadow-xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Add new service"
            >
                <Plus className="w-6 h-6" strokeWidth={2} />
            </button>

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
// COMPONENTS
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

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400 mb-1">No services found</p>
            <p className="text-xs text-gray-600 text-center max-w-[200px]">
                Try a different category or add a new service
            </p>
        </div>
    );
}

function ServiceCard({ service, onView, onEdit, onDelete, onToggleActive }) {
    const [showActions, setShowActions] = useState(false);
    const primaryImage = service.images?.find(img => img.isPrimary) || service.images?.[0];
    const categoryName = service.category?.name || '';
    const subcategoryName = service.subcategory?.name || '';

    return (
        <div 
            className={`
                relative bg-white/[0.03] rounded-2xl overflow-hidden transition-all
                ${!service.isActive && 'opacity-50'}
            `}
        >
            <div className="flex gap-3 p-3">
                {/* Image */}
                <div 
                    className="relative w-20 h-20 bg-white/[0.05] rounded-xl overflow-hidden shrink-0 cursor-pointer"
                    onClick={() => onView(service)}
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
                    
                    {/* Featured badge */}
                    {service.isFeatured && (
                        <div className="absolute top-1 left-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 
                                className="text-sm font-medium text-white truncate cursor-pointer"
                                onClick={() => onView(service)}
                            >
                                {service.name}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {categoryName}{subcategoryName && ` · ${subcategoryName}`}
                            </p>
                        </div>
                        
                        {/* More button */}
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/[0.05] transition-colors shrink-0"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Price & Duration */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-white">
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

                    {/* Status */}
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

            {/* Actions Panel */}
            {showActions && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowActions(false)} 
                    />
                    <div className="absolute right-3 top-12 z-20 bg-[#1a1a1a] rounded-xl border border-white/[0.08] shadow-xl overflow-hidden min-w-[140px]">
                        <button
                            onClick={() => { onView(service); setShowActions(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:bg-white/[0.05] transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                        <button
                            onClick={() => { onEdit(service); setShowActions(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:bg-white/[0.05] transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Service
                        </button>
                        <button
                            onClick={() => { onToggleActive(service); setShowActions(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-300 hover:bg-white/[0.05] transition-colors"
                        >
                            {service.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                            {service.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="h-px bg-white/[0.06] mx-2" />
                        <button
                            onClick={() => { onDelete(service._id); setShowActions(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="flex items-center justify-center gap-1 pt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                        page = i + 1;
                    } else if (currentPage <= 3) {
                        page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                    } else {
                        page = currentPage - 2 + i;
                    }
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
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
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ServicesGrid from '@/components/admin/services/ServicesGrid';
import ServicesFilter from '@/components/admin/services/ServicesFilter';
import CreateServiceModal from '@/components/admin/services/CreateServiceModal';
import EditServiceModal from '@/components/admin/services/EditServiceModal';
import ServiceDetailModal from '@/components/admin/services/ServiceDetailModal';
import adminService from '@/services/adminService';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        category: '',
        isActive: ''
    });

    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await adminService.getAllServices(params);
            if (response.success) {
                setServices(response.data);
                setTotal(response.total);
                setPages(response.pages);
            }
        } catch (error) {
            toast.error('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
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
            const axiosInstance = (await import('@/lib/axios')).default;
            await axiosInstance.delete(`/services/${serviceId}`);
            toast.success('Service deleted');
            fetchServices();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to delete service'
            );
        }
    };

    const handleToggleActive = async (service) => {
        try {
            const axiosInstance = (await import('@/lib/axios')).default;
            await axiosInstance.put(`/services/${service._id}`, {
                isActive: !service.isActive
            });
            toast.success(
                `Service ${!service.isActive ? 'activated' : 'deactivated'}`
            );
            fetchServices();
        } catch (error) {
            toast.error('Failed to update service');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Management
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white">
                            Services
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black text-xs tracking-[0.15em] uppercase px-4 py-2.5 transition-colors self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Service
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total', value: total },
                        {
                            label: 'Active',
                            value: services.filter(s => s.isActive).length
                        },
                        {
                            label: 'Inactive',
                            value: services.filter(s => !s.isActive).length
                        },
                        {
                            label: 'Categories',
                            value: [...new Set(services.map(s => s.category))].length
                        }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-neutral-950 border border-neutral-800 p-4"
                        >
                            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-light text-white">
                                {loading ? (
                                    <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                                ) : (
                                    stat.value
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <ServicesFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* Grid */}
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

            {/* Modals */}
            {showCreateModal && (
                <CreateServiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchServices();
                        toast.success('Service created!');
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
                        fetchServices();
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
                    onRefresh={fetchServices}
                />
            )}
        </DashboardLayout>
    );
}
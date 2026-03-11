'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import BookingsTable from '@/components/admin/bookings/BookingsTable';
import BookingsFilter from '@/components/admin/bookings/BookingsFilter';
import BookingDetailModal from '@/components/admin/bookings/BookingDetailModal';
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal';
import UpdateStatusModal from '@/components/admin/bookings/UpdateStatusModal';
import adminService from '@/services/adminService';
import { Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        bookingType: '',
        serviceCategory: '',
        date: '',
        city: '',
        search: ''
    });

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // ── Fetch Bookings ──
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await adminService.getAllBookings(params);
            if (response.success) {
                setBookings(response.data);
                setTotal(response.total);
                setPages(response.pages || 1);
            }
        } catch (error) {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // ── Handlers ──
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleView = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = (booking) => {
        setSelectedBooking(booking);
        setShowStatusModal(true);
    };

    // ── Stats ──
    const stats = {
        total,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        inProgress: bookings.filter(b => b.status === 'in-progress').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        revenue: bookings
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, b) => sum + (b.price || 0), 0)
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Management
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white">
                            Bookings
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black text-xs tracking-[0.15em] uppercase px-4 py-2.5 transition-colors self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Booking
                    </button>
                </div>

                {/* ── Stats Bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    {[
                        { label: 'Total',       value: stats.total },
                        { label: 'Pending',     value: stats.pending },
                        { label: 'Confirmed',   value: stats.confirmed },
                        { label: 'In Progress', value: stats.inProgress },
                        { label: 'Completed',   value: stats.completed },
                        { label: 'Cancelled',   value: stats.cancelled },
                        {
                            label: 'Revenue',
                            value: `₹${stats.revenue.toLocaleString('en-IN')}`
                        }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-neutral-950 border border-neutral-800 p-4"
                        >
                            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                                {stat.label}
                            </p>
                            <p className="text-xl font-light text-white">
                                {loading ? (
                                    <span className="inline-block h-6 w-8 bg-neutral-800 animate-pulse rounded" />
                                ) : (
                                    stat.value
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <BookingsFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* ── Table ── */}
                <BookingsTable
                    bookings={bookings}
                    loading={loading}
                    total={total}
                    pages={pages}
                    currentPage={filters.page}
                    onPageChange={handlePageChange}
                    onView={handleView}
                    onUpdateStatus={handleUpdateStatus}
                />
            </div>

            {/* ── Modals ── */}
            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchBookings();
                        toast.success('Booking created!');
                    }}
                />
            )}

            {showDetailModal && selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedBooking(null);
                    }}
                    onUpdateStatus={() => {
                        setShowDetailModal(false);
                        setShowStatusModal(true);
                    }}
                />
            )}

            {showStatusModal && selectedBooking && (
                <UpdateStatusModal
                    booking={selectedBooking}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedBooking(null);
                    }}
                    onSuccess={() => {
                        setShowStatusModal(false);
                        setSelectedBooking(null);
                        fetchBookings();
                    }}
                />
            )}
        </DashboardLayout>
    );
}
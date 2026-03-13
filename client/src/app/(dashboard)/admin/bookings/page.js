'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import BookingsTable from '@/components/admin/bookings/BookingsTable';
import BookingCards from '@/components/admin/bookings/BookingCards';
import BookingsFilter from '@/components/admin/bookings/BookingsFilter';
import BookingDetailModal from '@/components/admin/bookings/BookingDetailModal';
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal';
import UpdateStatusModal from '@/components/admin/bookings/UpdateStatusModal';
import StatsBar from '@/components/admin/bookings/StatsBar';
import adminService from '@/services/adminService';
import { useBookingSocket } from '@/hooks/useSocketEvents';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        todayBookings: 0,
    });

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        bookingType: '',
        categoryName: '',
        date: '',
        city: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Fetch bookings
    const fetchBookings = useCallback(
        async (isRefresh = false) => {
            try {
                isRefresh ? setRefreshing(true) : setLoading(true);

                const params = {};
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== '' && value !== null && value !== undefined) {
                        params[key] = value;
                    }
                });

                const response = await adminService.getAllBookings(params);

                if (response.success) {
                    setBookings(response.data || []);
                    setTotal(response.total || 0);
                    setPages(response.pages || 1);
                }
            } catch (error) {
                console.error('Fetch bookings error:', error);
                toast.error('Failed to fetch bookings');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [filters]
    );

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await adminService.getDashboardStats();

            if (response.success) {
                const { bookings: bookingStats, revenue } = response.data;
                setStats({
                    total: bookingStats?.total || 0,
                    pending: bookingStats?.byStatus?.pending || 0,
                    confirmed: bookingStats?.byStatus?.confirmed || 0,
                    inProgress: bookingStats?.byStatus?.inProgress || 0,
                    completed: bookingStats?.byStatus?.completed || 0,
                    cancelled: bookingStats?.byStatus?.cancelled || 0,
                    revenue: revenue?.total || 0,
                    todayBookings: bookingStats?.today || 0,
                });
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    }, []);

    // Combined refresh function
    const refreshAll = useCallback(() => {
        fetchBookings(true);
        fetchStats();
    }, [fetchBookings, fetchStats]);

    // Initial fetch
    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [fetchBookings, fetchStats]);

    // Socket handlers
    const handleNewBooking = useCallback(
        (data) => {
            if (filters.page === 1) {
                setBookings((prev) => {
                    const exists = prev.find((b) => b._id === data.bookingId);
                    if (exists) return prev;
                    const updated = [data, ...prev];
                    if (updated.length > filters.limit) updated.pop();
                    return updated;
                });
                setTotal((prev) => prev + 1);
            }
            setStats((prev) => ({
                ...prev,
                total: prev.total + 1,
                pending: prev.pending + 1,
                todayBookings: prev.todayBookings + 1,
            }));
        },
        [filters.page, filters.limit]
    );

    const handleStatusUpdate = useCallback(
        (data) => {
            console.log('Status update received:', data);
            
            // Update the booking in the list immediately
            setBookings((prev) =>
                prev.map((b) =>
                    b._id === data.bookingId
                        ? { ...b, status: data.status }
                        : b
                )
            );

            // Refresh stats
            fetchStats();
        },
        [fetchStats]
    );

    const handleBookingCancelled = useCallback((data) => {
        console.log('Booking cancelled:', data);
        
        setBookings((prev) =>
            prev.map((b) =>
                b._id === data.bookingId ? { ...b, status: 'cancelled' } : b
            )
        );
        setStats((prev) => ({
            ...prev,
            cancelled: prev.cancelled + 1,
            pending: Math.max(0, prev.pending - 1),
        }));
    }, []);

    // Subscribe to socket events
    useBookingSocket({
        onNewBooking: handleNewBooking,
        onStatusUpdate: handleStatusUpdate,
        onCancelled: handleBookingCancelled,
    });

    // Handlers
    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: newFilters.page !== undefined ? newFilters.page : 1,
        }));
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleView = async (booking) => {
        try {
            const response = await adminService.getBookingById(booking._id);
            if (response.success) {
                setSelectedBooking(response.data.booking);
                setCustomerHistory(response.data.customerHistory || []);
            } else {
                setSelectedBooking(booking);
                setCustomerHistory([]);
            }
        } catch {
            setSelectedBooking(booking);
            setCustomerHistory([]);
        }
        setShowDetailModal(true);
    };

    const handleUpdateStatus = (booking) => {
        setSelectedBooking(booking);
        setShowStatusModal(true);
    };

    const handleRefresh = () => {
        refreshAll();
        toast.success('Refreshed', { duration: 1200 });
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        // Refresh data after modal closes
        setTimeout(() => {
            refreshAll();
            toast.success('Booking created');
        }, 100);
    };

    const handleStatusSuccess = () => {
        setShowStatusModal(false);
        setSelectedBooking(null);
        // Modal already triggered refresh, just show success
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedBooking(null);
        setCustomerHistory([]);
    };

    const handleCloseStatusModal = () => {
        setShowStatusModal(false);
        setSelectedBooking(null);
    };

    const handleDetailToStatus = () => {
        setShowDetailModal(false);
        setShowStatusModal(true);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-28 sm:pb-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                                Bookings
                            </h1>
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
                                    <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />
                                    <span className="text-xs text-zinc-500">Syncing</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-zinc-500">
                            {loading ? (
                                <span className="inline-block w-32 h-3 rounded bg-zinc-800 animate-pulse" />
                            ) : (
                                <>
                                    <span className="text-white font-medium">{total}</span> total bookings
                                </>
                            )}
                        </p>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Booking
                        </button>
                    </div>

                    {/* Mobile Refresh */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="sm:hidden p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="h-px bg-zinc-800" />

                <StatsBar stats={stats} loading={loading} />

                <BookingsFilter filters={filters} onFilterChange={handleFilterChange} />

                {/* Mobile Cards */}
                <div className="sm:hidden">
                    <BookingCards
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

                {/* Desktop Table */}
                <div className="hidden sm:block">
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
            </div>

            {/* Mobile FAB */}
            <div className="sm:hidden fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showDetailModal && selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    customerHistory={customerHistory}
                    onClose={handleCloseDetailModal}
                    onUpdateStatus={handleDetailToStatus}
                    onStatusChange={refreshAll}
                />
            )}

            {showStatusModal && selectedBooking && (
                <UpdateStatusModal
                    booking={selectedBooking}
                    onClose={handleCloseStatusModal}
                    onSuccess={handleStatusSuccess}
                />
            )}
        </DashboardLayout>
    );
}
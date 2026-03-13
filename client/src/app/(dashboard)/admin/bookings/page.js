// src/app/admin/bookings/page.jsx

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
    // ============================================
    // STATE
    // ============================================
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    // Stats from API (accurate counts)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        todayBookings: 0
    });

    // Filters
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
        sortOrder: 'desc'
    });

    // Modals
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // ============================================
    // FETCH BOOKINGS
    // ============================================
    const fetchBookings = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);

            // Clean up filters - remove empty values
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
    }, [filters]);

    // ============================================
    // FETCH STATS
    // ============================================
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
                    todayBookings: bookingStats?.today || 0
                });
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    }, []);

    // ============================================
    // REFRESH ALL DATA
    // ============================================
    const refreshAll = useCallback(() => {
        fetchBookings();
        fetchStats();
    }, [fetchBookings, fetchStats]);

    // ============================================
    // INITIAL FETCH
    // ============================================
    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [fetchBookings, fetchStats]);

    // ============================================
    // REAL-TIME SOCKET UPDATES
    // ============================================
    const handleNewBooking = useCallback((data) => {
        // Add new booking to the top of list if on first page
        if (filters.page === 1) {
            setBookings(prev => {
                // Check if booking already exists
                const exists = prev.find(b => b._id === data.bookingId);
                if (exists) return prev;

                // Add to top, remove last if at limit
                const updated = [data, ...prev];
                if (updated.length > filters.limit) {
                    updated.pop();
                }
                return updated;
            });

            setTotal(prev => prev + 1);
        }

        // Update stats
        setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            pending: prev.pending + 1,
            todayBookings: prev.todayBookings + 1
        }));
    }, [filters.page, filters.limit]);

    const handleStatusUpdate = useCallback((data) => {
        // Update booking in list
        setBookings(prev =>
            prev.map(booking =>
                booking._id === data.bookingId
                    ? { ...booking, status: data.status }
                    : booking
            )
        );

        // Refresh stats to get accurate counts
        fetchStats();
    }, [fetchStats]);

    const handleBookingCancelled = useCallback((data) => {
        // Update booking in list
        setBookings(prev =>
            prev.map(booking =>
                booking._id === data.bookingId
                    ? { ...booking, status: 'cancelled' }
                    : booking
            )
        );

        // Update stats
        setStats(prev => ({
            ...prev,
            cancelled: prev.cancelled + 1,
            pending: Math.max(0, prev.pending - 1)
        }));
    }, []);

    // Subscribe to socket events
    useBookingSocket({
        onNewBooking: handleNewBooking,
        onStatusUpdate: handleStatusUpdate,
        onCancelled: handleBookingCancelled
    });

    // ============================================
    // HANDLERS
    // ============================================
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page !== undefined ? newFilters.page : 1
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // View booking with full details and customer history
    const handleView = async (booking) => {
        try {
            // Fetch full booking details with customer history
            const response = await adminService.getBookingById(booking._id);

            if (response.success) {
                setSelectedBooking(response.data.booking);
                setCustomerHistory(response.data.customerHistory || []);
                setShowDetailModal(true);
            } else {
                // Fallback to existing data
                setSelectedBooking(booking);
                setCustomerHistory([]);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            // Fallback to existing data
            setSelectedBooking(booking);
            setCustomerHistory([]);
            setShowDetailModal(true);
        }
    };

    const handleUpdateStatus = (booking) => {
        setSelectedBooking(booking);
        setShowStatusModal(true);
    };

    const handleRefresh = () => {
        fetchBookings(true);
        fetchStats();
        toast.success('Refreshed', { duration: 1200 });
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        refreshAll();
        toast.success('Booking created successfully');
    };

    const handleStatusSuccess = () => {
        setShowStatusModal(false);
        setSelectedBooking(null);
        refreshAll();
        toast.success('Status updated successfully');
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

    const handleStatusChangeFromDetail = () => {
        refreshAll();
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">
                <div className="max-w-7xl mx-auto px-1 sm:px-1 py-1 sm:py-1 space-y-6 pb-1 sm:pb-1">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            {/* Live indicator */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">
                                        Live
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                                    Bookings
                                </h1>
                                {refreshing && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                                        <RefreshCw className="w-3 h-3 text-white/40 animate-spin" />
                                        <span className="text-[10px] text-white/30">Syncing</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-white/35">
                                {loading ? (
                                    <span className="inline-block w-32 h-3 rounded bg-white/[0.06] animate-pulse" />
                                ) : (
                                    <>
                                        <span className="text-white/60 font-medium">{total}</span>
                                        {' '}total bookings across all locations
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="
                                    relative group flex items-center gap-2 px-3.5 py-2 rounded-lg
                                    border border-white/[0.08] bg-white/[0.03]
                                    text-xs text-white/50 hover:text-white/80
                                    hover:bg-white/[0.06] hover:border-white/[0.12]
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-all duration-150
                                "
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                <span className="tracking-wide">Refresh</span>
                            </button>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="
                                    relative group flex items-center gap-2 px-4 py-2 rounded-lg
                                    bg-white text-black text-xs font-medium
                                    hover:bg-white/90 active:bg-white/80
                                    shadow-lg shadow-white/10
                                    transition-all duration-150
                                    overflow-hidden
                                "
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <Plus className="w-3.5 h-3.5 relative" />
                                <span className="relative tracking-wide">New Booking</span>
                            </button>
                        </div>

                        {/* Mobile Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="
                                sm:hidden w-9 h-9 rounded-lg flex items-center justify-center
                                border border-white/[0.08] bg-white/[0.03]
                                text-white/40 active:text-white/80
                                active:bg-white/[0.06] active:scale-95
                                disabled:opacity-40 transition-all duration-150
                            "
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* ── Divider ── */}
                    <div className="h-px bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent" />

                    {/* ── Stats ── */}
                    <StatsBar stats={stats} loading={loading} />

                    {/* ── Filters ── */}
                    <BookingsFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    {/* ── Content - Mobile Cards ── */}
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
                            onRefresh={refreshAll}
                        />
                    </div>

                    {/* ── Content - Desktop Table ── */}
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
                            onRefresh={refreshAll}
                        />
                    </div>

                </div>
            </div>

            {/* ── Mobile FAB ── */}
            <div className="sm:hidden fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="
                        relative group
                        w-[52px] h-[52px]
                        bg-white text-black rounded-xl
                        shadow-2xl shadow-black/60
                        flex items-center justify-center
                        active:scale-90 transition-all duration-150
                        overflow-hidden
                    "
                >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white via-white to-neutral-200" />
                    <Plus className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                </button>
            </div>

            {/* ── Create Booking Modal ── */}
            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* ── Booking Detail Modal ── */}
            {showDetailModal && selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    customerHistory={customerHistory}
                    onClose={handleCloseDetailModal}
                    onUpdateStatus={handleDetailToStatus}
                    onStatusChange={handleStatusChangeFromDetail}
                />
            )}

            {/* ── Update Status Modal ── */}
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
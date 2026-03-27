'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import adminService from '@/services/adminService';
import { useSocket } from '@/context/SocketContext'; // ✅ Use SocketContext
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Plus,
    RefreshCw,
    Search,
    Filter,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Eye,
    Clock,
    MapPin,
    CalendarDays,
    IndianRupee,
    Users,
    CheckCircle2,
    AlertCircle,
    Timer,
    XCircle,
    Zap,
    ArrowUpRight,
    Loader2,
    SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import modals
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal';
import BookingDetailModal from '@/components/admin/bookings/BookingDetailModal';
import UpdateStatusModal from '@/components/admin/bookings/UpdateStatusModal';

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
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const [showFilters, setShowFilters] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // ✅ Use SocketContext instead of useBookingSocket
    const { onBookingEvent } = useSocket();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Fetch bookings
    const fetchBookings = useCallback(async (isRefresh = false) => {
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
    }, [filters]);

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

    const refreshAll = useCallback(() => {
        fetchBookings(true);
        fetchStats();
    }, [fetchBookings, fetchStats]);

    // Initial fetch
    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [fetchBookings, fetchStats]);

    // ============================================
    // 🔥 FIXED: Real-time booking updates using SocketContext
    // ============================================
    useEffect(() => {
        const unsubscribe = onBookingEvent((event) => {
            console.log('📋 Booking event received:', event.type, event.data);

            if (event.type === 'new') {
                // New booking created
                if (filters.page === 1) {
                    setBookings((prev) => {
                        const exists = prev.find((b) => b._id === event.data.bookingId);
                        if (exists) return prev;
                        
                        // Create booking object from socket data
                        const newBooking = {
                            _id: event.data.bookingId,
                            bookingCode: event.data.bookingCode,
                            serviceName: event.data.serviceName,
                            status: event.data.status || 'pending',
                            price: event.data.price,
                            bookingDate: event.data.bookingDate,
                            timeSlot: event.data.timeSlot,
                            createdAt: event.data.createdAt,
                            // For display purposes
                            walkInCustomer: { name: event.data.customerName }
                        };
                        
                        const updated = [newBooking, ...prev];
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
            } else if (event.type === 'statusUpdated') {
                // Status updated
                setBookings((prev) =>
                    prev.map((b) =>
                        b._id === event.data.bookingId 
                            ? { ...b, status: event.data.status } 
                            : b
                    )
                );
                // Refetch stats for accurate counts
                fetchStats();
            } else if (event.type === 'cancelled') {
                // Booking cancelled
                setBookings((prev) =>
                    prev.map((b) =>
                        b._id === event.data.bookingId 
                            ? { ...b, status: 'cancelled' } 
                            : b
                    )
                );
                setStats((prev) => ({
                    ...prev,
                    cancelled: prev.cancelled + 1,
                    pending: Math.max(0, prev.pending - 1),
                }));
            }
        });

        return unsubscribe;
    }, [onBookingEvent, filters.page, filters.limit, fetchStats]);

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
        // Socket will handle the update, but we can also refresh for full data
        setTimeout(() => {
            refreshAll();
            toast.success('Booking created');
        }, 100);
    };

    const handleStatusSuccess = () => {
        setShowStatusModal(false);
        setSelectedBooking(null);
        refreshAll();
    };

    const activeFiltersCount = [filters.status, filters.bookingType, filters.search].filter(Boolean).length;

    if (loading && bookings.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading bookings...</p>
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
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                                Manage
                            </p>
                            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                                Bookings
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
                                New Booking
                            </button>
                        </div>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                        <StatCard
                            icon={CalendarDays}
                            label="Total"
                            value={stats.total}
                            sub={`${stats.todayBookings} today`}
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="Pending"
                            value={stats.pending}
                            sub="Awaiting action"
                            highlight={stats.pending > 0}
                        />
                        <StatCard
                            icon={Timer}
                            label="In Progress"
                            value={stats.inProgress}
                            sub={`${stats.confirmed} confirmed`}
                        />
                        <StatCard
                            icon={IndianRupee}
                            label="Revenue"
                            value={`₹${stats.revenue.toLocaleString('en-IN')}`}
                            sub={`${stats.completed} completed`}
                        />
                    </div>

                    {/* Filters */}
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        activeCount={activeFiltersCount}
                    />

                    {/* Bookings List */}
                    <BookingsList
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

            {/* Mobile FAB Button */}
            <div className="lg:hidden fixed bottom-24 right-4 z-41">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform hover:shadow-2xl hover:shadow-white/20"
                    aria-label="Create new booking"
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
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedBooking(null);
                        setCustomerHistory([]);
                    }}
                    onUpdateStatus={() => {
                        setShowDetailModal(false);
                        setShowStatusModal(true);
                    }}
                    onStatusChange={refreshAll}
                />
            )}

            {showStatusModal && selectedBooking && (
                <UpdateStatusModal
                    booking={selectedBooking}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedBooking(null);
                    }}
                    onSuccess={handleStatusSuccess}
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

function FilterBar({ filters, onFilterChange, showFilters, setShowFilters, activeCount }) {
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
            status: '',
            bookingType: '',
        });
    };

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'online', label: 'Online' },
        { value: 'walkin', label: 'Walk-in' },
    ];

    return (
        <div className="space-y-3">
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
                        placeholder="Search bookings..."
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

                {/* Status - Desktop */}
                <div className="hidden sm:block relative">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
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

                {/* Type - Desktop */}
                <div className="hidden sm:block relative">
                    <select
                        value={filters.bookingType}
                        onChange={(e) => onFilterChange({ bookingType: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        {typeOptions.map((opt) => (
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
                            value={filters.status}
                            onChange={(e) => onFilterChange({ status: e.target.value })}
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
                    <div className="relative">
                        <select
                            value={filters.bookingType}
                            onChange={(e) => onFilterChange({ bookingType: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            {typeOptions.map((opt) => (
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
                    {filters.status && (
                        <FilterPill
                            label={filters.status}
                            onRemove={() => onFilterChange({ status: '' })}
                        />
                    )}
                    {filters.bookingType && (
                        <FilterPill
                            label={filters.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                            onRemove={() => onFilterChange({ bookingType: '' })}
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

function BookingsList({ bookings, loading, total, pages, currentPage, onPageChange, onView, onUpdateStatus }) {
    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl">
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-[10px] sm:text-xs text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                        <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 mb-1">No bookings found</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 text-center">
                        Try adjusting your filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">All Bookings</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                            {total} total
                        </p>
                    </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-mono">
                    Page {currentPage} of {pages}
                </p>
            </div>

            {/* Bookings */}
            <div className="divide-y divide-white/[0.04]">
                {bookings.map((booking, index) => (
                    <BookingRow
                        key={booking._id || `booking-${index}`}
                        booking={booking}
                        isFirst={index === 0}
                        onView={onView}
                        onUpdateStatus={onUpdateStatus}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between p-3 sm:p-4 border-t border-white/[0.06]">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
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
                                        w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-medium rounded-lg transition-all
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
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pages}
                        className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function BookingRow({ booking, isFirst, onView, onUpdateStatus }) {
    const statusMap = {
        pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500', label: 'Pending' },
        confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500', label: 'Confirmed' },
        'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-500', dot: 'bg-purple-500', label: 'Progress' },
        inProgress: { bg: 'bg-purple-500/10', text: 'text-purple-500', dot: 'bg-purple-500', label: 'Progress' },
        completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', label: 'Done' },
        cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500', label: 'Cancelled' }
    };

    const status = statusMap[booking.status] || statusMap.pending;
    const name = booking.customerId
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in';

    const bookingDate = booking.bookingDate ? new Date(booking.bookingDate) : null;
    const isToday = bookingDate && new Date().toDateString() === bookingDate.toDateString();
    const isActionable = !['completed', 'cancelled'].includes(booking.status);

    return (
        <div
            className={`
                p-3 sm:p-4 transition-colors cursor-pointer
                hover:bg-white/[0.02] active:bg-white/[0.04]
                ${isFirst ? 'bg-white/[0.01]' : ''}
            `}
            onClick={() => onView(booking)}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <span className="text-sm sm:text-base font-semibold text-white/60">
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${status.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white truncate">{name}</p>
                                {isFirst && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.08] text-gray-400 font-medium shrink-0">
                                        LATEST
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-600 truncate mt-0.5">
                                {booking.serviceName}
                            </p>
                        </div>

                        {/* Price & Status */}
                        <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-white tabular-nums">
                                ₹{(booking.price || 0).toLocaleString('en-IN')}
                            </p>
                            <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded ${status.bg} ${status.text} mt-0.5`}>
                                {status.label}
                            </span>
                        </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="font-mono text-[10px] text-gray-600">
                            {booking.bookingCode}
                        </span>
                        <span className="text-[8px] text-gray-700">•</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-600">
                            <Clock className="w-3 h-3" />
                            {isToday ? 'Today' : bookingDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {booking.timeSlot && ` · ${booking.timeSlot}`}
                        </span>
                        {booking.location?.city && (
                            <>
                                <span className="text-[8px] text-gray-700">•</span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    {booking.location.city}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    {isActionable && (
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(booking);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                            >
                                <Eye className="w-3 h-3" />
                                View
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateStatus(booking);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Update
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import adminService from '@/services/adminService';
import { useSocket } from '@/context/SocketContext';
import {
    Plus, RefreshCw, Search, X,
    ChevronRight, ChevronLeft, ChevronDown,
    Eye, Clock, MapPin, CalendarDays, IndianRupee,
    CheckCircle2, AlertCircle, SlidersHorizontal, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal';
import BookingDetailModal from '@/components/admin/bookings/BookingDetailModal';
import UpdateStatusModal from '@/components/admin/bookings/UpdateStatusModal';

// ============================================
// CONSTANTS
// ============================================

const STATUS_MAP = {
    pending:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400',   label: 'Pending' },
    confirmed: { bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400',    label: 'Confirmed' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Done' },
    cancelled: { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400',     label: 'Cancelled' },
};

const STATUS_OPTIONS = [
    { value: '',          label: 'All Status' },
    { value: 'pending',   label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
    { value: '',       label: 'All Types' },
    { value: 'online', label: 'Online' },
    { value: 'walkin', label: 'Walk-in' },
];

// ============================================
// MAIN PAGE
// ============================================

export default function BookingsPage() {
    const [bookings, setBookings]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [refreshing, setRefreshing]       = useState(false);
    const [total, setTotal]                 = useState(0);
    const [pages, setPages]                 = useState(1);
    const [showFilters, setShowFilters]     = useState(false);
    const [selectedBooking, setSelectedBooking]   = useState(null);
    const [customerHistory, setCustomerHistory]   = useState([]);
    const [showCreateModal, setShowCreateModal]   = useState(false);
    const [showDetailModal, setShowDetailModal]   = useState(false);
    const [showStatusModal, setShowStatusModal]   = useState(false);

    const [stats, setStats] = useState({
        total: 0, pending: 0, confirmed: 0,
        completed: 0, cancelled: 0, revenue: 0, todayBookings: 0,
    });

    const [filters, setFilters] = useState({
        page: 1, limit: 10, status: '',
        bookingType: '', search: '',
        sortBy: 'createdAt', sortOrder: 'desc',
    });

    const { onBookingEvent } = useSocket();

    // ── Fetch ──
    const fetchBookings = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v != null)
            );
            const res = await adminService.getAllBookings(params);
            if (res.success) {
                setBookings(res.data || []);
                setTotal(res.total || 0);
                setPages(res.pages || 1);
            }
        } catch {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminService.getDashboardStats();
            if (res.success) {
                const { bookings: b, revenue } = res.data;
                setStats({
                    total: b?.total || 0,
                    pending: b?.byStatus?.pending || 0,
                    confirmed: b?.byStatus?.confirmed || 0,
                    completed: b?.byStatus?.completed || 0,
                    cancelled: b?.byStatus?.cancelled || 0,
                    revenue: revenue?.total || 0,
                    todayBookings: b?.today || 0,
                });
            }
        } catch {}
    }, []);

    const refreshAll = useCallback(() => {
        fetchBookings(true);
        fetchStats();
    }, [fetchBookings, fetchStats]);

    useEffect(() => { fetchBookings(); fetchStats(); }, [fetchBookings, fetchStats]);

    // ── Real-time ──
    useEffect(() => {
        const unsub = onBookingEvent((event) => {
            if (event.type === 'new') {
                if (filters.page === 1) {
                    setBookings((prev) => {
                        if (prev.find((b) => b._id === event.data.bookingId)) return prev;
                        const nb = {
                            _id: event.data.bookingId,
                            bookingCode: event.data.bookingCode,
                            serviceName: event.data.serviceName,
                            status: event.data.status || 'pending',
                            price: event.data.price,
                            bookingDate: event.data.bookingDate,
                            timeSlot: event.data.timeSlot,
                            createdAt: event.data.createdAt,
                            walkInCustomer: { name: event.data.customerName },
                        };
                        const updated = [nb, ...prev];
                        if (updated.length > filters.limit) updated.pop();
                        return updated;
                    });
                    setTotal((p) => p + 1);
                }
                setStats((p) => ({ ...p, total: p.total + 1, pending: p.pending + 1, todayBookings: p.todayBookings + 1 }));
            } else if (event.type === 'statusUpdated') {
                setBookings((prev) =>
                    prev.map((b) => b._id === event.data.bookingId ? { ...b, status: event.data.status } : b)
                );
                fetchStats();
            } else if (event.type === 'cancelled') {
                setBookings((prev) => prev.filter((b) => b._id !== event.data.bookingId));
                setTotal((p) => Math.max(0, p - 1));
                setStats((p) => ({ ...p, total: Math.max(0, p.total - 1), pending: Math.max(0, p.pending - 1) }));
                toast.success(`Booking ${event.data.bookingCode || ''} cancelled`, { duration: 3000 });
            }
        });
        return unsub;
    }, [onBookingEvent, filters.page, filters.limit, fetchStats]);

    // ── Handlers ──
    const handleFilterChange = (newFilters) =>
        setFilters((prev) => ({
            ...prev, ...newFilters,
            page: newFilters.page !== undefined ? newFilters.page : 1,
        }));

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleView = async (booking) => {
        try {
            const res = await adminService.getBookingById(booking._id);
            if (res.success) {
                setSelectedBooking(res.data.booking);
                setCustomerHistory(res.data.customerHistory || []);
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
        setTimeout(() => { refreshAll(); toast.success('Booking created'); }, 100);
    };

    const handleStatusSuccess = () => {
        setShowStatusModal(false);
        setSelectedBooking(null);
        refreshAll();
    };

    const activeFiltersCount = [filters.status, filters.bookingType, filters.search].filter(Boolean).length;

    // ── Loading ──
    if (loading && bookings.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">Loading bookings...</p>
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
                        <p className="text-[10px] text-white/30 uppercase tracking-wide">Manage</p>
                        <h1 className="text-base sm:text-lg font-semibold text-white">Bookings</h1>
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
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Booking
                        </button>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <BookingStat
                        label="Total"
                        value={stats.total}
                        sub={`${stats.todayBookings} today`}
                    />
                    <BookingStat
                        label="Pending"
                        value={stats.pending}
                        sub="Awaiting action"
                        color={stats.pending > 0 ? 'amber' : undefined}
                    />
                    <BookingStat
                        label="Confirmed"
                        value={stats.confirmed}
                        sub="Ready for service"
                        color="blue"
                    />
                    <BookingStat
                        label="Revenue"
                        value={`₹${stats.revenue.toLocaleString('en-IN')}`}
                        sub={`${stats.completed} completed`}
                        color="emerald"
                    />
                </div>

                {/* ── Filter Bar ── */}
                <FilterBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    activeCount={activeFiltersCount}
                />

                {/* ── Bookings List ── */}
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

            {/* Mobile FAB */}
            <div className="lg:hidden fixed bottom-24 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-14 h-14 bg-white text-black rounded-2xl shadow-2xl shadow-black/50 flex items-center justify-center active:scale-95 transition-transform"
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
                    onClose={() => { setShowDetailModal(false); setSelectedBooking(null); setCustomerHistory([]); }}
                    onUpdateStatus={() => { setShowDetailModal(false); setShowStatusModal(true); }}
                    onStatusChange={refreshAll}
                />
            )}
            {showStatusModal && selectedBooking && (
                <UpdateStatusModal
                    booking={selectedBooking}
                    onClose={() => { setShowStatusModal(false); setSelectedBooking(null); }}
                    onSuccess={handleStatusSuccess}
                />
            )}
        </DashboardLayout>
    );
}

// ============================================
// BOOKING STAT CARD
// ============================================

function BookingStat({ label, value, sub, color }) {
    const colorMap = {
        amber:   'text-amber-400',
        blue:    'text-blue-400',
        emerald: 'text-emerald-400',
        red:     'text-red-400',
    };

    return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-lg sm:text-xl font-bold tabular-nums ${color ? colorMap[color] : 'text-white'}`}>
                {value}
            </p>
            <p className="text-[10px] text-white/20 mt-0.5 truncate">{sub}</p>
        </div>
    );
}

// ============================================
// FILTER BAR
// ============================================

function FilterBar({ filters, onFilterChange, showFilters, setShowFilters, activeCount }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') onFilterChange({ search: searchInput });
    };

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({ search: '', status: '', bookingType: '' });
    };

    return (
        <div className="space-y-2">
            {/* Row */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => onFilterChange({ search: searchInput })}
                        placeholder="Search bookings..."
                        className="w-full bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-white/20 transition-colors"
                    />
                    {searchInput && (
                        <button
                            onClick={() => { setSearchInput(''); onFilterChange({ search: '' }); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Desktop selects */}
                <SelectFilter
                    value={filters.status}
                    onChange={(v) => onFilterChange({ status: v })}
                    options={STATUS_OPTIONS}
                    className="hidden sm:block"
                />
                <SelectFilter
                    value={filters.bookingType}
                    onChange={(v) => onFilterChange({ bookingType: v })}
                    options={TYPE_OPTIONS}
                    className="hidden sm:block"
                />

                {/* Mobile filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`sm:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        showFilters || activeCount > 0
                            ? 'border-white/20 bg-white/[0.06] text-white'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {activeCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Desktop clear */}
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-lg border border-white/[0.06] text-xs text-white/30 hover:text-white transition-all"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* Mobile expanded */}
            {showFilters && (
                <div className="sm:hidden grid grid-cols-2 gap-2 p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <SelectFilter
                        value={filters.status}
                        onChange={(v) => onFilterChange({ status: v })}
                        options={STATUS_OPTIONS}
                    />
                    <SelectFilter
                        value={filters.bookingType}
                        onChange={(v) => onFilterChange({ bookingType: v })}
                        options={TYPE_OPTIONS}
                    />
                    {activeCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="col-span-2 flex items-center justify-center gap-1 py-1.5 text-xs text-white/30 hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear all
                        </button>
                    )}
                </div>
            )}

            {/* Active pills */}
            {activeCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {filters.status && (
                        <FilterPill label={filters.status} onRemove={() => onFilterChange({ status: '' })} />
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
                            onRemove={() => { setSearchInput(''); onFilterChange({ search: '' }); }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function SelectFilter({ value, onChange, options, className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-full bg-white/[0.04] border border-white/[0.06] text-xs text-white pl-3 pr-7 py-2.5 rounded-lg focus:outline-none focus:border-white/20 cursor-pointer [color-scheme:dark]"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
        </div>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] text-white/40 capitalize">
            {label}
            <button
                onClick={onRemove}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ============================================
// BOOKINGS LIST
// ============================================

function BookingsList({ bookings, loading, total, pages, currentPage, onPageChange, onView, onUpdateStatus }) {
    if (loading) {
        return (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                    <p className="text-[10px] text-white/20">Loading bookings...</p>
                </div>
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                        <CalendarDays className="w-4 h-4 text-white/20" />
                    </div>
                    <p className="text-[11px] text-white/40 mb-0.5">No bookings found</p>
                    <p className="text-[10px] text-white/20">Try adjusting your filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    All Bookings
                </p>
                <p className="text-[10px] text-white/20 tabular-nums">
                    {total} total · Page {currentPage} of {pages}
                </p>
            </div>

            {/* Rows */}
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
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/[0.06]">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                            let page;
                            if (pages <= 5) page = i + 1;
                            else if (currentPage <= 3) page = i + 1;
                            else if (currentPage >= pages - 2) page = pages - 4 + i;
                            else page = currentPage - 2 + i;

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-7 h-7 text-[10px] font-medium rounded-lg transition-all ${
                                        currentPage === page
                                            ? 'bg-white text-black'
                                            : 'text-white/30 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pages}
                        className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================
// BOOKING ROW
// ============================================

function BookingRow({ booking, isFirst, onView, onUpdateStatus }) {
    const status = STATUS_MAP[booking.status] || STATUS_MAP.pending;

    const name = booking.customerId
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in';

    const bookingDate  = booking.bookingDate ? new Date(booking.bookingDate) : null;
    const isToday      = bookingDate && new Date().toDateString() === bookingDate.toDateString();
    const isActionable = !['completed', 'cancelled'].includes(booking.status);

    return (
        <div
            className={`p-3 transition-colors cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.03] ${
                isFirst ? 'bg-white/[0.01]' : ''
            }`}
            onClick={() => onView(booking)}
        >
            <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <span className="text-xs font-bold text-white/50">
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Status dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-black ${status.dot}`} />
                    {/* Admin slot */}
                    {booking.isAdminSlot && (
                        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-purple-500 border border-black flex items-center justify-center">
                            <span className="text-[7px] font-bold text-white">A</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-[11px] font-medium text-white/80 truncate">{name}</p>
                                {isFirst && (
                                    <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-medium shrink-0">
                                        LATEST
                                    </span>
                                )}
                                {booking.isAdminSlot && (
                                    <span className="text-[8px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium shrink-0">
                                        ADMIN
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-white/25 truncate mt-0.5">
                                {booking.serviceName}
                            </p>
                        </div>

                        {/* Price + Status */}
                        <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-white tabular-nums">
                                ₹{(booking.price || 0).toLocaleString('en-IN')}
                            </p>
                            <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${status.bg} ${status.text}`}>
                                {status.label}
                            </span>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[9px] text-white/20">
                            {booking.bookingCode}
                        </span>
                        <span className="text-white/10">·</span>
                        <span className="flex items-center gap-1 text-[10px] text-white/25">
                            <Clock className="w-2.5 h-2.5" />
                            {isToday ? 'Today' : bookingDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {booking.timeSlot && ` · ${booking.timeSlot}`}
                        </span>
                        {booking.location?.city && (
                            <>
                                <span className="text-white/10">·</span>
                                <span className="flex items-center gap-1 text-[10px] text-white/25">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {booking.location.city}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    {isActionable && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onView(booking); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                            >
                                <Eye className="w-3 h-3" />
                                View
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
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
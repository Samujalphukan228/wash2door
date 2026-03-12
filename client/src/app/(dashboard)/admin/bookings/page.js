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
import { Plus, RefreshCw, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        bookingType: '',
        categoryName: '',
        date: '',
        city: '',
        search: ''
    });

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const fetchBookings = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await adminService.getAllBookings(params);
            if (response.success) {
                setBookings(response.data);
                setTotal(response.total);
                setPages(response.pages || 1);
            }
        } catch {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleFilterChange = (newFilters) =>
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleView = (booking) => { setSelectedBooking(booking); setShowDetailModal(true); };
    const handleUpdateStatus = (booking) => { setSelectedBooking(booking); setShowStatusModal(true); };
    const handleRefresh = () => { fetchBookings(true); toast.success('Refreshed', { duration: 1200 }); };

    const stats = {
        total,
        pending:    bookings.filter(b => b.status === 'pending').length,
        confirmed:  bookings.filter(b => b.status === 'confirmed').length,
        inProgress: bookings.filter(b => b.status === 'in-progress').length,
        completed:  bookings.filter(b => b.status === 'completed').length,
        cancelled:  bookings.filter(b => b.status === 'cancelled').length,
        revenue:    bookings
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, b) => sum + (b.price || 0), 0)
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-28 sm:pb-10">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            {/* Eyebrow */}
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
                                {/* Shine sweep */}
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

                    {/* ── Content ── */}
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
            </div>

            {/* ── Mobile FAB ── */}
            <div className="sm:hidden fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="
                        relative group
                        w-13 h-13 w-[52px] h-[52px]
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

                {/* FAB label */}
                <div className="
                    absolute right-full mr-3 top-1/2 -translate-y-1/2
                    px-2.5 py-1 rounded-lg
                    bg-white/[0.08] border border-white/[0.10]
                    backdrop-blur-sm
                    opacity-0 group-hover:opacity-100
                    pointer-events-none
                    whitespace-nowrap
                    transition-opacity duration-200
                ">
                    <span className="text-xs text-white/70">New Booking</span>
                </div>
            </div>

            {/* ── Modals ── */}
            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchBookings();
                        toast.success('Booking created');
                    }}
                />
            )}

            {showDetailModal && selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => { setShowDetailModal(false); setSelectedBooking(null); }}
                    onUpdateStatus={() => { setShowDetailModal(false); setShowStatusModal(true); }}
                />
            )}

            {showStatusModal && selectedBooking && (
                <UpdateStatusModal
                    booking={selectedBooking}
                    onClose={() => { setShowStatusModal(false); setSelectedBooking(null); }}
                    onSuccess={() => {
                        setShowStatusModal(false);
                        setSelectedBooking(null);
                        fetchBookings();
                        toast.success('Status updated');
                    }}
                />
            )}
        </DashboardLayout>
    );
}
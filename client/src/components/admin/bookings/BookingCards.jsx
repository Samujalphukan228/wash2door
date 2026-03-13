// src/components/admin/bookings/BookingCards.jsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
    Eye, RefreshCw, ChevronLeft, ChevronRight, MapPin, Clock, 
    ArrowUpRight, CheckCircle, Play, Loader2 
} from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const statusConfig = {
    pending:       { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400', ring: 'ring-yellow-500/20' },
    confirmed:     { bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400',   ring: 'ring-blue-500/20'  },
    'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400', ring: 'ring-purple-500/20'},
    completed:     { bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400',  ring: 'ring-green-500/20' },
    cancelled:     { bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400',    ring: 'ring-red-500/20'   }
};

// Get next action based on status
const getNextAction = (status) => {
    switch (status) {
        case 'pending':
            return { nextStatus: 'confirmed', label: 'Confirm', icon: CheckCircle, color: 'text-blue-400' };
        case 'confirmed':
            return { nextStatus: 'in-progress', label: 'Start', icon: Play, color: 'text-purple-400' };
        case 'in-progress':
            return { nextStatus: 'completed', label: 'Complete', icon: CheckCircle, color: 'text-green-400' };
        default:
            return null;
    }
};

function SkeletonCard() {
    return (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-3.5 w-28 rounded-md bg-white/[0.06]" />
                <div className="h-5 w-20 rounded-full bg-white/[0.06]" />
            </div>
            <div className="h-4 w-40 rounded-md bg-white/[0.06]" />
            <div className="h-3 w-56 rounded-md bg-white/[0.04]" />
            <div className="h-px w-full bg-white/[0.04]" />
            <div className="flex justify-between">
                <div className="h-3 w-24 rounded-md bg-white/[0.04]" />
                <div className="h-3 w-16 rounded-md bg-white/[0.04]" />
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className="capitalize">{status}</span>
        </span>
    );
}

function BookingCard({ booking, onView, onUpdateStatus, onRefresh }) {
    const [actionLoading, setActionLoading] = useState(false);

    const nextAction = getNextAction(booking.status);
    const isActionable = !['completed', 'cancelled'].includes(booking.status);
    
    const customerName = booking.customerId
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in Customer';

    const handleQuickAction = async (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        if (!nextAction) return;

        try {
            setActionLoading(true);
            await adminService.updateBookingStatus(booking._id, nextAction.nextStatus);
            
            if (nextAction.nextStatus === 'completed') {
                toast.success('Booking completed! Revenue added.');
            } else {
                toast.success(`Booking ${nextAction.nextStatus}`);
            }
            
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Quick action error:', error);
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setActionLoading(false);
        }
    };

    const handleView = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onView(booking);
    };

    const handleUpdateStatus = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onUpdateStatus(booking);
    };

    return (
        <div className="group relative rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all duration-150 overflow-hidden">

            {/* Subtle top gradient line on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Main clickable area */}
            <button
                type="button"
                onClick={handleView}
                className="w-full p-4 text-left"
            >
                {/* Row 1: Code + Status */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white/40 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                            {booking.bookingCode}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                            booking.bookingType === 'walkin'
                                ? 'border-white/[0.08] text-white/30'
                                : 'border-blue-500/20 text-blue-400/60'
                        }`}>
                            {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                        </span>
                    </div>
                    <StatusBadge status={booking.status} />
                </div>

                {/* Row 2: Customer */}
                <div className="flex items-start justify-between mb-0.5">
                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {customerName}
                    </p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors mt-0.5 shrink-0" />
                </div>

                {/* Row 3: Service */}
                <p className="text-xs text-white/40 mb-4">
                    {booking.serviceName}
                    {booking.variantName && (
                        <span className="text-white/20"> / {booking.variantName}</span>
                    )}
                </p>

                {/* Row 4: Meta */}
                <div className="flex items-center gap-3 text-[11px] text-white/30">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(booking.bookingDate), 'dd MMM yyyy')}
                        <span className="text-white/20">·</span>
                        {booking.timeSlot}
                    </span>
                    <span className="text-white/10">|</span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.location?.city || 'N/A'}
                    </span>
                </div>

                {/* Divider + Price */}
                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.05]">
                    <span className="text-[11px] text-white/25">Total Amount</span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                        ₹{booking.price?.toLocaleString('en-IN')}
                    </span>
                </div>
            </button>

            {/* Action Bar */}
            {isActionable && (
                <div className="flex border-t border-white/[0.05]">
                    <button
                        type="button"
                        onClick={handleView}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] text-white/35 hover:text-white/70 hover:bg-white/[0.03] transition-all duration-150"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        View
                    </button>

                    <div className="w-px bg-white/[0.05]" />

                    {/* Quick Action Button */}
                    {nextAction && (
                        <>
                            <button
                                type="button"
                                onClick={handleQuickAction}
                                disabled={actionLoading}
                                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium hover:bg-white/[0.03] transition-all duration-150 disabled:opacity-50 ${nextAction.color}`}
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <nextAction.icon className="w-3.5 h-3.5" />
                                )}
                                {nextAction.label}
                            </button>

                            <div className="w-px bg-white/[0.05]" />
                        </>
                    )}

                    <button
                        type="button"
                        onClick={handleUpdateStatus}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] text-white/35 hover:text-white/70 hover:bg-white/[0.03] transition-all duration-150"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        More
                    </button>
                </div>
            )}
        </div>
    );
}

function Pagination({ currentPage, pages, onPageChange }) {
    if (pages <= 1) return null;

    const getPages = () => {
        if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= pages - 2) return [pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    return (
        <div className="flex items-center justify-between pt-2">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-white/40 hover:text-white/80 hover:bg-white/[0.05] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
            </button>

            <div className="flex items-center gap-1">
                {getPages().map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`w-7 h-7 rounded-md text-xs font-medium transition-all duration-150 ${
                            currentPage === page
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === pages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-white/40 hover:text-white/80 hover:bg-white/[0.05] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export default function BookingCards({
    bookings,
    loading,
    total,
    pages,
    currentPage,
    onPageChange,
    onView,
    onUpdateStatus,
    onRefresh
}) {
    if (loading) {
        return (
            <div className="space-y-2.5">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] py-20 text-center">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-sm text-white/30 font-medium">No bookings found</p>
                <p className="text-xs text-white/15 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between px-0.5 pb-1">
                <p className="text-xs text-white/25">
                    <span className="text-white/50 font-medium">{total}</span> bookings
                </p>
                <p className="text-xs text-white/20 font-mono">
                    {currentPage} / {pages}
                </p>
            </div>

            {/* Cards */}
            {bookings.map((booking) => (
                <BookingCard
                    key={booking._id}
                    booking={booking}
                    onView={onView}
                    onUpdateStatus={onUpdateStatus}
                    onRefresh={onRefresh}
                />
            ))}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                pages={pages}
                onPageChange={onPageChange}
            />
        </div>
    );
}
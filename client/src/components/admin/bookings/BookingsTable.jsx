// src/components/admin/bookings/BookingsTable.jsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
    Eye, RefreshCw, ChevronLeft, ChevronRight, 
    CheckCircle, Play, Loader2 
} from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const statusConfig = {
    pending:       { dot: 'bg-yellow-400', text: 'text-yellow-400',  bg: 'bg-yellow-500/10',  ring: 'ring-yellow-500/20'  },
    confirmed:     { dot: 'bg-blue-400',   text: 'text-blue-400',    bg: 'bg-blue-500/10',    ring: 'ring-blue-500/20'    },
    'in-progress': { dot: 'bg-purple-400', text: 'text-purple-400',  bg: 'bg-purple-500/10',  ring: 'ring-purple-500/20'  },
    completed:     { dot: 'bg-green-400',  text: 'text-green-400',   bg: 'bg-green-500/10',   ring: 'ring-green-500/20'   },
    cancelled:     { dot: 'bg-red-400',    text: 'text-red-400',     bg: 'bg-red-500/10',     ring: 'ring-red-500/20'     }
};

const tierConfig = {
    basic:    { text: 'text-white/30', bg: 'bg-white/[0.03]', ring: 'ring-white/[0.06]' },
    standard: { text: 'text-white/50', bg: 'bg-white/[0.04]', ring: 'ring-white/[0.08]' },
    premium:  { text: 'text-white/80', bg: 'bg-white/[0.06]', ring: 'ring-white/10'     },
    custom:   { text: 'text-blue-400', bg: 'bg-blue-500/10',  ring: 'ring-blue-500/20'  }
};

const HEADERS = [
    { key: 'code',     label: 'Code'     },
    { key: 'customer', label: 'Customer' },
    { key: 'service',  label: 'Service'  },
    { key: 'schedule', label: 'Schedule' },
    { key: 'status',   label: 'Status'   },
    { key: 'type',     label: 'Type'     },
    { key: 'amount',   label: 'Amount'   },
    { key: 'actions',  label: ''         }
];

// Get next action based on status
const getNextAction = (status) => {
    switch (status) {
        case 'pending':
            return { nextStatus: 'confirmed', label: 'Confirm', icon: CheckCircle, color: 'text-blue-400 hover:text-blue-300' };
        case 'confirmed':
            return { nextStatus: 'in-progress', label: 'Start', icon: Play, color: 'text-purple-400 hover:text-purple-300' };
        case 'in-progress':
            return { nextStatus: 'completed', label: 'Complete', icon: CheckCircle, color: 'text-green-400 hover:text-green-300' };
        default:
            return null;
    }
};

/* ── Skeleton ── */
function TableSkeleton() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                <div className="h-3 w-28 rounded-md bg-white/[0.06] animate-pulse" />
                <div className="h-3 w-16 rounded-md bg-white/[0.04] animate-pulse" />
            </div>
            <div className="divide-y divide-white/[0.03]">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 px-5 py-4">
                        <div className="h-3 w-24 rounded bg-white/[0.05] animate-pulse" />
                        <div className="h-3 w-32 rounded bg-white/[0.05] animate-pulse" />
                        <div className="h-3 w-28 rounded bg-white/[0.04] animate-pulse" />
                        <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
                        <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Empty ── */
function TableEmpty() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-24 text-center">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <Eye className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-sm text-white/30 font-medium">No bookings found</p>
            <p className="text-xs text-white/15 mt-1">Try adjusting your filters</p>
        </div>
    );
}

/* ── Main ── */
export default function BookingsTable({
    bookings, loading, total, pages,
    currentPage, onPageChange, onView, onUpdateStatus, onRefresh
}) {
    const [actionLoading, setActionLoading] = useState(null);

    // Quick status update - prevent page reload
    const handleQuickAction = async (e, bookingId, newStatus) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        try {
            setActionLoading(bookingId);
            await adminService.updateBookingStatus(bookingId, newStatus);
            
            if (newStatus === 'completed') {
                toast.success('Booking completed! Revenue added.');
            } else {
                toast.success(`Booking ${newStatus}`);
            }
            
            // Refresh without page reload
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Quick action error:', error);
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setActionLoading(null);
        }
    };

    const handleView = (e, booking) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onView(booking);
    };

    const handleUpdateStatus = (e, booking) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onUpdateStatus(booking);
    };

    if (loading) return <TableSkeleton />;
    if (!bookings || bookings.length === 0) return <TableEmpty />;

    const getPages = () => {
        if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= pages - 2) return [pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">

            {/* Top gradient line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Table Header Bar */}
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                <p className="text-xs font-medium text-white/50 tracking-wider uppercase">
                    All Bookings
                </p>
                <p className="text-xs text-white/20 font-mono">
                    <span className="text-white/40">{total}</span> total
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.04]">
                            {HEADERS.map(({ key, label }) => (
                                <th
                                    key={key}
                                    className="px-5 py-3 text-left text-[10px] text-white/25 tracking-widest uppercase font-medium whitespace-nowrap"
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.03]">
                        {bookings.map((booking) => {
                            const status = statusConfig[booking.status] || statusConfig.pending;
                            const tier = tierConfig[booking.serviceTier] || tierConfig.basic;
                            const nextAction = getNextAction(booking.status);
                            const isLoading = actionLoading === booking._id;

                            const name = booking.customerId
                                ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
                                : booking.walkInCustomer?.name || '—';
                            const sub = booking.customerId?.email
                                || booking.walkInCustomer?.phone
                                || '';

                            return (
                                <tr
                                    key={booking._id}
                                    className="group hover:bg-white/[0.02] transition-colors duration-100"
                                >
                                    {/* Code */}
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-xs text-white/50 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                                            {booking.bookingCode}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-white/80 whitespace-nowrap font-medium">
                                            {name}
                                        </p>
                                        {sub && (
                                            <p className="text-[11px] text-white/25 mt-0.5 font-mono">
                                                {sub}
                                            </p>
                                        )}
                                    </td>

                                    {/* Service */}
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-white/60 whitespace-nowrap">
                                            {booking.serviceName}
                                        </p>
                                        {booking.serviceTier && (
                                            <span className={`
                                                inline-flex items-center mt-1
                                                text-[10px] font-medium px-1.5 py-0.5 rounded
                                                ring-1 capitalize
                                                ${tier.text} ${tier.bg} ${tier.ring}
                                            `}>
                                                {booking.serviceTier}
                                            </span>
                                        )}
                                        {booking.variantName && (
                                            <p className="text-[11px] text-white/25 mt-0.5">
                                                {booking.variantName}
                                            </p>
                                        )}
                                    </td>

                                    {/* Schedule */}
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-white/60 whitespace-nowrap">
                                            {format(new Date(booking.bookingDate), 'dd MMM yyyy')}
                                        </p>
                                        <p className="text-[11px] font-mono text-white/25 mt-0.5">
                                            {booking.timeSlot}
                                        </p>
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4">
                                        <span className={`
                                            inline-flex items-center gap-1.5
                                            px-2.5 py-1 rounded-full text-[11px] font-medium
                                            ring-1 whitespace-nowrap
                                            ${status.bg} ${status.text} ${status.ring}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                                            <span className="capitalize">{booking.status}</span>
                                        </span>
                                    </td>

                                    {/* Type */}
                                    <td className="px-5 py-4">
                                        <span className={`
                                            text-[11px] font-medium px-2 py-0.5 rounded
                                            border whitespace-nowrap
                                            ${booking.bookingType === 'walkin'
                                                ? 'border-white/[0.06] text-white/25 bg-white/[0.02]'
                                                : 'border-blue-500/20 text-blue-400/70 bg-blue-500/[0.06]'
                                            }
                                        `}>
                                            {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                                        </span>
                                    </td>

                                    {/* Amount */}
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-white whitespace-nowrap tabular-nums">
                                            ₹{booking.price?.toLocaleString('en-IN')}
                                        </p>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            {/* View */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleView(e, booking)}
                                                title="View details"
                                                className="
                                                    w-7 h-7 rounded-lg flex items-center justify-center
                                                    border border-white/[0.06] bg-white/[0.02]
                                                    text-white/30 hover:text-white/70
                                                    hover:bg-white/[0.06] hover:border-white/10
                                                    transition-all duration-150
                                                "
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Quick Action (next step) */}
                                            {nextAction && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleQuickAction(e, booking._id, nextAction.nextStatus)}
                                                    disabled={isLoading}
                                                    title={nextAction.label}
                                                    className={`
                                                        w-7 h-7 rounded-lg flex items-center justify-center
                                                        border border-white/[0.08] bg-white/[0.03]
                                                        transition-all duration-150
                                                        disabled:opacity-50
                                                        ${nextAction.color}
                                                    `}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <nextAction.icon className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}

                                            {/* More options */}
                                            {!['completed', 'cancelled'].includes(booking.status) && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleUpdateStatus(e, booking)}
                                                    title="More options"
                                                    className="
                                                        w-7 h-7 rounded-lg flex items-center justify-center
                                                        border border-white/[0.06] bg-white/[0.02]
                                                        text-white/30 hover:text-white/70
                                                        hover:bg-white/[0.06] hover:border-white/10
                                                        transition-all duration-150
                                                    "
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="px-5 py-3.5 border-t border-white/[0.05] flex items-center justify-between">
                    <p className="text-[11px] text-white/20 font-mono">
                        Page <span className="text-white/40">{currentPage}</span> of {pages}
                    </p>

                    <div className="flex items-center gap-1">
                        {/* Prev */}
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="
                                w-7 h-7 rounded-md flex items-center justify-center
                                text-white/30 hover:text-white/70
                                hover:bg-white/[0.06]
                                disabled:opacity-25 disabled:cursor-not-allowed
                                transition-all duration-150
                            "
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Pages */}
                        {getPages().map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                className={`
                                    w-7 h-7 rounded-md text-xs font-medium transition-all duration-150
                                    ${currentPage === page
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]'
                                    }
                                `}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="
                                w-7 h-7 rounded-md flex items-center justify-center
                                text-white/30 hover:text-white/70
                                hover:bg-white/[0.06]
                                disabled:opacity-25 disabled:cursor-not-allowed
                                transition-all duration-150
                            "
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
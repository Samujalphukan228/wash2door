'use client';

import { format } from 'date-fns';
import { Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const statusStyles = {
    pending:      { dot: 'bg-neutral-500', text: 'text-neutral-400' },
    confirmed:    { dot: 'bg-white',       text: 'text-white'       },
    'in-progress':{ dot: 'bg-white',       text: 'text-white'       },
    completed:    { dot: 'bg-white',       text: 'text-white'       },
    cancelled:    { dot: 'bg-neutral-700', text: 'text-neutral-600' }
};

const categoryBadge = {
    basic:    'text-neutral-400 border-neutral-700',
    standard: 'text-neutral-300 border-neutral-600',
    premium:  'text-white border-neutral-400'
};

export default function BookingsTable({
    bookings,
    loading,
    total,
    pages,
    currentPage,
    onPageChange,
    onView,
    onUpdateStatus
}) {
    if (loading) {
        return (
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="p-6 space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-4 w-28 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-36 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-24 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-20 bg-neutral-800 animate-pulse rounded ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="px-6 py-16 text-center">
                    <p className="text-neutral-500 text-sm">
                        No bookings found
                    </p>
                    <p className="text-neutral-700 text-xs mt-1">
                        Try adjusting your filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-950 border border-neutral-800">

            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    All Bookings
                </p>
                <p className="text-xs text-neutral-500">
                    {total} total
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-800">
                            {[
                                'Code', 'Customer', 'Service',
                                'Date', 'Slot', 'Status',
                                'Type', 'Amount', 'Actions'
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => {
                            const style = statusStyles[booking.status]
                                || statusStyles.pending;

                            return (
                                <tr
                                    key={booking._id}
                                    className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors"
                                >
                                    {/* Code */}
                                    <td className="px-4 py-4">
                                        <span className="text-xs font-mono text-white">
                                            {booking.bookingCode}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="text-sm text-white whitespace-nowrap">
                                                {booking.customerId
                                                    ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
                                                    : booking.walkInCustomer?.name || '—'
                                                }
                                            </p>
                                            <p className="text-xs text-neutral-600 mt-0.5">
                                                {booking.customerId?.email
                                                    || booking.walkInCustomer?.phone
                                                    || ''
                                                }
                                            </p>
                                        </div>
                                    </td>

                                    {/* Service */}
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="text-sm text-neutral-300 whitespace-nowrap">
                                                {booking.serviceName}
                                            </p>
                                            <span className={`text-xs border px-1.5 py-0.5 mt-1 inline-block capitalize ${
                                                categoryBadge[booking.serviceCategory]
                                            }`}>
                                                {booking.serviceCategory}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-neutral-400 whitespace-nowrap">
                                            {format(
                                                new Date(booking.bookingDate),
                                                'dd MMM yyyy'
                                            )}
                                        </p>
                                    </td>

                                    {/* Time Slot */}
                                    <td className="px-4 py-4">
                                        <p className="text-xs font-mono text-neutral-400 whitespace-nowrap">
                                            {booking.timeSlot}
                                        </p>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                                            <span className={`text-xs capitalize whitespace-nowrap ${style.text}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-4">
                                        <span className={`text-xs border px-2 py-0.5 capitalize ${
                                            booking.bookingType === 'walkin'
                                                ? 'border-neutral-700 text-neutral-500'
                                                : 'border-neutral-600 text-neutral-400'
                                        }`}>
                                            {booking.bookingType === 'walkin'
                                                ? 'Walk-in'
                                                : 'Online'
                                            }
                                        </span>
                                    </td>

                                    {/* Amount */}
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-white font-medium whitespace-nowrap">
                                            ₹{booking.price?.toLocaleString('en-IN')}
                                        </p>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onView(booking)}
                                                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            {booking.status !== 'completed' &&
                                             booking.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => onUpdateStatus(booking)}
                                                    className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                                    title="Update status"
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
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        Page {currentPage} of {pages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {[...Array(Math.min(pages, 5))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 text-xs border transition-colors ${
                                        currentPage === page
                                            ? 'border-white bg-white text-black'
                                            : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
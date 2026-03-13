'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

function TableSkeleton() {
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
                <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-zinc-800">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 px-4 py-3">
                        <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TableEmpty() {
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-20 text-center">
            <Eye className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">No bookings found</p>
            <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters</p>
        </div>
    );
}

export default function BookingsTable({
    bookings, loading, total, pages,
    currentPage, onPageChange, onView, onUpdateStatus
}) {
    if (loading) return <TableSkeleton />;
    if (!bookings || bookings.length === 0) return <TableEmpty />;

    const getPages = () => {
        if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= pages - 2) return [pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <p className="text-sm font-medium text-white">All Bookings</p>
                <p className="text-xs text-zinc-500 font-mono">
                    <span className="text-white">{total}</span> total
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            {['Code', 'Customer', 'Service', 'Schedule', 'Status', 'Type', 'Amount', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs text-zinc-500 font-medium whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {bookings.map((booking) => {
                            const name = booking.customerId
                                ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
                                : booking.walkInCustomer?.name || '—';

                            return (
                                <tr key={booking._id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-zinc-400">
                                            {booking.bookingCode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-white">{name}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-zinc-400">{booking.serviceName}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-zinc-400">
                                            {format(new Date(booking.bookingDate), 'dd MMM yyyy')}
                                        </p>
                                        <p className="text-xs font-mono text-zinc-600 mt-0.5">
                                            {booking.timeSlot}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-zinc-400 capitalize">
                                            {booking.status.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-zinc-500">
                                            {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-white">
                                            ₹{booking.price?.toLocaleString('en-IN')}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onView(booking)}
                                                className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {!['completed', 'cancelled'].includes(booking.status) && (
                                                <button
                                                    onClick={() => onUpdateStatus(booking)}
                                                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
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
                <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-mono">
                        Page <span className="text-white">{currentPage}</span> of {pages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {getPages().map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-7 h-7 text-xs font-medium rounded transition-colors ${
                                    currentPage === page
                                        ? 'bg-white text-black'
                                        : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
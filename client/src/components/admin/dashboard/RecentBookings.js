// RecentBookings.jsx
'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, ExternalLink } from 'lucide-react';

const statusConfig = {
    pending: {
        text: 'text-yellow-400',
        dot: 'bg-yellow-400',
        bg: 'bg-yellow-500/10'
    },
    confirmed: {
        text: 'text-blue-400',
        dot: 'bg-blue-400',
        bg: 'bg-blue-500/10'
    },
    'in-progress': {
        text: 'text-purple-400',
        dot: 'bg-purple-400',
        bg: 'bg-purple-500/10'
    },
    completed: {
        text: 'text-green-400',
        dot: 'bg-green-400',
        bg: 'bg-green-500/10'
    },
    cancelled: {
        text: 'text-red-400/60 line-through',
        dot: 'bg-red-400/60',
        bg: 'bg-red-500/10'
    }
};

export default function RecentBookings({ bookings, loading }) {
    return (
        <div className="
            relative overflow-hidden rounded-lg
            border border-white/[0.08]
            bg-gradient-to-br from-white/[0.03] to-transparent
        ">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent)]" />

            <div className="relative">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08] flex items-center justify-between">
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 tracking-[0.15em] uppercase">
                        Recent Bookings
                    </p>
                    <Link
                        href="/admin/bookings"
                        className="
                            flex items-center gap-1.5 px-2 py-1 rounded-md
                            text-[10px] sm:text-xs text-white/40 
                            hover:text-white/80 hover:bg-white/[0.04]
                            transition-all duration-150 group
                        "
                    >
                        <span className="tracking-wide">View all</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-4 sm:p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-4 w-20 bg-white/[0.06] animate-pulse rounded" />
                                    <div className="h-4 w-28 bg-white/[0.06] animate-pulse rounded" />
                                    <div className="h-4 w-24 bg-white/[0.06] animate-pulse rounded hidden sm:block" />
                                    <div className="h-4 w-20 bg-white/[0.06] animate-pulse rounded hidden md:block" />
                                    <div className="h-4 w-16 bg-white/[0.06] animate-pulse rounded ml-auto" />
                                </div>
                            ))}
                        </div>
                    ) : !bookings || bookings.length === 0 ? (
                        <div className="px-4 sm:px-6 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.02] mb-3">
                                <ExternalLink className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="text-sm text-white/30">
                                No bookings yet
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.08]">
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase font-normal">
                                        Code
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase font-normal">
                                        Customer
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase font-normal hidden md:table-cell">
                                        Service
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase font-normal hidden lg:table-cell">
                                        Date
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase font-normal">
                                        Status
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase font-normal">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, index) => {
                                    const config = statusConfig[booking.status] || statusConfig.pending;
                                    
                                    return (
                                        <tr
                                            key={booking._id}
                                            className="
                                                border-b border-white/[0.04] 
                                                hover:bg-white/[0.02] 
                                                transition-colors duration-150
                                                group
                                            "
                                        >
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <span className="text-xs font-mono text-white/60 group-hover:text-white/80 transition-colors">
                                                    {booking.bookingCode}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <p className="text-sm text-white/80 truncate max-w-[150px]">
                                                    {booking.customerId
                                                        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
                                                        : booking.walkInCustomer?.name || '—'
                                                    }
                                                </p>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                <p className="text-sm text-white/40 truncate max-w-[180px]">
                                                    {booking.serviceName}
                                                </p>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                                <p className="text-sm text-white/30 font-mono">
                                                    {format(new Date(booking.bookingDate), 'dd MMM yyyy')}
                                                </p>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                    <span className={`text-xs capitalize ${config.text}`}>
                                                        {booking.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                                <span className="text-sm text-white/80 font-mono">
                                                    ₹{booking.price?.toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
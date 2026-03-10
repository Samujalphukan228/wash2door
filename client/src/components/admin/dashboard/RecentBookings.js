'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

const statusStyles = {
    pending:      'text-neutral-500',
    confirmed:    'text-white',
    'in-progress':'text-white',
    completed:    'text-white',
    cancelled:    'text-neutral-600 line-through'
};

const statusDot = {
    pending:      'bg-neutral-600',
    confirmed:    'bg-white',
    'in-progress':'bg-white',
    completed:    'bg-white',
    cancelled:    'bg-neutral-700'
};

export default function RecentBookings({ bookings, loading }) {
    return (
        <div className="bg-neutral-950 border border-neutral-800">

            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    Recent Bookings
                </p>
                <Link
                    href="/admin/bookings"
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    View all
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-4 w-24 bg-neutral-800 animate-pulse rounded" />
                                <div className="h-4 w-32 bg-neutral-800 animate-pulse rounded" />
                                <div className="h-4 w-20 bg-neutral-800 animate-pulse rounded" />
                                <div className="h-4 w-16 bg-neutral-800 animate-pulse rounded ml-auto" />
                            </div>
                        ))}
                    </div>
                ) : !bookings || bookings.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-neutral-500">
                            No bookings yet
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="px-6 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal hidden md:table-cell">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal hidden lg:table-cell">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr
                                    key={booking._id}
                                    className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono text-white">
                                            {booking.bookingCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-white">
                                            {booking.customerId
                                                ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
                                                : booking.walkInCustomer?.name || '—'
                                            }
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <p className="text-sm text-neutral-400">
                                            {booking.serviceName}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <p className="text-sm text-neutral-500">
                                            {format(
                                                new Date(booking.bookingDate),
                                                'dd MMM yyyy'
                                            )}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot[booking.status]}`} />
                                            <span className={`text-xs capitalize ${statusStyles[booking.status]}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm text-white">
                                            ₹{booking.price?.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
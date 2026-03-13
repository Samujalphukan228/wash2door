// RecentBookings.jsx
'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';

export default function RecentBookings({ bookings, loading }) {
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                    Recent Bookings
                </h3>
                <Link
                    href="/admin/bookings"
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    View all
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-zinc-800/50 rounded animate-pulse" />
                        ))}
                    </div>
                ) : !bookings || bookings.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-zinc-500">No bookings yet</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 hidden md:table-cell">
                                    Service
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 hidden lg:table-cell">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {bookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-mono text-zinc-400">
                                            {booking.bookingCode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-white">
                                            {booking.customerId
                                                ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
                                                : booking.walkInCustomer?.name || '—'
                                            }
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-sm text-zinc-400">
                                            {booking.serviceName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-sm text-zinc-500">
                                            {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-zinc-400 capitalize">
                                            {booking.status.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm text-white font-medium">
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
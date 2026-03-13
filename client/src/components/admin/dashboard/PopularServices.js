// PopularServices.jsx
'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function PopularServices({ services, loading }) {
    const maxBookings = services?.[0]?.totalBookings || 1;

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                    Popular Services
                </h3>
                <Link
                    href="/admin/services"
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    View all
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                                    <div className="h-4 w-8 bg-zinc-800 rounded animate-pulse" />
                                </div>
                                <div className="h-1 w-full bg-zinc-800 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : !services || services.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-zinc-500">No data yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {services.map((service, index) => {
                            const percentage = Math.round((service.totalBookings / maxBookings) * 100);

                            return (
                                <div key={service._id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-white">
                                            {service.serviceName}
                                        </p>
                                        <span className="text-sm text-white font-medium">
                                            {service.totalBookings}
                                        </span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
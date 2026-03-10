'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PopularServices({ services, loading }) {
    return (
        <div className="bg-neutral-950 border border-neutral-800">

            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    Popular Services
                </p>
                <Link
                    href="/admin/services"
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    View all
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-3 w-24 bg-neutral-800 animate-pulse rounded" />
                                    <div className="h-3 w-8 bg-neutral-800 animate-pulse rounded" />
                                </div>
                                <div className="h-px w-full bg-neutral-800" />
                            </div>
                        ))}
                    </div>
                ) : !services || services.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-6">
                        No data yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {services.map((service, index) => {
                            const maxBookings = services[0]?.totalBookings || 1;
                            const percentage = Math.round(
                                (service.totalBookings / maxBookings) * 100
                            );

                            return (
                                <div key={service._id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-neutral-600 font-mono">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <p className="text-sm text-white">
                                                {service.serviceName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white font-medium">
                                                {service.totalBookings}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-neutral-800 w-full">
                                        <div
                                            className="h-px bg-white transition-all duration-500"
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
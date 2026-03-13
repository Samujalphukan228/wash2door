// PopularServices.jsx
'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function PopularServices({ services, loading }) {
    return (
        <div className="
            relative overflow-hidden rounded-lg
            border border-white/[0.08]
            bg-gradient-to-br from-white/[0.03] to-transparent
        ">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent)]" />

            <div className="relative">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08] flex items-center justify-between">
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 tracking-[0.15em] uppercase">
                        Popular Services
                    </p>
                    <Link
                        href="/admin/services"
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

                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="h-3 w-28 bg-white/[0.06] animate-pulse rounded" />
                                        <div className="h-3 w-8 bg-white/[0.06] animate-pulse rounded" />
                                    </div>
                                    <div className="h-px w-full bg-white/[0.04]" />
                                </div>
                            ))}
                        </div>
                    ) : !services || services.length === 0 ? (
                        <div className="py-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.02] mb-3">
                                <TrendingUp className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="text-sm text-white/30">
                                No data yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {services.map((service, index) => {
                                const maxBookings = services[0]?.totalBookings || 1;
                                const percentage = Math.round(
                                    (service.totalBookings / maxBookings) * 100
                                );

                                return (
                                    <div 
                                        key={service._id}
                                        className="group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <span className="text-[10px] text-white/20 font-mono shrink-0">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <p className="text-sm text-white/80 group-hover:text-white transition-colors truncate">
                                                    {service.serviceName}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <p className="text-xs text-white/60 font-medium tabular-nums">
                                                    {service.totalBookings}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/[0.06] w-full overflow-hidden rounded-full">
                                            <div
                                                className="h-full bg-white/30 transition-all duration-700 ease-out"
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
        </div>
    );
}
// BookingsByStatus.jsx
'use client';

import { BarChart3 } from 'lucide-react';

const statusConfig = {
    pending: {
        label: 'Pending',
        dot: 'bg-yellow-400',
        bar: 'bg-yellow-400'
    },
    confirmed: {
        label: 'Confirmed',
        dot: 'bg-blue-400',
        bar: 'bg-blue-400'
    },
    inProgress: {
        label: 'In Progress',
        dot: 'bg-purple-400',
        bar: 'bg-purple-400'
    },
    completed: {
        label: 'Completed',
        dot: 'bg-green-400',
        bar: 'bg-green-400'
    },
    cancelled: {
        label: 'Cancelled',
        dot: 'bg-red-400/60',
        bar: 'bg-red-400/60'
    }
};

export default function BookingsByStatus({ data, loading }) {
    const statuses = Object.keys(statusConfig);
    
    const total = statuses.reduce(
        (sum, key) => sum + (data?.[key] || 0), 
        0
    );

    return (
        <div className="
            relative overflow-hidden rounded-lg
            border border-white/[0.08]
            bg-gradient-to-br from-white/[0.03] to-transparent
        ">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent)]" />

            <div className="relative">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08]">
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 tracking-[0.15em] uppercase">
                        Bookings by Status
                    </p>
                </div>
                
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/[0.06] animate-pulse rounded-full" />
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="h-3 w-24 bg-white/[0.06] animate-pulse rounded" />
                                    <div className="h-3 w-12 bg-white/[0.06] animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    ) : total === 0 ? (
                        <div className="py-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.02] mb-3">
                                <BarChart3 className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="text-sm text-white/30">
                                No bookings data
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Stacked Bar */}
                            <div className="flex h-2 w-full mb-6 overflow-hidden rounded-full bg-white/[0.04]">
                                {statuses.map((key) => {
                                    const val = data?.[key] || 0;
                                    const pct = (val / total) * 100;
                                    const config = statusConfig[key];
                                    
                                    return pct > 0 ? (
                                        <div
                                            key={key}
                                            className={`h-full transition-all duration-500 ${config.bar} first:rounded-l-full last:rounded-r-full`}
                                            style={{ width: `${pct}%` }}
                                            title={`${config.label}: ${val}`}
                                        />
                                    ) : null;
                                })}
                            </div>

                            {/* Status List */}
                            <div className="space-y-3">
                                {statuses.map((key) => {
                                    const val = data?.[key] || 0;
                                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                    const config = statusConfig[key];

                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                                                    {config.label}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-white/30 font-mono tabular-nums">
                                                    {pct}%
                                                </span>
                                                <span className="text-sm text-white/80 font-medium w-8 text-right tabular-nums">
                                                    {val}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Total */}
                            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                                <p className="text-xs text-white/40 tracking-wider uppercase">
                                    Total
                                </p>
                                <p className="text-sm font-semibold text-white tabular-nums">
                                    {total}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
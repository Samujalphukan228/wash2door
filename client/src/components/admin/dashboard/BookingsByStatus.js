'use client';

export default function BookingsByStatus({ data, loading }) {
    if (loading) {
        return (
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <div className="h-4 w-32 bg-neutral-800 animate-pulse rounded mb-6" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="h-3 w-20 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-3 w-8 bg-neutral-800 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statuses = [
        { key: 'pending',    label: 'Pending'     },
        { key: 'confirmed',  label: 'Confirmed'   },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'completed',  label: 'Completed'   },
        { key: 'cancelled',  label: 'Cancelled'   }
    ];

    const total = statuses.reduce(
        (sum, s) => sum + (data?.[s.key] || 0), 0
    );

    const getBarColor = (key) => {
        if (key === 'cancelled') return 'bg-neutral-700';
        if (key === 'pending')   return 'bg-neutral-500';
        return 'bg-white';
    };

    const getDotColor = (key) => {
        if (key === 'cancelled') return 'bg-neutral-700';
        if (key === 'pending')   return 'bg-neutral-500';
        return 'bg-white';
    };

    return (
        <div className="bg-neutral-950 border border-neutral-800">
            <div className="px-6 py-4 border-b border-neutral-800">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    Bookings by Status
                </p>
            </div>
            <div className="p-6">

                {/* Stacked Bar */}
                {total > 0 && (
                    <div className="flex h-1.5 w-full mb-6 overflow-hidden">
                        {statuses.map((s) => {
                            const val = data?.[s.key] || 0;
                            const pct = (val / total) * 100;
                            return pct > 0 ? (
                                <div
                                    key={s.key}
                                    className={`h-full transition-all ${getBarColor(s.key)}`}
                                    style={{ width: `${pct}%` }}
                                    title={`${s.label}: ${val}`}
                                />
                            ) : null;
                        })}
                    </div>
                )}

                <div className="space-y-3">
                    {statuses.map((s) => {
                        const val = data?.[s.key] || 0;
                        const pct = total > 0
                            ? Math.round((val / total) * 100)
                            : 0;

                        return (
                            <div
                                key={s.key}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(s.key)}`} />
                                    <p className="text-sm text-neutral-400">
                                        {s.label}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-neutral-600">
                                        {pct}%
                                    </span>
                                    <span className="text-sm text-white font-medium w-6 text-right">
                                        {val}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        Total
                    </p>
                    <p className="text-sm font-medium text-white">
                        {total}
                    </p>
                </div>
            </div>
        </div>
    );
}
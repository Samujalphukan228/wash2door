// BookingsByStatus.jsx
'use client';

export default function BookingsByStatus({ data, loading }) {
    const statuses = [
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' }
    ];

    const total = statuses.reduce((sum, s) => sum + (data?.[s.key] || 0), 0);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-white">
                    Bookings by Status
                </h3>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                                <div className="h-4 w-8 bg-zinc-800 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : total === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-zinc-500">No bookings data</p>
                    </div>
                ) : (
                    <>
                        {/* Stacked Bar */}
                        <div className="flex h-1 bg-zinc-800 rounded-full overflow-hidden mb-6">
                            {statuses.map((s) => {
                                const val = data?.[s.key] || 0;
                                const pct = (val / total) * 100;
                                return pct > 0 ? (
                                    <div
                                        key={s.key}
                                        className="h-full bg-white"
                                        style={{ width: `${pct}%` }}
                                        title={`${s.label}: ${val}`}
                                    />
                                ) : null;
                            })}
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {statuses.map((s) => {
                                const val = data?.[s.key] || 0;
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;

                                return (
                                    <div key={s.key} className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-400">
                                            {s.label}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-zinc-500">
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

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Total</span>
                            <span className="text-sm text-white font-medium">{total}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const STATS = [
    { key: 'total', label: 'Total' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'inProgress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'todayBookings', label: 'Today' },
    { key: 'revenue', label: 'Revenue', isRevenue: true },
];

const MOBILE_DEFAULT = ['total', 'pending', 'revenue'];

function formatValue(stat, stats) {
    const v = stats[stat.key];
    if (v === undefined || v === null) return '—';
    if (stat.isRevenue) return `₹${Number(v).toLocaleString('en-IN')}`;
    return v;
}

export default function StatsBar({ stats = {}, loading }) {
    const [expanded, setExpanded] = useState(false);

    const mobileDefault = STATS.filter((s) => MOBILE_DEFAULT.includes(s.key));
    const mobileExpanded = STATS.filter((s) => !MOBILE_DEFAULT.includes(s.key));

    return (
        <>
            {/* Mobile */}
            <div className="sm:hidden space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    {mobileDefault.map((stat) => (
                        <StatCell key={stat.key} stat={stat} stats={stats} loading={loading} />
                    ))}
                </div>

                {expanded && (
                    <div className="grid grid-cols-2 gap-2">
                        {mobileExpanded.map((stat) => (
                            <StatCell key={stat.key} stat={stat} stats={stats} loading={loading} />
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                    {expanded ? 'Show less' : 'Show all stats'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Desktop */}
            <div className="hidden sm:grid grid-cols-8 gap-3">
                {STATS.map((stat) => (
                    <StatCell key={stat.key} stat={stat} stats={stats} loading={loading} desktop />
                ))}
            </div>
        </>
    );
}

function StatCell({ stat, stats, loading, desktop }) {
    return (
        <div className={`bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors ${desktop ? 'p-4' : 'p-3'}`}>
            <p className={`text-zinc-500 font-medium mb-1.5 ${desktop ? 'text-xs' : 'text-[10px]'}`}>
                {stat.label}
            </p>
            {loading ? (
                <div className={`rounded bg-zinc-800 animate-pulse ${desktop ? 'h-6 w-14' : 'h-4 w-10'}`} />
            ) : (
                <p className={`font-semibold text-white tabular-nums ${desktop ? 'text-xl' : 'text-base'}`}>
                    {formatValue(stat, stats)}
                </p>
            )}
        </div>
    );
}
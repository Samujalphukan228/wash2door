// src/components/admin/bookings/StatsBar.jsx

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const STATS = [
    { key: 'total',         label: 'Total',        color: 'text-white'       },
    { key: 'pending',       label: 'Pending',      color: 'text-yellow-400'  },
    { key: 'confirmed',     label: 'Confirmed',    color: 'text-blue-400'    },
    { key: 'inProgress',    label: 'In Progress',  color: 'text-purple-400'  },
    { key: 'completed',     label: 'Completed',    color: 'text-green-400'   },
    { key: 'cancelled',     label: 'Cancelled',    color: 'text-red-400'     },
    { key: 'todayBookings', label: 'Today',        color: 'text-cyan-400'    },
    { key: 'revenue',       label: 'Revenue',      color: 'text-white', isRevenue: true },
];

// Mobile shows first 3, expanded shows all
const MOBILE_DEFAULT = ['total', 'pending', 'revenue'];
const MOBILE_EXPANDED = ['confirmed', 'inProgress', 'completed', 'cancelled', 'todayBookings'];

function format(stat, stats) {
    const v = stats[stat.key];
    if (v === undefined || v === null) return '—';
    if (stat.isRevenue) return `₹${Number(v).toLocaleString('en-IN')}`;
    return v;
}

export default function StatsBar({ stats = {}, loading }) {
    const [expanded, setExpanded] = useState(false);

    const mobileDefaultStats = STATS.filter(s => MOBILE_DEFAULT.includes(s.key));
    const mobileExpandedStats = STATS.filter(s => MOBILE_EXPANDED.includes(s.key));

    return (
        <>
            {/* ── Mobile ── */}
            <div className="sm:hidden">
                <div className="grid grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden">
                    {mobileDefaultStats.map((stat) => (
                        <MobileStat key={stat.key} stat={stat} stats={stats} loading={loading} />
                    ))}
                </div>

                {expanded && (
                    <div className="mt-2 grid grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden">
                        {mobileExpandedStats.map((stat) => (
                            <MobileStat key={stat.key} stat={stat} stats={stats} loading={loading} />
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-[11px] text-white/30 hover:text-white/60 transition-colors"
                >
                    {expanded ? 'Less' : 'More'}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* ── Desktop ── */}
            <div className="hidden sm:grid grid-cols-8 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden">
                {STATS.map((stat) => (
                    <DesktopStat key={stat.key} stat={stat} stats={stats} loading={loading} />
                ))}
            </div>
        </>
    );
}

function MobileStat({ stat, stats, loading }) {
    return (
        <div className="bg-[#0a0a0a] px-3 py-3">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1.5">
                {stat.label}
            </p>
            {loading ? (
                <div className="h-4 w-10 rounded bg-white/[0.06] animate-pulse" />
            ) : (
                <p className={`text-base font-semibold tabular-nums ${stat.color}`}>
                    {format(stat, stats)}
                </p>
            )}
        </div>
    );
}

function DesktopStat({ stat, stats, loading }) {
    return (
        <div className="bg-[#0a0a0a] px-4 py-4 hover:bg-white/[0.02] transition-colors duration-150 group">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">
                {stat.label}
            </p>
            {loading ? (
                <div className="h-6 w-14 rounded bg-white/[0.06] animate-pulse" />
            ) : (
                <p className={`text-xl font-semibold tabular-nums leading-none ${stat.color}`}>
                    {format(stat, stats)}
                </p>
            )}
        </div>
    );
}
'use client';

import { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, Dot
} from 'recharts';

const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const value = payload[0].value || 0;
    const change = data.change || 0;

    return (
        <div className="bg-[#0a0a0a]/95 backdrop-blur-sm border border-white/[0.12] px-4 py-3 rounded-lg shadow-xl shadow-black/50">
            <p className="text-[11px] text-white/30 mb-1.5">{label}</p>
            <p className="text-base text-white font-semibold">
                ₹{value.toLocaleString('en-IN')}
            </p>
            {data.bookings > 0 && (
                <div className="mt-2 pt-2 border-t border-white/[0.08] space-y-1">
                    <p className="text-[11px] text-white/40">
                        {data.bookings} booking{data.bookings !== 1 ? 's' : ''}
                    </p>
                    {data.bookings > 0 && (
                        <p className="text-[11px] text-white/30">
                            ₹{(value / data.bookings).toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg
                        </p>
                    )}
                </div>
            )}
            {change !== 0 && (
                <div className={`mt-2 text-[10px] ${change > 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                    {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </div>
            )}
        </div>
    );
};

const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.isHighlight) return null;
    
    return (
        <g>
            <circle cx={cx} cy={cy} r={6} fill="rgba(255,255,255,0.1)" />
            <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.8)" />
        </g>
    );
};

export default function RevenueSection({ data, loading, compact }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const { chartData, stats } = useMemo(() => {
        if (!data || data.length === 0) {
            return { chartData: [], stats: {} };
        }

        // Normalize and enrich data
        const normalized = data.map((item, index) => {
            const revenue = item.revenue || item.total || item.amount || 0;
            const bookings = item.bookings || item.count || 0;
            
            return {
                label: item._id || item.date || item.label || item.period || `Day ${index + 1}`,
                revenue,
                bookings,
                avgPerBooking: bookings > 0 ? revenue / bookings : 0,
                change: 0, // Will calculate next
                isHighlight: false
            };
        });

        // Calculate period-over-period change
        for (let i = 1; i < normalized.length; i++) {
            const current = normalized[i].revenue;
            const previous = normalized[i - 1].revenue;
            if (previous > 0) {
                normalized[i].change = ((current - previous) / previous) * 100;
            }
        }

        // Calculate statistics
        const revenues = normalized.map(d => d.revenue);
        const totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
        const totalBookings = normalized.reduce((sum, d) => sum + d.bookings, 0);
        const avgRevenue = totalRevenue / normalized.length;
        const maxRevenue = Math.max(...revenues);
        const minRevenue = Math.min(...revenues.filter(r => r > 0));
        
        // Highlight peaks and troughs
        normalized.forEach((item, idx) => {
            if (item.revenue === maxRevenue || item.revenue === minRevenue) {
                item.isHighlight = true;
            }
        });

        // Calculate trend
        const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
        const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

        return {
            chartData: normalized,
            stats: {
                totalRevenue,
                totalBookings,
                avgRevenue,
                maxRevenue,
                minRevenue,
                avgPerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
                trend,
                growthRate: normalized[normalized.length - 1]?.change || 0
            }
        };
    }, [data]);

    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.05]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-white/[0.06] animate-pulse rounded-md" />
                            <div className="h-5 w-32 bg-white/[0.06] animate-pulse rounded-md" />
                        </div>
                        <div className="h-8 w-16 bg-white/[0.06] animate-pulse rounded-md" />
                    </div>
                </div>
                <div className="p-6">
                    <div className={`${compact ? 'h-48' : 'h-72'} bg-white/[0.03] animate-pulse rounded-lg`} />
                </div>
            </div>
        );
    }

    const { totalRevenue, totalBookings, avgRevenue, avgPerBooking, trend, growthRate } = stats;

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.09] transition-colors">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                                Revenue Analytics
                            </p>
                            {trend !== 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    trend > 0 
                                        ? 'bg-green-500/10 text-green-400/70' 
                                        : 'bg-red-500/10 text-red-400/70'
                                }`}>
                                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                                </span>
                            )}
                        </div>
                        {totalRevenue > 0 && (
                            <div className="mt-2 flex items-baseline gap-3">
                                <p className="text-2xl font-semibold text-white">
                                    ₹{totalRevenue.toLocaleString('en-IN')}
                                </p>
                                {!compact && avgRevenue > 0 && (
                                    <p className="text-xs text-white/30">
                                        ₹{avgRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg/day
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {!compact && (
                        <div className="text-right space-y-1">
                            {totalBookings > 0 && (
                                <>
                                    <p className="text-sm text-white/60 font-medium">
                                        {totalBookings} bookings
                                    </p>
                                    {avgPerBooking > 0 && (
                                        <p className="text-[11px] text-white/30">
                                            ₹{avgPerBooking.toLocaleString('en-IN', { maximumFractionDigits: 0 })} per booking
                                        </p>
                                    )}
                                </>
                            )}
                            {chartData.length > 0 && (
                                <p className="text-[10px] text-white/20 mt-1">
                                    {chartData.length} day period
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="p-6">
                {chartData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-72'} flex items-center justify-center`}>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3 ring-1 ring-white/[0.06]">
                                <span className="text-2xl">📊</span>
                            </div>
                            <p className="text-white/30 text-sm font-medium">No revenue data available</p>
                            <p className="text-white/20 text-xs mt-1.5">
                                Try selecting a different time period
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
                            <AreaChart 
                                data={chartData} 
                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                onMouseMove={(state) => {
                                    if (state.isTooltipActive) {
                                        setHoveredIndex(state.activeTooltipIndex);
                                    }
                                }}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.05)"
                                    vertical={false}
                                />
                                {/* Average line */}
                                {avgRevenue > 0 && (
                                    <ReferenceLine 
                                        y={avgRevenue} 
                                        stroke="rgba(255,255,255,0.15)" 
                                        strokeDasharray="5 5"
                                        label={{ 
                                            value: 'Avg', 
                                            fill: 'rgba(255,255,255,0.25)', 
                                            fontSize: 10,
                                            position: 'right'
                                        }}
                                    />
                                )}
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                                    dy={10}
                                    tickFormatter={(val) => {
                                        if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                            const date = new Date(val);
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        }
                                        return val;
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                                    tickFormatter={formatCurrency}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="rgba(255,255,255,0.6)"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                    dot={<CustomDot />}
                                    activeDot={{ 
                                        r: 5, 
                                        fill: 'rgba(255,255,255,0.9)',
                                        stroke: 'rgba(255,255,255,0.3)',
                                        strokeWidth: 2
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>

                        {/* Quick Stats */}
                        {!compact && chartData.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.05]">
                                <div className="text-center">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Peak</p>
                                    <p className="text-sm text-white/70 font-medium">
                                        {formatCurrency(stats.maxRevenue)}
                                    </p>
                                </div>
                                <div className="text-center border-x border-white/[0.05]">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Average</p>
                                    <p className="text-sm text-white/70 font-medium">
                                        {formatCurrency(stats.avgRevenue)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Growth</p>
                                    <p className={`text-sm font-medium ${
                                        growthRate > 0 ? 'text-green-400/70' : growthRate < 0 ? 'text-red-400/70' : 'text-white/50'
                                    }`}>
                                        {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
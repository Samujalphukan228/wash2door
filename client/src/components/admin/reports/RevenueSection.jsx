// src/components/admin/reports/RevenueSection.jsx
'use client';

import { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';

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
    const change = data?.change || 0;

    return (
        <div className="bg-black border border-white/[0.08] px-4 py-3 rounded-xl shadow-2xl">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                <p className="text-[10px] text-gray-500 font-medium">{label}</p>
            </div>
            <p className="text-lg font-bold text-white">
                ₹{value.toLocaleString('en-IN')}
            </p>
            {change !== 0 && !isNaN(change) && (
                <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-lg ${
                    change > 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                }`}>
                    {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(change).toFixed(1)}%
                </div>
            )}
        </div>
    );
};

const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload?.isHighlight) return null;

    return (
        <g>
            <circle cx={cx} cy={cy} r={8} fill="rgba(255,255,255,0.04)" />
            <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.2)" />
            <circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.8)" />
        </g>
    );
};

export default function RevenueSection({ data, loading, compact }) {
    const [showAvgLine, setShowAvgLine] = useState(true);
    const [selectedRange, setSelectedRange] = useState('all');

    const { chartData, stats } = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return {
                chartData: [],
                stats: {
                    totalRevenue: 0,
                    avgRevenue: 0,
                    maxRevenue: 0,
                    minRevenue: 0,
                    trend: 0,
                    growthRate: 0,
                    bestDay: null,
                    worstDay: null
                }
            };
        }

        const normalized = data.map((item, index) => {
            const revenue = item.revenue || item.total || item.amount || 0;
            return {
                label: item._id || item.date || item.label || item.period || `Day ${index + 1}`,
                revenue,
                change: 0,
                isHighlight: false,
                index
            };
        });

        for (let i = 1; i < normalized.length; i++) {
            const current = normalized[i].revenue;
            const previous = normalized[i - 1].revenue;
            if (previous > 0) {
                normalized[i].change = ((current - previous) / previous) * 100;
            }
        }

        const revenues = normalized.map(d => d.revenue);
        const totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
        const avgRevenue = normalized.length > 0 ? totalRevenue / normalized.length : 0;
        const validRevenues = revenues.filter(r => r > 0);
        const maxRevenue = validRevenues.length > 0 ? Math.max(...validRevenues) : 0;
        const minRevenue = validRevenues.length > 0 ? Math.min(...validRevenues) : 0;

        const bestDay = normalized.find(d => d.revenue === maxRevenue);

        if (maxRevenue > 0 || minRevenue > 0) {
            normalized.forEach((item) => {
                if (item.revenue === maxRevenue || (item.revenue === minRevenue && minRevenue > 0)) {
                    item.isHighlight = true;
                }
            });
        }

        let trend = 0;
        if (normalized.length >= 2) {
            const midpoint = Math.floor(normalized.length / 2);
            const firstHalf = revenues.slice(0, midpoint);
            const secondHalf = revenues.slice(midpoint);
            const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
            const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
            trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
        }

        return {
            chartData: normalized,
            stats: {
                totalRevenue,
                avgRevenue,
                maxRevenue,
                minRevenue,
                trend,
                growthRate: normalized[normalized.length - 1]?.change || 0,
                bestDay
            }
        };
    }, [data]);

    // Loading State
    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] animate-pulse" />
                        <div className="space-y-1.5">
                            <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse" />
                            <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6">
                    <div className={`${compact ? 'h-48' : 'h-64'} bg-white/[0.02] rounded-xl animate-pulse`} />
                </div>
                {!compact && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-20 bg-white/[0.02] rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const { totalRevenue, avgRevenue, trend, growthRate, maxRevenue, minRevenue, bestDay } = stats;

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-medium text-white">Revenue</p>
                            {chartData.length > 0 && (
                                <>
                                    <span className="text-[8px] text-gray-700">•</span>
                                    <span className="text-[10px] text-gray-600">
                                        {chartData.length} periods
                                    </span>
                                </>
                            )}
                        </div>
                        {totalRevenue > 0 && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                                    ₹{totalRevenue.toLocaleString('en-IN')} total
                                </p>
                                {trend !== 0 && !isNaN(trend) && (
                                    <span className={`
                                        text-[9px] font-medium px-1.5 py-0.5 rounded
                                        ${trend > 0
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                        }
                                    `}>
                                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {/* Avg Line Toggle */}
                    <button
                        onClick={() => setShowAvgLine(!showAvgLine)}
                        className={`
                            hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all
                            ${showAvgLine
                                ? 'border-white/[0.15] bg-white/[0.06] text-gray-300'
                                : 'border-white/[0.08] bg-white/[0.02] text-gray-600 hover:text-gray-400'
                            }
                        `}
                    >
                        <div className={`w-3 h-0.5 border-t border-dashed ${showAvgLine ? 'border-gray-400' : 'border-gray-600'}`} />
                        Avg
                    </button>

                    {/* Time Range */}
                    <div className="flex items-center bg-white/[0.02] rounded-lg p-0.5 border border-white/[0.06]">
                        {['7d', '30d', 'all'].map(range => (
                            <button
                                key={range}
                                onClick={() => setSelectedRange(range)}
                                className={`
                                    px-2 sm:px-2.5 py-1 text-[10px] font-medium rounded-md transition-all uppercase
                                    ${selectedRange === range
                                        ? 'bg-white/[0.08] text-white'
                                        : 'text-gray-600 hover:text-gray-400'
                                    }
                                `}
                            >
                                {range === 'all' ? 'All' : range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-3 sm:p-4 md:p-6">
                {chartData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-64'} flex flex-col items-center justify-center`}>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                        </div>
                        <p className="text-sm sm:text-base text-gray-400 mb-1">No revenue data</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 text-center">
                            Try selecting a different time range
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.08} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="rgba(255,255,255,0.03)"
                                vertical={false}
                            />
                            {showAvgLine && avgRevenue > 0 && (
                                <ReferenceLine
                                    y={avgRevenue}
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeDasharray="6 6"
                                    strokeWidth={1}
                                />
                            )}
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                                dy={12}
                                tickFormatter={(val) => {
                                    if (!val) return '';
                                    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                        const date = new Date(val);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }
                                    return String(val);
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                                tickFormatter={formatCurrency}
                                dx={-5}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                                dot={<CustomDot />}
                                activeDot={{
                                    r: 5,
                                    fill: '#ffffff',
                                    stroke: 'rgba(255,255,255,0.15)',
                                    strokeWidth: 4
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Stats Grid */}
            {!compact && chartData.length > 0 && (
                <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <MetricCard
                            icon={TrendingUp}
                            label="Peak Revenue"
                            value={formatCurrency(maxRevenue)}
                            sub={bestDay?.label}
                        />
                        <MetricCard
                            icon={BarChart3}
                            label="Daily Average"
                            value={formatCurrency(avgRevenue)}
                        />
                        <MetricCard
                            icon={TrendingDown}
                            label="Lowest"
                            value={formatCurrency(minRevenue)}
                        />
                        <MetricCard
                            icon={Zap}
                            label="Latest Growth"
                            value={`${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
                            highlight={growthRate !== 0}
                            positive={growthRate > 0}
                        />
                    </div>
                </div>
            )}

            {/* Compact Stats */}
            {compact && chartData.length > 0 && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-600">
                                Avg: <span className="text-gray-400">{formatCurrency(avgRevenue)}</span>
                            </span>
                            <span className="text-[8px] text-gray-700">•</span>
                            <span className="text-gray-600">
                                Peak: <span className="text-gray-400">{formatCurrency(maxRevenue)}</span>
                            </span>
                        </div>
                        {growthRate !== 0 && !isNaN(growthRate) && (
                            <span className={`
                                text-[9px] font-medium px-1.5 py-0.5 rounded
                                ${growthRate > 0
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-red-500/15 text-red-400'
                                }
                            `}>
                                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Insight Footer */}
            {!compact && chartData.length > 2 && (
                <div className="flex items-center gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-white/[0.06] bg-white/[0.01]">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                        {trend > 5
                            ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            : trend < -5
                                ? <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                                : <Minus className="w-3.5 h-3.5 text-gray-500" />
                        }
                    </div>
                    <p className="flex-1 text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                        {trend > 5
                            ? `Revenue trending upward with ${trend.toFixed(1)}% growth compared to the first half.`
                            : trend < -5
                                ? `Revenue shows a ${Math.abs(trend).toFixed(1)}% decline. Consider reviewing recent changes.`
                                : `Revenue remains stable with minimal variance across the period.`
                        }
                    </p>
                    <span className={`
                        shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded
                        ${trend > 5
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : trend < -5
                                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                : 'bg-white/[0.06] text-gray-500 border border-white/[0.08]'
                        }
                    `}>
                        {trend > 5 ? 'Uptrend' : trend < -5 ? 'Downtrend' : 'Stable'}
                    </span>
                </div>
            )}
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, sub, highlight, positive }) {
    return (
        <div className={`
            bg-white/[0.02] border rounded-xl p-3 sm:p-4 transition-all hover:bg-white/[0.04]
            ${highlight
                ? positive
                    ? 'border-emerald-500/20'
                    : 'border-red-500/20'
                : 'border-white/[0.06]'
            }
        `}>
            <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{label}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {value}
            </p>
            {sub && (
                <p className="text-[10px] text-gray-600 mt-0.5 truncate">{sub}</p>
            )}
        </div>
    );
}
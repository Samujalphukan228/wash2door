'use client';

import { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine
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
    const change = data?.change || 0;

    return (
        <div className="bg-[#0a0a0a] border border-white/[0.08] px-5 py-4 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <p className="text-xs text-white/40 font-medium">{label}</p>
            </div>
            <p className="text-2xl text-white font-bold">
                ₹{value.toLocaleString('en-IN')}
            </p>
            {change !== 0 && !isNaN(change) && (
                <div className={`mt-3 inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-lg ${
                    change > 0 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                }`}>
                    <span>{change > 0 ? '↑' : '↓'}</span>
                    <span>{Math.abs(change).toFixed(1)}%</span>
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
            <circle cx={cx} cy={cy} r={8} fill="rgba(255,255,255,0.06)" />
            <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.3)" />
            <circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.9)" />
        </g>
    );
};

const MetricCard = ({ label, value, subValue, trend, icon }) => (
    <div className="relative group">
        <div className="absolute inset-0 bg-white/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{icon}</span>
                {trend !== undefined && trend !== 0 && !isNaN(trend) && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        trend > 0 
                            ? 'bg-green-500/10 text-green-400/80' 
                            : 'bg-red-500/10 text-red-400/80'
                    }`}>
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                )}
            </div>
            <p className="text-lg font-semibold text-white mb-0.5">{value}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
            {subValue && (
                <p className="text-[10px] text-white/20 mt-1">{subValue}</p>
            )}
        </div>
    </div>
);

const TimeRangeButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
            active 
                ? 'bg-white/[0.08] text-white' 
                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
        }`}
    >
        {children}
    </button>
);

export default function RevenueSection({ data, loading, compact }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
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
        
        // Find best and worst days
        const bestDay = normalized.find(d => d.revenue === maxRevenue);
        const worstDay = normalized.find(d => d.revenue === minRevenue && minRevenue > 0);
        
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
                bestDay,
                worstDay
            }
        };
    }, [data]);

    if (loading) {
        return (
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Header skeleton */}
                <div className="p-6 border-b border-white/[0.04]">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3">
                            <div className="h-3 w-20 bg-white/[0.06] rounded animate-pulse" />
                            <div className="h-8 w-40 bg-white/[0.06] rounded animate-pulse" />
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 w-16 bg-white/[0.04] rounded-lg animate-pulse" />
                            <div className="h-8 w-16 bg-white/[0.04] rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
                {/* Chart skeleton */}
                <div className="p-6">
                    <div className={`${compact ? 'h-48' : 'h-64'} bg-white/[0.02] rounded-xl animate-pulse`} />
                </div>
                {/* Stats skeleton */}
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/[0.02] rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const { totalRevenue, avgRevenue, trend, growthRate, maxRevenue, minRevenue, bestDay } = stats;

    return (
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-white/[0.04]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left side - Title and main value */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                                Revenue
                            </span>
                            {chartData.length > 0 && (
                                <>
                                    <span className="text-white/10">•</span>
                                    <span className="text-[10px] text-white/25">
                                        {chartData.length} periods
                                    </span>
                                </>
                            )}
                        </div>
                        
                        {totalRevenue > 0 ? (
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    ₹{totalRevenue.toLocaleString('en-IN')}
                                </h2>
                                {trend !== 0 && !isNaN(trend) && (
                                    <div className={`flex items-center gap-1.5 text-sm font-medium ${
                                        trend > 0 ? 'text-green-400/80' : 'text-red-400/80'
                                    }`}>
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                            trend > 0 ? 'bg-green-500/15' : 'bg-red-500/15'
                                        }`}>
                                            {trend > 0 ? '↑' : '↓'}
                                        </span>
                                        {Math.abs(trend).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold text-white/20">—</h2>
                        )}
                    </div>

                    {/* Right side - Controls */}
                    <div className="flex items-center gap-3">
                        {/* Average toggle */}
                        <button
                            onClick={() => setShowAvgLine(!showAvgLine)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium transition-all border ${
                                showAvgLine 
                                    ? 'bg-white/[0.05] border-white/[0.08] text-white/70' 
                                    : 'border-transparent text-white/30 hover:text-white/50'
                            }`}
                        >
                            <div className={`w-3 h-0.5 border-t border-dashed ${
                                showAvgLine ? 'border-white/40' : 'border-white/20'
                            }`} />
                            Avg Line
                        </button>

                        {/* Time range */}
                        <div className="flex items-center bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
                            <TimeRangeButton 
                                active={selectedRange === '7d'} 
                                onClick={() => setSelectedRange('7d')}
                            >
                                7D
                            </TimeRangeButton>
                            <TimeRangeButton 
                                active={selectedRange === '30d'} 
                                onClick={() => setSelectedRange('30d')}
                            >
                                30D
                            </TimeRangeButton>
                            <TimeRangeButton 
                                active={selectedRange === 'all'} 
                                onClick={() => setSelectedRange('all')}
                            >
                                All
                            </TimeRangeButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="p-6">
                {chartData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-64'} flex flex-col items-center justify-center`}>
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                            <span className="text-3xl opacity-50">📊</span>
                        </div>
                        <p className="text-white/40 text-sm font-medium mb-1">No data available</p>
                        <p className="text-white/20 text-xs">Select a different time range</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
                        <AreaChart 
                            data={chartData} 
                            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                            onMouseMove={(state) => {
                                if (state?.isTooltipActive) {
                                    setHoveredIndex(state.activeTooltipIndex);
                                }
                            }}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.12} />
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
                                    stroke="rgba(255,255,255,0.12)" 
                                    strokeDasharray="6 6"
                                    strokeWidth={1}
                                />
                            )}
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
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
                                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                                tickFormatter={formatCurrency}
                                dx={-5}
                            />
                            <Tooltip 
                                content={<CustomTooltip />} 
                                cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} 
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                                dot={<CustomDot />}
                                activeDot={{ 
                                    r: 5, 
                                    fill: '#ffffff',
                                    stroke: 'rgba(255,255,255,0.2)',
                                    strokeWidth: 4
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Stats Grid Section */}
            {!compact && chartData.length > 0 && (
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
                        <div className="bg-[#0a0a0a]">
                            <MetricCard 
                                icon="📈"
                                label="Peak Revenue"
                                value={formatCurrency(maxRevenue)}
                                subValue={bestDay?.label}
                            />
                        </div>
                        <div className="bg-[#0a0a0a]">
                            <MetricCard 
                                icon="📊"
                                label="Daily Average"
                                value={formatCurrency(avgRevenue)}
                            />
                        </div>
                        <div className="bg-[#0a0a0a]">
                            <MetricCard 
                                icon="📉"
                                label="Lowest"
                                value={formatCurrency(minRevenue)}
                            />
                        </div>
                        <div className="bg-[#0a0a0a]">
                            <MetricCard 
                                icon="⚡"
                                label="Latest Growth"
                                value={`${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
                                trend={growthRate}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Stats */}
            {compact && chartData.length > 0 && (
                <div className="px-6 pb-4">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                            <span className="text-white/30">
                                Avg: <span className="text-white/60">{formatCurrency(avgRevenue)}</span>
                            </span>
                            <span className="text-white/30">
                                Peak: <span className="text-white/60">{formatCurrency(maxRevenue)}</span>
                            </span>
                        </div>
                        {growthRate !== 0 && !isNaN(growthRate) && (
                            <span className={`font-medium ${
                                growthRate > 0 ? 'text-green-400/70' : 'text-red-400/70'
                            }`}>
                                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer - Insight */}
            {!compact && chartData.length > 2 && (
                <div className="px-6 py-4 border-t border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                            <span className="text-sm">💡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/40 leading-relaxed">
                                {trend > 5 
                                    ? `Revenue is trending upward with ${trend.toFixed(1)}% growth compared to the first half of this period.`
                                    : trend < -5 
                                        ? `Revenue shows a ${Math.abs(trend).toFixed(1)}% decline. Consider reviewing recent changes.`
                                        : `Revenue remains stable with minimal variance across the period.`
                                }
                            </p>
                        </div>
                        <div className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                            trend > 5 
                                ? 'bg-green-500/10 text-green-400/80'
                                : trend < -5 
                                    ? 'bg-red-500/10 text-red-400/80'
                                    : 'bg-white/[0.05] text-white/40'
                        }`}>
                            {trend > 5 ? 'Uptrend' : trend < -5 ? 'Downtrend' : 'Stable'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
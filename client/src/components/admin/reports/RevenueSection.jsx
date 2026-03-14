'use client';

import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const formatCurrency = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-[#0a0a0a] border border-white/[0.12] px-4 py-3 rounded-lg shadow-xl shadow-black/50">
            <p className="text-[11px] text-white/30 mb-1">{label}</p>
            <p className="text-sm text-white/80 font-medium">
                ₹{(payload[0].value || 0).toLocaleString('en-IN')}
            </p>
            {payload[0]?.payload?.bookings && (
                <p className="text-[11px] text-white/40 mt-1">
                    {payload[0].payload.bookings} bookings
                </p>
            )}
        </div>
    );
};

export default function RevenueSection({ data, loading, compact }) {
    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.05]">
                    <div className="h-4 w-32 bg-white/[0.06] animate-pulse rounded-md" />
                </div>
                <div className="p-6">
                    <div className={`${compact ? 'h-48' : 'h-72'} bg-white/[0.03] animate-pulse rounded-lg`} />
                </div>
            </div>
        );
    }

    // Normalize data - your API returns: { _id: "2026-03-14", revenue: 7, bookings: 1 }
    const chartData = (data || []).map((item, index) => ({
        label: item._id || item.date || item.label || item.period || item.name || `Day ${index + 1}`,
        revenue: item.revenue || item.total || item.amount || 0,
        bookings: item.bookings || item.count || 0
    }));

    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                        Revenue
                    </p>
                    {totalRevenue > 0 && (
                        <p className="text-lg font-semibold text-white mt-1">
                            ₹{totalRevenue.toLocaleString('en-IN')}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    {chartData.length > 0 && (
                        <p className="text-[11px] text-white/25">
                            {chartData.length} {chartData.length === 1 ? 'day' : 'days'}
                        </p>
                    )}
                    {totalBookings > 0 && (
                        <p className="text-[11px] text-white/40">
                            {totalBookings} bookings
                        </p>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="p-6">
                {chartData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-72'} flex items-center justify-center`}>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl">📊</span>
                            </div>
                            <p className="text-white/30 text-sm">No revenue data available</p>
                            <p className="text-white/20 text-xs mt-1">
                                Try selecting a different time period
                            </p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.05)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                                dy={10}
                                tickFormatter={(val) => {
                                    // Format date strings like "2026-03-14" to "Mar 14"
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
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="rgba(255,255,255,0.6)"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
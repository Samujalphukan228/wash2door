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
        <div className="
            bg-[#0a0a0a] border border-white/[0.12]
            px-4 py-3 rounded-lg
            shadow-xl shadow-black/50
        ">
            <p className="text-[11px] text-white/30 mb-1">{label}</p>
            <p className="text-sm text-white/80 font-medium">
                ₹{(payload[0].value || 0).toLocaleString('en-IN')}
            </p>
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

    const chartData = (data || []).map(item => ({
        label: item.label || item.date || item._id || item.period || '—',
        revenue: item.revenue || item.total || item.amount || 0
    }));

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                    Revenue
                </p>
                {chartData.length > 0 && (
                    <p className="text-[11px] text-white/25">
                        {chartData.length} data points
                    </p>
                )}
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
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
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
                                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                                dy={10}
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
                                strokeWidth={1.5}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
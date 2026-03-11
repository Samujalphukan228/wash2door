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
        <div className="bg-neutral-900 border border-neutral-700 px-4 py-3">
            <p className="text-xs text-neutral-400 mb-1">{label}</p>
            <p className="text-sm text-white font-medium">
                ₹{(payload[0].value || 0).toLocaleString('en-IN')}
            </p>
        </div>
    );
};

export default function RevenueSection({ data, loading, compact }) {
    if (loading) {
        return (
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="px-6 py-4 border-b border-neutral-800">
                    <div className="h-4 w-32 bg-neutral-800 animate-pulse rounded" />
                </div>
                <div className="p-6">
                    <div className={`${compact ? 'h-48' : 'h-72'} bg-neutral-900 animate-pulse`} />
                </div>
            </div>
        );
    }

    const chartData = (data || []).map(item => ({
        label: item.label || item.date || item._id || item.period || '—',
        revenue: item.revenue || item.total || item.amount || 0
    }));

    return (
        <div className="bg-neutral-950 border border-neutral-800">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    Revenue
                </p>
                {chartData.length > 0 && (
                    <p className="text-xs text-neutral-500">
                        {chartData.length} data points
                    </p>
                )}
            </div>
            <div className="p-6">
                {chartData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-72'} flex items-center justify-center`}>
                        <p className="text-neutral-600 text-sm">No revenue data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#262626"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#525252', fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#525252', fontSize: 11 }}
                                tickFormatter={formatCurrency}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#ffffff"
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
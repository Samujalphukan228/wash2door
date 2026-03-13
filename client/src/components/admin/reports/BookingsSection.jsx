'use client';

import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
    pending: 'rgba(255,255,255,0.25)',
    confirmed: 'rgba(255,255,255,0.45)',
    'in-progress': 'rgba(255,255,255,0.65)',
    completed: 'rgba(255,255,255,0.85)',
    cancelled: 'rgba(255,255,255,0.15)'
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
                {payload[0].value} bookings
            </p>
        </div>
    );
};

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="
            bg-[#0a0a0a] border border-white/[0.12]
            px-4 py-3 rounded-lg
            shadow-xl shadow-black/50
        ">
            <p className="text-[11px] text-white/30 capitalize mb-1">
                {payload[0].name}
            </p>
            <p className="text-sm text-white/80 font-medium">
                {payload[0].value} bookings
            </p>
        </div>
    );
};

export default function BookingsSection({
    data,
    statusBreakdown,
    loading,
    compact
}) {
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
        bookings: item.bookings || item.count || item.total || 0
    }));

    const pieData = Object.entries(statusBreakdown || {}).map(([status, count]) => ({
        name: status,
        value: count
    }));

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                    Bookings
                </p>
                {chartData.length > 0 && (
                    <p className="text-[11px] text-white/25">
                        {chartData.length} data points
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {chartData.length === 0 && pieData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-72'} flex items-center justify-center`}>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl">📅</span>
                            </div>
                            <p className="text-white/30 text-sm">No booking data available</p>
                        </div>
                    </div>
                ) : (
                    <div className={compact ? '' : 'space-y-8'}>

                        {/* Bar Chart */}
                        {chartData.length > 0 && (
                            <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
                                <BarChart data={chartData}>
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
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="bookings"
                                        fill="rgba(255,255,255,0.7)"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {/* Pie Chart - Status Breakdown */}
                        {!compact && pieData.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/[0.05]">
                                <div>
                                    <p className="text-[10px] text-white/25 tracking-widest uppercase mb-4 font-medium">
                                        By Status
                                    </p>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                dataKey="value"
                                                stroke="#0a0a0a"
                                                strokeWidth={2}
                                            >
                                                {pieData.map((entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={STATUS_COLORS[entry.name] || 'rgba(255,255,255,0.25)'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] text-white/25 tracking-widest uppercase mb-4 font-medium">
                                        Legend
                                    </p>
                                    <div className="space-y-3">
                                        {pieData.map((entry) => (
                                            <div
                                                key={entry.name}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-sm"
                                                        style={{
                                                            backgroundColor: STATUS_COLORS[entry.name] || 'rgba(255,255,255,0.25)'
                                                        }}
                                                    />
                                                    <span className="text-sm text-white/50 capitalize">
                                                        {entry.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-white/30">
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
'use client';

import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
    pending: '#525252',
    confirmed: '#a3a3a3',
    'in-progress': '#d4d4d4',
    completed: '#ffffff',
    cancelled: '#404040'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-neutral-900 border border-neutral-700 px-4 py-3">
            <p className="text-xs text-neutral-400 mb-1">{label}</p>
            <p className="text-sm text-white font-medium">
                {payload[0].value} bookings
            </p>
        </div>
    );
};

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-neutral-900 border border-neutral-700 px-4 py-3">
            <p className="text-xs text-neutral-400 capitalize mb-1">
                {payload[0].name}
            </p>
            <p className="text-sm text-white font-medium">
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
        bookings: item.bookings || item.count || item.total || 0
    }));

    const pieData = Object.entries(statusBreakdown || {}).map(([status, count]) => ({
        name: status,
        value: count
    }));

    return (
        <div className="bg-neutral-950 border border-neutral-800">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    Bookings
                </p>
                {chartData.length > 0 && (
                    <p className="text-xs text-neutral-500">
                        {chartData.length} data points
                    </p>
                )}
            </div>
            <div className="p-6">
                {chartData.length === 0 && pieData.length === 0 ? (
                    <div className={`${compact ? 'h-48' : 'h-72'} flex items-center justify-center`}>
                        <p className="text-neutral-600 text-sm">No booking data available</p>
                    </div>
                ) : (
                    <div className={compact ? '' : 'space-y-8'}>

                        {/* Bar Chart */}
                        {chartData.length > 0 && (
                            <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
                                <BarChart data={chartData}>
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
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="bookings"
                                        fill="#ffffff"
                                        radius={[2, 2, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {/* Pie Chart - Status Breakdown (only on full view) */}
                        {!compact && pieData.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-neutral-800">
                                <div>
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-4">
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
                                                        fill={STATUS_COLORS[entry.name] || '#525252'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-col justify-center">
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-4">
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
                                                            backgroundColor: STATUS_COLORS[entry.name] || '#525252'
                                                        }}
                                                    />
                                                    <span className="text-sm text-neutral-300 capitalize">
                                                        {entry.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-neutral-500">
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
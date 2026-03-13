// RevenueChart.jsx - Today's Focus, Clean Design
'use client';

import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell
} from 'recharts';
import { TrendingUp, ArrowUpRight, BarChart3, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const bookings = payload[0]?.value || 0;
        const revenue = payload[1]?.value || payload[0]?.payload?.revenue || 0;
        const avgPerBooking = bookings > 0 ? Math.round(revenue / bookings) : 0;

        return (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 shadow-2xl backdrop-blur-sm">
                <p className="text-sm font-semibold text-white mb-3 capitalize">
                    {label}
                </p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
                            <span className="text-xs text-zinc-400">Bookings</span>
                        </div>
                        <span className="text-sm font-bold text-white tabular-nums">
                            {bookings}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
                            <span className="text-xs text-zinc-400">Revenue</span>
                        </div>
                        <span className="text-sm font-bold text-white tabular-nums">
                            ₹{revenue.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Avg per booking</span>
                        <span className="text-white font-semibold">
                            ₹{avgPerBooking.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function RevenueChart({ data, loading }) {
    const [viewMode, setViewMode] = useState('bookings');

    const chartData = data?.map((item) => ({
        name: item._id,
        bookings: item.count,
        revenue: item.revenue,
        avgPerBooking: item.count > 0 ? Math.round(item.revenue / item.count) : 0
    })) || [];

    // Today's stats
    const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const avgRevenue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const sortedData = [...chartData].sort((a, b) => b.revenue - a.revenue);
    const topCategory = sortedData.length > 0 ? sortedData[0] : null;

    const maxValue = viewMode === 'bookings'
        ? Math.max(...chartData.map(d => d.bookings), 1)
        : Math.max(...chartData.map(d => d.revenue), 1);

    const todayFormatted = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <h3 className="text-base sm:text-sm font-semibold text-white">
                                Today's Performance
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-500">
                            Live metrics for {todayFormatted}
                        </p>
                    </div>

                    {/* View Toggle */}
                    {!loading && chartData.length > 0 && (
                        <div className="inline-flex items-center bg-zinc-800/50 rounded-lg p-0.5 self-start">
                            <button
                                onClick={() => setViewMode('bookings')}
                                className={`
                                    px-3 py-1.5 text-xs font-medium rounded-md transition-all
                                    ${viewMode === 'bookings'
                                        ? 'bg-white text-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }
                                `}
                            >
                                Bookings
                            </button>
                            <button
                                onClick={() => setViewMode('revenue')}
                                className={`
                                    px-3 py-1.5 text-xs font-medium rounded-md transition-all
                                    ${viewMode === 'revenue'
                                        ? 'bg-white text-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }
                                `}
                            >
                                Revenue
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                {!loading && chartData.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-zinc-800/30 rounded-lg p-3">
                            <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Today's Bookings</p>
                            <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                                {totalBookings}
                            </p>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-3">
                            <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Today's Revenue</p>
                            <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                                ₹{(totalRevenue / 1000).toFixed(1)}k
                            </p>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-3 col-span-2 sm:col-span-1">
                            <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Avg / Booking</p>
                            <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                                ₹{avgRevenue.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart Area */}
            <div className="p-3 sm:p-5">
                {loading ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-zinc-800/30 rounded animate-pulse" />
                            ))}
                        </div>
                        <div className="h-48 sm:h-64 bg-zinc-800/30 rounded animate-pulse" />
                        <div className="flex justify-center gap-4">
                            <div className="h-3 w-20 bg-zinc-800/30 rounded animate-pulse" />
                            <div className="h-3 w-20 bg-zinc-800/30 rounded animate-pulse" />
                        </div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-64 sm:h-80 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                            <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600" />
                        </div>
                        <p className="text-sm sm:text-base text-zinc-400 font-medium mb-1">
                            No bookings today
                        </p>
                        <p className="text-xs text-zinc-600 text-center max-w-[220px]">
                            Today's data will appear here as bookings come in
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chart */}
                        <div className="w-full -mx-3 sm:mx-0 mb-4">
                            <div className="overflow-x-auto px-3 sm:px-0">
                                <div className="min-w-[400px] sm:min-w-0">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                            barCategoryGap="15%"
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#27272a"
                                                vertical={false}
                                                strokeOpacity={0.3}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#71717a' }}
                                                axisLine={{ stroke: '#27272a' }}
                                                tickLine={false}
                                                tickFormatter={(val) => {
                                                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                                                        return val.substring(0, 3).toUpperCase();
                                                    }
                                                    return val.charAt(0).toUpperCase() + val.slice(1);
                                                }}
                                                height={35}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#71717a' }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={45}
                                                tickFormatter={(val) => {
                                                    if (viewMode === 'revenue') {
                                                        return `₹${(val / 1000).toFixed(0)}k`;
                                                    }
                                                    return val;
                                                }}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                                cursor={{
                                                    fill: '#18181b',
                                                    opacity: 0.15,
                                                    radius: 6
                                                }}
                                            />

                                            {viewMode === 'bookings' ? (
                                                <Bar
                                                    dataKey="bookings"
                                                    radius={[6, 6, 0, 0]}
                                                    maxBarSize={60}
                                                    animationDuration={600}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#ffffff"
                                                            fillOpacity={0.7 + (entry.bookings / maxValue) * 0.3}
                                                        />
                                                    ))}
                                                </Bar>
                                            ) : (
                                                <Bar
                                                    dataKey="revenue"
                                                    radius={[6, 6, 0, 0]}
                                                    maxBarSize={60}
                                                    animationDuration={600}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#ffffff"
                                                            fillOpacity={0.5 + (entry.revenue / maxValue) * 0.5}
                                                        />
                                                    ))}
                                                </Bar>
                                            )}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pb-4 mb-4 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-white" />
                                <span className="text-xs text-zinc-400">Bookings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-zinc-500" />
                                <span className="text-xs text-zinc-400">Revenue</span>
                            </div>
                        </div>

                        {/* Top Category Today */}
                        {topCategory && (
                            <div className="bg-zinc-800/30 rounded-lg p-4 mb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Top Category Today</p>
                                        <p className="text-base sm:text-lg font-semibold text-white capitalize">
                                            {topCategory.name}
                                        </p>
                                    </div>
                                    <div className="bg-white/10 rounded-full p-2">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 mb-0.5">Bookings</p>
                                        <p className="text-sm font-bold text-white tabular-nums">
                                            {topCategory.bookings}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 mb-0.5">Revenue</p>
                                        <p className="text-sm font-bold text-white tabular-nums">
                                            ₹{(topCategory.revenue / 1000).toFixed(1)}k
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 mb-0.5">Avg</p>
                                        <p className="text-sm font-bold text-white tabular-nums">
                                            ₹{topCategory.avgPerBooking.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Category List */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-zinc-500 mb-3">
                                All Categories — Today
                            </p>
                            {sortedData.map((category, index) => {
                                const bookingPercent = totalBookings > 0
                                    ? Math.round((category.bookings / totalBookings) * 100)
                                    : 0;
                                const revenuePercent = totalRevenue > 0
                                    ? Math.round((category.revenue / totalRevenue) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={category.name}
                                        className="bg-zinc-800/20 hover:bg-zinc-800/40 rounded-lg p-3 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-zinc-600">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-white capitalize">
                                                    {category.name}
                                                </span>
                                            </div>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-zinc-500">Bookings</span>
                                                    <span className="text-xs text-zinc-600">{bookingPercent}%</span>
                                                </div>
                                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-white rounded-full transition-all duration-500"
                                                        style={{ width: `${bookingPercent}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs font-semibold text-white mt-1 tabular-nums">
                                                    {category.bookings}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-zinc-500">Revenue</span>
                                                    <span className="text-xs text-zinc-600">{revenuePercent}%</span>
                                                </div>
                                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${revenuePercent}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs font-semibold text-white mt-1 tabular-nums">
                                                    ₹{(category.revenue / 1000).toFixed(1)}k
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Today's Insight */}
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <div className="flex items-start gap-3 bg-zinc-800/20 rounded-lg p-3">
                                <div className="bg-white/10 rounded-full p-2 mt-0.5">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-white mb-1">Today's Summary</p>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        {totalBookings > 0 ? (
                                            <>
                                                You've received{' '}
                                                <span className="text-white font-medium">{totalBookings} bookings</span>
                                                {' '}today, generating{' '}
                                                <span className="text-white font-medium">
                                                    ₹{totalRevenue.toLocaleString('en-IN')}
                                                </span>
                                                {' '}in revenue.
                                                {topCategory && (
                                                    <>
                                                        {' '}<span className="text-white font-medium capitalize">{topCategory.name}</span>
                                                        {' '}leads with {topCategory.bookings} bookings.
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            'No bookings received today yet. Data will update as bookings come in.'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
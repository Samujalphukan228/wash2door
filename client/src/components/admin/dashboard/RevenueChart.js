// RevenueChart.jsx
'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 shadow-2xl">
                <p className="text-xs font-semibold text-white mb-2.5 capitalize">
                    {label}
                </p>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
                            <span className="text-xs text-zinc-400">Bookings</span>
                        </div>
                        <span className="text-xs font-semibold text-white tabular-nums">
                            {payload[0].value}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
                            <span className="text-xs text-zinc-400">Revenue</span>
                        </div>
                        <span className="text-xs font-semibold text-white tabular-nums">
                            ₹{payload[1]?.value?.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const CustomLegend = () => {
    return (
        <div className="flex items-center justify-center gap-6 pt-4 mt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-white" />
                <span className="text-xs text-zinc-400">Bookings</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-zinc-500" />
                <span className="text-xs text-zinc-400">Revenue</span>
            </div>
        </div>
    );
};

export default function RevenueChart({ data, loading }) {
    const chartData = data?.map((item) => ({
        name: item._id,
        bookings: item.count,
        revenue: item.revenue
    })) || [];

    // Calculate max values for better scaling
    const maxBookings = Math.max(...chartData.map(d => d.bookings), 0);
    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 0);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Bookings by Category
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                            Revenue and booking distribution across categories
                        </p>
                    </div>
                    {!loading && chartData.length > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">Total</p>
                            <p className="text-sm font-semibold text-white">
                                {chartData.reduce((sum, item) => sum + item.bookings, 0)} bookings
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="p-4 sm:p-5">
                {loading ? (
                    <div className="space-y-3">
                        <div className="h-64 bg-zinc-800/30 rounded animate-pulse" />
                        <div className="flex justify-center gap-6">
                            <div className="h-4 w-20 bg-zinc-800/30 rounded animate-pulse" />
                            <div className="h-4 w-20 bg-zinc-800/30 rounded animate-pulse" />
                        </div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center">
                        <svg
                            className="w-12 h-12 text-zinc-700 mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="text-sm text-zinc-500 font-medium">No data available</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            Chart will appear when bookings are made
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[500px]">
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart 
                                        data={chartData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        barGap={8}
                                        barCategoryGap="20%"
                                    >
                                        <CartesianGrid 
                                            strokeDasharray="3 3" 
                                            stroke="#27272a" 
                                            vertical={false}
                                            strokeOpacity={0.5}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ 
                                                fontSize: 11, 
                                                fill: '#71717a',
                                                fontFamily: 'system-ui, -apple-system, sans-serif'
                                            }}
                                            axisLine={{ stroke: '#27272a' }}
                                            tickLine={false}
                                            tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                                            height={40}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            orientation="left"
                                            tick={{ 
                                                fontSize: 11, 
                                                fill: '#71717a',
                                                fontFamily: 'system-ui, -apple-system, sans-serif'
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={40}
                                            domain={[0, Math.ceil(maxBookings * 1.1)]}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tick={{ 
                                                fontSize: 11, 
                                                fill: '#71717a',
                                                fontFamily: 'system-ui, -apple-system, sans-serif'
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={50}
                                            domain={[0, Math.ceil(maxRevenue * 1.1)]}
                                            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip 
                                            content={<CustomTooltip />} 
                                            cursor={{ 
                                                fill: '#18181b',
                                                opacity: 0.2,
                                                radius: 4
                                            }} 
                                        />
                                        <Bar 
                                            yAxisId="left"
                                            dataKey="bookings" 
                                            fill="#ffffff" 
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={50}
                                            animationDuration={800}
                                        />
                                        <Bar 
                                            yAxisId="right"
                                            dataKey="revenue" 
                                            fill="#52525b" 
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={50}
                                            animationDuration={800}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <CustomLegend />

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Total Bookings</p>
                                <p className="text-lg font-semibold text-white tabular-nums">
                                    {chartData.reduce((sum, item) => sum + item.bookings, 0)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
                                <p className="text-lg font-semibold text-white tabular-nums">
                                    ₹{chartData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        {/* Top Category */}
                        {chartData.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Top Category</p>
                                        <p className="text-sm font-medium text-white capitalize">
                                            {chartData[0].name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 mb-1">Performance</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                {chartData[0].bookings} bookings
                                            </span>
                                            <span className="text-xs text-zinc-600">•</span>
                                            <span className="text-sm font-medium text-white">
                                                ₹{chartData[0].revenue.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
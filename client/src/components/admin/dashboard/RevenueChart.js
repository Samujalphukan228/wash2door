// RevenueChart.jsx
'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-lg">
                <p className="text-xs font-medium text-white mb-2 capitalize">
                    {label}
                </p>
                <div className="space-y-1 text-xs">
                    <div className="text-zinc-400">
                        Bookings: <span className="text-white font-medium">{payload[0].value}</span>
                    </div>
                    <div className="text-zinc-400">
                        Revenue: <span className="text-white font-medium">₹{payload[1]?.value?.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function RevenueChart({ data, loading }) {
    const chartData = data?.map((item) => ({
        name: item._id,
        bookings: item.count,
        revenue: item.revenue
    })) || [];

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-white">
                    Bookings by Category
                </h3>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="h-64 bg-zinc-800/50 rounded animate-pulse" />
                ) : chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-zinc-500">No data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#71717a' }}
                                axisLine={{ stroke: '#27272a' }}
                                tickLine={false}
                                tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#71717a' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#18181b' }} />
                            <Bar dataKey="bookings" fill="#ffffff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revenue" fill="#52525b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white text-black px-3 py-2 text-xs border border-neutral-200">
                <p className="capitalize mb-1 font-medium">{label}</p>
                <p>{payload[0].value} bookings</p>
                <p>₹{payload[1]?.value?.toLocaleString('en-IN') || 0} revenue</p>
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
        <div className="bg-neutral-950 border border-neutral-800">
            <div className="px-6 py-4 border-b border-neutral-800">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    Bookings by Category
                </p>
            </div>
            <div className="p-6">
                {loading ? (
                    <div className="h-48 bg-neutral-900 animate-pulse rounded" />
                ) : chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center">
                        <p className="text-sm text-neutral-500">
                            No data available
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barGap={4}>
                            <XAxis
                                dataKey="name"
                                tick={{
                                    fontSize: 11,
                                    fill: '#525252',
                                    fontFamily: 'Inter'
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) =>
                                    val.charAt(0).toUpperCase() + val.slice(1)
                                }
                            />
                            <YAxis
                                tick={{
                                    fontSize: 11,
                                    fill: '#525252',
                                    fontFamily: 'Inter'
                                }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: '#171717' }}
                            />
                            <Bar
                                dataKey="bookings"
                                fill="#ffffff"
                                radius={[2, 2, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#404040"
                                radius={[2, 2, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {/* Legend */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-1.5 bg-white rounded-full" />
                        <span className="text-xs text-neutral-500">
                            Bookings
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-1.5 bg-neutral-600 rounded-full" />
                        <span className="text-xs text-neutral-500">
                            Revenue (₹)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
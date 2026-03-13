// RevenueChart.jsx
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
            <div className="
                bg-white/95 backdrop-blur-sm text-black 
                px-3 py-2.5 text-xs 
                border border-black/10
                rounded-lg shadow-xl
            ">
                <p className="capitalize mb-1.5 font-semibold text-sm">{label}</p>
                <div className="space-y-0.5">
                    <p className="text-black/70">
                        <span className="font-medium">{payload[0].value}</span> bookings
                    </p>
                    <p className="text-black/70">
                        ₹<span className="font-medium">{payload[1]?.value?.toLocaleString('en-IN') || 0}</span> revenue
                    </p>
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
        <div className="
            relative overflow-hidden rounded-lg
            border border-white/[0.08]
            bg-gradient-to-br from-white/[0.03] to-transparent
        ">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent)]" />

            <div className="relative">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08]">
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 tracking-[0.15em] uppercase">
                        Bookings by Category
                    </p>
                </div>
                
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="h-48 sm:h-56 bg-white/[0.04] animate-pulse rounded-lg" />
                    ) : chartData.length === 0 ? (
                        <div className="h-48 sm:h-56 flex items-center justify-center rounded-lg border border-dashed border-white/[0.08]">
                            <p className="text-sm text-white/30">
                                No data available
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={224}>
                            <BarChart data={chartData} barGap={6}>
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 11,
                                        fill: 'rgba(255,255,255,0.3)',
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
                                        fill: 'rgba(255,255,255,0.3)',
                                        fontFamily: 'Inter'
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={35}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                />
                                <Bar
                                    dataKey="bookings"
                                    fill="#ffffff"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="rgba(255,255,255,0.25)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* Legend */}
                    {!loading && chartData.length > 0 && (
                        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/[0.08]">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1.5 bg-white rounded-full" />
                                <span className="text-xs text-white/40">
                                    Bookings
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1.5 bg-white/25 rounded-full" />
                                <span className="text-xs text-white/40">
                                    Revenue (₹)
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
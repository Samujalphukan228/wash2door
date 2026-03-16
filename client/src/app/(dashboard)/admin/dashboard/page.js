// src/app/admin/page.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import useDashboard from '@/hooks/useDashboard';
import { useSocket } from '@/context/SocketContext';
import Link from 'next/link';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Users,
    CalendarDays,
    IndianRupee,
    Wrench,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Clock,
    TrendingUp,
    BarChart3,
    Zap,
    Activity,
    Star,
    CheckCircle2,
    AlertCircle,
    Timer,
    XCircle,
    Sparkles
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Filler
);

export default function DashboardPage() {
    const { stats, loading, refetch } = useDashboard();
    const { socket } = useSocket();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => refetch();
        socket.on('new_booking', handleUpdate);
        socket.on('booking_status_updated', handleUpdate);
        return () => {
            socket.off('new_booking', handleUpdate);
            socket.off('booking_status_updated', handleUpdate);
        };
    }, [socket, refetch]);

    // Computed values
    const bookingStats = useMemo(() => {
        const byStatus = stats?.bookings?.byStatus || {};
        return {
            pending: byStatus.pending || 0,
            confirmed: byStatus.confirmed || 0,
            inProgress: byStatus.inProgress || 0,
            completed: byStatus.completed || 0,
            cancelled: byStatus.cancelled || 0,
            total: stats?.bookings?.total || 0
        };
    }, [stats]);

    const categoryData = useMemo(() => {
        if (!stats?.bookingsByCategory) return [];
        return stats.bookingsByCategory
            .map(item => ({
                name: item._id,
                bookings: item.count,
                revenue: item.revenue
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [stats]);

    const totals = useMemo(() => {
        const totalBookings = categoryData.reduce((sum, item) => sum + item.bookings, 0);
        const totalRevenue = categoryData.reduce((sum, item) => sum + item.revenue, 0);
        const avgPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
        return { totalBookings, totalRevenue, avgPerBooking };
    }, [categoryData]);

    // Weekly revenue data from API (if available)
    const weeklyRevenueData = useMemo(() => {
        // Check if you have weekly data in your stats
        // Adjust this based on your actual API response structure
        if (stats?.weeklyRevenue) {
            return stats.weeklyRevenue;
        }
        if (stats?.revenueByDay) {
            return stats.revenueByDay;
        }
        // If no weekly data, return null
        return null;
    }, [stats]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

                    {/* Header */}
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                                {greeting}
                            </p>
                            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                                Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                        <StatCard
                            icon={IndianRupee}
                            label="Revenue"
                            value={`₹${(stats?.revenue?.total || 0).toLocaleString('en-IN')}`}
                            sub={totals.avgPerBooking > 0 ? `₹${totals.avgPerBooking.toLocaleString('en-IN')} avg` : 'No bookings'}
                        />
                        <StatCard
                            icon={CalendarDays}
                            label="Bookings"
                            value={bookingStats.total}
                            sub={`${bookingStats.completed} completed`}
                            highlight={bookingStats.pending > 0}
                            badge={bookingStats.pending > 0 ? `${bookingStats.pending} pending` : null}
                        />
                        <StatCard
                            icon={Users}
                            label="Users"
                            value={stats?.users?.total || 0}
                            sub="Registered users"
                        />
                        <StatCard
                            icon={Wrench}
                            label="Services"
                            value={stats?.services?.total || 0}
                            sub="Active services"
                        />
                    </div>

                    {/* Revenue Chart - Using Category Data */}
                    <RevenueChart
                        categoryData={categoryData}
                        totals={totals}
                        weeklyData={weeklyRevenueData}
                    />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

                        {/* Recent Bookings - Takes 2 columns */}
                        <div className="lg:col-span-2">
                            <RecentBookings bookings={stats?.recentBookings} />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3 sm:space-y-4">
                            {/* Booking Status */}
                            <BookingStatus data={bookingStats} />

                            {/* Popular Services */}
                            <PopularServices services={stats?.popularServices} />
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

// === STAT CARD ===
function StatCard({ icon: Icon, label, value, sub, highlight, badge }) {
    return (
        <div className={`
            relative overflow-hidden
            bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all
            hover:bg-white/[0.04] hover:border-white/[0.12]
            ${highlight ? 'border-yellow-500/30 bg-yellow-500/[0.02]' : 'border-white/[0.08]'}
        `}>
            {highlight && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            )}

            <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</span>
                    </div>
                </div>

                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                    {value}
                </p>

                <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">{sub}</p>
                    {badge && (
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// === REVENUE CHART ===
function RevenueChart({ categoryData, totals, weeklyData }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [viewMode, setViewMode] = useState('revenue');

    // Use category data for the chart
    const chartLabels = categoryData.map(d => d.name);
    const chartValues = categoryData.map(d => viewMode === 'revenue' ? d.revenue : d.bookings);

    const maxValue = Math.max(...chartValues, 1);
    const minValue = Math.min(...chartValues, 0);
    const totalValue = chartValues.reduce((a, b) => a + b, 0);
    const avgValue = chartValues.length > 0 ? totalValue / chartValues.length : 0;

    const topCategory = categoryData[0];
    const bestIndex = chartValues.indexOf(Math.max(...chartValues));

    const chartData = useMemo(() => ({
        labels: chartLabels,
        datasets: [{
            data: chartValues,
            borderColor: '#ffffff',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 180);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#000',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
        }]
    }), [chartLabels, chartValues]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        animation: {
            duration: 500,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#000',
                titleColor: '#888',
                bodyColor: '#fff',
                titleFont: { size: 10, weight: '500' },
                bodyFont: { size: 13, weight: '600' },
                padding: { x: 12, y: 10 },
                cornerRadius: 10,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    title: (items) => {
                        const idx = items[0]?.dataIndex;
                        return categoryData[idx]?.name || '';
                    },
                    label: (ctx) => viewMode === 'revenue'
                        ? `₹${ctx.parsed.y.toLocaleString('en-IN')}`
                        : `${ctx.parsed.y} bookings`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: '#444',
                    font: { size: 10, weight: '500' },
                    padding: 8,
                    maxRotation: 45,
                    callback: function (value, index) {
                        const label = chartLabels[index] || '';
                        return label.length > 8 ? label.substring(0, 8) + '...' : label;
                    }
                }
            },
            y: {
                display: false,
                min: minValue * 0.8,
                max: maxValue * 1.2
            }
        },
        onHover: (event, elements) => {
            setActiveIndex(elements.length > 0 ? elements[0].index : null);
        }
    }), [maxValue, minValue, chartLabels, categoryData, viewMode]);

    const displayValue = activeIndex !== null
        ? chartValues[activeIndex]
        : (viewMode === 'revenue' ? totals.totalRevenue : totals.totalBookings);
    const displayLabel = activeIndex !== null
        ? categoryData[activeIndex]?.name
        : 'Total';

    // Empty state
    if (!categoryData || categoryData.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 mb-1">No revenue data</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 text-center">
                        Start receiving bookings to see analytics
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="p-3 sm:p-5">
                {/* Title Row */}
                <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider capitalize">
                                {displayLabel}
                            </p>
                            {topCategory && activeIndex === null && (
                                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                                    {categoryData.length} categories
                                </span>
                            )}
                        </div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                            {viewMode === 'revenue'
                                ? `₹${displayValue.toLocaleString('en-IN')}`
                                : displayValue
                            }
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="inline-flex items-center bg-white/[0.04] rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode('revenue')}
                            className={`
                                px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all
                                ${viewMode === 'revenue'
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:text-white'
                                }
                            `}
                        >
                            Revenue
                        </button>
                        <button
                            onClick={() => setViewMode('bookings')}
                            className={`
                                px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all
                                ${viewMode === 'bookings'
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:text-white'
                                }
                            `}
                        >
                            Bookings
                        </button>
                    </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                    <MiniStat
                        label="Total"
                        value={viewMode === 'revenue'
                            ? `₹${(totals.totalRevenue / 1000).toFixed(1)}k`
                            : totals.totalBookings
                        }
                    />
                    <MiniStat
                        label="Avg"
                        value={viewMode === 'revenue'
                            ? `₹${Math.round(avgValue).toLocaleString('en-IN')}`
                            : Math.round(avgValue)
                        }
                    />
                    <MiniStat
                        label="Best"
                        value={viewMode === 'revenue'
                            ? `₹${Math.max(...chartValues).toLocaleString('en-IN')}`
                            : Math.max(...chartValues)
                        }
                        highlight="up"
                    />
                    <MiniStat
                        label="Low"
                        value={viewMode === 'revenue'
                            ? `₹${Math.min(...chartValues).toLocaleString('en-IN')}`
                            : Math.min(...chartValues)
                        }
                        highlight="down"
                    />
                </div>

                {/* Chart */}
                <div className="h-32 sm:h-40 lg:h-48 -mx-1 sm:-mx-2">
                    <Line data={chartData} options={options} />
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="border-t border-white/[0.06]">
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 active:bg-white/[0.02] transition-colors"
                >
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">
                        Category Breakdown
                    </span>
                    <ChevronRight className={`
                        w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 
                        transition-transform duration-200
                        ${showBreakdown ? 'rotate-90' : ''}
                    `} />
                </button>

                {/* Collapsible Content */}
                <div className={`
                    overflow-hidden transition-all duration-300
                    ${showBreakdown ? 'max-h-[600px]' : 'max-h-0'}
                `}>
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1">
                        {categoryData.map((item, i) => {
                            const val = viewMode === 'revenue' ? item.revenue : item.bookings;
                            const percentage = maxValue > 0 ? (val / maxValue) * 100 : 0;
                            const share = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
                            const isBest = i === bestIndex;
                            const isTop = i === 0;

                            return (
                                <div
                                    key={item.name}
                                    className={`
                                        flex items-center gap-2 sm:gap-3 
                                        p-2 sm:p-2.5 rounded-lg sm:rounded-xl 
                                        transition-all
                                        ${isTop ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                                        ${activeIndex === i ? 'bg-white/[0.08]' : ''}
                                    `}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {/* Rank & Name */}
                                    <div className="flex items-center gap-1.5 w-24 sm:w-32 shrink-0">
                                        <span className={`
                                            text-[8px] sm:text-[9px] font-mono w-4 shrink-0
                                            ${isTop ? 'text-emerald-400' : 'text-gray-600'}
                                        `}>
                                            #{i + 1}
                                        </span>
                                        <div className={`
                                            w-1.5 h-1.5 rounded-full shrink-0
                                            ${isTop ? 'bg-emerald-500' :
                                                isBest ? 'bg-white' : 'bg-white/20'}
                                        `} />
                                        <span className={`
                                            text-[10px] sm:text-xs font-medium truncate capitalize
                                            ${isTop ? 'text-white' : 'text-gray-400'}
                                        `}>
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Bar */}
                                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                        <div
                                            className={`
                                                h-full rounded-full transition-all duration-500
                                                ${isTop ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                                    isBest ? 'bg-white' : 'bg-white/25'}
                                            `}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Value */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[9px] sm:text-[10px] text-gray-600 tabular-nums">
                                            {share}%
                                        </span>
                                        <span className={`
                                            text-[10px] sm:text-xs font-semibold tabular-nums
                                            ${isTop ? 'text-white' : 'text-gray-400'}
                                        `}>
                                            {viewMode === 'revenue'
                                                ? `₹${val.toLocaleString('en-IN')}`
                                                : val
                                            }
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/[0.02] border-t border-white/[0.05]">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                    <TrendingUp className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                        {topCategory
                            ? `${topCategory.name} leads with ₹${topCategory.revenue.toLocaleString('en-IN')} (${topCategory.bookings} bookings)`
                            : 'Performance by category'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, highlight }) {
    return (
        <div className={`
            p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-center
            ${highlight === 'up' ? 'bg-emerald-500/[0.08]' :
                highlight === 'down' ? 'bg-red-500/[0.08]' : 'bg-white/[0.03]'}
        `}>
            <p className={`
                text-[8px] sm:text-[9px] font-medium uppercase tracking-wider mb-0.5 sm:mb-1
                ${highlight === 'up' ? 'text-emerald-500' :
                    highlight === 'down' ? 'text-red-500' : 'text-gray-600'}
            `}>
                {label}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-white truncate">{value}</p>
        </div>
    );
}

// === BOOKING STATUS WITH DONUT ===
function BookingStatus({ data }) {
    const statuses = [
        { key: 'pending', label: 'Pending', color: '#EAB308', icon: AlertCircle },
        { key: 'confirmed', label: 'Confirmed', color: '#3B82F6', icon: CheckCircle2 },
        { key: 'inProgress', label: 'In Progress', color: '#A855F7', icon: Timer },
        { key: 'completed', label: 'Completed', color: '#22C55E', icon: CheckCircle2 },
        { key: 'cancelled', label: 'Cancelled', color: '#EF4444', icon: XCircle }
    ];

    const total = data.total || 0;
    const activeStatuses = statuses.filter(s => (data[s.key] || 0) > 0);

    const chartData = {
        labels: activeStatuses.map(s => s.label),
        datasets: [{
            data: activeStatuses.map(s => data[s.key] || 0),
            backgroundColor: activeStatuses.map(s => s.color),
            borderWidth: 0,
            cutout: '75%',
            spacing: 2
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#000',
                titleColor: '#888',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 8,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4
            }
        }
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Status Overview</p>
                        <p className="text-[10px] text-gray-600 hidden sm:block">{total} total</p>
                    </div>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                {total === 0 ? (
                    <div className="flex flex-col items-center py-6">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-2">
                            <CalendarDays className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-600">No bookings yet</p>
                    </div>
                ) : (
                    <>
                        {/* Donut Chart */}
                        <div className="relative h-32 sm:h-36 mb-4">
                            <Doughnut data={chartData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl sm:text-2xl font-bold text-white">{total}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                            </div>
                        </div>

                        {/* Status List */}
                        <div className="space-y-1.5">
                            {statuses.map((s) => {
                                const val = data[s.key] || 0;
                                if (val === 0) return null;
                                const pct = Math.round((val / total) * 100);
                                const Icon = s.icon;

                                return (
                                    <div
                                        key={s.key}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: s.color }}
                                            />
                                            <Icon className="w-3 h-3 text-gray-500" />
                                            <span className="text-[10px] sm:text-xs text-gray-400">{s.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] sm:text-[10px] text-gray-600 tabular-nums">{pct}%</span>
                                            <span className="text-[10px] sm:text-xs font-semibold text-white tabular-nums w-5 text-right">
                                                {val}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Action */}
                        {data.pending > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/[0.06]">
                                <Link
                                    href="/admin/bookings?status=pending"
                                    className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/[0.08] hover:bg-yellow-500/[0.12] transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                        <span className="text-[10px] sm:text-xs text-yellow-400">
                                            {data.pending} pending approval
                                        </span>
                                    </div>
                                    <ArrowUpRight className="w-3 h-3 text-yellow-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// === RECENT BOOKINGS ===
function RecentBookings({ bookings }) {
    const safeBookings = bookings || [];

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Recent Bookings</p>
                        <p className="text-[10px] text-gray-600 hidden sm:block">{safeBookings.length} bookings</p>
                    </div>
                </div>
                <Link
                    href="/admin/bookings"
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.04] transition-all active:scale-95"
                >
                    View all
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-2 sm:p-3">
                {safeBookings.length === 0 ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                            <CalendarDays className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-400 mb-1">No bookings yet</p>
                        <p className="text-[10px] text-gray-600">Bookings will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {safeBookings.slice(0, 6).map((booking, index) => (
                            <BookingRow key={booking._id} booking={booking} isFirst={index === 0} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function BookingRow({ booking, isFirst }) {
    const statusMap = {
        pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending', dot: 'bg-yellow-500' },
        confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Confirmed', dot: 'bg-blue-500' },
        'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Progress', dot: 'bg-purple-500' },
        inProgress: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Progress', dot: 'bg-purple-500' },
        completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Done', dot: 'bg-emerald-500' },
        cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Cancelled', dot: 'bg-red-500' }
    };

    const status = statusMap[booking.status] || statusMap.pending;
    const name = booking.customerId
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in';

    const bookingDate = booking.bookingDate ? new Date(booking.bookingDate) : null;
    const isToday = bookingDate && new Date().toDateString() === bookingDate.toDateString();

    return (
        <div className={`
            flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors
            hover:bg-white/[0.03] active:bg-white/[0.05]
            ${isFirst ? 'bg-white/[0.02]' : ''}
        `}>
            {/* Avatar */}
            <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-white/60">
                        {name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${status.dot}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">{name}</p>
                    {isFirst && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.08] text-gray-400 font-medium shrink-0">
                            LATEST
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] text-gray-600 truncate">{booking.serviceName}</p>
                    {bookingDate && (
                        <>
                            <span className="text-[8px] text-gray-700">•</span>
                            <p className="text-[10px] text-gray-600 shrink-0">
                                {isToday ? 'Today' : bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Right */}
            <div className="text-right shrink-0">
                <p className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                    ₹{(booking.price || 0).toLocaleString('en-IN')}
                </p>
                <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
            </div>
        </div>
    );
}

// === POPULAR SERVICES ===
function PopularServices({ services }) {
    const safeServices = services || [];
    const max = safeServices[0]?.totalBookings || 1;
    const totalBookings = safeServices.reduce((sum, s) => sum + (s.totalBookings || 0), 0);

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Top Services</p>
                        <p className="text-[10px] text-gray-600 hidden sm:block">{totalBookings} bookings</p>
                    </div>
                </div>
                <Link
                    href="/admin/services"
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.04] transition-all active:scale-95"
                >
                    View all
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-2 sm:p-3">
                {safeServices.length === 0 ? (
                    <div className="flex flex-col items-center py-6">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-2">
                            <Wrench className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-600">No services data</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {safeServices.slice(0, 5).map((service, index) => {
                            const pct = Math.round((service.totalBookings / max) * 100);
                            const isTop = index === 0;
                            const share = totalBookings > 0 ? Math.round((service.totalBookings / totalBookings) * 100) : 0;

                            return (
                                <div
                                    key={service._id}
                                    className={`
                                        p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors
                                        ${isTop ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className={`
                                                text-[8px] sm:text-[9px] font-mono w-4 shrink-0
                                                ${isTop ? 'text-emerald-400' : 'text-gray-600'}
                                            `}>
                                                #{index + 1}
                                            </span>
                                            <p className={`
                                                text-[10px] sm:text-xs font-medium truncate
                                                ${isTop ? 'text-white' : 'text-gray-300'}
                                            `}>
                                                {service.serviceName}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[9px] text-gray-600">{share}%</span>
                                            <span className={`
                                                text-[10px] sm:text-xs font-semibold tabular-nums
                                                ${isTop ? 'text-white' : 'text-gray-400'}
                                            `}>
                                                {service.totalBookings}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className={`
                                                h-full rounded-full transition-all duration-500
                                                ${isTop ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-white/25'}
                                            `}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Insight */}
            {safeServices.length > 0 && (
                <div className="px-3 sm:px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
                        <Sparkles className="w-3 h-3 shrink-0 text-emerald-500" />
                        <span className="truncate">
                            <span className="text-white font-medium">{safeServices[0]?.serviceName}</span> is most popular
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
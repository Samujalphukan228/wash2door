'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal';
import ExpenseListPopup from '@/components/admin/Expense/ExpenseList';
import MobileFAB from '@/components/admin/MobileFAB';
import useDashboard from '@/hooks/useDashboard';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
import { Doughnut } from 'react-chartjs-2';
import {
    Users,
    CalendarDays,
    IndianRupee,
    Wrench,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Zap,
    Activity,
    Star,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Sparkles,
    Plus,
    Wallet,
    TrendingUp
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
    const { 
        stats, 
        loading, 
        refetch,
        revenue,
        expenses,
        profit,
        weeklyData 
    } = useDashboard();
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExpenses, setShowExpenses] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const bookingStats = useMemo(() => {
        const byStatus = stats?.bookings?.byStatus || {};
        return {
            pending: byStatus.pending || 0,
            confirmed: byStatus.confirmed || 0,
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

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        setTimeout(() => {
            refetch();
            toast.success('Booking created');
        }, 100);
    };

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
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {/* Desktop Buttons */}
                            <button
                                onClick={() => setShowExpenses(true)}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
                            >
                                <Wallet className="w-3.5 h-3.5 text-white" />
                                Expenses
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Booking
                            </button>
                        </div>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
                        <StatCard
                            icon={IndianRupee}
                            label="Revenue"
                            value={`₹${(revenue.thisMonth || 0).toLocaleString('en-IN')}`}
                            sub="This month"
                            trend={revenue.growth}
                        />
                        <StatCard
                            icon={Wallet}
                            label="Expenses"
                            value={`₹${(expenses.thisMonth || 0).toLocaleString('en-IN')}`}
                            sub="This month"
                            trend={expenses.growth}
                            trendInverse
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Net Profit"
                            value={`₹${(profit.thisMonth || 0).toLocaleString('en-IN')}`}
                            sub={`${profit.marginThisMonth || 0}% margin`}
                            trend={profit.growth}
                            highlight={profit.thisMonth !== undefined}
                            highlightColor={profit.thisMonth < 0 ? 'red' : 'green'}
                        />
                        <StatCard
                            icon={CalendarDays}
                            label="Bookings"
                            value={bookingStats.total}
                            sub={`${bookingStats.completed} completed`}
                            highlight={bookingStats.pending > 0}
                            highlightColor="yellow"
                            badge={bookingStats.pending > 0 ? `${bookingStats.pending} pending` : null}
                        />
                        <StatCard
                            icon={Users}
                            label="Users"
                            value={stats?.users?.total || 0}
                            sub="Registered users"
                        />
                    </div>

                    {/* Revenue Chart */}
                    <RevenueChart
                        weeklyData={weeklyData}
                        totals={totals}
                    />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="lg:col-span-2">
                            <RecentBookings bookings={stats?.recentBookings} />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <ProfitSummary 
                                profit={profit}
                                revenue={revenue}
                                expenses={expenses}
                            />
                            <BookingStatus data={bookingStats} />
                            <PopularServices services={stats?.popularServices} />
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile FAB Component */}
            <MobileFAB 
                onNewBooking={() => setShowCreateModal(true)}
                onExpenses={() => setShowExpenses(true)}
            />

            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <ExpenseListPopup
                isOpen={showExpenses}
                onClose={() => setShowExpenses(false)}
            />
        </DashboardLayout>
    );
}

// === STAT CARD WITH TREND ===
function StatCard({ icon: Icon, label, value, sub, trend, trendInverse, highlight, highlightColor, badge }) {
    const isPositiveTrend = trendInverse ? trend < 0 : trend > 0;
    const isNegativeTrend = trendInverse ? trend > 0 : trend < 0;
    
    return (
        <div className={`
            relative overflow-hidden bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-4 
            transition-all hover:bg-white/[0.04] hover:border-white/[0.12]
            ${highlight && highlightColor === 'red' ? 'border-red-500/30 bg-red-500/[0.02]' : ''}
            ${highlight && highlightColor === 'green' ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : ''}
            ${highlight && highlightColor === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/[0.02]' : ''}
            ${!highlight ? 'border-white/[0.08]' : ''}
        `}>
            {highlight && highlightColor === 'green' && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            )}
            {highlight && highlightColor === 'red' && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            )}
            {highlight && highlightColor === 'yellow' && (
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
                    
                    {trend !== undefined && trend !== null && (
                        <div className={`
                            flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium
                            ${isPositiveTrend ? 'bg-emerald-500/15 text-emerald-400' : ''}
                            ${isNegativeTrend ? 'bg-red-500/15 text-red-400' : ''}
                            ${trend === 0 ? 'bg-gray-500/15 text-gray-400' : ''}
                        `}>
                            {isPositiveTrend && <ArrowUpRight className="w-2.5 h-2.5" />}
                            {isNegativeTrend && <ArrowDownRight className="w-2.5 h-2.5" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
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

// === PROFIT SUMMARY ===
function ProfitSummary({ profit, revenue, expenses }) {
    const isProfit = (profit?.thisMonth || 0) >= 0;
    
    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${isProfit ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Monthly Summary</p>
                        <p className="text-[10px] text-gray-600">This month's financials</p>
                    </div>
                </div>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] sm:text-xs text-gray-400">Revenue</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-400 tabular-nums">
                        +₹{(revenue?.thisMonth || 0).toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] sm:text-xs text-gray-400">Expenses</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-red-400 tabular-nums">
                        -₹{(expenses?.thisMonth || 0).toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="border-t border-white/[0.06]" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isProfit ? 'bg-blue-500' : 'bg-orange-500'}`} />
                        <span className="text-[10px] sm:text-xs text-gray-400">Net Profit</span>
                    </div>
                    <span className={`text-sm sm:text-base font-bold tabular-nums ${isProfit ? 'text-white' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}₹{(profit?.thisMonth || 0).toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] text-gray-500">Profit Margin</span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(Math.abs(profit?.marginThisMonth || 0), 100)}%` }}
                            />
                        </div>
                        <span className={`text-[10px] font-medium tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profit?.marginThisMonth || 0}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// === BOOKING STATUS ===
function BookingStatus({ data }) {
    const statuses = [
        { key: 'pending', label: 'Pending', color: '#EAB308', icon: AlertCircle },
        { key: 'confirmed', label: 'Confirmed', color: '#3B82F6', icon: CheckCircle2 },
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
                        <div className="relative h-32 sm:h-36 mb-4">
                            <Doughnut data={chartData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl sm:text-2xl font-bold text-white">{total}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                            </div>
                        </div>

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

// === BOOKING ROW ===
function BookingRow({ booking, isFirst }) {
    const statusMap = {
        pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending', dot: 'bg-yellow-500' },
        confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Confirmed', dot: 'bg-blue-500' },
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
            <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-white/60">
                        {name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${status.dot}`} />
            </div>

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
// src/app/admin/reports/page.jsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ReportFilters from '@/components/admin/reports/ReportFilters';
import RevenueSection from '@/components/admin/reports/RevenueSection';
import StatCard from '@/components/admin/reports/StatCard';
import adminService from '@/services/adminService';
import {
    DollarSign,
    CalendarCheck,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    BarChart3,
    Hash,
    Percent,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const [filters, setFilters] = useState({
        period: 'month',
        startDate: '',
        endDate: '',
        groupBy: 'day'
    });

    const [revenueData, setRevenueData] = useState(null);
    const [bookingData, setBookingData] = useState(null);

    // Fetch Reports
    const fetchReports = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);

            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );

            const [revenueRes, bookingRes] = await Promise.allSettled([
                adminService.getRevenueReport(params),
                adminService.getBookingReport(params)
            ]);

            if (revenueRes.status === 'fulfilled' && revenueRes.value.success) {
                setRevenueData(revenueRes.value.data || revenueRes.value);
            }

            if (bookingRes.status === 'fulfilled' && bookingRes.value.success) {
                setBookingData(bookingRes.value.data || bookingRes.value);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Handlers
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleRefresh = () => {
        fetchReports(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    // Data Extraction
    const extractedData = useMemo(() => {
        let revenueChart = [];
        if (revenueData) {
            if (Array.isArray(revenueData)) {
                revenueChart = revenueData;
            } else if (Array.isArray(revenueData.revenueData)) {
                revenueChart = revenueData.revenueData;
            } else if (Array.isArray(revenueData.data)) {
                revenueChart = revenueData.data;
            } else if (Array.isArray(revenueData.chart)) {
                revenueChart = revenueData.chart;
            }
        }

        const totalRevenue = revenueChart.reduce((sum, item) =>
            sum + (item.revenue || item.total || item.amount || 0), 0
        );

        let statusBreakdown = {};
        let totalBookings = 0;

        if (bookingData) {
            if (Array.isArray(bookingData.bookingsByStatus)) {
                bookingData.bookingsByStatus.forEach(item => {
                    const status = item._id || item.status || 'unknown';
                    const count = typeof item.count === 'number' ? item.count : 0;
                    statusBreakdown[status] = count;
                    totalBookings += count;
                });
            } else if (bookingData.statusBreakdown && typeof bookingData.statusBreakdown === 'object') {
                Object.entries(bookingData.statusBreakdown).forEach(([status, value]) => {
                    const count = typeof value === 'number' ? value : (value?.count || 0);
                    statusBreakdown[status] = count;
                    totalBookings += count;
                });
            } else if (bookingData.byStatus && typeof bookingData.byStatus === 'object') {
                Object.entries(bookingData.byStatus).forEach(([status, value]) => {
                    const count = typeof value === 'number' ? value : (value?.count || 0);
                    statusBreakdown[status] = count;
                    totalBookings += count;
                });
            }
        }

        const completedBookings = statusBreakdown.completed || statusBreakdown.Completed || 0;
        const cancelledBookings = statusBreakdown.cancelled || statusBreakdown.Cancelled || 0;

        let topServices = [];
        if (revenueData) {
            if (Array.isArray(revenueData.topServices)) topServices = revenueData.topServices;
            else if (Array.isArray(revenueData.byService)) topServices = revenueData.byService;
            else if (Array.isArray(revenueData.services)) topServices = revenueData.services;
        }
        if (bookingData && topServices.length === 0) {
            if (Array.isArray(bookingData.topServices)) topServices = bookingData.topServices;
            else if (Array.isArray(bookingData.byService)) topServices = bookingData.byService;
            else if (Array.isArray(bookingData.bookingsByCategory)) topServices = bookingData.bookingsByCategory;
        }

        topServices = topServices
            .map(s => ({
                name: s.name || s.serviceName || s._id || 'Unknown',
                revenue: typeof (s.revenue || s.total || s.amount) === 'number' ? (s.revenue || s.total || s.amount || 0) : 0,
                count: typeof (s.count || s.bookings) === 'number' ? (s.count || s.bookings || 0) : 0
            }))
            .filter(s => s.revenue > 0 || s.count > 0)
            .sort((a, b) => b.revenue - a.revenue);

        const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
        const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
        const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

        return {
            revenueChart, statusBreakdown, topServices,
            totalRevenue, totalBookings, completedBookings, cancelledBookings,
            avgBookingValue, completionRate, cancellationRate
        };
    }, [revenueData, bookingData]);

    const {
        revenueChart, statusBreakdown, topServices,
        totalRevenue, totalBookings, completedBookings, cancelledBookings,
        avgBookingValue, completionRate, cancellationRate
    } = extractedData;

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'revenue', label: 'Revenue' }
    ];

    // Full page loading
    if (loading && !revenueData && !bookingData) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading reports...</p>
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
                    <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 pt-4 sm:pt-6">
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                                Analytics
                            </p>
                            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                                Reports
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-gray-500">Syncing</span>
                                </div>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-40 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </header>

                    {/* Filters */}
                    <div className="px-3 sm:px-4 md:px-6">
                        <ReportFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="px-3 sm:px-4 md:px-6">
                        <div className="flex border-b border-white/[0.06] overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`
                                        px-4 sm:px-5 py-2.5 text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap
                                        ${activeTab === tab.key
                                            ? 'text-white border-b-2 border-white'
                                            : 'text-gray-600 hover:text-gray-400'
                                        }
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4 sm:space-y-6">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6 px-3 sm:px-4 md:px-6">
                                <StatCard
                                    label="Revenue"
                                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                                    icon={DollarSign}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Bookings"
                                    value={totalBookings}
                                    icon={CalendarCheck}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Completed"
                                    value={completedBookings}
                                    icon={TrendingUp}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Cancelled"
                                    value={cancelledBookings}
                                    icon={TrendingDown}
                                    loading={loading}
                                    highlight={cancelledBookings > 0}
                                />
                                <StatCard
                                    label="Avg Value"
                                    value={`₹${avgBookingValue.toLocaleString('en-IN')}`}
                                    icon={DollarSign}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Completion"
                                    value={`${completionRate}%`}
                                    icon={Percent}
                                    loading={loading}
                                />
                            </div>

                            {/* Revenue Chart */}
                            <div className="px-3 sm:px-4 md:px-6">
                                <RevenueSection
                                    data={revenueChart}
                                    loading={loading}
                                />
                            </div>

                            {/* Top Services */}
                            {!loading && topServices.length > 0 && (
                                <div className="px-3 sm:px-4 md:px-6">
                                    <TopServicesCard services={topServices} />
                                </div>
                            )}

                            {/* Status Breakdown */}
                            {!loading && Object.keys(statusBreakdown).length > 0 && (
                                <div className="px-3 sm:px-4 md:px-6 pb-6">
                                    <StatusBreakdownCard
                                        statusBreakdown={statusBreakdown}
                                        totalBookings={totalBookings}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Revenue Tab */}
                    {activeTab === 'revenue' && (
                        <div className="space-y-4 sm:space-y-6">

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 px-3 sm:px-4 md:px-6">
                                <StatCard
                                    label="Revenue"
                                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                                    icon={DollarSign}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Avg Booking"
                                    value={`₹${avgBookingValue.toLocaleString('en-IN')}`}
                                    icon={DollarSign}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Completed"
                                    value={completedBookings}
                                    icon={TrendingUp}
                                    loading={loading}
                                />
                                <StatCard
                                    label="Cancel Rate"
                                    value={`${cancellationRate}%`}
                                    icon={TrendingDown}
                                    loading={loading}
                                    highlight={cancellationRate > 10}
                                />
                            </div>

                            {/* Chart */}
                            <div className="px-3 sm:px-4 md:px-6">
                                <RevenueSection
                                    data={revenueChart}
                                    loading={loading}
                                />
                            </div>

                            {/* Revenue by Service Table */}
                            {!loading && topServices.length > 0 && (
                                <div className="px-3 sm:px-4 md:px-6 pb-6">
                                    <RevenueByServiceTable services={topServices} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// === INLINE COMPONENTS ===

function TopServicesCard({ services }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Top Services</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                            {services.length} services
                        </p>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-white/[0.04]">
                {services.slice(0, 5).map((service, i) => (
                    <div
                        key={`service-${i}`}
                        className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-700 w-5 font-mono">
                                #{i + 1}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {service.name}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-0.5">
                                    {service.count} booking{service.count !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <p className="text-sm font-medium text-white">
                                ₹{service.revenue.toLocaleString('en-IN')}
                            </p>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBreakdownCard({ statusBreakdown, totalBookings }) {
    const statusColors = {
        completed: 'bg-emerald-400',
        Completed: 'bg-emerald-400',
        confirmed: 'bg-blue-400',
        Confirmed: 'bg-blue-400',
        pending: 'bg-yellow-400',
        Pending: 'bg-yellow-400',
        cancelled: 'bg-red-400',
        Cancelled: 'bg-red-400',
        'in-progress': 'bg-purple-400',
    };

    const statusBadgeColors = {
        completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        Confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
        Cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
        'in-progress': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Status Breakdown</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                            {totalBookings} total bookings
                        </p>
                    </div>
                </div>
            </div>

            {/* Bars */}
            <div className="p-3 sm:p-4 md:p-6 space-y-4">
                {Object.entries(statusBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([status, count]) => {
                        const percentage = totalBookings > 0
                            ? Math.round((count / totalBookings) * 100)
                            : 0;

                        const barColor = statusColors[status] || 'bg-white/50';
                        const badgeColor = statusBadgeColors[status] || 'bg-white/[0.06] text-gray-400 border-white/[0.08]';

                        return (
                            <div key={`status-${status}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`
                                            text-[9px] font-medium px-1.5 py-0.5 rounded capitalize border
                                            ${badgeColor}
                                        `}>
                                            {status.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-gray-500 font-mono">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                        style={{
                                            width: `${percentage}%`,
                                            opacity: 0.6
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

function RevenueByServiceTable({ services }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Revenue by Service</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                            {services.length} services
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            {['#', 'Service', 'Bookings', 'Revenue', 'Avg'].map(h => (
                                <th
                                    key={h}
                                    className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] text-gray-600 uppercase tracking-wider font-medium whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {services.map((service, i) => {
                            const avg = service.count > 0
                                ? Math.round(service.revenue / service.count)
                                : 0;

                            return (
                                <tr
                                    key={`table-service-${i}`}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-3 sm:px-4 py-3 text-[10px] text-gray-700 font-mono">
                                        {i + 1}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                            {service.name}
                                        </p>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <span className="text-xs sm:text-sm text-gray-400">
                                            {service.count}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <span className="text-xs sm:text-sm font-medium text-white">
                                            ₹{service.revenue.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <span className="text-xs sm:text-sm text-gray-500">
                                            ₹{avg.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
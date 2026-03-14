'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ReportFilters from '@/components/admin/reports/ReportFilters';
import RevenueSection from '@/components/admin/reports/RevenueSection';
import StatCard from '@/components/admin/reports/StatCard';
import adminService from '@/services/adminService';
import {
    DollarSign, CalendarCheck, TrendingUp,
    TrendingDown, RefreshCw
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

    // ── Fetch Reports ──
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
                const data = revenueRes.value.data || revenueRes.value;
                console.log('✅ Revenue Response:', data);
                setRevenueData(data);
            } else {
                console.error('❌ Revenue fetch failed:', revenueRes.reason);
            }

            if (bookingRes.status === 'fulfilled' && bookingRes.value.success) {
                const data = bookingRes.value.data || bookingRes.value;
                console.log('✅ Booking Response:', data);
                setBookingData(data);
            } else {
                console.error('❌ Booking fetch failed:', bookingRes.reason);
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

    // ── Handlers ──
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleRefresh = () => {
        fetchReports(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    // ── SMART DATA EXTRACTION ──
    const extractedData = useMemo(() => {
        // Revenue Chart Data
        let revenueChart = [];
        if (revenueData) {
            if (Array.isArray(revenueData)) {
                revenueChart = revenueData;
            } else if (revenueData.revenueData && Array.isArray(revenueData.revenueData)) {
                revenueChart = revenueData.revenueData;
            } else if (revenueData.data && Array.isArray(revenueData.data)) {
                revenueChart = revenueData.data;
            } else if (revenueData.chart && Array.isArray(revenueData.chart)) {
                revenueChart = revenueData.chart;
            }
        }

        // Calculate total revenue
        const totalRevenue = revenueChart.reduce((sum, item) => 
            sum + (item.revenue || item.total || item.amount || 0), 0
        );

        // Status breakdown - FIXED
        let statusBreakdown = {};
        let totalBookings = 0;
        
        if (bookingData) {
            // Case 1: bookingsByStatus is an array like [{ _id: "completed", count: 5 }]
            if (Array.isArray(bookingData.bookingsByStatus)) {
                bookingData.bookingsByStatus.forEach(item => {
                    const status = item._id || item.status || 'unknown';
                    const count = typeof item.count === 'number' ? item.count : 0;
                    statusBreakdown[status] = count;
                    totalBookings += count;
                });
            }
            // Case 2: statusBreakdown is already an object like { completed: 5 }
            else if (bookingData.statusBreakdown && typeof bookingData.statusBreakdown === 'object') {
                Object.entries(bookingData.statusBreakdown).forEach(([status, value]) => {
                    const count = typeof value === 'number' ? value : (value?.count || 0);
                    statusBreakdown[status] = count;
                    totalBookings += count;
                });
            }
            // Case 3: byStatus object
            else if (bookingData.byStatus && typeof bookingData.byStatus === 'object') {
                Object.entries(bookingData.byStatus).forEach(([status, value]) => {
                    const count = typeof value === 'number' ? value : (value?.count || 0);
                    statusBreakdown[status] = count;
                    totalBookings += count;
                });
            }
        }

        const completedBookings = statusBreakdown.completed || statusBreakdown.Completed || 0;
        const cancelledBookings = statusBreakdown.cancelled || statusBreakdown.Cancelled || 0;

        // Top services - FIXED
        let topServices = [];
        if (revenueData) {
            if (Array.isArray(revenueData.topServices)) {
                topServices = revenueData.topServices;
            } else if (Array.isArray(revenueData.byService)) {
                topServices = revenueData.byService;
            } else if (Array.isArray(revenueData.services)) {
                topServices = revenueData.services;
            }
        }
        if (bookingData && topServices.length === 0) {
            if (Array.isArray(bookingData.topServices)) {
                topServices = bookingData.topServices;
            } else if (Array.isArray(bookingData.byService)) {
                topServices = bookingData.byService;
            } else if (Array.isArray(bookingData.bookingsByCategory)) {
                topServices = bookingData.bookingsByCategory;
            }
        }

        // Normalize and sort top services
        topServices = topServices
            .map(s => {
                const revenue = s.revenue || s.total || s.amount || 0;
                const count = s.count || s.bookings || 0;
                
                return {
                    name: s.name || s.serviceName || s._id || 'Unknown',
                    revenue: typeof revenue === 'number' ? revenue : 0,
                    count: typeof count === 'number' ? count : 0
                };
            })
            .filter(s => s.revenue > 0 || s.count > 0)
            .sort((a, b) => b.revenue - a.revenue);

        const avgBookingValue = totalBookings > 0 
            ? Math.round(totalRevenue / totalBookings) 
            : 0;

        const completionRate = totalBookings > 0
            ? Math.round((completedBookings / totalBookings) * 100)
            : 0;

        const cancellationRate = totalBookings > 0
            ? Math.round((cancelledBookings / totalBookings) * 100)
            : 0;

        return {
            revenueChart,
            statusBreakdown,
            topServices,
            totalRevenue,
            totalBookings,
            completedBookings,
            cancelledBookings,
            avgBookingValue,
            completionRate,
            cancellationRate
        };
    }, [revenueData, bookingData]);

    const {
        revenueChart,
        statusBreakdown,
        topServices,
        totalRevenue,
        totalBookings,
        completedBookings,
        cancelledBookings,
        avgBookingValue,
        completionRate,
        cancellationRate
    } = extractedData;

    const tabs = ['overview', 'revenue'];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-28 sm:pb-6">

                {/* ── Page Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                                Reports
                            </h1>
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
                                    <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />
                                    <span className="text-xs text-zinc-500">Syncing</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 capitalize">
                            {filters.period} report
                        </p>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Mobile Refresh */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="sm:hidden p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* ── Filters ── */}
                <ReportFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* ── Tabs ── */}
                <div className="flex border-b border-white/[0.06] overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-6 py-3 text-[11px] tracking-widest uppercase transition-all duration-150 capitalize font-medium whitespace-nowrap
                                ${activeTab === tab
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-white/30 hover:text-white/60'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <StatCard
                                label="Total Revenue"
                                value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                                icon={DollarSign}
                                loading={loading}
                            />
                            <StatCard
                                label="Total Bookings"
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
                                icon={TrendingUp}
                                loading={loading}
                            />
                        </div>

                        {/* Revenue Chart - Full Width */}
                        <RevenueSection
                            data={revenueChart}
                            loading={loading}
                        />

                        {/* Top Services */}
                        {!loading && topServices.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.09] transition-colors">
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                                        Top Services
                                    </p>
                                </div>
                                <div className="divide-y divide-white/[0.03]">
                                    {topServices.slice(0, 5).map((service, i) => (
                                        <div
                                            key={`service-${i}`}
                                            className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-150"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] text-white/20 w-6">
                                                    #{i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm text-white/70">
                                                        {service.name}
                                                    </p>
                                                    <p className="text-[11px] text-white/25 mt-0.5">
                                                        {service.count} booking{service.count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-white/80 font-medium">
                                                ₹{service.revenue.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Breakdown */}
                        {!loading && Object.keys(statusBreakdown).length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.09] transition-colors">
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                                        Booking Status Overview
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {Object.entries(statusBreakdown)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([status, count]) => {
                                                const percentage = totalBookings > 0
                                                    ? Math.round((count / totalBookings) * 100)
                                                    : 0;

                                                return (
                                                    <div key={`status-${status}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-white/60 capitalize">
                                                                {status.replace('-', ' ')}
                                                            </span>
                                                            <span className="text-xs text-white/30 tabular-nums">
                                                                {count} ({percentage}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-white/70 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Revenue Tab ── */}
                {activeTab === 'revenue' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard
                                label="Total Revenue"
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
                            />
                        </div>

                        <RevenueSection
                            data={revenueChart}
                            loading={loading}
                        />

                        {!loading && topServices.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.09] transition-colors">
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                                        Revenue by Service
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/[0.05]">
                                                {['#', 'Service', 'Bookings', 'Revenue', 'Avg'].map(h => (
                                                    <th
                                                        key={h}
                                                        className="px-4 py-3 text-left text-[10px] text-white/40 tracking-widest uppercase font-medium whitespace-nowrap"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topServices.map((service, i) => {
                                                const avg = service.count > 0 
                                                    ? Math.round(service.revenue / service.count) 
                                                    : 0;

                                                return (
                                                    <tr
                                                        key={`table-service-${i}`}
                                                        className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-150"
                                                    >
                                                        <td className="px-4 py-3.5 text-[11px] text-white/20">
                                                            {i + 1}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/70">
                                                            {service.name}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/50">
                                                            {service.count}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white font-medium">
                                                            ₹{service.revenue.toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/50">
                                                            ₹{avg.toLocaleString('en-IN')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
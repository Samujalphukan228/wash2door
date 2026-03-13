'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ReportFilters from '@/components/admin/reports/ReportFilters';
import RevenueSection from '@/components/admin/reports/RevenueSection';
import BookingsSection from '@/components/admin/reports/BookingsSection';
import StatCard from '@/components/admin/reports/StatCard';
import adminService from '@/services/adminService';
import {
    DollarSign, CalendarCheck, TrendingUp,
    TrendingDown, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
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
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);

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
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // ── Handlers ──
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // ── Computed Stats ──
    const totalRevenue = revenueData?.totalRevenue
        || revenueData?.total
        || revenueData?.summary?.totalRevenue
        || 0;

    const totalBookings = bookingData?.totalBookings
        || bookingData?.total
        || bookingData?.summary?.totalBookings
        || 0;

    const completedBookings = bookingData?.completedBookings
        || bookingData?.summary?.completed
        || 0;

    const cancelledBookings = bookingData?.cancelledBookings
        || bookingData?.summary?.cancelled
        || 0;

    const avgBookingValue = totalBookings > 0
        ? Math.round(totalRevenue / totalBookings)
        : 0;

    const completionRate = totalBookings > 0
        ? Math.round((completedBookings / totalBookings) * 100)
        : 0;

    const cancellationRate = totalBookings > 0
        ? Math.round((cancelledBookings / totalBookings) * 100)
        : 0;

    const revenueChart = revenueData?.chart
        || revenueData?.data
        || revenueData?.breakdown
        || [];

    const bookingChart = bookingData?.chart
        || bookingData?.data
        || bookingData?.breakdown
        || [];

    const topServices = revenueData?.topServices
        || revenueData?.byService
        || bookingData?.topServices
        || bookingData?.byService
        || [];

    const statusBreakdown = bookingData?.statusBreakdown
        || bookingData?.byStatus
        || {};

    const tabs = ['overview', 'revenue', 'bookings'];

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">
                            Analytics
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white/90">
                            Reports
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-white/25">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-[11px] tracking-widest uppercase">
                            {filters.period} report
                        </span>
                    </div>
                </div>

                {/* ── Filters ── */}
                <ReportFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* ── Tabs ── */}
                <div className="flex border-b border-white/[0.06]">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-6 py-3 text-[11px] tracking-widest uppercase transition-all duration-150 capitalize font-medium
                                ${activeTab === tab
                                    ? 'text-white/80 border-b-2 border-white'
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

                        {/* Charts Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RevenueSection
                                data={revenueChart}
                                loading={loading}
                                compact
                            />
                            <BookingsSection
                                data={bookingChart}
                                statusBreakdown={statusBreakdown}
                                loading={loading}
                                compact
                            />
                        </div>

                        {/* Top Services */}
                        {topServices.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                                        Top Services
                                    </p>
                                </div>
                                <div className="divide-y divide-white/[0.03]">
                                    {topServices.slice(0, 5).map((service, i) => (
                                        <div
                                            key={i}
                                            className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-150"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] text-white/20 w-6">
                                                    #{i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm text-white/70">
                                                        {service.name || service.serviceName || service._id || '—'}
                                                    </p>
                                                    <p className="text-[11px] text-white/25 mt-0.5">
                                                        {service.count || service.bookings || 0} bookings
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-white/80 font-medium">
                                                ₹{(service.revenue || service.total || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
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

                        {/* Top Services Revenue Table */}
                        {topServices.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
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
                                                        className="px-4 py-3 text-left text-[10px] text-white/20 tracking-widest uppercase font-medium whitespace-nowrap"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topServices.map((service, i) => {
                                                const bookings = service.count || service.bookings || 0;
                                                const revenue = service.revenue || service.total || 0;
                                                const avg = bookings > 0 ? Math.round(revenue / bookings) : 0;

                                                return (
                                                    <tr
                                                        key={i}
                                                        className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-150"
                                                    >
                                                        <td className="px-4 py-3.5 text-[11px] text-white/20">
                                                            {i + 1}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/70">
                                                            {service.name || service.serviceName || service._id || '—'}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/40">
                                                            {bookings}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/80 font-medium">
                                                            ₹{revenue.toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-white/40">
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

                {/* ── Bookings Tab ── */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard
                                label="Total"
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
                                label="Completion Rate"
                                value={`${completionRate}%`}
                                icon={TrendingUp}
                                loading={loading}
                            />
                        </div>

                        <BookingsSection
                            data={bookingChart}
                            statusBreakdown={statusBreakdown}
                            loading={loading}
                        />

                        {/* Status Breakdown */}
                        {Object.keys(statusBreakdown).length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <p className="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase">
                                        Status Breakdown
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {Object.entries(statusBreakdown).map(([status, count]) => {
                                            const percentage = totalBookings > 0
                                                ? Math.round((count / totalBookings) * 100)
                                                : 0;

                                            return (
                                                <div key={status}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-white/50 capitalize">
                                                            {status}
                                                        </span>
                                                        <span className="text-[11px] text-white/25">
                                                            {count} ({percentage}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-white rounded-full transition-all duration-500"
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
            </div>
        </DashboardLayout>
    );
}
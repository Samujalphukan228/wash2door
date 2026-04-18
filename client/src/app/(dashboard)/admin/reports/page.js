'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ReportFilters from '@/components/admin/reports/ReportFilters';
import RevenueSection from '@/components/admin/reports/RevenueSection';
import StatCard from '@/components/admin/reports/StatCard';
import adminService from '@/services/adminService';
import {
    IndianRupee, CalendarCheck, TrendingUp, TrendingDown,
    RefreshCw, BarChart3, Hash, Percent, ChevronRight, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG = {
    completed:    { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    Completed:    { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    confirmed:    { dot: 'bg-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    Confirmed:    { dot: 'bg-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    pending:      { dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    Pending:      { dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    cancelled:    { dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
    Cancelled:    { dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
    'in-progress':{ dot: 'bg-purple-400',  badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
};

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue',  label: 'Revenue'  },
];

// ============================================
// MAIN PAGE
// ============================================

export default function ReportsPage() {
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const [filters, setFilters] = useState({
        period: 'month', startDate: '', endDate: '', groupBy: 'day',
    });

    const [revenueData, setRevenueData] = useState(null);
    const [bookingData, setBookingData] = useState(null);

    // ── Fetch ──
    const fetchReports = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const [revenueRes, bookingRes] = await Promise.allSettled([
                adminService.getRevenueReport(params),
                adminService.getBookingReport(params),
            ]);
            if (revenueRes.status === 'fulfilled' && revenueRes.value.success)
                setRevenueData(revenueRes.value.data || revenueRes.value);
            if (bookingRes.status === 'fulfilled' && bookingRes.value.success)
                setBookingData(bookingRes.value.data || bookingRes.value);
        } catch {
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleFilterChange = (newFilters) =>
        setFilters((prev) => ({ ...prev, ...newFilters }));

    const handleRefresh = () => {
        fetchReports(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    // ── Data Extraction ──
    const extractedData = useMemo(() => {
        let revenueChart = [];
        if (revenueData) {
            if (Array.isArray(revenueData)) revenueChart = revenueData;
            else if (Array.isArray(revenueData.revenueData)) revenueChart = revenueData.revenueData;
            else if (Array.isArray(revenueData.data))         revenueChart = revenueData.data;
            else if (Array.isArray(revenueData.chart))        revenueChart = revenueData.chart;
        }

        const totalRevenue = revenueChart.reduce(
            (sum, item) => sum + (item.revenue || item.total || item.amount || 0), 0
        );

        let statusBreakdown = {};
        let totalBookings = 0;

        if (bookingData) {
            const src =
                Array.isArray(bookingData.bookingsByStatus) ? bookingData.bookingsByStatus :
                bookingData.statusBreakdown ? Object.entries(bookingData.statusBreakdown).map(([_id, v]) => ({ _id, count: typeof v === 'number' ? v : v?.count || 0 })) :
                bookingData.byStatus       ? Object.entries(bookingData.byStatus).map(([_id, v]) => ({ _id, count: typeof v === 'number' ? v : v?.count || 0 })) :
                [];
            src.forEach((item) => {
                const status = item._id || item.status || 'unknown';
                const count  = typeof item.count === 'number' ? item.count : 0;
                statusBreakdown[status] = count;
                totalBookings += count;
            });
        }

        const completedBookings = statusBreakdown.completed || statusBreakdown.Completed || 0;
        const cancelledBookings = statusBreakdown.cancelled || statusBreakdown.Cancelled || 0;

        let topServices = [];
        if (revenueData) {
            topServices = revenueData.topServices || revenueData.byService || revenueData.services || [];
        }
        if (bookingData && topServices.length === 0) {
            topServices = bookingData.topServices || bookingData.byService || bookingData.bookingsByCategory || [];
        }

        topServices = topServices
            .map((s) => ({
                name:    s.name || s.serviceName || s._id || 'Unknown',
                revenue: s.revenue || s.total || s.amount || 0,
                count:   s.count  || s.bookings  || 0,
            }))
            .filter((s) => s.revenue > 0 || s.count > 0)
            .sort((a, b) => b.revenue - a.revenue);

        const avgBookingValue  = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
        const completionRate   = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
        const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

        return {
            revenueChart, statusBreakdown, topServices,
            totalRevenue, totalBookings, completedBookings, cancelledBookings,
            avgBookingValue, completionRate, cancellationRate,
        };
    }, [revenueData, bookingData]);

    const {
        revenueChart, statusBreakdown, topServices,
        totalRevenue, totalBookings, completedBookings, cancelledBookings,
        avgBookingValue, completionRate, cancellationRate,
    } = extractedData;

    // ── Loading ──
    if (loading && !revenueData && !bookingData) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">
                            Loading reports...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wide">Analytics</p>
                        <h1 className="text-base sm:text-lg font-semibold text-white">Reports</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {refreshing && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-white/30">Syncing</span>
                            </div>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all flex items-center justify-center"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── Filters ── */}
                <ReportFilters filters={filters} onFilterChange={handleFilterChange} />

                {/* ── Tabs ── */}
                <div className="flex border-b border-white/[0.06]">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2.5 text-[11px] font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ════════════════════════════════
                    OVERVIEW TAB
                   ════════════════════════════════ */}
                {activeTab === 'overview' && (
                    <div className="space-y-3">

                        {/* Stats strip */}
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            <ReportStat label="Revenue"    value={`₹${totalRevenue.toLocaleString('en-IN')}`} loading={loading} />
                            <ReportStat label="Bookings"   value={totalBookings}          loading={loading} />
                            <ReportStat label="Completed"  value={completedBookings}      loading={loading} color="emerald" />
                            <ReportStat label="Cancelled"  value={cancelledBookings}      loading={loading} color={cancelledBookings > 0 ? 'red' : undefined} />
                            <ReportStat label="Avg Value"  value={`₹${avgBookingValue.toLocaleString('en-IN')}`} loading={loading} />
                            <ReportStat label="Completion" value={`${completionRate}%`}   loading={loading} color="emerald" />
                        </div>

                        {/* Chart */}
                        <RevenueSection data={revenueChart} loading={loading} />

                        {/* Top Services */}
                        {!loading && topServices.length > 0 && (
                            <TopServicesCard services={topServices} />
                        )}

                        {/* Status Breakdown */}
                        {!loading && Object.keys(statusBreakdown).length > 0 && (
                            <StatusBreakdownCard
                                statusBreakdown={statusBreakdown}
                                totalBookings={totalBookings}
                            />
                        )}
                    </div>
                )}

                {/* ════════════════════════════════
                    REVENUE TAB
                   ════════════════════════════════ */}
                {activeTab === 'revenue' && (
                    <div className="space-y-3">

                        {/* Stats strip */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <ReportStat label="Revenue"     value={`₹${totalRevenue.toLocaleString('en-IN')}`} loading={loading} />
                            <ReportStat label="Avg Booking" value={`₹${avgBookingValue.toLocaleString('en-IN')}`} loading={loading} />
                            <ReportStat label="Completed"   value={completedBookings} loading={loading} color="emerald" />
                            <ReportStat label="Cancel Rate" value={`${cancellationRate}%`} loading={loading} color={cancellationRate > 10 ? 'red' : undefined} />
                        </div>

                        {/* Chart */}
                        <RevenueSection data={revenueChart} loading={loading} />

                        {/* Table */}
                        {!loading && topServices.length > 0 && (
                            <RevenueByServiceTable services={topServices} />
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

// ============================================
// REPORT STAT — compact strip card
// ============================================

function ReportStat({ label, value, loading, color }) {
    const colorMap = {
        emerald: 'text-emerald-400',
        red:     'text-red-400',
        amber:   'text-amber-400',
    };

    return (
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mb-1">{label}</p>
            {loading ? (
                <div className="h-4 w-12 bg-white/[0.06] rounded animate-pulse" />
            ) : (
                <p className={`text-sm font-bold tabular-nums ${color ? colorMap[color] : 'text-white'}`}>
                    {value}
                </p>
            )}
        </div>
    );
}

// ============================================
// TOP SERVICES CARD
// ============================================

function TopServicesCard({ services }) {
    const max = services[0]?.revenue || 1;

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    Top Services
                </p>
                <span className="text-[10px] text-white/20 tabular-nums">
                    {services.length} services
                </span>
            </div>

            {/* Items */}
            <div className="p-2 space-y-0.5">
                {services.slice(0, 5).map((service, i) => {
                    const pct  = Math.round((service.revenue / max) * 100);
                    const isTop = i === 0;

                    return (
                        <div
                            key={i}
                            className={`px-2.5 py-2 rounded-lg transition-colors ${
                                isTop ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                        isTop ? 'bg-white/[0.08] text-white/70' : 'bg-white/[0.04] text-white/25'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    <p className={`text-[11px] font-medium truncate ${
                                        isTop ? 'text-white/80' : 'text-white/45'
                                    }`}>
                                        {service.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <span className="text-[9px] text-white/25 tabular-nums">
                                        {service.count} bookings
                                    </span>
                                    <span className={`text-[11px] font-semibold tabular-nums ${
                                        isTop ? 'text-white' : 'text-white/50'
                                    }`}>
                                        ₹{service.revenue.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                            <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        isTop ? 'bg-white/35' : 'bg-white/12'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// STATUS BREAKDOWN CARD
// ============================================

function StatusBreakdownCard({ statusBreakdown, totalBookings }) {
    const sorted = Object.entries(statusBreakdown).sort(([, a], [, b]) => b - a);

    // Stacked bar segments
    const segments = sorted.map(([status, count]) => {
        const cfg = STATUS_CONFIG[status] || { dot: 'bg-white/30', badge: 'bg-white/[0.06] text-white/40 border-white/[0.08]' };
        const pct = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
        return { status, count, pct, cfg };
    });

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    Status Breakdown
                </p>
                <span className="text-[10px] text-white/20 tabular-nums">
                    {totalBookings} bookings
                </span>
            </div>

            <div className="p-3 space-y-3">
                {/* Stacked bar */}
                <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04] gap-px">
                    {segments.map(({ status, pct, cfg }) => (
                        <div
                            key={status}
                            className={`h-full ${cfg.dot} transition-all duration-700`}
                            style={{ width: `${pct}%`, opacity: 0.7 }}
                        />
                    ))}
                </div>

                {/* Rows */}
                <div className="space-y-1">
                    {segments.map(({ status, count, pct, cfg }) => (
                        <div key={status} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                            <span className="flex-1 text-[10px] text-white/50 capitalize">
                                {status.replace('-', ' ')}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Mini bar */}
                                <div className="w-16 h-1 bg-white/[0.04] rounded-full overflow-hidden hidden sm:block">
                                    <div
                                        className={`h-full rounded-full ${cfg.dot} opacity-60`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-white/25 tabular-nums w-8 text-right">
                                    {Math.round(pct)}%
                                </span>
                                <span className="text-[11px] font-semibold text-white/70 tabular-nums w-6 text-right">
                                    {count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// REVENUE BY SERVICE TABLE
// ============================================

function RevenueByServiceTable({ services }) {
    const maxRevenue = services[0]?.revenue || 1;

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    Revenue by Service
                </p>
                <span className="text-[10px] text-white/20 tabular-nums">
                    {services.length} services
                </span>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-white/[0.04]">
                {services.map((service, i) => {
                    const avg  = service.count > 0 ? Math.round(service.revenue / service.count) : 0;
                    const pct  = Math.round((service.revenue / maxRevenue) * 100);
                    const isTop = i === 0;

                    return (
                        <div key={i} className="px-3 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className={`text-[9px] font-mono w-4 shrink-0 ${isTop ? 'text-white/60' : 'text-white/20'}`}>
                                        {i + 1}.
                                    </span>
                                    <p className={`text-[11px] font-medium truncate ${isTop ? 'text-white/80' : 'text-white/50'}`}>
                                        {service.name}
                                    </p>
                                </div>
                                <span className={`text-[11px] font-semibold tabular-nums shrink-0 ml-2 ${isTop ? 'text-white' : 'text-white/50'}`}>
                                    ₹{service.revenue.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                                <div className="flex-1 h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/20 rounded-full"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-[9px] text-white/20 tabular-nums shrink-0">
                                    {service.count} · avg ₹{avg.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            {['#', 'Service', 'Bookings', 'Revenue', 'Avg / Booking'].map((h) => (
                                <th
                                    key={h}
                                    className="px-3 py-2.5 text-left text-[9px] text-white/25 uppercase tracking-wide font-medium whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {services.map((service, i) => {
                            const avg  = service.count > 0 ? Math.round(service.revenue / service.count) : 0;
                            const isTop = i === 0;

                            return (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-3 py-2.5 text-[10px] text-white/20 font-mono">
                                        {i + 1}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <p className={`text-[11px] font-medium truncate max-w-[200px] ${
                                            isTop ? 'text-white/80' : 'text-white/50'
                                        }`}>
                                            {service.name}
                                        </p>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="text-[11px] text-white/40 tabular-nums">
                                            {service.count}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className={`text-[11px] font-semibold tabular-nums ${
                                            isTop ? 'text-white' : 'text-white/60'
                                        }`}>
                                            ₹{service.revenue.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="text-[11px] text-white/30 tabular-nums">
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
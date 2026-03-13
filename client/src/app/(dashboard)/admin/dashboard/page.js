'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import RecentBookings from '@/components/admin/dashboard/RecentBookings';
import PopularServices from '@/components/admin/dashboard/PopularServices';
import BookingsByStatus from '@/components/admin/dashboard/BookingsByStatus';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import useDashboard from '@/hooks/useDashboard';
import { useSocket } from '@/context/SocketContext';
import {
    Users,
    CalendarDays,
    IndianRupee,
    Wrench,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const { stats, loading, refetch } = useDashboard();
    const { socket } = useSocket();
    const [refreshing, setRefreshing] = useState(false);

    // ============================================
    // SOCKET LISTENERS
    // ============================================
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            refetch();
        };

        socket.on('new_booking', handleUpdate);
        socket.on('booking_status_updated', handleUpdate);

        return () => {
            socket.off('new_booking', handleUpdate);
            socket.off('booking_status_updated', handleUpdate);
        };
    }, [socket, refetch]);

    // ============================================
    // REFRESH HANDLER
    // ============================================
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
        toast.success('Dashboard refreshed', { duration: 1200 });
    }, [refetch]);

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-10 space-y-6">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            {/* Live indicator */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">
                                        Live
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                                    Good {getGreeting()}
                                </h1>
                                {refreshing && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                                        <RefreshCw className="w-3 h-3 text-white/40 animate-spin" />
                                        <span className="text-[10px] text-white/30">Syncing</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-white/35">
                                {getCurrentDate()}
                            </p>
                        </div>

                        {/* Desktop Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="
                                hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg
                                border border-white/[0.08] bg-white/[0.03]
                                text-xs text-white/50 hover:text-white/80
                                hover:bg-white/[0.06] hover:border-white/[0.12]
                                disabled:opacity-40 disabled:cursor-not-allowed
                                transition-all duration-150 group
                            "
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span className="tracking-wide">Refresh</span>
                        </button>

                        {/* Mobile Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="
                                sm:hidden w-9 h-9 rounded-lg flex items-center justify-center
                                border border-white/[0.08] bg-white/[0.03]
                                text-white/40 active:text-white/80
                                active:bg-white/[0.06] active:scale-95
                                disabled:opacity-40 transition-all duration-150
                            "
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* ── Divider ── */}
                    <div className="h-px bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent" />

                    {/* ── Main Stats Grid ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatsCard
                            title="Total Users"
                            value={stats?.users?.total ?? 0}
                            icon={Users}
                            loading={loading}
                            suffix="customers"
                        />
                        <StatsCard
                            title="Total Bookings"
                            value={stats?.bookings?.total ?? 0}
                            icon={CalendarDays}
                            loading={loading}
                            suffix="all time"
                        />
                        <StatsCard
                            title="Total Revenue"
                            value={stats?.revenue?.total ?? 0}
                            icon={IndianRupee}
                            loading={loading}
                            prefix="₹"
                            isCurrency
                        />
                        <StatsCard
                            title="Active Services"
                            value={stats?.services?.total ?? 0}
                            icon={Wrench}
                            loading={loading}
                            suffix="services"
                        />
                    </div>

                    {/* ── Booking Status Cards ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        <StatusCard
                            label="Pending"
                            value={stats?.bookings?.byStatus?.pending ?? 0}
                            icon={Clock}
                            loading={loading}
                            color="yellow"
                        />
                        <StatusCard
                            label="Confirmed"
                            value={stats?.bookings?.byStatus?.confirmed ?? 0}
                            icon={CalendarDays}
                            loading={loading}
                            color="blue"
                        />
                        <StatusCard
                            label="In Progress"
                            value={stats?.bookings?.byStatus?.inProgress ?? 0}
                            icon={TrendingUp}
                            loading={loading}
                            color="purple"
                        />
                        <StatusCard
                            label="Completed"
                            value={stats?.bookings?.byStatus?.completed ?? 0}
                            icon={CheckCircle}
                            loading={loading}
                            color="green"
                        />
                        <StatusCard
                            label="Cancelled"
                            value={stats?.bookings?.byStatus?.cancelled ?? 0}
                            icon={XCircle}
                            loading={loading}
                            color="red"
                        />
                    </div>

                    {/* ── Charts Row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 min-w-0">
                            <RevenueChart
                                data={stats?.bookingsByCategory}
                                loading={loading}
                            />
                        </div>
                        <div className="min-w-0">
                            <BookingsByStatus
                                data={stats?.bookings?.byStatus}
                                loading={loading}
                            />
                        </div>
                    </div>

                    {/* ── Tables Row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 min-w-0">
                            <RecentBookings
                                bookings={stats?.recentBookings}
                                loading={loading}
                            />
                        </div>
                        <div className="min-w-0">
                            <PopularServices
                                services={stats?.popularServices}
                                loading={loading}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

// ============================================
// STATUS MINI CARD COMPONENT
// ============================================
function StatusCard({ label, value, icon: Icon, loading, color = 'white' }) {
    const colorStyles = {
        yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
        purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
        green: 'from-green-500/10 to-green-500/5 border-green-500/20',
        red: 'from-red-500/10 to-red-500/5 border-red-500/20',
        white: 'from-white/[0.03] to-transparent border-white/[0.08]'
    };

    const iconStyles = {
        yellow: 'text-yellow-500/40',
        blue: 'text-blue-500/40',
        purple: 'text-purple-500/40',
        green: 'text-green-500/40',
        red: 'text-red-500/40',
        white: 'text-white/20'
    };

    return (
        <div className={`
            relative overflow-hidden rounded-lg border
            bg-gradient-to-br ${colorStyles[color]}
            p-3 sm:p-4
        `}>
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.02),transparent)]" />
            
            <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs text-white/40 tracking-widest uppercase truncate pr-2">
                        {label}
                    </p>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${iconStyles[color]}`} />
                </div>
                
                {loading ? (
                    <div className="h-6 w-12 bg-white/[0.06] animate-pulse rounded" />
                ) : (
                    <p className="text-xl sm:text-2xl font-light text-white">
                        {value?.toLocaleString('en-IN') ?? '0'}
                    </p>
                )}
            </div>
        </div>
    );
}
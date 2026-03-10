'use client';

import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import RecentBookings from '@/components/admin/dashboard/RecentBookings';
import PopularServices from '@/components/admin/dashboard/PopularServices';
import BookingsByStatus from '@/components/admin/dashboard/BookingsByStatus';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import useDashboard from '@/hooks/useDashboard';
import { useSocket } from '@/context/SocketContext';
import { useEffect } from 'react';
import {
    Users,
    CalendarDays,
    IndianRupee,
    Wrench,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';

export default function DashboardPage() {
    const { stats, loading, refetch } = useDashboard();
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;
        socket.on('new_booking', () => refetch());
        socket.on('booking_status_updated', () => refetch());
        return () => {
            socket.off('new_booking');
            socket.off('booking_status_updated');
        };
    }, [socket, refetch]);

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Overview
                        </p>
                        <h1
                            className="text-xl sm:text-2xl font-light text-white"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            Good {getGreeting()},{' '}
                            <em>dashboard.</em>
                        </h1>
                    </div>
                    <p className="text-xs text-neutral-500">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* ── Stats Grid ── */}
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

                {/* ── Booking Status Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {[
                        {
                            label: 'Pending',
                            value: stats?.bookings?.byStatus?.pending ?? 0,
                            icon: Clock,
                        },
                        {
                            label: 'Confirmed',
                            value: stats?.bookings?.byStatus?.confirmed ?? 0,
                            icon: CalendarDays,
                        },
                        {
                            label: 'In Progress',
                            value: stats?.bookings?.byStatus?.inProgress ?? 0,
                            icon: TrendingUp,
                        },
                        {
                            label: 'Completed',
                            value: stats?.bookings?.byStatus?.completed ?? 0,
                            icon: CheckCircle,
                        },
                        {
                            label: 'Cancelled',
                            value: stats?.bookings?.byStatus?.cancelled ?? 0,
                            icon: XCircle,
                        }
                    ].map((item) => (
                        <StatusCard
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            icon={item.icon}
                            loading={loading}
                        />
                    ))}
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
        </DashboardLayout>
    );
}

// ── Status Mini Card ──
function StatusCard({ label, value, icon: Icon, loading }) {
    return (
        <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs text-neutral-500 tracking-widest uppercase truncate pr-2">
                    {label}
                </p>
                <Icon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            </div>
            {loading ? (
                <div className="h-6 w-12 bg-neutral-800 animate-pulse rounded" />
            ) : (
                <p className="text-xl sm:text-2xl font-light text-white">
                    {value}
                </p>
            )}
        </div>
    );
}

// ── Greeting Helper ──
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}
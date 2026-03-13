// src/app/admin/page.jsx
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
    ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
    const { stats, loading, refetch } = useDashboard();
    const { socket } = useSocket();

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

    return (
        <DashboardLayout>
            <div className=" max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1">
                        Dashboard
                    </h1>
                    <p className="text-sm text-zinc-400">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Users"
                        value={stats?.users?.total ?? 0}
                        icon={Users}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Bookings"
                        value={stats?.bookings?.total ?? 0}
                        icon={CalendarDays}
                        loading={loading}
                    />
                    <StatsCard
                        title="Revenue"
                        value={stats?.revenue?.total ?? 0}
                        icon={IndianRupee}
                        loading={loading}
                        prefix="₹"
                        isCurrency
                    />
                    <StatsCard
                        title="Services"
                        value={stats?.services?.total ?? 0}
                        icon={Wrench}
                        loading={loading}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <div className="lg:col-span-2">
                        <RevenueChart
                            data={stats?.bookingsByCategory}
                            loading={loading}
                        />
                    </div>
                    <div>
                        <BookingsByStatus
                            data={stats?.bookings?.byStatus}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <RecentBookings
                            bookings={stats?.recentBookings}
                            loading={loading}
                        />
                    </div>
                    <div>
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
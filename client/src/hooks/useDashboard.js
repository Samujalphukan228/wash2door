import { useState, useEffect, useCallback, useRef } from 'react';
import adminService from '@/services/adminService';
import { useSocket } from '@/context/SocketContext';

const useDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { onDashboardUpdate } = useSocket();
    const isFirstLoad = useRef(true);

    const fetchStats = useCallback(async () => {
        try {
            if (isFirstLoad.current) {
                setLoading(true);
            }
            setError(null);
            
            const response = await adminService.getDashboardStats();
            
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            isFirstLoad.current = false;
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const unsubscribe = onDashboardUpdate((data) => {
            fetchStats();
        });
        return unsubscribe;
    }, [onDashboardUpdate, fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
        revenue: stats?.revenue || {},
        expenses: stats?.expenses || {},
        profit: stats?.profit || {},
        bookings: stats?.bookings || {},
        users: stats?.users || {},
        services: stats?.services || {},
        weeklyData: stats?.weeklyData || [],
        monthlyData: stats?.monthlyData || [],
        recentBookings: stats?.recentBookings || [],
        popularServices: stats?.popularServices || [],
        bookingsByCategory: stats?.bookingsByCategory || [],
        upcomingToday: stats?.upcomingToday || []
    };
};

export default useDashboard;
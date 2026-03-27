import { useState, useEffect, useCallback } from 'react';
import adminService from '@/services/adminService';

const useDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
        
        // ✅ Helper getters for easier access
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
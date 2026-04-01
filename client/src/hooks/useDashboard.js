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
            
            // 🔍 DEBUG - Check what backend sends
            console.log('═══════════════════════════════════════');
            console.log('📊 RAW API RESPONSE:', response);
            console.log('📊 response.success:', response.success);
            console.log('📊 response.data:', response.data);
            console.log('📊 response.data.revenue:', response.data?.revenue);
            console.log('📊 response.data.expenses:', response.data?.expenses);
            console.log('📊 response.data.profit:', response.data?.profit);
            console.log('═══════════════════════════════════════');
            
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
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
            console.log('📊 Dashboard update received:', data);
            fetchStats();
        });
        return unsubscribe;
    }, [onDashboardUpdate, fetchStats]);

    // 🔍 DEBUG - Check what's being returned
    console.log('═══════════════════════════════════════');
    console.log('📊 HOOK RETURN VALUES:');
    console.log('stats:', stats);
    console.log('revenue:', stats?.revenue);
    console.log('expenses:', stats?.expenses);
    console.log('profit:', stats?.profit);
    console.log('═══════════════════════════════════════');

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
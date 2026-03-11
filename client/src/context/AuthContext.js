'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const loadUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axiosInstance.get('/auth/me');

            if (response.data.success) {
                const userData = response.data.data.user;

                if (userData.role !== 'admin') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setLoading(false);
                    return;
                }

                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // ✅ NEW: Refresh user data from backend
    const refreshUser = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/auth/me');

            if (response.data.success) {
                const userData = response.data.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    }, []);

    // ✅ NEW: Update user state directly (for instant UI update)
    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                '/auth/login',
                { email, password }
            );

            if (response.data.success) {
                const userData = response.data.data.user;

                if (userData.role !== 'admin') {
                    toast.error('Access denied. Admin only.');
                    return {
                        success: false,
                        message: 'Access denied. Admin only.'
                    };
                }

                localStorage.setItem(
                    'accessToken',
                    response.data.data.accessToken
                );
                localStorage.setItem(
                    'user',
                    JSON.stringify(userData)
                );

                setUser(userData);
                setIsAuthenticated(true);

                toast.success(
                    `Welcome back, ${userData.firstName}! 👋`
                );

                router.push('/admin/dashboard');
                return { success: true };
            }

        } catch (error) {
            const data = error.response?.data;
            const message = data?.message || 'Login failed';
            const remainingAttempts = data?.remainingAttempts;

            if (!remainingAttempts) {
                toast.error(message);
            }

            return {
                success: false,
                message,
                remainingAttempts
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            router.push('/admin/login');
            toast.success('Logged out successfully');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            login,
            logout,
            loadUser,
            refreshUser,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            'useAuth must be used within AuthProvider'
        );
    }
    return context;
};

export default AuthContext;
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Sidebar from './Sidebar';
import Header from './Header';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }) {
    const { user, isAuthenticated, loading } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Protect route
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/admin/login');
        }
        if (!loading && isAuthenticated && user?.role !== 'admin') {
            router.push('/admin/login');
        }
    }, [isAuthenticated, loading, user, router]);

    // Socket notifications
    useEffect(() => {
        if (!socket) return;

        socket.on('new_booking', (data) => {
            toast(`New booking: ${data.bookingCode}`, {
                icon: '📅',
                style: {
                    background: '#ffffff',
                    color: '#0a0a0a',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    fontSize: '13px'
                }
            });
        });

        socket.on('booking_status_updated', (data) => {
            toast(`Booking ${data.bookingCode} → ${data.status}`, {
                icon: '🔄',
                style: {
                    background: '#ffffff',
                    color: '#0a0a0a',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    fontSize: '13px'
                }
            });
        });

        return () => {
            socket.off('new_booking');
            socket.off('booking_status_updated');
        };
    }, [socket]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                        Loading
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-black flex">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-60 transition-all duration-300 min-w-0">

                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                    {children}
                </main>

            </div>
        </div>
    );
}
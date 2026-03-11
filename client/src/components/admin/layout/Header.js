'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import {
    Bell,
    Menu,
} from 'lucide-react';

const pageTitles = {
    '/admin/dashboard': {
        title: 'Dashboard',
        subtitle: 'Overview of your business'
    },
    '/admin/bookings': {
        title: 'Bookings',
        subtitle: 'Manage all bookings'
    },
    '/admin/services': {
        title: 'Services',
        subtitle: 'Manage your services'
    },
    '/admin/users': {
        title: 'Users',
        subtitle: 'Manage customers'
    },
    '/admin/reviews': {
        title: 'Reviews',
        subtitle: 'Customer reviews'
    },
    '/admin/reports': {
        title: 'Reports',
        subtitle: 'Analytics and reports'
    },
    '/admin/settings': {
        title: 'Settings',
        subtitle: 'Account settings'
    }
};

// Helper to get avatar URL
const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (typeof avatar === 'object' && avatar?.url) return avatar.url;
    if (typeof avatar === 'string') {
        if (avatar === 'default-avatar.png') return null;
        if (avatar.startsWith('http')) return avatar;
    }
    return null;
};

export default function Header({ onMenuClick }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { isConnected } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [time, setTime] = useState('');

    const pageInfo = pageTitles[pathname] || {
        title: 'Admin',
        subtitle: ''
    };

    const avatarUrl = getAvatarUrl(user?.avatar);

    useEffect(() => {
        const updateTime = () => {
            setTime(new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-14 sm:h-16 border-b border-neutral-800 bg-black flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">

            {/* Left */}
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div>
                    <h1 className="text-sm sm:text-base font-semibold text-white">
                        {pageInfo.title}
                    </h1>
                    {pageInfo.subtitle && (
                        <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">
                            {pageInfo.subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-5">

                {/* Time */}
                <span className="text-xs text-neutral-500 font-mono hidden md:block">
                    {time}
                </span>

                {/* Socket Status */}
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-white' : 'bg-neutral-600'
                    }`} />
                    <span className="text-xs text-neutral-500 hidden md:block">
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <Bell className="w-4 h-4" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-10 w-72 sm:w-80 bg-black border border-neutral-800 shadow-xl z-50">
                            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                                <p className="text-xs font-medium text-white tracking-widest uppercase">
                                    Notifications
                                </p>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => setNotifications([])}
                                        className="text-xs text-neutral-500 hover:text-white transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-xs text-neutral-500">
                                        No new notifications
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notif, i) => (
                                        <div
                                            key={i}
                                            className="px-4 py-3 border-b border-neutral-800 hover:bg-neutral-900 transition-colors"
                                        >
                                            <p className="text-sm text-white">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {notif.time}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Avatar + Name */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-white shrink-0">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user?.firstName || 'Avatar'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-black text-xs font-medium">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-medium text-white">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">
                            Administrator
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import { Bell, Menu } from 'lucide-react';

const pageTitles = {
    '/admin/dashboard': {
        title: 'Dashboard',
        subtitle: 'Overview of your business',
    },
    '/admin/bookings': {
        title: 'Bookings',
        subtitle: 'Manage all bookings',
    },
    '/admin/categories': {
        title: 'Categories',
        subtitle: 'Manage categories',
    },
    '/admin/services': {
        title: 'Services',
        subtitle: 'Manage your services',
    },
    '/admin/users': {
        title: 'Users',
        subtitle: 'Manage customers',
    },
    '/admin/reports': {
        title: 'Reports',
        subtitle: 'Analytics and reports',
    },
    '/admin/settings': {
        title: 'Settings',
        subtitle: 'Account settings',
    },
};

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
    const notifRef = useRef(null);

    const pageInfo = pageTitles[pathname] || {
        title: 'Admin',
        subtitle: '',
    };

    const avatarUrl = getAvatarUrl(user?.avatar);

    // Clock
    useEffect(() => {
        const updateTime = () => {
            setTime(
                new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute instead of every second
        return () => clearInterval(interval);
    }, []);

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    return (
        <header className="h-14 sm:h-16 border-b border-neutral-800 bg-black/95 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                    aria-label="Open menu"
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
                <span className="text-xs text-neutral-500 font-mono hidden md:block tabular-nums">
                    {time}
                </span>

                {/* Socket Status */}
                <div className="flex items-center gap-1.5">
                    <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            isConnected ? 'bg-emerald-500' : 'bg-neutral-600'
                        }`}
                    />
                    <span className="text-xs text-neutral-500 hidden md:block">
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-72 sm:w-80 bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                                <p className="text-xs font-medium text-white">
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
                                    <Bell className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                                    <p className="text-xs text-neutral-500">
                                        No new notifications
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notif, i) => (
                                        <div
                                            key={i}
                                            className="px-4 py-3 border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors"
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

                {/* Divider */}
                <div className="w-px h-6 bg-neutral-800 hidden sm:block" />

                {/* User */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user?.firstName || 'Avatar'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-neutral-400 text-xs font-medium">
                                    {user?.firstName?.[0]}
                                    {user?.lastName?.[0]}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-medium text-white leading-none">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                            Admin
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
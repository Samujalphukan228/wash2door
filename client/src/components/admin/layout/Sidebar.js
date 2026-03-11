'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import {
    LayoutDashboard,
    CalendarDays,
    Wrench,
    Users,
    Star,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Car,
    Settings,
    X
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings',  href: '/admin/bookings',  icon: CalendarDays    },
    { label: 'Services',  href: '/admin/services',  icon: Wrench          },
    { label: 'Users',     href: '/admin/users',     icon: Users           },
    { label: 'Reviews',   href: '/admin/reviews',   icon: Star            },
    { label: 'Reports',   href: '/admin/reports',   icon: BarChart3       },
];

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

export default function Sidebar({ open, onClose }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const avatarUrl = getAvatarUrl(user?.avatar);

    return (
        <aside className={`
            fixed left-0 top-0 h-full bg-neutral-950 border-r border-neutral-800
            flex flex-col transition-all duration-300 z-50
            ${collapsed ? 'w-16' : 'w-60'}
            ${open ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
        `}>

            {/* Logo */}
            <div className={`
                flex items-center border-b border-neutral-800 shrink-0
                ${collapsed ? 'justify-center p-4 flex-col gap-3' : 'justify-between px-5 py-4'}
            `}>
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4 text-black" />
                    </div>
                    {!collapsed && (
                        <span className="text-sm font-medium text-white tracking-wide">
                            Wash2Door
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={onClose}
                        className="lg:hidden w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-6 h-6 items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        {collapsed
                            ? <ChevronRight className="w-4 h-4" />
                            : <ChevronLeft className="w-4 h-4" />
                        }
                    </button>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        pathname.startsWith(item.href + '/');

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : ''}
                            onClick={onClose}
                            className={`
                                flex items-center gap-3 px-3 py-2.5
                                text-sm transition-all rounded-sm group
                                ${collapsed ? 'justify-center' : ''}
                                ${isActive
                                    ? 'bg-white text-black'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${
                                isActive
                                    ? 'text-black'
                                    : 'text-neutral-500 group-hover:text-white'
                            }`} />
                            {!collapsed && (
                                <span className="font-medium">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-neutral-800 p-3 space-y-0.5 shrink-0">

                {/* Settings */}
                <Link
                    href="/admin/settings"
                    title={collapsed ? 'Settings' : ''}
                    onClick={onClose}
                    className={`
                        flex items-center gap-3 px-3 py-2.5
                        text-sm transition-all rounded-sm
                        ${pathname === '/admin/settings'
                            ? 'bg-white text-black'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <Settings className={`w-4 h-4 shrink-0 ${
                        pathname === '/admin/settings'
                            ? 'text-black'
                            : 'text-neutral-500'
                    }`} />
                    {!collapsed && (
                        <span className="font-medium">Settings</span>
                    )}
                </Link>

                {/* User Info */}
                {!collapsed && (
                    <div className="px-3 py-3 border-t border-neutral-800 mt-1 flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={user?.firstName || 'Avatar'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 uppercase">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Collapsed - just show avatar */}
                {collapsed && (
                    <div className="flex justify-center py-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={user?.firstName || 'Avatar'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 uppercase">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={logout}
                    title={collapsed ? 'Logout' : ''}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5
                        text-sm text-neutral-400 hover:text-white
                        hover:bg-neutral-800 rounded-sm transition-all
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut className="w-4 h-4 shrink-0 text-neutral-500" />
                    {!collapsed && (
                        <span className="font-medium">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
}
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
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Car,
    Settings,
    Layers,
    X,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Services', href: '/admin/services', icon: Wrench },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

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

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            className={`
                fixed left-0 top-0 h-full bg-neutral-950 border-r border-neutral-800
                flex flex-col transition-all duration-300 z-50
                ${collapsed ? 'w-[68px]' : 'w-60'}
                ${open ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}
        >
            {/* Logo */}
            <div
                className={`
                    flex items-center border-b border-neutral-800 shrink-0 h-14 sm:h-16
                    ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}
                `}
            >
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4 text-black" />
                    </div>
                    {!collapsed && (
                        <span className="text-sm font-semibold text-white tracking-wide">
                            Wash2Door
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={onClose}
                        className="lg:hidden w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-neutral-800"
                        aria-label="Close sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="hidden lg:flex w-7 h-7 items-center justify-center text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-neutral-800"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 items-center justify-center bg-neutral-800 border border-neutral-700 rounded-full text-neutral-400 hover:text-white transition-colors"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider px-3 mb-2">
                        Menu
                    </p>
                )}

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : ''}
                            onClick={onClose}
                            className={`
                                flex items-center gap-3 px-3 py-2.5
                                text-sm transition-all rounded-md group
                                ${collapsed ? 'justify-center' : ''}
                                ${active
                                    ? 'bg-white text-black'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                                }
                            `}
                        >
                            <Icon
                                className={`w-4 h-4 shrink-0 ${
                                    active
                                        ? 'text-black'
                                        : 'text-neutral-500 group-hover:text-white'
                                }`}
                            />
                            {!collapsed && (
                                <span className="font-medium">{item.label}</span>
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
                        text-sm transition-all rounded-md
                        ${isActive('/admin/settings')
                            ? 'bg-white text-black'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                        }
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <Settings
                        className={`w-4 h-4 shrink-0 ${
                            isActive('/admin/settings')
                                ? 'text-black'
                                : 'text-neutral-500'
                        }`}
                    />
                    {!collapsed && <span className="font-medium">Settings</span>}
                </Link>

                {/* User Info */}
                {!collapsed && (
                    <div className="px-3 py-3 border-t border-neutral-800 mt-2 flex items-center gap-3">
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
                                    {user?.firstName?.[0]}
                                    {user?.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Collapsed Avatar */}
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
                                    {user?.firstName?.[0]}
                                    {user?.lastName?.[0]}
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
                        text-sm text-neutral-400 hover:text-red-400
                        hover:bg-red-500/5 rounded-md transition-all
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </button>

                {/* Branding */}
                <div
                    className={`
                        pt-3 mt-2 border-t border-neutral-800
                        ${collapsed ? 'px-1' : 'px-3'}
                    `}
                >
                    {!collapsed ? (
                        <p className="text-[10px] text-neutral-600 text-center tracking-wide">
                            Made by{' '}
                            <a
                                href="https://nexxupp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-white transition-colors"
                            >
                                Nexxupp
                            </a>
                        </p>
                    ) : (
                        <p className="text-[8px] text-neutral-600 text-center">
                            <a
                                href="https://nexxupp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                                title="Made by Nexxupp"
                            >
                                NX
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </aside>
    );
}
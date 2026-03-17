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
    { label: 'Subcategories', href: '/admin/subcategories', icon: Layers },
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
    const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            className={`
                fixed left-0 top-0 h-full bg-neutral-950
                flex flex-col transition-all duration-300 ease-in-out z-50
                border-r border-neutral-800/60
                ${collapsed ? 'w-[60px]' : 'w-[220px]'}
                ${open ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}
        >
            {/* Logo */}
            <div className={`
                flex items-center h-[52px] shrink-0 border-b border-neutral-800/60
                ${collapsed ? 'justify-center px-0' : 'px-4 justify-between'}
            `}>
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 bg-white rounded-[5px] flex items-center justify-center shrink-0">
                        <Car className="w-3.5 h-3.5 text-black" />
                    </div>
                    {!collapsed && (
                        <span className="text-[13px] font-semibold text-white tracking-[-0.01em]">
                            Wash2Door
                        </span>
                    )}
                </div>

                {!collapsed && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onClose}
                            className="lg:hidden w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-300 transition-colors rounded"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setCollapsed(true)}
                            className="hidden lg:flex w-6 h-6 items-center justify-center text-neutral-600 hover:text-neutral-300 transition-colors rounded hover:bg-neutral-800/60"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="hidden lg:flex absolute -right-2.5 top-[18px] w-5 h-5 items-center justify-center bg-neutral-900 border border-neutral-700/80 rounded-full text-neutral-500 hover:text-neutral-200 transition-colors shadow-sm"
                    >
                        <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-widest px-4 mb-1.5">
                        Menu
                    </p>
                )}

                <div className="px-2 space-y-px">
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
                                    flex items-center gap-2.5 px-2.5 py-2
                                    text-[13px] rounded-md transition-all duration-150 group
                                    ${collapsed ? 'justify-center' : ''}
                                    ${active
                                        ? 'bg-white text-black'
                                        : 'text-neutral-500 hover:text-neutral-100 hover:bg-neutral-800/50'
                                    }
                                `}
                            >
                                <Icon
                                    className={`w-[15px] h-[15px] shrink-0 transition-colors ${
                                        active ? 'text-black' : 'text-neutral-600 group-hover:text-neutral-300'
                                    }`}
                                />
                                {!collapsed && (
                                    <span className="font-medium tracking-[-0.01em]">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom */}
            <div className="border-t border-neutral-800/60 p-2 space-y-px shrink-0">

                {/* Settings */}
                <Link
                    href="/admin/settings"
                    title={collapsed ? 'Settings' : ''}
                    onClick={onClose}
                    className={`
                        flex items-center gap-2.5 px-2.5 py-2
                        text-[13px] rounded-md transition-all duration-150 group
                        ${isActive('/admin/settings')
                            ? 'bg-white text-black'
                            : 'text-neutral-500 hover:text-neutral-100 hover:bg-neutral-800/50'
                        }
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <Settings
                        className={`w-[15px] h-[15px] shrink-0 ${
                            isActive('/admin/settings') ? 'text-black' : 'text-neutral-600 group-hover:text-neutral-300'
                        }`}
                    />
                    {!collapsed && <span className="font-medium tracking-[-0.01em]">Settings</span>}
                </Link>

                {/* Logout */}
                <button
                    onClick={logout}
                    title={collapsed ? 'Logout' : ''}
                    className={`
                        w-full flex items-center gap-2.5 px-2.5 py-2
                        text-[13px] text-neutral-500 hover:text-red-400
                        hover:bg-red-500/[0.06] rounded-md transition-all duration-150
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut className="w-[15px] h-[15px] shrink-0" />
                    {!collapsed && <span className="font-medium tracking-[-0.01em]">Logout</span>}
                </button>

                {/* User Info */}
                <div className={`pt-2 mt-1 border-t border-neutral-800/60 ${collapsed ? 'flex justify-center pb-1' : 'px-1 pb-1'}`}>
                    {!collapsed ? (
                        <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-neutral-800/40 transition-colors cursor-default">
                            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-neutral-800 shrink-0 ring-1 ring-neutral-700/50">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={user?.firstName || 'Avatar'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-neutral-400 uppercase">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-neutral-200 truncate leading-tight tracking-[-0.01em]">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[11px] text-neutral-600 truncate leading-tight mt-0.5">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-neutral-800 ring-1 ring-neutral-700/50">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={user?.firstName || 'Avatar'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-neutral-400 uppercase">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Branding */}
                <div className={`pt-2 border-t border-neutral-800/60 ${collapsed ? 'px-0' : 'px-1'}`}>
                    {!collapsed ? (
                        <p className="text-[10px] text-neutral-700 text-center tracking-wide">
                            Built by{' '}
                            <a
                                href="https://nexxupp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                Nexxupp
                            </a>
                        </p>
                    ) : (
                        <p className="text-[8px] text-neutral-700 text-center">
                            <a
                                href="https://nexxupp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-400 transition-colors"
                                title="Built by Nexxupp"
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import {
    LayoutDashboard, CalendarDays, Wrench,
    Users, BarChart3, LogOut, Car,
    Settings, Layers, User, X,
} from 'lucide-react';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'Reports',   href: '/admin/reports',   icon: BarChart3 },
        ],
    },
    {
        label: 'Manage',
        items: [
            { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
            { label: 'Users',    href: '/admin/users',    icon: Users },
        ],
    },
    {
        label: 'Catalog',
        items: [
            { label: 'Categories',    href: '/admin/categories',    icon: Layers },
            { label: 'Subcategories', href: '/admin/subcategories', icon: Layers },
            { label: 'Services',      href: '/admin/services',      icon: Wrench },
        ],
    },
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

function NavItem({ item, isActive, onClick }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`
                group flex items-center gap-2.5 px-3 py-2 rounded-lg
                text-[13px] font-medium transition-all duration-150 select-none
                ${isActive
                    ? 'bg-white text-black'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.05] active:bg-white/[0.08]'
                }
            `}
        >
            <Icon
                className={`h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-black' : 'text-gray-600 group-hover:text-gray-300'}`}
                strokeWidth={isActive ? 2.5 : 2}
            />
            <span>{item.label}</span>
        </Link>
    );
}

export default function Sidebar({ onLogout, onClose, isMobile = false }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const avatarUrl = getAvatarUrl(user?.avatar);
    const isActive = (href) => pathname === href || pathname.startsWith(href + '/');
    const handleNavClick = () => { if (isMobile && onClose) onClose(); };

    const userName = user?.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : 'Admin User';

    return (
        <aside className="flex flex-col w-full h-full bg-[#0A0A0A] border-r border-white/[0.06]">

            {/* Logo */}
            <div className="h-14 sm:h-16 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
                <Link
                    href="/admin/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2.5 group"
                >
                    <div className="h-8 w-8 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center transition-all duration-200 group-hover:border-white/[0.15] group-hover:bg-white/[0.05]">
                        <Car className="h-[15px] w-[15px] text-gray-500 group-hover:text-gray-300 transition-colors duration-200" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-white leading-tight">Wash2Door</p>
                        <p className="text-[10px] text-gray-600 leading-tight mt-0.5">Admin Panel</p>
                    </div>
                </Link>

                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                        aria-label="Close menu"
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[9px] font-semibold text-gray-700 uppercase tracking-[0.12em] px-3 mb-1">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavItem
                                    key={item.href}
                                    item={item}
                                    isActive={isActive(item.href)}
                                    onClick={handleNavClick}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-0.5">

                <NavItem
                    item={{ label: 'Settings', href: '/admin/settings', icon: Settings }}
                    isActive={isActive('/admin/settings')}
                    onClick={handleNavClick}
                />

                <button
                    onClick={() => { handleNavClick(); onLogout?.(); }}
                    className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] active:bg-red-500/[0.12] transition-all duration-150"
                >
                    <LogOut className="h-4 w-4 shrink-0 group-hover:text-red-400 transition-colors" strokeWidth={2} />
                    Logout
                </button>

                {/* User card */}
                <div className="pt-2 mt-1 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 cursor-default">
                        <div className="relative w-7 h-7 rounded-lg border border-white/[0.1] bg-white/[0.04] flex items-center justify-center overflow-hidden shrink-0">
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt={userName} fill className="object-cover" />
                            ) : (
                                <User className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-white truncate leading-tight">{userName}</p>
                            <p className="text-[10px] text-gray-600 truncate leading-tight mt-0.5">{user?.email ?? '—'}</p>
                        </div>
                    </div>
                </div>

                <p className="text-[9px] text-gray-700 text-center pt-1.5">
                    Built by{' '}
                    <a href="https://nexxupp.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors">
                        Nexxupp
                    </a>
                </p>
            </div>
        </aside>
    );
}
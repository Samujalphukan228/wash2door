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
            { label: 'Dashboard',     href: '/admin/dashboard',     icon: LayoutDashboard },
            { label: 'Reports',       href: '/admin/reports',       icon: BarChart3 },
        ],
    },
    {
        label: 'Manage',
        items: [
            { label: 'Bookings',      href: '/admin/bookings',      icon: CalendarDays },
            { label: 'Users',         href: '/admin/users',         icon: Users },
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
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200 ease-out select-none
                ${isActive
                    ? 'bg-white text-black'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.05] active:bg-white/[0.08]'
                }
            `}
        >
            <Icon
                className={`h-[17px] w-[17px] shrink-0 ${isActive ? 'text-black' : 'text-gray-500'}`}
                strokeWidth={isActive ? 2.5 : 2}
            />
            <span>{item.label}</span>
        </Link>
    );
}

/**
 * Sidebar
 * @param {function} onLogout  - logout handler
 * @param {function} onClose   - close drawer (mobile only, optional)
 * @param {boolean}  isMobile  - if true, renders without hidden/show logic (parent controls visibility)
 */
export default function Sidebar({ onLogout, onClose, isMobile = false }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const avatarUrl = getAvatarUrl(user?.avatar);
    const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

    const handleNavClick = () => {
        if (isMobile && onClose) onClose();
    };

    return (
        <aside className="flex flex-col w-full h-full bg-[#0A0A0A] border-r border-white/[0.08]">

            {/* ── Logo row ───────────────────────────────────────────── */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08] shrink-0">
                <Link
                    href="/admin/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 group"
                >
                    <div className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-white/[0.05]">
                        <Car
                            className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors duration-300"
                            strokeWidth={2}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-tight">Wash2Door</p>
                        <p className="text-[11px] text-gray-600 leading-tight mt-0.5">Admin Panel</p>
                    </div>
                </Link>

                {/* Close button — mobile drawer only */}
                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                )}
            </div>

            {/* ── Navigation ─────────────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-[0.1em] px-3 mb-1.5">
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

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="p-3 border-t border-white/[0.08] shrink-0 space-y-0.5">

                {/* Settings */}
                <NavItem
                    item={{ label: 'Settings', href: '/admin/settings', icon: Settings }}
                    isActive={isActive('/admin/settings')}
                    onClick={handleNavClick}
                />

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08]
                        active:bg-red-500/[0.12] transition-all duration-200 ease-out"
                >
                    <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
                    <span>Logout</span>
                </button>

                {/* User card */}
                <div className="pt-2 mt-1 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] cursor-default">
                        <div className="relative w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center overflow-hidden shrink-0">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={user?.firstName || 'User'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <User className="h-4 w-4 text-gray-500" strokeWidth={2} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium text-white truncate leading-tight">
                                {user?.firstName
                                    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
                                    : 'Admin User'}
                            </p>
                            <p className="text-[11px] text-gray-600 truncate leading-tight mt-0.5">
                                {user?.email ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <p className="text-[10px] text-gray-700 text-center pt-2 pb-0.5">
                    Built by{' '}
                    <a
                        href="https://nexxupp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-400 transition-colors"
                    >
                        Nexxupp
                    </a>
                </p>
            </div>
        </aside>
    );
}
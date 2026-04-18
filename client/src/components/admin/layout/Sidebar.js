'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import {
    LayoutDashboard, CalendarDays, Wrench,
    Users, BarChart3, LogOut, Car,
    Settings, Layers, X,
} from 'lucide-react';

// ============================================
// DATA
// ============================================

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

// ============================================
// UTILS
// ============================================

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (typeof avatar === 'object' && avatar?.url) return avatar.url;
    if (typeof avatar === 'string') {
        if (avatar === 'default-avatar.png') return null;
        if (avatar.startsWith('http')) return avatar;
    }
    return null;
};

// ============================================
// NAV ITEM
// ============================================

function NavItem({ item, isActive, onClick }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all select-none ${
                isActive
                    ? 'bg-white text-black'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] active:bg-white/[0.06]'
            }`}
        >
            <Icon
                className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    isActive ? 'text-black' : 'text-white/30 group-hover:text-white/60'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
            />
            <span>{item.label}</span>
        </Link>
    );
}

// ============================================
// SIDEBAR
// ============================================

export default function Sidebar({ onLogout, onClose, isMobile = false }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const avatarUrl   = getAvatarUrl(user?.avatar);
    const isActive    = (href) => pathname === href || pathname.startsWith(href + '/');
    const handleNavClick = () => { if (isMobile && onClose) onClose(); };
    const userName    = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Admin User';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <aside className="flex flex-col w-full h-full bg-black border-r border-white/[0.06]">

            {/* ── Logo ── */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
                <Link
                    href="/admin/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2.5"
                >
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Car className="h-4 w-4 text-black" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white leading-tight">Wash2Door</p>
                        <p className="text-[10px] text-white/30 leading-tight mt-0.5">Admin Panel</p>
                    </div>
                </Link>

                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.12em] px-3 mb-1.5">
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

            {/* ── Footer ── */}
            <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-0.5">

                <NavItem
                    item={{ label: 'Settings', href: '/admin/settings', icon: Settings }}
                    isActive={isActive('/admin/settings')}
                    onClick={handleNavClick}
                />

                <button
                    onClick={() => { handleNavClick(); onLogout?.(); }}
                    className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/[0.12] transition-all"
                >
                    <LogOut className="h-3.5 w-3.5 shrink-0 group-hover:text-red-400 transition-colors" strokeWidth={2} />
                    Logout
                </button>

                {/* User card */}
                <div className="pt-2 mt-1 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <div className="relative w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt={userName} fill className="object-cover" />
                            ) : (
                                <span className="text-[10px] font-semibold text-white/50">
                                    {userInitial}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-white/80 truncate leading-tight">
                                {userName}
                            </p>
                            <p className="text-[10px] text-white/30 truncate leading-tight mt-0.5">
                                {user?.email ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-[9px] text-white/20 text-center pt-1.5">
                    Built by{' '}
                    <a
                        href="https://nexxupp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-white/50 transition-colors"
                    >
                        Nexxupp
                    </a>
                </p>
            </div>
        </aside>
    );
}
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import { User, LogOut, WifiOff, Car, Menu } from 'lucide-react';

const APP_VERSION = '1.0.0';

const PAGE_TITLES = {
    '/admin/dashboard':     { title: 'Dashboard',     subtitle: 'Overview & analytics' },
    '/admin/bookings':      { title: 'Bookings',       subtitle: 'Manage all bookings' },
    '/admin/categories':    { title: 'Categories',     subtitle: 'Service categories' },
    '/admin/subcategories': { title: 'Subcategories',  subtitle: 'Service subcategories' },
    '/admin/services':      { title: 'Services',       subtitle: 'Your service catalog' },
    '/admin/users':         { title: 'Users',          subtitle: 'Customer management' },
    '/admin/reports':       { title: 'Reports',        subtitle: 'Analytics & insights' },
    '/admin/settings':      { title: 'Settings',       subtitle: 'Account & preferences' },
};

function getAvatarUrl(avatar) {
    if (!avatar) return null;
    if (typeof avatar === 'object' && avatar?.url) return avatar.url;
    if (typeof avatar === 'string') {
        if (avatar === 'default-avatar.png') return null;
        if (avatar.startsWith('http')) return avatar;
    }
    return null;
}

function getPageInfo(pathname) {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    for (const key of Object.keys(PAGE_TITLES)) {
        if (pathname.startsWith(key + '/')) return PAGE_TITLES[key];
    }
    return { title: 'Admin', subtitle: '' };
}

function Dropdown({ open, onClose, buttonRef, className = '', children }) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) onClose();
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [open, onClose, buttonRef]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <div
            ref={panelRef}
            className={`
                absolute right-0 mt-2 z-50
                rounded-2xl border border-white/[0.08]
                bg-[#0A0A0A] shadow-2xl shadow-black/80
                transition-all duration-200 ease-out origin-top-right
                ${open
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }
                ${className}
            `}
            aria-hidden={!open}
        >
            {children}
        </div>
    );
}

function VersionPill() {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
            bg-emerald-500/10 border border-emerald-500/35 text-emerald-300
            shadow-[0_0_18px_rgba(16,185,129,0.18)]
            select-none shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold leading-none whitespace-nowrap">v{APP_VERSION}</span>
        </span>
    );
}

export default function Header({ onLogout, onMenuClick }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { isConnected, socket } = useSocket();

    const [showUser, setShowUser] = useState(false);
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    const userBtnRef = useRef(null);

    const pageInfo = getPageInfo(pathname);
    const avatarUrl = getAvatarUrl(user?.avatar);
    const userName = user?.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : 'Admin';

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
            );
            setDate(
                now.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                })
            );
        };
        tick();
        const id = setInterval(tick, 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        setShowUser(false);
    }, [pathname]);

    const toggleUser = useCallback(() => {
        setShowUser((p) => !p);
    }, []);
    const handleLogoutClick = useCallback(() => {
        setShowUser(false);
        onLogout?.();
    }, [onLogout]);

    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-xl">
            <div className="flex h-14 sm:h-16 items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
                {/* Left */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Mobile menu button — hidden on phones (uses bottom nav), visible on tablet only */}
                    <button
                        onClick={onMenuClick}
                        className="hidden sm:flex lg:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] active:bg-white/[0.08] transition-all"
                        aria-label="Open menu"
                    >
                        <Menu className="w-[15px] h-[15px]" strokeWidth={2} />
                    </button>

                    {/* Mobile + Tablet: logo + page + version */}
                    <div className="lg:hidden flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-7 w-7 shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
                            <Car className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white leading-tight truncate">
                                Wash2Door
                            </p>
                            <p className="text-[10px] text-gray-600 leading-tight truncate">
                                {pageInfo.title}
                            </p>
                        </div>

                        <VersionPill />
                    </div>

                    {/* Desktop: page title + version */}
                    <div className="hidden lg:flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-base font-semibold text-white tracking-tight leading-tight truncate">
                                {pageInfo.title}
                            </h1>
                            <VersionPill />
                        </div>

                        {pageInfo.subtitle && (
                            <p className="text-[11px] text-gray-600 leading-tight mt-0.5 truncate">
                                {pageInfo.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {/* Clock */}
                    <div className="hidden md:flex flex-col items-end mr-1 select-none">
                        <span className="text-[12px] font-semibold text-gray-300 tabular-nums leading-tight">{time}</span>
                        <span className="text-[10px] text-gray-600 leading-tight mt-0.5">{date}</span>
                    </div>

                    {/* Live/offline pill */}
                    <div
                        className={`
                        hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        text-[10px] font-medium border transition-all duration-500 shrink-0
                        ${
                            isConnected
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-white/[0.03] text-gray-600 border-white/[0.06]'
                        }
                    `}
                    >
                        {isConnected ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="hidden lg:inline">Live</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-3 h-3 shrink-0" strokeWidth={2} />
                                <span className="hidden lg:inline">Offline</span>
                            </>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-4 bg-white/[0.08] mx-0.5 shrink-0" aria-hidden="true" />

                    {/* User menu */}
                    <div className="relative">
                        <button
                            ref={userBtnRef}
                            onClick={toggleUser}
                            aria-expanded={showUser}
                            aria-label="User menu"
                            className={`
                                flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg border
                                transition-all duration-200
                                ${
                                    showUser
                                        ? 'border-white/20 bg-white/10'
                                        : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]'
                                }
                            `}
                        >
                            {/* Avatar */}
                            <div className="w-6 h-6 rounded-md border border-white/[0.1] bg-white/[0.06] flex items-center justify-center overflow-hidden shrink-0">
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt={userName} width={24} height={24} className="object-cover w-full h-full" />
                                ) : (
                                    <User className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                )}
                            </div>
                            <span className="hidden sm:block text-[12px] font-medium text-gray-300 max-w-[80px] truncate">
                                {user?.firstName || 'Admin'}
                            </span>
                        </button>

                        <Dropdown
                            open={showUser}
                            onClose={() => setShowUser(false)}
                            buttonRef={userBtnRef}
                            className="w-[calc(100vw-1.5rem)] sm:w-[200px] -right-2 sm:right-0"
                        >
                            {/* User info */}
                            <div className="p-3 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.04] flex items-center justify-center overflow-hidden shrink-0">
                                        {avatarUrl ? (
                                            <Image src={avatarUrl} alt={userName} width={32} height={32} className="object-cover w-full h-full" />
                                        ) : (
                                            <User className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-white truncate leading-tight">{userName}</p>
                                        <p className="text-[10px] text-gray-600 truncate mt-0.5">{user?.email ?? '—'}</p>
                                    </div>
                                </div>

                                {/* Version pill (green) */}
                                <div className="mt-2">
                                    <VersionPill />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-1.5">
                                <button
                                    onClick={handleLogoutClick}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] active:bg-red-500/[0.12] transition-all duration-200"
                                >
                                    <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                                    Sign out
                                </button>
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
}
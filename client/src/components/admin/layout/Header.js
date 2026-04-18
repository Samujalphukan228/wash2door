'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import {
    LogOut, WifiOff, Car, Menu, ChevronDown, Settings, Shield,
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

const APP_VERSION = '2.0.0';

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

// ============================================
// UTILS
// ============================================

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

// ============================================
// DROPDOWN
// ============================================

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
            aria-hidden={!open}
            className={`
                absolute right-0 mt-2 z-50
                rounded-xl border border-white/[0.08]
                bg-black/95 backdrop-blur-xl
                shadow-2xl shadow-black/60
                transition-all duration-200 ease-out origin-top-right
                ${open
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }
                ${className}
            `}
        >
            {children}
        </div>
    );
}

// ============================================
// VERSION PILL
// ============================================

function VersionPill() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-medium leading-none whitespace-nowrap">
                v{APP_VERSION}
            </span>
        </span>
    );
}

// ============================================
// CONNECTION STATUS
// ============================================

function ConnectionStatus({ isConnected }) {
    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-300 shrink-0 ${
            isConnected
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
        }`}>
            {isConnected ? (
                <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden sm:inline">Live</span>
                </>
            ) : (
                <>
                    <WifiOff className="w-3 h-3 shrink-0" strokeWidth={2} />
                    <span className="hidden sm:inline">Offline</span>
                </>
            )}
        </div>
    );
}

// ============================================
// AVATAR
// ============================================

function Avatar({ avatarUrl, userName, userInitial, size = 'sm' }) {
    const dim = size === 'lg'
        ? 'w-10 h-10 rounded-xl text-sm'
        : 'w-7 h-7 rounded-lg text-xs';

    return (
        <div className={`${dim} bg-white/[0.06] flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-white/[0.08]`}>
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    alt={userName}
                    width={size === 'lg' ? 40 : 28}
                    height={size === 'lg' ? 40 : 28}
                    className="object-cover w-full h-full"
                />
            ) : (
                <span className="font-semibold text-white/60">{userInitial}</span>
            )}
        </div>
    );
}

// ============================================
// MAIN HEADER
// ============================================

export default function Header({ onLogout, onMenuClick }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { isConnected } = useSocket();

    const [showUser, setShowUser] = useState(false);
    const [time, setTime]         = useState('');
    const [date, setDate]         = useState('');

    const userBtnRef  = useRef(null);
    const pageInfo    = getPageInfo(pathname);
    const avatarUrl   = getAvatarUrl(user?.avatar);
    const userName    = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Admin';
    const userInitial = userName.charAt(0).toUpperCase();

    // Clock
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
            setDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
        };
        tick();
        const id = setInterval(tick, 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => { setShowUser(false); }, [pathname]);

    const toggleUser       = useCallback(() => setShowUser((p) => !p), []);
    const handleLogoutClick = useCallback(() => { setShowUser(false); onLogout?.(); }, [onLogout]);

    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/90 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">

                {/* ── Left ── */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">

                    {/* Tablet hamburger */}
                    <button
                        onClick={onMenuClick}
                        aria-label="Open menu"
                        className="hidden sm:flex lg:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
                    >
                        <Menu className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* Mobile / Tablet: logo + page title */}
                    <div className="lg:hidden flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-white flex items-center justify-center">
                            <Car className="h-4 w-4 text-black" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                            <p className="text-sm font-semibold text-white leading-tight truncate">
                                {pageInfo.title}
                            </p>
                            <VersionPill />
                        </div>
                    </div>

                    {/* Desktop: page title */}
                    <div className="hidden lg:flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-sm font-semibold text-white tracking-tight truncate">
                                    {pageInfo.title}
                                </h1>
                                <VersionPill />
                            </div>
                            {pageInfo.subtitle && (
                                <p className="text-[10px] text-white/40 leading-tight mt-0.5 truncate">
                                    {pageInfo.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right ── */}
                <div className="flex items-center gap-2 shrink-0">

                    {/* Clock — desktop only */}
                    <div className="hidden lg:flex items-center mr-1">
                        <div className="flex flex-col items-end select-none">
                            <span className="text-xs font-medium text-white tabular-nums leading-tight">
                                {time}
                            </span>
                            <span className="text-[10px] text-white/30 leading-tight">{date}</span>
                        </div>
                    </div>

                    {/* Connection status */}
                    <ConnectionStatus isConnected={isConnected} />

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-5 bg-white/[0.08] mx-1" />

                    {/* User button + dropdown */}
                    <div className="relative">
                        <button
                            ref={userBtnRef}
                            onClick={toggleUser}
                            aria-expanded={showUser}
                            aria-label="User menu"
                            className={`flex items-center gap-2 h-9 px-1.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                                showUser ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                            }`}
                        >
                            <Avatar avatarUrl={avatarUrl} userName={userName} userInitial={userInitial} size="sm" />
                            <div className="hidden sm:flex items-center gap-1 pr-1">
                                <span className="text-xs font-medium text-white/70 max-w-[70px] truncate">
                                    {user?.firstName || 'Admin'}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-200 ${
                                    showUser ? 'rotate-180' : ''
                                }`} />
                            </div>
                        </button>

                        <Dropdown
                            open={showUser}
                            onClose={() => setShowUser(false)}
                            buttonRef={userBtnRef}
                            className="w-56 sm:w-52"
                        >
                            {/* User info */}
                            <div className="p-3">
                                <div className="flex items-center gap-3">
                                    <Avatar avatarUrl={avatarUrl} userName={userName} userInitial={userInitial} size="lg" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-white truncate">{userName}</p>
                                        <p className="text-[10px] text-white/40 truncate">
                                            {user?.email ?? 'admin@wash2door.com'}
                                        </p>
                                    </div>
                                </div>

                                {/* Role badge */}
                                <div className="mt-2.5">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                                        <Shield className="w-3 h-3 text-white/30" />
                                        <span className="text-[10px] font-medium text-white/40">
                                            Administrator
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/[0.06]" />

                            {/* Actions */}
                            <div className="p-1.5 space-y-0.5">
                                <button
                                    onClick={() => setShowUser(false)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogoutClick}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign out
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="px-3 py-2 border-t border-white/[0.04] bg-white/[0.02]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/25">Wash2Door Admin</span>
                                    <VersionPill />
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
}
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Image from 'next/image';
import { Bell, User, LogOut, Zap, WifiOff, Car } from 'lucide-react';

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES = {
    '/admin/dashboard':     { title: 'Dashboard',     subtitle: 'Overview of your business' },
    '/admin/bookings':      { title: 'Bookings',       subtitle: 'Manage all bookings' },
    '/admin/categories':    { title: 'Categories',     subtitle: 'Manage service categories' },
    '/admin/subcategories': { title: 'Subcategories',  subtitle: 'Manage subcategories' },
    '/admin/services':      { title: 'Services',       subtitle: 'Manage your services' },
    '/admin/users':         { title: 'Users',          subtitle: 'Manage customers' },
    '/admin/reports':       { title: 'Reports',        subtitle: 'Analytics and reports' },
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

// ─── Reusable animated dropdown shell ────────────────────────────────────────
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
                rounded-xl border border-white/[0.08]
                bg-[#0A0A0A] shadow-2xl shadow-black/70
                transition-all duration-200 ease-out origin-top-right
                ${open
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }
                ${className}
            `}
            aria-hidden={!open}
        >
            {children}
        </div>
    );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header({ onLogout }) {
    const pathname   = usePathname();
    const { user }   = useAuth();
    const { isConnected } = useSocket();

    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showUser,  setShowUser]  = useState(false);
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    const notifBtnRef = useRef(null);
    const userBtnRef  = useRef(null);

    const pageInfo  = getPageInfo(pathname);
    const avatarUrl = getAvatarUrl(user?.avatar);
    const unread    = notifications.length;
    const userName  = user?.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : 'Admin User';

    // ── Clock ────────────────────────────────────────────────────────────────
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

    // ── Close on route change ────────────────────────────────────────────────
    useEffect(() => {
        setShowNotif(false);
        setShowUser(false);
    }, [pathname]);

    const toggleNotif = useCallback(() => { setShowNotif((p) => !p); setShowUser(false); }, []);
    const toggleUser  = useCallback(() => { setShowUser((p) => !p); setShowNotif(false); }, []);
    const handleLogout = useCallback(() => { setShowUser(false); onLogout?.(); }, [onLogout]);
    const clearNotifications = useCallback(() => setNotifications([]), []);

    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0A0A0A]/80">
            <div className="flex h-14 sm:h-16 items-center justify-between gap-2 px-4 sm:px-5 lg:px-6">

                {/* ── Left ─────────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 min-w-0 flex-1">

                    {/* Mobile: compact logo (sidebar hidden on mobile) */}
                    <div className="lg:hidden flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
                            <Car className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />
                        </div>
                        <span className="text-sm font-semibold text-white truncate">Wash2Door</span>
                    </div>

                    {/* Mobile: current page name (small, muted) */}
                    <span className="lg:hidden text-[11px] text-gray-600 truncate">
                        {pageInfo.title}
                    </span>

                    {/* Desktop: full page title + subtitle */}
                    <div className="hidden lg:flex flex-col min-w-0">
                        <h1 className="text-[17px] font-semibold text-white tracking-tight leading-tight truncate">
                            {pageInfo.title}
                        </h1>
                        {pageInfo.subtitle && (
                            <p className="text-[11px] text-gray-600 leading-tight mt-0.5 truncate">
                                {pageInfo.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Right ────────────────────────────────────────────────── */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

                    {/* Clock — md+ */}
                    <div className="hidden md:flex flex-col items-end mr-2 select-none">
                        <span className="text-[12px] font-semibold text-gray-300 tabular-nums leading-tight">{time}</span>
                        <span className="text-[10px] text-gray-600 leading-tight mt-0.5">{date}</span>
                    </div>

                    {/* Live / offline pill — sm+ */}
                    <div className={`
                        hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        text-[11px] font-medium border transition-all duration-500 select-none
                        ${isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/[0.03] text-gray-600 border-white/[0.08]'
                        }
                    `}>
                        {isConnected
                            ? <Zap className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                            : <WifiOff className="w-3 h-3 shrink-0" strokeWidth={2} />
                        }
                        <span className="hidden lg:inline">{isConnected ? 'Live' : 'Offline'}</span>
                    </div>

                    {/* ── Notifications ──────────────────────────────────── */}
                    <div className="relative">
                        <button
                            ref={notifBtnRef}
                            onClick={toggleNotif}
                            aria-label="Notifications"
                            aria-expanded={showNotif}
                            aria-haspopup="true"
                            className={`
                                relative h-9 w-9 flex items-center justify-center rounded-lg border
                                transition-all duration-200 ease-out
                                ${showNotif
                                    ? 'border-white/20 bg-white/10 text-white'
                                    : 'border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:border-white/[0.15] hover:bg-white/[0.05] active:bg-white/[0.08]'
                                }
                            `}
                        >
                            <Bell className="w-[15px] h-[15px]" strokeWidth={2} />
                            {unread > 0 && (
                                <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-white rounded-full ring-2 ring-[#0A0A0A]" />
                            )}
                        </button>

                        <Dropdown
                            open={showNotif}
                            onClose={() => setShowNotif(false)}
                            buttonRef={notifBtnRef}
                            className="w-[calc(100vw-2rem)] max-w-[320px]"
                        >
                            <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-white">Notifications</p>
                                    {unread > 0 && <p className="text-[11px] text-gray-600 mt-0.5">{unread} unread</p>}
                                </div>
                                {unread > 0 && (
                                    <button
                                        onClick={clearNotifications}
                                        className="shrink-0 text-[11px] text-gray-500 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.06] transition-all"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            {unread === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 px-4">
                                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
                                        <Bell className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-[13px] font-medium text-gray-400">All caught up</p>
                                    <p className="text-[11px] text-gray-600 mt-1 text-center">No new notifications</p>
                                </div>
                            ) : (
                                <ul className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                                    {notifications.map((n, i) => (
                                        <li key={n.id ?? i} className="px-4 py-3.5 hover:bg-white/[0.03] transition-colors cursor-default">
                                            <p className="text-[13px] text-white leading-snug">{n.message}</p>
                                            <p className="text-[11px] text-gray-600 mt-1">{n.time}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Dropdown>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-5 bg-white/[0.08] mx-0.5" aria-hidden="true" />

                    {/* ── User menu ──────────────────────────────────────── */}
                    <div className="relative">
                        <button
                            ref={userBtnRef}
                            onClick={toggleUser}
                            aria-expanded={showUser}
                            aria-haspopup="true"
                            aria-label="User menu"
                            className={`
                                h-9 w-9 flex items-center justify-center rounded-lg border
                                transition-all duration-200 ease-out
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                                ${showUser
                                    ? 'border-white/20 bg-white/10'
                                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.05] active:bg-white/[0.08]'
                                }
                            `}
                        >
                            {avatarUrl ? (
                                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                    <Image src={avatarUrl} alt={userName} fill className="object-cover" sizes="20px" />
                                </div>
                            ) : (
                                <User className={`w-4 h-4 transition-colors duration-200 ${showUser ? 'text-white' : 'text-gray-500'}`} strokeWidth={2} />
                            )}
                        </button>

                        <Dropdown
                            open={showUser}
                            onClose={() => setShowUser(false)}
                            buttonRef={userBtnRef}
                            className="w-[calc(100vw-2rem)] max-w-[220px]"
                        >
                            <div className="p-4 border-b border-white/[0.08]">
                                <p className="text-[13px] font-semibold text-white truncate leading-tight">{userName}</p>
                                <p className="text-[11px] text-gray-600 truncate mt-0.5">{user?.email ?? '—'}</p>
                                <div className="mt-2.5 inline-flex items-center rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 select-none">
                                    Administrator
                                </div>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={handleLogout}
                                    role="menuitem"
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] active:bg-red-500/[0.12] transition-all duration-200 ease-out"
                                >
                                    <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </Dropdown>
                    </div>

                </div>
            </div>
        </header>
    );
}
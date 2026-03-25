'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Sidebar from './Sidebar';
import Header from './Header';
import WelcomePopup from './WelcomePopup';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    BarChart3,
    Settings,
    Layers,
    Wrench,
    ChevronRight,
    X,
} from 'lucide-react';

const ROUTES = {
    OVERVIEW: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Reports',   href: '/admin/reports',   icon: BarChart3 },
    ],
    MANAGE: [
        { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
        { label: 'Users',    href: '/admin/users',    icon: Users },
    ],
    CATALOG: [
        { label: 'Categories',    href: '/admin/categories',    icon: Layers },
        { label: 'Subcategories', href: '/admin/subcategories', icon: Layers },
        { label: 'Services',      href: '/admin/services',      icon: Wrench },
    ],
};

const MOBILE_NAV = [
    { label: 'Overview', icon: LayoutDashboard, routes: ROUTES.OVERVIEW },
    { label: 'Manage',   icon: CalendarDays,    routes: ROUTES.MANAGE },
    { label: 'Catalog',  icon: Layers,          routes: ROUTES.CATALOG },
];

// ── Mobile Nav Item ──────────────────────────────────────────────
function MobileNavItem({ item, isActive, onOpenMenu }) {
    const Icon = item.icon;
    return (
        <button
            onClick={() => onOpenMenu(item)}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 select-none"
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
        >
            {/* Active indicator bar */}
            <span className={`
                absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full
                transition-all duration-300
                ${isActive ? 'w-8 bg-white' : 'w-0 bg-transparent'}
            `} />

            <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${isActive ? 'bg-white/10' : 'bg-transparent'}
            `}>
                <Icon
                    className={`h-[18px] w-[18px] transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-600'}`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                />
            </div>
            <span className={`text-[10px] font-medium leading-none transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
            </span>
        </button>
    );
}

// ── Menu Popover ─────────────────────────────────────────────────
function MenuPopover({ item, isOpen, onClose, pathname }) {
    if (!isOpen) return null;

    const isRouteActive = (route) =>
        pathname === route.href || pathname.startsWith(route.href + '/');

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="fixed bottom-[88px] left-3 right-3 z-50 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] shadow-2xl shadow-black/80 overflow-hidden"
                style={{ animation: 'slideUp 0.2s ease-out' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-title"
            >
                <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                            <item.icon className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                        </div>
                        <h3 id="menu-title" className="text-sm font-semibold text-white">{item.label}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
                    </button>
                </div>

                {/* Routes */}
                <div className="p-2">
                    {item.routes.map((route) => {
                        const RouteIcon = route.icon;
                        const active = isRouteActive(route);
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group
                                    ${active ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/[0.05] active:scale-[0.98]'}
                                `}
                                aria-current={active ? 'page' : undefined}
                            >
                                <RouteIcon className={`w-4 h-4 ${active ? 'text-black' : 'text-gray-500'}`} strokeWidth={2} />
                                <span className="flex-1 text-sm font-medium">{route.label}</span>
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${active ? 'text-black/50' : 'text-gray-700'}`} strokeWidth={2} />
                            </Link>
                        );
                    })}
                </div>

                {item.label === 'Catalog' && (
                    <>
                        <div className="h-px mx-3 bg-white/[0.06]" />
                        <div className="p-2">
                            <Link
                                href="/admin/settings"
                                onClick={onClose}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all group active:scale-[0.98]"
                            >
                                <Settings className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                <span className="flex-1 text-sm font-medium">Settings</span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// ── Catalog Tabs ─────────────────────────────────────────────────
function CatalogTabs({ pathname }) {
    const isInCatalog = useMemo(
        () => ROUTES.CATALOG.some(tab => pathname === tab.href || pathname.startsWith(tab.href + '/')),
        [pathname]
    );
    if (!isInCatalog) return null;

    return (
        <div className="sticky top-14 sm:top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
                <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-2" aria-label="Catalog navigation">
                    {ROUTES.CATALOG.map((tab) => {
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                                    whitespace-nowrap transition-all duration-200 shrink-0
                                    ${isActive
                                        ? 'bg-white text-black'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
                                    }
                                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

// ── Main Layout ──────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const pathname = usePathname();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [mounted, setMounted] = useState(false);

    const activeTab = useMemo(() => {
        for (let tab of MOBILE_NAV) {
            if (tab.routes.some(r => pathname === r.href || pathname.startsWith(r.href + '/'))) {
                return tab.label;
            }
        }
        return null;
    }, [pathname]);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || user?.role !== 'admin') router.push('/admin/login');
    }, [isAuthenticated, loading, user, router]);

    // Check localStorage on mount
    useEffect(() => {
        setMounted(true);
        const hideWelcome = localStorage.getItem('hideWelcomePopup') === 'true';
        if (!hideWelcome) {
            setShowWelcome(true);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    useEffect(() => {
        setDrawerOpen(false);
        setMenuOpen(null);
    }, [pathname]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') { setDrawerOpen(false); setMenuOpen(null); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!socket) return;
        const style = {
            background: '#0A0A0A',
            color: '#f0f0f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        };
        const onNew = (data) => toast(`📅 New booking: ${data?.bookingCode ?? 'unknown'}`, { style, duration: 5000 });
        const onUpdate = (data) => toast(`🔄 Booking ${data?.bookingCode ?? '—'} → ${data?.status ?? '—'}`, { style, duration: 4000 });
        socket.on('new_booking', onNew);
        socket.on('booking_status_updated', onUpdate);
        return () => { socket.off('new_booking', onNew); socket.off('booking_status_updated', onUpdate); };
    }, [socket]);

    const handleLogout = useCallback(() => logout?.(), [logout]);
    const openDrawer   = useCallback(() => setDrawerOpen(true), []);
    const closeDrawer  = useCallback(() => setDrawerOpen(false), []);
    const openMenu     = useCallback((item) => setMenuOpen(item.label), []);
    const closeMenu    = useCallback(() => setMenuOpen(null), []);
    const closeWelcome = useCallback(() => {
        setShowWelcome(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
                        <div className="absolute inset-0 rounded-full border border-transparent border-t-white/50 animate-spin" />
                    </div>
                    <p className="text-[10px] font-medium text-gray-700 uppercase tracking-[0.2em]">Loading</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-black">

            {/* Welcome Popup */}
            {mounted && showWelcome && user && <WelcomePopup user={user} onClose={closeWelcome} />}

            {/* Desktop sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-[220px] z-40">
                <Sidebar onLogout={handleLogout} isMobile={false} />
            </div>

            {/* Mobile backdrop */}
            <div
                className={`lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            {/* Mobile drawer */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] z-[60] transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-modal="true"
                role="dialog"
                aria-label="Navigation drawer"
            >
                <Sidebar onLogout={handleLogout} onClose={closeDrawer} isMobile={true} />
            </div>

            {/* Main */}
            <div className="lg:pl-[220px] flex flex-col min-h-screen">
                <Header onMenuClick={openDrawer} onLogout={handleLogout} />

                <div className="hidden lg:block">
                    <CatalogTabs pathname={pathname} />
                </div>

                <main
                    className="flex-1 overflow-x-hidden"
                    style={{ paddingBottom: 'calc(5.5rem + max(0px, env(safe-area-inset-bottom)))' }}
                >
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-6 lg:pb-8">
                        <div className="max-w-screen-2xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile popovers */}
            {MOBILE_NAV.map((item) => (
                <MenuPopover
                    key={item.label}
                    item={item}
                    isOpen={menuOpen === item.label}
                    onClose={closeMenu}
                    pathname={pathname}
                />
            ))}

            {/* Mobile bottom nav */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-xl border-t border-white/[0.06]"
                style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
                aria-label="Mobile navigation"
            >
                <div className="grid grid-cols-3 h-[68px]">
                    {MOBILE_NAV.map((item) => (
                        <MobileNavItem
                            key={item.label}
                            item={item}
                            isActive={activeTab === item.label}
                            onOpenMenu={openMenu}
                        />
                    ))}
                </div>
            </nav>
        </div>
    );
}
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Sidebar from './Sidebar';
import Header from './Header';
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

// Route definitions
const ROUTES = {
    OVERVIEW: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
    MANAGE: [
        { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
        { label: 'Users', href: '/admin/users', icon: Users },
    ],
    CATALOG: [
        { label: 'Categories', href: '/admin/categories', icon: Layers },
        { label: 'Subcategories', href: '/admin/subcategories', icon: Layers },
        { label: 'Services', href: '/admin/services', icon: Wrench },
    ],
};

const MOBILE_NAV = [
    { label: 'Overview', icon: LayoutDashboard, routes: ROUTES.OVERVIEW },
    { label: 'Manage', icon: Users, routes: ROUTES.MANAGE },
    { label: 'Catalog', icon: Layers, routes: ROUTES.CATALOG },
];

// ────────────────────────────────────────────────────────────────
// MobileNavItem Component
// ────────────────────────────────────────────────────────────────
function MobileNavItem({ item, isActive, onOpenMenu }) {
    const Icon = item.icon;

    return (
        <button
            onClick={() => onOpenMenu(item)}
            className={`
                relative flex flex-col items-center justify-center gap-1
                transition-colors duration-200 select-none
                flex-1 h-full
                ${isActive ? 'text-white' : 'text-gray-600 active:text-gray-400'}
            `}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
        >
            <Icon
                className="h-5 w-5 sm:h-6 sm:w-6"
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
            />
            <span
                className={`
                    text-[10px] sm:text-[11px] font-medium leading-tight text-center px-1
                    ${isActive ? 'opacity-100' : 'opacity-60'}
                `}
            >
                {item.label}
            </span>
        </button>
    );
}

// ────────────────────────────────────────────────────────────────
// MenuPopover Component
// ────────────────────────────────────────────────────────────────
function MenuPopover({ item, isOpen, onClose, pathname }) {
    if (!isOpen) return null;

    const isRouteActive = (route) =>
        pathname === route.href || pathname.startsWith(route.href + '/');

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Menu Popup */}
            <div
                className="
                    fixed bottom-24 left-0 right-0 z-50 mx-3
                    rounded-2xl bg-[#0A0A0A] border border-white/[0.08]
                    shadow-2xl shadow-black/70
                    animate-in slide-in-from-bottom-2 duration-200
                "
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-gray-400" strokeWidth={2} aria-hidden="true" />
                        </div>
                        <h3 id="menu-title" className="text-base font-semibold text-white">
                            {item.label}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-gray-400" strokeWidth={2} aria-hidden="true" />
                    </button>
                </div>

                {/* Routes */}
                <div className="py-2 px-2">
                    {item.routes.map((route) => {
                        const RouteIcon = route.icon;
                        const active = isRouteActive(route);

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-200 group
                                    ${active
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05] active:bg-white/[0.08]'
                                    }
                                `}
                                aria-current={active ? 'page' : undefined}
                            >
                                <RouteIcon
                                    className={`w-4 h-4 ${active ? 'text-black' : 'text-gray-500'}`}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                <span className="flex-1 font-medium text-sm">{route.label}</span>
                                <ChevronRight
                                    className={`
                                        w-4 h-4 transition-transform
                                        ${active ? 'text-black group-hover:translate-x-1' : 'text-gray-600 group-hover:translate-x-1'}
                                    `}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                            </Link>
                        );
                    })}
                </div>

                {/* Settings Footer */}
                {item.label === 'Catalog' && (
                    <>
                        <div className="h-px bg-white/[0.04]" />
                        <div className="py-2 px-2">
                            <Link
                                href="/admin/settings"
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] active:bg-white/[0.08] transition-all group"
                                aria-current={pathname === '/admin/settings' ? 'page' : undefined}
                            >
                                <Settings className="w-4 h-4 text-gray-500" strokeWidth={2} aria-hidden="true" />
                                <span className="flex-1 font-medium text-sm">Settings</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform" strokeWidth={2} aria-hidden="true" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// ────────────────────────────────────────────────────────────────
// CatalogTabs Component
// ────────────────────────────────────────────────────────────────
function CatalogTabs({ pathname }) {
    const isInCatalog = useMemo(
        () => ROUTES.CATALOG.some(tab =>
            pathname === tab.href || pathname.startsWith(tab.href + '/')
        ),
        [pathname]
    );

    if (!isInCatalog) return null;

    return (
        <div className="sticky top-14 sm:top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.08]">
            <div className="max-w-screen-2xl mx-auto">
                <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Catalog navigation">
                    {ROUTES.CATALOG.map((tab) => {
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-medium
                                    whitespace-nowrap transition-all duration-200
                                    border-b-2 -mb-[2px]
                                    ${isActive
                                        ? 'text-white border-white'
                                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-500'
                                    }
                                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────
// Main Layout Component
// ────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const pathname = usePathname();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);

    // ── Determine active tab ────────────────────────────────────────
    const activeTab = useMemo(() => {
        for (let tab of MOBILE_NAV) {
            if (tab.routes.some(r => pathname === r.href || pathname.startsWith(r.href + '/'))) {
                return tab.label;
            }
        }
        return null;
    }, [pathname]);

    // ── Auth guard ──────────────────────────────────────────────────
    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/admin/login');
        }
    }, [isAuthenticated, loading, user, router]);

    // ── Body scroll lock ────────────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    // ── Close menus on route change ─────────────────────────────────
    useEffect(() => {
        setDrawerOpen(false);
        setMenuOpen(null);
    }, [pathname]);

    // ── Escape key handler ──────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setDrawerOpen(false);
                setMenuOpen(null);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // ── Socket notifications ────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const toastStyle = {
            background: '#0A0A0A',
            color: '#f0f0f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        };

        const onNewBooking = (data) => {
            const bookingCode = data?.bookingCode ?? 'unknown';
            toast(`📅 New booking: ${bookingCode}`, {
                style: toastStyle,
                duration: 5000,
            });
        };

        const onStatusUpdate = (data) => {
            const code = data?.bookingCode ?? '—';
            const status = data?.status ?? '—';
            toast(`🔄 Booking ${code} → ${status}`, {
                style: toastStyle,
                duration: 4000,
            });
        };

        socket.on('new_booking', onNewBooking);
        socket.on('booking_status_updated', onStatusUpdate);

        return () => {
            socket.off('new_booking', onNewBooking);
            socket.off('booking_status_updated', onStatusUpdate);
        };
    }, [socket]);

    // ── Callbacks ───────────────────────────────────────────────────
    const handleLogout = useCallback(() => logout?.(), [logout]);
    const openDrawer = useCallback(() => setDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);
    const openMenu = useCallback((item) => setMenuOpen(item.label), []);
    const closeMenu = useCallback(() => setMenuOpen(null), []);

    // ── Loading screen ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-9 h-9">
                        <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 uppercase tracking-[0.15em] select-none">
                        Loading
                    </p>
                </div>
            </div>
        );
    }

    // ── Auth guard: don't flash unauth content ──────────────────────
    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-black">

            {/* ── Desktop sidebar ────────────────────────────────────── */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-[240px] z-40">
                <Sidebar onLogout={handleLogout} isMobile={false} />
            </div>

            {/* ── Mobile backdrop ────────────────────────────────────── */}
            <div
                className={`
                    lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                    transition-opacity duration-300 ease-in-out
                    ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            {/* ── Mobile drawer ──────────────────────────────────────── */}
            <div
                className={`
                    lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] z-[60]
                    transition-transform duration-300 ease-in-out
                    ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                aria-modal="true"
                role="dialog"
                aria-label="Navigation drawer"
            >
                <Sidebar
                    onLogout={handleLogout}
                    onClose={closeDrawer}
                    isMobile={true}
                />
            </div>

            {/* ── Main content ───────────────────────────────────────── */}
            <div className="lg:pl-[240px] flex flex-col min-h-screen">

                {/* Header */}
                <Header
                    onMenuClick={openDrawer}
                    onLogout={handleLogout}
                />

                {/* Desktop catalog tabs */}
                <div className="hidden lg:block">
                    <CatalogTabs pathname={pathname} />
                </div>

                {/* Page content - NOW WITH PROPER MOBILE NAV SPACING */}
                <main 
                    className="flex-1 overflow-x-hidden"
                    style={{
                        paddingBottom: 'calc(5rem + max(0px, env(safe-area-inset-bottom)))',
                    }}
                >
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-6 lg:pb-8">
                        <div className="max-w-screen-2xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Mobile menu popover ────────────────────────────────── */}
            {MOBILE_NAV.map((item) => (
                <MenuPopover
                    key={item.label}
                    item={item}
                    isOpen={menuOpen === item.label}
                    onClose={closeMenu}
                    pathname={pathname}
                />
            ))}

            {/* ── Mobile bottom nav ──────────────────────────────────── */}
            <nav
                className="
                    lg:hidden
                    fixed bottom-0 left-0 right-0 z-40
                    bg-[#0A0A0A]/95 backdrop-blur-xl
                    border-t border-white/[0.08]
                    w-full
                "
                style={{
                    paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
                }}
                aria-label="Mobile navigation"
            >
                <div className="grid grid-cols-3 gap-0 h-20 w-full">
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
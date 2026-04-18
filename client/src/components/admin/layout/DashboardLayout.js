'use client';

import { useEffect, useCallback, useMemo, useReducer, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Sidebar from './Sidebar';
import Header from './Header';
import WelcomePopup from './WelcomePopup';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, CalendarDays, Users, BarChart3,
    Settings, Layers, Wrench, ChevronRight, X, Loader2,
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

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

const TOAST_STYLE = {
    background: '#000000',
    color: '#f0f0f0',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
};

// ============================================
// ANIMATION VARIANTS
// ============================================

const BACKDROP_V = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit:    { opacity: 0, transition: { duration: 0.12 } },
};

const DRAWER_V = {
    hidden:  { x: '-100%', opacity: 0.8 },
    visible: {
        x: 0, opacity: 1,
        transition: { type: 'spring', damping: 26, stiffness: 220, mass: 0.9 },
    },
    exit: {
        x: '-100%', opacity: 0.5,
        transition: { type: 'tween', duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
};

const POPOVER_V = {
    hidden:  { opacity: 0, y: 24, scale: 0.95 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: {
            type: 'spring', damping: 24, stiffness: 300, mass: 0.8,
            staggerChildren: 0.035, delayChildren: 0.05,
        },
    },
    exit: {
        opacity: 0, y: 12, scale: 0.97,
        transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
    },
};

const POPOVER_ITEM_V = {
    hidden:  { opacity: 0, x: -10, y: 4 },
    visible: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', damping: 22, stiffness: 280 } },
    exit:    { opacity: 0, transition: { duration: 0.08 } },
};

const POPOVER_HEADER_V = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
};

// ============================================
// REDUCER
// ============================================

const initialState = {
    drawerOpen:  false,
    menuOpen:    null,
    showWelcome: false,
    mounted:     false,
};

function menuReducer(state, action) {
    switch (action.type) {
        case 'OPEN_DRAWER':  return { ...state, drawerOpen: true, menuOpen: null };
        case 'CLOSE_DRAWER': return { ...state, drawerOpen: false };
        case 'OPEN_MENU':    return { ...state, menuOpen: action.payload, drawerOpen: false };
        case 'CLOSE_MENU':   return { ...state, menuOpen: null };
        case 'CLOSE_ALL':    return { ...state, drawerOpen: false, menuOpen: null };
        case 'SET_MOUNTED':  return { ...state, mounted: true };
        case 'SHOW_WELCOME': return { ...state, showWelcome: true };
        case 'HIDE_WELCOME': return { ...state, showWelcome: false };
        default:             return state;
    }
}

// ============================================
// MOBILE NAV ITEM
// ============================================

const MobileNavItem = memo(function MobileNavItem({ item, isActive, isMenuOpen, onOpenMenu }) {
    const Icon = item.icon;
    const handleClick = useCallback(() => onOpenMenu(item), [item, onOpenMenu]);

    return (
        <button
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors select-none active:scale-95 ${
                isMenuOpen || isActive ? 'text-white' : 'text-white/30'
            }`}
        >
            {/* Active indicator */}
            <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-white transition-all duration-150 ${
                    isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'
                }`}
            />

            <div
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-100 ${
                    isMenuOpen
                        ? 'bg-white/[0.12] scale-105'
                        : isActive
                            ? 'bg-white/10'
                            : 'bg-transparent scale-95'
                }`}
            >
                {isMenuOpen && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
                )}
                <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={isMenuOpen || isActive ? 2.5 : 1.8}
                />
            </div>

            <span className="text-[10px] font-medium leading-none">{item.label}</span>
        </button>
    );
});

// ============================================
// MENU BACKDROP
// ============================================

const MenuBackdrop = memo(function MenuBackdrop({ onClose }) {
    return (
        <motion.div
            className="fixed inset-0 z-40 bg-black/80"
            variants={BACKDROP_V}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
            style={{ willChange: 'opacity' }}
        />
    );
});

// ============================================
// MENU ROUTE ITEM
// ============================================

const MenuRouteItem = memo(function MenuRouteItem({ route, active, onClose, isSettings = false }) {
    const RouteIcon = route.icon;

    return (
        <>
            {isSettings && <div className="h-px mx-1 my-1.5 bg-white/[0.06]" />}
            <motion.div variants={POPOVER_ITEM_V}>
                <Link href={route.href} onClick={onClose}>
                    <div
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all active:scale-[0.98] group ${
                            active
                                ? 'bg-white text-black'
                                : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <RouteIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                                active
                                    ? 'text-black'
                                    : 'text-white/30 group-hover:text-white/60'
                            }`}
                            strokeWidth={2}
                        />
                        <span className="flex-1 text-xs font-medium">{route.label}</span>
                        <ChevronRight
                            className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 ${
                                active ? 'text-black/40' : 'text-white/15 group-hover:text-white/30'
                            }`}
                            strokeWidth={2}
                        />
                    </div>
                </Link>
            </motion.div>
        </>
    );
});

// ============================================
// MENU POPOVER CONTENT
// ============================================

const MenuPopoverContent = memo(function MenuPopoverContent({ item, onClose, pathname }) {
    const isRouteActive = useCallback(
        (route) => pathname === route.href || pathname.startsWith(route.href + '/'),
        [pathname]
    );

    const allRoutes = useMemo(() => {
        if (item.label === 'Catalog') {
            return [
                ...item.routes,
                { label: 'Settings', href: '/admin/settings', icon: Settings, isSettings: true },
            ];
        }
        return item.routes.map((r) => ({ ...r, isSettings: false }));
    }, [item]);

    const Icon = item.icon;

    return (
        <motion.div
            className="fixed bottom-[88px] left-3 right-3 z-50 rounded-2xl bg-black border border-white/[0.08] shadow-2xl overflow-hidden"
            variants={POPOVER_V}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
        >
            {/* Header */}
            <motion.div
                className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
                variants={POPOVER_HEADER_V}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />
                    </div>
                    <h3 className="text-xs font-semibold text-white">{item.label}</h3>
                </div>
                <motion.button
                    onClick={onClose}
                    aria-label="Close menu"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
                    whileTap={{ scale: 0.85 }}
                >
                    <X className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />
                </motion.button>
            </motion.div>

            {/* Routes */}
            <div className="p-1.5">
                {allRoutes.map((route) => (
                    <MenuRouteItem
                        key={route.href}
                        route={route}
                        active={isRouteActive(route)}
                        onClose={onClose}
                        isSettings={route.isSettings || false}
                    />
                ))}
            </div>
        </motion.div>
    );
});

// ============================================
// CATALOG TABS
// ============================================

const CatalogTabs = memo(function CatalogTabs({ pathname }) {
    const isInCatalog = useMemo(
        () => ROUTES.CATALOG.some(
            (tab) => pathname === tab.href || pathname.startsWith(tab.href + '/')
        ),
        [pathname]
    );

    if (!isInCatalog) return null;

    return (
        <div className="sticky top-14 z-30 bg-black/95 backdrop-blur-sm border-b border-white/[0.06]">
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
                <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-2" aria-label="Catalog navigation">
                    {ROUTES.CATALOG.map((tab) => {
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
                                    isActive
                                        ? 'bg-white text-black'
                                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                                }`}
                            >
                                <Icon className="w-3 h-3" strokeWidth={2} />
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
});

// ============================================
// LOADING SCREEN
// ============================================

const LoadingScreen = memo(function LoadingScreen() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em]">
                    Loading
                </p>
            </div>
        </div>
    );
});

// ============================================
// MAIN LAYOUT
// ============================================

export default function DashboardLayout({ children }) {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const { socket } = useSocket();
    const router   = useRouter();
    const pathname = usePathname();

    const [state, dispatch] = useReducer(menuReducer, initialState);
    const { drawerOpen, menuOpen, showWelcome, mounted } = state;

    const currentMenuItem = useMemo(
        () => MOBILE_NAV.find((item) => item.label === menuOpen) || null,
        [menuOpen]
    );

    const activeTab = useMemo(() => {
        for (const tab of MOBILE_NAV) {
            if (tab.routes.some((r) => pathname === r.href || pathname.startsWith(r.href + '/'))) {
                return tab.label;
            }
        }
        return null;
    }, [pathname]);

    // ── Callbacks ──
    const openMenu     = useCallback((item) => dispatch({ type: 'OPEN_MENU', payload: item.label }), []);
    const closeMenu    = useCallback(() => dispatch({ type: 'CLOSE_MENU' }), []);
    const openDrawer   = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }), []);
    const closeDrawer  = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);
    const closeWelcome = useCallback(() => dispatch({ type: 'HIDE_WELCOME' }), []);
    const handleLogout = useCallback(() => logout?.(), [logout]);

    // ── Effects ──

    // Auth guard
    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || user?.role !== 'admin') router.push('/admin/login');
    }, [isAuthenticated, loading, user, router]);

    // Mount + welcome
    useEffect(() => {
        dispatch({ type: 'SET_MOUNTED' });
        if (localStorage.getItem('hideWelcomePopup') !== 'true') {
            dispatch({ type: 'SHOW_WELCOME' });
        }
    }, []);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = drawerOpen || menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen, menuOpen]);

    // Route change → close all
    useEffect(() => { dispatch({ type: 'CLOSE_ALL' }); }, [pathname]);

    // Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_ALL' }); };
        document.addEventListener('keydown', handler, { passive: true });
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Socket notifications
    useEffect(() => {
        if (!socket) return;
        const onNew = (data) =>
            toast(`📅 New booking: ${data?.bookingCode ?? 'unknown'}`, { style: TOAST_STYLE, duration: 5000 });
        const onUpdate = (data) =>
            toast(`🔄 Booking ${data?.bookingCode ?? '—'} → ${data?.status ?? '—'}`, { style: TOAST_STYLE, duration: 4000 });
        socket.on('new_booking', onNew);
        socket.on('booking_status_updated', onUpdate);
        return () => {
            socket.off('new_booking', onNew);
            socket.off('booking_status_updated', onUpdate);
        };
    }, [socket]);

    // ── Early returns ──
    if (loading) return <LoadingScreen />;
    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-black">

            {/* Welcome Popup */}
            {mounted && showWelcome && user && (
                <WelcomePopup user={user} onClose={closeWelcome} />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-[220px] z-40">
                <Sidebar onLogout={handleLogout} isMobile={false} />
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence mode="sync">
                {drawerOpen && (
                    <>
                        <motion.div
                            key="drawer-backdrop"
                            className="lg:hidden fixed inset-0 bg-black/90 z-50"
                            variants={BACKDROP_V}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={closeDrawer}
                            aria-hidden="true"
                            style={{ willChange: 'opacity' }}
                        />
                        <motion.div
                            key="drawer"
                            className="lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] z-[60]"
                            variants={DRAWER_V}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            aria-modal="true"
                            role="dialog"
                            aria-label="Navigation drawer"
                            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                        >
                            <Sidebar onLogout={handleLogout} onClose={closeDrawer} isMobile />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
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
                        <div className="max-w-screen-2xl mx-auto">{children}</div>
                    </div>
                </main>
            </div>

            {/* Mobile Menu Backdrop */}
            <AnimatePresence mode="sync">
                {menuOpen && <MenuBackdrop key="menu-backdrop" onClose={closeMenu} />}
            </AnimatePresence>

            {/* Mobile Menu Popover */}
            <AnimatePresence mode="sync">
                {currentMenuItem && (
                    <MenuPopoverContent
                        key={`menu-${currentMenuItem.label}`}
                        item={currentMenuItem}
                        onClose={closeMenu}
                        pathname={pathname}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Bottom Nav */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/98 border-t border-white/[0.06]"
                style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
                aria-label="Mobile navigation"
            >
                <div className="grid grid-cols-3 h-[68px]">
                    {MOBILE_NAV.map((item) => (
                        <MobileNavItem
                            key={item.label}
                            item={item}
                            isActive={activeTab === item.label}
                            isMenuOpen={menuOpen === item.label}
                            onOpenMenu={openMenu}
                        />
                    ))}
                </div>
            </nav>
        </div>
    );
}
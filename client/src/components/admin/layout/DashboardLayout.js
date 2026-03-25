'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.button
            onClick={() => onOpenMenu(item)}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 select-none"
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            whileTap={{ scale: 0.92 }}
        >
            {/* Active indicator bar */}
            <motion.span 
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-white"
                initial={false}
                animate={{ 
                    width: isActive ? 32 : 0,
                    opacity: isActive ? 1 : 0 
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />

            <motion.div 
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                initial={false}
                animate={{ 
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0)',
                    scale: isActive ? 1 : 0.95
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <Icon
                    className={`h-[18px] w-[18px] transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600'}`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                />
            </motion.div>
            <span className={`text-[10px] font-medium leading-none transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
            </span>
        </motion.button>
    );
}

// ── Menu Popover ─────────────────────────────────────────────────
function MenuPopover({ item, isOpen, onClose, pathname }) {
    const isRouteActive = (route) =>
        pathname === route.href || pathname.startsWith(route.href + '/');

    const allRoutes = item.label === 'Catalog' 
        ? [...item.routes, { label: 'Settings', href: '/admin/settings', icon: Settings, isSettings: true }]
        : item.routes;

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/70"
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ 
                            opacity: 1, 
                            backdropFilter: 'blur(12px)',
                            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                        }}
                        exit={{ 
                            opacity: 0, 
                            backdropFilter: 'blur(0px)',
                            transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                        }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Popover Container */}
                    <motion.div
                        className="fixed bottom-[88px] left-3 right-3 z-50 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] shadow-2xl shadow-black/80 overflow-hidden"
                        initial={{ 
                            opacity: 0, 
                            y: 60, 
                            scale: 0.85,
                            filter: 'blur(10px)',
                            rotateX: -15,
                        }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            filter: 'blur(0px)',
                            rotateX: 0,
                            transition: {
                                type: 'spring',
                                damping: 28,
                                stiffness: 350,
                                mass: 0.8,
                            }
                        }}
                        exit={{ 
                            opacity: 0, 
                            y: 40,
                            scale: 0.9,
                            filter: 'blur(8px)',
                            transition: {
                                duration: 0.2,
                                ease: [0.32, 0, 0.67, 0],
                            }
                        }}
                        style={{ 
                            transformPerspective: 1200,
                            transformOrigin: 'bottom center',
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="menu-title"
                    >
                        {/* Glow effect */}
                        <motion.div 
                            className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1,
                                transition: { delay: 0.1, duration: 0.4 }
                            }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        />

                        {/* Header */}
                        <motion.div 
                            className="relative flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ 
                                opacity: 1, 
                                y: 0,
                                transition: { delay: 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <motion.div 
                                    className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ 
                                        scale: 1, 
                                        rotate: 0,
                                        transition: { 
                                            delay: 0.1,
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15
                                        }
                                    }}
                                >
                                    <item.icon className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                                </motion.div>
                                <motion.h3 
                                    id="menu-title" 
                                    className="text-sm font-semibold text-white"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ 
                                        opacity: 1, 
                                        x: 0,
                                        transition: { delay: 0.12, duration: 0.3 }
                                    }}
                                >
                                    {item.label}
                                </motion.h3>
                            </div>
                            <motion.button
                                onClick={onClose}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                                aria-label="Close menu"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    transition: { delay: 0.15, type: 'spring', stiffness: 500, damping: 25 }
                                }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
                            </motion.button>
                        </motion.div>

                        {/* Routes */}
                        <div className="p-2 relative">
                            {allRoutes.map((route, index) => {
                                const RouteIcon = route.icon;
                                const active = isRouteActive(route);
                                const isSettings = route.isSettings;
                                
                                return (
                                    <motion.div 
                                        key={route.href}
                                        initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                                        animate={{ 
                                            opacity: 1, 
                                            x: 0,
                                            filter: 'blur(0px)',
                                            transition: {
                                                delay: 0.08 + index * 0.06,
                                                type: 'spring',
                                                stiffness: 350,
                                                damping: 30,
                                            }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: -20,
                                            filter: 'blur(5px)',
                                            transition: {
                                                duration: 0.15,
                                                delay: index * 0.02,
                                            }
                                        }}
                                    >
                                        {isSettings && (
                                            <motion.div 
                                                className="h-px mx-1 my-2 bg-white/[0.06]"
                                                initial={{ scaleX: 0 }}
                                                animate={{ 
                                                    scaleX: 1,
                                                    transition: { delay: 0.2, duration: 0.3 }
                                                }}
                                            />
                                        )}
                                        <Link
                                            href={route.href}
                                            onClick={onClose}
                                        >
                                            <motion.div
                                                className={`
                                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-150 group relative overflow-hidden
                                                    ${active ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}
                                                `}
                                                whileHover={{ 
                                                    scale: 1.02,
                                                    backgroundColor: active ? 'rgb(255,255,255)' : 'rgba(255,255,255,0.05)',
                                                    transition: { duration: 0.2 }
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                aria-current={active ? 'page' : undefined}
                                            >
                                                {/* Hover glow */}
                                                <motion.div 
                                                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                                    initial={false}
                                                />
                                                
                                                <motion.div
                                                    initial={{ rotate: 0 }}
                                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    <RouteIcon className={`w-4 h-4 ${active ? 'text-black' : 'text-gray-500 group-hover:text-white'} transition-colors`} strokeWidth={2} />
                                                </motion.div>
                                                <span className="flex-1 text-sm font-medium">{route.label}</span>
                                                <motion.div
                                                    initial={{ x: 0 }}
                                                    whileHover={{ x: 3 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                >
                                                    <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-black/50' : 'text-gray-700 group-hover:text-gray-400'} transition-colors`} strokeWidth={2} />
                                                </motion.div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Bottom gradient */}
                        <motion.div 
                            className="h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ 
                                scaleX: 1, 
                                opacity: 1,
                                transition: { delay: 0.3, duration: 0.4 }
                            }}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
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

    useEffect(() => {
        setMounted(true);
        const hideWelcome = localStorage.getItem('hideWelcomePopup') === 'true';
        if (!hideWelcome) {
            setShowWelcome(true);
        }
    }, []);

    useEffect(() => {
        if (drawerOpen || menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen, menuOpen]);

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
            <AnimatePresence>
                {drawerOpen && (
                    <motion.div
                        className="lg:hidden fixed inset-0 bg-black/80 z-50"
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ 
                            opacity: 1, 
                            backdropFilter: 'blur(8px)',
                            transition: { duration: 0.3 }
                        }}
                        exit={{ 
                            opacity: 0,
                            backdropFilter: 'blur(0px)',
                            transition: { duration: 0.2 }
                        }}
                        onClick={closeDrawer}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Mobile drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <motion.div
                        className="lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] z-[60]"
                        initial={{ x: '-100%', opacity: 0.5 }}
                        animate={{ 
                            x: 0, 
                            opacity: 1,
                            transition: { 
                                type: 'spring', 
                                damping: 30, 
                                stiffness: 300,
                                mass: 0.8
                            }
                        }}
                        exit={{ 
                            x: '-100%',
                            opacity: 0.5,
                            transition: { 
                                type: 'spring',
                                damping: 35,
                                stiffness: 400
                            }
                        }}
                        aria-modal="true"
                        role="dialog"
                        aria-label="Navigation drawer"
                    >
                        <Sidebar onLogout={handleLogout} onClose={closeDrawer} isMobile={true} />
                    </motion.div>
                )}
            </AnimatePresence>

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
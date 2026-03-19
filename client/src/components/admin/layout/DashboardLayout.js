'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';

// 5 most-used routes for the mobile bottom bar
const mobileNav = [
    { label: 'Home',      href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings',  href: '/admin/bookings',  icon: CalendarDays },
    { label: 'Users',     href: '/admin/users',     icon: Users },
    { label: 'Reports',   href: '/admin/reports',   icon: BarChart3 },
    { label: 'Settings',  href: '/admin/settings',  icon: Settings },
];

// ─── Mobile bottom-nav item ───────────────────────────────────────────────────
function MobileNavItem({ item, isActive }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            className={`
                relative flex flex-col items-center justify-center gap-[3px]
                transition-colors duration-200 select-none
                ${isActive ? 'text-white' : 'text-gray-600 active:text-gray-400'}
            `}
        >
            {/* Top active line */}
            <span className={`
                absolute top-0 left-1/2 -translate-x-1/2 h-[2px] bg-white rounded-full
                transition-all duration-300 ease-out
                ${isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'}
            `} />

            <Icon
                className="h-[19px] w-[19px]"
                strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`
                text-[10px] font-medium leading-none
                ${isActive ? 'opacity-100' : 'opacity-50'}
            `}>
                {item.label}
            </span>
        </Link>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const { socket } = useSocket();
    const router  = useRouter();
    const pathname = usePathname();

    const [drawerOpen, setDrawerOpen] = useState(false);

    // ── Auth guard ────────────────────────────────────────────────────────
    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/admin/login');
        }
    }, [isAuthenticated, loading, user, router]);

    // ── Lock body scroll when drawer is open ─────────────────────────────
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    // ── Close drawer on route change ─────────────────────────────────────
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    // ── Escape key closes drawer ─────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setDrawerOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // ── Socket toast notifications ────────────────────────────────────────
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

        const onNewBooking = (data) =>
            toast(`New booking: ${data?.bookingCode ?? 'unknown'}`, {
                icon: '📅', style: toastStyle, duration: 5000,
            });

        const onStatusUpdate = (data) =>
            toast(`Booking ${data?.bookingCode ?? '—'} → ${data?.status ?? '—'}`, {
                icon: '🔄', style: toastStyle, duration: 4000,
            });

        socket.on('new_booking',            onNewBooking);
        socket.on('booking_status_updated', onStatusUpdate);

        return () => {
            socket.off('new_booking',            onNewBooking);
            socket.off('booking_status_updated', onStatusUpdate);
        };
    }, [socket]);

    const handleLogout  = useCallback(() => { logout?.(); }, [logout]);
    const openDrawer    = useCallback(() => setDrawerOpen(true),  []);
    const closeDrawer   = useCallback(() => setDrawerOpen(false), []);

    // ── Loading screen ────────────────────────────────────────────────────
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

    // Don't flash the layout for unauthenticated users while redirect is happening
    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-black">

            {/* ── Desktop sidebar (always visible lg+) ─────────────────── */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-[240px] z-40">
                <Sidebar onLogout={handleLogout} isMobile={false} />
            </div>

            {/* ── Mobile: backdrop ────────────────────────────────────── */}
            <div
                className={`
                    lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                    transition-opacity duration-300
                    ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            {/* ── Mobile: slide-in drawer ──────────────────────────────── */}
            <div
                className={`
                    lg:hidden fixed inset-y-0 left-0 w-[260px] z-[60]
                    transition-transform duration-300 ease-in-out
                    ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                aria-modal="true"
                role="dialog"
                aria-label="Navigation menu"
            >
                <Sidebar
                    onLogout={handleLogout}
                    onClose={closeDrawer}
                    isMobile={true}
                />
            </div>

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="lg:pl-[240px] flex flex-col min-h-screen">

                {/* Sticky header */}
                <Header
                    onMenuClick={openDrawer}
                    onLogout={handleLogout}
                />

                {/* Page content
                    pb-[calc(4rem+env(safe-area-inset-bottom))] ensures content
                    is never hidden under the bottom nav + phone home indicator */}
                <main className="
                    flex-1
                    p-4 sm:p-6 lg:p-8
                    pb-[calc(4.5rem+env(safe-area-inset-bottom))]
                    lg:pb-8
                    overflow-x-hidden
                ">
                    <div className="max-w-screen-2xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* ── Mobile bottom nav ────────────────────────────────────── */}
            <nav
                className="
                    lg:hidden
                    fixed bottom-0 left-0 right-0 z-40
                    bg-[#0A0A0A]/95 backdrop-blur-xl
                    border-t border-white/[0.08]
                "
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="grid grid-cols-5 h-16">
                    {mobileNav.map((item) => (
                        <MobileNavItem
                            key={item.href}
                            item={item}
                            isActive={
                                pathname === item.href ||
                                pathname.startsWith(item.href + '/')
                            }
                        />
                    ))}
                </div>
            </nav>

        </div>
    );
}
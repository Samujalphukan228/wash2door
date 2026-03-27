'use client';

import { useEffect, useState, useCallback, useMemo, useRef, memo, useReducer } from 'react';
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

// ── Constants (outside component) ────────────────────────────────
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
  { label: 'Manage', icon: CalendarDays, routes: ROUTES.MANAGE },
  { label: 'Catalog', icon: Layers, routes: ROUTES.CATALOG },
];

// Toast style - constant, not recreated
const TOAST_STYLE = {
  background: '#0A0A0A',
  color: '#f0f0f0',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '500',
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
};

// Simplified animation variants - constant objects
const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const DRAWER_VARIANTS = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
};

const POPOVER_VARIANTS = {
  hidden: { opacity: 0, y: 16, scale: 0.97, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 28,
      stiffness: 280,
      mass: 0.8,
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    filter: 'blur(2px)',
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const POPOVER_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', damping: 24, stiffness: 260 },
  },
  exit: { opacity: 0, x: -4, transition: { duration: 0.1 } },
};

const POPOVER_HEADER_VARIANTS = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 26, stiffness: 300, delay: 0.02 },
  },
};

const MENU_BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// Initial state for reducer
const initialState = {
  drawerOpen: false,
  menuOpen: null,
  showWelcome: false,
  mounted: false,
};

// State reducer for consolidated state management
function menuReducer(state, action) {
  switch (action.type) {
    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true, menuOpen: null };
    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false };
    case 'OPEN_MENU':
      return { ...state, menuOpen: action.payload, drawerOpen: false };
    case 'CLOSE_MENU':
      return { ...state, menuOpen: null };
    case 'CLOSE_ALL':
      return { ...state, drawerOpen: false, menuOpen: null };
    case 'SET_MOUNTED':
      return { ...state, mounted: true };
    case 'SHOW_WELCOME':
      return { ...state, showWelcome: true };
    case 'HIDE_WELCOME':
      return { ...state, showWelcome: false };
    default:
      return state;
  }
}

// ── Memoized Mobile Nav Item ─────────────────────────────────────
const MobileNavItem = memo(function MobileNavItem({
  item,
  isActive,
  isMenuOpen,
  onOpenMenu,
}) {
  const Icon = item.icon;
  const handleClick = useCallback(() => onOpenMenu(item), [item, onOpenMenu]);

  return (
    <button
      onClick={handleClick}
      className={`
                relative flex flex-col items-center justify-center gap-1 flex-1 h-full 
                transition-all duration-150 select-none active:scale-95
                ${isMenuOpen || isActive ? 'text-white' : 'text-gray-600'}
            `}
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
    >
      {/* Active indicator - CSS only */}
      <span
        className={`
                    absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-white
                    transition-all duration-200
                    ${isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'}
                `}
      />

      <div
        className={`
                    relative w-9 h-9 rounded-xl flex items-center justify-center
                    transition-all duration-150
                    ${isMenuOpen ? 'bg-white/12 scale-105' : isActive ? 'bg-white/10' : 'bg-transparent scale-95'}
                `}
      >
        {/* Dot indicator */}
        {isMenuOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
        )}

        <Icon
          className="h-[18px] w-[18px] transition-colors duration-150"
          strokeWidth={isMenuOpen || isActive ? 2.5 : 1.8}
          aria-hidden="true"
        />
      </div>

      <span className="text-[10px] font-medium leading-none transition-colors duration-150">
        {item.label}
      </span>
    </button>
  );
});

MobileNavItem.displayName = 'MobileNavItem';

// ── Memoized Menu Backdrop ───────────────────────────────────────
const MenuBackdrop = memo(function MenuBackdrop({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]"
      variants={MENU_BACKDROP_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      aria-hidden="true"
    />
  );
});

MenuBackdrop.displayName = 'MenuBackdrop';

// ── Memoized Menu Route Item ─────────────────────────────────────
const MenuRouteItem = memo(function MenuRouteItem({
  route,
  active,
  onClose,
  isSettings = false,
}) {
  const RouteIcon = route.icon;

  return (
    <>
      {isSettings && <div className="h-px mx-1 my-2 bg-white/[0.06]" />}
      <motion.div variants={POPOVER_ITEM_VARIANTS}>
        <Link href={route.href} onClick={onClose}>
          <div
            className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl 
                        transition-all duration-150 group relative overflow-hidden
                        active:scale-[0.98]
                        ${
                          active
                            ? 'bg-white text-black'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                    `}
            aria-current={active ? 'page' : undefined}
          >
            <RouteIcon
              className={`w-4 h-4 transition-colors duration-150 ${
                active
                  ? 'text-black'
                  : 'text-gray-500 group-hover:text-white'
              }`}
              strokeWidth={2}
            />
            <span className="flex-1 text-sm font-medium">{route.label}</span>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-all duration-150 group-hover:translate-x-0.5 ${
                active
                  ? 'text-black/50'
                  : 'text-gray-700 group-hover:text-gray-400'
              }`}
              strokeWidth={2}
            />
          </div>
        </Link>
      </motion.div>
    </>
  );
});

MenuRouteItem.displayName = 'MenuRouteItem';

// ── Memoized Menu Popover Content ────────────────────────────────
const MenuPopoverContent = memo(function MenuPopoverContent({
  item,
  onClose,
  pathname,
}) {
  const isRouteActive = useCallback(
    (route) =>
      pathname === route.href || pathname.startsWith(route.href + '/'),
    [pathname],
  );

  const allRoutes = useMemo(() => {
    if (item.label === 'Catalog') {
      return [
        ...item.routes,
        {
          label: 'Settings',
          href: '/admin/settings',
          icon: Settings,
          isSettings: true,
        },
      ];
    }
    return item.routes.map((r) => ({ ...r, isSettings: false }));
  }, [item]);

  const Icon = item.icon;

  return (
    <motion.div
      className="fixed bottom-[88px] left-3 right-3 z-50 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] shadow-2xl overflow-hidden"
      style={{ willChange: 'transform, opacity, filter' }}
      variants={POPOVER_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-title"
    >
      {/* Header */}
      <motion.div
        className="relative flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]"
        variants={POPOVER_HEADER_VARIANTS}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
            <Icon
              className="w-3.5 h-3.5 text-gray-400"
              strokeWidth={2}
            />
          </div>
          <h3
            id="menu-title"
            className="text-sm font-semibold text-white"
          >
            {item.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] 
                             hover:bg-white/[0.08] active:scale-90 transition-all duration-150"
          aria-label="Close menu"
        >
          <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
        </button>
      </motion.div>

      {/* Routes */}
      <div className="p-2">
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

MenuPopoverContent.displayName = 'MenuPopoverContent';

// ── Memoized Catalog Tabs ────────────────────────────────────────
const CatalogTabs = memo(function CatalogTabs({ pathname }) {
  const isInCatalog = useMemo(
    () =>
      ROUTES.CATALOG.some(
        (tab) =>
          pathname === tab.href || pathname.startsWith(tab.href + '/'),
      ),
    [pathname],
  );

  if (!isInCatalog) return null;

  return (
    <div className="sticky top-14 sm:top-16 z-30 bg-[#0A0A0A]/95 border-b border-white/[0.06]">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <nav
          className="flex gap-1 overflow-x-auto scrollbar-hide py-2"
          aria-label="Catalog navigation"
        >
          {ROUTES.CATALOG.map((tab) => {
            const isActive =
              pathname === tab.href ||
              pathname.startsWith(tab.href + '/');
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                                    whitespace-nowrap transition-all duration-150 shrink-0
                                    ${
                                      isActive
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
});

CatalogTabs.displayName = 'CatalogTabs';

// ── Loading Component ────────────────────────────────────────────
const LoadingScreen = memo(function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-0 rounded-full border border-transparent border-t-white/50 animate-spin" />
        </div>
        <p className="text-[10px] font-medium text-gray-700 uppercase tracking-[0.2em]">
          Loading
        </p>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

// ── Main Layout ──────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  const [state, dispatch] = useReducer(menuReducer, initialState);

  const { drawerOpen, menuOpen, showWelcome, mounted } = state;

  // Memoized current menu item
  const currentMenuItem = useMemo(
    () => MOBILE_NAV.find((item) => item.label === menuOpen) || null,
    [menuOpen],
  );

  // Memoized active tab
  const activeTab = useMemo(() => {
    for (const tab of MOBILE_NAV) {
      if (
        tab.routes.some(
          (r) =>
            pathname === r.href || pathname.startsWith(r.href + '/'),
        )
      ) {
        return tab.label;
      }
    }
    return null;
  }, [pathname]);

  // Callbacks
  const openMenu = useCallback((item) => {
    dispatch({ type: 'OPEN_MENU', payload: item.label });
  }, []);

  const closeMenu = useCallback(() => {
    dispatch({ type: 'CLOSE_MENU' });
  }, []);

  const openDrawer = useCallback(() => {
    dispatch({ type: 'OPEN_DRAWER' });
  }, []);

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'CLOSE_DRAWER' });
  }, []);

  const closeWelcome = useCallback(() => {
    dispatch({ type: 'HIDE_WELCOME' });
  }, []);

  const handleLogout = useCallback(() => logout?.(), [logout]);

  // Auth check effect
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, user, router]);

  // Mount effect
  useEffect(() => {
    dispatch({ type: 'SET_MOUNTED' });
    const hideWelcome =
      localStorage.getItem('hideWelcomePopup') === 'true';
    if (!hideWelcome) {
      dispatch({ type: 'SHOW_WELCOME' });
    }
  }, []);

  // Body overflow effect - batched
  useEffect(() => {
    const shouldLock = drawerOpen || menuOpen;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, menuOpen]);

  // Route change effect
  useEffect(() => {
    dispatch({ type: 'CLOSE_ALL' });
  }, [pathname]);

  // Escape key effect
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_ALL' });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Socket effect with stable toast style reference
  useEffect(() => {
    if (!socket) return;

    const onNew = (data) => {
      toast(
        `📅 New booking: ${data?.bookingCode ?? 'unknown'}`,
        {
          style: TOAST_STYLE,
          duration: 5000,
        },
      );
    };

    const onUpdate = (data) => {
      toast(
        `🔄 Booking ${data?.bookingCode ?? '—'} → ${data?.status ?? '—'}`,
        {
          style: TOAST_STYLE,
          duration: 4000,
        },
      );
    };

    socket.on('new_booking', onNew);
    socket.on('booking_status_updated', onUpdate);

    return () => {
      socket.off('new_booking', onNew);
      socket.off('booking_status_updated', onUpdate);
    };
  }, [socket]);

  // Early returns
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Welcome Popup */}
      {mounted && showWelcome && user && (
        <WelcomePopup user={user} onClose={closeWelcome} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-[220px] z-40">
        <Sidebar onLogout={handleLogout} isMobile={false} />
      </div>

      {/* Mobile backdrop & drawer */}
      <AnimatePresence mode="wait">
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              className="lg:hidden fixed inset-0 bg-black/80 z-50"
              variants={BACKDROP_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              className="lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] z-[60]"
              variants={DRAWER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              aria-modal="true"
              role="dialog"
              aria-label="Navigation drawer"
            >
              <Sidebar
                onLogout={handleLogout}
                onClose={closeDrawer}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-[220px] flex flex-col min-h-screen">
        <Header onMenuClick={openDrawer} onLogout={handleLogout} />

        <div className="hidden lg:block">
          <CatalogTabs pathname={pathname} />
        </div>

        <main
          className="flex-1 overflow-x-hidden"
          style={{
            paddingBottom:
              'calc(5.5rem + max(0px, env(safe-area-inset-bottom)))',
          }}
        >
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-6 lg:pb-8">
            <div className="max-w-screen-2xl mx-auto">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && <MenuBackdrop isOpen onClose={closeMenu} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentMenuItem && (
          <MenuPopoverContent
            key={currentMenuItem.label}
            item={currentMenuItem}
            onClose={closeMenu}
            pathname={pathname}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/98 border-t border-white/[0.06]"
        style={{
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        }}
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
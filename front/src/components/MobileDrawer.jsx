// components/MobileDrawer.jsx
"use client"

import { useEffect, useCallback, useRef, useMemo } from "react"
import {
  X,
  Phone,
  MapPin,
  LogOut,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  User,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"

// ── Constants ──────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "My Bookings", href: "/my-bookings", protected: true },
  { label: "Contact", href: "/contact" },
]

const CONTACT_INFO = {
  phone: "6900706456",
  phoneDisplay: "690 070 6456",
  location: "Duliajan",
  hours: "Open 9–5",
}

const TYPOGRAPHY = {
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: 'Georgia, "Times New Roman", serif',
}

const ANIMATION = {
  ease: [0.16, 1, 0.3, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
}

// ── Animation Variants ─────────────────────────────────────
const variants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  panel: {
    hidden: { opacity: 0, y: "100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: ANIMATION.ease },
    },
    exit: {
      opacity: 0,
      y: "100%",
      transition: { duration: 0.25, ease: ANIMATION.easeIn },
    },
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.15 },
    },
  },
  item: {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: ANIMATION.ease },
    },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 12 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay, ease: ANIMATION.ease },
    }),
  },
}

// ── Hooks ──────────────────────────────────────────────────
function useLockScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const originalStyle = {
      overflow: document.body.style.overflow,
      touchAction: document.body.style.touchAction,
    }

    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"

    return () => {
      document.body.style.overflow = originalStyle.overflow
      document.body.style.touchAction = originalStyle.touchAction
    }
  }, [isLocked])
}

function useKeyboardClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])
}

function useFocusTrap(isOpen, containerRef) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstElement?.focus()

    const handleTab = (e) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener("keydown", handleTab)
    return () => container.removeEventListener("keydown", handleTab)
  }, [isOpen, containerRef])
}

// ── Components ─────────────────────────────────────────────

const DrawerHandle = () => (
  <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
    <div className="w-10 h-1 rounded-full bg-gray-200" />
  </div>
)

const DrawerHeader = ({ onLogoClick, onClose }) => (
  <div className="flex items-center justify-between px-5 h-14 shrink-0">
    <button
      onClick={onLogoClick}
      className="bg-transparent border-0 p-0 cursor-pointer hover:opacity-70 transition-opacity"
      aria-label="Go to home"
    >
      <span
        className="tracking-[0.3em] uppercase text-black"
        style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 400, fontSize: "14px" }}
      >
        WASH2DOOR
      </span>
    </button>

    <motion.button
      whileTap={{ scale: 0.85, rotate: 90 }}
      transition={ANIMATION.spring}
      onClick={onClose}
      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 
                 rounded-full transition-colors duration-200"
      aria-label="Close navigation menu"
    >
      <X size={18} strokeWidth={1.5} className="text-black" />
    </motion.button>
  </div>
)

const UserCard = ({ user, onNavigate, onLogout }) => {
  const initials = useMemo(
    () => user?.firstName?.charAt(0)?.toUpperCase() || "U",
    [user?.firstName]
  )

  const fullName = useMemo(
    () => `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    [user?.firstName, user?.lastName]
  )

  return (
    <motion.div
      variants={variants.fadeUp}
      custom={0.1}
      initial="hidden"
      animate="visible"
      className="mx-4 mt-3 mb-2"
    >
      <div className="bg-gray-50 rounded-2xl p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span
              className="text-white"
              style={{ fontFamily: TYPOGRAPHY.serif, fontSize: "16px", fontWeight: 300 }}
            >
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-black truncate"
              style={{
                fontFamily: TYPOGRAPHY.serif,
                fontSize: "15px",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {fullName}
            </p>
            {user?.email && (
              <p
                className="text-gray-500 truncate mt-0.5"
                style={{ fontSize: "11px", fontFamily: TYPOGRAPHY.sans }}
              >
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate("/profile")}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-white border border-gray-200 
                       rounded-xl text-black tracking-[0.12em] uppercase transition-all duration-200
                       hover:border-black hover:bg-gray-50 active:scale-[0.98]"
            style={{ fontSize: "9px", fontWeight: 500, fontFamily: TYPOGRAPHY.sans }}
          >
            <User size={12} strokeWidth={1.5} />
            Profile
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 px-5 h-11 bg-white border border-gray-200 
                       rounded-xl text-red-500 tracking-[0.12em] uppercase transition-all duration-200
                       hover:border-red-200 hover:bg-red-50 active:scale-[0.98]"
            style={{ fontSize: "9px", fontWeight: 500, fontFamily: TYPOGRAPHY.sans }}
            aria-label="Sign out"
          >
            <LogOut size={12} strokeWidth={1.5} />
            Sign Out
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const NavLink = ({ link, index, requiresAuth, onClick }) => (
  <motion.button
    variants={variants.item}
    onClick={() => onClick(link)}
    whileTap={{ scale: 0.98, x: 4 }}
    className="group w-full flex items-center justify-between py-4 px-3 rounded-xl
               transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black 
               focus-visible:ring-offset-2"
  >
    <div className="flex items-center gap-4">
      {/* Number */}
      <span
        className="text-gray-300 tabular-nums w-5 text-right shrink-0"
        style={{ fontFamily: TYPOGRAPHY.serif, fontSize: "12px" }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Label */}
      <span
        className="text-black"
        style={{
          fontFamily: TYPOGRAPHY.serif,
          fontWeight: 400,
          fontSize: "16px",
          letterSpacing: "-0.01em",
        }}
      >
        {link.label}
      </span>

      {/* Auth badge */}
      {requiresAuth && (
        <span
          className="px-2 py-0.5 rounded-md border border-gray-200 text-gray-500
                     tracking-[0.1em] uppercase"
          style={{ fontSize: "7px", fontFamily: TYPOGRAPHY.sans }}
          aria-label="Login required"
        >
          Login Required
        </span>
      )}
    </div>

    <ChevronRight
      size={14}
      strokeWidth={1.5}
      className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5
                 transition-all duration-200"
      aria-hidden="true"
    />
  </motion.button>
)

const ContactBar = () => (
  <motion.div
    variants={variants.fadeUp}
    custom={0.25}
    initial="hidden"
    animate="visible"
    className="mx-4 py-4 border-t border-gray-100"
  >
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* Contact Info */}
      <div className="flex items-center gap-5 flex-wrap">
        <a
          href={`tel:${CONTACT_INFO.phone}`}
          className="flex items-center gap-2 no-underline group"
          aria-label={`Call ${CONTACT_INFO.phoneDisplay}`}
        >
          <div
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
                       group-hover:border-black group-hover:bg-black transition-all duration-300"
          >
            <Phone
              size={12}
              strokeWidth={1.5}
              className="text-gray-400 group-hover:text-white transition-colors duration-300"
            />
          </div>
          <span
            className="text-black group-hover:underline"
            style={{ fontFamily: TYPOGRAPHY.serif, fontSize: "13px", fontWeight: 400 }}
          >
            {CONTACT_INFO.phoneDisplay}
          </span>
        </a>

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"
            aria-hidden="true"
          >
            <MapPin size={12} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <span
            className="text-gray-500"
            style={{ fontSize: "12px", fontFamily: TYPOGRAPHY.sans }}
          >
            {CONTACT_INFO.location}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span
          className="text-gray-600 tracking-[0.08em] uppercase"
          style={{ fontSize: "9px", fontFamily: TYPOGRAPHY.sans, fontWeight: 500 }}
        >
          {CONTACT_INFO.hours}
        </span>
      </div>
    </div>
  </motion.div>
)

const BottomCTA = ({ user, onNavigate, onSignIn }) => {
  if (user) {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigate("/my-bookings")}
        className="w-full flex items-center justify-center gap-3 h-14 bg-black text-white rounded-2xl
                   hover:bg-gray-900 transition-colors duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black 
                   focus-visible:ring-offset-2"
      >
        <Calendar size={15} strokeWidth={1.5} />
        <span
          className="tracking-[0.2em] uppercase"
          style={{ fontSize: "10px", fontWeight: 500, fontFamily: TYPOGRAPHY.sans }}
        >
          View My Bookings
        </span>
      </motion.button>
    )
  }

  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigate("/bookings")}
        className="flex-1 flex items-center justify-center gap-2.5 h-14 bg-black text-white rounded-2xl
                   hover:bg-gray-900 transition-colors duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black 
                   focus-visible:ring-offset-2"
      >
        <span
          className="tracking-[0.2em] uppercase"
          style={{ fontSize: "10px", fontWeight: 500, fontFamily: TYPOGRAPHY.sans }}
        >
          Book Now
        </span>
        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
          <ArrowUpRight size={12} strokeWidth={2} className="text-white" />
        </div>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSignIn}
        className="px-6 h-14 border border-gray-200 rounded-2xl text-black
                   tracking-[0.2em] uppercase transition-all duration-200
                   hover:border-black hover:bg-black hover:text-white
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black 
                   focus-visible:ring-offset-2"
        style={{ fontSize: "10px", fontWeight: 500, fontFamily: TYPOGRAPHY.sans }}
      >
        Sign In
      </motion.button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function MobileDrawer({ isOpen, onClose }) {
  const { user, openModal, logout } = useAuth()
  const navigate = useNavigate()
  const panelRef = useRef(null)

  // Custom hooks
  useLockScroll(isOpen)
  useKeyboardClose(isOpen, onClose)
  useFocusTrap(isOpen, panelRef)

  // Event handlers
  const handleLogout = useCallback(() => {
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => logout(), 100)
    })
  }, [logout, onClose])

  const handleNavigate = useCallback(
    (href) => {
      onClose()
      requestAnimationFrame(() => {
        setTimeout(() => navigate(href), 100)
      })
    },
    [navigate, onClose]
  )

  const handleLinkClick = useCallback(
    (link) => {
      if (link.protected && !user) {
        onClose()
        requestAnimationFrame(() => {
          setTimeout(() => openModal("login"), 100)
        })
        return
      }
      handleNavigate(link.href)
    },
    [user, openModal, onClose, handleNavigate]
  )

  const handleSignIn = useCallback(() => {
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => openModal("login"), 100)
    })
  }, [openModal, onClose])

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={variants.backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            key="panel"
            variants={variants.panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-x-0 bottom-0 max-h-[92vh] bg-white flex flex-col 
                       rounded-t-3xl overflow-hidden shadow-2xl"
            style={{ fontFamily: TYPOGRAPHY.sans }}
          >
            <DrawerHandle />

            <DrawerHeader onLogoClick={() => handleNavigate("/")} onClose={onClose} />

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-5" aria-hidden="true" />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {user && (
                <UserCard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
              )}

              {/* Navigation */}
              <nav className="px-3 py-2" aria-label="Mobile navigation">
                <motion.div
                  variants={variants.stagger}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col"
                >
                  {NAV_LINKS.map((link, i) => (
                    <NavLink
                      key={link.href}
                      link={link}
                      index={i}
                      requiresAuth={link.protected && !user}
                      onClick={handleLinkClick}
                    />
                  ))}
                </motion.div>
              </nav>
            </div>

            {/* Bottom Section */}
            <div className="shrink-0 bg-white">
              <ContactBar />

              <motion.div
                variants={variants.fadeUp}
                custom={0.3}
                initial="hidden"
                animate="visible"
                className="px-4 pb-4"
              >
                <BottomCTA user={user} onNavigate={handleNavigate} onSignIn={handleSignIn} />
              </motion.div>

              {/* Safe Area Spacer */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
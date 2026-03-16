"use client"

import { useEffect, useCallback } from "react"
import {
  X,
  Phone,
  MapPin,
  LogOut,
  Calendar,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

// ── Constants ──────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/About" },
  { label: "Services", href: "/services" },
  { label: "My Bookings", href: "/my-bookings", protected: true },
  { label: "Contact", href: "/Contact" },
]

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = 'Georgia, "Times New Roman", serif'

// ── Animation variants ─────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.05 } },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: { duration: 0.25, ease: "easeIn" },
  },
}

const linkContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
}

const linkVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.32 + i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
}

// ── UserCard ───────────────────────────────────────────────
function UserCard({ user, onClose, onLogout }) {
  return (
    <motion.div
      custom={0}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="mx-4 mt-4 mb-1"
    >
      <div className="bg-gray-50 rounded-xl p-4 mb-1">
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shrink-0">
            <span className="text-white" style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 300 }}>
              {user.firstName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-black truncate" style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 400, letterSpacing: "-0.01em" }}>
              {user.firstName} {user.lastName}
            </p>
            {user.email && (
              <p className="text-gray-400 truncate mt-0.5" style={{ fontSize: "10px" }}>
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <motion.a
            whileTap={{ scale: 0.96 }}
            href="/profile"
            onClick={onClose}
            className="flex-1 flex items-center justify-center py-2.5
                       tracking-[0.15em] uppercase text-black
                       border border-gray-200 bg-white rounded-lg
                       no-underline transition-colors duration-200 min-h-[40px]
                       hover:border-black"
            style={{ fontSize: "9px", fontWeight: 500 }}
          >
            Profile
          </motion.a>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5
                       tracking-[0.15em] uppercase text-red-500
                       border border-gray-200 bg-white rounded-lg
                       transition-colors duration-200 min-h-[40px]
                       hover:border-red-200 hover:bg-red-50"
            style={{ fontSize: "9px", fontWeight: 500 }}
            aria-label="Sign out"
          >
            <LogOut size={11} strokeWidth={1.5} />
            Out
          </motion.button>
        </div>
      </div>

      <div className="h-px bg-gray-100 mt-3" aria-hidden="true" />
    </motion.div>
  )
}

// ── DrawerNavLink ──────────────────────────────────────────
function DrawerNavLink({ link, index, isProtected, onClick }) {
  return (
    <motion.a
      variants={linkVariants}
      href={isProtected ? "#" : link.href}
      onClick={(e) => {
        if (isProtected) e.preventDefault()
        onClick(link)
      }}
      whileTap={{ x: 4 }}
      className="group flex items-center justify-between
                 py-[13px] px-2 border-b border-gray-50 last:border-0
                 no-underline rounded-lg transition-colors duration-200
                 hover:bg-gray-50 active:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {/* Index number */}
        <span
          className="text-gray-200 tabular-nums w-5 text-right shrink-0"
          style={{ fontFamily: SERIF, fontSize: "11px" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className="text-black"
          style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "15px", letterSpacing: "-0.01em" }}
        >
          {link.label}
        </span>

        {isProtected && (
          <span
            className="tracking-[0.1em] uppercase text-gray-300
                       border border-gray-200 px-2 py-0.5 rounded"
            style={{ fontSize: "7px" }}
          >
            Login
          </span>
        )}
      </div>

      <ChevronRight
        size={13}
        strokeWidth={1.5}
        className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-0.5
                   transition-all duration-200"
        aria-hidden="true"
      />
    </motion.a>
  )
}

// ── ContactBar ─────────────────────────────────────────────
function ContactBar({ onClose }) {
  return (
    <motion.div
      custom={1}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="px-4 pt-3.5 pb-3.5 border-t border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.a
            whileTap={{ scale: 0.95 }}
            href="tel:6900706456"
            onClick={onClose}
            className="flex items-center gap-2 no-underline"
            aria-label="Call 6900706456"
          >
            <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
              <Phone size={11} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <span className="text-black" style={{ fontFamily: SERIF, fontSize: "12px", fontWeight: 400 }}>
              6900706456
            </span>
          </motion.a>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
              <MapPin size={11} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Duliajan</span>
          </div>
        </div>

        {/* Live availability dot */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" style={{ animationDuration: "2s" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-gray-300 tracking-[0.08em] uppercase" style={{ fontSize: "8px" }}>
            9–5 PM
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── BottomCTA ──────────────────────────────────────────────
function BottomCTA({ user, onClose, onSignIn }) {
  if (user) {
    return (
      <motion.a
        whileTap={{ scale: 0.97 }}
        href="/my-bookings"
        onClick={onClose}
        className="flex items-center justify-center gap-2.5
                   w-full py-4 bg-black text-white no-underline
                   rounded-xl min-h-[52px] hover:bg-gray-900
                   transition-colors duration-200"
      >
        <Calendar size={14} strokeWidth={1.5} />
        <span className="tracking-[0.22em] uppercase" style={{ fontSize: "10px", fontWeight: 500 }}>
          My Bookings
        </span>
      </motion.a>
    )
  }

  return (
    <div className="flex gap-2.5">
      <motion.a
        whileTap={{ scale: 0.97 }}
        href="/bookings"
        onClick={onClose}
        className="flex-1 flex items-center justify-center gap-2
                   py-4 bg-black text-white no-underline
                   rounded-xl min-h-[52px] hover:bg-gray-900
                   transition-colors duration-200"
      >
        <span className="tracking-[0.22em] uppercase" style={{ fontSize: "10px", fontWeight: 500 }}>
          Book Now
        </span>
        <ArrowUpRight size={13} strokeWidth={1.5} />
      </motion.a>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSignIn}
        className="px-5 py-4 tracking-[0.22em] uppercase text-black
                   border border-gray-200 rounded-xl min-h-[52px]
                   hover:border-black transition-colors duration-200 shrink-0"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        Sign In
      </motion.button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function MobileDrawer({ isOpen, onClose }) {
  const { user, openModal, logout } = useAuth()

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  const handleLogout = useCallback(() => {
    logout()
    onClose()
  }, [logout, onClose])

  const handleLinkClick = useCallback(
    (link) => {
      if (link.protected && !user) {
        openModal("login")
        onClose()
        return
      }
      onClose()
    },
    [user, openModal, onClose]
  )

  const handleSignIn = useCallback(() => {
    openModal("login")
    onClose()
  }, [openModal, onClose])

  return (
    <AnimatePresence>
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
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-3 left-3 right-3 bottom-3
                       bg-white flex flex-col rounded-2xl overflow-hidden
                       shadow-2xl"
            style={{ fontFamily: SANS }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 h-[54px] shrink-0">
              <a href="/" onClick={onClose} className="no-underline">
                <span
                  className="tracking-[0.35em] uppercase text-black"
                  style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "13px" }}
                >
                  WASH2DOOR
                </span>
              </a>

              <motion.button
                whileTap={{ scale: 0.88, rotate: 90 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center
                           hover:bg-gray-100 rounded-full
                           transition-colors duration-200 -mr-1"
                aria-label="Close navigation menu"
              >
                <X size={17} strokeWidth={1.3} className="text-black" />
              </motion.button>
            </div>

            <div className="h-px bg-gray-100 mx-5" aria-hidden="true" />

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* User card */}
              {user && (
                <UserCard user={user} onClose={onClose} onLogout={handleLogout} />
              )}

              {/* Nav links */}
              <nav className="flex flex-col mt-2 px-3" aria-label="Mobile navigation">
                <motion.div
                  variants={linkContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {NAV_LINKS.map((link, i) => (
                    <DrawerNavLink
                      key={link.label}
                      link={link}
                      index={i}
                      isProtected={link.protected && !user}
                      onClick={handleLinkClick}
                    />
                  ))}
                </motion.div>
              </nav>
            </div>

            {/* ── Bottom ── */}
            <div className="shrink-0">
              <ContactBar onClose={onClose} />

              <motion.div
                custom={2}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="px-4 pb-4"
              >
                <BottomCTA user={user} onClose={onClose} onSignIn={handleSignIn} />
              </motion.div>

              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
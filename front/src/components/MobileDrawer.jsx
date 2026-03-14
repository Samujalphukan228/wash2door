"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  X,
  Phone,
  MapPin,
  LogOut,
  Calendar,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// ── Constants ──────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/About" },
  { label: "Services", href: "/services" },
  { label: "My Bookings", href: "/my-bookings", protected: true },
  { label: "Contact", href: "/Contact" },
]

// ── Subcomponents ──────────────────────────────────────────

function UserCard({ user, onClose, onLogout }) {
  return (
    <div data-section className="mx-5 mt-5 mb-1">
      {/* User info */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className="w-11 h-11 rounded-full bg-black flex items-center
                     justify-center shrink-0"
        >
          <span
            className="text-white"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "14px",
              fontWeight: 300,
            }}
          >
            {user.firstName?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p
            className="text-black truncate"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "14px",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {user.firstName} {user.lastName}
          </p>
          {user.email && (
            <p
              className="text-gray-400 truncate mt-0.5"
              style={{ fontSize: "10px", letterSpacing: "0.02em" }}
            >
              {user.email}
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <a
          href="/profile"
          onClick={onClose}
          className="flex-1 flex items-center justify-center py-2.5
                     tracking-[0.15em] uppercase text-black
                     border border-gray-200 rounded-[4px]
                     no-underline active:bg-gray-100
                     transition-colors duration-200 min-h-[40px]"
          style={{ fontSize: "9px", fontWeight: 500 }}
        >
          Profile
        </a>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5
                     tracking-[0.15em] uppercase text-red-500
                     border border-gray-200 rounded-[4px]
                     active:bg-red-50 transition-colors duration-200
                     min-h-[40px]"
          style={{ fontSize: "9px", fontWeight: 500 }}
          aria-label="Sign out"
        >
          <LogOut size={11} strokeWidth={1.5} />
          Out
        </button>
      </div>

      <div className="h-px bg-gray-100 mt-5" aria-hidden="true" />
    </div>
  )
}

function DrawerNavLink({ link, isProtected, onClick }) {
  return (
    <a
      data-nav-link
      href={isProtected ? "#" : link.href}
      onClick={(e) => {
        if (isProtected) e.preventDefault()
        onClick(link)
      }}
      className="opacity-0 group flex items-center justify-between
                 py-[14px] px-2 border-b border-gray-50 last:border-0
                 no-underline active:bg-gray-50 rounded-[4px]
                 transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <span
          className="text-black"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: "15px",
            letterSpacing: "-0.01em",
          }}
        >
          {link.label}
        </span>

        {isProtected && (
          <span
            className="tracking-[0.1em] uppercase text-gray-300
                       border border-gray-200 px-2 py-0.5 rounded-[3px]"
            style={{ fontSize: "7px" }}
          >
            Login
          </span>
        )}
      </div>

      <ChevronRight
        size={14}
        strokeWidth={1.5}
        className="text-gray-200 group-active:translate-x-0.5
                   transition-transform duration-200"
        aria-hidden="true"
      />
    </a>
  )
}

function ContactBar({ onClose }) {
  return (
    <div data-section className="px-5 pt-4 pb-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <a
            href="tel:6900706456"
            onClick={onClose}
            className="flex items-center gap-2 no-underline
                       active:opacity-60 transition-opacity duration-200"
            aria-label="Call 6900706456"
          >
            <div
              className="w-7 h-7 rounded-full border border-gray-200
                         flex items-center justify-center shrink-0"
            >
              <Phone size={11} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <span
              className="text-black"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "12px",
                fontWeight: 400,
              }}
            >
              6900706456
            </span>
          </a>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full border border-gray-200
                         flex items-center justify-center shrink-0"
            >
              <MapPin size={11} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>
              Duliajan
            </span>
          </div>
        </div>

        <span
          className="tracking-[0.1em] uppercase text-gray-300"
          style={{ fontSize: "8px" }}
        >
          9–5 PM
        </span>
      </div>
    </div>
  )
}

function BottomCTA({ user, onClose, onSignIn }) {
  if (user) {
    return (
      <a
        href="/my-bookings"
        onClick={onClose}
        className="relative flex items-center justify-center gap-2.5
                   w-full py-4 bg-black text-white no-underline
                   rounded-[5px] overflow-hidden group min-h-[52px]
                   active:scale-[0.98] transition-all duration-200"
      >
        <span
          className="absolute inset-0 bg-white origin-bottom scale-y-0
                     group-active:scale-y-100 transition-transform
                     duration-500 ease-out"
          aria-hidden="true"
        />
        <Calendar
          size={14}
          strokeWidth={1.5}
          className="relative z-10 group-active:text-black
                     transition-colors duration-500"
        />
        <span
          className="relative z-10 tracking-[0.22em] uppercase
                     group-active:text-black transition-colors duration-500"
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          My Bookings
        </span>
      </a>
    )
  }

  return (
    <div className="flex gap-3">
      <a
        href="/bookings"
        onClick={onClose}
        className="relative flex-1 flex items-center justify-center
                   gap-2.5 py-4 bg-black text-white no-underline
                   rounded-[5px] overflow-hidden group min-h-[52px]
                   active:scale-[0.98] transition-all duration-200"
      >
        <span
          className="absolute inset-0 bg-white origin-bottom scale-y-0
                     group-active:scale-y-100 transition-transform
                     duration-500 ease-out"
          aria-hidden="true"
        />
        <span
          className="relative z-10 tracking-[0.22em] uppercase
                     group-active:text-black transition-colors duration-500"
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          Book Now
        </span>
        <ArrowUpRight
          size={13}
          strokeWidth={1.5}
          className="relative z-10 group-active:text-black
                     transition-colors duration-500"
        />
      </a>

      <button
        onClick={onSignIn}
        className="px-5 py-4 tracking-[0.22em] uppercase text-black
                   border border-gray-200 rounded-[5px] min-h-[52px]
                   active:bg-gray-100 transition-colors duration-200 shrink-0"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        Sign In
      </button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export default function MobileDrawer({ isOpen, onClose }) {
  const { user, openModal, logout } = useAuth()
  const panelRef = useRef(null)

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  // Animate in
  useEffect(() => {
    if (!isOpen) return
    let ctx

    const init = async () => {
      const { default: gsap } = await import("gsap")
      if (!panelRef.current) return

      const links = panelRef.current.querySelectorAll("[data-nav-link]")
      const sections = panelRef.current.querySelectorAll("[data-section]")

      ctx = gsap.context(() => {
        gsap.fromTo(
          links,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.25,
          }
        )
        gsap.fromTo(
          sections,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.35,
          }
        )
      })
    }

    init()
    return () => ctx?.revert()
  }, [isOpen])

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
    <div
      className={`fixed inset-0 z-[9999] ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-all duration-500 ${
          isOpen
            ? "opacity-100 bg-black/60 backdrop-blur-sm"
            : "opacity-0 bg-black/0"
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute top-3 left-3 right-3 bottom-3
                    bg-white flex flex-col rounded-lg overflow-hidden
                    will-change-transform shadow-2xl
                    transition-all duration-500
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${
                      isOpen
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-4 opacity-0 scale-[0.97]"
                    }`}
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 h-[52px] shrink-0">
          <a href="/" onClick={onClose} className="no-underline">
            <span
              className="tracking-[0.35em] uppercase text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "13px",
              }}
            >
              WASH2DOOR
            </span>
          </a>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center
                       active:bg-gray-100 rounded-full
                       transition-colors duration-200 -mr-1"
            aria-label="Close navigation menu"
          >
            <X size={18} strokeWidth={1.3} className="text-black" />
          </button>
        </div>

        <div className="h-px bg-gray-100 mx-5" aria-hidden="true" />

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* User card */}
          {user && (
            <UserCard user={user} onClose={onClose} onLogout={handleLogout} />
          )}

          {/* Navigation links */}
          <nav className="flex flex-col mt-3 px-3" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <DrawerNavLink
                key={link.label}
                link={link}
                isProtected={link.protected && !user}
                onClick={handleLinkClick}
              />
            ))}
          </nav>
        </div>

        {/* ── Bottom Section (fixed) ── */}
        <div className="shrink-0">
          <ContactBar onClose={onClose} />

          <div data-section className="px-5 pb-5">
            <BottomCTA user={user} onClose={onClose} onSignIn={handleSignIn} />
          </div>

          {/* iOS safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </div>
  )
}
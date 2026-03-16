"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Phone, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import TopBar from "./TopBar"
import MobileDrawer from "./MobileDrawer"
import AuthModal from "./AuthModal"

// ── Constants ──────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/About" },
  { label: "Services", href: "/services" },
  { label: "Bookings", href: "/my-bookings", protected: true },
  { label: "Contact", href: "/Contact" },
]

const DROPDOWN_ITEMS = [
  { label: "My Profile", href: "/profile" },
  { label: "My Bookings", href: "/my-bookings" },
]

// ── Subcomponents ──────────────────────────────────────────

function LoadingSpinner({ size = 16 }) {
  return (
    <div
      className="border-2 border-gray-200 border-t-black rounded-full animate-spin"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

function UserAvatar({ name, size = "sm", onClick }) {
  const dimensions = size === "sm" ? "w-8 h-8" : "w-11 h-11"
  const fontSize = size === "sm" ? "12px" : "14px"

  const Tag = onClick ? "button" : "div"
  const interactiveClasses = onClick
    ? "active:scale-90 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
    : ""

  return (
    <Tag
      onClick={onClick}
      className={`${dimensions} rounded-full bg-black flex items-center
                  justify-center shrink-0 ${interactiveClasses}`}
      aria-label={onClick ? "Open menu" : undefined}
    >
      <span
        className="text-white select-none"
        style={{ fontFamily: "Georgia, serif", fontSize, fontWeight: 300 }}
      >
        {name?.charAt(0)?.toUpperCase() || "?"}
      </span>
    </Tag>
  )
}

function MobileMenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center
                 active:scale-90 transition-transform duration-150
                 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                 rounded-lg"
      aria-label="Open navigation menu"
    >
      <div className="space-y-1.5">
        <span className="block w-5 h-[1.5px] bg-black rounded-full" />
        <span className="block w-3.5 h-[1.5px] bg-black rounded-full" />
      </div>
    </button>
  )
}

function NavLink({ link, onProtectedClick }) {
  return (
    <a
      href={link.href}
      onClick={(e) => onProtectedClick(e, link)}
      className="relative px-4 xl:px-5 py-2 tracking-[0.18em] uppercase text-gray-400
                 hover:text-black transition-colors duration-300 no-underline group
                 focus:outline-none focus:text-black"
      style={{ fontSize: "10px", fontWeight: 500 }}
    >
      {link.label}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1
                   rounded-full bg-black scale-0 group-hover:scale-100
                   transition-transform duration-300"
        aria-hidden="true"
      />
    </a>
  )
}

function UserDropdown({ user, isOpen, onToggle, onClose, onLogout, dropdownRef }) {
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 py-1.5 px-2
                   hover:bg-gray-50 rounded-full transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <UserAvatar name={user.firstName} />
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-xl
                    border border-gray-100
                    shadow-[0_10px_40px_rgba(0,0,0,0.1),0_2px_10px_rgba(0,0,0,0.05)]
                    transition-all duration-200 z-50 overflow-hidden
                    ${
                      isOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-1 pointer-events-none"
                    }`}
        role="menu"
      >
        {/* User info header */}
        <div className="p-4 bg-black text-white">
          <p
            className="truncate"
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
              className="text-white/50 mt-0.5 truncate"
              style={{ fontSize: "11px" }}
            >
              {user.email}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="py-1" role="none">
          {DROPDOWN_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center px-4 py-2.5 tracking-[0.12em] uppercase
                         text-gray-500 hover:text-black hover:bg-gray-50
                         transition-all duration-200 no-underline
                         focus:outline-none focus:bg-gray-50 focus:text-black"
              style={{ fontSize: "10px" }}
              onClick={onClose}
              role="menuitem"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-3" aria-hidden="true" />

        {/* Sign out */}
        <div className="p-2">
          <button
            onClick={onLogout}
            className="w-full py-2 tracking-[0.12em] uppercase text-red-500
                       hover:bg-red-50 transition-colors duration-200 rounded-lg
                       focus:outline-none focus:bg-red-50"
            style={{ fontSize: "10px" }}
            role="menuitem"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, loading, openModal, logout } = useAuth()
  const dropdownRef = useRef(null)

  // Track scroll position
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setDropdownOpen(false)
    }
    if (dropdownOpen) {
      document.addEventListener("keydown", handleKey)
      return () => document.removeEventListener("keydown", handleKey)
    }
  }, [dropdownOpen])

  const handleProtectedClick = useCallback(
    (e, link) => {
      if (link.protected && !user) {
        e.preventDefault()
        openModal("login")
      }
    },
    [user, openModal]
  )

  const handleDropdownLogout = useCallback(() => {
    setDropdownOpen(false)
    logout()
  }, [logout])

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopBar />

      <nav
        className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${
          scrolled
            ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.04)]"
            : ""
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ═══ MOBILE ═══ */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left: Menu trigger */}
            <div className="w-24 flex justify-start">
              <MobileMenuButton onClick={() => setMobileOpen(true)} />
            </div>

            {/* Center: Logo */}
            <a
              href="/"
              className="no-underline flex-shrink-0"
              aria-label="Wash2Door — Home"
            >
              <span
                className="text-black tracking-[0.3em]"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: "15px",
                }}
              >
                W2D
              </span>
            </a>

            {/* Right: Auth */}
            <div className="w-24 flex justify-end">
              {loading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : user ? (
                <UserAvatar
                  name={user.firstName}
                  onClick={() => setMobileOpen(true)}
                />
              ) : (
                <button
                  onClick={() => openModal("login")}
                  className="h-8 px-4 bg-black text-white rounded-full
                             tracking-[0.15em] uppercase active:scale-95
                             transition-transform duration-150
                             focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  style={{ fontSize: "9px", fontWeight: 500 }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ DESKTOP ═══ */}
        <div className="hidden lg:block">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center h-16 xl:h-18 px-8 xl:px-12">
              {/* Left: Logo */}
              <a 
                href="/" 
                className="no-underline group shrink-0" 
                aria-label="Wash2Door — Home"
              >
                <div className="flex items-baseline gap-2.5">
                  <span
                    className="text-black tracking-[0.3em] xl:tracking-[0.35em] 
                               group-hover:tracking-[0.4em] xl:group-hover:tracking-[0.45em]
                               transition-all duration-500"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 400,
                      fontSize: "clamp(18px, 1.5vw, 22px)",
                    }}
                  >
                    WASH2DOOR
                  </span>
                  <span
                    className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-black/20 
                               group-hover:bg-black transition-colors duration-300"
                    aria-hidden="true"
                  />
                </div>
              </a>

              {/* Center: Nav links */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-0.5 xl:gap-1">
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.label}
                      link={link}
                      onProtectedClick={handleProtectedClick}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Phone + Auth */}
              <div className="flex items-center gap-3 xl:gap-4 shrink-0">
                <a
                  href="tel:6900706456"
                  className="flex items-center gap-2 text-gray-400 hover:text-black
                             transition-colors duration-300 no-underline p-2 -m-2
                             focus:outline-none focus:text-black"
                  aria-label="Call us"
                >
                  <Phone size={14} strokeWidth={1.5} />
                  <span
                    className="tracking-[0.15em] uppercase hidden xl:inline"
                    style={{ fontSize: "10px" }}
                  >
                    Call Us
                  </span>
                </a>

                <div className="w-px h-4 bg-gray-200" aria-hidden="true" />

                {loading ? (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : user ? (
                  <UserDropdown
                    user={user}
                    isOpen={dropdownOpen}
                    onToggle={() => setDropdownOpen((prev) => !prev)}
                    onClose={() => setDropdownOpen(false)}
                    onLogout={handleDropdownLogout}
                    dropdownRef={dropdownRef}
                  />
                ) : (
                  <button
                    onClick={() => openModal("login")}
                    className="h-9 px-5 bg-black text-white rounded-full
                               tracking-[0.15em] uppercase hover:bg-gray-800
                               active:scale-95 transition-all duration-200
                               focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    style={{ fontSize: "10px", fontWeight: 500 }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <AuthModal />
    </div>
  )
}
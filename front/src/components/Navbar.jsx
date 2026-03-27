"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Phone, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"
import TopBar from "./TopBar"
import MobileDrawer from "./MobileDrawer"
import AuthModal from "./AuthModal"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Bookings", href: "/my-bookings", protected: true },
  { label: "Contact", href: "/contact" },
]

const DROPDOWN_ITEMS = [
  { label: "My Profile", href: "/profile" },
  { label: "My Bookings", href: "/my-bookings" },
]

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = 'Georgia, "Times New Roman", serif'

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
}

const navbarVariants = {
  top: { boxShadow: "0 0 0 rgba(0,0,0,0)" },
  scrolled: {
    boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)",
  },
}

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
  const dimensions = size === "sm" ? "w-8 h-8" : "w-10 h-10"
  const fontSize = size === "sm" ? "12px" : "14px"
  const Tag = onClick ? motion.button : "div"

  return (
    <Tag
      onClick={onClick}
      whileTap={onClick ? { scale: 0.88 } : undefined}
      className={`${dimensions} rounded-full bg-black flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
      aria-label={onClick ? "Open menu" : undefined}
    >
      <span
        className="text-white select-none"
        style={{ fontFamily: SERIF, fontSize, fontWeight: 300 }}
      >
        {name?.charAt(0)?.toUpperCase() || "?"}
      </span>
    </Tag>
  )
}

function MobileMenuButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="w-10 h-10 flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      aria-label="Open navigation menu"
    >
      <div className="space-y-[5px]">
        <span className="block w-5 h-[1.5px] bg-black rounded-full" />
        <span className="block w-3.5 h-[1.5px] bg-black rounded-full" />
      </div>
    </motion.button>
  )
}

function NavLink({ link, onProtectedClick }) {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    if (link.protected) {
      const blocked = onProtectedClick(link)
      if (blocked) return
    }
    navigate(link.href)
  }

  return (
    <a 
      href={link.href} 
      onClick={handleClick} 
      className="relative px-4 xl:px-5 py-2 tracking-[0.18em] uppercase text-gray-400 hover:text-black transition-colors duration-300 no-underline group focus:outline-none focus:text-black" 
      style={{ fontSize: "10px", fontWeight: 500 }}
    >
      {link.label}
      <motion.span
        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />
    </a>
  )
}

function UserDropdown({ user, isOpen, onToggle, onClose, onLogout, dropdownRef }) {
  const navigate = useNavigate()

  const handleItemClick = (href) => {
    onClose()
    navigate(href)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <UserAvatar name={user.firstName} />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown size={12} className="text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 z-50 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1),0_2px_10px_rgba(0,0,0,0.05)]"
            role="menu"
          >
            <div className="p-4 bg-black text-white">
              <p className="truncate" style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 400, letterSpacing: "-0.01em" }}>
                {user.firstName} {user.lastName}
              </p>
              {user.email && (
                <p className="text-white/50 mt-0.5 truncate" style={{ fontSize: "11px" }}>
                  {user.email}
                </p>
              )}
            </div>

            <div className="py-1" role="none">
              {DROPDOWN_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item.href)}
                  className="w-full text-left flex items-center px-4 py-2.5 tracking-[0.12em] uppercase text-gray-500 hover:text-black hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-gray-50 focus:text-black"
                  style={{ fontSize: "10px" }}
                  role="menuitem"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-gray-100 mx-3" aria-hidden="true" />

            <div className="p-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onLogout}
                className="w-full py-2 tracking-[0.12em] uppercase text-red-500 hover:bg-red-50 transition-colors duration-200 rounded-lg focus:outline-none focus:bg-red-50"
                style={{ fontSize: "10px" }}
                role="menuitem"
              >
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, loading, openModal, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const handleKey = (e) => {
      if (e.key === "Escape") setDropdownOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [dropdownOpen])

  const handleProtectedClick = useCallback(
    (link) => {
      if (link.protected && !user) {
        openModal("login")
        return true
      }
      return false
    },
    [user, openModal]
  )

  const handleDropdownLogout = useCallback(() => {
    setDropdownOpen(false)
    logout()
  }, [logout])

  return (
    <div style={{ fontFamily: SANS }}>
      <TopBar />

      <motion.nav
        animate={scrolled ? "scrolled" : "top"}
        variants={navbarVariants}
        transition={{ duration: 0.3 }}
        className="bg-white sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MOBILE NAVBAR */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 h-14">

            <div className="w-24 flex justify-start">
              <MobileMenuButton onClick={() => setMobileOpen(true)} />
            </div>

            {/* ─────────────────────────────────────────────────────────── */}
            {/* MOBILE LOGO                                                 */}
            {/* Change fontSize below to make it bigger or smaller          */}
            {/* Current: 18px                                               */}
            {/* ─────────────────────────────────────────────────────────── */}
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); navigate("/") }} 
              className="no-underline shrink-0" 
              aria-label="Wash2Door Home"
            >
              <span 
                className="text-black tracking-[0.3em]" 
                style={{ 
                  fontFamily: SERIF, 
                  fontWeight: 400, 
                  fontSize: "18px"  // ← MOBILE LOGO SIZE
                }}
              >
                W2D
              </span>
            </a>
            {/* ─────────────────────────────────────────────────────────── */}

            <div className="w-24 flex justify-end">
              {loading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : user ? (
                <UserAvatar name={user.firstName} onClick={() => setMobileOpen(true)} />
              ) : (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => openModal("login")}
                  className="h-8 px-4 bg-black text-white rounded-full tracking-[0.15em] uppercase focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  style={{ fontSize: "9px", fontWeight: 500 }}
                >
                  Sign In
                </motion.button>
              )}
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* DESKTOP NAVBAR */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center h-16 xl:h-[72px] px-8 xl:px-12">

              {/* ─────────────────────────────────────────────────────────── */}
              {/* DESKTOP LOGO                                                */}
              {/* Change fontSize below to make it bigger or smaller          */}
              {/* Current: clamp(22px, 1.8vw, 26px)                           */}
              {/* Format: clamp(min, preferred, max)                          */}
              {/* ─────────────────────────────────────────────────────────── */}
              <a 
                href="/" 
                onClick={(e) => { e.preventDefault(); navigate("/") }} 
                className="no-underline group shrink-0" 
                aria-label="Wash2Door Home"
              >
                <div className="flex items-baseline gap-2.5">
                  <motion.span
                    className="text-black"
                    style={{ 
                      fontFamily: SERIF, 
                      fontWeight: 400, 
                      fontSize: "clamp(22px, 1.8vw, 26px)",  // ← DESKTOP LOGO SIZE
                      letterSpacing: "0.3em", 
                      display: "inline-block" 
                    }}
                    whileHover={{ letterSpacing: "0.45em" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    WASH2DOOR
                  </motion.span>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-black/20"
                    whileHover={{ backgroundColor: "rgba(0,0,0,1)" }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  />
                </div>
              </a>
              {/* ─────────────────────────────────────────────────────────── */}

              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-0.5 xl:gap-1">
                  {NAV_LINKS.map((link) => (
                    <NavLink key={link.label} link={link} onProtectedClick={handleProtectedClick} />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 xl:gap-4 shrink-0">
                <a 
                  href="tel:6900706456" 
                  className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors duration-300 no-underline p-2 -m-2 focus:outline-none focus:text-black" 
                  aria-label="Call us"
                >
                  <Phone size={14} strokeWidth={1.5} />
                  <span className="tracking-[0.15em] uppercase hidden xl:inline" style={{ fontSize: "10px" }}>
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
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => openModal("login")}
                    className="h-9 px-5 bg-black text-white rounded-full tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    style={{ fontSize: "10px", fontWeight: 500 }}
                  >
                    Sign In
                  </motion.button>
                )}
              </div>

            </div>
          </div>
        </div>
      </motion.nav>

      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <AuthModal />
    </div>
  )
}
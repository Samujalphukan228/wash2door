// components/Navbar.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, LogIn, ChevronDown, Search, ShoppingBag } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import TopBar from "./TopBar"
import MobileDrawer from "./MobileDrawer"
import AuthModal from "./AuthModal"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/About" },
  { label: "Services", href: "/services" },
  { label: "Bookings", href: "/my-bookings", protected: true },
  { label: "Contact", href: "/Contact" },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, loading, openModal, logout } = useAuth()
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

  const handleProtectedClick = (e, link) => {
    if (link.protected && !user) {
      e.preventDefault()
      openModal("login")
    }
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopBar />

      <nav
        className={`bg-white sticky top-0 z-50 transition-all duration-700 ${
          scrolled
            ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.03)]"
            : ""
        }`}
      >
        {/* ═══ MOBILE ═══ */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-5 h-16">
            {/* Left: Menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center -ml-2
                         active:scale-90 transition-transform duration-150"
              aria-label="Menu"
            >
              <div className="space-y-1.5">
                <span className="block w-5 h-[1.5px] bg-black" />
                <span className="block w-3.5 h-[1.5px] bg-black" />
              </div>
            </button>

            {/* Center: Logo */}
            <a href="/" className="absolute left-1/2 -translate-x-1/2 no-underline">
              <span
                className="text-black tracking-[0.3em]"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: "16px",
                }}
              >
                W2D
              </span>
            </a>

            {/* Right */}
            <div className="flex items-center gap-1 -mr-2">
              {loading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
              ) : user ? (
                <button
                  onClick={() => setMobileOpen(true)}
                  className="w-10 h-10 flex items-center justify-center
                             active:scale-90 transition-transform duration-150"
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <span
                      className="text-white text-xs"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {user.firstName?.charAt(0)}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => openModal("login")}
                  className="h-8 px-4 bg-black text-white rounded-full
                             tracking-[0.15em] uppercase active:scale-95
                             transition-transform duration-150"
                  style={{ fontSize: "9px" }}
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
            <div className="flex items-center h-20 px-10 xl:px-16">
              {/* Left: Logo */}
              <a href="/" className="no-underline group mr-16">
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-black tracking-[0.35em] group-hover:tracking-[0.5em]
                               transition-all duration-500"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 400,
                      fontSize: "22px",
                    }}
                  >
                    WASH2DOOR
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-black
                                   transition-colors duration-300" />
                </div>
              </a>

              {/* Center: Nav */}
              <div className="flex-1 flex items-center justify-center gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleProtectedClick(e, link)}
                    className="relative px-5 py-2 tracking-[0.18em] uppercase text-gray-400
                               hover:text-black transition-colors duration-300 no-underline
                               group"
                    style={{ fontSize: "10px" }}
                  >
                    {link.label}
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1
                                 rounded-full bg-black scale-0 group-hover:scale-100
                                 transition-transform duration-300"
                    />
                  </a>
                ))}
              </div>

              {/* Right */}
              <div className="flex items-center gap-4 ml-16">
                <a
                  href="tel:6900706456"
                  className="flex items-center gap-2 text-gray-400 hover:text-black
                             transition-colors duration-300 no-underline"
                >
                  <Phone size={14} strokeWidth={1.5} />
                  <span
                    className="tracking-[0.15em] uppercase hidden xl:inline"
                    style={{ fontSize: "10px" }}
                  >
                    Call Us
                  </span>
                </a>

                <div className="w-px h-4 bg-gray-200" />

                {loading ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 py-1.5 px-2 -mr-2
                                 hover:bg-gray-50 rounded-full transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <span
                          className="text-white text-xs"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {user.firstName?.charAt(0)}
                        </span>
                      </div>
                      <ChevronDown
                        size={12}
                        className={`text-gray-400 transition-transform duration-300 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    <div
                      className={`absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl
                                 border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.1)]
                                 transition-all duration-300 z-50 overflow-hidden
                                 ${
                                   dropdownOpen
                                     ? "opacity-100 visible translate-y-0 scale-100"
                                     : "opacity-0 invisible -translate-y-2 scale-[0.98]"
                                 }`}
                    >
                      {/* User info */}
                      <div className="p-5 bg-black text-white">
                        <p
                          style={{
                            fontFamily: "Georgia, serif",
                            fontSize: "15px",
                            fontWeight: 400,
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </p>
                        {user.email && (
                          <p className="text-white/50 mt-1 truncate" style={{ fontSize: "11px" }}>
                            {user.email}
                          </p>
                        )}
                      </div>

                      <div className="py-2">
                        {[
                          { label: "My Profile", href: "/profile" },
                          { label: "My Bookings", href: "/my-bookings" },
                        ].map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            className="flex items-center px-5 py-3 tracking-[0.15em] uppercase
                                       text-gray-500 hover:text-black hover:bg-gray-50
                                       transition-all duration-200 no-underline"
                            style={{ fontSize: "10px" }}
                            onClick={() => setDropdownOpen(false)}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>

                      <div className="p-3 pt-0">
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            logout()
                          }}
                          className="w-full py-2.5 tracking-[0.15em] uppercase text-red-500
                                     hover:bg-red-50 transition-colors rounded-xl
                                     border border-red-100"
                          style={{ fontSize: "10px" }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openModal("login")}
                    className="h-10 px-6 bg-black text-white rounded-full
                               tracking-[0.18em] uppercase hover:bg-gray-800
                               active:scale-95 transition-all duration-300"
                    style={{ fontSize: "10px" }}
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
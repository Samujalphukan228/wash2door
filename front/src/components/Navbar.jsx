// Navbar.jsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Phone, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"
import TopBar from "./TopBar"
import MobileDrawer from "./MobileDrawer"
import AuthModal from "./AuthModal"

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home",     href: "/"           },
  { label: "About",    href: "/about"      },
  { label: "Services", href: "/services"   },
  { label: "Bookings", href: "/my-bookings", protected: true },
  { label: "Contact",  href: "/contact"    },
]

const DROPDOWN_ITEMS = [
  { label: "My Profile",  href: "/profile"     },
  { label: "My Bookings", href: "/my-bookings" },
]

const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"

// ─── Variants ─────────────────────────────────────────────────────────────────

const dropdownVariants = {
  hidden:  { opacity: 0, y: -6, scale: 0.97,
             transition: { duration: 0.15, ease: "easeIn" } },
  visible: { opacity: 1, y: 0,  scale: 1,
             transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function LoadingSpinner({ size = 15 }) {
  return (
    <div
      style={{
        width:        size,
        height:       size,
        borderRadius: "50%",
        border:       "1.5px solid rgba(0,0,0,0.06)",
        borderTopColor: "rgba(0,0,0,0.7)",
        animation:    "w2d-spin 0.7s linear infinite",
      }}
      role="status"
      aria-label="Loading"
    />
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserAvatar({ name, size = 32, onClick }) {
  const Tag = onClick ? motion.button : "div"
  return (
    <Tag
      onClick={onClick}
      whileTap={onClick ? { scale: 0.9 } : undefined}
      aria-label={onClick ? "Open menu" : undefined}
      style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     "#1a1a1a",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        cursor:         onClick ? "pointer" : "default",
        border:         "none",
        outline:        "none",
      }}
    >
      <span style={{
        fontFamily: SERIF,
        fontSize:   size * 0.4,
        fontWeight: 300,
        color:      "rgba(255,255,255,0.92)",
        fontStyle:  "italic",
        userSelect: "none",
      }}>
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </span>
    </Tag>
  )
}

function HamburgerButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      aria-label="Open navigation menu"
      style={{
        width:          40,
        height:         40,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "flex-start",
        justifyContent: "center",
        gap:            5,
        background:     "none",
        border:         "none",
        cursor:         "pointer",
        padding:        "0 4px",
      }}
    >
      <span style={{ display:"block", width:20, height:1.5, background:"rgba(0,0,0,0.75)", borderRadius:2 }} />
      <span style={{ display:"block", width:14, height:1.5, background:"rgba(0,0,0,0.75)", borderRadius:2 }} />
    </motion.button>
  )
}

function NavLink({ link, currentPath, onProtectedClick }) {
  const navigate    = useNavigate()
  const isActive    = currentPath === link.href

  const handleClick = (e) => {
    e.preventDefault()
    if (link.protected && onProtectedClick(link)) return
    navigate(link.href)
  }

  return (
    <a
      href={link.href}
      onClick={handleClick}
      style={{
        position:      "relative",
        display:       "inline-flex",
        alignItems:    "center",
        padding:       "6px 14px",
        fontFamily:    SANS,
        fontSize:      10,
        fontWeight:    500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color:         isActive ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.34)",
        textDecoration:"none",
        transition:    "color 0.25s",
        whiteSpace:    "nowrap",
      }}
      className="w2d-navlink"
    >
      {link.label}
      {isActive && (
        <span style={{
          position:     "absolute",
          bottom:       2,
          left:         "50%",
          transform:    "translateX(-50%)",
          width:        3,
          height:       3,
          borderRadius: "50%",
          background:   "rgba(0,0,0,0.7)",
        }} />
      )}
    </a>
  )
}

function UserDropdown({ user, isOpen, onToggle, onClose, onLogout, dropdownRef }) {
  const navigate = useNavigate()

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.94 }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account menu"
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            6,
          padding:        "4px 8px 4px 4px",
          background:     "none",
          border:         "0.5px solid",
          borderColor:    isOpen ? "rgba(0,0,0,0.12)" : "transparent",
          borderRadius:   999,
          cursor:         "pointer",
          transition:     "border-color 0.2s, background 0.2s",
        }}
        className="w2d-avatar-btn"
      >
        <UserAvatar name={user.firstName} size={30} />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown size={11} strokeWidth={1.5}
            style={{ color: "rgba(0,0,0,0.3)", display:"block" }} />
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
            role="menu"
            style={{
              position:     "absolute",
              right:        0,
              top:          "calc(100% + 10px)",
              width:        220,
              background:   "#fff",
              borderRadius: 14,
              border:       "0.5px solid rgba(0,0,0,0.06)",
              boxShadow:    "0 10px 40px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04)",
              overflow:     "hidden",
              zIndex:       100,
            }}
          >
            {/* Header */}
            <div style={{
              padding:    "14px 16px",
              background: "#161616",
            }}>
              <p style={{
                fontFamily:   SERIF,
                fontSize:     13,
                fontWeight:   300,
                fontStyle:    "italic",
                color:        "rgba(255,255,255,0.92)",
                margin:       0,
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}>
                {user.firstName} {user.lastName}
              </p>
              {user.email && (
                <p style={{
                  fontSize:     10,
                  color:        "rgba(255,255,255,0.34)",
                  margin:       "3px 0 0",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {user.email}
                </p>
              )}
            </div>

            {/* Nav items */}
            <div style={{ padding: "6px 0" }} role="none">
              {DROPDOWN_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { onClose(); navigate(item.href) }}
                  role="menuitem"
                  className="w2d-dropdown-item"
                  style={{
                    width:         "100%",
                    textAlign:     "left",
                    display:       "flex",
                    alignItems:    "center",
                    padding:       "9px 16px",
                    fontFamily:    SANS,
                    fontSize:      10,
                    fontWeight:    500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color:         "rgba(0,0,0,0.4)",
                    background:    "none",
                    border:        "none",
                    cursor:        "pointer",
                    transition:    "color 0.2s, background 0.2s",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "0.5px", background: "rgba(0,0,0,0.05)", margin: "0 12px" }} />

            {/* Sign out */}
            <div style={{ padding: 8 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onLogout}
                role="menuitem"
                className="w2d-signout-btn"
                style={{
                  width:          "100%",
                  padding:        "8px 12px",
                  fontFamily:     SANS,
                  fontSize:       10,
                  fontWeight:     500,
                  letterSpacing:  "0.12em",
                  textTransform:  "uppercase",
                  color:          "#e04040",
                  background:     "none",
                  border:         "none",
                  borderRadius:   8,
                  cursor:         "pointer",
                  transition:     "background 0.18s",
                }}
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [currentPath,  setCurrentPath]  = useState("/")

  const { user, loading, openModal, logout } = useAuth()
  const navigate    = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const h = (e) => e.key === "Escape" && setDropdownOpen(false)
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [dropdownOpen])

  const handleProtectedClick = useCallback(
    (link) => {
      if (link.protected && !user) { openModal("login"); return true }
      return false
    },
    [user, openModal]
  )

  const handleDropdownLogout = useCallback(() => {
    setDropdownOpen(false)
    logout()
  }, [logout])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;1,300&display=swap');

        @keyframes w2d-spin {
          to { transform: rotate(360deg); }
        }

        .w2d-navlink:hover {
          color: rgba(0,0,0,0.8) !important;
        }

        .w2d-avatar-btn:hover {
          background: rgba(0,0,0,0.02) !important;
          border-color: rgba(0,0,0,0.08) !important;
        }

        .w2d-dropdown-item:hover {
          color: rgba(0,0,0,0.8) !important;
          background: rgba(0,0,0,0.025) !important;
        }

        .w2d-signout-btn:hover {
          background: rgba(224,64,64,0.05) !important;
        }

        .w2d-phone-link {
          color: rgba(0,0,0,0.3);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.25s;
          padding: 6px;
          margin: -6px;
          border-radius: 8px;
        }
        .w2d-phone-link:hover { color: rgba(0,0,0,0.75); }

        .w2d-signin-btn {
          transition: background 0.2s, opacity 0.2s;
        }
        .w2d-signin-btn:hover { opacity: 0.82; }
      `}</style>

      <div style={{ fontFamily: SANS }}>
        <TopBar />

        <nav
          role="navigation"
          aria-label="Main navigation"
          style={{
            position:   "sticky",
            top:        0,
            zIndex:     50,
            background: "#fff",
            transition: "box-shadow 0.35s",
            boxShadow:  scrolled
              ? "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)"
              : "0 1px 0 rgba(0,0,0,0.04)",
          }}
        >

          {/* MOBILE */}
          <div style={{ display: "flex" }} className="lg:hidden">
            <div style={{
              width:          "100%",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "0 16px",
              height:         56,
            }}>

              <div style={{ width: 80 }}>
                <HamburgerButton onClick={() => setMobileOpen(true)} />
              </div>

              <a
                href="/"
                onClick={(e) => { e.preventDefault(); navigate("/") }}
                aria-label="Wash2Door Home"
                style={{ textDecoration: "none", flexShrink: 0 }}
              >
                <span style={{
                  fontFamily:    SERIF,
                  fontWeight:    300,
                  fontStyle:     "italic",
                  fontSize:      17,
                  letterSpacing: "0.22em",
                  color:         "rgba(0,0,0,0.85)",
                }}>
                  Wash2Door
                </span>
              </a>

              <div style={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
                {loading ? (
                  <div style={{ width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <LoadingSpinner />
                  </div>
                ) : user ? (
                  <UserAvatar name={user.firstName} size={32} onClick={() => setMobileOpen(true)} />
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => openModal("login")}
                    className="w2d-signin-btn"
                    style={{
                      height:        32,
                      padding:       "0 14px",
                      background:    "#1a1a1a",
                      color:         "rgba(255,255,255,0.92)",
                      border:        "none",
                      borderRadius:  999,
                      fontFamily:    SANS,
                      fontSize:      9,
                      fontWeight:    600,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      cursor:        "pointer",
                      whiteSpace:    "nowrap",
                    }}
                  >
                    Sign In
                  </motion.button>
                )}
              </div>

            </div>
          </div>

          {/* DESKTOP */}
          <div style={{ display: "none" }} className="lg:block">
            <div style={{ maxWidth: 1400, margin: "0 auto" }}>
              <div style={{
                display:        "flex",
                alignItems:     "center",
                height:         68,
                padding:        "0 40px",
              }}>

                <a
                  href="/"
                  onClick={(e) => { e.preventDefault(); navigate("/") }}
                  aria-label="Wash2Door Home"
                  style={{ textDecoration: "none", flexShrink: 0 }}
                >
                  <motion.span
                    whileHover={{ letterSpacing: "0.38em" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily:    SERIF,
                      fontWeight:    300,
                      fontStyle:     "italic",
                      fontSize:      "clamp(18px, 1.6vw, 22px)",
                      letterSpacing: "0.28em",
                      color:         "rgba(0,0,0,0.85)",
                      display:       "inline-block",
                    }}
                  >
                    Wash2Door
                  </motion.span>
                </a>

                <div style={{
                  flex:           1,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            2,
                }}>
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.href}
                      link={link}
                      currentPath={currentPath}
                      onProtectedClick={handleProtectedClick}
                    />
                  ))}
                </div>

                <div style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        20,
                  flexShrink: 0,
                }}>

                  <a
                    href="tel:6900706456"
                    className="w2d-phone-link"
                    aria-label="Call us"
                  >
                    <Phone size={13} strokeWidth={1.4} />
                    <span style={{
                      fontFamily:    SANS,
                      fontSize:      10,
                      fontWeight:    500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}>
                      Call
                    </span>
                  </a>

                  <div style={{
                    width:      "0.5px",
                    height:     16,
                    background: "rgba(0,0,0,0.08)",
                  }} />

                  {loading ? (
                    <div style={{ width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <LoadingSpinner />
                    </div>
                  ) : user ? (
                    <UserDropdown
                      user={user}
                      isOpen={dropdownOpen}
                      onToggle={() => setDropdownOpen((p) => !p)}
                      onClose={() => setDropdownOpen(false)}
                      onLogout={handleDropdownLogout}
                      dropdownRef={dropdownRef}
                    />
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => openModal("login")}
                      className="w2d-signin-btn"
                      style={{
                        height:        36,
                        padding:       "0 20px",
                        background:    "#1a1a1a",
                        color:         "rgba(255,255,255,0.92)",
                        border:        "none",
                        borderRadius:  999,
                        fontFamily:    SANS,
                        fontSize:      10,
                        fontWeight:    600,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        cursor:        "pointer",
                        whiteSpace:    "nowrap",
                      }}
                    >
                      Sign In
                    </motion.button>
                  )}
                </div>

              </div>
            </div>
          </div>

        </nav>

        <MobileDrawer
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          currentPath={currentPath}
        />
        <AuthModal />
      </div>
    </>
  )
}
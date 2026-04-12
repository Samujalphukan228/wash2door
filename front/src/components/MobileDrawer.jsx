"use client"

import { useEffect, useCallback } from "react"
import {
  LogOut,
  Calendar,
  ArrowUpRight,
  User,
  Phone,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home",        href: "/",            protected: false },
  { label: "About",       href: "/about",        protected: false },
  { label: "Services",    href: "/services",     protected: false },
  { label: "My Bookings", href: "/my-bookings",  protected: true  },
  { label: "Contact",     href: "/contact",      protected: false },
]

const CONTACT = {
  phone:   "6900706456",
  location:"Duliajan, Assam",
  hours:   "9 AM – 5 PM",
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MobileDrawer({ isOpen, onClose, currentPath = "/" }) {
  const { user, openModal, logout } = useAuth()
  const navigate = useNavigate()

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const h = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [isOpen, onClose])

  const go = useCallback(
    (href) => { onClose(); setTimeout(() => navigate(href), 120) },
    [navigate, onClose]
  )

  const handleLink = useCallback(
    (link) => {
      if (link.protected && !user) {
        onClose()
        setTimeout(() => openModal("login"), 120)
        return
      }
      go(link.href)
    },
    [user, openModal, onClose, go]
  )

  const handleLogout = useCallback(() => {
    onClose(); setTimeout(logout, 140)
  }, [logout, onClose])

  const handleSignIn = useCallback(() => {
    onClose(); setTimeout(() => openModal("login"), 140)
  }, [openModal, onClose])

  const initial = user?.firstName?.charAt(0)?.toUpperCase() ?? "U"
  const name    = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;1,300&display=swap');

        .w2d-nav-link {
          color: #c7c7cc;
          transition: color 0.25s;
          text-decoration: none;
          display: block;
          position: relative;
          padding: 3px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }
        .w2d-nav-link:hover { color: #1d1d1f; }
        .w2d-nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 0;
          height: 0.5px;
          background: #1d1d1f;
          width: 0;
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .w2d-nav-link:hover::after { width: 100%; }

        .w2d-nav-arrow {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.25s;
          font-style: normal;
          font-size: 20px;
          display: inline-block;
        }
        .w2d-nav-link:hover .w2d-nav-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .w2d-close-btn { transition: background 0.2s; }
        .w2d-close-btn:hover { background: rgba(0,0,0,0.1) !important; }

        .w2d-ghost-btn {
          transition: background 0.22s, color 0.22s, border-color 0.22s;
        }
        .w2d-ghost-btn:hover {
          background: #1d1d1f !important;
          color: #fff !important;
          border-color: #1d1d1f !important;
        }

        .w2d-cta-btn { transition: opacity 0.22s; }
        .w2d-cta-btn:hover { opacity: 0.82; }

        .w2d-logout-btn { transition: background 0.2s, color 0.2s; }
        .w2d-logout-btn:hover {
          background: rgba(255,255,255,0.18) !important;
          color: #fff !important;
        }

        .w2d-pill-btn { transition: background 0.2s, color 0.2s; }
        .w2d-pill-btn:hover {
          background: rgba(255,255,255,0.9) !important;
        }

        .w2d-menu-img {
          transition: transform 0.7s ease, opacity 0.4s;
          opacity: 0.8;
        }
        .w2d-sheet-open .w2d-menu-img { transform: scale(1.04); }

        .w2d-call-chip { transition: background 0.22s, color 0.22s; }
        .w2d-call-chip:hover {
          background: #1d1d1f !important;
          color: #fff !important;
        }

        @keyframes w2d-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.35); }
        }
        .w2d-pulse { animation: w2d-pulse 2.2s ease-in-out infinite; }
      `}</style>

      {/* ── Overlay ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        9999,
          pointerEvents: isOpen ? "auto" : "none",
          opacity:       isOpen ? 1 : 0,
          transition:    "opacity 0.38s cubic-bezier(0.4,0,0.2,1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position:             "absolute",
            inset:                0,
            background:           "rgba(0,0,0,0.22)",
            backdropFilter:       "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
          }}
        />

        {/* ── Sheet ────────────────────────────────────────────────────────── */}
        <div
          className={isOpen ? "w2d-sheet-open" : ""}
          style={{
            position:            "absolute",
            inset:               8,
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow:            "hidden",
            borderRadius:        16,
            background:          "#ffffff",
            boxShadow:           "0 32px 80px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.06)",
            transform:           isOpen
              ? "scale(1) translateY(0)"
              : "scale(0.97) translateY(10px)",
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s",
          }}
        >

          {/* ── LEFT: Nav side ─────────────────────────────────────────────── */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            borderRight:   "0.5px solid rgba(0,0,0,0.06)",
            fontFamily:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
            minHeight:     0,
          }}>

            {/* Top bar */}
            <div style={{
              padding:        "20px 24px 16px",
              borderBottom:   "0.5px solid rgba(0,0,0,0.06)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              flexShrink:     0,
            }}>
              <span style={{
                fontSize:      10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color:         "#aeaeb2",
                fontWeight:    400,
              }}>
                Menu
              </span>

              <button
                onClick={onClose}
                className="w2d-close-btn"
                aria-label="Close menu"
                style={{
                  width:          28,
                  height:         28,
                  borderRadius:   "50%",
                  background:     "rgba(0,0,0,0.05)",
                  border:         "none",
                  cursor:         "pointer",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  color:          "#6e6e73",
                  flexShrink:     0,
                }}
              >
                <svg
                  width="11" height="11" viewBox="0 0 11 11"
                  fill="none" stroke="currentColor"
                  strokeWidth="1.2" strokeLinecap="round"
                >
                  <path d="M1 1l9 9M10 1L1 10" />
                </svg>
              </button>
            </div>

            {/* ── User card ──────────────────────────────────────────────── */}
            {user && (
              <div style={{
                margin:       "14px 16px 0",
                borderRadius: 12,
                background:   "#111",
                padding:      "12px 14px",
                position:     "relative",
                overflow:     "hidden",
                flexShrink:   0,
              }}>
                <div style={{
                  position:      "absolute",
                  inset:         0,
                  background:    "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)",
                  pointerEvents: "none",
                  borderRadius:  12,
                }} />

                {/* Avatar + info */}
                <div style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         10,
                  marginBottom:10,
                }}>
                  <div style={{
                    width:          36,
                    height:         36,
                    borderRadius:   "50%",
                    background:     "rgba(255,255,255,0.12)",
                    border:         "1px solid rgba(255,255,255,0.15)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    flexShrink:     0,
                    fontFamily:     "'Playfair Display', Georgia, serif",
                    fontSize:       14,
                    color:          "#fff",
                  }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize:     12,
                      fontWeight:   500,
                      color:        "#fff",
                      margin:       0,
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}>
                      {name}
                    </p>
                    <p style={{
                      fontSize:     9,
                      color:        "rgba(255,255,255,0.4)",
                      margin:       "2px 0 0",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => go("/profile")}
                    className="w2d-pill-btn"
                    style={{
                      flex:           1,
                      height:         32,
                      borderRadius:   8,
                      border:         "none",
                      background:     "#fff",
                      color:          "#000",
                      cursor:         "pointer",
                      fontSize:       9,
                      fontWeight:     600,
                      letterSpacing:  "0.12em",
                      textTransform:  "uppercase",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      gap:            5,
                    }}
                  >
                    <User size={10} />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w2d-logout-btn"
                    aria-label="Sign out"
                    style={{
                      width:          36,
                      height:         32,
                      borderRadius:   8,
                      border:         "none",
                      background:     "rgba(255,255,255,0.1)",
                      color:          "rgba(255,255,255,0.65)",
                      cursor:         "pointer",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                    }}
                  >
                    <LogOut size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Nav links ──────────────────────────────────────────────── */}
            <nav
              aria-label="Main navigation"
              style={{
                flex:          1,
                display:       "flex",
                flexDirection: "column",
                justifyContent:"center",
                padding:       "16px 24px",
                gap:           2,
                minHeight:     0,
              }}
            >
              {NAV_LINKS.map((link) => {
                const locked = link.protected && !user
                const active = currentPath === link.href
                return (
                  <button
                    key={link.href}
                    onClick={() => handleLink(link)}
                    className="w2d-nav-link"
                    style={{
                      fontFamily:    "'Playfair Display', Georgia, serif",
                      fontWeight:    300,
                      fontSize:      "clamp(24px, 3.5vw, 34px)",
                      lineHeight:    1.2,
                      letterSpacing: "-0.01em",
                      fontStyle:     active ? "italic" : "normal",
                      color:         active ? "#1d1d1f" : undefined,
                    }}
                  >
                    {link.label}
                    {" "}
                    {locked ? (
                      <span style={{
                        fontSize:      8,
                        verticalAlign: "middle",
                        padding:       "3px 7px",
                        borderRadius:  999,
                        background:    "rgba(0,0,0,0.06)",
                        color:         "rgba(0,0,0,0.35)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily:    "'Helvetica Neue', sans-serif",
                        fontWeight:    500,
                        fontStyle:     "normal",
                      }}>
                        Login
                      </span>
                    ) : (
                      <span className="w2d-nav-arrow">↗</span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div style={{
              padding:       "14px 20px",
              borderTop:     "0.5px solid rgba(0,0,0,0.06)",
              display:       "flex",
              flexDirection: "column",
              gap:           8,
              flexShrink:    0,
            }}>
              {/* Quick contact chips */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="w2d-call-chip"
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            5,
                    padding:        "6px 10px",
                    borderRadius:   8,
                    background:     "rgba(0,0,0,0.04)",
                    color:          "#1d1d1f",
                    textDecoration: "none",
                    fontSize:       9,
                    fontWeight:     600,
                    letterSpacing:  "0.1em",
                    textTransform:  "uppercase",
                  }}
                >
                  <Phone size={10} strokeWidth={1.6} />
                  Call
                </a>

                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          4,
                  padding:      "6px 10px",
                  borderRadius: 8,
                  background:   "rgba(0,0,0,0.04)",
                }}>
                  <MapPin size={10} strokeWidth={1.5} color="rgba(0,0,0,0.4)" />
                  <span style={{
                    fontSize:  9,
                    color:     "rgba(0,0,0,0.5)",
                    fontWeight:500,
                  }}>
                    {CONTACT.location}
                  </span>
                </div>

                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          5,
                  padding:      "6px 10px",
                  borderRadius: 8,
                  background:   "rgba(16,185,129,0.07)",
                }}>
                  <span
                    className="w2d-pulse"
                    style={{
                      display:      "block",
                      width:        5,
                      height:       5,
                      borderRadius: "50%",
                      background:   "#10b981",
                      flexShrink:   0,
                    }}
                  />
                  <span style={{
                    fontSize:      9,
                    fontWeight:    600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color:         "#059669",
                    whiteSpace:    "nowrap",
                  }}>
                    {CONTACT.hours}
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              {user ? (
                <button
                  onClick={() => go("/my-bookings")}
                  className="w2d-cta-btn"
                  style={{
                    width:          "100%",
                    height:         42,
                    background:     "#1d1d1f",
                    color:          "#fff",
                    border:         "none",
                    borderRadius:   10,
                    cursor:         "pointer",
                    fontSize:       9,
                    fontWeight:     600,
                    letterSpacing:  "0.2em",
                    textTransform:  "uppercase",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            7,
                  }}
                >
                  <Calendar size={12} />
                  View My Bookings
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => go("/services")}
                    className="w2d-cta-btn"
                    style={{
                      flex:           1,
                      height:         42,
                      background:     "#1d1d1f",
                      color:          "#fff",
                      border:         "none",
                      borderRadius:   10,
                      cursor:         "pointer",
                      fontSize:       9,
                      fontWeight:     600,
                      letterSpacing:  "0.2em",
                      textTransform:  "uppercase",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      gap:            6,
                    }}
                  >
                    Book a Wash
                    <ArrowUpRight size={11} />
                  </button>

                  <button
                    onClick={handleSignIn}
                    className="w2d-ghost-btn"
                    style={{
                      padding:       "0 14px",
                      height:        42,
                      borderRadius:  10,
                      border:        "0.5px solid rgba(0,0,0,0.14)",
                      background:    "transparent",
                      color:         "#1d1d1f",
                      cursor:        "pointer",
                      fontSize:      9,
                      fontWeight:    600,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      whiteSpace:    "nowrap",
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Image side ──────────────────────────────────────────── */}
          <div style={{
            position:   "relative",
            background: "#1a1a1a",
            overflow:   "hidden",
          }}>
            <img
              src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&auto=format&fit=crop&q=80"
              alt="Professional car wash service"
              className="w2d-menu-img"
              style={{
                width:     "100%",
                height:    "100%",
                objectFit: "cover",
                display:   "block",
              }}
              loading="lazy"
            />

            {/* Gradient overlay */}
            <div style={{
              position:   "absolute",
              inset:      0,
              background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.7) 100%)",
            }} />

            {/* Top label */}
            <div style={{
              position: "absolute",
              top:      0,
              left:     0,
              right:    0,
              padding:  "18px 20px",
            }}>
              <span style={{
                fontSize:      9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.45)",
                fontWeight:    400,
                fontFamily:    "'Helvetica Neue', sans-serif",
              }}>
                Wash2Door · Duliajan
              </span>
            </div>

            {/* Bottom copy */}
            <div style={{
              position: "absolute",
              bottom:   0,
              left:     0,
              right:    0,
              padding:  "24px 22px 22px",
            }}>
              <p style={{
                fontSize:      9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.38)",
                fontWeight:    400,
                fontFamily:    "'Helvetica Neue', sans-serif",
                margin:        "0 0 10px",
              }}>
                Doorstep Car Wash
              </p>
              <p style={{
                fontFamily:    "'Playfair Display', Georgia, serif",
                fontWeight:    300,
                fontStyle:     "italic",
                fontSize:      "clamp(15px, 2vw, 20px)",
                lineHeight:    1.35,
                color:         "rgba(255,255,255,0.88)",
                letterSpacing: "0.01em",
                margin:        0,
              }}>
                Spotless shine,<br />delivered to your door.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
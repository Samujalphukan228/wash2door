"use client"

import { useEffect, useCallback } from "react"
import { X, LogOut, Calendar, User, Phone, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"

const NAV_LINKS = [
  { label: "Home",        href: "/"            },
  { label: "About",       href: "/about"       },
  { label: "Services",    href: "/services"    },
  { label: "My Bookings", href: "/my-bookings", protected: true },
  { label: "Contact",     href: "/contact"     },
]

export default function MobileDrawer({ isOpen, onClose, currentPath = "/" }) {
  const { user, openModal, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const h = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [isOpen, onClose])

  const go = useCallback((href) => {
    onClose()
    setTimeout(() => navigate(href), 200)
  }, [navigate, onClose])

  const handleLink = useCallback((link) => {
    if (link.protected && !user) {
      onClose()
      setTimeout(() => openModal("login"), 200)
      return
    }
    go(link.href)
  }, [user, openModal, onClose, go])

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Drawer ── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Handle */}
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e0e0e0" }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #f2f2f2",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 20,
            color: "#111",
          }}>
            Wash2Door
          </span>

          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#f5f5f7",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              flexShrink: 0,
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}>

          {/* User card */}
          {user && (
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{
                background: "#111",
                borderRadius: 14,
                padding: "16px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Shimmer */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
                  pointerEvents: "none",
                }} />

                {/* Info row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18, color: "#fff", flexShrink: 0,
                  }}>
                    {user.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 15, fontWeight: 600, color: "#fff",
                      margin: 0, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
                    </p>
                    <p style={{
                      fontSize: 12, color: "rgba(255,255,255,0.4)",
                      margin: "3px 0 0", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => go("/profile")}
                    style={{
                      flex: 1, height: 40, borderRadius: 10,
                      border: "none", background: "#fff", color: "#111",
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                      textTransform: "uppercase", cursor: "pointer",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 6,
                    }}
                  >
                    <User size={12} /> Profile
                  </button>
                  <button
                    onClick={() => { onClose(); setTimeout(logout, 200) }}
                    aria-label="Sign out"
                    style={{
                      width: 48, height: 40, borderRadius: 10,
                      border: "none", background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav style={{ padding: "8px 20px" }} aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const locked = link.protected && !user
              const active = currentPath === link.href

              return (
                <button
                  key={link.href}
                  onClick={() => handleLink(link)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #f2f2f2",
                    cursor: "pointer",
                    textAlign: "left",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 300,
                    fontSize: 26,
                    color: active ? "#111" : locked ? "#ccc" : "#333",
                    fontStyle: active ? "italic" : "normal",
                    lineHeight: 1,
                  }}>
                    {link.label}
                  </span>

                  {locked ? (
                    <span style={{
                      fontSize: 9,
                      padding: "4px 10px",
                      borderRadius: 99,
                      background: "#f2f2f2",
                      color: "#aaa",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      Login
                    </span>
                  ) : (
                    <ChevronRight size={18} strokeWidth={1.5} color="#ccc" style={{ flexShrink: 0 }} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Contact info */}
          <div style={{ padding: "16px 20px 20px" }}>
            <a
              href="tel:6900706456"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                background: "#f7f7f7",
                borderRadius: 12,
                textDecoration: "none",
                marginBottom: 10,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#111",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Phone size={16} color="#fff" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111" }}>
                  +91 690 070 6456
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#999" }}>
                  9 AM – 5 PM · Duliajan, Assam
                </p>
              </div>
            </a>
          </div>

        </div>

        {/* Footer CTA */}
        <div style={{
          flexShrink: 0,
          padding: "14px 20px",
          paddingBottom: "max(18px, env(safe-area-inset-bottom, 18px))",
          borderTop: "1px solid #f2f2f2",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#fff",
        }}>
          {user ? (
            <button
              onClick={() => go("/my-bookings")}
              style={{
                width: "100%", height: 56,
                background: "#111", color: "#fff",
                border: "none", borderRadius: 14,
                fontSize: 12, fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Calendar size={16} /> View My Bookings
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => go("/services")}
                style={{
                  flex: 1, height: 56,
                  background: "#111", color: "#fff",
                  border: "none", borderRadius: 14,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Book a Wash
              </button>
              <button
                onClick={() => { onClose(); setTimeout(() => openModal("login"), 200) }}
                style={{
                  height: 56, padding: "0 22px",
                  background: "#fff", color: "#111",
                  border: "1.5px solid #e5e5e5",
                  borderRadius: 14,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
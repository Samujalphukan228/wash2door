"use client"

import { useEffect, useCallback } from "react"
import { X, LogOut, Calendar, ArrowUpRight, User, Phone, MapPin, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"

const NAV_LINKS = [
  { label: "Home",        href: "/",            protected: false },
  { label: "About",       href: "/about",       protected: false },
  { label: "Services",    href: "/services",    protected: false },
  { label: "My Bookings", href: "/my-bookings", protected: true  },
  { label: "Contact",     href: "/contact",     protected: false },
]

const SERIF = "'Playfair Display', Georgia, serif"
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif"

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
    onClose(); setTimeout(() => navigate(href), 180)
  }, [navigate, onClose])

  const handleLink = useCallback((link) => {
    if (link.protected && !user) {
      onClose(); setTimeout(() => openModal("login"), 180); return
    }
    go(link.href)
  }, [user, openModal, onClose, go])

  const handleLogout = useCallback(() => {
    onClose(); setTimeout(logout, 180)
  }, [logout, onClose])

  const handleSignIn = useCallback(() => {
    onClose(); setTimeout(() => openModal("login"), 180)
  }, [openModal, onClose])

  const initial = user?.firstName?.charAt(0)?.toUpperCase() ?? "?"
  const name    = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;1,300&display=swap');

        /* ─── shared backdrop ─── */
        .dr-back {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .dr-back.on { opacity: 1; pointer-events: auto; }

        /* ════════════════════════════════
           MOBILE  bottom sheet  (< 640px)
        ════════════════════════════════ */
        .dr-mob {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 9999;
          background: #fff;
          border-radius: 22px 22px 0 0;
          box-shadow: 0 -6px 40px rgba(0,0,0,0.13);
          display: flex; flex-direction: column;
          max-height: 88dvh;
          overflow: hidden;
          transform: translateY(100%);
          transition: transform 0.34s cubic-bezier(0.32,0.72,0,1);
          font-family: ${SANS};
        }
        .dr-mob.on { transform: translateY(0); }

        /* handle */
        .dr-handle {
          width: 38px; height: 4px; border-radius: 99px;
          background: #ddd; margin: 12px auto 0; flex-shrink: 0;
        }

        /* header */
        .dr-mob-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
        }
        .dr-mob-brand {
          font-family: ${SERIF}; font-style: italic;
          font-weight: 300; font-size: 21px; color: #111;
        }
        .dr-mob-x {
          width: 36px; height: 36px; border-radius: 50%;
          background: #f5f5f5; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #555; flex-shrink: 0;
          transition: background 0.15s;
        }
        .dr-mob-x:hover { background: #eee; }

        /* scroll body */
        .dr-mob-body {
          flex: 1; overflow-y: auto; overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        /* user card */
        .dr-mob-user {
          margin: 14px 16px 0; padding: 15px; border-radius: 14px;
          background: #111; position: relative; overflow: hidden;
        }
        .dr-mob-user-shine {
          position: absolute; inset: 0; border-radius: 14px;
          background: linear-gradient(135deg,rgba(255,255,255,0.07),transparent 60%);
          pointer-events: none;
        }
        .dr-mob-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.11);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-family: ${SERIF}; font-size: 18px; color: #fff; flex-shrink: 0;
        }
        .dr-mob-uname {
          font-size: 15px; font-weight: 600; color: #fff; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dr-mob-uemail {
          font-size: 11px; color: rgba(255,255,255,0.42); margin: 3px 0 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dr-mob-prof {
          flex: 1; height: 40px; border-radius: 10px; border: none;
          background: #fff; color: #111;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .dr-mob-prof:active { opacity: 0.75; }
        .dr-mob-out {
          width: 46px; height: 40px; border-radius: 10px; border: none;
          background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .dr-mob-out:active { background: rgba(255,255,255,0.2); }

        /* nav rows */
        .dr-mob-nav { padding: 6px 20px 0; }
        .dr-mob-row {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between;
          padding: 17px 0; background: none; border: none;
          border-bottom: 1px solid #f2f2f2;
          cursor: pointer; text-align: left;
          -webkit-tap-highlight-color: transparent;
        }
        .dr-mob-row:last-child { border-bottom: none; }
        .dr-mob-row:active { opacity: 0.55; }
        .dr-mob-lbl {
          font-family: ${SERIF}; font-weight: 300;
          font-size: 27px; color: #222; line-height: 1;
          letter-spacing: -0.01em;
        }
        .dr-mob-lbl.active { font-style: italic; color: #111; }
        .dr-mob-lbl.dim    { color: #ccc; }
        .dr-mob-badge {
          font-size: 9px; padding: 4px 9px; border-radius: 99px;
          background: #f2f2f2; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.1em;
          font-family: ${SANS}; font-weight: 600; flex-shrink: 0;
        }

        /* contact */
        .dr-mob-contact { padding: 16px 20px 4px; }
        .dr-mob-tel {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 15px; border-radius: 12px;
          background: #f7f7f7; text-decoration: none;
        }
        .dr-mob-tel:active { background: #efefef; }
        .dr-tel-icon {
          width: 36px; height: 36px; border-radius: 50%;
          background: #111; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .dr-mob-loc {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 15px; border-radius: 12px;
          background: #f7f7f7; margin-top: 8px;
        }
        .dr-mob-hours {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 15px; border-radius: 12px;
          background: rgba(16,185,129,0.08); margin-top: 8px;
        }
        @keyframes dr-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.5); }
        }
        .dr-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981; flex-shrink: 0;
          animation: dr-pulse 2s ease-in-out infinite; display: block;
        }

        /* footer */
        .dr-mob-foot {
          flex-shrink: 0; padding: 14px 16px;
          padding-bottom: max(18px, env(safe-area-inset-bottom, 18px));
          border-top: 1px solid #f0f0f0; background: #fff;
          display: flex; flex-direction: column; gap: 10px;
        }
        .dr-mob-cta {
          width: 100%; height: 56px; border: none; border-radius: 14px;
          background: #111; color: #fff; font-family: ${SANS};
          font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          -webkit-tap-highlight-color: transparent;
        }
        .dr-mob-cta:active { opacity: 0.75; }
        .dr-mob-ghost {
          height: 56px; padding: 0 22px; border-radius: 14px;
          border: 1.5px solid #e5e5e5; background: #fff; color: #111;
          font-family: ${SANS}; font-size: 12px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .dr-mob-ghost:active { background: #f7f7f7; }

        /* ════════════════════════════════
           DESKTOP  split panel  (≥ 640px)
        ════════════════════════════════ */
        .dr-desk {
          position: fixed; inset: 10px; z-index: 9999;
          display: grid; grid-template-columns: 1fr 1fr;
          border-radius: 16px; overflow: hidden; background: #fff;
          box-shadow: 0 32px 80px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.06);
          transform: scale(0.97) translateY(10px); opacity: 0;
          pointer-events: none;
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
          font-family: ${SANS};
        }
        .dr-desk.on { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }

        /* desktop nav link */
        .dr-desk-link {
          color: #c7c7cc; font-family: ${SERIF}; font-weight: 300;
          font-size: clamp(24px,3.5vw,34px);
          line-height: 1.2; letter-spacing: -0.01em;
          background: none; border: none; cursor: pointer;
          text-align: left; width: 100%; padding: 3px 0;
          position: relative; display: block; transition: color 0.25s;
        }
        .dr-desk-link:hover { color: #1d1d1f; }
        .dr-desk-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          height: 0.5px; background: #1d1d1f; width: 0;
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .dr-desk-link:hover::after { width: 100%; }
        .dr-desk-arr {
          opacity: 0; display: inline-block;
          transform: translateX(-5px); font-style: normal;
          transition: opacity 0.2s, transform 0.25s;
        }
        .dr-desk-link:hover .dr-desk-arr { opacity: 1; transform: translateX(0); }

        /* desktop close */
        .dr-desk-x {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(0,0,0,0.05); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #6e6e73; transition: background 0.2s;
        }
        .dr-desk-x:hover { background: rgba(0,0,0,0.1); }

        /* desktop chip */
        .dr-chip-call { transition: background 0.2s, color 0.2s; }
        .dr-chip-call:hover { background: #1d1d1f !important; color: #fff !important; }

        /* desktop cta */
        .dr-desk-cta {
          transition: opacity 0.2s;
        }
        .dr-desk-cta:hover { opacity: 0.82; }
        .dr-desk-ghost { transition: background 0.2s, color 0.2s, border-color 0.2s; }
        .dr-desk-ghost:hover {
          background: #1d1d1f !important; color: #fff !important;
          border-color: #1d1d1f !important;
        }

        /* image zoom */
        .dr-img { transition: transform 0.7s ease; opacity: 0.8; }
        .dr-desk.on .dr-img { transform: scale(1.04); }

        /* pulse */
        .dr-pulse-dot {
          display: block; width: 5px; height: 5px; border-radius: 50%;
          background: #10b981; flex-shrink: 0;
          animation: dr-pulse 2.2s ease-in-out infinite;
        }

        /* show/hide per breakpoint */
        @media (min-width: 640px) {
          .dr-mob  { display: none !important; }
          .dr-back { display: none; }          /* desktop uses its own inline backdrop */
        }
        @media (max-width: 639px) {
          .dr-desk { display: none !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════ */}
      {/* MOBILE  backdrop + bottom sheet        */}
      {/* ═══════════════════════════════════════ */}
      <div className={`dr-back${isOpen ? " on" : ""}`} onClick={onClose} />

      <div
        className={`dr-mob${isOpen ? " on" : ""}`}
        role="dialog" aria-modal="true" aria-label="Navigation"
      >
        <div className="dr-handle" />

        {/* header */}
        <div className="dr-mob-head">
          <span className="dr-mob-brand">Wash2Door</span>
          <button className="dr-mob-x" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* body */}
        <div className="dr-mob-body">

          {/* user card */}
          {user && (
            <div className="dr-mob-user">
              <div className="dr-mob-user-shine" />
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, position:"relative" }}>
                <div className="dr-mob-avatar">{initial}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="dr-mob-uname">{name}</p>
                  <p className="dr-mob-uemail">{user?.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, position:"relative" }}>
                <button className="dr-mob-prof" onClick={() => go("/profile")}>
                  <User size={12} /> Profile
                </button>
                <button className="dr-mob-out" onClick={handleLogout} aria-label="Sign out">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          )}

          {/* nav */}
          <nav className="dr-mob-nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const locked = link.protected && !user
              const active = currentPath === link.href
              return (
                <button
                  key={link.href}
                  className="dr-mob-row"
                  onClick={() => handleLink(link)}
                >
                  <span className={`dr-mob-lbl${active ? " active" : ""}${locked ? " dim" : ""}`}>
                    {link.label}
                  </span>
                  {locked
                    ? <span className="dr-mob-badge">Login</span>
                    : <ChevronRight size={18} strokeWidth={1.5} color="#ccc" style={{ flexShrink:0 }} />
                  }
                </button>
              )
            })}
          </nav>

          {/* contact */}
          <div className="dr-mob-contact">
            <a href="tel:6900706456" className="dr-mob-tel">
              <div className="dr-tel-icon">
                <Phone size={16} color="#fff" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#111" }}>+91 690 070 6456</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:"#999" }}>Tap to call us</p>
              </div>
            </a>

            <div className="dr-mob-loc">
              <MapPin size={14} strokeWidth={1.5} color="#999" style={{ flexShrink:0 }} />
              <span style={{ fontSize:13, color:"#555", fontWeight:500 }}>Duliajan, Assam</span>
            </div>

            <div className="dr-mob-hours">
              <span className="dr-dot" />
              <span style={{ fontSize:13, fontWeight:600, color:"#059669" }}>Open · 9 AM – 5 PM</span>
            </div>
          </div>

        </div>{/* end body */}

        {/* footer */}
        <div className="dr-mob-foot">
          {user ? (
            <button className="dr-mob-cta" onClick={() => go("/my-bookings")}>
              <Calendar size={16} /> View My Bookings
            </button>
          ) : (
            <div style={{ display:"flex", gap:10 }}>
              <button className="dr-mob-cta" style={{ flex:1 }} onClick={() => go("/services")}>
                Book a Wash
              </button>
              <button className="dr-mob-ghost" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ═══════════════════════════════════════ */}
      {/* DESKTOP  backdrop + split panel        */}
      {/* ═══════════════════════════════════════ */}

      {/* backdrop (inline — shown only on sm+) */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0, zIndex:9998,
          background:"rgba(0,0,0,0.4)",
          backdropFilter:"blur(3px)", WebkitBackdropFilter:"blur(3px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:"opacity 0.28s ease",
          display:"none",  // shown via media query override below
        }}
        className="dr-desk-back"
      />

      <style>{`
        @media (min-width: 640px) { .dr-desk-back { display: block !important; } }
      `}</style>

      <div
        className={`dr-desk${isOpen ? " on" : ""}`}
        role="dialog" aria-modal="true" aria-label="Navigation"
      >
        {/* ── LEFT ── */}
        <div style={{
          display:"flex", flexDirection:"column",
          borderRight:"0.5px solid rgba(0,0,0,0.06)", minHeight:0,
        }}>

          {/* top bar */}
          <div style={{
            padding:"20px 24px 16px",
            borderBottom:"0.5px solid rgba(0,0,0,0.06)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexShrink:0,
          }}>
            <span style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#aeaeb2", fontWeight:400 }}>
              Menu
            </span>
            <button className="dr-desk-x" onClick={onClose} aria-label="Close">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M1 1l9 9M10 1L1 10"/>
              </svg>
            </button>
          </div>

          {/* user card */}
          {user && (
            <div style={{
              margin:"14px 16px 0", borderRadius:12,
              background:"#111", padding:"12px 14px",
              position:"relative", overflow:"hidden", flexShrink:0,
            }}>
              <div style={{
                position:"absolute", inset:0, borderRadius:12,
                background:"linear-gradient(135deg,rgba(255,255,255,0.07),transparent 60%)",
                pointerEvents:"none",
              }}/>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background:"rgba(255,255,255,0.12)",
                  border:"1px solid rgba(255,255,255,0.18)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, fontFamily:SERIF, fontSize:14, color:"#fff",
                }}>
                  {initial}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:500, color:"#fff", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</p>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button
                  onClick={() => go("/profile")}
                  style={{
                    flex:1, height:32, borderRadius:8, border:"none",
                    background:"#fff", color:"#111", cursor:"pointer",
                    fontSize:9, fontWeight:600, letterSpacing:"0.12em",
                    textTransform:"uppercase", display:"flex",
                    alignItems:"center", justifyContent:"center", gap:5,
                  }}
                >
                  <User size={10}/> Profile
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  style={{
                    width:36, height:32, borderRadius:8, border:"none",
                    background:"rgba(255,255,255,0.1)",
                    color:"rgba(255,255,255,0.65)", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}
                >
                  <LogOut size={11}/>
                </button>
              </div>
            </div>
          )}

          {/* nav links */}
          <nav style={{
            flex:1, display:"flex", flexDirection:"column",
            justifyContent:"center", padding:"16px 24px", gap:2, minHeight:0,
          }}>
            {NAV_LINKS.map((link) => {
              const locked = link.protected && !user
              const active = currentPath === link.href
              return (
                <button
                  key={link.href}
                  className="dr-desk-link"
                  onClick={() => handleLink(link)}
                  style={{
                    fontStyle: active ? "italic" : "normal",
                    color: active ? "#1d1d1f" : undefined,
                  }}
                >
                  {link.label}{" "}
                  {locked ? (
                    <span style={{
                      fontSize:8, verticalAlign:"middle",
                      padding:"3px 7px", borderRadius:99,
                      background:"rgba(0,0,0,0.06)", color:"rgba(0,0,0,0.35)",
                      textTransform:"uppercase", letterSpacing:"0.1em",
                      fontFamily:SANS, fontWeight:500, fontStyle:"normal",
                    }}>Login</span>
                  ) : (
                    <span className="dr-desk-arr">↗</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* footer */}
          <div style={{
            padding:"14px 20px",
            borderTop:"0.5px solid rgba(0,0,0,0.06)",
            display:"flex", flexDirection:"column", gap:8, flexShrink:0,
          }}>
            {/* chips */}
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              <a href="tel:6900706456" className="dr-chip-call" style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"6px 10px", borderRadius:8,
                background:"rgba(0,0,0,0.04)", color:"#1d1d1f",
                textDecoration:"none", fontSize:9, fontWeight:600,
                letterSpacing:"0.1em", textTransform:"uppercase",
              }}>
                <Phone size={10} strokeWidth={1.6}/> Call
              </a>
              <div style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", borderRadius:8, background:"rgba(0,0,0,0.04)" }}>
                <MapPin size={10} strokeWidth={1.5} color="rgba(0,0,0,0.4)"/>
                <span style={{ fontSize:9, color:"rgba(0,0,0,0.5)", fontWeight:500 }}>Duliajan, Assam</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:8, background:"rgba(16,185,129,0.07)" }}>
                <span className="dr-pulse-dot"/>
                <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#059669", whiteSpace:"nowrap" }}>9 AM – 5 PM</span>
              </div>
            </div>

            {/* cta */}
            {user ? (
              <button
                onClick={() => go("/my-bookings")}
                className="dr-desk-cta"
                style={{
                  width:"100%", height:42, background:"#1d1d1f", color:"#fff",
                  border:"none", borderRadius:10, cursor:"pointer",
                  fontSize:9, fontWeight:600, letterSpacing:"0.2em",
                  textTransform:"uppercase", display:"flex",
                  alignItems:"center", justifyContent:"center", gap:7,
                }}
              >
                <Calendar size={12}/> View My Bookings
              </button>
            ) : (
              <div style={{ display:"flex", gap:6 }}>
                <button
                  onClick={() => go("/services")}
                  className="dr-desk-cta"
                  style={{
                    flex:1, height:42, background:"#1d1d1f", color:"#fff",
                    border:"none", borderRadius:10, cursor:"pointer",
                    fontSize:9, fontWeight:600, letterSpacing:"0.2em",
                    textTransform:"uppercase", display:"flex",
                    alignItems:"center", justifyContent:"center", gap:6,
                  }}
                >
                  Book a Wash <ArrowUpRight size={11}/>
                </button>
                <button
                  onClick={handleSignIn}
                  className="dr-desk-ghost"
                  style={{
                    padding:"0 14px", height:42, borderRadius:10,
                    border:"0.5px solid rgba(0,0,0,0.14)", background:"transparent",
                    color:"#1d1d1f", cursor:"pointer", fontSize:9,
                    fontWeight:600, letterSpacing:"0.2em",
                    textTransform:"uppercase", whiteSpace:"nowrap",
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT image ── */}
        <div style={{ position:"relative", background:"#1a1a1a", overflow:"hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&auto=format&fit=crop&q=80"
            alt="Car wash"
            className="dr-img"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            loading="lazy"
          />
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.72) 100%)",
          }}/>
          <div style={{ position:"absolute", top:0, left:0, right:0, padding:"18px 20px" }}>
            <span style={{ fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", fontFamily:SANS }}>
              Wash2Door · Duliajan
            </span>
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"24px 22px" }}>
            <p style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontFamily:SANS, margin:"0 0 8px" }}>
              Doorstep Car Wash
            </p>
            <p style={{ fontFamily:SERIF, fontWeight:300, fontStyle:"italic", fontSize:"clamp(15px,2vw,20px)", lineHeight:1.35, color:"rgba(255,255,255,0.88)", margin:0 }}>
              Spotless shine,<br/>delivered to your door.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
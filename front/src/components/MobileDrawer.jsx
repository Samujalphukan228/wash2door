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
  Clock,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "@/hooks/useNavigate"

const NAV_LINKS = [
  { label: "Home", href: "/", desc: "Back to start" },
  { label: "About Us", href: "/about", desc: "Our story" },
  { label: "Services", href: "/services", desc: "What we offer" },
  { label: "My Bookings", href: "/my-bookings", desc: "Your appointments", protected: true },
  { label: "Contact", href: "/contact", desc: "Get in touch" },
]

const CONTACT = {
  phone: "6900706456",
  phoneDisplay: "+91 690 070 6456",
  location: "Duliajan, Assam",
  hours: "9 AM – 5 PM",
}

const FONT = {
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: 'Georgia, "Times New Roman", serif',
}

const EASE = [0.22, 1, 0.36, 1]

const variants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.25, delay: 0.1 } },
  },
  panel: {
    hidden: { y: "100%", opacity: 0.5 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: EASE } 
    },
    exit: { 
      y: "100%", 
      opacity: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } 
    },
  },
  stagger: {
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  },
  fade: {
    hidden: { opacity: 0, y: 10 },
    visible: (d = 0) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, delay: d, ease: EASE } 
    }),
  },
}

// Hooks
function useLockScroll(lock) {
  useEffect(() => {
    if (!lock) return
    const orig = { overflow: document.body.style.overflow, touchAction: document.body.style.touchAction }
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
    return () => {
      document.body.style.overflow = orig.overflow
      document.body.style.touchAction = orig.touchAction
    }
  }, [lock])
}

function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return
    const handler = (e) => e.key === "Escape" && onEscape()
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [active, onEscape])
}

function useFocusTrap(active, ref) {
  useEffect(() => {
    if (!active || !ref.current) return
    const container = ref.current
    const focusable = container.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const trap = (e) => {
      if (e.key !== "Tab") return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    container.addEventListener("keydown", trap)
    return () => container.removeEventListener("keydown", trap)
  }, [active, ref])
}

// Components
const Handle = () => (
  <div className="flex justify-center pt-3 pb-1">
    <div className="w-9 h-1 rounded-full bg-black/10" />
  </div>
)

const Header = ({ onHome, onClose }) => (
  <div className="flex items-center justify-between px-5 py-3">
    <button onClick={onHome} className="group">
      <span
        className="tracking-[0.2em] uppercase text-black group-hover:opacity-60 transition-opacity"
        style={{ fontFamily: FONT.serif, fontSize: "12px", fontWeight: 400 }}
      >
        Wash2Door
      </span>
    </button>
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClose}
      className="w-9 h-9 rounded-full bg-black/5 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300"
    >
      <X size={16} strokeWidth={1.5} />
    </motion.button>
  </div>
)
const UserSection = ({ user, onProfile, onLogout }) => {
  const initial = user?.firstName?.charAt(0)?.toUpperCase() || "U"
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim()

  return (
    <motion.div
      variants={variants.fade}
      custom={0.1}
      initial="hidden"
      animate="visible"
      className="mx-4 mb-3"
    >
      <div className="bg-black rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/10">
            <span style={{ fontFamily: FONT.serif, fontSize: "15px" }}>{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onProfile}
            className="flex-1 h-10 rounded-xl bg-white text-black text-[10px] font-medium tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <User size={12} />
            Profile
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="h-10 px-4 rounded-xl bg-white/10 text-white/80 text-[10px] font-medium tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <LogOut size={12} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const NavItem = ({ link, index, locked, onClick }) => (
  <motion.button
    variants={variants.item}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(link)}
    className="group w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-black/[0.03] active:bg-black/[0.06] transition-colors"
  >
    {/* Number */}
    <div className="w-10 h-10 rounded-xl bg-black/[0.04] group-hover:bg-black group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300">
      <span style={{ fontFamily: FONT.serif, fontSize: "13px" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>

    {/* Label */}
    <div className="flex-1 text-left min-w-0">
      <p className="text-[15px] text-black font-medium truncate" style={{ fontFamily: FONT.serif }}>
        {link.label}
      </p>
      <p className="text-[10px] text-black/40 truncate mt-0.5">{link.desc}</p>
    </div>

    {/* Badge or Arrow */}
    {locked ? (
      <span className="text-[8px] px-2 py-1 rounded-full bg-black/5 text-black/40 uppercase tracking-wider font-medium shrink-0">
        Login
      </span>
    ) : (
      <ChevronRight 
        size={16} 
        className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all duration-300 shrink-0" 
      />
    )}
  </motion.button>
)

const QuickActions = () => (
  <motion.div
    variants={variants.fade}
    custom={0.35}
    initial="hidden"
    animate="visible"
    className="mx-4 mb-4"
  >
    <div className="flex gap-2">
      <a
        href={`tel:${CONTACT.phone}`}
        className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-black/[0.03] hover:bg-black hover:text-white transition-all duration-300"
      >
        <Phone size={14} strokeWidth={1.5} />
        <span className="text-[10px] tracking-wider uppercase font-medium">Call</span>
      </a>
      <div className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-black/[0.03]">
        <MapPin size={14} strokeWidth={1.5} className="text-black/40" />
        <span className="text-[10px] text-black/60">{CONTACT.location}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 h-12 rounded-xl bg-emerald-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">{CONTACT.hours}</span>
      </div>
    </div>
  </motion.div>
)

const BottomCTA = ({ user, onNavigate, onSignIn }) => {
  if (user) {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate("/my-bookings")}
        className="w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black/90 transition-colors"
      >
        <Calendar size={16} />
        <span className="text-[11px] tracking-[0.2em] uppercase font-medium">View My Bookings</span>
      </motion.button>
    )
  }

  return (
    <div className="flex gap-2">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate("/services")}
        className="flex-1 h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black/90 transition-colors"
      >
        <span className="text-[11px] tracking-[0.2em] uppercase font-medium">Book Now</span>
        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
          <ArrowUpRight size={12} />
        </div>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSignIn}
        className="px-6 h-14 border border-black/10 rounded-2xl text-black text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
      >
        Sign In
      </motion.button>
    </div>
  )
}

// Main Component
export default function MobileDrawer({ isOpen, onClose }) {
  const { user, openModal, logout } = useAuth()
  const navigate = useNavigate()
  const panelRef = useRef(null)

  useLockScroll(isOpen)
  useEscapeKey(isOpen, onClose)
  useFocusTrap(isOpen, panelRef)

  const handleLogout = useCallback(() => {
    onClose()
    logout()
  }, [logout, onClose])

  const handleNavigate = useCallback((href) => {
    onClose()
    navigate(href)
  }, [navigate, onClose])

  const handleLinkClick = useCallback((link) => {
    if (link.protected && !user) {
      onClose()
      openModal("login")
      return
    }
    handleNavigate(link.href)
  }, [user, openModal, onClose, handleNavigate])

  const handleSignIn = useCallback(() => {
    onClose()
    openModal("login")
  }, [openModal, onClose])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            variants={variants.backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            variants={variants.panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-[28px] flex flex-col overflow-hidden shadow-2xl"
            style={{ fontFamily: FONT.sans }}
          >
            <Handle />
            <Header onHome={() => handleNavigate("/")} onClose={onClose} />
            
            <div className="h-px bg-black/5 mx-5" />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain py-3">
              {user && (
                <UserSection 
                  user={user} 
                  onProfile={() => handleNavigate("/profile")} 
                  onLogout={handleLogout} 
                />
              )}

              {/* Navigation */}
              <nav className="px-3">
                <motion.div 
                  variants={variants.stagger} 
                  initial="hidden" 
                  animate="visible"
                >
                  {NAV_LINKS.map((link, i) => (
                    <NavItem
                      key={link.href}
                      link={link}
                      index={i}
                      locked={link.protected && !user}
                      onClick={handleLinkClick}
                    />
                  ))}
                </motion.div>
              </nav>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-black/5 bg-white pt-3">
              <QuickActions />
              
              <motion.div 
                variants={variants.fade} 
                custom={0.4} 
                initial="hidden" 
                animate="visible" 
                className="px-4 pb-4"
              >
                <BottomCTA user={user} onNavigate={handleNavigate} onSignIn={handleSignIn} />
              </motion.div>

              {/* Safe area */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
"use client"

import { useEffect, useCallback, useRef } from "react"
import {
  X,
  Phone,
  MapPin,
  LogOut,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  User,
} from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
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

// Smooth cubic bezier curves
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1]
const EASE_IN_OUT = [0.65, 0, 0.35, 1]
const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1]

// Spring configurations
const SPRING_SMOOTH = { type: "spring", damping: 30, stiffness: 300 }
const SPRING_BOUNCY = { type: "spring", damping: 25, stiffness: 400 }

const variants = {
  backdrop: {
    hidden: { 
      opacity: 0,
    },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.4,
        ease: EASE_OUT_QUINT
      } 
    },
    exit: { 
      opacity: 0, 
      transition: { 
        duration: 0.3,
        ease: EASE_IN_OUT,
        delay: 0.05
      } 
    },
  },
  panel: {
    hidden: { 
      y: "100%",
      borderRadius: "40px 40px 0 0",
    },
    visible: { 
      y: 0,
      borderRadius: "28px 28px 0 0",
      transition: {
        y: {
          type: "spring",
          damping: 32,
          stiffness: 350,
          mass: 0.8,
        },
        borderRadius: {
          duration: 0.4,
          delay: 0.1,
          ease: EASE_OUT_QUINT
        }
      }
    },
    exit: { 
      y: "100%",
      borderRadius: "40px 40px 0 0",
      transition: {
        y: {
          type: "spring",
          damping: 35,
          stiffness: 400,
          mass: 0.6,
        },
        borderRadius: {
          duration: 0.2,
          ease: EASE_IN_OUT
        }
      }
    },
  },
  content: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.15,
        ease: EASE_OUT_QUINT
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }
  },
  handle: {
    hidden: { opacity: 0, scaleX: 0.5 },
    visible: { 
      opacity: 1, 
      scaleX: 1,
      transition: {
        delay: 0.2,
        duration: 0.4,
        ease: EASE_OUT_BACK
      }
    },
    exit: {
      opacity: 0,
      scaleX: 0.5,
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }
  },
  header: {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.18,
        duration: 0.4,
        ease: EASE_OUT_QUINT
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.12,
        ease: EASE_IN_OUT
      }
    }
  },
  stagger: {
    hidden: {},
    visible: { 
      transition: { 
        staggerChildren: 0.045,
        delayChildren: 0.25
      } 
    },
    exit: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  },
  item: {
    hidden: { 
      opacity: 0, 
      x: -20,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      x: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.45,
        ease: EASE_OUT_EXPO
      } 
    },
    exit: {
      opacity: 0,
      x: -10,
      filter: "blur(2px)",
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }
  },
  userCard: {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 0.96
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        delay: 0.2,
        duration: 0.5,
        ease: EASE_OUT_EXPO
      } 
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.98,
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }
  },
  quickActions: {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.35,
        duration: 0.45,
        ease: EASE_OUT_QUINT
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.12,
        ease: EASE_IN_OUT
      }
    }
  },
  cta: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: 0.4,
        duration: 0.5,
        ease: EASE_OUT_BACK
      }
    },
    exit: {
      opacity: 0,
      y: 15,
      scale: 0.97,
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }
  },
  closeButton: {
    hidden: { opacity: 0, scale: 0.8, rotate: -90 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.25,
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotate: 90,
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }
  }
}

// Hooks
function useLockScroll(lock) {
  useEffect(() => {
    if (!lock) return
    const orig = { 
      overflow: document.body.style.overflow, 
      touchAction: document.body.style.touchAction,
      position: document.body.style.position
    }
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    return () => {
      document.body.style.overflow = orig.overflow
      document.body.style.touchAction = orig.touchAction
      document.body.style.position = orig.position
      document.body.style.width = ""
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
    
    const timer = setTimeout(() => first?.focus(), 100)

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
    return () => {
      clearTimeout(timer)
      container.removeEventListener("keydown", trap)
    }
  }, [active, ref])
}

// Components
const Handle = () => (
  <motion.div 
    variants={variants.handle}
    className="flex justify-center pt-3 pb-1"
  >
    <motion.div 
      className="w-9 h-1 rounded-full bg-black/10"
      whileHover={{ scaleX: 1.1, backgroundColor: "rgba(0,0,0,0.2)" }}
      transition={{ duration: 0.2 }}
    />
  </motion.div>
)

const Header = ({ onHome, onClose }) => (
  <motion.div 
    variants={variants.header}
    className="flex items-center justify-between px-5 py-3"
  >
    <motion.button 
      onClick={onHome} 
      className="group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span
        className="tracking-[0.2em] uppercase text-black group-hover:opacity-60 transition-opacity"
        style={{ fontFamily: FONT.serif, fontSize: "12px", fontWeight: 400 }}
      >
        Wash2Door
      </span>
    </motion.button>
    <motion.button
      variants={variants.closeButton}
      whileHover={{ scale: 1.1, backgroundColor: "#000" }}
      whileTap={{ scale: 0.9 }}
      onClick={onClose}
      className="w-9 h-9 rounded-full bg-black/5 hover:text-white flex items-center justify-center transition-colors duration-300"
    >
      <X size={16} strokeWidth={1.5} />
    </motion.button>
  </motion.div>
)

const UserSection = ({ user, onProfile, onLogout }) => {
  const initial = user?.firstName?.charAt(0)?.toUpperCase() || "U"
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim()

  return (
    <motion.div
      variants={variants.userCard}
      className="mx-4 mb-3"
    >
      <motion.div 
        className="bg-black rounded-2xl p-4 text-white overflow-hidden relative"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/10"
              whileHover={{ scale: 1.05, ring: "3px" }}
              transition={SPRING_BOUNCY}
            >
              <span style={{ fontFamily: FONT.serif, fontSize: "15px" }}>{initial}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.95)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onProfile}
              className="flex-1 h-10 rounded-xl bg-white text-black text-[10px] font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <User size={12} />
              Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="h-10 px-4 rounded-xl bg-white/10 text-white/80 text-[10px] font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={12} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const NavItem = ({ link, index, locked, onClick }) => (
  <motion.button
    variants={variants.item}
    whileHover={{ 
      backgroundColor: "rgba(0,0,0,0.03)",
      x: 4,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(link)}
    className="group w-full flex items-center gap-4 p-3 rounded-2xl transition-colors"
  >
    {/* Number */}
    <motion.div 
      className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-black group-hover:text-white"
      whileHover={{ scale: 1.05 }}
      transition={SPRING_BOUNCY}
    >
      <span style={{ fontFamily: FONT.serif, fontSize: "13px" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.div>

    {/* Label */}
    <div className="flex-1 text-left min-w-0">
      <p className="text-[15px] text-black font-medium truncate" style={{ fontFamily: FONT.serif }}>
        {link.label}
      </p>
      <p className="text-[10px] text-black/40 truncate mt-0.5">{link.desc}</p>
    </div>

    {/* Badge or Arrow */}
    {locked ? (
      <motion.span 
        className="text-[8px] px-2 py-1 rounded-full bg-black/5 text-black/40 uppercase tracking-wider font-medium shrink-0"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }}
      >
        Login
      </motion.span>
    ) : (
      <motion.div
        className="shrink-0"
        initial={{ x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight 
          size={16} 
          className="text-black/20 group-hover:text-black transition-colors duration-300" 
        />
      </motion.div>
    )}
  </motion.button>
)

const QuickActions = () => (
  <motion.div
    variants={variants.quickActions}
    className="mx-4 mb-4"
  >
    <div className="flex gap-2">
      <motion.a
        href={`tel:${CONTACT.phone}`}
        className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-black/[0.03] hover:bg-black hover:text-white transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Phone size={14} strokeWidth={1.5} />
        <span className="text-[10px] tracking-wider uppercase font-medium">Call</span>
      </motion.a>
      <motion.div 
        className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-black/[0.03]"
        whileHover={{ scale: 1.01 }}
      >
        <MapPin size={14} strokeWidth={1.5} className="text-black/40" />
        <span className="text-[10px] text-black/60">{CONTACT.location}</span>
      </motion.div>
      <motion.div 
        className="flex items-center gap-1.5 px-3 h-12 rounded-xl bg-emerald-500/10"
        whileHover={{ scale: 1.02 }}
      >
        <motion.span 
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <span className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">{CONTACT.hours}</span>
      </motion.div>
    </div>
  </motion.div>
)

const BottomCTA = ({ user, onNavigate, onSignIn }) => {
  if (user) {
    return (
      <motion.button
        whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.85)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate("/my-bookings")}
        className="w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 transition-colors"
      >
        <Calendar size={16} />
        <span className="text-[11px] tracking-[0.2em] uppercase font-medium">View My Bookings</span>
      </motion.button>
    )
  }

  return (
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate("/services")}
        className="flex-1 h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black/90 transition-colors"
      >
        <span className="text-[11px] tracking-[0.2em] uppercase font-medium">Book Now</span>
        <motion.div 
          className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.25)" }}
          transition={SPRING_BOUNCY}
        >
          <ArrowUpRight size={12} />
        </motion.div>
      </motion.button>
      <motion.button
        whileHover={{ 
          scale: 1.02, 
          backgroundColor: "#000", 
          color: "#fff",
          borderColor: "#000"
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onSignIn}
        className="px-6 h-14 border border-black/10 rounded-2xl text-black text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300"
      >
        Sign In
      </motion.button>
    </div>
  )
}

const Divider = () => (
  <motion.div 
    className="h-px bg-black/5 mx-5"
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ 
      scaleX: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: EASE_OUT_QUINT
      }
    }}
    exit={{
      scaleX: 0,
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: EASE_IN_OUT
      }
    }}
  />
)

// Main Component
export default function MobileDrawer({ isOpen, onClose }) {
  const { user, openModal, logout } = useAuth()
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  useLockScroll(isOpen)
  useEscapeKey(isOpen, onClose)
  useFocusTrap(isOpen, panelRef)

  const handleLogout = useCallback(() => {
    onClose()
    setTimeout(logout, 150)
  }, [logout, onClose])

  const handleNavigate = useCallback((href) => {
    onClose()
    setTimeout(() => navigate(href), 150)
  }, [navigate, onClose])

  const handleLinkClick = useCallback((link) => {
    if (link.protected && !user) {
      onClose()
      setTimeout(() => openModal("login"), 150)
      return
    }
    handleNavigate(link.href)
  }, [user, openModal, onClose, handleNavigate])

  const handleSignIn = useCallback(() => {
    onClose()
    setTimeout(() => openModal("login"), 150)
  }, [openModal, onClose])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[9999]" 
          role="dialog" 
          aria-modal="true"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            variants={variants.backdrop}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            variants={variants.panel}
            className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white flex flex-col overflow-hidden"
            style={{ 
              fontFamily: FONT.sans,
              boxShadow: "0 -10px 60px -10px rgba(0,0,0,0.3), 0 -2px 10px rgba(0,0,0,0.1)"
            }}
          >
            <motion.div variants={variants.content}>
              <Handle />
              <Header onHome={() => handleNavigate("/")} onClose={onClose} />
              
              <Divider />

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
              <motion.div 
                className="shrink-0 border-t border-black/5 bg-white pt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    delay: 0.3,
                    duration: 0.4,
                    ease: EASE_OUT_QUINT
                  }
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    duration: 0.12,
                    ease: EASE_IN_OUT
                  }
                }}
              >
                <QuickActions />
                
                <motion.div 
                  variants={variants.cta}
                  className="px-4 pb-4"
                >
                  <BottomCTA user={user} onNavigate={handleNavigate} onSignIn={handleSignIn} />
                </motion.div>

                {/* Safe area */}
                <div className="h-[env(safe-area-inset-bottom)]" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
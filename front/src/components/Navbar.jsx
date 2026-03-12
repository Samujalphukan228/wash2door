"use client"

import { useState, useEffect } from 'react'
import { Phone, MapPin, Menu, User, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import TopBar from './TopBar'
import MobileDrawer from './MobileDrawer'
import AuthModal from './AuthModal'

const navLinks = [
  { label: 'Home',        href: '/' },
  { label: 'About Us',    href: '/About' },
  { label: 'Services',    href: '/Services' },
  { label: 'My Bookings', href: '/my-bookings' },  // ✅ Fixed
  { label: 'Contact',     href: '/Contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading, openModal, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Handle protected route clicks
  const handleProtectedClick = (e, href) => {
    if (href === '/my-bookings' && !user) {
      e.preventDefault()
      openModal('login')
    }
  }

  // Desktop user section
  const renderUserSection = () => {
    if (loading) {
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )
    }

    if (user) {
      return (
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.18em] uppercase text-black hover:bg-gray-50 rounded-full transition-colors duration-200">
            <User size={14} strokeWidth={1.5} />
            <span>{user.firstName}</span>
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <a 
              href="/profile" 
              className="block px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-black hover:bg-gray-50 transition-colors rounded-t"
            >
              My Profile
            </a>
            <a 
              href="/my-bookings"  // ✅ Fixed
              className="block px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-black hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              My Bookings
            </a>
            <button 
              onClick={logout} 
              className="w-full text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 rounded-b"
            >
              Sign Out
            </button>
          </div>
        </div>
      )
    }

    // NOT logged in - show login button
    return (
      <button 
        onClick={() => openModal('login')}
        className="flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.18em] uppercase text-black border border-gray-300 hover:bg-gray-50 rounded-full transition-colors duration-200"
      >
        <LogIn size={14} strokeWidth={1.5} />
        <span>Sign In</span>
      </button>
    )
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopBar />

      <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-500 ${
          scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'border-b border-gray-200'
        }`}
      >
        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-[60px]">
          <button 
            onClick={() => setMobileOpen(true)} 
            className="text-black hover:opacity-50 transition-opacity duration-200 p-1 -ml-1" 
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.4} />
          </button>

          <a href="/" className="flex-1 text-center leading-none no-underline group">
            <div 
              className="text-sm tracking-[0.32em] uppercase text-black transition-opacity duration-300 group-hover:opacity-60" 
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
            >
              WASH2DOOR
            </div>
            <div className="text-[7px] tracking-[0.28em] uppercase text-gray-400 mt-0.5">
              Shine That Finds You
            </div>
          </a>

          {/* Mobile Right Icons */}
          {loading ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : user ? (
            <button 
              onClick={() => setMobileOpen(true)} 
              className="w-9 h-9 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-colors duration-200" 
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <button 
              onClick={() => openModal('login')}
              className="w-9 h-9 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-colors duration-200" 
              aria-label="Sign In"
            >
              <LogIn size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between px-10 h-[68px]">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-gray-400 min-w-[160px]">
            <MapPin size={11} strokeWidth={1.6} />
            <span>Duliajan, Assam</span>
          </div>

          <a href="/" className="absolute left-1/2 -translate-x-1/2 text-center leading-none no-underline group">
            <div 
              className="text-[26px] tracking-[0.42em] uppercase text-black transition-opacity duration-300 group-hover:opacity-60" 
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
            >
              WASH2DOOR
            </div>
            <div className="text-[9px] tracking-[0.32em] uppercase text-gray-400 mt-1">
              The Shine That Finds You
            </div>
          </a>

          <div className="flex items-center gap-6 min-w-[160px] justify-end">
            <a 
              href="tel:6900706456" 
              className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-gray-400 hover:text-black transition-colors duration-200 no-underline"
            >
              <Phone size={12} strokeWidth={1.6} />
              6900706456
            </a>
            {renderUserSection()}
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center justify-center border-t border-gray-100 h-[44px]">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              onClick={(e) => handleProtectedClick(e, link.href)}
              className="relative flex items-center h-[44px] px-6 text-[10.5px] tracking-[0.2em] uppercase text-black no-underline group"
            >
              {link.label}
              <span className="absolute bottom-0 left-6 right-6 h-px bg-black origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
            </a>
          ))}
        </div>
      </nav>

      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <AuthModal />
    </div>
  )
}
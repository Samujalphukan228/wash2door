"use client"

import { useState, useEffect, useRef } from 'react'
import { Phone, MapPin, Menu } from 'lucide-react'
import TopBar from './TopBar'
import BookButton from './BookButton'
import MobileDrawer from './MobileDrawer'

const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'About Us', href: '/About' },
  { label: 'Services', href: 'https://wash2door.in/services/' },
  { label: 'Contact',  href: '/Contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
      lastY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* ── Top promo bar ── */}
      <TopBar />

      {/* ── Main nav ── */}
      <nav
        className={`bg-white sticky top-0 z-50 transition-shadow duration-500 ${
          scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'border-b border-gray-200'
        }`}
      >
        {/* Logo row - Mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-[60px]">
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="text-black hover:opacity-50 transition-opacity duration-200 p-1 -ml-1"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.4} />
          </button>

          {/* Logo */}
          <a
            href="https://wash2door.in/"
            className="flex-1 text-center leading-none no-underline group"
          >
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

          {/* Book Button */}
          <BookButton variant="mobile" />
        </div>

        {/* Logo row - Desktop */}
        <div className="hidden md:flex items-center justify-between px-10 h-[68px]">

          {/* Left — location (desktop) */}
          <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-gray-400 min-w-[160px]">
            <MapPin size={11} strokeWidth={1.6} />
            <span>Duliajan, Assam</span>
          </div>

          {/* Center — Wordmark */}
          <a
            href="https://wash2door.in/"
            className="absolute left-1/2 -translate-x-1/2 text-center leading-none no-underline group"
          >
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

          {/* Right — phone + CTA (desktop) */}
          <div className="flex items-center gap-6 min-w-[160px] justify-end">
            <a
              href="tel:6900706456"
              className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-gray-400 hover:text-black transition-colors duration-200 no-underline"
            >
              <Phone size={12} strokeWidth={1.6} />
              6900706456
            </a>
            <BookButton variant="desktop" />
          </div>
        </div>

        {/* Nav links row (desktop) */}
        <div className="hidden md:flex items-center justify-center border-t border-gray-100 h-[44px]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative flex items-center h-[44px] px-6 text-[10.5px] tracking-[0.2em] uppercase text-black no-underline group"
            >
              {link.label}
              <span className="absolute bottom-0 left-6 right-6 h-px bg-black origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
            </a>
          ))}
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  )
}
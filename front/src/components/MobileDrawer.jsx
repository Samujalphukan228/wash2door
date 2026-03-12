"use client"

import { useEffect } from 'react'
import { X, Phone, MapPin } from 'lucide-react'

const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'About Us', href: '/About' },
  { label: 'Services', href: 'https://wash2door.in/services/' },
  { label: 'Contact',  href: '/Contact' },
]

export default function MobileDrawer({ isOpen, onClose }) {

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <div className={`fixed inset-0 z-[9999] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 will-change-opacity transition-opacity duration-500 ${
          isOpen ? 'opacity-100 bg-black/40 backdrop-blur-sm' : 'opacity-0 bg-black/0'
        }`}
      />

      {/* Panel */}
      <div
        className={`absolute top-3 left-3 bottom-3 right-3 md:top-4 md:left-4 md:bottom-4 md:right-4
                    h-[calc(100vh-24px)] md:h-[calc(100vh-32px)]
                    bg-white flex flex-col rounded-lg will-change-transform
                    transition-transform duration-500 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)] md:-translate-x-[calc(100%+32px)]'
        }`}
      >

        {/* Top accent line */}
        <div className={`h-1 bg-black rounded-t-lg transition-all duration-500 delay-100 ${isOpen ? 'w-full' : 'w-0'}`} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-8 pt-5 md:pt-6 pb-3 md:pb-4">
          <div className="flex-1">
            <p
              className="tracking-[0.42em] uppercase text-black leading-tight"
              style={{
                fontFamily: 'Georgia, serif',
                fontWeight: 300,
                fontSize: 'clamp(14px, 4vw, 18px)',
              }}
            >
              WASH2DOOR
            </p>
            <p
              className="tracking-[0.32em] uppercase text-gray-500 mt-2"
              style={{ fontSize: 'clamp(7px, 1.8vw, 9px)' }}
            >
              The Shine That Finds You
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-all duration-200 ml-4 shrink-0"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.2} />
          </button>
        </div>

        {/* Divider */}
        <div className={`mx-5 md:mx-8 h-px bg-gray-200 transition-all duration-500 delay-75 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

        {/* Nav links */}
        <nav className="flex flex-col mt-3 md:mt-4">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={onClose}
              className={`relative mx-5 md:mx-8 py-4 tracking-[0.26em] uppercase text-black
                          no-underline border-b border-gray-100 last:border-0
                          hover:pl-2 hover:tracking-[0.32em] transition-all duration-300
                          ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
              style={{
                fontSize: 'clamp(10px, 2.6vw, 11px)',
                transitionDelay: isOpen ? `${i * 50 + 100}ms` : '0ms',
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Contact block */}
        <div
          className={`mx-5 md:mx-8 pt-5 pb-4 border-t border-gray-200 transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}
        >
          <p
            className="tracking-[0.3em] uppercase text-gray-500 mb-4 font-medium"
            style={{ fontSize: 'clamp(7px, 1.8vw, 9px)' }}
          >
            Get In Touch
          </p>

          <a
            href="tel:6900706456"
            className="flex items-center gap-3 tracking-[0.2em] uppercase text-black
                       no-underline hover:opacity-60 transition-opacity duration-200 mb-4"
            style={{ fontSize: 'clamp(9px, 2.4vw, 11px)' }}
          >
            <Phone size={13} strokeWidth={1.5} className="shrink-0 text-gray-600" />
            <span>6900706456</span>
          </a>

          <div
            className="flex items-start gap-3 tracking-[0.18em] uppercase text-gray-600"
            style={{ fontSize: 'clamp(8px, 2.2vw, 10px)' }}
          >
            <MapPin size={13} strokeWidth={1.5} className="shrink-0 mt-0.5" />
            <span className="leading-6">
              Duliajan, Assam<br />
              <span className="text-gray-500">Mon – Sun &nbsp;·&nbsp; 9 AM – 5 PM</span>
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`mx-5 md:mx-8 pb-5 md:pb-6 transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: isOpen ? '400ms' : '0ms' }}
        >
          <a
            href="https://wash2door.in/bookin/"
            className="block w-full text-center tracking-[0.36em] uppercase py-4
                       bg-black text-white no-underline rounded-sm
                       hover:bg-white hover:text-black border border-black
                       transition-all duration-300 font-medium"
            style={{ fontSize: 'clamp(9px, 2.4vw, 11px)' }}
          >
            Book Now
          </a>
        </div>

      </div>
    </div>
  )
}
"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Phone } from 'lucide-react'

const stats = [
  { value: '100+', label: 'Cars Cleaned' },
  { value: '4.8★', label: 'Star Rating' },
  { value: '2hr', label: 'Avg Service' },
]

const BG_IMAGE =
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#080808]">
      
      {/* ═══════════════════════════════════════
          BACKGROUND IMAGE
      ═══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <img
          src={BG_IMAGE}
          alt="Premium car detailing"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.35) contrast(1.1) saturate(0.85)' }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════
          GRADIENT OVERLAYS
      ═══════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-[#080808]/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080808]/70 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════
          LEFT ACCENT LINE
      ═══════════════════════════════════════ */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
        className="absolute left-0 top-0 w-[2px] h-full origin-top hidden md:block"
        style={{
          background: 'linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.2) 70%, transparent 90%)',
        }}
      />

      {/* ═══════════════════════════════════════
          WATERMARK
      ═══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute -right-4 -bottom-6 select-none pointer-events-none hidden lg:block"
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 300,
          fontSize: '20vw',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.02)',
          letterSpacing: '-0.04em',
        }}
      >
        W2D
      </motion.div>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 sm:px-10 md:px-14 lg:px-20 py-6 sm:py-8 md:py-10">
        
        {/* ─── TOP BAR ─── */}
        <header className="flex items-center justify-between mb-auto">
          {/* Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <span className="w-5 h-px bg-white/30 hidden sm:block" />
            <span
              className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-white/50"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <span className="hidden sm:inline">Doorstep Car Care · </span>Duliajan
            </span>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-full w-full bg-green-400" />
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/60">
              Open · 9AM – 5PM
            </span>
          </motion.div>
        </header>

        {/* ─── MAIN HERO SECTION ─── */}
        <div className="flex-1 flex flex-col justify-center py-10 sm:py-16 md:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16">
            
            {/* Left: Headlines */}
            <div className="flex-1">
              {/* Headline Lines */}
              {['The Shine', 'That Finds', 'You.'].map((text, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.h1
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={i === 1 ? 'text-white/40 italic' : 'text-white'}
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 300,
                      fontSize: 'clamp(3rem, 12vw, 7.5rem)',
                      lineHeight: 0.95,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {text}
                  </motion.h1>
                </div>
              ))}
            </div>

            {/* Right: Description & CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="w-full lg:w-[280px] xl:w-[320px] shrink-0"
            >
              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-white/25 to-transparent mb-6" />

              {/* Body Text */}
              <p
                className="text-[11px] sm:text-[12px] tracking-[0.15em] uppercase text-white/40 leading-[1.8] mb-8"
              >
                Professional car & home
                cleaning at your doorstep —
                fast, safe & hassle-free.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                {/* Primary CTA */}
                <a
                  href="/Bookings"
                  className="group relative inline-flex items-center justify-center gap-3 
                           px-7 py-4 border border-white/25 overflow-hidden
                           hover:border-white/40 transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white group-hover:text-black transition-colors duration-500">
                    Book Now
                  </span>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    className="relative z-10 text-white group-hover:text-black transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 py-3
                           text-white/35 hover:text-green-400 transition-colors duration-300"
                >
                  <Phone size={13} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-[10px] tracking-[0.18em] uppercase">
                    WhatsApp Us
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── BOTTOM STATS ─── */}
        <footer className="mt-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="w-full h-px bg-white/10 mb-6"
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex items-end justify-between gap-6"
          >
            {/* Stats */}
            <div className="flex items-end gap-8 sm:gap-10 md:gap-14">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
                >
                  <p
                    className="text-white leading-none"
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontWeight: 300,
                      fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/30 mt-1.5">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Services Link - Desktop */}
            <a
              href="/Services"
              className="hidden md:flex items-center gap-3 text-white/30 hover:text-white/70 transition-colors duration-300 group"
            >
              <span className="text-[9px] tracking-[0.25em] uppercase">
                All Services
              </span>
              <span className="h-px bg-current w-5 group-hover:w-10 transition-all duration-300" />
            </a>
          </motion.div>
        </footer>
      </div>
    </section>
  )
}
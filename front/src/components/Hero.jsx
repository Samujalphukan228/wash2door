'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Phone, Droplets, Shield, Clock, Zap } from 'lucide-react'

/* ─── Constants ─── */
const STATS = [
  { value: '500+', label: 'Happy Clients', icon: Shield },
  { value: '4.9★', label: 'Avg Rating', icon: Clock },
  { value: '2min', label: 'Quick Booking', icon: Droplets },
]

const SERVICES_MARQUEE = [
  'Exterior Wash',
  'Interior Detailing',
  'Sofa Cleaning',
  'Water Tank',
  'Ceramic Coating',
]

const BG_IMAGE =
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=90&w=2800&auto=format&fit=crop'

const WHATSAPP_URL =
  'https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash'

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const EASE = [0.22, 1, 0.36, 1]

/* ─── Subcomponents ─── */
function PulsingDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
      <span className="relative inline-flex rounded-full h-full w-full bg-white" />
    </span>
  )
}

function ServicesMarquee() {
  const doubled = [...SERVICES_MARQUEE, ...SERVICES_MARQUEE]
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-6 lg:gap-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((service, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <span
              className="text-white/20 tracking-[0.2em] lg:tracking-[0.25em] uppercase"
              style={{ fontSize: 'clamp(8px, 2vw, 10px)', fontFamily: SANS }}
            >
              {service}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function useGreeting() {
  const [greeting, setGreeting] = useState('')
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])
  return greeting
}

/* ─── Main Component ─── */
export default function Hero() {
  const sectionRef = useRef(null)
  const greeting = useGreeting()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 40, damping: 20 })
  const bgOpacity = useTransform(smoothScroll, [0, 0.5], [1, 0.6])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100svh] overflow-hidden bg-black"
      aria-label="Hero section"
    >
      {/* ─── Background ─── */}
      <motion.div className="absolute inset-0" style={{ opacity: bgOpacity }}>
        <img
          src={BG_IMAGE}
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.3) contrast(1.1) saturate(0.7)' }}
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* ─── Overlays ─── */}
      <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ═══════════ MOBILE (< sm) ═══════════ */}
      <div className="relative z-10 min-h-[100svh] flex flex-col sm:hidden px-4 pt-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
              <Droplets size={10} className="text-white/40" />
            </div>
            <span
              className="text-white/40 tracking-[0.2em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS, fontWeight: 500 }}
            >
              Wash2Door
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]"
          >
            <PulsingDot />
            <span
              className="text-white/40 tracking-[0.12em] uppercase"
              style={{ fontSize: '7px', fontFamily: SANS }}
            >
              Open
            </span>
          </motion.div>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Main Content ── */}
        <div className="pb-20">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex items-center gap-2 mb-5"
          >
            <div className="w-4 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <span
              className="text-white/50 tracking-[0.25em] uppercase"
              style={{ fontSize: '7px', fontFamily: SANS }}
            >
              {greeting}
            </span>
          </motion.div>

          {/* Headline - Optimized for mobile */}
          <div className="mb-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
              className="text-white leading-[1] mb-1"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(2.8rem, 12vw, 4.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Pristine
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
              className="text-white leading-[1] mb-1"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(2.8rem, 12vw, 4.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Car Care
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8, ease: EASE }}
              className="leading-[1]"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(2.2rem, 10vw, 3.5rem)',
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.15)',
                fontStyle: 'italic',
              }}
            >
              Delivered
            </motion.h1>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
            className="flex items-center gap-2 origin-left mb-4"
          >
            <div className="w-6 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </motion.div>

          {/* Description - Better readability */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-white/40 leading-[1.6] mb-6"
            style={{
              fontSize: '13px',
              fontFamily: SANS,
              maxWidth: '100%',
              letterSpacing: '0.005em',
            }}
          >
            Premium doorstep car cleaning in Duliajan. Book in seconds — we bring everything.
          </motion.p>

          {/* CTAs - Stacked on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col gap-3 mb-8"
          >
            <a
              href="/bookings"
              className="group relative flex items-center justify-between px-5 h-14 bg-white rounded-xl overflow-hidden active:scale-95 transition-transform duration-200"
            >
              <div className="absolute inset-0 bg-white/80 -translate-x-full group-active:translate-x-0 transition-transform duration-300" />
              <span
                className="relative z-10 tracking-[0.15em] uppercase text-black flex-1"
                style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 600 }}
              >
                Book Now
              </span>
              <div className="relative z-10 w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <ArrowRight size={14} className="text-white" />
              </div>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 h-14 rounded-xl border border-white/10 bg-white/[0.04] text-white/40 active:bg-white/10 active:scale-95 transition-all duration-200"
            >
              <Phone size={16} strokeWidth={1.5} />
              <span
                className="tracking-[0.15em] uppercase"
                style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 500 }}
              >
                WhatsApp Us
              </span>
            </a>
          </motion.div>

          {/* Stats - Compact grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.7 }}
            className="grid grid-cols-3 gap-2"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 + i * 0.08 }}
                className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
              >
                <p
                  className="text-white leading-none mb-1"
                  style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-white/25 tracking-[0.1em] uppercase"
                  style={{ fontSize: '6px', fontFamily: SANS, lineHeight: 1.2 }}
                >
                  {stat.label.split(' ')[0]}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══════════ TABLET (sm - lg) ═══════════ */}
      <div className="relative z-10 min-h-[100svh] hidden sm:flex lg:hidden flex-col px-6 md:px-8 pt-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-12 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
              <Droplets size={12} className="text-white/40" />
            </div>
            <div>
              <span
                className="block text-white/40 tracking-[0.2em] uppercase"
                style={{ fontSize: '8px', fontFamily: SANS, fontWeight: 500 }}
              >
                Wash2Door
              </span>
              <span
                className="block text-white/20 tracking-[0.15em] uppercase"
                style={{ fontSize: '6px', fontFamily: SANS }}
              >
                Duliajan, Assam
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04]"
          >
            <PulsingDot />
            <span
              className="text-white/40 tracking-[0.12em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS }}
            >
              Open · 9–5 PM
            </span>
          </motion.div>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Main Content ── */}
        <div className="pb-20">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-6 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <span
              className="text-white/40 tracking-[0.3em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS }}
            >
              Premium Doorstep Detailing
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: EASE }}
              className="text-white leading-[1]"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Pristine Car Care
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.9, ease: EASE }}
              className="leading-[1]"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.12)',
                fontStyle: 'italic',
              }}
            >
              Delivered to Your Door
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-white/35 leading-[1.7] mb-8 max-w-[600px]"
            style={{
              fontSize: '14px',
              fontFamily: SANS,
              letterSpacing: '0.005em',
            }}
          >
            Premium car cleaning that comes to you. Book in seconds — we arrive fully equipped with everything needed for your vehicle.
          </motion.p>

          {/* CTAs - Side by side */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex gap-3 mb-12 max-w-[500px]"
          >
            <a
              href="/bookings"
              className="group flex-1 relative flex items-center justify-between px-5 h-14 bg-white rounded-lg overflow-hidden active:scale-95 transition-transform duration-200"
            >
              <div className="absolute inset-0 bg-white/80 -translate-x-full group-active:translate-x-0 transition-transform duration-300" />
              <span
                className="relative z-10 tracking-[0.15em] uppercase text-black"
                style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 600 }}
              >
                Book Now
              </span>
              <div className="relative z-10 w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <ArrowRight size={14} className="text-white" />
              </div>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-5 h-14 rounded-lg border border-white/10 bg-white/[0.04] text-white/40 hover:text-white/60 hover:border-white/15 active:scale-95 transition-all duration-200"
            >
              <Phone size={16} strokeWidth={1.5} />
              <span
                className="tracking-[0.15em] uppercase"
                style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 500 }}
              >
                WhatsApp
              </span>
            </a>
          </motion.div>

          {/* Services Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95, duration: 0.7 }}
            className="mb-4"
          >
            <ServicesMarquee />
          </motion.div>

          <div className="w-full h-px bg-white/[0.06] mb-4" />

          {/* Stats - Horizontal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="flex gap-3"
          >
            {STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.08 }}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={12} className="text-white/25" strokeWidth={1.5} />
                  </div>
                  <p
                    className="text-white leading-none mb-1"
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 300,
                      fontSize: '18px',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-white/25 tracking-[0.12em] uppercase"
                    style={{ fontSize: '7px', fontFamily: SANS }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* ═══════════ DESKTOP (>= lg) ═══════════ */}
      <div className="relative z-10 min-h-[100svh] hidden lg:flex flex-col px-12 xl:px-16 2xl:px-24 py-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-16 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center">
              <Droplets size={12} className="text-white/30" />
            </div>
            <div className="flex flex-col">
              <span
                className="text-white/35 tracking-[0.28em] uppercase"
                style={{ fontSize: '8px', fontFamily: SANS, fontWeight: 500 }}
              >
                Wash2Door
              </span>
              <span
                className="text-white/15 tracking-[0.15em] uppercase"
                style={{ fontSize: '7px', fontFamily: SANS }}
              >
                Duliajan, Assam
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <span
              className="text-white/20 tracking-[0.1em]"
              style={{ fontSize: '11px', fontFamily: SANS }}
            >
              {greeting}
            </span>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03]">
              <PulsingDot />
              <span
                className="text-white/40 tracking-[0.15em] uppercase"
                style={{ fontSize: '8px', fontFamily: SANS }}
              >
                Open · 9–5 PM
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1 min-h-[60px]" />

        {/* ── Main Content ── */}
        <div className="shrink-0 pb-6">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-7 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <span
              className="text-white/40 tracking-[0.3em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS }}
            >
              Premium Doorstep Detailing
            </span>
            <Zap size={12} className="text-white/20" strokeWidth={1.5} />
          </motion.div>

          {/* Headline + Right Column */}
          <div className="flex items-end justify-between gap-16 mb-16">
            {/* Headline */}
            <div className="shrink-0 max-w-[700px]">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: EASE }}
                className="text-white leading-[0.9]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: 'clamp(4rem, 7vw, 8rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                Pristine
              </motion.h1>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: EASE }}
                className="text-white leading-[0.9]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: 'clamp(4rem, 7vw, 8rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                Car Care
              </motion.h1>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: EASE }}
                className="leading-[0.9] mt-2"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: 'clamp(3rem, 6vw, 7rem)',
                  letterSpacing: '-0.02em',
                  color: 'rgba(255,255,255,0.1)',
                  fontStyle: 'italic',
                }}
              >
                Delivered to Your Door
              </motion.h1>
            </div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="shrink-0 w-[300px] xl:w-[340px] pb-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-px bg-gradient-to-r from-white/25 to-transparent" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
              </div>

              <p
                className="text-white/32 leading-[1.8] mb-8"
                style={{ fontSize: '13px', fontFamily: SANS, letterSpacing: '0.005em' }}
              >
                Premium car cleaning that comes to you. Book in seconds—we arrive fully equipped with everything needed.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/bookings"
                  className="group relative flex items-center justify-between px-6 h-13 bg-white rounded-lg overflow-hidden hover:shadow-xl hover:shadow-white/10 transition-shadow duration-400"
                >
                  <div className="absolute inset-0 bg-white/90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
                  <span
                    className="relative z-10 tracking-[0.18em] uppercase text-black"
                    style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 600 }}
                  >
                    Book Your Wash
                  </span>
                  <div className="relative z-10 w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-400">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 h-12 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/35 hover:text-white/55 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-400"
                >
                  <Phone size={13} strokeWidth={1.5} />
                  <span
                    className="tracking-[0.18em] uppercase"
                    style={{ fontSize: '9px', fontFamily: SANS }}
                  >
                    WhatsApp Us
                  </span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.7 }}
          >
            {/* Marquee */}
            <div className="mb-5">
              <ServicesMarquee />
            </div>

            <div className="w-full h-px bg-white/[0.05] mb-5" />

            <div className="flex items-end justify-between gap-12">
              {/* Stats */}
              <div className="flex gap-4">
                {STATS.map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.08 }}
                      className="group px-5 py-4 rounded-lg border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-400 cursor-default"
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <Icon
                          size={12}
                          className="text-white/20 group-hover:text-white/35 transition-colors duration-400"
                          strokeWidth={1.5}
                        />
                        <div className="w-3 h-px bg-white/10" />
                      </div>
                      <p
                        className="text-white leading-none mb-1"
                        style={{
                          fontFamily: SERIF,
                          fontWeight: 300,
                          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-white/20 tracking-[0.15em] uppercase"
                        style={{ fontSize: '7px', fontFamily: SANS }}
                      >
                        {stat.label}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Quick Links */}
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.35 }}
                className="flex gap-8"
                aria-label="Quick links"
              >
                {['Services', 'About', 'Contact'].map((link) => (
                  <a
                    key={link}
                    href={`/${link.toLowerCase()}`}
                    className="group flex flex-col items-center gap-2"
                  >
                    <span
                      className="text-white/25 group-hover:text-white/50 tracking-[0.2em] uppercase transition-colors duration-300"
                      style={{ fontSize: '8px', fontFamily: SANS }}
                    >
                      {link}
                    </span>
                    <span
                      className="h-px bg-white/25 w-0 group-hover:w-10 transition-all duration-300"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </motion.nav>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowRight, Phone, Droplets, Shield, Clock, Zap, MapPin } from 'lucide-react'

/* ─── Constants ─── */
const STATS = [
  { value: '500+', label: 'Happy Clients', icon: Shield },
  { value: '4.9★', label: 'Avg Rating',    icon: Clock },
  { value: '2min', label: 'Quick Booking', icon: Droplets },
]

const SERVICES_MARQUEE = [
  'Exterior Wash',
  'Interior Detailing',
  'Sofa Cleaning',
  'Water Tank',
  'Ceramic Coating',
  'Engine Cleaning',
  'Paint Protection',
]

const BG_IMAGE =
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=90&w=2800&auto=format&fit=crop'

const WHATSAPP_URL =
  'https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash'

/* ─── Font stacks ─── */
const DISPLAY = '"DM Serif Display", "Playfair Display", Georgia, serif'
const MONO    = '"DM Mono", "Fira Code", "Courier New", monospace'
const BODY    = '"DM Sans", "Helvetica Neue", Helvetica, sans-serif'

const EASE_OUT = [0.16, 1, 0.3, 1]

/* ─── Helpers ─── */
function useGreeting() {
  const [g, setG] = useState('')
  useEffect(() => {
    const h = new Date().getHours()
    setG(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])
  return g
}

function PulsingDot({ color = 'bg-emerald-400' }) {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-50`} />
      <span className={`relative inline-flex rounded-full h-full w-full ${color}`} />
    </span>
  )
}

/* Horizontal scrolling marquee */
function ServicesMarquee() {
  const doubled = [...SERVICES_MARQUEE, ...SERVICES_MARQUEE]
  return (
    <div className="overflow-hidden whitespace-nowrap mask-fade-x">
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-4">
            <span
              className="text-white/30 uppercase tracking-[0.22em]"
              style={{ fontSize: '9px', fontFamily: MONO, fontWeight: 400 }}
            >
              {s}
            </span>
            <span className="w-[3px] h-[3px] rounded-full bg-white/15 shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* Animated counter */
function Counter({ value }) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    const numeric = parseFloat(value)
    if (isNaN(numeric)) { setDisplay(value); return }
    let start = 0
    const end = numeric
    const duration = 1200
    const step = (end / duration) * 16
    const timer = setInterval(() => {
      start = Math.min(start + step, end)
      const suffix = value.replace(/[\d.]/g, '')
      setDisplay(Number.isInteger(end) ? Math.floor(start) + suffix : start.toFixed(1) + suffix)
      if (start >= end) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

/* ─── Main Hero ─── */
export default function Hero() {
  const sectionRef = useRef(null)
  const greeting   = useGreeting()
  const [loaded, setLoaded] = useState(false)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const smooth     = useSpring(scrollYProgress, { stiffness: 35, damping: 18 })
  const bgY        = useTransform(smooth, [0, 1], ['0%', '15%'])
  const bgOpacity  = useTransform(smooth, [0, 0.6], [1, 0.5])
  const contentY   = useTransform(smooth, [0, 1], ['0%', '-8%'])

  useEffect(() => {
    const img = new Image()
    img.src = BG_IMAGE
    img.onload = () => setLoaded(true)
  }, [])

  /* Stagger config */
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } }
  }
  const item = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_OUT } }
  }
  const itemFast = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } }
  }

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .mask-fade-x { -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
        .hero-badge { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .btn-primary::before { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.08); transform:scaleX(0); transform-origin:left; transition:transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .btn-primary:hover::before { transform:scaleX(1); }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full min-h-[100svh] overflow-hidden bg-black"
        aria-label="Hero section"
      >
        {/* ── Background ── */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: bgOpacity, y: bgY }}
        >
          <AnimatePresence>
            {loaded && (
              <motion.img
                key="bg"
                src={BG_IMAGE}
                alt=""
                role="presentation"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.6, ease: EASE_OUT }}
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'brightness(0.28) contrast(1.05) saturate(0.6)' }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Overlays ── */}
        <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black via-black/75 to-transparent" />
          {/* Left vignette */}
          <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/65 to-transparent" />
          {/* Top fade */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
          {/* Grain */}
          <div
            className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
          />
        </div>

        {/* ════════════════════════════════════
            MOBILE  (< sm)
        ════════════════════════════════════ */}
        <motion.div
          className="relative z-10 min-h-[100svh] flex flex-col sm:hidden"
          style={{ y: contentY }}
        >
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
            className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0"
          >
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center hero-badge">
                <Droplets size={12} className="text-white/50" />
              </div>
              <span style={{ fontFamily: BODY, fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
                Wash2Door
              </span>
            </div>

            {/* Live badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] hero-badge">
              <PulsingDot color="bg-emerald-400" />
              <span style={{ fontFamily: MONO, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
                OPEN
              </span>
            </div>
          </motion.div>

          {/* Spacer */}
          <div className="flex-1 min-h-[6vh]" />

          {/* Content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="px-5 pb-8"
          >
            {/* Location tag */}
            <motion.div variants={itemFast} className="flex items-center gap-2 mb-6">
              <MapPin size={10} className="text-white/25" strokeWidth={2} />
              <span style={{ fontFamily: MONO, fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Duliajan, Assam
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={item} className="mb-2">
              <h1 style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: 'clamp(2.6rem, 13vw, 3.8rem)',
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
                color: '#fff',
              }}>
                The Shines
              </h1>
            </motion.div>
            <motion.div variants={item} className="mb-2">
              <h1 style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: 'clamp(2.6rem, 13vw, 3.8rem)',
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
                color: '#fff',
              }}>
                that
              </h1>
            </motion.div>
            <motion.div variants={item} className="mb-7">
              <h1 style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 10vw, 3rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.18)',
              }}>
                find you
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p variants={itemFast} style={{
              fontFamily: BODY,
              fontSize: '14px',
              fontWeight: 300,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.38)',
              letterSpacing: '0.005em',
              marginBottom: '28px',
              maxWidth: '340px',
            }}>
              Doorstep cleaning in Duliajan — we bring everything. Book in under 2 minutes.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col gap-3 mb-8">
              <a
                href="/services"
                className="btn-primary relative flex items-center justify-between px-5 rounded-xl overflow-hidden active:scale-[0.97] transition-transform duration-150"
                style={{ height: '54px', background: '#fff' }}
              >
                <span style={{ fontFamily: BODY, fontSize: '12px', fontWeight: 600, color: '#000', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Book a Wash
                </span>
                <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
                  <ArrowRight size={15} className="text-white" />
                </div>
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.03] active:bg-white/[0.08] active:scale-[0.97] transition-all duration-150 hero-badge"
                style={{ height: '50px' }}
              >
                <Phone size={14} strokeWidth={1.5} className="text-white/40" />
                <span style={{ fontFamily: BODY, fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                  WhatsApp Us
                </span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="grid grid-cols-3 gap-2">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.07, duration: 0.5, ease: EASE_OUT }}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 hero-badge"
                >
                  <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: '18px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.3 }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════
            TABLET  (sm – lg)
        ════════════════════════════════════ */}
        <motion.div
          className="relative z-10 min-h-[100svh] hidden sm:flex lg:hidden flex-col px-7 md:px-10"
          style={{ y: contentY }}
        >
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex items-center justify-between pt-6 pb-0 shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center hero-badge">
                <Droplets size={13} className="text-white/45" />
              </div>
              <div>
                <p style={{ fontFamily: BODY, fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em', lineHeight: 1 }}>Wash2Door</p>
                <p style={{ fontFamily: MONO, fontSize: '8px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', lineHeight: 1.3, textTransform: 'uppercase' }}>Duliajan, Assam</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] hero-badge">
              <PulsingDot color="bg-emerald-400" />
              <span style={{ fontFamily: MONO, fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>OPEN · 9–5 PM</span>
            </div>
          </motion.div>

          <div className="flex-1 min-h-[8vh]" />

          <motion.div variants={container} initial="hidden" animate="show" className="pb-10">
            {/* Eyebrow */}
            <motion.div variants={itemFast} className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px bg-gradient-to-r from-white/25 to-transparent" />
              <span style={{ fontFamily: MONO, fontSize: '8px', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                Premium Doorstep Detailing
              </span>
            </motion.div>

            {/* Headline */}
            <div className="mb-8">
              <motion.h1 variants={item} style={{
                fontFamily: DISPLAY, fontWeight: 400,
                fontSize: 'clamp(3rem, 7.5vw, 5rem)',
                lineHeight: 0.95, letterSpacing: '-0.03em', color: '#fff',
              }}>
                Pristine Car Care
              </motion.h1>
              <motion.h1 variants={item} style={{
                fontFamily: DISPLAY, fontWeight: 400, fontStyle: 'italic',
                fontSize: 'clamp(2.4rem, 6.5vw, 4.2rem)',
                lineHeight: 1.0, letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.13)',
                marginTop: '4px',
              }}>
                Delivered to Your Door
              </motion.h1>
            </div>

            <motion.p variants={itemFast} style={{
              fontFamily: BODY, fontSize: '15px', fontWeight: 300,
              lineHeight: 1.7, color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.005em', maxWidth: '520px', marginBottom: '32px',
            }}>
              Premium car cleaning that comes to you. Book in seconds — we arrive fully equipped for your vehicle.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex gap-3 mb-10 max-w-[440px]">
              <a href="/services" className="btn-primary relative flex flex-1 items-center justify-between px-5 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-white/5 transition-shadow duration-300 active:scale-[0.97]" style={{ height: '52px', background: '#fff' }}>
                <span style={{ fontFamily: BODY, fontSize: '11px', fontWeight: 600, color: '#000', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Book Now</span>
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-250 active:scale-[0.97] hero-badge"
                style={{ height: '52px' }}>
                <Phone size={14} strokeWidth={1.5} className="text-white/35" />
                <span style={{ fontFamily: BODY, fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>WhatsApp</span>
              </a>
            </motion.div>

            {/* Marquee */}
            <motion.div variants={itemFast} className="mb-4">
              <ServicesMarquee />
            </motion.div>
            <div className="h-px bg-white/[0.05] mb-5" />

            {/* Stats */}
            <motion.div variants={item} className="flex gap-3">
              {STATS.map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.07 }}
                  className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 hero-badge"
                >
                  <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: '20px', color: '#fff', lineHeight: 1, marginBottom: '5px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════
            DESKTOP  (>= lg)
        ════════════════════════════════════ */}
        <motion.div
          className="relative z-10 min-h-[100svh] hidden lg:flex flex-col px-12 xl:px-16 2xl:px-24 py-8"
          style={{ y: contentY }}
        >
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: EASE_OUT }}
            className="flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-white/[0.1] bg-white/[0.03] flex items-center justify-center hero-badge">
                <Droplets size={14} className="text-white/40" />
              </div>
              <div>
                <p style={{ fontFamily: BODY, fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em', lineHeight: 1 }}>Wash2Door</p>
                <p style={{ fontFamily: MONO, fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1.4 }}>Duliajan, Assam</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span style={{ fontFamily: BODY, fontSize: '12px', fontWeight: 300, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.02em' }}>
                {greeting}
              </span>
              <div className="w-px h-4 bg-white/[0.08]" />
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] hero-badge">
                <PulsingDot color="bg-emerald-400" />
                <span style={{ fontFamily: MONO, fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
                  OPEN · 9–5 PM
                </span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 min-h-[50px]" />

          {/* Main row */}
          <div className="shrink-0 pb-6">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: EASE_OUT }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="w-8 h-px bg-gradient-to-r from-white/25 to-transparent" />
              <span style={{ fontFamily: MONO, fontSize: '9px', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
                Premium Doorstep Car Detailing
              </span>
              <Zap size={10} className="text-white/15" strokeWidth={2} />
            </motion.div>

            {/* Headline + sidebar */}
            <div className="flex items-end justify-between gap-12 mb-14">
              {/* Headline block */}
              <div className="shrink-0 max-w-[680px]">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.9, ease: EASE_OUT }}
                  style={{
                    fontFamily: DISPLAY, fontWeight: 400,
                    fontSize: 'clamp(4.5rem, 7.5vw, 8.5rem)',
                    lineHeight: 0.92, letterSpacing: '-0.035em', color: '#fff',
                    display: 'block',
                  }}
                >
                  Pristine
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.9, ease: EASE_OUT }}
                  style={{
                    fontFamily: DISPLAY, fontWeight: 400,
                    fontSize: 'clamp(4.5rem, 7.5vw, 8.5rem)',
                    lineHeight: 0.92, letterSpacing: '-0.035em', color: '#fff',
                    display: 'block',
                  }}
                >
                  Car Care
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72, duration: 0.9, ease: EASE_OUT }}
                  style={{
                    fontFamily: DISPLAY, fontWeight: 400, fontStyle: 'italic',
                    fontSize: 'clamp(3.5rem, 6vw, 7rem)',
                    lineHeight: 1.0, letterSpacing: '-0.025em',
                    color: 'rgba(255,255,255,0.1)',
                    display: 'block', marginTop: '6px',
                  }}
                >
                  at Your Door.
                </motion.h1>
              </div>

              {/* Right column */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8, ease: EASE_OUT }}
                className="shrink-0 w-[280px] xl:w-[320px] pb-1"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-4 h-px bg-white/15" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
                <p style={{
                  fontFamily: BODY, fontSize: '13px', fontWeight: 300,
                  lineHeight: 1.8, color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.005em', marginBottom: '28px',
                }}>
                  Premium car cleaning that comes to you. Book in seconds — we arrive fully equipped.
                </p>

                <div className="flex flex-col gap-2.5">
                  <a href="/services"
                    className="btn-primary relative flex items-center justify-between px-5 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-white/8 transition-shadow duration-400 active:scale-[0.97]"
                    style={{ height: '52px', background: '#fff' }}
                  >
                    <span style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 600, color: '#000', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Book Your Wash
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.13] transition-all duration-300 active:scale-[0.97] hero-badge"
                    style={{ height: '46px' }}>
                    <Phone size={13} strokeWidth={1.5} className="text-white/30" />
                    <span style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                      WhatsApp Us
                    </span>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Bottom strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.7 }}
            >
              <div className="mb-4">
                <ServicesMarquee />
              </div>
              <div className="h-px bg-white/[0.05] mb-5" />

              <div className="flex items-end justify-between gap-8">
                {/* Stats */}
                <div className="flex gap-3">
                  {STATS.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 + i * 0.08 }}
                        className="group px-5 py-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.09] transition-all duration-400 cursor-default hero-badge"
                      >
                        <Icon size={11} className="text-white/18 mb-2.5 group-hover:text-white/30 transition-colors duration-300" strokeWidth={1.5} />
                        <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                          {stat.value}
                        </p>
                        <p style={{ fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                          {stat.label}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Quick links */}
                <motion.nav
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="flex gap-8 pb-0.5"
                  aria-label="Quick links"
                >
                  {['Services', 'About', 'Contact'].map((link) => (
                    <a key={link} href={`/${link.toLowerCase()}`}
                      className="group flex flex-col items-start gap-1.5"
                    >
                      <span style={{ fontFamily: MONO, fontSize: '8px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'color 0.25s' }}
                        className="group-hover:!text-white/50">
                        {link}
                      </span>
                      <span className="h-px bg-white/20 w-0 group-hover:w-full transition-all duration-350" aria-hidden="true" />
                    </a>
                  ))}
                </motion.nav>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  )
}
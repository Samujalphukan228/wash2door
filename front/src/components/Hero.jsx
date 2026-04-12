'use client'

import { useRef, useEffect, useState, memo, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Phone, Shield, Clock, Zap } from 'lucide-react'

/* ─── Constants ─── */
const STATS = [
  { value: '100+', label: 'Happy Clients', icon: Shield },
  { value: '4.9★', label: 'Avg Rating', icon: Clock },
  { value: '2min', label: 'Quick Booking', icon: Zap },
]

const SERVICES_MARQUEE = [
  'Exterior Wash',
  'Interior Detailing',
  'Sofa Cleaning',
  'Water Tank',
  'Ceramic Coating',
]

const BG_IMAGE =
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop'

const WHATSAPP_URL =
  'https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash'

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const TAGLINE = 'The Shine That Finds You'

/* ─── Memoized Subcomponents ─── */
const PulsingDot = memo(function PulsingDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
      <span className="relative inline-flex rounded-full h-full w-full bg-white" />
    </span>
  )
})

const ServicesMarquee = memo(function ServicesMarquee() {
  const doubled = useMemo(() => [...SERVICES_MARQUEE, ...SERVICES_MARQUEE], [])
  
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div 
        className="inline-flex gap-6 lg:gap-8 animate-marquee"
        style={{ willChange: 'transform' }}
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
      </div>
    </div>
  )
})

const StatCard = memo(function StatCard({ stat, index, variant = 'mobile' }) {
  const Icon = stat.icon
  
  if (variant === 'mobile') {
    return (
      <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
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
      </div>
    )
  }
  
  return (
    <div className="group flex-1 px-4 lg:px-5 py-3 lg:py-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300">
      <div className="flex items-center gap-2 mb-2 lg:mb-3">
        <Icon size={12} className="text-white/25" strokeWidth={1.5} />
        {variant === 'desktop' && <div className="w-3 h-px bg-white/10" />}
      </div>
      <p
        className="text-white leading-none mb-1"
        style={{
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: variant === 'desktop' ? 'clamp(1.1rem, 2vw, 1.4rem)' : '18px',
        }}
      >
        {stat.value}
      </p>
      <p
        className="text-white/25 tracking-[0.12em] lg:tracking-[0.15em] uppercase"
        style={{ fontSize: '7px', fontFamily: SANS }}
      >
        {stat.label}
      </p>
    </div>
  )
})

// Logo component without water drop
const Logo = memo(function Logo({ size = 'default' }) {
  const sizes = {
    small: { fontSize: '10px', tracking: '0.2em' },
    default: { fontSize: '11px', tracking: '0.25em' },
    large: { fontSize: '12px', tracking: '0.3em' },
  }
  
  const s = sizes[size] || sizes.default
  
  return (
    <span
      className="text-white/40 tracking-[0.2em] uppercase font-medium"
      style={{ fontSize: s.fontSize, fontFamily: SANS, letterSpacing: s.tracking }}
    >
      Wash<span className="text-white/60">2</span>Door
    </span>
  )
})

function useGreeting() {
  const [greeting, setGreeting] = useState('Welcome')
  
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])
  
  return greeting
}

const Background = memo(function Background({ scrollYProgress }) {
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6])
  
  return (
    <motion.div 
      className="absolute inset-0 will-change-opacity" 
      style={{ opacity: bgOpacity }}
    >
      <img
        src={BG_IMAGE}
        alt=""
        role="presentation"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ 
          filter: 'brightness(0.3) contrast(1.1) saturate(0.7)',
          willChange: 'auto'
        }}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </motion.div>
  )
})

const Overlays = memo(function Overlays() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
      <div 
        className="absolute inset-0 opacity-[0.03] bg-noise"
        style={{ backgroundSize: '150px 150px' }}
      />
    </div>
  )
})

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -10 },
  visible: (delay) => ({
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.6 }
  })
}

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 }
  }
}

/* ─── Main Component ─── */
export default function Hero() {
  const sectionRef = useRef(null)
  const greeting = useGreeting()
  const [isVisible, setIsVisible] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100svh] overflow-hidden bg-black"
      aria-label="Hero section"
    >
      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
          .animate-ping {
            animation: none;
          }
        }
      `}</style>

      <Background scrollYProgress={scrollYProgress} />
      <Overlays />

      {/* ═══════════ MOBILE (< sm) ═══════════ */}
      <motion.div 
        className="relative z-10 min-h-[100svh] flex flex-col sm:hidden px-4 pt-4"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8 shrink-0"
          variants={fadeInLeft}
          custom={0.1}
        >
          <Logo size="small" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
            <PulsingDot />
            <span
              className="text-white/40 tracking-[0.12em] uppercase"
              style={{ fontSize: '7px', fontFamily: SANS }}
            >
              Open
            </span>
          </div>
        </motion.div>

        <div className="flex-1" />

        {/* Main Content */}
        <div className="pb-20">
          {/* Main Tagline */}
          <motion.div
            variants={fadeInLeft}
            custom={0.2}
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

          {/* Headline - Main Tagline */}
          <div className="mb-5">
            <motion.h1
              variants={fadeInUp}
              custom={0.3}
              className="text-white leading-[1] mb-1"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(2.5rem, 11vw, 4rem)',
                letterSpacing: '-0.03em',
              }}
            >
              The Shine
            </motion.h1>
            <motion.h1
              variants={fadeInUp}
              custom={0.4}
              className="text-white leading-[1] mb-1"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(2.5rem, 11vw, 4rem)',
                letterSpacing: '-0.03em',
              }}
            >
              That Finds
            </motion.h1>
            <motion.h1
              variants={fadeInUp}
              custom={0.5}
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
              You
            </motion.h1>
          </div>

          {/* Divider */}
          <motion.div
            variants={{
              hidden: { scaleX: 0 },
              visible: { 
                scaleX: 1, 
                transition: { delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            className="flex items-center gap-2 origin-left mb-4"
          >
            <div className="w-6 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </motion.div>

          <motion.p
            variants={fadeInUp}
            custom={0.7}
            className="text-white/40 leading-[1.6] mb-6"
            style={{
              fontSize: '13px',
              fontFamily: SANS,
              letterSpacing: '0.005em',
            }}
          >
            Premium doorstep car cleaning in Duliajan. Book in seconds — we bring everything.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            custom={0.8}
            className="flex flex-col gap-3 mb-8"
          >
            <a
              href="/services"
              className="group relative flex items-center justify-between px-5 h-14 bg-white rounded-xl overflow-hidden active:scale-[0.98] transition-transform duration-200"
            >
              <span
                className="tracking-[0.15em] uppercase text-black"
                style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 600 }}
              >
                Book Now
              </span>
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <ArrowRight size={14} className="text-white" />
              </div>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-14 rounded-xl border border-white/10 bg-white/[0.04] text-white/40 active:bg-white/10 transition-colors duration-200"
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

          {/* Stats */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-3 gap-2"
          >
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeInUp} custom={0.9 + i * 0.05}>
                <StatCard stat={stat} index={i} variant="mobile" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════ TABLET (sm - lg) ═══════════ */}
      <motion.div 
        className="relative z-10 min-h-[100svh] hidden sm:flex lg:hidden flex-col px-6 md:px-8 pt-6"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-12 shrink-0"
          variants={fadeInLeft}
          custom={0.1}
        >
          <div className="flex flex-col">
            <Logo size="default" />
            <span
              className="text-white/20 tracking-[0.15em] uppercase mt-1"
              style={{ fontSize: '6px', fontFamily: SANS }}
            >
              Duliajan, Assam
            </span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04]">
            <PulsingDot />
            <span
              className="text-white/40 tracking-[0.12em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS }}
            >
              Open · 9–5 PM
            </span>
          </div>
        </motion.div>

        <div className="flex-1" />

        {/* Main Content */}
        <div className="pb-20">
          {/* Tagline Badge */}
          <motion.div
            variants={fadeInLeft}
            custom={0.2}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-6 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <span
              className="text-white/40 tracking-[0.3em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS }}
            >
              {TAGLINE}
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mb-8">
            <motion.h1
              variants={fadeInUp}
              custom={0.3}
              className="text-white leading-[1]"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              The Shine That
            </motion.h1>

            <motion.h1
              variants={fadeInUp}
              custom={0.4}
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
              Finds You
            </motion.h1>
          </div>

          <motion.p
            variants={fadeInUp}
            custom={0.5}
            className="text-white/35 leading-[1.7] mb-8 max-w-[600px]"
            style={{ fontSize: '14px', fontFamily: SANS }}
          >
            Premium car cleaning that comes to you. Book in seconds — we arrive fully equipped.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            custom={0.6}
            className="flex gap-3 mb-12 max-w-[500px]"
          >
            <a
              href="/bookings"
              className="flex-1 flex items-center justify-between px-5 h-14 bg-white rounded-lg active:scale-[0.98] transition-transform duration-200"
            >
              <span
                className="tracking-[0.15em] uppercase text-black"
                style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 600 }}
              >
                Book Now
              </span>
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <ArrowRight size={14} className="text-white" />
              </div>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 h-14 rounded-lg border border-white/10 bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors duration-200"
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

          <motion.div variants={fadeInUp} custom={0.7} className="mb-4">
            <ServicesMarquee />
          </motion.div>

          <div className="w-full h-px bg-white/[0.06] mb-4" />

          {/* Stats */}
          <motion.div variants={stagger} className="flex gap-3">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeInUp} custom={0.8 + i * 0.05} className="flex-1">
                <StatCard stat={stat} index={i} variant="tablet" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════ DESKTOP (>= lg) ═══════════ */}
      <motion.div 
        className="relative z-10 min-h-[100svh] hidden lg:flex flex-col px-12 xl:px-16 2xl:px-24 py-8"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Top Bar */}
        <motion.div 
          className="flex items-center justify-between mb-16 shrink-0"
          variants={fadeInLeft}
          custom={0.1}
        >
          <div className="flex flex-col">
            <Logo size="large" />
            <span
              className="text-white/15 tracking-[0.15em] uppercase mt-1"
              style={{ fontSize: '7px', fontFamily: SANS }}
            >
              Duliajan, Assam
            </span>
          </div>

          <div className="flex items-center gap-4">
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
          </div>
        </motion.div>

        <div className="flex-1 min-h-[60px]" />

        {/* Main Content */}
        <div className="shrink-0 pb-6">
          {/* Tagline Badge */}
          <motion.div
            variants={fadeInLeft}
            custom={0.2}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-7 h-px bg-gradient-to-r from-white/30 to-transparent" />
            <span
              className="text-white/40 tracking-[0.3em] uppercase"
              style={{ fontSize: '8px', fontFamily: SANS }}
            >
              {TAGLINE}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </motion.div>

          {/* Headline + Right Column */}
          <div className="flex items-end justify-between gap-16 mb-16">
            <div className="shrink-0 max-w-[700px]">
              <motion.h1
                variants={fadeInUp}
                custom={0.3}
                className="text-white leading-[0.9]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: 'clamp(4rem, 7vw, 8rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                The Shine
              </motion.h1>
              <motion.h1
                variants={fadeInUp}
                custom={0.4}
                className="text-white leading-[0.9]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: 'clamp(4rem, 7vw, 8rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                That Finds
              </motion.h1>

              <motion.h1
                variants={fadeInUp}
                custom={0.5}
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
                You
              </motion.h1>
            </div>

            {/* Right Column */}
            <motion.div
              variants={fadeInUp}
              custom={0.6}
              className="shrink-0 w-[300px] xl:w-[340px] pb-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-px bg-gradient-to-r from-white/25 to-transparent" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
              </div>

              <p
                className="text-white/30 leading-[1.8] mb-8"
                style={{ fontSize: '13px', fontFamily: SANS }}
              >
                Premium car cleaning that comes to you. Book in seconds—we arrive fully equipped.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/bookings"
                  className="group relative flex items-center justify-between px-6 h-14 bg-white rounded-lg overflow-hidden hover:shadow-xl hover:shadow-white/10 transition-shadow duration-300"
                >
                  <span
                    className="tracking-[0.18em] uppercase text-black"
                    style={{ fontSize: '9px', fontFamily: SANS, fontWeight: 600 }}
                  >
                    Book Your Wash
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 h-12 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/35 hover:text-white/55 hover:border-white/15 transition-colors duration-300"
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
          <motion.div variants={fadeInUp} custom={0.75}>
            <div className="mb-5">
              <ServicesMarquee />
            </div>

            <div className="w-full h-px bg-white/[0.05] mb-5" />

            <div className="flex items-end justify-between gap-12">
              <div className="flex gap-4">
                {STATS.map((stat, i) => (
                  <StatCard key={stat.label} stat={stat} index={i} variant="desktop" />
                ))}
              </div>

              <nav className="flex gap-8" aria-label="Quick links">
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
              </nav>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
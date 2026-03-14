"use client"

import { useEffect, useRef, useCallback } from 'react'
import { ArrowUpRight, Phone } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────
const STATS = [
  { value: '100+', label: 'Cars Cleaned' },
  { value: '4.8★', label: 'Star Rating' },
  { value: '2hr', label: 'Avg Service' },
]

const HEADLINE_LINES = [
  { text: 'The Shine', italic: false },
  { text: 'That Finds', italic: true },
  { text: 'You.', italic: false },
]

const SERVICES = ['Car Wash', 'Sofa Cleaning', 'Water Tank']

const BG_IMAGE =
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop'

const WHATSAPP_URL =
  'https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash'

// ── Subcomponents ──────────────────────────────────────────

function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400" />
    </span>
  )
}

function StatusBadge({ label, className = '' }) {
  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-2 border border-white/10
                  rounded-full bg-white/[0.04] backdrop-blur-md ${className}`}
    >
      <PulsingDot />
      <span
        className="tracking-[0.2em] uppercase text-white/60"
        style={{ fontSize: '9px' }}
      >
        {label}
      </span>
    </div>
  )
}

function BookButton({ className = '' }) {
  return (
    <a
      href="/bookings"
      className={`group relative inline-flex items-center justify-center gap-3
                  px-8 py-4 border border-white/15 overflow-hidden rounded-[4px]
                  hover:border-white/30 active:scale-[0.97]
                  transition-all duration-300 ${className}`}
      aria-label="Book a car wash appointment"
    >
      <span
        className="absolute inset-0 bg-white origin-bottom scale-y-0
                   group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        aria-hidden="true"
      />
      <span
        className="relative z-10 tracking-[0.2em] uppercase text-white
                   group-hover:text-neutral-950 transition-colors duration-500"
        style={{ fontSize: '10.5px', fontWeight: 500 }}
      >
        Book Now
      </span>
      <ArrowUpRight
        size={14}
        strokeWidth={1.5}
        className="relative z-10 text-white group-hover:text-neutral-950
                   transition-all duration-500 group-hover:translate-x-0.5
                   group-hover:-translate-y-0.5"
      />
    </a>
  )
}

function WhatsAppLink({ className = '' }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2.5 py-3
                  text-white/30 hover:text-emerald-400
                  transition-colors duration-300 ${className}`}
      aria-label="Contact us on WhatsApp"
    >
      <Phone
        size={13}
        strokeWidth={1.5}
        className="group-hover:rotate-12 transition-transform duration-300"
      />
      <span
        className="tracking-[0.18em] uppercase"
        style={{ fontSize: '10px' }}
      >
        WhatsApp Us
      </span>
    </a>
  )
}

function StatItem({ value, label, align = 'left' }) {
  return (
    <div data-stat className={`opacity-0 ${align === 'right' ? 'text-right' : ''}`}>
      <p
        className="text-white leading-none"
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 300,
          fontSize: align === 'right' ? 'clamp(1.8rem, 3.5vw, 2.5rem)' : '24px',
        }}
      >
        {value}
      </p>
      <p
        className="tracking-[0.25em] uppercase text-white/25 mt-1.5"
        style={{ fontSize: '8px' }}
      >
        {label}
      </p>
    </div>
  )
}

// ── Headline ───────────────────────────────────────────────

function HeadlineBlock({ size = 'mobile', linesRef, startIndex = 0 }) {
  const fontSize =
    size === 'desktop'
      ? 'clamp(4.5rem, 10vw, 9rem)'
      : 'clamp(3rem, 14vw, 5rem)'

  return (
    <div className={size === 'desktop' ? 'mb-12 lg:mb-16' : 'mb-8'}>
      {HEADLINE_LINES.map(({ text, italic }, i) => (
        <div key={i} className="overflow-hidden">
          <h1
            ref={(el) => {
              linesRef.current[startIndex + i] = el
            }}
            className={`opacity-0 will-change-transform ${
              italic ? 'text-white/40 italic' : 'text-white'
            }`}
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize,
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
            }}
          >
            {text}
          </h1>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export default function Hero() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const linesRef = useRef([])
  const rightRef = useRef(null)
  const mobileContentRef = useRef(null)
  const mobileStatsRef = useRef(null)
  const desktopStatsRef = useRef(null)
  const accentRef = useRef(null)
  const dividerRef = useRef(null)
  const footerRef = useRef(null)
  const mobileHeaderRef = useRef(null)
  const desktopHeaderRef = useRef(null)

  const initAnimations = useCallback(async () => {
    const { default: gsap } = await import('gsap')
    if (!sectionRef.current) return

    return gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      })

      // Background reveal
      if (bgRef.current) {
        tl.fromTo(
          bgRef.current,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' },
          0
        )
      }

      // Headers
      ;[mobileHeaderRef, desktopHeaderRef].forEach((ref) => {
        if (ref.current) {
          tl.fromTo(
            ref.current,
            { opacity: 0, y: -15 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.2
          )
        }
      })

      // Accent line
      if (accentRef.current) {
        tl.fromTo(
          accentRef.current,
          { scaleY: 0 },
          { scaleY: 1, duration: 1.4, ease: 'power2.inOut' },
          0.2
        )
      }

      // Headline lines
      linesRef.current.forEach((line, i) => {
        if (line) {
          tl.fromTo(
            line,
            { opacity: 0, y: 70 },
            { opacity: 1, y: 0, duration: 1, ease: 'power4.out' },
            0.4 + i * 0.1
          )
        }
      })

      // Content blocks
      ;[rightRef, mobileContentRef].forEach((ref) => {
        if (ref.current) {
          tl.fromTo(
            ref.current,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.8 },
            0.9
          )
        }
      })

      // Divider
      if (dividerRef.current) {
        tl.fromTo(
          dividerRef.current,
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 1, ease: 'power2.inOut' },
          1.0
        )
      }

      // Stats
      ;[mobileStatsRef, desktopStatsRef].forEach((ref) => {
        if (ref.current) {
          tl.fromTo(
            ref.current.querySelectorAll('[data-stat]'),
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
            1.1
          )
        }
      })

      // Footer
      if (footerRef.current) {
        tl.fromTo(
          footerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          1.3
        )
      }
    })
  }, [])

  useEffect(() => {
    let ctx
    initAnimations().then((c) => {
      ctx = c
    })
    return () => ctx?.revert()
  }, [initAnimations])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden bg-neutral-950"
      aria-label="Hero section"
    >
      {/* ── Background Image ── */}
      <div ref={bgRef} className="absolute inset-0 opacity-0 will-change-transform">
        <img
          src={BG_IMAGE}
          alt=""
          role="presentation"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.32) contrast(1.1) saturate(0.8)' }}
          loading="eager"
        />
      </div>

      {/* ── Gradient Overlays ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/25 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-neutral-950/60 to-transparent" />
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Left Accent Line (Desktop) ── */}
      <div
        ref={accentRef}
        className="absolute left-0 top-0 w-px h-full origin-top hidden md:block"
        style={{
          background:
            'linear-gradient(to bottom, transparent 8%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.12) 75%, transparent 92%)',
        }}
        aria-hidden="true"
      />

      {/* ── Watermark ── */}
      <div
        className="absolute -right-4 -bottom-6 select-none pointer-events-none hidden lg:block"
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 300,
          fontSize: '20vw',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.018)',
          letterSpacing: '-0.04em',
        }}
        aria-hidden="true"
      >
        W2D
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE LAYOUT
      ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 min-h-screen flex flex-col md:hidden px-5 py-6">
        {/* Top bar */}
        <header
          ref={mobileHeaderRef}
          className="flex items-center justify-between mb-auto opacity-0"
        >
          <span
            className="tracking-[0.3em] uppercase text-white/45"
            style={{ fontFamily: 'Georgia, serif', fontSize: '9px' }}
          >
            Duliajan
          </span>
          <StatusBadge label="Open · 9–5" />
        </header>

        {/* Content — bottom aligned */}
        <div className="mt-auto">
          <HeadlineBlock size="mobile" linesRef={linesRef} startIndex={0} />

          {/* Description + CTAs */}
          <div ref={mobileContentRef} className="opacity-0">
            <p
              className="text-white/30 leading-[1.75] mb-7 max-w-[280px]"
              style={{ fontSize: '12px', letterSpacing: '0.04em' }}
            >
              Professional car &amp; home cleaning at your doorstep —
              fast, safe &amp; hassle-free.
            </p>

            <div className="flex flex-col gap-3">
              <BookButton className="min-h-[52px] justify-center" />
              <WhatsAppLink className="justify-center py-3.5" />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <div ref={mobileStatsRef} className="flex justify-between">
              {STATS.map((stat, i) => (
                <StatItem key={i} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          DESKTOP LAYOUT
      ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 min-h-screen hidden md:flex flex-col px-14 lg:px-20 xl:px-24 py-10">
        {/* Top bar */}
        <header
          ref={desktopHeaderRef}
          className="flex items-center justify-between opacity-0"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-px bg-white/25" aria-hidden="true" />
            <span
              className="tracking-[0.3em] uppercase text-white/45"
              style={{ fontFamily: 'Georgia, serif', fontSize: '11px' }}
            >
              Doorstep Car Care · Duliajan
            </span>
          </div>
          <StatusBadge label="Open · 9AM – 5PM" />
        </header>

        {/* Main content — vertically centered */}
        <div className="flex-1 flex items-center">
          <div className="w-full">
            <HeadlineBlock size="desktop" linesRef={linesRef} startIndex={3} />

            {/* Bottom row */}
            <div ref={rightRef} className="opacity-0">
              <div className="flex items-end justify-between gap-16">
                {/* Left: description + CTAs */}
                <div className="flex items-end gap-10 lg:gap-14">
                  <div
                    className="w-px h-24 bg-gradient-to-b from-white/15 to-transparent
                               shrink-0 hidden lg:block"
                    aria-hidden="true"
                  />
                  <div>
                    <p
                      className="tracking-[0.15em] uppercase text-white/30
                                 leading-[1.95] mb-7 max-w-sm"
                      style={{ fontSize: '11px' }}
                    >
                      Professional car &amp; home cleaning at your doorstep —
                      fast, safe &amp; hassle-free.
                    </p>
                    <div className="flex items-center gap-5">
                      <BookButton />
                      <WhatsAppLink />
                    </div>
                  </div>
                </div>

                {/* Right: stats */}
                <div
                  ref={desktopStatsRef}
                  className="flex items-end gap-10 lg:gap-14 shrink-0"
                >
                  {STATS.map((stat, i) => (
                    <StatItem
                      key={i}
                      value={stat.value}
                      label={stat.label}
                      align="right"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <footer className="mt-auto pt-6">
          <div
            ref={dividerRef}
            className="w-full h-px bg-white/[0.08] mb-5 origin-left"
            aria-hidden="true"
          />
          <div
            ref={footerRef}
            className="opacity-0 flex items-center justify-between"
          >
            <nav
              className="flex items-center gap-8"
              aria-label="Quick service links"
            >
              {SERVICES.map((service, i) => (
                <a
                  key={i}
                  href="/Services"
                  className="tracking-[0.2em] uppercase text-white/20
                             hover:text-white/50 transition-colors duration-300"
                  style={{ fontSize: '9px' }}
                >
                  {service}
                </a>
              ))}
            </nav>

            <a
              href="/Services"
              className="flex items-center gap-3 text-white/25 hover:text-white/60
                         transition-colors duration-300 group"
            >
              <span
                className="tracking-[0.25em] uppercase"
                style={{ fontSize: '9px' }}
              >
                All Services
              </span>
              <span
                className="h-px bg-current w-5 group-hover:w-10
                           transition-all duration-300"
                aria-hidden="true"
              />
            </a>
          </div>
        </footer>
      </div>
    </section>
  )
}
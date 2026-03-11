"use client"

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'

const stats = [
  { value: '100+', label: 'Cars Cleaned' },
  { value: '4.8★', label: 'Star Rating'  },
  { value: '2hr',  label: 'Avg Service'  },
]

const BG_IMAGE = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=90&w=2070&auto=format&fit=crop'


export default function Hero() {
  const r = {
    img:     useRef(null),
    num:     useRef(null),
    eyebrow: useRef(null),
    h1a:     useRef(null),
    h1b:     useRef(null),
    h1c:     useRef(null),
    rule:    useRef(null),
    body:    useRef(null),
    cta:     useRef(null),
    stats:   useRef(null),
    badge:   useRef(null),
    ticker:  useRef(null),
  }

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl
      .fromTo(r.img.current,
        { opacity: 0, scale: 1.07 },
        { opacity: 1, scale: 1, duration: 1.6 }, 0)

      .fromTo(r.eyebrow.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.55 }, 0.55)

      .fromTo([r.h1a.current, r.h1b.current, r.h1c.current],
        { opacity: 0, y: 60, skewY: 4 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.85, stagger: 0.13 }, 0.7)

      .fromTo(r.rule.current,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 0.7 }, 1.1)

      .fromTo([r.body.current, r.cta.current],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 1.25)

      .fromTo(Array.from(r.stats.current.children),
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.09 }, 1.45)

      .fromTo(r.badge.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.5 }, 1.0)

      .fromTo(r.num.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2 }, 0.4)

    // subtle parallax on scroll
    const onScroll = () => {
      const y = window.scrollY
      if (r.img.current) {
        gsap.set(r.img.current, { y: y * 0.25 })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      className="relative w-full h-[100svh] min-h-[660px] overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >

      {/* ── background image with parallax ── */}
      <div ref={r.img} className="absolute inset-0 opacity-0 will-change-transform">
        <img
          src={BG_IMAGE}
          alt="Premium car detailing"
          className="w-full h-[115%] object-cover object-center -top-[7.5%] absolute"
          style={{ filter: 'brightness(0.38) contrast(1.12) saturate(0.9)' }}
        />
        {/* bottom fade for stats readability */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        {/* top fade for badge */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* ── ghost watermark ── */}
      <div
        ref={r.num}
        className="absolute -bottom-10 -right-6 select-none pointer-events-none opacity-0"
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 300,
          fontSize: 'clamp(160px, 26vw, 320px)',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.035)',
          letterSpacing: '-0.04em',
        }}
      >
        W2D
      </div>

      {/* ── content ── */}
      <div className="relative z-10 h-full grid grid-rows-[auto_1fr_auto] px-8 md:px-16 lg:px-24 pt-10 pb-9">

        {/* ROW 1 — top bar */}
        <div className="flex items-center justify-between">
          <div ref={r.eyebrow} className="flex items-center gap-3 opacity-0">
            <span className="block w-5 h-px bg-white/40" />
            <span
              className="text-[9px] tracking-[0.4em] uppercase text-white/45"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Doorstep Car Care · Duliajan
            </span>
          </div>

          <div
            ref={r.badge}
            className="opacity-0 flex items-center gap-2 border border-white/20 px-4 py-2 backdrop-blur-md bg-white/[0.06]"
          >
            {/* live dot */}
            <span className="block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] tracking-[0.26em] uppercase text-white/70">
              Open · 9AM – 5PM
            </span>
          </div>
        </div>

        {/* ROW 2 — headline + body/cta */}
        <div className="flex flex-col justify-center md:flex-row md:items-end md:justify-between gap-8 md:gap-16 py-8">

          {/* headline */}
          <div className="flex-1 max-w-4xl">
            <div className="overflow-hidden">
              <h1 ref={r.h1a} className="opacity-0 text-white leading-[0.92] tracking-[-0.025em]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300, fontSize: 'clamp(3rem, 8.5vw, 8.5rem)' }}>
                The Shine
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 ref={r.h1b} className="opacity-0 italic leading-[0.92] tracking-[-0.025em]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300, fontSize: 'clamp(3rem, 8.5vw, 8.5rem)', color: 'rgba(255,255,255,0.55)' }}>
                That Finds
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 ref={r.h1c} className="opacity-0 text-white leading-[0.92] tracking-[-0.025em]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300, fontSize: 'clamp(3rem, 8.5vw, 8.5rem)' }}>
                You.
              </h1>
            </div>
          </div>

          {/* right col */}
          <div className="flex flex-col gap-7 md:max-w-[240px] shrink-0 md:pb-2">

            {/* rule */}
            <div ref={r.rule} className="w-full h-px bg-white/20 opacity-0" style={{ opacity: 1 }} />

            <p ref={r.body}
              className="opacity-0 text-[10.5px] tracking-[0.18em] leading-[1.9] uppercase text-white/45"
            >
              Professional car &amp; home<br />
              cleaning at your doorstep —<br />
              fast, safe &amp; hassle-free.
            </p>

            <a
              ref={r.cta}
              href="https://wash2door.in/bookin/"
              className="opacity-0 relative self-start flex items-center gap-3 text-[10px] tracking-[0.22em]
                         uppercase text-white border border-white/30 px-7 py-3.5
                         no-underline overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Book Now</span>
              <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
            </a>
          </div>
        </div>

        {/* ROW 3 — bottom: divider + stats + services link */}
        <div>
          <div className="w-full h-px bg-white/12 mb-6" />
          <div ref={r.stats} className="flex items-end gap-10 md:gap-16">
            {stats.map((s, i) => (
              <div key={i} className="opacity-0">
                <p className="text-white leading-none"
                  style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', letterSpacing: '0.01em' }}>
                  {s.value}
                </p>
                <p className="text-[8px] tracking-[0.28em] uppercase text-white/38 mt-1.5">{s.label}</p>
              </div>
            ))}

            <a
              href="https://wash2door.in/services/"
              className="ml-auto hidden md:flex items-center gap-3 text-[9px] tracking-[0.28em] uppercase
                         text-white/40 no-underline hover:text-white transition-colors duration-300 group pb-1"
            >
              All Services
              <span className="block h-px bg-white/30 w-5 group-hover:w-10 transition-all duration-400" />
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
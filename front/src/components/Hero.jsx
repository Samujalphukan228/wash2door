"use client"

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight, Phone } from 'lucide-react'

const stats = [
  { value: '100+', label: 'Cars Cleaned' },
  { value: '4.8★', label: 'Star Rating' },
  { value: '2hr', label: 'Avg Service' },
]

const BG_IMAGE =
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop'

export default function Hero() {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)
  const overlayRef = useRef(null)
  const numRef = useRef(null)
  const eyebrowRef = useRef(null)
  const h1aRef = useRef(null)
  const h1bRef = useRef(null)
  const h1cRef = useRef(null)
  const ruleRef = useRef(null)
  const bodyRef = useRef(null)
  const ctaRef = useRef(null)
  const ctaWARef = useRef(null)
  const statsRef = useRef(null)
  const badgeRef = useRef(null)
  const accentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl
        .fromTo(imgRef.current,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 0)

        .fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1 }, 0.2)

        .fromTo(accentRef.current,
          { scaleY: 0, transformOrigin: 'top' },
          { scaleY: 1, duration: 1, ease: 'power2.inOut' }, 0.2)

        .fromTo(eyebrowRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6 }, 0.4)

        .fromTo(badgeRef.current,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.5 }, 0.5)

        .fromTo([h1aRef.current, h1bRef.current, h1cRef.current],
          { opacity: 0, y: 60, skewY: 3 },
          { opacity: 1, y: 0, skewY: 0, duration: 0.9, stagger: 0.12 }, 0.6)

        .fromTo(ruleRef.current,
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 1)

        .fromTo(bodyRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }, 1.1)

        .fromTo([ctaRef.current, ctaWARef.current],
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 1.2)

        .fromTo(statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 1.3)

        .fromTo(numRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2 }, 0.5)

    }, wrapRef)

    return () => ctx.revert()
  }, [])

  // Parallax on scroll (desktop only)
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 768) return
      const y = window.scrollY
      if (imgRef.current && y < window.innerHeight) {
        gsap.set(imgRef.current, { y: y * 0.2 })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={wrapRef}
      className="relative w-full overflow-hidden bg-[#080808]"
      style={{ minHeight: '100svh' }}
    >
      {/* Background Image */}
      <div
        ref={imgRef}
        className="absolute inset-0 opacity-0 will-change-transform"
        style={{ height: '120%', top: '-10%' }}
      >
        <img
          src={BG_IMAGE}
          alt="Premium car detailing"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.35) contrast(1.15) saturate(0.8)' }}
        />
      </div>

      {/* Gradient Overlays */}
      <div ref={overlayRef} className="absolute inset-0 opacity-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080808]/60 to-transparent" />
      </div>

      {/* Left Accent Line */}
      <div
        ref={accentRef}
        className="absolute left-0 top-0 w-[2px] md:w-[3px] h-full opacity-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.25) 70%, transparent 95%)',
        }}
      />

      {/* Watermark - Better responsive sizing */}
      <div
        ref={numRef}
        className="absolute select-none pointer-events-none opacity-0 -right-2 sm:-right-4 md:-right-6 -bottom-4 sm:-bottom-6 md:-bottom-8"
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 300,
          fontSize: 'clamp(80px, 18vw + 20px, 280px)',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.022)',
          letterSpacing: '-0.04em',
        }}
      >
        W2D
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100svh]">
        
        {/* Container with better responsive padding */}
        <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 py-5 sm:py-8 md:py-10">
          
          {/* Top Bar */}
          <header className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            {/* Eyebrow */}
            <div ref={eyebrowRef} className="flex items-center gap-2 sm:gap-3 opacity-0">
              <span className="hidden sm:block w-4 md:w-5 h-px bg-white/30" />
              <span
                className="uppercase text-white/45"
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(7px, 0.65vw + 5px, 10px)',
                  letterSpacing: 'clamp(0.25em, 0.02vw + 0.3em, 0.4em)',
                }}
              >
                <span className="hidden sm:inline">Doorstep Car Care · </span>Duliajan
              </span>
            </div>

            {/* Badge */}
            <div
              ref={badgeRef}
              className="opacity-0 flex items-center gap-2 border border-white/12 backdrop-blur-md rounded-full"
              style={{ 
                background: 'rgba(255,255,255,0.04)',
                padding: 'clamp(6px, 0.5vw + 4px, 12px) clamp(10px, 1vw + 8px, 20px)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-full w-full bg-green-400" />
              </span>
              <span 
                className="uppercase text-white/60"
                style={{ 
                  fontSize: 'clamp(7px, 0.6vw + 5px, 10px)',
                  letterSpacing: 'clamp(0.15em, 0.01vw + 0.18em, 0.25em)',
                }}
              >
                <span className="hidden sm:inline">Open · </span>9AM – 5PM
              </span>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
            
            {/* Headlines - Better responsive */}
            <div className="flex-1 max-w-5xl">
              <div className="overflow-hidden">
                <h1
                  ref={h1aRef}
                  className="opacity-0 text-white/95"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(2.5rem, 6vw + 1rem, 8rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.025em',
                  }}
                >
                  The Shine
                </h1>
              </div>
              <div className="overflow-hidden">
                <h1
                  ref={h1bRef}
                  className="opacity-0 italic text-white/45"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(2.5rem, 6vw + 1rem, 8rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.025em',
                  }}
                >
                  That Finds
                </h1>
              </div>
              <div className="overflow-hidden">
                <h1
                  ref={h1cRef}
                  className="opacity-0 text-white/95"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(2.5rem, 6vw + 1rem, 8rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.025em',
                  }}
                >
                  You.
                </h1>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full lg:w-auto lg:max-w-[240px] xl:max-w-[280px] shrink-0 lg:pb-1">
              
              {/* Divider */}
              <div
                ref={ruleRef}
                className="w-full h-px"
                style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.25), transparent)' }}
              />

              {/* Body */}
              <p
                ref={bodyRef}
                className="opacity-0 uppercase text-white/40 leading-relaxed sm:leading-loose"
                style={{
                  fontSize: 'clamp(8px, 0.7vw + 6px, 11px)',
                  letterSpacing: 'clamp(0.12em, 0.01vw + 0.14em, 0.18em)',
                }}
              >
                Professional car &amp; home
                <br />
                cleaning at your doorstep —
                <br />
                fast, safe &amp; hassle-free.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3 pt-1">
                
                {/* Primary CTA */}
                <a
                  ref={ctaRef}
                  href="https://wash2door.in/bookin/"
                  className="group opacity-0 relative inline-flex items-center justify-center gap-2 sm:gap-2.5 
                           border border-white/25 overflow-hidden transition-all duration-300
                           hover:border-white/40 active:scale-[0.98]"
                  style={{
                    padding: 'clamp(10px, 1vw + 8px, 16px) clamp(18px, 2vw + 14px, 32px)',
                  }}
                >
                  <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                  <span 
                    className="relative z-10 text-white group-hover:text-black transition-colors duration-500 uppercase"
                    style={{
                      fontSize: 'clamp(8px, 0.7vw + 6px, 11px)',
                      letterSpacing: 'clamp(0.15em, 0.01vw + 0.18em, 0.22em)',
                    }}
                  >
                    Book Now
                  </span>
                  <ArrowUpRight
                    className="relative z-10 text-white group-hover:text-black transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ 
                      width: 'clamp(11px, 1vw + 9px, 14px)',
                      height: 'clamp(11px, 1vw + 9px, 14px)',
                      strokeWidth: 1.8,
                    }}
                  />
                </a>

                {/* WhatsApp CTA */}
                <a
                  ref={ctaWARef}
                  href="https://wa.me/919876543210?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"
                  className="group opacity-0 inline-flex items-center justify-center sm:justify-start gap-2 text-white/35 
                           hover:text-green-400/90 transition-colors duration-300 uppercase"
                  style={{
                    fontSize: 'clamp(7.5px, 0.65vw + 5.5px, 10px)',
                    letterSpacing: 'clamp(0.14em, 0.01vw + 0.16em, 0.2em)',
                  }}
                >
                  <Phone 
                    className="transition-transform duration-300 group-hover:rotate-12"
                    style={{ 
                      width: 'clamp(10px, 0.9vw + 8px, 13px)',
                      height: 'clamp(10px, 0.9vw + 8px, 13px)',
                      strokeWidth: 1.5,
                    }}
                  />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <footer className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
            <div className="w-full h-px mb-4 sm:mb-5 md:mb-6 bg-white/10" />
            
            <div 
              ref={statsRef} 
              className="flex items-end flex-wrap gap-5 sm:gap-8 md:gap-10 lg:gap-14"
            >
              {stats.map((s, i) => (
                <div key={i} className="opacity-0 shrink-0">
                  <p
                    className="text-white leading-none"
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontWeight: 300,
                      fontSize: 'clamp(1.25rem, 2vw + 0.5rem, 2.25rem)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {s.value}
                  </p>
                  <p 
                    className="uppercase text-white/30 mt-1 sm:mt-1.5"
                    style={{
                      fontSize: 'clamp(6.5px, 0.6vw + 5px, 9px)',
                      letterSpacing: 'clamp(0.2em, 0.01vw + 0.22em, 0.28em)',
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}

              {/* Services link - desktop */}
              <a
                href="https://wash2door.in/services/"
                className="hidden md:flex items-center gap-2.5 lg:gap-3 text-white/30 hover:text-white/80 transition-colors duration-300 ml-auto group uppercase"
                style={{
                  fontSize: 'clamp(7.5px, 0.65vw + 6px, 9.5px)',
                  letterSpacing: 'clamp(0.2em, 0.01vw + 0.22em, 0.28em)',
                }}
              >
                All Services
                <span className="h-px bg-current w-4 lg:w-5 group-hover:w-7 lg:group-hover:w-8 transition-all duration-300" />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </section>
  )
}
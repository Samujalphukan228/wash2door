"use client"

import { useEffect, useRef } from 'react'
import { ArrowUpRight, Phone, Clock } from 'lucide-react'

export default function CTABanner() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const trigger = sectionRef.current
      if (!trigger) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger, start: 'top 80%' },
          defaults: { ease: 'power3.out' },
        })
        tl.fromTo(contentRef.current, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8 })
          .fromTo(imageRef.current, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1 }, 0.2)
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-black py-20 md:py-0"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* ── Content ── */}
          <div ref={contentRef} className="opacity-0 py-8 md:py-24">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-6 h-px bg-white/30 shrink-0" />
              <span
                className="tracking-[0.4em] uppercase text-white/50"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(9px, 2.2vw, 11px)',
                }}
              >
                Get Started Today
              </span>
            </div>

            {/* Heading */}
            <h2
              className="text-white mb-6"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Ready for a Spotless Car?
            </h2>

            {/* Description */}
            <p
              className="tracking-[0.15em] leading-7 uppercase text-white/50 mb-10 max-w-md"
              style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
            >
              Book your professional car wash in under 2 minutes. We come to you — anytime, anywhere.
            </p>

            {/* Info Pills */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-[3px]">
                <Clock size={13} strokeWidth={1.5} className="text-white/50 shrink-0" />
                <span
                  className="tracking-[0.2em] uppercase text-white/70"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  Open 8 AM – 6 PM
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-[3px]">
                <Phone size={13} strokeWidth={1.5} className="text-white/50 shrink-0" />
                <span
                  className="tracking-[0.2em] uppercase text-white/70"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  6900706456
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href="/Bookings"
                className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                           text-black bg-white border border-white px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
                style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
              >
                <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-500">Book Now</span>
                <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-white transition-colors duration-500" />
              </a>

              <a
                href="tel:6900706456"
                className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                           text-white border border-white/30 px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
                style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
              >
                <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">Call Us</span>
                <Phone size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
              </a>
            </div>
          </div>

          {/* ── Image ── */}
          <div
            ref={imageRef}
            className="opacity-0 relative h-64 md:h-full md:min-h-[500px] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"
              alt="Professional car wash"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent md:from-black md:via-black/20 md:to-transparent" />

            {/* Floating Badge */}
            <div className="absolute bottom-6 right-6 bg-white px-5 py-4 rounded-[3px]">
              <p
                className="text-black leading-none mb-1"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(20px, 5vw, 30px)',
                }}
              >
                ₹299
              </p>
              <p
                className="tracking-[0.25em] uppercase text-gray-500"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                Starting Price
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
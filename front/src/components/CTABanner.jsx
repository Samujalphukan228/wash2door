// components/CTABanner.jsx
"use client"

import { useEffect, useRef } from 'react'
import { ArrowRight, Phone, Clock, MapPin } from 'lucide-react'

export default function CTABanner() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!sectionRef.current) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
          }
        )

        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current.querySelectorAll('[data-animate]'),
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
            }
          )
        }
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-8 md:py-16 opacity-0"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        {/* ═══ MOBILE ═══ */}
        <div className="md:hidden">
          <div
            ref={contentRef}
            className="relative overflow-hidden rounded-3xl bg-black"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"
                alt="Professional car wash"
                className="w-full h-full object-cover opacity-40"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 pt-8 pb-8">
              {/* Badge */}
              <div data-animate className="mb-6">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 
                             bg-white/10 border border-white/10 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/70" style={{ fontSize: '11px' }}>
                    Available Today
                  </span>
                </span>
              </div>

              {/* Heading */}
              <h2
                data-animate
                className="text-white mb-4"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: '32px',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                Ready for a<br />Spotless Ride?
              </h2>

              {/* Description */}
              <p
                data-animate
                className="text-white/50 leading-relaxed mb-6 max-w-xs"
                style={{ fontSize: '14px' }}
              >
                Book in under 2 minutes. We come to you — home, office, anywhere.
              </p>

              {/* Info Row */}
              <div data-animate className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: Clock, text: '9AM – 5PM' },
                  { icon: MapPin, text: 'Duliajan' },
                  { icon: Phone, text: '6900706456' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 
                                 bg-white/5 border border-white/10 rounded-full"
                    >
                      <Icon size={12} className="text-white/40" />
                      <span className="text-white/60" style={{ fontSize: '11px' }}>
                        {item.text}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Price */}
              <div
                data-animate
                className="inline-block bg-white px-5 py-4 rounded-2xl mb-6"
              >
                <p className="text-gray-400 mb-1" style={{ fontSize: '11px' }}>
                  Starting from
                </p>
                <p
                  className="text-black"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: '28px',
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  ₹299
                </p>
              </div>

              {/* CTAs */}
              <div data-animate className="flex flex-col gap-3">
                <a
                  href="/bookings"
                  className="flex items-center justify-center gap-3 h-14
                             bg-white text-black rounded-full
                             active:scale-[0.97] transition-all duration-200 no-underline"
                >
                  <span
                    className="tracking-wider uppercase font-medium"
                    style={{ fontSize: '12px' }}
                  >
                    Book Now
                  </span>
                  <ArrowRight size={18} />
                </a>

                <a
                  href="tel:6900706456"
                  className="flex items-center justify-center gap-3 h-14
                             border border-white/20 text-white rounded-full
                             active:scale-[0.97] transition-all duration-200 no-underline"
                >
                  <Phone size={16} />
                  <span
                    className="tracking-wider uppercase"
                    style={{ fontSize: '12px' }}
                  >
                    Call Us
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ DESKTOP ═══ */}
        <div className="hidden md:block">
          <div className="relative overflow-hidden rounded-3xl bg-black">
            <div className="grid grid-cols-2">
              {/* Left: Content */}
              <div className="relative z-10 p-12 lg:p-16">
                {/* Badge */}
                <div className="mb-8">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 
                               bg-white/10 border border-white/10 rounded-full"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/70" style={{ fontSize: '12px' }}>
                      Available Today
                    </span>
                  </span>
                </div>

                {/* Heading */}
                <h2
                  className="text-white mb-6"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Ready for a<br />Spotless Ride?
                </h2>

                {/* Description */}
                <p
                  className="text-white/40 leading-relaxed mb-8 max-w-sm"
                  style={{ fontSize: '15px' }}
                >
                  Book your professional car wash in under 2 minutes.
                  We come to you — home, office, anywhere in Duliajan.
                </p>

                {/* Info Pills */}
                <div className="flex flex-wrap gap-3 mb-10">
                  {[
                    { icon: Clock, text: 'Open 9AM – 5PM' },
                    { icon: Phone, text: '6900706456' },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 px-4 py-2.5
                                   border border-white/15 rounded-full"
                      >
                        <Icon size={14} className="text-white/40" />
                        <span className="text-white/60" style={{ fontSize: '12px' }}>
                          {item.text}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* CTAs */}
                <div className="flex gap-4">
                  <a
                    href="/bookings"
                    className="group flex items-center gap-3 h-13 px-8
                               bg-white text-black rounded-full
                               hover:bg-gray-100 transition-all duration-300 no-underline"
                  >
                    <span
                      className="tracking-wider uppercase font-medium"
                      style={{ fontSize: '12px' }}
                    >
                      Book Now
                    </span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </a>

                  <a
                    href="tel:6900706456"
                    className="flex items-center gap-3 h-13 px-8
                               border border-white/20 text-white rounded-full
                               hover:bg-white/5 transition-all duration-300 no-underline"
                  >
                    <Phone size={16} />
                    <span
                      className="tracking-wider uppercase"
                      style={{ fontSize: '12px' }}
                    >
                      Call Us
                    </span>
                  </a>
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative min-h-[450px]">
                <img
                  src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"
                  alt="Professional car wash"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />

                {/* Price Badge */}
                <div className="absolute bottom-8 right-8 bg-white px-6 py-5 rounded-2xl">
                  <p className="text-gray-400 mb-1" style={{ fontSize: '11px' }}>
                    Starting from
                  </p>
                  <p
                    className="text-black"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: '32px',
                      fontWeight: 300,
                      lineHeight: 1,
                    }}
                  >
                    ₹299
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
"use client"

import { useEffect, useRef } from 'react'
import { ArrowUpRight, Shield, Leaf, Users, Star, Phone, Mail, MapPin } from 'lucide-react'

// ── Real data from wash2door.in/about-us ──
const WHY_US = [
  {
    icon: MapPin,
    title: 'Doorstep Service',
    desc: 'We come to you — at home, office, or anywhere in Duliajan. No travel, no waiting.',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    desc: 'We use safe, eco-friendly cleaning products that protect your vehicle and the environment.',
  },
  {
    icon: Users,
    title: 'Trusted Professionals',
    desc: 'Our trained staff deliver consistent, high-quality results with complete safety and hygiene.',
  },
  {
    icon: Star,
    title: 'Guaranteed Satisfaction',
    desc: 'Affordable pricing and results you can see. If you are not happy, we make it right.',
  },
]

const SERVICES = [
  { label: 'Car Wash',            href: 'https://wash2door.in/services/' },
  { label: 'Sofa Cleaning',       href: 'https://wash2door.in/services/' },
  { label: 'Water Tank Cleaning', href: 'https://wash2door.in/services/' },
]

// ── Reusable animated section heading (matches site pattern) ──
function SectionHeading({ eyebrow, heading, desc, eyebrowRef, headingRef, descRef, ruleRef }) {
  return (
    <div className="mb-16 md:mb-20">
      <div ref={eyebrowRef} className="flex items-center gap-3 mb-6 opacity-0">
        <span className="block w-6 h-px bg-black shrink-0" />
        <span
          className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        ref={headingRef}
        className="opacity-0 text-black mb-5"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: 'clamp(2rem, 4vw, 3.8rem)',
          lineHeight: 1.08,
          letterSpacing: '-0.01em',
        }}
      >
        {heading}
      </h2>
      {desc && (
        <p
          ref={descRef}
          className="opacity-0 tracking-[0.18em] leading-[1.9] uppercase text-gray-400 max-w-xl"
          style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
        >
          {desc}
        </p>
      )}
      <div ref={ruleRef} className="w-full h-px bg-gray-200 mt-8" />
    </div>
  )
}

function useHeadingAnim(eyebrowRef, headingRef, descRef, ruleRef) {
  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!headingRef.current) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
          defaults: { ease: 'power3.out' },
        })
        tl.fromTo(eyebrowRef.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        if (descRef?.current)
          tl.fromTo(descRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
        if (ruleRef?.current)
          tl.fromTo(ruleRef.current, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6 }, 0.4)
      })
    }
    init()
    return () => ctx?.revert()
  }, [])
}

// ── Hero ──
function Hero() {
  const headingRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      if (!headingRef.current) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.fromTo(lineRef.current, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.7 })
          .fromTo(headingRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 }, 0.2)
          .fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.5)
          .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-black pt-24 pb-32 md:pt-32 md:pb-40 relative overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Subtle background texture lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, white 60px, white 61px)',
        }}
      />

      <div className="max-w-6xl mx-auto px-8 md:px-16 relative z-10">
        <div ref={lineRef} className="w-12 h-px bg-white/30 mb-8" />

        <h1
          ref={headingRef}
          className="opacity-0 text-white mb-8"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            maxWidth: '820px',
          }}
        >
          Your Trusted Partner for Doorstep Cleaning
        </h1>

        <p
          ref={subRef}
          className="opacity-0 tracking-[0.18em] leading-[1.9] uppercase text-white/50 max-w-lg mb-12"
          style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
        >
          Car wash, sofa cleaning, and water tank cleaning — all at your doorstep in Duliajan, Assam.
        </p>

        <div ref={ctaRef} className="opacity-0 flex flex-wrap gap-4">
          <a
            href="https://wash2door.in/bookin/"
            className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                       text-black bg-white border border-white px-7 py-4 no-underline
                       overflow-hidden group rounded-[5px]"
            style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
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
            style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-500">Call Us</span>
            <Phone size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Who We Are ──
function WhoWeAre() {
  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const ruleRef = useRef(null)
  const contentRef = useRef(null)

  useHeadingAnim(eyebrowRef, headingRef, descRef, ruleRef)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!contentRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: contentRef.current, start: 'top 85%' } }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <SectionHeading
          eyebrow="Who We Are"
          heading="About Wash2Door"
          desc={null}
          eyebrowRef={eyebrowRef}
          headingRef={headingRef}
          descRef={descRef}
          ruleRef={ruleRef}
        />

        <div ref={contentRef} className="opacity-0 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left — main copy */}
          <div>
            <p
              className="tracking-[0.18em] leading-[2] uppercase text-gray-500 mb-8"
              style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
            >
              Welcome to Wash2Door — your trusted partner for professional cleaning services right at your doorstep.
            </p>
            <p
              className="tracking-[0.18em] leading-[2] uppercase text-gray-500 mb-8"
              style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
            >
              We provide a complete range of cleaning solutions, including car wash, sofa cleaning, and water tank cleaning — all delivered conveniently at your home. Our goal is to save your time while giving you top-quality cleaning with complete safety and hygiene.
            </p>
            <p
              className="tracking-[0.18em] leading-[2] uppercase text-gray-500"
              style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
            >
              At Wash2Door, we believe a clean environment means a happy life. Our trained professionals use eco-friendly products and modern techniques to ensure your car, sofa, and water tank are spotless, germ-free, and shining like new.
            </p>
          </div>

          {/* Right — pull quote + services */}
          <div>
            <blockquote
              className="border-l-2 border-black pl-8 mb-10"
            >
              <p
                className="text-black leading-[1.5]"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(18px, 3.5vw, 28px)',
                  letterSpacing: '-0.01em',
                }}
              >
                "You just book — we handle the rest."
              </p>
            </blockquote>

            <p
              className="tracking-[0.3em] uppercase text-gray-400 mb-4"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Our Services
            </p>
            <div className="flex flex-col">
              {SERVICES.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0
                             group no-underline hover:pl-2 transition-all duration-300"
                >
                  <span
                    className="tracking-[0.18em] uppercase text-black group-hover:opacity-60 transition-opacity duration-300"
                    style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
                  >
                    {s.label}
                  </span>
                  <ArrowUpRight size={13} strokeWidth={1.5} className="text-gray-300 group-hover:text-black transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Why Choose Us ──
function WhyUs() {
  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const ruleRef = useRef(null)
  const gridRef = useRef(null)

  useHeadingAnim(eyebrowRef, headingRef, descRef, ruleRef)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!gridRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <SectionHeading
          eyebrow="Our Promise"
          heading="Why Choose Wash2Door?"
          desc="We are built around one idea — your time is valuable. Everything we do is designed to make cleaning effortless for you."
          eyebrowRef={eyebrowRef}
          headingRef={headingRef}
          descRef={descRef}
          ruleRef={ruleRef}
        />

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {WHY_US.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="group flex flex-col border border-gray-200 p-6 md:p-7 bg-white
                           hover:border-black transition-all duration-500 rounded-[5px]
                           hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-6
                                group-hover:border-black transition-colors duration-500 shrink-0">
                  <Icon size={20} strokeWidth={1.2} className="text-gray-400 group-hover:text-black transition-colors duration-500" />
                </div>
                <h3
                  className="text-black mb-3 group-hover:opacity-70 transition-opacity duration-300"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(14px, 3vw, 17px)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="tracking-[0.18em] leading-[1.9] uppercase text-gray-400"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Contact CTA ──
function ContactCTA() {
  const ref = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!ref.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-black py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <div ref={ref} className="opacity-0">

          <div className="flex items-center gap-3 mb-8">
            <span className="block w-6 h-px bg-white/30 shrink-0" />
            <span
              className="tracking-[0.4em] uppercase text-white/50"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Get In Touch
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="flex-1">
              <h2
                className="text-white mb-6"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(2rem, 4vw, 3.8rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                }}
              >
                Ready to Book a Service?
              </h2>

              <div className="flex flex-col gap-4">
                <a
                  href="tel:6900706456"
                  className="flex items-center gap-3 no-underline group w-fit"
                >
                  <Phone size={13} strokeWidth={1.5} className="text-white/30 shrink-0" />
                  <span
                    className="tracking-[0.18em] uppercase text-white/60 group-hover:text-white transition-colors duration-300"
                    style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
                  >
                    +91 6900706456
                  </span>
                </a>
                <a
                  href="mailto:Wash2Door786602@gmail.com"
                  className="flex items-center gap-3 no-underline group w-fit"
                >
                  <Mail size={13} strokeWidth={1.5} className="text-white/30 shrink-0" />
                  <span
                    className="tracking-[0.18em] uppercase text-white/60 group-hover:text-white transition-colors duration-300"
                    style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
                  >
                    Wash2Door786602@gmail.com
                  </span>
                </a>
                <div className="flex items-center gap-3">
                  <MapPin size={13} strokeWidth={1.5} className="text-white/30 shrink-0" />
                  <span
                    className="tracking-[0.18em] uppercase text-white/40"
                    style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
                  >
                    Near Sonapur Namghar, Duliajan, Assam
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 md:mb-2">
              <a
                href="https://wash2door.in/bookin/"
                className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                           text-black bg-white border border-white px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-500">Book Now</span>
                <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-white transition-colors duration-500" />
              </a>
              <a
                href="https://wash2door.in/services/"
                className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                           text-white border border-white/30 px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">Our Services</span>
                <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Page ──
export default function AboutPage() {
  return (
    <main>
      <Hero />
      <WhoWeAre />
      <WhyUs />
      <ContactCTA />
    </main>
  )
}
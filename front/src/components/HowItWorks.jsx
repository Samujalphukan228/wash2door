"use client"

import { useEffect, useRef } from 'react'
import { ArrowUpRight, CalendarCheck, Car, MapPin, Sparkles } from 'lucide-react'

const STEPS = [
  {
    icon: Car,
    number: '01',
    title: 'Choose Service',
    description: 'Select from our range of professional cleaning services tailored to your needs.',
  },
  {
    icon: MapPin,
    number: '02',
    title: 'Enter Location',
    description: 'Tell us where you are. We come to your doorstep — home, office, or anywhere.',
  },
  {
    icon: CalendarCheck,
    number: '03',
    title: 'Pick Date & Time',
    description: 'Choose a slot that works for you. We offer flexible scheduling 7 days a week.',
  },
  {
    icon: Sparkles,
    number: '04',
    title: 'We Handle the Rest',
    description: 'Sit back and relax. Our experts arrive on time and deliver a spotless finish.',
  },
]

function StepCard({ step, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const el = cardRef.current
      if (!el) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: index * 0.12,
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [index])

  const Icon = step.icon

  return (
    <div
      ref={cardRef}
      className="opacity-0 group flex flex-col border border-gray-200 p-6 md:p-7 bg-white
                 hover:border-black transition-all duration-500 rounded-[5px]
                 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Top row: Icon + Number */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center
                        group-hover:border-black transition-colors duration-500 shrink-0">
          <Icon size={20} strokeWidth={1.2} className="text-gray-400 group-hover:text-black transition-colors duration-500" />
        </div>
        <span
          className="text-gray-300 group-hover:text-black transition-colors duration-500"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(9px, 1vw, 12px)',
            letterSpacing: '0.1em',
          }}
        >
          {step.number}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-black mb-3 group-hover:opacity-70 transition-opacity duration-300"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.4vw, 16px)',
          letterSpacing: '-0.01em',
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        className="tracking-[0.18em] leading-[1.9] uppercase text-gray-400"
        style={{ fontSize: 'clamp(8px, 0.9vw, 11px)' }}
      >
        {step.description}
      </p>
    </div>
  )
}

export default function HowItWorks() {
  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const ruleRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const trigger = headingRef.current
      if (!trigger) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger, start: 'top 85%' },
          defaults: { ease: 'power3.out' },
        })
        tl.fromTo(eyebrowRef.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
          .fromTo(descRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
          .fromTo(ruleRef.current, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6 }, 0.4)
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    // ✅ bg-white — matches Services and every other section
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">

        {/* ── Heading ── */}
        <div className="mb-16 md:mb-20">
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-6 opacity-0">
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(7px, 0.8vw, 9px)',
              }}
            >
              Simple Process
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
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
                How It Works
              </h2>
              <p
                ref={descRef}
                className="opacity-0 tracking-[0.18em] leading-[1.9] uppercase text-gray-400 max-w-md"
                style={{ fontSize: 'clamp(8px, 0.9vw, 11px)' }}
              >
                Book a professional car wash in under 2 minutes — we handle everything else.
              </p>
            </div>

            <a
              href="https://wash2door.in/bookin/"
              className="hidden md:flex items-center gap-3 tracking-[0.28em] uppercase
                         text-gray-400 no-underline hover:text-black transition-colors duration-300 group mb-2"
              style={{ fontSize: 'clamp(7px, 0.8vw, 9px)' }}
            >
              Get Started
              <span className="block h-px bg-gray-300 w-5 group-hover:w-10 group-hover:bg-black transition-all duration-300" />
            </a>
          </div>

          <div ref={ruleRef} className="w-full h-px bg-gray-200 mt-8" />
        </div>

        {/* ── Steps Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* ── Mobile CTA ── */}
        <div className="mt-12 flex md:hidden justify-center">
          <a
            href="https://wash2door.in/bookin/"
            className="relative flex items-center gap-3 tracking-[0.22em] uppercase
                       text-black border border-black px-7 py-3.5 no-underline
                       overflow-hidden group rounded-[5px]"
            style={{ fontSize: 'clamp(8px, 2.4vw, 10px)' }}
          >
            <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">
              Book Now
            </span>
            <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-white transition-colors duration-500" />
          </a>
        </div>

      </div>
    </section>
  )
}
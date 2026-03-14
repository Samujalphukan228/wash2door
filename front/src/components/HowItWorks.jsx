// components/HowItWorks.jsx
"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, CalendarCheck, Car, MapPin, Sparkles } from "lucide-react"

const STEPS = [
  {
    icon: Car,
    number: "01",
    title: "Choose Your Service",
    description: "Pick from exterior wash, interior detailing, sofa cleaning, and more.",
    color: "from-gray-900 to-black",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Share Your Location",
    description: "We come to you — home, office, parking lot. Anywhere in Duliajan.",
    color: "from-gray-800 to-gray-900",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Pick a Time Slot",
    description: "Flexible scheduling, 7 days a week. Morning, afternoon, or evening.",
    color: "from-gray-700 to-gray-800",
  },
  {
    icon: Sparkles,
    number: "04",
    title: "Sit Back & Relax",
    description: "Our experts arrive on time with everything needed. Spotless results guaranteed.",
    color: "from-gray-600 to-gray-700",
  },
]

/* ━━━ Step Item (new horizontal timeline design) ━━━ */
function TimelineStep({ step, index, isLast }) {
  const Icon = step.icon
  const ref = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!ref.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
            delay: index * 0.15,
            scrollTrigger: { trigger: ref.current, start: "top 90%" },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [index])

  return (
    <div ref={ref} className="opacity-0 group">
      {/* Number + connector */}
      <div className="flex items-center gap-0 mb-6 md:mb-8">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black flex items-center justify-center
                        shrink-0 group-hover:rounded-xl transition-all duration-500">
          <span
            className="text-white/60 group-hover:text-white transition-colors duration-300"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "18px",
              fontWeight: 300,
            }}
          >
            {step.number}
          </span>
        </div>
        {!isLast && (
          <div className="hidden md:block flex-1 h-px bg-gray-200 mx-4 group-hover:bg-black
                          transition-colors duration-500 origin-left" />
        )}
      </div>

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-black
                      flex items-center justify-center mb-4
                      transition-all duration-500">
        <Icon
          size={18}
          strokeWidth={1.3}
          className="text-gray-400 group-hover:text-white transition-colors duration-500"
        />
      </div>

      {/* Text */}
      <h3
        className="text-black mb-2.5 group-hover:translate-x-1 transition-transform duration-300"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontSize: "clamp(17px, 1.8vw, 22px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {step.title}
      </h3>
      <p
        className="text-gray-400 leading-relaxed"
        style={{ fontSize: "clamp(12px, 1.1vw, 14px)" }}
      >
        {step.description}
      </p>
    </div>
  )
}

/* ━━━ Mobile Cards (swipeable, stacked) ━━━ */
function MobileSteps() {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth * 0.85
      const newIndex = Math.round(scrollLeft / (cardWidth + 12))
      setActiveIndex(Math.min(newIndex, STEPS.length - 1))
    }
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!scrollRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          scrollRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: scrollRef.current, start: "top 88%" },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <div className="md:hidden -mx-5">
      <div
        ref={scrollRef}
        className="opacity-0 flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.number}
              className="shrink-0 w-[85vw] snap-center"
            >
              <div className={`rounded-3xl overflow-hidden bg-gradient-to-br ${step.color} p-6 pb-8 min-h-[260px] flex flex-col justify-between`}>
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-white/20"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "48px",
                      fontWeight: 300,
                      lineHeight: 1,
                    }}
                  >
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Icon size={22} strokeWidth={1.3} className="text-white/60" />
                  </div>
                </div>

                {/* Bottom */}
                <div>
                  <h3
                    className="text-white mb-2"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 300,
                      fontSize: "22px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-white/40 leading-relaxed" style={{ fontSize: "13px" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div className="shrink-0 w-4" />
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-8 bg-black" : "w-1.5 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ━━━ Main ━━━ */
export default function HowItWorks() {
  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!headingRef.current) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
          defaults: { ease: "power3.out" },
        })
        if (eyebrowRef.current) tl.fromTo(eyebrowRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 })
        tl.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9 }, 0.1)
        if (descRef.current) tl.fromTo(descRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!ctaRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: ctaRef.current, start: "top 92%" },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-white py-20 md:py-36 border-t border-gray-100"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-16">
        {/* Header */}
        <div className="mb-12 md:mb-20">
          <div ref={eyebrowRef} className="flex items-center gap-4 mb-5 md:mb-7 opacity-0">
            <span className="block w-10 h-[1px] bg-black" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{ fontFamily: "Georgia, serif", fontSize: "clamp(8px, 0.8vw, 10px)" }}
            >
              How It Works
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
            <div className="max-w-2xl">
              <h2
                ref={headingRef}
                className="opacity-0 text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 5vw, 4.5rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                }}
              >
                Four Simple Steps
              </h2>
              <p
                ref={descRef}
                className="opacity-0 text-gray-400 mt-4 md:mt-6 max-w-lg leading-relaxed"
                style={{ fontSize: "clamp(12px, 1.2vw, 15px)" }}
              >
                From booking to a spotless finish — the entire process takes under 2 minutes
                to schedule and a couple of hours to complete.
              </p>
            </div>

            {/* Desktop CTA */}
            <a
              href="/bookings"
              className="hidden md:inline-flex items-center gap-3 h-12 px-7 bg-black text-white
                         rounded-full tracking-[0.18em] uppercase hover:bg-gray-800
                         transition-colors duration-300 no-underline shrink-0"
              style={{ fontSize: "10px" }}
            >
              Get Started
              <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>
        </div>

        {/* ═══ Mobile: Card scroll ═══ */}
        <MobileSteps />

        {/* ═══ Desktop: Timeline grid ═══ */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <TimelineStep
              key={step.number}
              step={step}
              index={i}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div ref={ctaRef} className="opacity-0 mt-10 md:hidden">
          <a
            href="/bookings"
            className="w-full h-14 flex items-center justify-center gap-2.5
                       bg-black text-white rounded-full tracking-[0.2em] uppercase
                       active:scale-[0.97] transition-all duration-200 no-underline"
            style={{ fontSize: "10px" }}
          >
            <span>Book Now</span>
            <ArrowRight size={14} strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  )
}
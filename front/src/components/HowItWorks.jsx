"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { ArrowRight, CalendarCheck, Car, MapPin, Sparkles, Play } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const STEPS = [
  {
    icon: Car,
    number: "01",
    title: "Choose Your Service",
    description: "Pick from exterior wash, interior detailing, sofa cleaning, and more.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Share Your Location",
    description: "We come to you — home, office, parking lot. Anywhere in Duliajan.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Pick a Time Slot",
    description: "Flexible scheduling, 7 days a week. Morning, afternoon, or evening.",
  },
  {
    icon: Sparkles,
    number: "04",
    title: "Sit Back & Relax",
    description: "Our experts arrive on time with everything needed. Spotless results guaranteed.",
  },
]

const STATS = [
  { value: "2min", label: "To Book" },
  { value: "2hrs", label: "Avg Service" },
  { value: "100%", label: "Satisfaction" },
]

const ANIMATION_CONFIG = {
  header: { duration: 0.8, ease: "power3.out" },
  card: { duration: 0.9, stagger: 0.12, ease: "power4.out" },
  line: { duration: 1.2, ease: "power2.inOut" },
}

// ── Custom Hook: Scroll Animation ──────────────────────────
function useScrollAnimation(ref, config, deps = []) {
  useEffect(() => {
    if (!ref.current) return

    let ctx
    let observer

    const init = async () => {
      observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect()

            const { default: gsap } = await import("gsap")
            const { ScrollTrigger } = await import("gsap/ScrollTrigger")
            gsap.registerPlugin(ScrollTrigger)

            ctx = gsap.context(() => {
              config(gsap, ScrollTrigger)
            })
          }
        },
        { rootMargin: "50px" }
      )

      observer.observe(ref.current)
    }

    init()

    return () => {
      observer?.disconnect()
      ctx?.revert()
    }
  }, deps)
}

// ── Desktop: Timeline Step ─────────────────────────────────
const DesktopTimelineStep = memo(function DesktopTimelineStep({
  step,
  index,
  isLast,
  isActive,
  onHover,
}) {
  const Icon = step.icon
  const cardRef = useRef(null)
  const lineRef = useRef(null)

  useScrollAnimation(
    cardRef,
    (gsap, ScrollTrigger) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 88%",
          once: true,
        },
      })

      tl.fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: ANIMATION_CONFIG.card.duration,
          ease: ANIMATION_CONFIG.card.ease,
          delay: index * ANIMATION_CONFIG.card.stagger,
        }
      )

      if (lineRef.current) {
        tl.fromTo(
          lineRef.current,
          { scaleX: 0, transformOrigin: "left" },
          {
            scaleX: 1,
            duration: ANIMATION_CONFIG.line.duration,
            ease: ANIMATION_CONFIG.line.ease,
          },
          `-=${ANIMATION_CONFIG.card.duration * 0.6}`
        )
      }
    },
    [index]
  )

  return (
    <div
      ref={cardRef}
      className="opacity-0 relative group cursor-pointer"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          ref={lineRef}
          className={`absolute top-7 left-[56px] right-0 h-[2px] transition-colors duration-500
                      ${isActive ? "bg-black" : "bg-gray-100"}`}
          style={{ transform: "scaleX(0)" }}
          aria-hidden="true"
        />
      )}

      {/* Number circle */}
      <div
        className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center
                    mb-6 transition-all duration-500 border-2
                    ${isActive
            ? "bg-black border-transparent shadow-xl"
            : "bg-white border-gray-100 group-hover:border-gray-200"
          }`}
      >
        <span
          className={`transition-colors duration-500
                      ${isActive ? "text-white" : "text-gray-300 group-hover:text-gray-400"}`}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "18px",
            fontWeight: 400,
          }}
        >
          {step.number}
        </span>

        {/* Pulse on active */}
        {isActive && (
          <span
            className="absolute inset-0 rounded-2xl bg-black opacity-20 animate-ping"
            style={{ animationDuration: "2s" }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Icon badge */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5
                    transition-all duration-500
                    ${isActive
            ? "bg-black text-white"
            : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
          }`}
      >
        <Icon size={20} strokeWidth={1.4} />
      </div>

      {/* Content */}
      <h3
        className={`mb-3 transition-all duration-300 text-black
                    ${isActive ? "translate-x-1" : "group-hover:translate-x-0.5"}`}
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontSize: "20px",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
        }}
      >
        {step.title}
      </h3>

      <p
        className="text-gray-400 leading-relaxed max-w-[240px]"
        style={{ fontSize: "14px" }}
      >
        {step.description}
      </p>

      {/* Learn more (visible on active) */}
      <div
        className={`mt-4 flex items-center gap-2 transition-all duration-500
                    ${isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <span
          className="tracking-[0.15em] uppercase text-black"
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          Learn more
        </span>
        <ArrowRight size={12} className="text-black" />
      </div>
    </div>
  )
})

// ── Desktop: Visual Feature ────────────────────────────────
const DesktopFeatureVisual = memo(function DesktopFeatureVisual({ activeStep }) {
  const step = activeStep !== null ? STEPS[activeStep] : STEPS[0]
  const Icon = step.icon
  const visualRef = useRef(null)

  useScrollAnimation(
    visualRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        visualRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: visualRef.current,
            start: "top 85%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <div
      ref={visualRef}
      className="opacity-0 relative rounded-[2rem] overflow-hidden bg-black
                 aspect-[4/3] lg:aspect-[16/10]"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Gradient orbs */}
        <div
          className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full
                     bg-white opacity-[0.03] transition-all duration-700"
        />
        <div
          className="absolute -left-20 -top-20 w-64 h-64 rounded-full
                     bg-white opacity-[0.02] transition-all duration-700"
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.1) 40px,
              rgba(255,255,255,0.1) 41px
            )`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center
                     mb-6 shadow-2xl transition-all duration-500"
          style={{
            boxShadow: "0 25px 60px -15px rgba(255,255,255,0.25)",
          }}
        >
          <Icon size={32} strokeWidth={1.3} className="text-black" />
        </div>

        {/* Number */}
        <span
          className="text-white/10 mb-2 transition-all duration-500"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "80px",
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          {step.number}
        </span>

        {/* Title */}
        <h4
          className="text-white text-center transition-all duration-500"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "28px",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          {step.title}
        </h4>

        {/* Description */}
        <p
          className="text-white/40 text-center mt-3 max-w-sm leading-relaxed
                     transition-all duration-500"
          style={{ fontSize: "15px" }}
        >
          {step.description}
        </p>
      </div>

      {/* Bottom line */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r
                   from-transparent via-white/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  )
})

// ── Desktop: Stats Bar ─────────────────────────────────────
const StatsBar = memo(function StatsBar() {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {STATS.map((stat, i) => (
        <div key={i} className="text-center p-4 rounded-2xl bg-gray-50">
          <p
            className="text-black"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "20px",
              fontWeight: 400,
            }}
          >
            {stat.value}
          </p>
          <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
})

// ── Mobile: Card Carousel ──────────────────────────────────
const MobileSteps = memo(function MobileSteps() {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth * 0.82
      const gap = 12
      const newIndex = Math.round(scrollLeft / (cardWidth + gap))
      setActiveIndex(Math.min(Math.max(newIndex, 0), STEPS.length - 1))
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useScrollAnimation(
    scrollRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        scrollRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scrollRef.current,
            start: "top 90%",
            once: true,
          },
        }
      )
    },
    []
  )

  const scrollToCard = useCallback((index) => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.offsetWidth * 0.82
    const gap = 12
    scrollRef.current.scrollTo({
      left: index * (cardWidth + gap),
      behavior: "smooth",
    })
  }, [])

  return (
    <div className="md:hidden -mx-5">
      {/* Carousel */}
      <div
        ref={scrollRef}
        className="opacity-0 flex gap-3 overflow-x-auto snap-x snap-mandatory
                   px-5 pb-4 will-change-transform"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isActive = i === activeIndex

          return (
            <div
              key={step.number}
              className={`shrink-0 w-[82vw] snap-center transition-all duration-300
                          ${isActive ? "scale-100" : "scale-[0.97] opacity-70"}`}
            >
              <div
                className="rounded-3xl overflow-hidden min-h-[300px]
                           flex flex-col justify-between relative bg-black"
              >
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                  {/* Large gradient orb */}
                  <div
                    className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full
                               bg-white opacity-[0.03]"
                  />
                  {/* Small orb */}
                  <div
                    className="absolute -left-8 top-1/3 w-32 h-32 rounded-full
                               bg-white opacity-[0.02]"
                  />
                  {/* Subtle grid */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: "30px 30px",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <span
                      className="text-white/[0.07]"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "72px",
                        fontWeight: 300,
                        lineHeight: 0.85,
                      }}
                    >
                      {step.number}
                    </span>

                    <div
                      className="w-14 h-14 rounded-2xl bg-white
                                 flex items-center justify-center shadow-xl"
                      style={{
                        boxShadow: "0 15px 40px -10px rgba(255,255,255,0.2)",
                      }}
                    >
                      <Icon size={24} strokeWidth={1.3} className="text-black" />
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-auto pt-6">
                    <h3
                      className="text-white mb-2.5"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 400,
                        fontSize: "24px",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-white/40 leading-relaxed"
                      style={{ fontSize: "14px" }}
                    >
                      {step.description}
                    </p>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-5 pt-5 border-t border-white/[0.06]">
                      <span
                        className="text-white/20 tracking-[0.2em] uppercase"
                        style={{ fontSize: "9px" }}
                      >
                        Step {step.number} of 04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* End spacer */}
        <div className="shrink-0 w-3" aria-hidden="true" />
      </div>

      {/* Progress bar dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToCard(i)}
            className={`rounded-full transition-all duration-400
                        ${i === activeIndex
                ? "w-8 h-2 bg-black"
                : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
              }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Mobile stats */}
      <div className="grid grid-cols-3 gap-2 mt-8 mx-5">
        {STATS.map((stat, i) => (
          <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
            <p
              className="text-black"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "16px",
                fontWeight: 400,
              }}
            >
              {stat.value}
            </p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})

// ── Section Header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader({ eyebrowRef, headingRef, descRef }) {
  return (
    <div className="mb-12 md:mb-16 lg:mb-20">
      <div
        ref={eyebrowRef}
        className="flex items-center gap-4 mb-5 md:mb-6 opacity-0"
      >
        <span className="block w-10 h-px bg-black" aria-hidden="true" />
        <span
          className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: "Georgia, serif", fontSize: "10px" }}
        >
          How It Works
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-16">
        <div className="max-w-xl">
          <h2
            ref={headingRef}
            className="opacity-0 text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Four Simple Steps to
            <br className="hidden sm:block" />
            <span className="text-gray-300"> a Spotless Ride</span>
          </h2>

          <p
            ref={descRef}
            className="opacity-0 text-gray-400 mt-5 md:mt-6 max-w-md leading-relaxed"
            style={{ fontSize: "15px" }}
          >
            From booking to a spotless finish — the entire process takes under 2 minutes
            to schedule and a couple of hours to complete.
          </p>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <a
            href="/bookings"
            className="group inline-flex items-center gap-3 h-14 px-8 bg-black text-white
                       rounded-full tracking-[0.15em] uppercase hover:bg-gray-800
                       active:scale-[0.98] transition-all duration-300 no-underline"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Get Started
            <ArrowRight
              size={16}
              strokeWidth={2}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>

          <a
            href="#video"
            className="group w-14 h-14 rounded-full border-2 border-gray-200
                       flex items-center justify-center hover:border-black
                       hover:bg-black transition-all duration-300"
            aria-label="Watch video"
          >
            <Play
              size={18}
              strokeWidth={2}
              className="text-gray-400 group-hover:text-white ml-0.5
                         transition-colors duration-300"
            />
          </a>
        </div>
      </div>
    </div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null)

  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const ctaRef = useRef(null)
  const headerAnimated = useRef(false)

  // Header animation
  useEffect(() => {
    if (headerAnimated.current) return

    let ctx

    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      if (!headingRef.current) return

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
          defaults: { ease: ANIMATION_CONFIG.header.ease },
        })

        if (eyebrowRef.current) {
          tl.fromTo(
            eyebrowRef.current,
            { opacity: 0, x: -25 },
            { opacity: 1, x: 0, duration: 0.5 }
          )
        }

        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: ANIMATION_CONFIG.header.duration },
          0.05
        )

        if (descRef.current) {
          tl.fromTo(
            descRef.current,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.2
          )
        }
      })

      headerAnimated.current = true
    }

    init()

    return () => ctx?.revert()
  }, [])

  // Mobile CTA animation
  useScrollAnimation(
    ctaRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 94%",
            once: true,
          },
        }
      )
    },
    []
  )

  const handleStepHover = useCallback((index) => {
    setActiveStep(index)
  }, [])

  return (
    <section
      className="w-full bg-white py-16 md:py-28 lg:py-36 border-t border-gray-100"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <SectionHeader
          eyebrowRef={eyebrowRef}
          headingRef={headingRef}
          descRef={descRef}
        />

        {/* ═══ Mobile: Card Carousel ═══ */}
        <MobileSteps />

        {/* ═══ Desktop: Split Layout ═══ */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left: Visual */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <DesktopFeatureVisual activeStep={activeStep} />
            <StatsBar />
          </div>

          {/* Right: Timeline */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:gap-y-16">
              {STEPS.map((step, i) => (
                <DesktopTimelineStep
                  key={step.number}
                  step={step}
                  index={i}
                  isLast={i === STEPS.length - 1}
                  isActive={activeStep === i}
                  onHover={handleStepHover}
                />
              ))}
            </div>

            {/* Tablet CTA */}
            <div className="mt-12 lg:hidden">
              <a
                href="/bookings"
                className="group inline-flex items-center gap-3 h-14 px-8 bg-black text-white
                           rounded-full tracking-[0.15em] uppercase hover:bg-gray-800
                           active:scale-[0.98] transition-all duration-300 no-underline"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Get Started
                <ArrowRight size={16} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>

        {/* ═══ Mobile CTA ═══ */}
        <div ref={ctaRef} className="opacity-0 mt-8 md:hidden">
          <a
            href="/bookings"
            className="group w-full h-14 flex items-center justify-center gap-2.5
                       bg-black text-white rounded-full tracking-[0.2em] uppercase
                       active:scale-[0.98] transition-all duration-200 no-underline"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Book Now
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="group-active:translate-x-0.5 transition-transform duration-200"
            />
          </a>
        </div>
      </div>
    </section>
  )
}
"use client"

import { useEffect, useRef, memo } from "react"
import {
  ArrowUpRight,
  ArrowRight,
  Leaf,
  Users,
  Star,
  MapPin,
  Shield,
  Check,
} from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const FEATURES = [
  {
    icon: MapPin,
    title: "Doorstep Service",
    desc: "We come to you — home, office, or anywhere in Duliajan",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    desc: "Safe products that protect your vehicle and the environment",
  },
  {
    icon: Shield,
    title: "Trusted Team",
    desc: "Trained professionals with consistent, quality results",
  },
  {
    icon: Star,
    title: "Satisfaction Guaranteed",
    desc: "Not happy? We make it right — no questions asked",
  },
]

const PROCESS_STEPS = [
  { number: "01", title: "Book Online", desc: "Choose your service and time slot" },
  { number: "02", title: "We Arrive", desc: "Our team comes to your location" },
  { number: "03", title: "We Clean", desc: "Professional cleaning with care" },
  { number: "04", title: "You Enjoy", desc: "Spotless results, guaranteed" },
]

const STATS = [
  { value: "100+", label: "Happy Customers" },
  { value: "500+", label: "Cars Cleaned" },
  { value: "4.9", label: "Average Rating" },
  { value: "2hr", label: "Avg. Service Time" },
]

const SERVICES_LIST = [
  { name: "Car Exterior Wash", price: "₹299" },
  { name: "Full Car Detailing", price: "₹799" },
  { name: "Sofa Cleaning", price: "₹499" },
  { name: "Water Tank Cleaning", price: "₹599" },
]

const ANIMATION_CONFIG = {
  duration: 0.8,
  stagger: 0.1,
  ease: "power4.out",
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

// ── Hero Section ───────────────────────────────────────────
const Hero = memo(function Hero() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    let ctx

    const init = async () => {
      const { default: gsap } = await import("gsap")

      if (!sectionRef.current) return

      ctx = gsap.context(() => {
        const elements = contentRef.current.querySelectorAll("[data-animate]")

        gsap.fromTo(
          elements,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.duration,
            stagger: ANIMATION_CONFIG.stagger,
            ease: ANIMATION_CONFIG.ease,
          }
        )
      })
    }

    init()

    return () => ctx?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] md:min-h-screen bg-black overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=2000&auto=format&fit=crop"
          alt=""
          role="presentation"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16
                   min-h-[90vh] md:min-h-screen flex flex-col justify-end pb-16 md:pb-24"
      >
        {/* Eyebrow */}
        <div data-animate className="flex items-center gap-3 mb-6 opacity-0">
          <span className="w-10 h-px bg-white/40" />
          <span
            className="tracking-[0.4em] uppercase text-white/60"
            style={{ fontSize: "10px" }}
          >
            About Us
          </span>
        </div>

        {/* Main heading */}
        <h1
          data-animate
          className="opacity-0 text-white mb-6 max-w-4xl"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          We Bring the
          <br />
          <span className="italic text-white/50">Clean to You</span>
        </h1>

        {/* Subtitle */}
        <p
          data-animate
          className="opacity-0 text-white/50 max-w-lg mb-10 leading-relaxed"
          style={{ fontSize: "16px" }}
        >
          Professional doorstep cleaning services in Duliajan. Car wash, sofa
          cleaning, water tank cleaning — all delivered with care.
        </p>

        {/* CTA row */}
        <div data-animate className="opacity-0 flex flex-wrap items-center gap-4 mb-12">
          <a
            href="/bookings"
            className="group flex items-center gap-3 h-14 px-8 bg-white text-black
                       rounded-full no-underline hover:bg-gray-100
                       active:scale-[0.97] transition-all duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Book a Service
            </span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>

          <a
            href="#story"
            className="group flex items-center gap-3 h-14 px-6 text-white
                       no-underline hover:text-white/70 transition-colors duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "11px" }}
            >
              Our Story
            </span>
            <div className="w-8 h-px bg-current" />
          </a>
        </div>

        {/* Stats row */}
        <div
          data-animate
          className="opacity-0 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10
                     pt-8 border-t border-white/10"
        >
          {STATS.map((stat, i) => (
            <div key={i}>
              <p
                className="text-white mb-1"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </p>
              <p
                className="text-white/30 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-white/30 tracking-widest uppercase" style={{ fontSize: "9px" }}>
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
})

// ── Story Section ──────────────────────────────────────────
const Story = memo(function Story() {
  const sectionRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <section
      ref={sectionRef}
      id="story"
      className="w-full bg-white py-20 md:py-32 lg:py-40"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image composition */}
          <div ref={leftRef} className="relative opacity-0">
            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop"
                alt="Professional car cleaning"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Floating card */}
            <div
              className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 bg-black text-white
                         p-6 rounded-2xl shadow-2xl max-w-[200px]"
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "36px",
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                3+
              </p>
              <p className="text-white/50 leading-snug" style={{ fontSize: "13px" }}>
                Years serving Duliajan with quality cleaning
              </p>
            </div>

            {/* Decorative element */}
            <div
              className="absolute -top-4 -left-4 w-24 h-24 border border-black/10 rounded-2xl -z-10"
              aria-hidden="true"
            />
          </div>

          {/* Right: Content */}
          <div ref={rightRef} className="opacity-0">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px bg-black" />
              <span
                className="tracking-[0.4em] uppercase text-gray-400"
                style={{ fontSize: "10px" }}
              >
                Our Story
              </span>
            </div>

            <h2
              className="text-black mb-8"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Built on a Simple
              <br />
              <span className="text-gray-300">Idea</span>
            </h2>

            <div className="space-y-5 mb-10">
              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "15px" }}>
                <span className="text-black font-medium">Your time is valuable.</span>{" "}
                That's the belief that started Wash2Door. We saw people spending
                hours at car washes, waiting in queues, dealing with inconsistent
                results.
              </p>

              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "15px" }}>
                We thought — what if we brought the car wash to you? What if
                cleaning your car was as simple as booking a slot on your phone?
              </p>

              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "15px" }}>
                Today, we serve 100+ happy customers in Duliajan. From car washing
                to sofa cleaning to water tank maintenance — we handle it all at
                your doorstep.
              </p>
            </div>

            {/* Quote */}
            <blockquote className="relative pl-6 py-4 border-l-2 border-black mb-10">
              <p
                className="text-black italic"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "20px",
                  lineHeight: 1.5,
                }}
              >
                "You book. We clean. You enjoy."
              </p>
              <cite
                className="text-gray-400 not-italic mt-3 block"
                style={{ fontSize: "13px" }}
              >
                — The Wash2Door Promise
              </cite>
            </blockquote>

            {/* CTA */}
            <a
              href="/services"
              className="group inline-flex items-center gap-3 text-black no-underline"
            >
              <span
                className="tracking-wider uppercase border-b border-black pb-1
                           group-hover:border-gray-400 transition-colors duration-300"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Explore Our Services
              </span>
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                           transition-transform duration-300"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
})

// ── Features Section ───────────────────────────────────────
const Features = memo(function Features() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const gridRef = useRef(null)

  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )

      const cards = gridRef.current.querySelectorAll("[data-feature]")
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gray-50 py-20 md:py-28 lg:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-20 opacity-0">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-px bg-black" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{ fontSize: "10px" }}
            >
              Why Us
            </span>
            <span className="w-10 h-px bg-black" />
          </div>

          <h2
            className="text-black mb-5"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            What Makes Us Different
          </h2>

          <p
            className="text-gray-400 max-w-lg mx-auto leading-relaxed"
            style={{ fontSize: "15px" }}
          >
            We're not just another cleaning service. Here's why customers
            choose Wash2Door.
          </p>
        </div>

        {/* Features grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon

            return (
              <div
                key={i}
                data-feature
                className="group relative bg-white p-8 rounded-2xl opacity-0
                           border border-transparent hover:border-black
                           transition-all duration-500"
              >
                {/* Number */}
                <span
                  className="absolute top-6 right-6 text-gray-100 group-hover:text-gray-200
                             transition-colors duration-500"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "48px",
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center
                             mb-6 group-hover:bg-black transition-colors duration-500"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.3}
                    className="text-gray-400 group-hover:text-white transition-colors duration-500"
                  />
                </div>

                {/* Content */}
                <h3
                  className="text-black mb-3"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 400,
                    fontSize: "18px",
                  }}
                >
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed" style={{ fontSize: "14px" }}>
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
})

// ── Process Section ────────────────────────────────────────
const Process = memo(function Process() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const stepsRef = useRef(null)

  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )

      const steps = stepsRef.current.querySelectorAll("[data-step]")
      gsap.fromTo(
        steps,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <section
      ref={sectionRef}
      className="w-full bg-black py-20 md:py-28 lg:py-32 relative overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-20 opacity-0">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-px bg-white/30" />
            <span
              className="tracking-[0.4em] uppercase text-white/50"
              style={{ fontSize: "10px" }}
            >
              How It Works
            </span>
            <span className="w-10 h-px bg-white/30" />
          </div>

          <h2
            className="text-white mb-5"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Simple as <span className="italic text-white/50">1-2-3-4</span>
          </h2>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={i}
              data-step
              className="relative opacity-0 group"
            >
              {/* Connector line */}
              {i < PROCESS_STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-10 left-full w-full h-px bg-white/10"
                  style={{ width: "calc(100% - 2rem)" }}
                  aria-hidden="true"
                />
              )}

              {/* Card */}
              <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6
                              hover:bg-white/[0.06] hover:border-white/20
                              transition-all duration-500">
                {/* Number */}
                <span
                  className="text-white/10 block mb-4 group-hover:text-white/20
                             transition-colors duration-500"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "56px",
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </span>

                <h3
                  className="text-white mb-2"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 400,
                    fontSize: "18px",
                  }}
                >
                  {step.title}
                </h3>

                <p className="text-white/40 leading-relaxed" style={{ fontSize: "14px" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16">
          <a
            href="/bookings"
            className="group inline-flex items-center gap-3 h-14 px-8 bg-white text-black
                       rounded-full no-underline hover:bg-gray-100
                       active:scale-[0.97] transition-all duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Start Booking
            </span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>
        </div>
      </div>
    </section>
  )
})

// ── Services Preview ───────────────────────────────────────
const ServicesPreview = memo(function ServicesPreview() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)

  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      const elements = contentRef.current.querySelectorAll("[data-animate]")
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-20 md:py-28 lg:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left: Content */}
          <div>
            <div data-animate className="flex items-center gap-3 mb-6 opacity-0">
              <span className="w-10 h-px bg-black" />
              <span
                className="tracking-[0.4em] uppercase text-gray-400"
                style={{ fontSize: "10px" }}
              >
                Our Services
              </span>
            </div>

            <h2
              data-animate
              className="opacity-0 text-black mb-6"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              What We
              <br />
              <span className="text-gray-300">Clean</span>
            </h2>

            <p
              data-animate
              className="opacity-0 text-gray-500 leading-relaxed mb-10 max-w-md"
              style={{ fontSize: "15px" }}
            >
              From cars to sofas to water tanks — we've got your cleaning needs
              covered. All services delivered at your doorstep.
            </p>

            {/* Services list */}
            <div data-animate className="space-y-0 mb-10 opacity-0">
              {SERVICES_LIST.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-gray-100
                             group hover:pl-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Check size={14} className="text-gray-300" />
                    <span
                      className="text-black group-hover:text-gray-500
                                 transition-colors duration-300"
                      style={{ fontSize: "15px" }}
                    >
                      {service.name}
                    </span>
                  </div>
                  <span
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: "15px",
                    }}
                  >
                    {service.price}
                  </span>
                </div>
              ))}
            </div>

            <a
              data-animate
              href="/services"
              className="opacity-0 group inline-flex items-center gap-3 h-13 px-7
                         bg-black text-white rounded-full no-underline
                         hover:bg-gray-800 active:scale-[0.97]
                         transition-all duration-300"
            >
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                View All Services
              </span>
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </a>
          </div>

          {/* Right: Image */}
          <div data-animate className="relative opacity-0">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop"
                alt="Professional car detailing"
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Overlay card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm
                              p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <Star key={i} size={12} fill="#000" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500" style={{ fontSize: "13px" }}>
                  <span className="text-black font-medium">100+ customers</span> trust us
                </p>
              </div>
            </div>

            {/* Decorative */}
            <div
              className="absolute -bottom-4 -right-4 w-32 h-32 border border-black/10
                         rounded-2xl -z-10"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  )
})

// ── Main Page ──────────────────────────────────────────────
export default function AboutPage() {
  return (
    <main>
      <Hero />
      <Story />
      <Features />
      <Process />
      <ServicesPreview />
    </main>
  )
}
"use client"

import { memo, useRef, useMemo } from "react"
import { motion, useInView } from "framer-motion"
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

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=2000&auto=format&fit=crop",
  story: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop",
  services: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop",
}

// ── Typography Tokens ──────────────────────────────────────
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = 'Georgia, "Times New Roman", serif'

// ── Animation Variants ─────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

// ── Reusable Components ────────────────────────────────────
const Eyebrow = memo(function Eyebrow({ children, light = false }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className={`w-10 h-px ${light ? "bg-white/30" : "bg-black"}`} />
      <span
        className={`tracking-[0.4em] uppercase ${light ? "text-white/50" : "text-gray-400"}`}
        style={{ fontSize: "10px", fontFamily: SANS }}
      >
        {children}
      </span>
    </div>
  )
})

const SectionHeading = memo(function SectionHeading({ children, light = false, className = "" }) {
  return (
    <h2
      className={`${light ? "text-white" : "text-black"} ${className}`}
      style={{
        fontFamily: SERIF,
        fontWeight: 300,
        fontSize: "clamp(1.9rem, 4vw, 3rem)",
        lineHeight: 1.12,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
  )
})

const GridTexture = memo(function GridTexture({ opacity = 0.025 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
      aria-hidden="true"
    />
  )
})

// ── Hero ───────────────────────────────────────────────────
const Hero = memo(function Hero() {
  return (
    <section
      className="relative min-h-[90dvh] md:min-h-screen bg-black overflow-hidden"
      style={{ fontFamily: SANS }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt=""
          role="presentation"
          className="w-full h-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 min-h-[90dvh] md:min-h-screen flex flex-col justify-end pb-14 md:pb-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-10 h-px bg-white/40" />
          <span className="tracking-[0.4em] uppercase text-white/60" style={{ fontSize: "10px" }}>
            About Us
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-white mb-6 max-w-4xl"
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          We Bring the
          <br />
          <span className="italic text-white/50">Clean to You</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/50 max-w-lg mb-10 leading-relaxed"
          style={{ fontSize: "16px" }}
        >
          Professional doorstep cleaning services in Duliajan. Car wash, sofa cleaning, water tank cleaning — all delivered with care.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-4 mb-12"
        >
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href="/bookings"
            className="group flex items-center gap-3 h-14 px-8 bg-white text-black rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            <span className="tracking-wider uppercase" style={{ fontSize: "11px", fontWeight: 500 }}>
              Book a Service
            </span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.a>

          <a
            href="#story"
            className="group flex items-center gap-3 h-14 px-2 text-white hover:text-white/60 transition-colors duration-300"
          >
            <span className="tracking-wider uppercase" style={{ fontSize: "11px" }}>
              Our Story
            </span>
            <div className="w-8 h-px bg-current" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 pt-8 border-t border-white/10"
        >
          {STATS.map((stat, i) => (
            <div key={i}>
              <p
                className="text-white mb-1"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </p>
              <p className="text-white/30 tracking-wider uppercase" style={{ fontSize: "10px" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-white/30 tracking-widest uppercase" style={{ fontSize: "9px" }}>
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
})

// ── Story ──────────────────────────────────────────────────
const Story = memo(function Story() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      id="story"
      className="w-full bg-white py-20 md:py-32 lg:py-40"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={IMAGES.story}
                alt="Professional car cleaning service"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Stat Card */}
            <div className="absolute -bottom-6 -right-4 md:-bottom-0 md:-right-8 bg-black text-white p-5 rounded-2xl shadow-2xl max-w-[180px]">
              <p className="mb-1.5" style={{ fontFamily: SERIF, fontSize: "36px", fontWeight: 300, lineHeight: 1 }}>
                3+
              </p>
              <p className="text-white/50 leading-snug" style={{ fontSize: "12px" }}>
                Years serving Duliajan with quality cleaning
              </p>
            </div>

            {/* Decorative Element */}
            <div
              className="absolute -top-4 -left-4 w-20 h-20 border border-black/10 rounded-2xl -z-10"
              aria-hidden="true"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <Eyebrow>Our Story</Eyebrow>

            <SectionHeading className="mb-8">
              Built on a Simple
              <br />
              <span className="text-gray-300">Idea</span>
            </SectionHeading>

            <div className="space-y-5 mb-10">
              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "15px" }}>
                <span className="text-black font-medium">Your time is valuable.</span> That's the belief that started Wash2Door. We saw people spending hours at car washes, waiting in queues, dealing with inconsistent results.
              </p>
              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "15px" }}>
                We thought — what if we brought the car wash to you? What if cleaning your car was as simple as booking a slot on your phone?
              </p>
              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "15px" }}>
                Today, we serve 100+ happy customers in Duliajan. From car washing to sofa cleaning to water tank maintenance — we handle it all at your doorstep.
              </p>
            </div>

            <blockquote className="relative pl-6 py-4 border-l-2 border-black mb-10">
              <p className="text-black italic" style={{ fontFamily: SERIF, fontSize: "19px", lineHeight: 1.5 }}>
                "You book. We clean. You enjoy."
              </p>
              <cite className="text-gray-400 not-italic mt-2 block" style={{ fontSize: "12px" }}>
                — The Wash2Door Promise
              </cite>
            </blockquote>

            <a
              href="/services"
              className="group inline-flex items-center gap-3 text-black no-underline"
            >
              <span className="tracking-wider uppercase border-b border-black pb-1 group-hover:border-gray-400 transition-colors duration-300"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                Explore Our Services
              </span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ── Features ───────────────────────────────────────────────
const Features = memo(function Features() {
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" })
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" })

  return (
    <section className="w-full bg-gray-50 py-20 md:py-28 lg:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">

        {/* Header */}
        <motion.div
          ref={headerRef}
          variants={fadeUp}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="text-center mb-14 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-px bg-black" />
            <span className="tracking-[0.4em] uppercase text-gray-400" style={{ fontSize: "10px" }}>
              Why Us
            </span>
            <span className="w-10 h-px bg-black" />
          </div>
          <SectionHeading className="mb-5">What Makes Us Different</SectionHeading>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed" style={{ fontSize: "15px" }}>
            We're not just another cleaning service. Here's why customers choose Wash2Door.
          </p>
        </motion.div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={gridInView ? "visible" : "hidden"}
                className="group relative bg-white p-7 rounded-2xl border border-transparent hover:border-black transition-all duration-500"
              >
                {/* Background Number */}
                <span
                  className="absolute top-5 right-5 text-gray-100 group-hover:text-gray-200 transition-colors duration-500 select-none"
                  style={{ fontFamily: SERIF, fontSize: "44px", fontWeight: 300, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-5 group-hover:bg-black transition-colors duration-500">
                  <Icon size={20} strokeWidth={1.3} className="text-gray-400 group-hover:text-white transition-colors duration-500" />
                </div>

                <h3 className="text-black mb-2.5" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "17px" }}>
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed" style={{ fontSize: "13px" }}>
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
})

// ── Process ────────────────────────────────────────────────
const Process = memo(function Process() {
  const headerRef = useRef(null)
  const stepsRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" })

  return (
    <section className="w-full bg-black py-20 md:py-28 lg:py-32 relative overflow-hidden" style={{ fontFamily: SANS }}>
      <GridTexture />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 relative z-10">

        {/* Header */}
        <motion.div
          ref={headerRef}
          variants={fadeUp}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="text-center mb-14 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-px bg-white/30" />
            <span className="tracking-[0.4em] uppercase text-white/50" style={{ fontSize: "10px" }}>
              How It Works
            </span>
            <span className="w-10 h-px bg-white/30" />
          </div>
          <SectionHeading light>
            Simple as <span className="italic text-white/40">1-2-3-4</span>
          </SectionHeading>
        </motion.div>

        {/* Steps */}
        <div ref={stepsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={stepsInView ? "visible" : "hidden"}
              className="relative group"
            >
              {/* Connector Line */}
              {i < PROCESS_STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-9 left-[calc(100%+12px)] right-[-12px] h-px bg-white/10 z-10"
                  aria-hidden="true"
                />
              )}

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/25 transition-all duration-500">
                <span
                  className="text-white/10 block mb-4 group-hover:text-white/20 transition-colors duration-500"
                  style={{ fontFamily: SERIF, fontSize: "52px", fontWeight: 300, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3 className="text-white mb-2" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "17px" }}>
                  {step.title}
                </h3>
                <p className="text-white/40 leading-relaxed" style={{ fontSize: "13px" }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href="/bookings"
            className="group inline-flex items-center gap-3 h-14 px-8 bg-white text-black rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            <span className="tracking-wider uppercase" style={{ fontSize: "11px", fontWeight: 500 }}>
              Start Booking
            </span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.a>
        </div>
      </div>
    </section>
  )
})

// ── Services Preview ───────────────────────────────────────
const ServicesPreview = memo(function ServicesPreview() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const leftInView = useInView(leftRef, { once: true, margin: "-60px" })
  const rightInView = useInView(rightRef, { once: true, margin: "-60px" })

  const avatarCount = useMemo(() => Array(3).fill(null), [])
  const starCount = useMemo(() => Array(5).fill(null), [])

  return (
    <section className="w-full bg-white py-20 md:py-28 lg:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Content */}
          <motion.div
            ref={leftRef}
            variants={fadeLeft}
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
          >
            <Eyebrow>Our Services</Eyebrow>

            <SectionHeading className="mb-6">
              What We
              <br />
              <span className="text-gray-300">Clean</span>
            </SectionHeading>

            <p className="text-gray-500 leading-relaxed mb-10 max-w-md" style={{ fontSize: "15px" }}>
              From cars to sofas to water tanks — we've got your cleaning needs covered. All services delivered at your doorstep.
            </p>

            {/* Services List */}
            <div className="mb-10 border-t border-gray-100">
              {SERVICES_LIST.map((service, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={leftInView ? "visible" : "hidden"}
                  className="flex items-center justify-between py-4 border-b border-gray-100 group hover:pl-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Check size={13} className="text-gray-300 shrink-0" />
                    <span className="text-black group-hover:text-gray-500 transition-colors duration-300" style={{ fontSize: "14px" }}>
                      {service.name}
                    </span>
                  </div>
                  <span className="text-gray-400 tabular-nums" style={{ fontFamily: SERIF, fontSize: "14px" }}>
                    {service.price}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              href="/services"
              className="inline-flex items-center gap-3 h-12 px-7 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300 group"
            >
              <span className="tracking-wider uppercase" style={{ fontSize: "11px", fontWeight: 500 }}>
                View All Services
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </motion.div>

          {/* Image */}
          <motion.div
            ref={rightRef}
            variants={fadeRight}
            initial="hidden"
            animate={rightInView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={IMAGES.services}
                alt="Professional car detailing service"
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Social Proof Card */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex -space-x-2">
                    {avatarCount.map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {starCount.map((_, i) => (
                      <Star key={i} size={11} fill="#000" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500" style={{ fontSize: "12px" }}>
                  <span className="text-black font-medium">100+ customers</span> trust us
                </p>
              </div>
            </div>

            {/* Decorative Element */}
            <div
              className="absolute -bottom-4 -right-4 w-28 h-28 border border-black/10 rounded-2xl -z-10"
              aria-hidden="true"
            />
          </motion.div>
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
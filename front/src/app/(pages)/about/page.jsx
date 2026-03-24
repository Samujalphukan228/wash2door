"use client"

import { memo, useRef, useMemo } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import {
  ArrowUpRight, ArrowRight,
  Leaf, Users, Star, MapPin,
  Shield, Check, Phone, Mail, Clock, Zap,
} from "lucide-react"

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const FEATURES = [
  { icon: MapPin,   title: "Doorstep Service",        desc: "We come to you — home, office, or anywhere in Duliajan" },
  { icon: Leaf,     title: "Eco-Friendly",             desc: "Safe products that protect your vehicle and the environment" },
  { icon: Shield,   title: "Trusted Team",             desc: "Trained professionals with consistent, quality results" },
  { icon: Star,     title: "Satisfaction Guaranteed",  desc: "Not happy? We make it right — no questions asked" },
]

const PROCESS_STEPS = [
  { number: "01", title: "Book Online", desc: "Choose your service and time slot in seconds" },
  { number: "02", title: "We Arrive",   desc: "Our team comes fully equipped to your location" },
  { number: "03", title: "We Clean",    desc: "Professional cleaning with care and precision" },
  { number: "04", title: "You Enjoy",   desc: "Spotless results, guaranteed every time" },
]

const STATS = [
  { value: "100+", label: "Happy Customers" },
  { value: "500+", label: "Cars Cleaned" },
  { value: "4.9",  label: "Average Rating" },
  { value: "2hr",  label: "Avg. Service Time" },
]

const SERVICES_LIST = [
  { name: "Car Exterior Wash",   price: "₹299" },
  { name: "Full Car Detailing",  price: "₹799" },
  { name: "Sofa Cleaning",       price: "₹499" },
  { name: "Water Tank Cleaning", price: "₹599" },
]

const IMAGES = {
  hero:     "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=2000&auto=format&fit=crop",
  story:    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop",
  services: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop",
}

const BUSINESS = {
  phone:     "+91 6900706456",
  email:     "Wash2Door786602@gmail.com",
  address:   "Near Sonapur Namghar, Duliajan, Assam",
  hours:     "Tue – Sun: 9:00 AM – 5:00 PM",
  facebook:  "https://www.facebook.com/profile.php?id=61581835752285",
  instagram: "https://www.instagram.com/wash2door.djn",
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const EASE  = [0.16, 1, 0.3, 1]

// ══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ══════════════════════════════════════════════════════════
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: i * 0.11, ease: EASE },
  }),
}
const fadeLeft = {
  hidden:  { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
}
const fadeRight = {
  hidden:  { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
}
const clipReveal = {
  hidden:  { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)", transition: { duration: 1.1, ease: EASE } },
}

// ══════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ══════════════════════════════════════════════════════════

/** Thin horizontal rule with label */
const Eyebrow = memo(function Eyebrow({ children, light = false }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-4 mb-7">
      <motion.span
        variants={clipReveal}
        className={`block h-px w-10 ${light ? "bg-white/30" : "bg-black/30"}`}
      />
      <span
        className={`tracking-[0.38em] uppercase ${light ? "text-white/45" : "text-black/35"}`}
        style={{ fontSize: "9px", fontFamily: SANS, fontWeight: 500 }}
      >
        {children}
      </span>
    </motion.div>
  )
})

/** Large serif heading */
const SectionHeading = memo(function SectionHeading({ children, light = false, className = "" }) {
  return (
    <h2
      className={`${light ? "text-white" : "text-black"} ${className}`}
      style={{
        fontFamily: SERIF,
        fontWeight: 300,
        fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
        lineHeight: 1.1,
        letterSpacing: "-0.025em",
      }}
    >
      {children}
    </h2>
  )
})

/** Subtle grid overlay texture */
const GridTexture = memo(function GridTexture({ light = false }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        opacity: light ? 0.018 : 0.04,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
      }}
      aria-hidden="true"
    />
  )
})

/** Film-grain noise overlay */
const Grain = memo(function Grain({ opacity = 0.035 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden="true"
    />
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 1 — HERO
// ══════════════════════════════════════════════════════════
const Hero = memo(function Hero() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const bgY       = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.5])
  const contentY  = useTransform(scrollYProgress, [0, 1], ["0%", "10%"])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] bg-black overflow-hidden"
      style={{ fontFamily: SANS }}
      aria-label="Hero"
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y: bgY, opacity: bgOpacity }}>
        <img
          src={IMAGES.hero} alt="" role="presentation"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.28) contrast(1.1) saturate(0.55)" }}
          loading="eager" fetchPriority="high"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        <GridTexture />
        <Grain />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16
                   min-h-[100svh] flex flex-col justify-end pb-14 md:pb-24 pt-28"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center gap-4 mb-8"
        >
          <span className="w-10 h-px bg-white/30" />
          <span className="tracking-[0.38em] uppercase text-white/45" style={{ fontSize: "9px", fontFamily: SANS }}>
            About Us
          </span>
        </motion.div>

        {/* Headline — slide up per line */}
        <div className="mb-8 overflow-hidden">
          {["The Shine That", "Finds You."].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.15 + i * 0.14, duration: 1.0, ease: EASE }}
                className={`leading-[0.95] ${i === 1 ? "italic text-white/18" : "text-white"}`}
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: i === 1
                    ? "clamp(2rem, 5.5vw, 4.5rem)"
                    : "clamp(2.6rem, 7vw, 5.8rem)",
                  letterSpacing: "-0.025em",
                }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
          className="text-white/42 max-w-lg mb-10 leading-[1.75]"
          style={{ fontSize: "15px" }}
        >
          Professional doorstep cleaning in Duliajan — car wash, sofa cleaning,
          and water tank cleaning, all delivered with care right where you are.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.6, ease: EASE }}
          className="flex flex-wrap items-center gap-4 mb-14"
        >
          <a
            href="/bookings"
            className="group flex items-center justify-between gap-4 h-13 pl-7 pr-3 bg-white text-black
                       rounded-full hover:bg-gray-100 active:scale-[0.97] transition-all duration-300"
          >
            <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
              Book a Service
            </span>
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center
                            group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-400">
              <ArrowRight size={14} className="text-white" />
            </div>
          </a>

          <a
            href="#story"
            className="group flex items-center gap-3 h-13 px-2 text-white/40
                       hover:text-white/70 transition-colors duration-300"
          >
            <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px" }}>Our Story</span>
            <div className="w-8 h-px bg-current group-hover:w-12 transition-all duration-400" />
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7, ease: EASE }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 pt-8 border-t border-white/[0.08]"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.82 + i * 0.08, duration: 0.6 }}
            >
              <p
                className="text-white mb-1 leading-none"
                style={{ fontFamily: SERIF, fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 300, letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </p>
              <p className="text-white/28 tracking-[0.2em] uppercase" style={{ fontSize: "9px" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2.5" aria-hidden="true">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-14 bg-gradient-to-b from-white/30 to-transparent"
        />
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 2 — STORY
// ══════════════════════════════════════════════════════════
const Story = memo(function Story() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      id="story"
      className="w-full bg-white py-24 md:py-36 lg:py-44"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">

          {/* Image side */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
          >
            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={IMAGES.story}
                alt="Professional car cleaning"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Inner vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating stat */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
              className="absolute -bottom-6 -right-4 md:-right-8 bg-black text-white p-6 rounded-2xl shadow-2xl max-w-[190px]"
            >
              <p className="leading-none mb-2" style={{ fontFamily: SERIF, fontSize: "44px", fontWeight: 300 }}>
                3+
              </p>
              <p className="text-white/45 leading-snug" style={{ fontSize: "12px" }}>
                Years serving Duliajan with quality cleaning
              </p>
            </motion.div>

            {/* Decorative border square */}
            <div className="absolute -top-5 -left-5 w-24 h-24 border border-black/8 rounded-2xl -z-10" aria-hidden="true" />
          </motion.div>

          {/* Text side */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <Eyebrow>Our Story</Eyebrow>

            <SectionHeading className="mb-9">
              Built on a Simple<br />
              <span className="text-black/18 italic">Idea</span>
            </SectionHeading>

            <div className="space-y-5 mb-10">
              {[
                <><span className="text-black font-medium">Your time is valuable.</span> That's the belief that started Wash2Door. We saw people spending hours at car washes in Duliajan — waiting in queues, dealing with inconsistent results, juggling busy schedules.</>,
                <>We thought — what if we brought the car wash to you? What if cleaning your car, sofa, or water tank was as simple as booking a slot on your phone?</>,
                <>Today, we serve 100+ happy customers across Duliajan. Our trained professionals use eco-friendly products and modern techniques to leave your home and vehicle spotless.</>
              ].map((para, i) => (
                <motion.p
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  className="text-black/45 leading-[1.8]"
                  style={{ fontSize: "15px" }}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* Pull quote */}
            <motion.blockquote
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="relative pl-6 py-4 border-l-2 border-black mb-11"
            >
              <p className="text-black italic leading-snug" style={{ fontFamily: SERIF, fontSize: "20px" }}>
                "You book. We clean. You enjoy."
              </p>
              <cite className="text-black/30 not-italic mt-2 block" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
                — The Wash2Door Promise
              </cite>
            </motion.blockquote>

            <motion.a
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              href="/services"
              className="group inline-flex items-center gap-3 text-black no-underline"
            >
              <span
                className="tracking-[0.16em] uppercase border-b border-black/30 pb-0.5
                           group-hover:border-black transition-colors duration-300"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Explore Our Services
              </span>
              <ArrowUpRight
                size={13}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 3 — FEATURES
// ══════════════════════════════════════════════════════════
const Features = memo(function Features() {
  const headerRef  = useRef(null)
  const gridRef    = useRef(null)
  const headerView = useInView(headerRef, { once: true, margin: "-60px" })
  const gridView   = useInView(gridRef,   { once: true, margin: "-60px" })

  return (
    <section className="w-full bg-[#f7f7f5] py-24 md:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">

        {/* Header */}
        <motion.div
          ref={headerRef}
          variants={fadeUp}
          initial="hidden"
          animate={headerView ? "visible" : "hidden"}
          className="mb-16 md:mb-20 max-w-2xl"
        >
          <div className="flex items-center gap-4 mb-7">
            <span className="w-10 h-px bg-black/25" />
            <span className="tracking-[0.38em] uppercase text-black/30" style={{ fontSize: "9px" }}>
              Why Us
            </span>
          </div>
          <SectionHeading>What Makes Us<br /><span className="text-black/18 italic">Different</span></SectionHeading>
        </motion.div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={gridView ? "visible" : "hidden"}
                className="group relative bg-white rounded-2xl p-7 border border-transparent
                           hover:border-black/10 hover:shadow-xl hover:shadow-black/[0.04]
                           transition-all duration-500 overflow-hidden cursor-default"
              >
                {/* Ghost number */}
                <span
                  className="absolute -bottom-3 -right-1 text-black/[0.04] select-none
                             group-hover:text-black/[0.07] transition-colors duration-500"
                  style={{ fontFamily: SERIF, fontSize: "88px", fontWeight: 300, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-black/[0.03] flex items-center justify-center mb-6
                               group-hover:bg-black transition-colors duration-500">
                  <Icon size={18} strokeWidth={1.3}
                    className="text-black/40 group-hover:text-white transition-colors duration-500" />
                </div>

                <h3 className="text-black mb-2.5" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "17px" }}>
                  {feature.title}
                </h3>
                <p className="text-black/40 leading-[1.7]" style={{ fontSize: "13px" }}>
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

// ══════════════════════════════════════════════════════════
// SECTION 4 — PROCESS
// ══════════════════════════════════════════════════════════
const Process = memo(function Process() {
  const headerRef  = useRef(null)
  const stepsRef   = useRef(null)
  const headerView = useInView(headerRef, { once: true, margin: "-60px" })
  const stepsView  = useInView(stepsRef,  { once: true, margin: "-60px" })

  return (
    <section
      className="w-full bg-black py-24 md:py-32 relative overflow-hidden"
      style={{ fontFamily: SANS }}
    >
      <GridTexture />
      <Grain />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 relative z-10">

        {/* Header — left aligned, editorial */}
        <motion.div
          ref={headerRef}
          variants={fadeUp}
          initial="hidden"
          animate={headerView ? "visible" : "hidden"}
          className="mb-16 md:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-4 mb-7">
              <span className="w-10 h-px bg-white/25" />
              <span className="tracking-[0.38em] uppercase text-white/40" style={{ fontSize: "9px" }}>
                How It Works
              </span>
            </div>
            <SectionHeading light>
              Simple as<br /><span className="italic text-white/18">1 — 2 — 3 — 4</span>
            </SectionHeading>
          </div>

          <p className="text-white/30 leading-[1.75] max-w-xs lg:pb-1" style={{ fontSize: "14px" }}>
            From booking to clean car — our process is designed around your convenience.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={stepsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={stepsView ? "visible" : "hidden"}
              className="group relative"
            >
              {/* Connector — desktop only */}
              {i < PROCESS_STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-8 left-[calc(100%+6px)] right-[-6px] h-px bg-white/[0.07] z-10"
                  aria-hidden="true"
                />
              )}

              <div
                className="h-full bg-white/[0.025] border border-white/[0.07] rounded-2xl p-7
                           hover:bg-white/[0.055] hover:border-white/20
                           transition-all duration-500"
              >
                {/* Big ghost number */}
                <span
                  className="text-white/[0.07] block mb-5 group-hover:text-white/[0.12] transition-colors duration-500"
                  style={{ fontFamily: SERIF, fontSize: "56px", fontWeight: 300, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3 className="text-white mb-2" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "18px" }}>
                  {step.title}
                </h3>
                <p className="text-white/35 leading-[1.7]" style={{ fontSize: "13px" }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={stepsView ? "visible" : "hidden"}
          className="flex justify-center"
        >
          <a
            href="/bookings"
            className="group flex items-center justify-between gap-4 h-13 pl-7 pr-3 bg-white text-black
                       rounded-full hover:bg-gray-100 active:scale-[0.97] transition-all duration-300"
          >
            <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
              Start Booking
            </span>
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center
                            group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-400">
              <ArrowRight size={14} className="text-white" />
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 5 — SERVICES PREVIEW
// ══════════════════════════════════════════════════════════
const ServicesPreview = memo(function ServicesPreview() {
  const leftRef   = useRef(null)
  const rightRef  = useRef(null)
  const leftView  = useInView(leftRef,  { once: true, margin: "-60px" })
  const rightView = useInView(rightRef, { once: true, margin: "-60px" })

  return (
    <section className="w-full bg-white py-24 md:py-36 lg:py-44" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">

          {/* Text */}
          <motion.div
            ref={leftRef}
            variants={fadeLeft}
            initial="hidden"
            animate={leftView ? "visible" : "hidden"}
          >
            <Eyebrow>Our Services</Eyebrow>
            <SectionHeading className="mb-7">
              What We<br /><span className="text-black/18 italic">Clean</span>
            </SectionHeading>

            <p className="text-black/42 leading-[1.8] mb-10 max-w-md" style={{ fontSize: "15px" }}>
              Cars, sofas, water tanks — we cover it all at your doorstep.
              Fast, safe, and hassle-free cleaning across Duliajan.
            </p>

            {/* Services list */}
            <div className="mb-11 border-t border-black/[0.07]">
              {SERVICES_LIST.map((service, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={leftView ? "visible" : "hidden"}
                  className="group flex items-center justify-between py-4 border-b border-black/[0.07]
                             hover:pl-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Check size={12} className="text-black/20 shrink-0" strokeWidth={2} />
                    <span
                      className="text-black group-hover:text-black/50 transition-colors duration-300"
                      style={{ fontSize: "14px" }}
                    >
                      {service.name}
                    </span>
                  </div>
                  <span className="text-black/35 tabular-nums" style={{ fontFamily: SERIF, fontSize: "14px" }}>
                    {service.price}
                  </span>
                </motion.div>
              ))}
            </div>

            <a
              href="/services"
              className="group inline-flex items-center gap-4 h-12 pl-7 pr-3 bg-black text-white
                         rounded-full hover:bg-black/80 active:scale-[0.97] transition-all duration-300"
            >
              <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
                View All Services
              </span>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center
                              group-hover:bg-white/20 transition-colors duration-300">
                <ArrowRight size={13} className="text-white" />
              </div>
            </a>
          </motion.div>

          {/* Image */}
          <motion.div
            ref={rightRef}
            variants={fadeRight}
            initial="hidden"
            animate={rightView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={IMAGES.services}
                alt="Professional car detailing"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={rightView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
                className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md
                           p-5 rounded-xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} fill="black" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-black/45 leading-snug" style={{ fontSize: "12px" }}>
                  <span className="text-black font-medium">100+ customers</span> trust us in Duliajan
                </p>
              </motion.div>
            </div>

            {/* Decorative square */}
            <div className="absolute -bottom-5 -right-5 w-28 h-28 border border-black/8 rounded-2xl -z-10" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 6 — CONTACT
// ══════════════════════════════════════════════════════════
const Contact = memo(function Contact() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  const items = [
    { Icon: Phone,  label: "Call Us",   value: BUSINESS.phone,   href: `tel:${BUSINESS.phone}` },
    { Icon: Mail,   label: "Email",     value: BUSINESS.email,   href: `mailto:${BUSINESS.email}` },
    { Icon: MapPin, label: "Location",  value: BUSINESS.address, href: null },
    { Icon: Clock,  label: "Hours",     value: BUSINESS.hours,   href: null },
  ]

  return (
    <section
      ref={ref}
      className="w-full bg-[#f7f7f5] py-24 md:py-28"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-14 md:flex md:items-end md:justify-between"
        >
          <div>
            <div className="flex items-center gap-4 mb-7">
              <span className="w-10 h-px bg-black/25" />
              <span className="tracking-[0.38em] uppercase text-black/30" style={{ fontSize: "9px" }}>
                Get In Touch
              </span>
            </div>
            <SectionHeading>
              We're Just a<br /><span className="text-black/18 italic">Call Away</span>
            </SectionHeading>
          </div>

          <motion.a
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            href={`tel:${BUSINESS.phone}`}
            className="group hidden md:inline-flex items-center gap-4 h-13 pl-7 pr-3
                       bg-black text-white rounded-full hover:bg-black/80
                       active:scale-[0.97] transition-all duration-300 self-end"
          >
            <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
              Call Now
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                            group-hover:bg-white/20 transition-colors duration-300">
              <Phone size={13} className="text-white" strokeWidth={1.5} />
            </div>
          </motion.a>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map(({ Icon, label, value, href }, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="group bg-white rounded-2xl p-7 border border-transparent
                         hover:border-black/10 hover:shadow-xl hover:shadow-black/[0.04]
                         transition-all duration-500"
            >
              <div className="w-11 h-11 rounded-xl bg-black/[0.03] flex items-center justify-center mb-6
                             group-hover:bg-black transition-colors duration-500">
                <Icon size={17} strokeWidth={1.4}
                  className="text-black/40 group-hover:text-white transition-colors duration-500" />
              </div>

              <p className="text-black/28 tracking-[0.2em] uppercase mb-2" style={{ fontSize: "9px" }}>
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  className="text-black hover:text-black/50 transition-colors duration-200 leading-snug block"
                  style={{ fontSize: "13px" }}
                >
                  {value}
                </a>
              ) : (
                <p className="text-black leading-snug" style={{ fontSize: "13px" }}>
                  {value}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Nexxupp credit — inside section */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center text-black/25 mt-14 tracking-[0.15em] uppercase"
          style={{ fontSize: "10px", fontFamily: SANS }}
        >
          Designed &amp; Developed by{" "}
          <span className="text-black/55 font-medium">Nexxupp</span>
        </motion.p>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// FOOTER STRIP
// ══════════════════════════════════════════════════════════
const FooterStrip = memo(function FooterStrip() {
  return (
    <footer
      className="w-full bg-black py-6 border-t border-white/[0.06]"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16
                      flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/20 tracking-[0.15em] uppercase" style={{ fontSize: "9px" }}>
          © {new Date().getFullYear()} Wash2Door · Duliajan, Assam
        </p>
        <p className="text-white/20 tracking-[0.15em] uppercase" style={{ fontSize: "9px" }}>
          Designed &amp; Developed by{" "}
          <span className="text-white/45 font-medium">Nexxupp</span>
        </p>
      </div>
    </footer>
  )
})

// ══════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════
export default function AboutPage() {
  return (
    <main>
      <Hero />
      <Story />
      <Features />
      <Process />
      <ServicesPreview />
      <Contact />
      <FooterStrip />
    </main>
  )
}
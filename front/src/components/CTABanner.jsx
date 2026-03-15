"use client"

import { useRef, memo } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Phone, Clock, MapPin, Sparkles, Zap } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const INFO_ITEMS = [
  { icon: Clock, text: "9AM – 5PM", label: "Open Daily" },
  { icon: MapPin, text: "Duliajan", label: "All Areas" },
  { icon: Phone, text: "6900706456", label: "Quick Response", href: "tel:6900706456" },
]

const FEATURES = [
  "Professional Team",
  "Eco-Friendly Products",
  "100% Satisfaction",
  "Doorstep Service",
]

// ── Animation Variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// ── Availability Badge ─────────────────────────────────────
const AvailabilityBadge = memo(function AvailabilityBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 
                 border border-emerald-500/20 rounded-full"
    >
      <span className="relative flex">
        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full bg-emerald-400 w-2.5 h-2.5" />
      </span>
      <span className="text-emerald-400 text-sm tracking-wide">Available Today</span>
    </motion.div>
  )
})

// ── Mobile CTA (CLEAN REDESIGN) ───────────────────────────
const MobileCTA = memo(function MobileCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="md:hidden space-y-6"
    >
      {/* Main black card - Simplified */}
      <motion.div variants={scaleIn} className="relative">
        <div className="bg-black rounded-3xl p-8 overflow-hidden text-center">
          {/* Subtle background */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="mb-6 flex justify-center">
              <AvailabilityBadge />
            </div>

            {/* Heading */}
            <h2
              className="text-white mb-4"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "32px",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Ready for a{" "}
              <span className="italic text-white/40">Spotless Ride?</span>
            </h2>

            {/* Simple description */}
            <p className="text-white/50 mb-8 max-w-[280px] mx-auto" style={{ fontSize: "15px" }}>
              Professional car wash at your doorstep in Duliajan
            </p>

            {/* Price */}
            <div className="mb-8">
              <p className="text-white/40 text-xs mb-1">Starting from</p>
              <p
                className="text-white"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "48px",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                }}
              >
                ₹299
              </p>
            </div>

            {/* Primary CTA */}
            <motion.a
              href="/bookings"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 h-14 px-10
                         bg-white text-black rounded-full no-underline
                         hover:bg-gray-100 transition-all duration-300"
            >
              <span className="tracking-wider uppercase text-sm font-medium">
                Book Now
              </span>
              <ArrowRight size={18} strokeWidth={2} />
            </motion.a>

            {/* Simple phone link */}
            <a
              href="tel:6900706456"
              className="block mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              or call 6900706456
            </a>
          </div>
        </div>
      </motion.div>

      {/* Info pills - Clean grid below */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-3 gap-3"
      >
        {INFO_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={fadeInUp}
            className="bg-gray-50 rounded-2xl p-4 text-center"
          >
            <item.icon size={20} className="mx-auto mb-2 text-gray-600" />
            <p className="text-gray-900 text-sm font-medium">{item.text}</p>
            <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust indicator - Simple */}
      <motion.div
        variants={fadeInUp}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 text-gray-400">
          <Sparkles size={14} />
          <span className="text-xs tracking-wider uppercase">
            100+ Happy Customers
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
})

// ── Desktop CTA (keeping the good one) ─────────────────────
const DesktopCTA = memo(function DesktopCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="hidden md:block"
    >
      {/* Main container with gradient border */}
      <div className="relative p-1 rounded-[3rem] bg-gradient-to-br from-white/10 via-white/5 to-white/10">
        <div className="relative bg-black rounded-[2.8rem] overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 p-12 lg:p-16">
            {/* Left: Content */}
            <motion.div variants={staggerContainer} className="flex flex-col justify-center">
              {/* Badge */}
              <div className="mb-8">
                <AvailabilityBadge />
              </div>

              {/* Heading */}
              <motion.h2
                variants={fadeInUp}
                className="text-white mb-6"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                Ready for a{" "}
                <span className="italic text-white/40">Spotless Ride?</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={fadeInUp}
                className="text-white/50 leading-relaxed mb-10 max-w-lg"
                style={{ fontSize: "17px" }}
              >
                Book your professional car wash in under 2 minutes. We come to you — 
                home, office, anywhere in Duliajan. Experience the convenience of doorstep service.
              </motion.p>

              {/* Features list */}
              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-3 mb-10">
                {FEATURES.map((feature, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeInUp}
                    className="flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-white/60 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={staggerContainer}
                className="flex flex-wrap gap-4"
              >
                <motion.a
                  variants={fadeInUp}
                  href="/bookings"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 h-14 px-10
                             bg-white text-black rounded-full no-underline
                             hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
                >
                  <span className="tracking-wider uppercase text-sm font-medium">
                    Book Now
                  </span>
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </motion.a>

                <motion.a
                  variants={fadeInUp}
                  href="tel:6900706456"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 h-14 px-10
                             border border-white/20 text-white rounded-full no-underline
                             hover:bg-white/5 hover:border-white/30 transition-all duration-300"
                >
                  <Phone size={18} strokeWidth={1.5} />
                  <span className="tracking-wider uppercase text-sm">Call Now</span>
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Right: Info & Price */}
            <motion.div variants={staggerContainer} className="flex flex-col justify-center">
              {/* Info grid */}
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 mb-8"
              >
                {INFO_ITEMS.map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeInRight}
                    className={`group ${item.href ? "cursor-pointer" : ""}`}
                    onClick={() => item.href && window.open(item.href, '_self')}
                  >
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 
                                   rounded-2xl hover:bg-white/10 hover:border-white/20 
                                   transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center 
                                     group-hover:bg-white/20 transition-colors duration-300">
                        <item.icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.text}</p>
                        <p className="text-white/40 text-xs">{item.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Price showcase */}
              <motion.div variants={fadeInRight} className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl" />
                
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 
                               border border-white/20 rounded-3xl p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap size={20} className="text-yellow-400" />
                    <span className="text-yellow-400 text-sm tracking-wide uppercase">
                      Limited Time Offer
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-white/40 text-xs mb-1">Starting from</p>
                    <p
                      className="text-white"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: "48px",
                        fontWeight: 300,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹299
                    </p>
                    <p className="text-white/50 text-sm">Per wash</p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Sparkles size={14} className="text-white/40" />
                    <span className="text-white/50 text-sm">Save ₹50 on first booking</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative z-10 border-t border-white/10 px-12 lg:px-16 py-6"
          >
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { value: "100+", label: "Happy Customers" },
                { value: "4.9★", label: "Average Rating" },
                { value: "2min", label: "Booking Time" },
                { value: "365", label: "Days Available" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-white text-lg font-medium">{stat.value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function CTABanner() {
  return (
    <section
      className="w-full bg-white py-12 md:py-24 lg:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-label="Book your car wash service"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <MobileCTA />
        <DesktopCTA />
      </div>
    </section>
  )
}
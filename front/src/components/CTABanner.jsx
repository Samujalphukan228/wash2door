"use client"

import { useRef, memo } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Phone, Clock, MapPin, Sparkles, Check } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const INFO_ITEMS = [
  { icon: Clock,  text: "9AM – 5PM",   label: "Open Daily",      href: null           },
  { icon: MapPin, text: "Duliajan",     label: "All Areas",       href: null           },
  { icon: Phone,  text: "6900706456",  label: "Quick Response",  href: "tel:6900706456" },
]

const FEATURES = [
  "Professional Team",
  "Eco-Friendly Products",
  "100% Satisfaction",
  "Doorstep Service",
]

const TRUST_STATS = [
  { value: "100+",  label: "Happy Customers" },
  { value: "4.9★",  label: "Average Rating"  },
  { value: "2min",  label: "Booking Time"    },
  { value: "365",   label: "Days Available"  },
]

const SERIF = 'Georgia, "Times New Roman", serif'
const EASE  = [0.22, 1, 0.36, 1]

// ── Shared animation variants ──────────────────────────────
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

const fadeRight = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

// ── PulsingDot ─────────────────────────────────────────────
function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping"
        style={{ animationDuration: "2s" }} />
      <span className="relative inline-flex rounded-full h-full w-full bg-white" />
    </span>
  )
}

// ── AvailabilityBadge ──────────────────────────────────────
function AvailabilityBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="inline-flex items-center gap-2 px-3.5 py-1.5
                 border border-white/20 bg-white/10 rounded-full"
    >
      <PulsingDot />
      <span className="text-white/80 tracking-wider uppercase" style={{ fontSize: "10px" }}>
        Available Today
      </span>
    </motion.div>
  )
}

// ── DecorativeNumber ───────────────────────────────────────
// Large serif watermark behind the price — adds editorial depth
function DecorativeNumber({ children, light = false }) {
  return (
    <div
      className={`select-none pointer-events-none ${light ? "text-white/[0.06]" : "text-black/[0.04]"}`}
      style={{
        fontFamily: SERIF,
        fontSize: "clamp(140px, 22vw, 220px)",
        fontWeight: 300,
        lineHeight: 0.85,
        letterSpacing: "-0.04em",
      }}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

// ── Mobile CTA ─────────────────────────────────────────────
const MobileCTA = memo(function MobileCTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="md:hidden space-y-4"
    >
      {/* Black card */}
      <motion.div variants={fadeUp}>
        <div className="relative bg-black rounded-[2rem] p-7 overflow-hidden border border-white/10">
          {/* Atmosphere */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/[0.08] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.05] rounded-full blur-3xl" />
          </div>

          {/* Decorative watermark price */}
          <div className="absolute -bottom-4 -right-4 overflow-hidden rounded-[2rem]">
            <DecorativeNumber light>299</DecorativeNumber>
          </div>

          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-5">
              <AvailabilityBadge />
            </div>

            <h2
              className="text-white mb-3"
              style={{
                fontFamily: SERIF, fontWeight: 300,
                fontSize: "clamp(1.75rem, 8vw, 2.2rem)",
                lineHeight: 1.15, letterSpacing: "-0.025em",
              }}
            >
              Ready for a{" "}
              <span className="italic text-white/35">Spotless Ride?</span>
            </h2>

            <p className="text-white/50 mb-7 max-w-[280px] mx-auto leading-relaxed"
              style={{ fontSize: "14px" }}>
              Professional car wash at your doorstep in Duliajan
            </p>

            {/* Price */}
            <div className="mb-7">
              <p className="text-white/30 tracking-wider uppercase mb-1" style={{ fontSize: "9px" }}>
                Starting from
              </p>
              <p className="text-white leading-none"
                style={{ fontFamily: SERIF, fontSize: "52px", fontWeight: 300, letterSpacing: "-0.03em" }}>
                ₹299
              </p>
            </div>

            <motion.a
              whileTap={{ scale: 0.97 }}
              href="/bookings"
              className="group inline-flex items-center gap-3 h-12 px-8
                         bg-white text-black rounded-full no-underline
                         hover:bg-white/90 transition-colors duration-300"
            >
              <span className="tracking-wider uppercase font-medium" style={{ fontSize: "11px" }}>
                Book Now
              </span>
              <ArrowRight size={15} strokeWidth={2}
                className="group-hover:translate-x-0.5 transition-transform duration-300" />
            </motion.a>

            <a href="tel:6900706456"
              className="block mt-4 text-white/40 hover:text-white/60 transition-colors duration-300"
              style={{ fontSize: "12px" }}>
              or call 6900706456
            </a>
          </div>
        </div>
      </motion.div>

      {/* Info pills */}
      <motion.div variants={stagger} className="grid grid-cols-3 gap-2.5">
        {INFO_ITEMS.map((item, i) => {
          const Tag = item.href ? "a" : "div"
          return (
            <motion.div key={i} variants={fadeUp}>
              <Tag href={item.href || undefined}
                className="block bg-white/10 rounded-2xl p-3.5 text-center no-underline
                           hover:bg-white/15 transition-colors duration-200 border border-white/10">
                <item.icon size={18} strokeWidth={1.5} className="mx-auto mb-2 text-white/50" />
                <p className="text-white leading-tight" style={{ fontFamily: SERIF, fontSize: "12px" }}>
                  {item.text}
                </p>
                <p className="text-white/40 mt-0.5" style={{ fontSize: "9px" }}>{item.label}</p>
              </Tag>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Trust line */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 py-1">
        <Sparkles size={12} className="text-white/30" />
        <span className="text-white/40 tracking-wider uppercase" style={{ fontSize: "9px" }}>
          100+ Happy Customers in Duliajan
        </span>
      </motion.div>
    </motion.div>
  )
})

// ── Desktop CTA ────────────────────────────────────────────
const DesktopCTA = memo(function DesktopCTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="hidden md:block"
    >
      <div className="relative bg-black rounded-[2.5rem] overflow-hidden border border-white/10">

        {/* ── Atmosphere ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.08] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/[0.05] rounded-full blur-3xl" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }} />
        </div>

        {/* ── Main grid ── */}
        <div className="relative z-10 grid lg:grid-cols-2 gap-0">

          {/* Left: copy */}
          <motion.div
            variants={stagger}
            className="p-10 lg:p-14 xl:p-16 flex flex-col justify-center
                       border-r border-white/[0.07]"
          >
            <motion.div variants={fadeUp} className="mb-8">
              <AvailabilityBadge />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-white mb-6"
              style={{
                fontFamily: SERIF, fontWeight: 300,
                fontSize: "clamp(2.4rem, 4.5vw, 3.75rem)",
                lineHeight: 1.05, letterSpacing: "-0.025em",
              }}
            >
              Ready for a{" "}
              <span className="italic text-white/30">Spotless Ride?</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-white/50 leading-relaxed mb-10 max-w-md"
              style={{ fontSize: "16px" }}
            >
              Book your professional car wash in under 2 minutes. We come to
              you — home, office, anywhere in Duliajan.
            </motion.p>

            {/* Features */}
            <motion.div variants={stagger} className="grid grid-cols-2 gap-y-3 gap-x-4 mb-10">
              {FEATURES.map((f, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Check size={9} strokeWidth={2.5} className="text-white" />
                  </div>
                  <span className="text-white/60" style={{ fontSize: "13px" }}>{f}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={stagger} className="flex flex-wrap gap-3">
              <motion.a
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/bookings"
                className="group inline-flex items-center gap-3 h-12 px-8
                           bg-white text-black rounded-full no-underline
                           hover:bg-white/90 hover:shadow-xl hover:shadow-white/15
                           transition-all duration-300"
              >
                <span className="tracking-wider uppercase font-medium" style={{ fontSize: "11px" }}>
                  Book Now
                </span>
                <ArrowRight size={15} strokeWidth={2}
                  className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </motion.a>

              <motion.a
                variants={fadeUp}
                whileTap={{ scale: 0.97 }}
                href="tel:6900706456"
                className="group inline-flex items-center gap-2.5 h-12 px-7
                           border border-white/20 text-white rounded-full no-underline
                           hover:bg-white/10 hover:border-white/40
                           transition-all duration-300"
              >
                <Phone size={14} strokeWidth={1.5} />
                <span className="tracking-wider uppercase" style={{ fontSize: "11px" }}>Call Now</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right: info + price */}
          <motion.div
            variants={stagger}
            className="p-10 lg:p-14 xl:p-16 flex flex-col justify-between"
          >
            {/* Info cards */}
            <motion.div variants={stagger} className="space-y-3 mb-8">
              {INFO_ITEMS.map((item, i) => {
                const Tag = item.href ? motion.a : motion.div
                return (
                  <Tag
                    key={i}
                    variants={fadeRight}
                    href={item.href || undefined}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4 p-4 bg-white/[0.08] border border-white/[0.12]
                               rounded-2xl hover:bg-white/[0.12] hover:border-white/20
                               transition-colors duration-300 no-underline cursor-default"
                    style={{ cursor: item.href ? "pointer" : "default" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <item.icon size={17} strokeWidth={1.5} className="text-white/70" />
                    </div>
                    <div>
                      <p className="text-white leading-tight" style={{ fontFamily: SERIF, fontSize: "14px" }}>
                        {item.text}
                      </p>
                      <p className="text-white/40" style={{ fontSize: "10px" }}>{item.label}</p>
                    </div>
                  </Tag>
                )
              })}
            </motion.div>

            {/* Price card — with decorative watermark number */}
            <motion.div variants={fadeRight} className="relative">
              <div className="relative bg-white/[0.08] border border-white/15 rounded-2xl p-7 overflow-hidden">
                {/* Big watermark "299" behind everything */}
                <div className="absolute -bottom-6 -right-3 overflow-hidden pointer-events-none select-none">
                  <DecorativeNumber light>299</DecorativeNumber>
                </div>

                <div className="relative z-10">
                  <p className="text-white/30 tracking-wider uppercase mb-2" style={{ fontSize: "9px" }}>
                    Starting from
                  </p>
                  <p className="text-white leading-none mb-1"
                    style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 300, letterSpacing: "-0.03em" }}>
                    ₹299
                  </p>
                  <p className="text-white/40" style={{ fontSize: "12px" }}>per wash · no hidden fees</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom trust bar ── */}
        <motion.div
          variants={fadeUp}
          className="relative z-10 border-t border-white/[0.07] px-10 lg:px-14 py-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            {TRUST_STATS.map(({ value, label }, i) => (
              <div key={i} className="text-center">
                <p className="text-white leading-none"
                  style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 300 }}>
                  {value}
                </p>
                <p className="text-white/30 tracking-wider uppercase mt-1" style={{ fontSize: "8px" }}>
                  {label}
                </p>
              </div>
            ))}

            {/* Inline CTA link in the trust bar */}
            <a href="/bookings"
              className="group hidden xl:flex items-center gap-2 text-white/40 hover:text-white/70
                         transition-colors duration-300 no-underline ml-auto">
              <span className="tracking-wider uppercase" style={{ fontSize: "9px" }}>Get Started</span>
              <span className="h-px bg-current w-5 group-hover:w-9 transition-all duration-300" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
})

// ── Main ───────────────────────────────────────────────────
export default function CTABanner() {
  return (
    <section
      className="w-full bg-black py-12 md:py-24 lg:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-label="Book your car wash service"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        <MobileCTA />
        <DesktopCTA />
      </div>
    </section>
  )
}
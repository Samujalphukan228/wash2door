"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { ArrowUpRight, Phone } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const STATS = [
  { value: "100+", label: "Cars Cleaned" },
  { value: "4.8★", label: "Star Rating" },
  { value: "2hr", label: "Avg Service" },
]

const HEADLINE_LINES = [
  { text: "The Shine", italic: false },
  { text: "That Finds", italic: true },
  { text: "You.", italic: false },
]

const SERVICES = ["Car Wash", "Sofa Cleaning", "Water Tank"]

const BG_IMAGE =
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop"

const WHATSAPP_URL =
  "https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"

// ── Animation Variants ─────────────────────────────────────
const headlineLine = {
  hidden: { opacity: 0, y: 80 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 * i },
  }),
}

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
}

const scaleXVariant = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
}

const bgReveal = {
  hidden: { opacity: 0, scale: 1.08 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
  },
}

const accentLine = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
}

// ── Parallax Background Component ──────────────────────────
function ParallaxBackground({ sectionRef }) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const y = useTransform(smoothProgress, [0, 1], ["0%", "40%"])
  const scale = useTransform(smoothProgress, [0, 1], [1, 1.15])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={bgReveal}
      style={{ y, scale, opacity }}
      className="absolute inset-0 will-change-transform"
    >
      <img
        src={BG_IMAGE}
        alt=""
        role="presentation"
        width={2400}
        height={1600}
        className="w-full h-[120%] object-cover"
        style={{ filter: "brightness(0.35) contrast(1.05) saturate(0.9)" }}
        loading="eager"
      />
    </motion.div>
  )
}

// ── Gradient Overlay ───────────────────────────────────────
function GradientOverlays() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

      {/* Left fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/30 to-transparent" />

      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-neutral-950/80 to-transparent" />

      {/* Right accent */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-neutral-950/60 to-transparent hidden lg:block" />

      {/* Subtle noise */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

// ── Subcomponents ──────────────────────────────────────────

function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400" />
    </span>
  )
}

function StatusBadge({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex items-center gap-2 px-3.5 py-2 border border-white/10
                 rounded-full bg-white/[0.04] backdrop-blur-md"
    >
      <PulsingDot />
      <span
        className="tracking-[0.2em] uppercase text-white/60"
        style={{ fontSize: "9px" }}
      >
        {label}
      </span>
    </motion.div>
  )
}

function BookButton({ fullWidth = false }) {
  return (
    <motion.a
      href="/bookings"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex items-center justify-center gap-3
                  px-8 py-4 border border-white/15 overflow-hidden rounded-[4px]
                  hover:border-white/30 transition-all duration-300
                  ${fullWidth ? "w-full min-h-[52px]" : ""}`}
      aria-label="Book a car wash appointment"
    >
      <span
        className="absolute inset-0 bg-white origin-bottom scale-y-0
                   group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        aria-hidden="true"
      />
      <span
        className="relative z-10 tracking-[0.2em] uppercase text-white
                   group-hover:text-neutral-950 transition-colors duration-500"
        style={{ fontSize: "10.5px", fontWeight: 500 }}
      >
        Book Now
      </span>
      <ArrowUpRight
        size={14}
        strokeWidth={1.5}
        className="relative z-10 text-white group-hover:text-neutral-950
                   transition-all duration-500 group-hover:translate-x-0.5
                   group-hover:-translate-y-0.5"
      />
    </motion.a>
  )
}

function WhatsAppLink({ fullWidth = false }) {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={`group inline-flex items-center gap-2.5 py-3
                  text-white/30 hover:text-emerald-400
                  transition-colors duration-300 ${fullWidth ? "justify-center" : ""}`}
      aria-label="Contact us on WhatsApp"
    >
      <Phone
        size={13}
        strokeWidth={1.5}
        className="group-hover:rotate-12 transition-transform duration-300"
      />
      <span
        className="tracking-[0.18em] uppercase"
        style={{ fontSize: "10px" }}
      >
        WhatsApp Us
      </span>
    </motion.a>
  )
}

function StatItem({ value, label, align = "left", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.1 + delay * 0.08 }}
      className={align === "right" ? "text-right" : ""}
    >
      <p
        className="text-white leading-none"
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 300,
          fontSize:
            align === "right" ? "clamp(1.8rem, 3.5vw, 2.5rem)" : "24px",
        }}
      >
        {value}
      </p>
      <p
        className="tracking-[0.25em] uppercase text-white/25 mt-1.5"
        style={{ fontSize: "8px" }}
      >
        {label}
      </p>
    </motion.div>
  )
}

// ── Headline Block ─────────────────────────────────────────
function HeadlineBlock({ size = "mobile", sectionRef }) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  const fontSize =
    size === "desktop"
      ? "clamp(4.5rem, 9vw, 9rem)"
      : "clamp(2.8rem, 10vw, 4.5rem)"

  return (
    <motion.div
      style={{ opacity, y }}
      className={size === "desktop" ? "mb-12 lg:mb-16" : "mb-6"}
    >
      {HEADLINE_LINES.map(({ text, italic }, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={headlineLine}
          className="overflow-hidden"
        >
          <h1
            className={`will-change-transform ${
              italic ? "text-white/40 italic" : "text-white"
            }`}
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize,
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
            }}
          >
            {text}
          </h1>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Service Link ───────────────────────────────────────────
function ServiceLink({ service, index }) {
  return (
    <motion.a
      href="/Services"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1.3 + index * 0.05 }}
      className="tracking-[0.2em] uppercase text-white/20
                 hover:text-white/50 transition-colors duration-300 group"
      style={{ fontSize: "9px" }}
    >
      {service}
      <span
        className="block h-px bg-white/20 w-0 group-hover:w-full
                   transition-all duration-300 mt-0.5"
      />
    </motion.a>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function Hero() {
  const sectionRef = useRef(null)

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden bg-neutral-950"
      aria-label="Hero section"
    >
      {/* ── Parallax Background Image ── */}
      <ParallaxBackground sectionRef={sectionRef} />

      {/* ── Gradient Overlays ── */}
      <GradientOverlays />

      {/* ── Left Accent Line (Desktop) ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={accentLine}
        className="absolute left-0 top-0 w-px h-full origin-top hidden md:block z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent 95%)",
        }}
        aria-hidden="true"
      />

      {/* ── Watermark ── */}
      <div
        className="absolute -right-8 -bottom-12 select-none pointer-events-none hidden lg:block z-0"
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 300,
          fontSize: "22vw",
          lineHeight: 0.8,
          color: "rgba(255,255,255,0.015)",
          letterSpacing: "-0.05em",
        }}
        aria-hidden="true"
      >
        SHINE
      </div>

      {/* ═══════════════════════════════════
          MOBILE LAYOUT
      ═══════════════════════════════════ */}
      <div className="relative z-10 min-h-screen flex flex-col md:hidden px-5 py-6">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-auto">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tracking-[0.3em] uppercase text-white/45"
            style={{ fontFamily: "Georgia, serif", fontSize: "9px" }}
          >
            Duliajan
          </motion.span>
          <StatusBadge label="Open · 9–5" />
        </header>

        {/* Content — bottom aligned */}
        <div className="mt-auto">
          <HeadlineBlock size="mobile" sectionRef={sectionRef} />

          {/* Description + CTAs */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-7"
          >
            <p
              className="text-white/35 leading-[1.8] mb-7 max-w-[290px]"
              style={{ fontSize: "13px", letterSpacing: "0.02em" }}
            >
              Professional car &amp; home cleaning at your doorstep — fast,
              safe &amp; hassle-free.
            </p>

            <div className="flex flex-col gap-3">
              <BookButton fullWidth />
              <WhatsAppLink fullWidth />
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <div className="flex justify-between">
              {STATS.map((stat, i) => (
                <StatItem
                  key={i}
                  value={stat.value}
                  label={stat.label}
                  delay={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          DESKTOP LAYOUT
      ═══════════════════════════════════ */}
      <div className="relative z-10 min-h-screen hidden md:flex flex-col px-10 lg:px-16 xl:px-24 py-8 lg:py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <span className="w-8 h-px bg-white/20" aria-hidden="true" />
            <span
              className="tracking-[0.3em] uppercase text-white/40"
              style={{ fontFamily: "Georgia, serif", fontSize: "11px" }}
            >
              Doorstep Car Care · Duliajan
            </span>
          </motion.div>
          <StatusBadge label="Open · 9AM – 5PM" />
        </header>

        {/* Main content — vertically centered */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[1600px] mx-auto">
            <HeadlineBlock size="desktop" sectionRef={sectionRef} />

            {/* Bottom row */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-12"
            >
              {/* Left: description + CTAs */}
              <div className="flex items-end gap-8 lg:gap-10">
                {/* Vertical line */}
                <div
                  className="w-px h-20 shrink-0 hidden sm:block bg-gradient-to-b from-white/[0.12] to-transparent"
                  aria-hidden="true"
                />
                <div>
                  <p
                    className="tracking-[0.12em] text-white/35 leading-[1.9] mb-7 max-w-md"
                    style={{ fontSize: "12px" }}
                  >
                    Professional car &amp; home cleaning at your doorstep —
                    fast, safe &amp; hassle-free.
                  </p>
                  <div className="flex flex-wrap items-center gap-5">
                    <BookButton />
                    <WhatsAppLink />
                  </div>
                </div>
              </div>

              {/* Right: stats */}
              <div className="flex items-end gap-8 lg:gap-12 mt-10 lg:mt-0">
                {STATS.map((stat, i) => (
                  <StatItem
                    key={i}
                    value={stat.value}
                    label={stat.label}
                    align="right"
                    delay={i}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom bar */}
        <footer className="mt-auto pt-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleXVariant}
            className="w-full h-px bg-white/[0.06] mb-5 origin-left"
            aria-hidden="true"
          />
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-between gap-4"
          >
            {/* Service links */}
            <nav
              className="flex items-center gap-6 lg:gap-8"
              aria-label="Quick service links"
            >
              {SERVICES.map((service, i) => (
                <ServiceLink key={i} service={service} index={i} />
              ))}
            </nav>

            {/* All Services link */}
            <motion.a
              href="/Services"
              whileHover={{ gap: 8 }}
              className="flex items-center gap-3 text-white/25 hover:text-white/60
                         transition-colors duration-300 group"
            >
              <span
                className="tracking-[0.25em] uppercase"
                style={{ fontSize: "9px" }}
              >
                All Services
              </span>
              <span
                className="h-px bg-current w-5 group-hover:w-10
                           transition-all duration-300"
                aria-hidden="true"
              />
            </motion.a>
          </motion.div>
        </footer>
      </div>
    </section>
  )
}
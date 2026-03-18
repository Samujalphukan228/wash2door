// components/Hero.jsx
"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { ArrowUpRight, Phone } from "lucide-react"

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

const BG_IMAGE = "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop"
const WHATSAPP_URL = "https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"
const SERIF = 'Georgia, "Times New Roman", serif'
const EASE = [0.22, 1, 0.36, 1]

const headlineLine = {
  hidden: { opacity: 0, y: 80 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 0.15 * i } }),
}

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.6 } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.8 } },
}

const scaleXVariant = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease: EASE, delay: 0.5 } },
}

const bgReveal = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.8, ease: EASE } },
}

const accentLine = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1.4, ease: EASE, delay: 0.3 } },
}

function ParallaxBackground({ sectionRef }) {
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const y = useTransform(smoothProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(smoothProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.85, 0.7])

  return (
    <motion.div initial="hidden" animate="visible" variants={bgReveal} style={{ y, scale, opacity }} className="absolute inset-0 overflow-hidden will-change-transform">
      <div className="absolute inset-0 w-full h-full">
        <img
          src={BG_IMAGE}
          alt=""
          role="presentation"
          className="w-full h-[130%] object-cover object-center"
          style={{ filter: "brightness(0.35) contrast(1.05) saturate(0.9)", minHeight: "100%" }}
          loading="eager"
        />
      </div>
    </motion.div>
  )
}

function GradientOverlays() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 via-30% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/20 via-40% to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 md:h-40 bg-gradient-to-b from-neutral-950/70 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-neutral-950/50 to-transparent hidden lg:block" />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />
    </div>
  )
}

function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400" />
    </span>
  )
}

function StatusBadge({ label }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 border border-white/10 rounded-full bg-white/[0.04] backdrop-blur-md shrink-0">
      <PulsingDot />
      <span className="tracking-[0.15em] md:tracking-[0.2em] uppercase text-white/60 whitespace-nowrap text-[8px] md:text-[9px]">
        {label}
      </span>
    </motion.div>
  )
}

function BookButton({ fullWidth = false }) {
  return (
    <motion.a
      href="/bookings"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-8 md:py-4 border border-white/15 overflow-hidden rounded-[4px] hover:border-white/30 transition-all duration-300 ${fullWidth ? "w-full" : ""}`}
      aria-label="Book a car wash appointment"
    >
      <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" aria-hidden="true" />
      <span className="relative z-10 tracking-[0.15em] md:tracking-[0.2em] uppercase text-white group-hover:text-neutral-950 transition-colors duration-500 text-[10px] md:text-[10.5px] font-medium">
        Book Now
      </span>
      <ArrowUpRight size={14} strokeWidth={1.5} className="relative z-10 text-white group-hover:text-neutral-950 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
    </motion.a>
  )
}

function WhatsAppLink({ fullWidth = false }) {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group inline-flex items-center gap-2.5 py-3 text-white/35 hover:text-emerald-400 transition-colors duration-300 ${fullWidth ? "justify-center w-full" : ""}`}
      aria-label="Contact us on WhatsApp"
    >
      <Phone size={13} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform duration-300" />
      <span className="tracking-[0.15em] md:tracking-[0.18em] uppercase text-[9px] md:text-[10px]">WhatsApp Us</span>
    </motion.a>
  )
}

function StatItem({ value, label, align = "left", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.1 + delay * 0.1 }}
      className={`${align === "right" ? "text-right" : ""} flex-1 md:flex-none`}
    >
      <p className="text-white leading-none font-light" style={{ fontFamily: SERIF, fontSize: align === "right" ? "clamp(1.5rem, 3vw, 2.5rem)" : "clamp(1.25rem, 4vw, 1.5rem)" }}>
        {value}
      </p>
      <p className="tracking-[0.2em] md:tracking-[0.25em] uppercase text-white/30 mt-1 md:mt-1.5 text-[7px] md:text-[8px]">
        {label}
      </p>
    </motion.div>
  )
}

function HeadlineBlock({ size = "mobile", sectionRef }) {
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -40])
  const fontSize = size === "desktop" ? "clamp(3.5rem, 8vw, 8rem)" : "clamp(2.5rem, 12vw, 4rem)"

  return (
    <motion.div style={{ opacity, y }} className={size === "desktop" ? "mb-10 lg:mb-14" : "mb-6"}>
      {HEADLINE_LINES.map(({ text, italic }, i) => (
        <motion.div key={`headline-${i}`} custom={i} initial="hidden" animate="visible" variants={headlineLine} className="overflow-hidden">
          <h1
            className={`will-change-transform ${italic ? "text-white/45 italic" : "text-white"}`}
            style={{ fontFamily: SERIF, fontWeight: 300, fontSize, lineHeight: 0.95, letterSpacing: "-0.02em" }}
          >
            {text}
          </h1>
        </motion.div>
      ))}
    </motion.div>
  )
}

function ServiceLink({ service, index }) {
  return (
    <motion.a
      href="/Services"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1.3 + index * 0.08 }}
      className="tracking-[0.15em] md:tracking-[0.2em] uppercase text-white/25 hover:text-white/60 transition-colors duration-300 group text-[8px] md:text-[9px]"
    >
      {service}
      <span className="block h-px bg-white/30 w-0 group-hover:w-full transition-all duration-300 mt-0.5" aria-hidden="true" />
    </motion.a>
  )
}

export default function Hero() {
  const sectionRef = useRef(null)

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[600px] max-h-[1200px] overflow-hidden bg-neutral-950" aria-label="Hero section">
      <ParallaxBackground sectionRef={sectionRef} />
      <GradientOverlays />

      {/* Left accent line */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={accentLine}
        className="absolute left-6 lg:left-10 top-0 w-px h-full origin-top hidden md:block z-[2]"
        style={{ background: "linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.08) 75%, transparent 90%)" }}
        aria-hidden="true"
      />

      {/* Watermark */}
      <div
        className="absolute -right-4 bottom-20 select-none pointer-events-none hidden lg:block z-0"
        style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(10rem, 18vw, 20rem)", lineHeight: 0.8, color: "rgba(255,255,255,0.02)", letterSpacing: "-0.05em" }}
        aria-hidden="true"
      >
        SHINE
      </div>

      {/* ── Mobile Layout ── */}
      <div className="relative z-10 h-full flex flex-col md:hidden px-5 pt-5 pb-8">
        <header className="flex items-center justify-between shrink-0">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tracking-[0.25em] uppercase text-white/50 text-[8px]"
            style={{ fontFamily: SERIF }}
          >
            Duliajan
          </motion.span>
          <StatusBadge label="Open · 9–5" />
        </header>

        <div className="flex-1 min-h-[60px]" />

        <div className="shrink-0">
          <HeadlineBlock size="mobile" sectionRef={sectionRef} />

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-6">
            <p className="text-white/40 leading-[1.75] mb-6 max-w-[300px] text-[12px] tracking-wide">
              Professional car &amp; home cleaning at your doorstep — fast, safe &amp; hassle-free.
            </p>
            <div className="flex flex-col gap-2">
              <BookButton fullWidth />
              <WhatsAppLink fullWidth />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} className="pt-5 border-t border-white/[0.08]">
            <div className="flex justify-between gap-4">
              {STATS.map((stat, i) => (
                <StatItem key={`stat-mobile-${i}`} value={stat.value} label={stat.label} delay={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="relative z-10 h-full hidden md:flex flex-col px-10 lg:px-16 xl:px-24 py-8 lg:py-10">
        <header className="flex items-center justify-between shrink-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex items-center gap-4">
            <span className="w-8 h-px bg-white/20" aria-hidden="true" />
            <span className="tracking-[0.25em] uppercase text-white/45 text-[10px] lg:text-[11px]" style={{ fontFamily: SERIF }}>
              Doorstep Car Care · Duliajan
            </span>
          </motion.div>
          <StatusBadge label="Open · 9AM – 5PM" />
        </header>

        <div className="flex-1 flex items-center py-8">
          <div className="w-full max-w-[1400px]">
            <HeadlineBlock size="desktop" sectionRef={sectionRef} />

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
              <div className="flex items-end gap-6 lg:gap-8">
                <div className="w-px h-16 lg:h-20 shrink-0 bg-gradient-to-b from-white/10 to-transparent" aria-hidden="true" />
                <div>
                  <p className="tracking-wide text-white/40 leading-[1.85] mb-6 max-w-sm lg:max-w-md text-[11px] lg:text-[12px]">
                    Professional car &amp; home cleaning at your doorstep — fast, safe &amp; hassle-free.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 lg:gap-5">
                    <BookButton />
                    <WhatsAppLink />
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-6 lg:gap-10">
                {STATS.map((stat, i) => (
                  <StatItem key={`stat-desktop-${i}`} value={stat.value} label={stat.label} align="right" delay={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <footer className="shrink-0">
          <motion.div initial="hidden" animate="visible" variants={scaleXVariant} className="w-full h-px bg-white/[0.08] mb-4 lg:mb-5 origin-left" aria-hidden="true" />
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-5 lg:gap-7" aria-label="Quick service links">
              {SERVICES.map((service, i) => (
                <ServiceLink key={`service-${i}`} service={service} index={i} />
              ))}
            </nav>
            <motion.a href="/Services" whileHover={{ x: 3 }} className="flex items-center gap-3 text-white/30 hover:text-white/60 transition-colors duration-300 group">
              <span className="tracking-[0.2em] uppercase text-[8px] lg:text-[9px]">All Services</span>
              <span className="h-px bg-current w-4 group-hover:w-8 transition-all duration-300" aria-hidden="true" />
            </motion.a>
          </motion.div>
        </footer>
      </div>
    </section>
  )
}
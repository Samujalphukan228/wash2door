// components/Hero.jsx
"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { ArrowRight, Phone, Droplets, Shield, Clock, ChevronDown } from "lucide-react"

/* ─── Constants ─── */
const STATS = [
  { value: "100+", label: "Cars Serviced", icon: Droplets },
  { value: "4.8", label: "Star Rating", icon: Shield },
  { value: "2hr", label: "Avg Turnaround", icon: Clock },
]

const SERVICES_MARQUEE = [
  "Exterior Wash",
  "Interior Detailing",
  "Sofa Cleaning",
  "Water Tank Cleaning",
  "Ceramic Coating",
  "Engine Bay Wash",
]

const BG_IMAGE =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=90&w=2800&auto=format&fit=crop"

const WHATSAPP_URL =
  "https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const EASE = [0.22, 1, 0.36, 1]

/* ─── Subcomponents ─── */
function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400" />
    </span>
  )
}

function ServicesMarquee() {
  const doubled = [...SERVICES_MARQUEE, ...SERVICES_MARQUEE]
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((service, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <span
              className="text-white/20 tracking-[0.25em] uppercase"
              style={{ fontSize: "10px", fontFamily: SANS }}
            >
              {service}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 hidden md:flex"
    >
      <span
        className="text-white/20 tracking-[0.3em] uppercase"
        style={{ fontSize: "7px", fontFamily: SANS }}
      >
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={14} className="text-white/20" />
      </motion.div>
    </motion.div>
  )
}

function useGreeting() {
  const [greeting, setGreeting] = useState("")
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening")
  }, [])
  return greeting
}

/* ─── Main Component ─── */
export default function Hero() {
  const sectionRef = useRef(null)
  const greeting = useGreeting()

  /* Gentle fade‑dim on scroll — no parallax movement */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 40, damping: 20 })
  const bgOpacity = useTransform(smoothScroll, [0, 0.5], [1, 0.6])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-svh min-h-[660px] overflow-hidden bg-black"
      aria-label="Hero section"
    >
      {/* ─── Background (static, no parallax) ─── */}
      <motion.div className="absolute inset-0" style={{ opacity: bgOpacity }}>
        <img
          src={BG_IMAGE}
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.32) contrast(1.1) saturate(0.7)" }}
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* ─── Overlays ─── */}
      <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black via-black/75 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/50 to-transparent" />
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ═══════════ MOBILE + TABLET (< lg) ═══════════ */}
      <div className="relative z-10 h-full flex flex-col lg:hidden px-5 sm:px-8">
        {/* Top */}
        <div className="flex items-center justify-between pt-5 sm:pt-6 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center">
              <Droplets size={10} className="text-white/35" />
            </div>
            <span
              className="text-white/25 tracking-[0.25em] uppercase"
              style={{ fontSize: "8px", fontFamily: SANS, fontWeight: 500 }}
            >
              Wash2Door
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl"
          >
            <PulsingDot />
            <span
              className="text-white/35 tracking-[0.15em] uppercase"
              style={{ fontSize: "7px", fontFamily: SANS }}
            >
              Accepting Bookings
            </span>
          </motion.div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Content */}
        <div className="shrink-0 pb-7 sm:pb-10">
          {/* Greeting tag */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-7 h-px bg-gradient-to-r from-emerald-400/50 to-transparent" />
            <span
              className="text-emerald-400/50 tracking-[0.3em] uppercase"
              style={{ fontSize: "8px", fontFamily: SANS }}
            >
              {greeting}
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mb-4">
            {["Pristine", "Car Care,"].map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.1, duration: 1, ease: EASE }}
                className="overflow-hidden"
              >
                <h1
                  className="text-white leading-[0.92]"
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 300,
                    fontSize: "clamp(2.8rem, 12vw, 5.5rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {line}
                </h1>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 1, ease: EASE }}
              className="overflow-hidden mt-0.5"
            >
              <h1
                className="leading-[0.92]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: "clamp(2.4rem, 10vw, 5rem)",
                  letterSpacing: "-0.02em",
                  color: "rgba(255,255,255,0.14)",
                  fontStyle: "italic",
                }}
              >
                Delivered.
              </h1>
            </motion.div>
          </div>

          {/* Accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
            className="flex items-center gap-3 origin-left mb-5"
          >
            <div className="w-10 h-px bg-gradient-to-r from-emerald-400/40 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-emerald-400/30" />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="text-white/30 leading-[1.75] mb-7 sm:mb-8"
            style={{
              fontSize: "12px",
              fontFamily: SANS,
              maxWidth: "300px",
              letterSpacing: "0.015em",
            }}
          >
            Premium doorstep car cleaning in Duliajan. Book in seconds — we
            bring everything. You just unlock the car.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10"
          >
            <a
              href="/bookings"
              className="group relative flex items-center justify-between px-6 h-[52px] sm:h-[54px] bg-white rounded-full overflow-hidden flex-1 sm:flex-initial sm:min-w-[220px]"
            >
              <div className="absolute inset-0 bg-emerald-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <span
                className="relative z-10 tracking-[0.2em] uppercase text-black"
                style={{ fontSize: "9px", fontFamily: SANS, fontWeight: 600 }}
              >
                Book Your Wash
              </span>
              <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black flex items-center justify-center group-hover:rotate-[-45deg] transition-transform duration-500">
                <ArrowRight size={13} className="text-white" />
              </div>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2.5 h-[50px] sm:h-[54px] px-6 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-white/30 hover:text-white/55 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-500 sm:min-w-[180px]"
            >
              <Phone size={12} strokeWidth={1.5} />
              <span
                className="tracking-[0.2em] uppercase"
                style={{ fontSize: "8px", fontFamily: SANS }}
              >
                WhatsApp Us
              </span>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="grid grid-cols-3 gap-2.5 sm:gap-3"
          >
            {STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.07 }}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <Icon size={11} className="text-emerald-400/30 mb-2.5" strokeWidth={1.5} />
                  <p
                    className="text-white leading-none mb-1"
                    style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(18px, 5vw, 24px)" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-white/18 tracking-[0.12em] uppercase"
                    style={{ fontSize: "6.5px", fontFamily: SANS }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* ═══════════ DESKTOP (>= lg) ═══════════ */}
      <div className="relative z-10 h-full hidden lg:flex flex-col px-16 xl:px-24 2xl:px-32 py-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full border border-white/12 flex items-center justify-center">
              <Droplets size={13} className="text-white/25" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-white/30 tracking-[0.3em] uppercase"
                style={{ fontSize: "9px", fontFamily: SANS, fontWeight: 500 }}
              >
                Wash2Door
              </span>
              <span
                className="text-white/12 tracking-[0.18em] uppercase"
                style={{ fontSize: "7px", fontFamily: SANS }}
              >
                Duliajan, Assam
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-5"
          >
            <span
              className="text-white/18 tracking-[0.12em]"
              style={{ fontSize: "11px", fontFamily: SANS }}
            >
              {greeting}
            </span>
            <div className="w-px h-4 bg-white/8" />
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
              <PulsingDot />
              <span
                className="text-white/35 tracking-[0.18em] uppercase"
                style={{ fontSize: "8px", fontFamily: SANS }}
              >
                Open · 9 AM – 5 PM
              </span>
            </div>
          </motion.div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col justify-end pb-4">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-8 h-px bg-gradient-to-r from-emerald-400/50 to-transparent" />
            <span
              className="text-emerald-400/45 tracking-[0.35em] uppercase"
              style={{ fontSize: "9px", fontFamily: SANS }}
            >
              Premium Doorstep Detailing
            </span>
          </motion.div>

          {/* Headline + Right Column */}
          <div className="flex items-end justify-between gap-16 xl:gap-20 mb-14">
            {/* Headline */}
            <div className="shrink-0 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 55 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1.1, ease: EASE }}
                className="overflow-hidden"
              >
                <h1
                  className="text-white leading-[0.88] whitespace-nowrap"
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 300,
                    fontSize: "clamp(4rem, 7vw, 8.5rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Pristine
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 55 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.1, ease: EASE }}
                className="overflow-hidden"
              >
                <h1
                  className="text-white leading-[0.88] whitespace-nowrap"
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 300,
                    fontSize: "clamp(4rem, 7vw, 8.5rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Car Care
                  <span className="text-emerald-400/25">,</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 55 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1.1, ease: EASE }}
                className="overflow-hidden mt-1"
              >
                <h1
                  className="leading-[0.88] whitespace-nowrap"
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 300,
                    fontSize: "clamp(3.5rem, 6vw, 7.5rem)",
                    letterSpacing: "-0.02em",
                    color: "rgba(255,255,255,0.1)",
                    fontStyle: "italic",
                  }}
                >
                  Delivered to Your Door.
                </h1>
              </motion.div>
            </div>

            {/* Right column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="shrink-0 w-[280px] xl:w-[300px] pb-2"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-5 h-px bg-gradient-to-r from-emerald-400/35 to-transparent" />
                <div className="w-1 h-1 rounded-full bg-emerald-400/20" />
              </div>

              <p
                className="text-white/28 leading-[1.8] mb-8"
                style={{ fontSize: "13px", fontFamily: SANS, letterSpacing: "0.01em" }}
              >
                Premium car cleaning that comes to you. Book in seconds — we
                arrive fully equipped. You just unlock the car.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/bookings"
                  className="group relative flex items-center justify-between px-7 h-[52px] bg-white rounded-full overflow-hidden hover:shadow-lg hover:shadow-white/5 transition-shadow duration-500"
                >
                  <div className="absolute inset-0 bg-emerald-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <span
                    className="relative z-10 tracking-[0.2em] uppercase text-black"
                    style={{ fontSize: "9px", fontFamily: SANS, fontWeight: 600 }}
                  >
                    Book Your Wash
                  </span>
                  <div className="relative z-10 w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:rotate-[-45deg] transition-transform duration-500">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 h-[50px] rounded-full border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm text-white/28 hover:text-white/50 hover:border-white/12 hover:bg-white/[0.05] transition-all duration-500"
                >
                  <Phone size={12} strokeWidth={1.5} />
                  <span
                    className="tracking-[0.2em] uppercase"
                    style={{ fontSize: "9px", fontFamily: SANS }}
                  >
                    WhatsApp Us
                  </span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
          >
            {/* Marquee */}
            <div className="mb-5">
              <ServicesMarquee />
            </div>

            <div className="w-full h-px bg-white/[0.05] mb-5" />

            <div className="flex items-end justify-between">
              {/* Stats */}
              <div className="flex items-center gap-4 xl:gap-5">
                {STATS.map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.15 + i * 0.07 }}
                      className="group px-5 xl:px-6 py-4 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/[0.08] transition-all duration-500 cursor-default"
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <Icon
                          size={12}
                          className="text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors duration-500"
                          strokeWidth={1.5}
                        />
                        <div className="w-3 h-px bg-white/8" />
                      </div>
                      <p
                        className="text-white leading-none mb-1"
                        style={{
                          fontFamily: SERIF,
                          fontWeight: 300,
                          fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-white/18 tracking-[0.18em] uppercase"
                        style={{ fontSize: "7px", fontFamily: SANS }}
                      >
                        {stat.label}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Quick links */}
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.35 }}
                className="flex items-center gap-7 xl:gap-8"
                aria-label="Quick links"
              >
                {["Services", "About", "Contact"].map((link) => (
                  <a
                    key={link}
                    href={`/${link.toLowerCase()}`}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <span
                      className="text-white/18 group-hover:text-white/45 tracking-[0.22em] uppercase transition-colors duration-400"
                      style={{ fontSize: "8px", fontFamily: SANS }}
                    >
                      {link}
                    </span>
                    <span
                      className="h-px bg-emerald-400/25 w-0 group-hover:w-full transition-all duration-400"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </motion.nav>
            </div>
          </motion.div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  )
}
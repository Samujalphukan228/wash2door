"use client"

import { useRef, useState, useCallback, memo } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Star, ArrowLeft, ArrowRight, Check } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahul Sharma",
    location: "Duliajan",
    rating: 5,
    text: "Absolutely fantastic service! They arrived on time, were extremely professional, and my car looks brand new. Will definitely book again.",
    service: "Premium Wash",
    initials: "RS",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Duliajan",
    rating: 5,
    text: "So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.",
    service: "Standard Wash",
    initials: "PP",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Duliajan",
    rating: 5,
    text: "I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.",
    service: "Premium Wash",
    initials: "AK",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Duliajan",
    rating: 5,
    text: "The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!",
    service: "Basic Wash",
    initials: "SR",
  },
  {
    id: 5,
    name: "Vikram Singh",
    location: "Duliajan",
    rating: 5,
    text: "Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!",
    service: "Standard Wash",
    initials: "VS",
  },
]

const FEATURES = ["Professional team", "Eco-friendly products", "100% satisfaction"]

const STATS = [
  { value: "5.0", label: "Rating"     },
  { value: "500+", label: "Customers" },
  { value: "98%",  label: "Satisfied" },
]

const SERIF = 'Georgia, "Times New Roman", serif'
const EASE  = [0.22, 1, 0.36, 1]

// ── Animation variants ─────────────────────────────────────
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

const fadeLeft = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.55, ease: EASE } },
}

// Directional slide — custom prop carries direction (+1 / -1)
const slide = {
  enter:  (d) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
  exit:   (d) => ({ x: d > 0 ? -80 : 80, opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" } }),
}

// ── StarRating ─────────────────────────────────────────────
const StarRating = memo(function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13}
          className={i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  )
})

// ── Avatar ─────────────────────────────────────────────────
function Avatar({ initials, size = "md", light = false }) {
  const dim = size === "lg" ? "w-14 h-14" : "w-11 h-11"
  const fsize = size === "lg" ? "17px" : "14px"
  return (
    <div className={`${dim} rounded-full flex items-center justify-center shrink-0
                     ${light ? "bg-white" : "bg-black"}`}
      style={light ? { boxShadow: "0 8px 24px -4px rgba(255,255,255,0.2)" } : {}}>
      <span className={light ? "text-black" : "text-white"}
        style={{ fontFamily: SERIF, fontSize: fsize, fontWeight: 400 }}>
        {initials}
      </span>
    </div>
  )
}

// ── DotNav ─────────────────────────────────────────────────
function DotNav({ count, active, onSelect, light }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button key={i} onClick={() => onSelect(i)}
          aria-label={`Testimonial ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-400
                      ${i === active
                        ? `w-8 ${light ? "bg-white" : "bg-black"}`
                        : `w-1.5 ${light ? "bg-white/30 hover:bg-white/60" : "bg-gray-200 hover:bg-gray-400"}`}`} />
      ))}
    </div>
  )
}

// ── NavButtons ─────────────────────────────────────────────
function NavButtons({ onPrev, onNext }) {
  return (
    <>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onPrev}
        aria-label="Previous testimonial"
        className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center
                   hover:border-black hover:bg-black hover:text-white transition-all duration-300">
        <ArrowLeft size={17} strokeWidth={2} />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onNext}
        aria-label="Next testimonial"
        className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center
                   hover:bg-gray-800 hover:scale-105 transition-all duration-300">
        <ArrowRight size={17} strokeWidth={2} />
      </motion.button>
    </>
  )
}

// ── Section header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.header
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mb-12 md:mb-20"
    >
      <motion.div variants={fadeLeft} className="flex items-center gap-4 mb-5">
        <span className="block w-10 h-px bg-black" aria-hidden="true" />
        <span className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: SERIF, fontSize: "10px" }}>
          Customer Reviews
        </span>
      </motion.div>

      <div className="md:flex md:items-end md:justify-between md:gap-10">
        <motion.h2
          variants={fadeUp}
          id="testimonials-heading"
          className="text-black mb-4 md:mb-0"
          style={{
            fontFamily: SERIF, fontWeight: 300,
            fontSize: "clamp(2rem, 7vw, 3.5rem)",
            lineHeight: 1.05, letterSpacing: "-0.03em",
          }}
        >
          Real Stories,
          <br className="hidden sm:block" />
          <span className="text-gray-300">Real Shine</span>
        </motion.h2>

        {/* Stats — right-aligned on desktop, below heading on mobile */}
        <motion.div
          variants={fadeUp}
          className="flex gap-6 md:gap-8"
        >
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="md:text-right">
              <p className="text-black leading-none"
                style={{ fontFamily: SERIF, fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 300 }}>
                {value}
              </p>
              <p className="text-gray-400 tracking-wider uppercase mt-1" style={{ fontSize: "9px" }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.header>
  )
})

// ── Desktop testimonial card (black panel + info sidebar) ──
function DesktopCard({ t, dir }) {
  return (
    <motion.div
      key={t.id}
      custom={dir}
      variants={slide}
      initial="enter"
      animate="center"
      exit="exit"
      className="grid md:grid-cols-5 gap-8 lg:gap-12 items-stretch"
    >
      {/* Left: black quote panel */}
      <div className="md:col-span-3">
        <div className="relative bg-black rounded-[2rem] p-8 lg:p-12 overflow-hidden h-full">
          {/* Atmosphere */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <StarRating rating={t.rating} />

            <blockquote
              className="text-white/88 my-8 flex-1"
              style={{
                fontFamily: SERIF, fontWeight: 300,
                fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)",
                lineHeight: 1.55, letterSpacing: "-0.01em",
              }}
            >
              "{t.text}"
            </blockquote>

            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <Avatar initials={t.initials} size="lg" light />
              <div>
                <cite className="text-white not-italic block"
                  style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 400 }}>
                  {t.name}
                </cite>
                <p className="text-white/40" style={{ fontSize: "12px" }}>{t.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: info card */}
      <motion.div
        className="md:col-span-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
      >
        <div className="bg-gray-50 rounded-[2rem] p-8 h-full flex flex-col">
          <p className="text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px" }}>
            Service Booked
          </p>
          <h3 className="text-black mb-8"
            style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 400 }}>
            {t.service}
          </h3>

          <div className="space-y-3 flex-1">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-gray-600" style={{ fontSize: "13px" }}>{f}</span>
              </div>
            ))}
          </div>

          <motion.a
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            href="/bookings"
            className="inline-flex items-center gap-2 mt-8 text-black no-underline group"
          >
            <span className="tracking-wider uppercase border-b border-black pb-0.5
                             group-hover:border-gray-400 transition-colors duration-300"
              style={{ fontSize: "10px", fontWeight: 500 }}>
              Book this service
            </span>
            <ArrowRight size={13}
              className="group-hover:translate-x-0.5 transition-transform duration-300" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Desktop testimonials ───────────────────────────────────
const DesktopTestimonials = memo(function DesktopTestimonials() {
  const [[idx, dir], setSlide] = useState([0, 1])

  const go = useCallback((next) => {
    setSlide(([cur]) => [next, next > cur ? 1 : -1])
  }, [])

  const prev = useCallback(() => {
    setSlide(([cur]) => [(cur - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, -1])
  }, [])

  const next = useCallback(() => {
    setSlide(([cur]) => [(cur + 1) % TESTIMONIALS.length, 1])
  }, [])

  return (
    <div className="hidden md:block">
      <AnimatePresence custom={dir} mode="wait">
        <DesktopCard key={TESTIMONIALS[idx].id} t={TESTIMONIALS[idx]} dir={dir} />
      </AnimatePresence>

      <div className="flex items-center justify-center gap-5 mt-10">
        <NavButtons onPrev={prev} onNext={next} />
        <DotNav count={TESTIMONIALS.length} active={idx} onSelect={go} />
      </div>
    </div>
  )
})

// ── Mobile testimonials ────────────────────────────────────
const MobileTestimonials = memo(function MobileTestimonials() {
  const [[idx, dir], setSlide] = useState([0, 1])

  const go = useCallback((next) => {
    setSlide(([cur]) => [next, next >= cur ? 1 : -1])
  }, [])

  const prev = useCallback(() => {
    setSlide(([cur]) => [(cur - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, -1])
  }, [])

  const next = useCallback(() => {
    setSlide(([cur]) => [(cur + 1) % TESTIMONIALS.length, 1])
  }, [])

  const t = TESTIMONIALS[idx]

  return (
    <div className="md:hidden">
      {/* Card */}
      <div className="overflow-hidden mb-6">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={t.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={t.initials} />
              <div className="flex-1 min-w-0">
                <cite className="text-black block not-italic truncate"
                  style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 400 }}>
                  {t.name}
                </cite>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{t.location}</p>
              </div>
              <StarRating rating={t.rating} />
            </div>

            {/* Quote */}
            <blockquote
              className="text-gray-700 mb-5 leading-relaxed"
              style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "15px", lineHeight: 1.65 }}
            >
              "{t.text}"
            </blockquote>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 tracking-wider uppercase"
                style={{ fontSize: "9px" }}>
                {t.service}
              </span>
              <span className="text-gray-300" style={{ fontSize: "11px" }}>
                {idx + 1} / {TESTIMONIALS.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <NavButtons onPrev={prev} onNext={next} />
        <DotNav count={TESTIMONIALS.length} active={idx} onSelect={go} />
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <motion.a
          whileTap={{ scale: 0.97 }}
          href="/bookings"
          className="inline-flex items-center gap-3 h-13 h-12 px-8
                     bg-black text-white rounded-full no-underline
                     hover:bg-gray-900 transition-colors duration-300 w-full justify-center sm:w-auto"
        >
          <span className="tracking-wider uppercase" style={{ fontSize: "11px", fontWeight: 500 }}>
            Book Your First Wash
          </span>
          <ArrowRight size={14} strokeWidth={2} />
        </motion.a>
      </div>
    </div>
  )
})

// ── Main ───────────────────────────────────────────────────
export default function Testimonials() {
  return (
    <section
      className="w-full bg-white py-16 md:py-28 lg:py-36"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        <SectionHeader />
        <DesktopTestimonials />
        <MobileTestimonials />
      </div>
    </section>
  )
}
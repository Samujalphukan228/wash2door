// components/Testimonials.jsx
"use client"

import { useRef, useState, useCallback, useEffect, memo } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Star, ArrowLeft, ArrowRight, Check, Quote } from "lucide-react"

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
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Duliajan",
    rating: 5,
    text: "So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.",
    service: "Standard Wash",
    initials: "PP",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Duliajan",
    rating: 5,
    text: "I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.",
    service: "Premium Wash",
    initials: "AK",
    date: "3 weeks ago",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Duliajan",
    rating: 5,
    text: "The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!",
    service: "Basic Wash",
    initials: "SR",
    date: "1 week ago",
  },
  {
    id: 5,
    name: "Vikram Singh",
    location: "Duliajan",
    rating: 5,
    text: "Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!",
    service: "Standard Wash",
    initials: "VS",
    date: "2 months ago",
  },
]

const FEATURES = [
  "Trained professional team",
  "Eco-friendly products",
  "100% satisfaction guarantee",
]

const STATS = [
  { value: "5.0", label: "Avg Rating" },
  { value: "500+", label: "Happy Customers" },
  { value: "98%", label: "Would Recommend" },
]

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const EASE = [0.22, 1, 0.36, 1]

const AUTO_PLAY_INTERVAL = 6000

// ── Variants ───────────────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const fadeLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const cardVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.98 }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    scale: 0.98,
    transition: { duration: 0.35, ease: "easeIn" },
  }),
}

// ── Star Rating ────────────────────────────────────────────
const StarRating = memo(function StarRating({ rating = 5, size = 14 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? "fill-white/40 text-white/40"
              : "fill-white/15 text-white/15"
          }
        />
      ))}
    </div>
  )
})

// ── Avatar ─────────────────────────────────────────────────
function Avatar({ initials, size = "md", variant = "dark" }) {
  const dims = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  }
  const fonts = {
    sm: "14px",
    md: "15px",
    lg: "18px",
  }

  const bgClass = variant === "light" ? "bg-white" : "bg-white/10"
  const textClass = variant === "light" ? "text-black" : "text-white"
  const borderClass = variant === "light" ? "" : "border border-white/20"
  const shadow =
    variant === "light" ? { boxShadow: "0 8px 24px -6px rgba(0,0,0,0.15)" } : {}

  return (
    <div
      className={`${dims[size]} rounded-full flex items-center justify-center shrink-0 ${bgClass} ${borderClass}`}
      style={shadow}
    >
      <span
        className={textClass}
        style={{ fontFamily: SERIF, fontSize: fonts[size], fontWeight: 400 }}
      >
        {initials}
      </span>
    </div>
  )
}

// ── Dot Navigation ─────────────────────────────────────────
function DotNav({ count, active, onSelect, variant = "dark" }) {
  const activeBg = variant === "light" ? "bg-white" : "bg-white"
  const inactiveBg =
    variant === "light"
      ? "bg-white/30 hover:bg-white/60"
      : "bg-white/20 hover:bg-white/40"

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to testimonial ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === active ? `w-8 ${activeBg}` : `w-1.5 ${inactiveBg}`
          }`}
        />
      ))}
    </div>
  )
}

// ── Arrow Buttons ──────────────────────────────────────────
function ArrowButton({ direction, onClick, variant = "outline" }) {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight
  const label = direction === "left" ? "Previous" : "Next"

  if (variant === "filled") {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        aria-label={`${label} testimonial`}
        className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center
                   hover:bg-white/80 transition-all duration-300"
      >
        <Icon size={16} strokeWidth={2} />
      </motion.button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={`${label} testimonial`}
      className="w-11 h-11 rounded-full border-2 border-white/30 flex items-center justify-center
                 text-white/50 hover:border-white hover:bg-white/10 hover:text-white
                 transition-all duration-300"
    >
      <Icon size={16} strokeWidth={2} />
    </motion.button>
  )
}

// ── Section Header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.header
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mb-12 md:mb-16 lg:mb-20"
    >
      {/* Tag */}
      <motion.div variants={fadeLeft} className="flex items-center gap-4 mb-6">
        <span className="block w-10 h-px bg-white/20" aria-hidden="true" />
        <span
          className="tracking-[0.35em] uppercase text-white/50"
          style={{ fontSize: "10px", fontFamily: SANS, fontWeight: 500 }}
        >
          Customer Reviews
        </span>
      </motion.div>

      <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
        {/* Headline */}
        <div className="mb-6 lg:mb-0">
          <motion.h2
            variants={fadeUp}
            id="testimonials-heading"
            className="text-white"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Real Stories,
          </motion.h2>
          <motion.h2
            variants={fadeUp}
            className="text-white/15"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontStyle: "italic",
            }}
          >
            Real Shine.
          </motion.h2>
        </div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="flex gap-8 lg:gap-10 lg:pb-1">
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="lg:text-right">
              <p
                className="text-white leading-none mb-1"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  fontWeight: 400,
                }}
              >
                {value}
              </p>
              <p
                className="text-white/40 tracking-[0.12em] uppercase"
                style={{ fontSize: "9px", fontFamily: SANS }}
              >
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.header>
  )
})

// ── Desktop Card ───────────────────────────────────────────
function DesktopTestimonialCard({ testimonial, direction }) {
  const t = testimonial

  return (
    <motion.div
      key={t.id}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-stretch"
    >
      {/* Left: Quote Card */}
      <div className="lg:col-span-3">
        <div className="relative bg-white/[0.04] border border-white/10 rounded-3xl p-8 lg:p-10 xl:p-12 h-full overflow-hidden backdrop-blur-md">
          {/* Ambient effects */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/[0.08] rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/[0.06] rounded-full blur-[80px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Quote icon */}
            <div className="mb-6">
              <Quote
                size={32}
                strokeWidth={1}
                className="text-white/10 fill-white/5"
              />
            </div>

            {/* Stars */}
            <StarRating rating={t.rating} size={16} />

            {/* Quote text */}
            <blockquote
              className="text-white/85 my-8 flex-1"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(1.25rem, 2vw, 1.625rem)",
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
              }}
            >
              "{t.text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <Avatar initials={t.initials} size="lg" variant="light" />
              <div className="flex-1">
                <cite
                  className="text-white not-italic block"
                  style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 400 }}
                >
                  {t.name}
                </cite>
                <p className="text-white/40" style={{ fontSize: "12px", fontFamily: SANS }}>
                  {t.location} · {t.date}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Info Card */}
      <motion.div
        className="lg:col-span-2"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
      >
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 h-full flex flex-col backdrop-blur-md">
          {/* Service */}
          <div className="mb-8">
            <p
              className="text-white/40 tracking-[0.15em] uppercase mb-2"
              style={{ fontSize: "9px", fontFamily: SANS }}
            >
              Service Booked
            </p>
            <h3
              className="text-white"
              style={{ fontFamily: SERIF, fontSize: "24px", fontWeight: 400 }}
            >
              {t.service}
            </h3>
          </div>

          {/* Features */}
          <div className="space-y-4 flex-1">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={2.5} className="text-white" />
                </div>
                <span
                  className="text-white/60"
                  style={{ fontSize: "14px", fontFamily: SANS }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/bookings"
            className="group inline-flex items-center gap-2 mt-8 text-white no-underline"
          >
            <span
              className="tracking-[0.12em] uppercase border-b border-white/40 pb-0.5
                         group-hover:border-white transition-colors duration-300"
              style={{ fontSize: "10px", fontWeight: 500, fontFamily: SANS }}
            >
              Book This Service
            </span>
            <ArrowRight
              size={13}
              strokeWidth={2}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Desktop Testimonials ───────────────────────────────────
const DesktopTestimonials = memo(function DesktopTestimonials() {
  const [[index, direction], setSlide] = useState([0, 1])
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next) => {
    setSlide(([current]) => [next, next > current ? 1 : -1])
  }, [])

  const prev = useCallback(() => {
    setSlide(([current]) => [
      (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
      -1,
    ])
  }, [])

  const next = useCallback(() => {
    setSlide(([current]) => [(current + 1) % TESTIMONIALS.length, 1])
  }, [])

  // Auto-play
  useEffect(() => {
    if (paused) return
    const id = setInterval(next, AUTO_PLAY_INTERVAL)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <div
      className="hidden md:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={direction} mode="wait">
        <DesktopTestimonialCard
          key={TESTIMONIALS[index].id}
          testimonial={TESTIMONIALS[index]}
          direction={direction}
        />
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 mt-10">
        <ArrowButton direction="left" onClick={prev} variant="outline" />
        <DotNav count={TESTIMONIALS.length} active={index} onSelect={goTo} />
        <ArrowButton direction="right" onClick={next} variant="filled" />
      </div>

      <p
        className="text-center text-white/30 mt-4"
        style={{ fontSize: "11px", fontFamily: SANS }}
      >
        Hover to pause · Auto-advances every 6s
      </p>
    </div>
  )
})

// ── Mobile Card ────────────────────────────────────────────
function MobileTestimonialCard({ testimonial, direction }) {
  const t = testimonial

  return (
    <motion.div
      key={t.id}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar initials={t.initials} size="md" />
        <div className="flex-1 min-w-0">
          <cite
            className="text-white block not-italic truncate"
            style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 400 }}
          >
            {t.name}
          </cite>
          <p
            className="text-white/40"
            style={{ fontSize: "11px", fontFamily: SANS }}
          >
            {t.location} · {t.date}
          </p>
        </div>
        <StarRating rating={t.rating} size={12} />
      </div>

      {/* Quote */}
      <blockquote
        className="text-white/70 mb-5"
        style={{
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: "15px",
          lineHeight: 1.7,
        }}
      >
        "{t.text}"
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span
          className="px-3 py-1.5 rounded-full bg-white/10 text-white/50 tracking-[0.1em] uppercase"
          style={{ fontSize: "9px", fontFamily: SANS }}
        >
          {t.service}
        </span>
      </div>
    </motion.div>
  )
}

// ── Mobile Testimonials ────────────────────────────────────
const MobileTestimonials = memo(function MobileTestimonials() {
  const [[index, direction], setSlide] = useState([0, 1])

  const goTo = useCallback((next) => {
    setSlide(([current]) => [next, next >= current ? 1 : -1])
  }, [])

  const prev = useCallback(() => {
    setSlide(([current]) => [
      (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
      -1,
    ])
  }, [])

  const next = useCallback(() => {
    setSlide(([current]) => [(current + 1) % TESTIMONIALS.length, 1])
  }, [])

  // Swipe support
  const touchRef = useRef(0)
  const onTouchStart = useCallback((e) => {
    touchRef.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback(
    (e) => {
      const dx = touchRef.current - e.changedTouches[0].clientX
      if (Math.abs(dx) < 50) return
      if (dx > 0) next()
      else prev()
    },
    [next, prev]
  )

  return (
    <div className="md:hidden">
      {/* Card */}
      <div
        className="mb-6 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence custom={direction} mode="wait">
          <MobileTestimonialCard
            key={TESTIMONIALS[index].id}
            testimonial={TESTIMONIALS[index]}
            direction={direction}
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <ArrowButton direction="left" onClick={prev} variant="outline" />
        <DotNav count={TESTIMONIALS.length} active={index} onSelect={goTo} />
        <ArrowButton direction="right" onClick={next} variant="filled" />
      </div>

      {/* Counter */}
      <p
        className="text-center text-white/30 mb-8"
        style={{ fontSize: "11px", fontFamily: SANS }}
      >
        Swipe or tap arrows · {index + 1} of {TESTIMONIALS.length}
      </p>

      {/* CTA */}
      <div className="flex justify-center">
        <a
          href="/services"
          className="group relative inline-flex items-center justify-center gap-3
                     w-full sm:w-auto h-14 px-10 bg-white text-black
                     rounded-full no-underline overflow-hidden
                     hover:shadow-xl hover:shadow-white/10 transition-shadow duration-500"
        >
          <div
            className="absolute inset-0 bg-white/80
                       -translate-x-full group-hover:translate-x-0
                       transition-transform duration-600 ease-out"
            aria-hidden="true"
          />
          <span
            className="relative z-10 tracking-[0.14em] uppercase"
            style={{ fontSize: "11px", fontWeight: 500, fontFamily: SANS }}
          >
            Book Your First Wash
          </span>
          <ArrowRight
            size={15}
            strokeWidth={2}
            className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
          />
        </a>
      </div>
    </div>
  )
})

// ── Main ───────────────────────────────────────────────────
export default function Testimonials() {
  return (
    <section
      className="w-full bg-black py-20 md:py-28 lg:py-36"
      style={{ fontFamily: SANS }}
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <SectionHeader />
        <DesktopTestimonials />
        <MobileTestimonials />
      </div>
    </section>
  )
}
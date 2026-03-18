// components/HowItWorks.jsx
"use client"

import { useRef, useState, useEffect, useCallback, memo } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  CalendarCheck,
  Car,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const STEPS = [
  {
    id: "choose",
    icon: Car,
    number: "01",
    title: "Choose Your Service",
    description:
      "Pick from exterior wash, interior detailing, sofa cleaning, water tank cleaning and more — all tailored to your needs.",
  },
  {
    id: "location",
    icon: MapPin,
    number: "02",
    title: "Share Your Location",
    description:
      "We come to you — home, office, or anywhere in Duliajan. No need to drive anywhere.",
  },
  {
    id: "time",
    icon: CalendarCheck,
    number: "03",
    title: "Pick a Time Slot",
    description:
      "Flexible scheduling 7 days a week. Morning, afternoon, or evening — whatever suits you best.",
  },
  {
    id: "relax",
    icon: Sparkles,
    number: "04",
    title: "Sit Back & Relax",
    description:
      "Our trained experts arrive on time with professional equipment. Spotless results, guaranteed.",
  },
]

const STATS = [
  { value: "2 min", label: "To Book" },
  { value: "2 hrs", label: "Avg Service" },
  { value: "100%", label: "Satisfaction" },
]

const INTERVAL_MS = 5000
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const EASE = [0.22, 1, 0.36, 1]

// ── Auto-play hook ─────────────────────────────────────────
function useAutoPlay({ length, paused, onAdvance }) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (paused) {
      setProgress(0)
      return
    }

    startRef.current = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / INTERVAL_MS) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        onAdvance()
        startRef.current = Date.now()
        setProgress(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, onAdvance, length])

  return progress
}

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

const contentSwap = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
}

// ── Progress Ring ──────────────────────────────────────────
const ProgressRing = memo(function ProgressRing({ progress, size = 48 }) {
  const r = (size - 4) / 2
  const circ = r * 2 * Math.PI
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={2}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={2.5}
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (progress / 100) * circ}
        style={{ transition: "stroke-dashoffset 80ms linear" }}
      />
    </svg>
  )
})

// ── Showcase Card ──────────────────────────────────────────
const ShowcaseCard = memo(function ShowcaseCard({ step, progress, showProgress }) {
  const Icon = step.icon

  return (
    <div className="relative bg-black rounded-3xl overflow-hidden w-full h-full">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.04] rounded-full blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/[0.03] rounded-full blur-[60px]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.06), transparent 70%)",
          }}
        />
      </div>

      {/* Progress */}
      {showProgress && (
        <div className="absolute top-5 right-5 z-20">
          <div className="relative">
            <ProgressRing progress={progress} size={44} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-white/80"
                style={{ fontSize: "11px", fontWeight: 600, fontFamily: SANS }}
              >
                {step.number}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 sm:p-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            variants={contentSwap}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center"
          >
            {/* Icon */}
            <div
              className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center mb-8"
              style={{ boxShadow: "0 20px 50px -10px rgba(255,255,255,0.2)" }}
            >
              <Icon size={30} strokeWidth={1.4} className="text-black" />
            </div>

            {/* Big number */}
            <span
              className="text-white/[0.05] block mb-4 leading-none select-none"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(72px, 14vw, 100px)",
                fontWeight: 300,
              }}
              aria-hidden="true"
            >
              {step.number}
            </span>

            {/* Title */}
            <h3
              className="text-white mb-3"
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(20px, 4vw, 26px)",
                letterSpacing: "-0.015em",
                lineHeight: 1.2,
              }}
            >
              {step.title}
            </h3>

            {/* Desc */}
            <p
              className="text-white/40 leading-relaxed max-w-[280px]"
              style={{ fontSize: "13px", fontFamily: SANS }}
            >
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
})

// ── Step List Item ─────────────────────────────────────────
function StepListItem({ step, isActive, onClick, progress }) {
  const Icon = step.icon

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl transition-all duration-500 overflow-hidden
        ${
          isActive
            ? "bg-gray-900 text-white shadow-xl shadow-black/10"
            : "bg-gray-50 text-gray-900 hover:bg-gray-100"
        }`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                      transition-all duration-500
            ${isActive ? "bg-white text-black" : "bg-white text-gray-500 shadow-sm"}`}
        >
          <Icon size={18} strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="leading-tight truncate"
            style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 400 }}
          >
            {step.title}
          </p>
          <span
            className={`tracking-[0.15em] uppercase ${
              isActive ? "text-white/40" : "text-gray-400"
            }`}
            style={{ fontSize: "9px", fontFamily: SANS }}
          >
            Step {step.number}
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={16}
          strokeWidth={2}
          className={`shrink-0 transition-all duration-400 ${
            isActive
              ? "text-white/60 translate-x-0"
              : "text-gray-300 -translate-x-1 opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-white/40 origin-left"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.08, ease: "linear" }}
          />
        </div>
      )}
    </button>
  )
}

// ── Dot Nav ────────────────────────────────────────────────
function DotNav({ count, active, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to step ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-500
            ${i === active ? "w-8 bg-black" : "w-1.5 bg-gray-200 hover:bg-gray-400"}`}
        />
      ))}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100 text-center">
      <p
        className="text-black mb-1"
        style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 400 }}
      >
        {value}
      </p>
      <p
        className="text-gray-400 tracking-[0.15em] uppercase"
        style={{ fontSize: "9px", fontFamily: SANS }}
      >
        {label}
      </p>
    </div>
  )
}

// ── Mobile Layout ──────────────────────────────────────────
const MobileLayout = memo(function MobileLayout() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % STEPS.length)
  }, [])

  const progress = useAutoPlay({
    length: STEPS.length,
    paused,
    onAdvance: advance,
  })

  const go = useCallback((next) => setIndex(next), [])

  // Swipe
  const touchRef = useRef(0)
  const onTouchStart = useCallback((e) => {
    touchRef.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback(
    (e) => {
      const dx = touchRef.current - e.changedTouches[0].clientX
      if (Math.abs(dx) < 50) return
      if (dx > 0 && index < STEPS.length - 1) go(index + 1)
      if (dx < 0 && index > 0) go(index - 1)
    },
    [index, go]
  )

  return (
    <div className="lg:hidden">
      {/* Card */}
      <div
        className="aspect-[3/4] sm:aspect-[4/5] mb-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setPaused((p) => !p)}
      >
        <ShowcaseCard step={STEPS[index]} progress={progress} showProgress />
      </div>

      {/* Dots */}
      <div className="flex justify-center mb-8">
        <DotNav count={STEPS.length} active={index} onSelect={go} />
      </div>

      {/* Step list */}
      <div className="space-y-2 mb-8">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
          >
            <StepListItem
              step={step}
              isActive={i === index}
              onClick={() => go(i)}
              progress={i === index ? progress : 0}
            />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
          >
            <StatCard value={s.value} label={s.label} />
          </motion.div>
        ))}
      </div>
    </div>
  )
})

// ── Desktop Layout ─────────────────────────────────────────
const DesktopLayout = memo(function DesktopLayout() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % STEPS.length)
  }, [])

  const progress = useAutoPlay({
    length: STEPS.length,
    paused,
    onAdvance: advance,
  })

  const go = useCallback((next) => setIndex(next), [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + STEPS.length) % STEPS.length)
  }, [])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % STEPS.length)
  }, [])

  const step = STEPS[index]

  return (
    <div
      className="hidden lg:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-5 gap-10 xl:gap-16 items-start">
        {/* Left: Showcase — 3 cols */}
        <div className="lg:col-span-3 sticky top-24">
          <div className="aspect-[5/4] xl:aspect-[4/3]">
            <ShowcaseCard step={step} progress={progress} showProgress={!paused} />
          </div>

          {/* Controls below card */}
          <div className="flex items-center justify-between mt-6">
            <DotNav count={STEPS.length} active={index} onSelect={go} />

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous step"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center
                           hover:border-black hover:bg-black hover:text-white
                           transition-all duration-300 text-gray-600"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <button
                onClick={next}
                aria-label="Next step"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center
                           hover:bg-gray-800 transition-colors duration-300"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Steps + Stats — 2 cols */}
        <div className="lg:col-span-2">
          {/* Step label */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-gray-300 tracking-[0.2em] uppercase"
              style={{ fontSize: "10px", fontFamily: SANS, fontWeight: 500 }}
            >
              Step {step.number} of {String(STEPS.length).padStart(2, "0")}
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Step list */}
          <div className="space-y-2.5 mb-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <StepListItem
                  step={s}
                  isActive={i === index}
                  onClick={() => go(i)}
                  progress={i === index ? progress : 0}
                />
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-6" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
              >
                <StatCard value={s.value} label={s.label} />
              </motion.div>
            ))}
          </div>

          {/* Hover hint */}
          <p
            className="text-center text-gray-300 mt-4"
            style={{ fontSize: "10px", fontFamily: SANS }}
          >
            Hover card to pause · tap steps to navigate
          </p>
        </div>
      </div>
    </div>
  )
})

// ── Section Header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mb-12 md:mb-16 lg:mb-20"
    >
      {/* Tag */}
      <motion.div variants={fadeLeft} className="flex items-center gap-4 mb-6">
        <span className="block w-10 h-px bg-black/20" aria-hidden="true" />
        <span
          className="tracking-[0.35em] uppercase text-gray-400"
          style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 500 }}
        >
          Simple Process
        </span>
      </motion.div>

      <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
        {/* Headline */}
        <div className="mb-4 lg:mb-0">
          <motion.h2
            variants={fadeUp}
            id="how-it-works-heading"
            className="text-black"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            How It Works
          </motion.h2>
          <motion.h2
            variants={fadeUp}
            className="text-black/12"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontStyle: "italic",
            }}
          >
            In Four Steps.
          </motion.h2>
        </div>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-gray-400 max-w-sm leading-[1.7] lg:text-right lg:pb-1"
          style={{ fontSize: "14px", fontFamily: SANS }}
        >
          From choosing a service to enjoying a spotless car — the entire process
          takes just minutes to set up.
        </motion.p>
      </div>
    </motion.div>
  )
})

// ── CTA ────────────────────────────────────────────────────
const BookingCTA = memo(function BookingCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="mt-14 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-4"
    >
      <a
        href="/bookings"
        className="group relative inline-flex items-center justify-center gap-3
                   w-full sm:w-auto h-14 px-10 bg-black text-white
                   rounded-full overflow-hidden no-underline
                   hover:shadow-2xl hover:shadow-black/15 transition-shadow duration-600"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700
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
        <div
          className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                     group-hover:bg-white transition-colors duration-400"
        >
          <ArrowRight
            size={14}
            strokeWidth={2}
            className="text-white group-hover:text-black group-hover:translate-x-0.5
                       transition-all duration-400"
          />
        </div>
      </a>

      <span
        className="text-gray-300"
        style={{ fontSize: "12px", fontFamily: SANS }}
      >
        Takes less than 2 minutes
      </span>
    </motion.div>
  )
})

// ── Main ───────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <section
      className="w-full bg-white py-20 md:py-28 lg:py-36 overflow-hidden"
      style={{ fontFamily: SANS }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <SectionHeader />
        <MobileLayout />
        <DesktopLayout />
        <BookingCTA />
      </div>
    </section>
  )
}
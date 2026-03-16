"use client"

import { useRef, useState, useEffect, useCallback, memo } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  ArrowRight, CalendarCheck, Car, MapPin, Sparkles,
  ChevronLeft, ChevronRight, Pause, Play,
} from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const STEPS = [
  {
    id: "choose",
    icon: Car,
    number: "01",
    title: "Choose Your Service",
    description: "Pick from exterior wash, interior detailing, sofa cleaning, and more.",
    detail: "Browse our curated selection of premium services",
  },
  {
    id: "location",
    icon: MapPin,
    number: "02",
    title: "Share Your Location",
    description: "We come to you — home, office, or anywhere in Duliajan.",
    detail: "Flexible doorstep service across the city",
  },
  {
    id: "time",
    icon: CalendarCheck,
    number: "03",
    title: "Pick a Time Slot",
    description: "Flexible scheduling, 7 days a week. Morning, afternoon, or evening.",
    detail: "Book at your convenience, any day of the week",
  },
  {
    id: "relax",
    icon: Sparkles,
    number: "04",
    title: "Sit Back & Relax",
    description: "Our experts arrive on time with everything needed. Results guaranteed.",
    detail: "Professional service with 100% satisfaction",
  },
]

const STATS = [
  { value: "2min", label: "To Book"      },
  { value: "2hrs", label: "Avg Service"  },
  { value: "100%", label: "Satisfaction" },
]

const INTERVAL_MS  = 4000
const PROGRESS_HZ  = 80   // ms between progress ticks
const PROGRESS_STEP = (100 / INTERVAL_MS) * PROGRESS_HZ

const SERIF = 'Georgia, "Times New Roman", serif'
const EASE  = [0.22, 1, 0.36, 1]

// ── useAutoPlay hook ───────────────────────────────────────
// Single source of truth for the carousel timer logic.
function useAutoPlay({ length, paused, onAdvance }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (paused) return

    setProgress(0)
    const progId = setInterval(() => {
      setProgress(p => Math.min(p + PROGRESS_STEP, 100))
    }, PROGRESS_HZ)

    const stepId = setInterval(() => {
      onAdvance()
      setProgress(0)
    }, INTERVAL_MS)

    return () => {
      clearInterval(progId)
      clearInterval(stepId)
    }
  }, [paused, onAdvance])

  return progress
}

// ── Animation variants ─────────────────────────────────────
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const fadeLeft = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.6, ease: EASE } },
}

const cardSlide = {
  enter: (dir) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center:        { x: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
  exit:  (dir) => ({ x: dir > 0 ? -280 : 280, opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" } }),
}

const desktopSlide = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
  exit:    { opacity: 0, x: 40, transition: { duration: 0.35, ease: "easeIn" } },
}

// ── ProgressRing ───────────────────────────────────────────
const ProgressRing = memo(function ProgressRing({ progress, size = 44 }) {
  const r = (size - 4) / 2
  const circ = r * 2 * Math.PI
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={2}
        fill="none" stroke="rgba(255,255,255,0.12)" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={2}
        fill="none" stroke="white" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (progress / 100) * circ}
        className="transition-[stroke-dashoffset] duration-75 ease-linear" />
    </svg>
  )
})

// ── Dot nav ────────────────────────────────────────────────
function DotNav({ count, active, onSelect, light }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to step ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-400
                      ${i === active
                        ? `w-8 ${light ? "bg-white" : "bg-black"}`
                        : `w-1.5 ${light ? "bg-white/30 hover:bg-white/50" : "bg-gray-200 hover:bg-gray-400"}`}`}
        />
      ))}
    </div>
  )
}

// ── StatCard ───────────────────────────────────────────────
function StatCard({ value, label, dark }) {
  return (
    <div className={`rounded-2xl p-4 border text-center
                     ${dark
                       ? "bg-white/5 border-white/10"
                       : "bg-gray-50 border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"}`}>
      <p className={`mb-1 ${dark ? "text-white" : "text-black"}`}
        style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 400 }}>
        {value}
      </p>
      <p className={`tracking-wider uppercase ${dark ? "text-white/40" : "text-gray-400"}`}
        style={{ fontSize: "9px" }}>
        {label}
      </p>
    </div>
  )
}

// ── Black showcase card (shared mobile + desktop) ──────────
function ShowcaseCard({ step, progress, showProgress }) {
  const Icon = step.icon
  return (
    <div className="relative bg-black rounded-[2rem] overflow-hidden w-full h-full">
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.1) 40px,rgba(255,255,255,0.1) 41px)",
          }} />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 35%,rgba(255,255,255,0.08),transparent 65%)" }} />
      </div>

      {/* Progress ring */}
      {showProgress && (
        <div className="absolute top-5 right-5 z-20">
          <div className="relative">
            <ProgressRing progress={progress} size={42} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-medium" style={{ fontSize: "11px" }}>
                {step.number}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          key={step.id + "-icon"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-2xl"
          style={{ boxShadow: "0 24px 60px -12px rgba(255,255,255,0.25)" }}
        >
          <Icon size={34} strokeWidth={1.5} className="text-black" />
        </motion.div>

        <motion.span
          key={step.id + "-num"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-white/[0.07] block mb-3 leading-none select-none"
          style={{ fontFamily: SERIF, fontSize: "clamp(80px,16vw,110px)", fontWeight: 300 }}
          aria-hidden="true"
        >
          {step.number}
        </motion.span>

        <motion.h3
          key={step.id + "-title"}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="text-white mb-3 px-2"
          style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(22px,4vw,28px)", letterSpacing: "-0.01em", lineHeight: 1.2 }}
        >
          {step.title}
        </motion.h3>

        <motion.p
          key={step.id + "-desc"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-white/45 leading-relaxed max-w-xs"
          style={{ fontSize: "13px" }}
        >
          {step.description}
        </motion.p>
      </div>
    </div>
  )
}

// ── Step pill (list item) ──────────────────────────────────
function StepPill({ step, isActive, onClick, light }) {
  const Icon = step.icon
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left
                  transition-all duration-400
                  ${isActive
                    ? light
                      ? "bg-white text-black shadow-lg"
                      : "bg-black text-white shadow-lg scale-[1.02]"
                    : light
                      ? "bg-white/5 text-white hover:bg-white/10"
                      : "bg-gray-50 text-gray-900 hover:bg-gray-100"}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                       transition-colors duration-300
                       ${isActive
                         ? light ? "bg-black text-white" : "bg-white text-black"
                         : light ? "bg-white/10 text-white" : "bg-white text-gray-700"}`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`leading-tight truncate ${isActive
            ? light ? "text-black" : "text-white"
            : light ? "text-white/80" : "text-gray-900"}`}
          style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 400 }}>
          {step.title}
        </p>
        <span className={`tracking-wider uppercase ${isActive
            ? light ? "text-black/40" : "text-white/50"
            : "text-gray-400"}`}
          style={{ fontSize: "9px" }}>
          Step {step.number}
        </span>
      </div>
      {isActive && (
        <ChevronRight size={15} strokeWidth={2}
          className={light ? "text-black shrink-0" : "text-white shrink-0"} />
      )}
    </motion.button>
  )
}

// ── Mobile carousel ────────────────────────────────────────
const MobileCarousel = memo(function MobileCarousel() {
  const [index, setIndex]   = useState(0)
  const [dir, setDir]       = useState(1)
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => {
    setDir(1)
    setIndex(i => (i + 1) % STEPS.length)
  }, [])

  const progress = useAutoPlay({ length: STEPS.length, paused, onAdvance: advance })

  const go = useCallback((next) => {
    setDir(next > index ? 1 : -1)
    setIndex(next)
  }, [index])

  // Swipe support
  const dragRef = useRef({ start: 0 })
  const onTouchStart = useCallback(e => { dragRef.current.start = e.touches[0].clientX }, [])
  const onTouchEnd   = useCallback(e => {
    const dx = dragRef.current.start - e.changedTouches[0].clientX
    if (Math.abs(dx) < 50) return
    if (dx > 0 && index < STEPS.length - 1) go(index + 1)
    if (dx < 0 && index > 0)                go(index - 1)
  }, [index, go])

  return (
    <div className="md:hidden px-4">
      {/* Showcase card */}
      <div
        className="relative aspect-[4/5] mb-10 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={STEPS[index].id}
            custom={dir}
            variants={cardSlide}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <ShowcaseCard step={STEPS[index]} progress={progress} showProgress />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot nav */}
      <div className="flex justify-center mb-8">
        <DotNav count={STEPS.length} active={index} onSelect={go} />
      </div>

      {/* Step pills */}
      <div className="space-y-2 mb-8">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
          >
            <StepPill step={step} isActive={i === index} onClick={() => go(i)} />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.5 + i * 0.08 }}
          >
            <StatCard value={s.value} label={s.label} />
          </motion.div>
        ))}
      </div>
    </div>
  )
})

// ── Desktop viewer ─────────────────────────────────────────
const DesktopViewer = memo(function DesktopViewer() {
  const [index, setIndex]   = useState(0)
  const [dir, setDir]       = useState(1)
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => {
    setDir(1)
    setIndex(i => (i + 1) % STEPS.length)
  }, [])

  const progress = useAutoPlay({ length: STEPS.length, paused, onAdvance: advance })

  const go = useCallback((next) => {
    setDir(next >= index ? 1 : -1)
    setIndex(next)
  }, [index])

  const prev = useCallback(() => {
    setDir(-1)
    setIndex(i => (i - 1 + STEPS.length) % STEPS.length)
  }, [])

  const next = useCallback(() => {
    setDir(1)
    setIndex(i => (i + 1) % STEPS.length)
  }, [])

  const step = STEPS[index]

  return (
    <div
      className="hidden md:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={dir} mode="wait">
        <motion.div
          key={step.id}
          custom={dir}
          variants={desktopSlide}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center"
        >
          {/* Left: showcase card */}
          <div className="aspect-square">
            <ShowcaseCard step={step} progress={progress} showProgress={!paused} />
          </div>

          {/* Right: content */}
          <div>
            {/* Step label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-black/25 tracking-wider uppercase"
                style={{ fontFamily: SERIF, fontSize: "11px" }}>
                STEP {step.number}
              </span>
              <div className="h-px flex-1 bg-gray-100" aria-hidden="true" />
              {/* Pause/play indicator */}
              <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${paused ? "opacity-100" : "opacity-0"}`}>
                <Pause size={10} className="text-gray-300" />
                <span className="text-gray-300 tracking-wider uppercase" style={{ fontSize: "9px" }}>Paused</span>
              </div>
            </div>

            <h3
              className="text-black mb-5 leading-tight"
              style={{
                fontFamily: SERIF, fontWeight: 400,
                fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
                letterSpacing: "-0.025em", lineHeight: 1.1,
              }}
            >
              {step.title}
            </h3>

            <p className="text-gray-500 leading-relaxed mb-10 max-w-md"
              style={{ fontSize: "16px" }}>
              {step.description}
            </p>

            {/* Nav controls */}
            <div className="flex items-center gap-4 mb-10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={prev}
                aria-label="Previous step"
                className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center
                           hover:border-black hover:bg-black hover:text-white
                           transition-all duration-300"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </motion.button>

              <DotNav count={STEPS.length} active={index} onSelect={go} />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={next}
                aria-label="Next step"
                className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center
                           hover:bg-gray-800 hover:scale-105 transition-all duration-300"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((s, i) => (
                <StatCard key={i} value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step thumbnail strip */}
      <div className="grid grid-cols-4 gap-3 mt-14">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
          >
            <StepPill step={s} isActive={i === index} onClick={() => go(i)} />
          </motion.div>
        ))}
      </div>

      <p className="text-center text-gray-300 mt-5" style={{ fontSize: "11px" }}>
        Hover to pause · auto-advances every 4s
      </p>
    </div>
  )
})

// ── Section header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
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
          Simple Process
        </span>
      </motion.div>

      <div className="md:flex md:items-end md:justify-between md:gap-10">
        <motion.h2
          variants={fadeUp}
          id="how-it-works-heading"
          className="text-black mb-3 md:mb-0"
          style={{
            fontFamily: SERIF, fontWeight: 300,
            fontSize: "clamp(2rem, 7vw, 3.5rem)",
            lineHeight: 1.05, letterSpacing: "-0.03em",
          }}
        >
          How It Works
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-gray-400 max-w-xs leading-relaxed md:text-right"
          style={{ fontSize: "14px" }}
        >
          Four simple steps from booking to a spotless result.
        </motion.p>
      </div>
    </motion.div>
  )
})

// ── CTA ────────────────────────────────────────────────────
const CTA = memo(function CTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-12 md:mt-20 flex justify-center"
    >
      <motion.a
        href="/bookings"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="group inline-flex items-center gap-3 h-14 px-10
                   bg-black text-white rounded-full no-underline
                   hover:shadow-xl hover:shadow-black/15 transition-shadow duration-500 w-full sm:w-auto justify-center"
      >
        <span className="tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em" }}>
          Start Your First Booking
        </span>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                        group-hover:bg-white transition-colors duration-300">
          <ArrowRight size={14} strokeWidth={2}
            className="text-white group-hover:text-black transition-colors duration-300
                       group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.a>
    </motion.div>
  )
})

// ── Main ───────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <section
      className="w-full bg-white py-16 md:py-28 lg:py-36 overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        <SectionHeader />
        <MobileCarousel />
        <DesktopViewer />
        <CTA />
      </div>
    </section>
  )
}
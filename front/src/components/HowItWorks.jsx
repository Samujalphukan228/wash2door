"use client"

import { useRef, useState, useEffect, memo, useCallback } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ArrowRight, CalendarCheck, Car, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const STEPS = [
  {
    id: "choose-service",
    icon: Car,
    number: "01",
    title: "Choose Your Service",
    description: "Pick from exterior wash, interior detailing, sofa cleaning, and more.",
    detail: "Browse our curated selection of premium services",
  },
  {
    id: "share-location",
    icon: MapPin,
    number: "02",
    title: "Share Your Location",
    description: "We come to you — home, office, parking lot. Anywhere in Duliajan.",
    detail: "Flexible doorstep service across the city",
  },
  {
    id: "pick-time",
    icon: CalendarCheck,
    number: "03",
    title: "Pick a Time Slot",
    description: "Flexible scheduling, 7 days a week. Morning, afternoon, or evening.",
    detail: "Book at your convenience, any day of the week",
  },
  {
    id: "sit-relax",
    icon: Sparkles,
    number: "04",
    title: "Sit Back & Relax",
    description: "Our experts arrive on time with everything needed. Spotless results guaranteed.",
    detail: "Professional service with 100% satisfaction",
  },
]

const STATS = [
  { value: "2min", label: "To Book" },
  { value: "2hrs", label: "Avg Service" },
  { value: "100%", label: "Satisfaction" },
]

const AUTO_PLAY_INTERVAL = 4000 // 4 seconds per step

// ── Animation Variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const slideIn = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 60,
    transition: { duration: 0.5 },
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

// ── Section Header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="text-center mb-12 md:mb-24"
    >
      <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 mb-5 px-5 py-2 rounded-full bg-gray-50">
        <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
        <span
          className="tracking-[0.3em] uppercase text-gray-600"
          style={{ fontFamily: "Georgia, serif", fontSize: "10px", fontWeight: 500 }}
        >
          Simple Process
        </span>
      </motion.div>

      <motion.h2
        variants={fadeInUp}
        className="text-black mb-4 px-4"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "clamp(2rem, 7vw, 2.5rem)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        How It Works
      </motion.h2>

      <motion.p
        variants={fadeInUp}
        className="text-gray-500 px-6 max-w-sm mx-auto leading-relaxed"
        style={{ fontSize: "15px" }}
      >
        Four simple steps from booking to brilliance
      </motion.p>
    </motion.div>
  )
})

// ── Progress Ring Component ────────────────────────────────
const ProgressRing = memo(function ProgressRing({ progress, size = 48 }) {
  const radius = (size - 4) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-white/10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-white transition-all duration-100 ease-linear"
        strokeLinecap="round"
      />
    </svg>
  )
})

// ── Mobile Step Card Component ─────────────────────────────
const MobileStepCard = memo(function MobileStepCard({ step, isActive, progress }) {
  const Icon = step.icon

  if (!isActive) return null

  return (
    <motion.div
      key={step.id}
      variants={{
        enter: { x: 300, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -300, opacity: 0 }
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Main black card */}
      <div className="relative bg-black rounded-[2rem] overflow-hidden aspect-[4/5]">
        {/* Background patterns */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)`,
            }}
          />
        </div>

        {/* Progress indicator */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <ProgressRing progress={progress} size={40} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-medium">{step.number}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-6">
          {/* Top section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div
              className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-2xl"
              style={{ boxShadow: "0 25px 60px -15px rgba(255,255,255,0.25)" }}
            >
              <Icon size={32} strokeWidth={1.5} className="text-black" />
            </div>

            <span
              className="text-white/[0.08] mb-4"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "90px",
                fontWeight: 300,
                lineHeight: 0.85,
              }}
            >
              {step.number}
            </span>

            <h3
              className="text-white mb-3 px-2"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "26px",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              {step.title}
            </h3>

            <p className="text-white/50 px-4 leading-relaxed" style={{ fontSize: "14px" }}>
              {step.description}
            </p>
          </div>

          {/* Bottom section */}
          <div className="mt-auto">
            <button className="w-full py-4 bg-white/10 backdrop-blur-sm rounded-2xl 
                             text-white/60 text-sm tracking-wider uppercase
                             hover:bg-white/20 active:bg-white/30 transition-colors duration-300">
              Learn More
            </button>

            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-white/30 text-xs tracking-wider uppercase">
                Swipe to explore
              </span>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1), transparent 60%)",
          }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  )
})

// ── Cool Mobile Carousel (FIXED) ───────────────────────────
const MobileStepCarousel = memo(function MobileStepCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  
  const containerRef = useRef(null)
  const intervalRef = useRef(null)
  const progressRef = useRef(null)

  // Ensure component is mounted
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  // Handle touch events
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && activeIndex < STEPS.length - 1) {
      setActiveIndex(prev => prev + 1)
      setProgress(0)
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(prev => prev - 1)
      setProgress(0)
    }
  }, [touchStart, touchEnd, activeIndex])

  // Auto-play functionality - FIXED
  useEffect(() => {
    if (!isMounted) return

    // Clear existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)

    // Progress animation
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0
        return prev + 2 // 2% every 80ms = 100% in 4 seconds
      })
    }, 80)

    // Step change
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % STEPS.length)
      setProgress(0)
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [activeIndex, isMounted])

  // Handle manual navigation
  const goToStep = useCallback((index) => {
    setActiveIndex(index)
    setProgress(0)
  }, [])

  if (!isMounted) return null

  return (
    <div className="md:hidden" ref={containerRef}>
      {/* Main Card Viewer */}
      <div className="relative px-5 mb-8">
        <div 
          className="relative touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <MobileStepCard
              key={STEPS[activeIndex].id}
              step={STEPS[activeIndex]}
              isActive={true}
              progress={progress}
            />
          </AnimatePresence>
        </div>

        {/* Swipe hint dots */}
        <div className="absolute left-1/2 bottom-[-20px] -translate-x-1/2 flex gap-2">
          {STEPS.map((_, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => goToStep(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIndex ? "w-8 bg-black" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Compact step list below */}
      <div className="px-5 space-y-3 mt-12">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isActive = i === activeIndex

          return (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => goToStep(i)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left
                       transition-all duration-500 ${
                         isActive
                           ? "bg-black text-white shadow-lg scale-[1.02]"
                           : "bg-gray-50 text-gray-900"
                       }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? "bg-white text-black" : "bg-white text-gray-900"
                }`}
              >
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm mb-0.5 ${isActive ? "text-white" : "text-gray-900"}`}
                  style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}
                >
                  {step.title}
                </p>
                <span
                  className={`text-xs tracking-wider uppercase ${
                    isActive ? "text-white/50" : "text-gray-400"
                  }`}
                >
                  Step {step.number}
                </span>
              </div>
              {isActive && (
                <ChevronRight size={18} strokeWidth={2} className="text-white shrink-0" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mt-10 mx-5">
        {STATS.map((stat, i) => (
          <motion.div
            key={`stat-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 
                     border border-gray-100 text-center"
          >
            <p
              className="text-black mb-1"
              style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400 }}
            >
              {stat.value}
            </p>
            <p className="text-gray-400 text-xs tracking-wider uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
})

// ── Desktop Step Viewer (keeping the cool one) ────────────
const DesktopStepViewer = memo(function DesktopStepViewer() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const intervalRef = useRef(null)
  const progressRef = useRef(null)

  const activeStep = STEPS[activeIndex]
  const Icon = activeStep.icon

  // Ensure component is mounted
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  const nextStep = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % STEPS.length)
    setProgress(0)
  }, [])

  const prevStep = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length)
    setProgress(0)
  }, [])

  const goToStep = useCallback((index) => {
    setActiveIndex(index)
    setProgress(0)
  }, [])

  // Auto-play functionality - FIXED
  useEffect(() => {
    if (isPaused || !isMounted) return

    // Clear existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)

    // Progress animation
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0
        return prev + 2
      })
    }, 80)

    // Step change
    intervalRef.current = setInterval(nextStep, AUTO_PLAY_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [isPaused, activeIndex, nextStep, isMounted])

  if (!isMounted) return null

  return (
    <div 
      className="hidden md:block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Stage */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            {/* Left: Visual */}
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-black overflow-hidden relative group">
                {/* Background patterns */}
                <div className="absolute inset-0" aria-hidden="true">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl 
                                group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl
                                group-hover:scale-110 transition-transform duration-1000" />
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center mb-8 shadow-2xl
                             group-hover:scale-110 transition-transform duration-500"
                    style={{ boxShadow: "0 30px 70px -15px rgba(255,255,255,0.3)" }}
                  >
                    <Icon size={40} strokeWidth={1.5} className="text-black" />
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-white/10 mb-6"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "120px",
                      fontWeight: 300,
                      lineHeight: 0.85,
                    }}
                  >
                    {activeStep.number}
                  </motion.span>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center"
                  >
                    <h3
                      className="text-white mb-3"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: "32px",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {activeStep.title}
                    </h3>
                    <p className="text-white/50 max-w-sm mx-auto" style={{ fontSize: "15px" }}>
                      {activeStep.detail}
                    </p>
                  </motion.div>
                </div>

                {/* Glow effect */}
                <div
                  className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-1000"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)",
                  }}
                  aria-hidden="true"
                />

                {/* Auto-play indicator */}
                {!isPaused && (
                  <div className="absolute top-6 right-6">
                    <div className="relative">
                      <ProgressRing progress={progress} size={48} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{activeIndex + 1}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paused indicator */}
                {isPaused && (
                  <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <span className="text-white/60 text-xs tracking-wider uppercase">Paused</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-black/20"
                    style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: 500 }}
                  >
                    STEP {activeStep.number}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <h3
                  className="text-black mb-5"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {activeStep.title}
                </h3>

                <p
                  className="text-gray-600 leading-relaxed max-w-md"
                  style={{ fontSize: "17px" }}
                >
                  {activeStep.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={prevStep}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center
                           hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                  aria-label="Previous step"
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>

                <div className="flex gap-2">
                  {STEPS.map((_, i) => (
                    <button
                      key={`nav-${i}`}
                      onClick={() => goToStep(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === activeIndex ? "w-12 bg-black" : "w-1.5 bg-gray-200 hover:bg-gray-300"
                      }`}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center
                           hover:bg-gray-800 hover:scale-110 transition-all duration-300"
                  aria-label="Next step"
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {STATS.map((stat, i) => (
                  <div
                    key={`stat-desktop-${i}`}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100
                             hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <p
                      className="text-black mb-1"
                      style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 400 }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-gray-400 text-xs tracking-wider uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom step thumbnails */}
      <div className="grid grid-cols-4 gap-4 mt-12">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isActive = i === activeIndex

          return (
            <button
              key={`thumb-${step.id}`}
              onClick={() => goToStep(i)}
              className={`relative rounded-2xl p-6 text-left transition-all duration-500
                       ${
                         isActive
                           ? "bg-black text-white shadow-xl scale-105"
                           : "bg-gray-50 text-gray-900 hover:bg-gray-100 hover:scale-[1.02]"
                       }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                  isActive ? "bg-white text-black" : "bg-white/80 text-gray-900"
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <p
                className={`text-sm mb-1 ${isActive ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}
              >
                {step.title}
              </p>
              <span
                className={`text-xs tracking-wider uppercase ${
                  isActive ? "text-white/50" : "text-gray-400"
                }`}
              >
                Step {step.number}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-2xl border-2 border-white/20"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Auto-play hint */}
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          {isPaused ? "Hover away to resume" : "Hover to pause • Auto-playing every 4 seconds"}
        </p>
      </div>
    </div>
  )
})

// ── CTA Section ────────────────────────────────────────────
const CTASection = memo(function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-12 md:mt-24 text-center"
    >
      <motion.a
        href="/bookings"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group inline-flex items-center gap-4 h-14 md:h-16 px-10 md:px-12
                   bg-black text-white rounded-full
                   hover:shadow-2xl hover:shadow-black/30
                   transition-all duration-300 no-underline mx-5"
      >
        <span
          className="tracking-[0.15em] uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Start Your First Booking
        </span>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center 
                       group-hover:bg-white group-hover:text-black transition-all duration-300">
          <ArrowRight size={16} strokeWidth={2} />
        </div>
      </motion.a>
    </motion.div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function HowItWorks() {
  return (
    <section
      className="w-full bg-white py-16 md:py-36 lg:py-44 overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader />
        <MobileStepCarousel />
        <DesktopStepViewer />
        <CTASection />
      </div>
    </section>
  )
}
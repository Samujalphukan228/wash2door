"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahul Sharma",
    location: "Duliajan",
    rating: 5,
    text: "Absolutely fantastic service! They arrived on time, were extremely professional, and my car looks brand new. Will definitely book again.",
    service: "Premium Wash",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Duliajan",
    rating: 5,
    text: "So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.",
    service: "Standard Wash",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Duliajan",
    rating: 5,
    text: "I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.",
    service: "Premium Wash",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Duliajan",
    rating: 5,
    text: "The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!",
    service: "Basic Wash",
  },
  {
    id: 5,
    name: "Vikram Singh",
    location: "Duliajan",
    rating: 5,
    text: "Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!",
    service: "Standard Wash",
  },
]

const ANIMATION_CONFIG = {
  header: { duration: 0.8, ease: "power3.out" },
  card: { duration: 0.9, ease: "power4.out" },
  slide: { duration: 0.4, ease: "power3.out" },
}

// ── Custom Hook: Scroll Animation ──────────────────────────
function useScrollAnimation(ref, config, deps = []) {
  useEffect(() => {
    if (!ref.current) return

    let ctx
    let observer

    const init = async () => {
      observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect()

            const { default: gsap } = await import("gsap")
            const { ScrollTrigger } = await import("gsap/ScrollTrigger")
            gsap.registerPlugin(ScrollTrigger)

            ctx = gsap.context(() => {
              config(gsap, ScrollTrigger)
            })
          }
        },
        { rootMargin: "50px" }
      )

      observer.observe(ref.current)
    }

    init()

    return () => {
      observer?.disconnect()
      ctx?.revert()
    }
  }, deps)
}

// ── Subcomponents ──────────────────────────────────────────

const StarRating = memo(function StarRating({ rating, size = 14, filled = "#fff", empty = "rgba(255,255,255,0.15)" }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          fill={i < rating ? filled : empty}
        />
      ))}
    </div>
  )
})

const Avatar = memo(function Avatar({ name, size = "md", variant = "dark" }) {
  const sizes = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-11 h-11 text-[15px]",
    lg: "w-12 h-12 text-[16px]",
  }

  const variants = {
    dark: "bg-black text-white",
    light: "bg-white/10 text-white border border-white/10",
    outline: "border border-gray-200 text-gray-400",
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0
                  ${sizes[size]} ${variants[variant]}`}
    >
      <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}>
        {name?.charAt(0)?.toUpperCase()}
      </span>
    </div>
  )
})

const ServiceBadge = memo(function ServiceBadge({ service, variant = "dark" }) {
  const variants = {
    dark: "bg-white/10 text-white/60",
    light: "border border-gray-200 text-gray-400",
  }

  return (
    <span
      className={`px-3 py-1.5 rounded-full tracking-wider uppercase ${variants[variant]}`}
      style={{ fontSize: "10px" }}
    >
      {service}
    </span>
  )
})

// ── Mobile: Testimonial Card ───────────────────────────────
const MobileTestimonialCard = memo(function MobileTestimonialCard({
  testimonial,
  index,
  isActive,
}) {
  return (
    <div
      className={`shrink-0 w-[85vw] snap-center transition-all duration-500
                  ${isActive ? "opacity-100 scale-100" : "opacity-60 scale-[0.96]"}`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-black min-h-[340px] flex flex-col">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Gradient orbs */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white opacity-[0.02]" />
          <div className="absolute -left-12 bottom-1/4 w-32 h-32 rounded-full bg-white opacity-[0.015]" />

          {/* Large quote icon */}
          <Quote
            size={160}
            strokeWidth={0.3}
            className="absolute -top-8 -right-8 text-white/[0.025] rotate-180"
          />
        </div>

        {/* Step number watermark */}
        <span
          className="absolute top-5 left-6 text-white/[0.06] select-none"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "80px",
            fontWeight: 300,
            lineHeight: 0.85,
          }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 p-6 pt-20">
          {/* Stars */}
          <div className="mb-5">
            <StarRating rating={testimonial.rating} size={13} />
          </div>

          {/* Quote text */}
          <blockquote
            className="text-white/90 leading-[1.8] flex-1 mb-6"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "16px",
              letterSpacing: "0.01em",
            }}
          >
            "{testimonial.text}"
          </blockquote>

          {/* Author */}
          <footer className="flex items-center justify-between pt-5 border-t border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <Avatar name={testimonial.name} size="lg" variant="light" />
              <div>
                <cite
                  className="text-white block not-italic"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 400,
                    fontSize: "15px",
                  }}
                >
                  {testimonial.name}
                </cite>
                <span className="text-white/35 mt-0.5 block" style={{ fontSize: "12px" }}>
                  {testimonial.location}
                </span>
              </div>
            </div>

            <ServiceBadge service={testimonial.service} variant="dark" />
          </footer>
        </div>
      </div>
    </div>
  )
})

// ── Mobile: Carousel Controls ──────────────────────────────
const MobileCarouselControls = memo(function MobileCarouselControls({
  activeIndex,
  total,
  onPrev,
  onNext,
}) {
  const progress = ((activeIndex + 1) / total) * 100

  return (
    <>
      {/* Controls row */}
      <div className="flex items-center justify-between mt-6">
        {/* Progress bar */}
        <div className="flex-1 h-[3px] bg-gray-100 rounded-full mr-6 overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={activeIndex === 0}
            className="w-12 h-12 bg-gray-100 flex items-center justify-center
                       rounded-full active:bg-black active:text-white
                       disabled:opacity-30 disabled:pointer-events-none
                       transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={onNext}
            disabled={activeIndex === total - 1}
            className="w-12 h-12 bg-black text-white flex items-center justify-center
                       rounded-full active:bg-gray-800
                       disabled:opacity-30 disabled:pointer-events-none
                       transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="flex justify-center mt-5">
        <span className="text-gray-400 tabular-nums" style={{ fontSize: "13px" }}>
          <span className="text-black font-medium">{activeIndex + 1}</span>
          <span className="mx-1">/</span>
          <span>{total}</span>
        </span>
      </div>
    </>
  )
})

// ── Mobile: Scroll Container ───────────────────────────────
const MobileTestimonialsScroll = memo(function MobileTestimonialsScroll() {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth * 0.85
      const gap = 12
      const newIndex = Math.round(scrollLeft / (cardWidth + gap))
      setActiveIndex(Math.min(Math.max(newIndex, 0), TESTIMONIALS.length - 1))
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useScrollAnimation(
    scrollRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        scrollRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.card.duration,
          ease: ANIMATION_CONFIG.card.ease,
          scrollTrigger: {
            trigger: scrollRef.current,
            start: "top 90%",
            once: true,
          },
        }
      )
    },
    []
  )

  const scrollToDirection = useCallback((dir) => {
    const container = scrollRef.current
    if (!container) return
    const cardWidth = container.offsetWidth * 0.85 + 12
    container.scrollBy({ left: dir * cardWidth, behavior: "smooth" })
  }, [])

  return (
    <div className="md:hidden">
      {/* Cards carousel */}
      <div className="-mx-5">
        <div
          ref={scrollRef}
          className="opacity-0 flex gap-3 overflow-x-auto snap-x snap-mandatory
                     px-5 pb-4 will-change-transform"
          style={{
            scrollPaddingLeft: "20px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {TESTIMONIALS.map((testimonial, i) => (
            <MobileTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={i}
              isActive={i === activeIndex}
            />
          ))}

          {/* End spacer */}
          <div className="shrink-0 w-3" aria-hidden="true" />
        </div>
      </div>

      <MobileCarouselControls
        activeIndex={activeIndex}
        total={TESTIMONIALS.length}
        onPrev={() => scrollToDirection(-1)}
        onNext={() => scrollToDirection(1)}
      />
    </div>
  )
})

// ── Desktop: Testimonial Item in List ──────────────────────
const DesktopTestimonialListItem = memo(function DesktopTestimonialListItem({
  testimonial,
  index,
  isActive,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-3.5 border-b border-gray-100 last:border-0
                  flex items-center justify-between group
                  transition-all duration-300
                  ${isActive ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
      aria-pressed={isActive}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${isActive ? "bg-black" : "border border-gray-200 group-hover:border-gray-300"}`}
        >
          <span
            className={`transition-colors duration-300
                        ${isActive ? "text-white" : "text-gray-400"}`}
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "12px",
              fontWeight: 300,
            }}
          >
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <span
          className="text-black"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "14px",
            fontWeight: 400,
          }}
        >
          {testimonial.name}
        </span>
      </div>

      <span
        className="tracking-wider uppercase text-gray-300"
        style={{ fontSize: "9px" }}
      >
        {testimonial.location}
      </span>
    </button>
  )
})

// ── Desktop: Main Quote Card ───────────────────────────────
const DesktopQuoteCard = memo(function DesktopQuoteCard({ testimonial, index, slideRef }) {
  return (
    <div
      ref={slideRef}
      className="relative border border-gray-200 rounded-2xl overflow-hidden
                 hover:border-black/30 transition-colors duration-500 group"
    >
      {/* Black quote area */}
      <div className="relative bg-black px-8 lg:px-10 pt-8 lg:pt-10 pb-12 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Gradient orbs */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white opacity-[0.02]" />
          <div className="absolute -left-16 bottom-0 w-48 h-48 rounded-full bg-white opacity-[0.015]" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Large quote icon */}
          <Quote
            size={220}
            strokeWidth={0.25}
            className="absolute -top-12 -right-12 text-white/[0.02] rotate-180"
          />
        </div>

        {/* Number watermark */}
        <span
          className="absolute bottom-4 right-8 text-white/[0.04] select-none"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "140px",
            fontWeight: 300,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-6">
            <StarRating rating={testimonial.rating} size={14} />
          </div>

          <blockquote
            className="text-white/90 leading-[1.85]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "clamp(17px, 1.7vw, 22px)",
              letterSpacing: "0.01em",
            }}
          >
            "{testimonial.text}"
          </blockquote>
        </div>
      </div>

      {/* Author bar */}
      <div className="p-5 lg:p-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <Avatar name={testimonial.name} size="md" variant="dark" />
          <div>
            <cite
              className="text-black block not-italic"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontSize: "15px",
              }}
            >
              {testimonial.name}
            </cite>
            <span
              className="tracking-wider uppercase text-gray-400 mt-0.5 block"
              style={{ fontSize: "10px" }}
            >
              {testimonial.location}
            </span>
          </div>
        </div>

        <ServiceBadge service={testimonial.service} variant="light" />
      </div>
    </div>
  )
})

// ── Desktop: Rating Summary ────────────────────────────────
const DesktopRatingSummary = memo(function DesktopRatingSummary() {
  return (
    <div className="mb-8">
      <span
        className="text-black block"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: "72px",
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        5.0
      </span>

      <div className="flex gap-1 mt-3 mb-2">
        <StarRating rating={5} size={15} filled="#000" empty="#e5e7eb" />
      </div>

      <p
        className="tracking-wider uppercase text-gray-400"
        style={{ fontSize: "11px" }}
      >
        Average from {TESTIMONIALS.length} reviews
      </p>

      <div className="w-12 h-px bg-gray-200 mt-6" aria-hidden="true" />
    </div>
  )
})

// ── Desktop: Navigation Arrows ─────────────────────────────
const DesktopNavArrows = memo(function DesktopNavArrows({
  currentIndex,
  total,
  onPrev,
  onNext,
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          className="w-11 h-11 border border-gray-200 flex items-center justify-center
                     rounded-full hover:border-black hover:bg-black hover:text-white
                     transition-all duration-300"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={onNext}
          className="w-11 h-11 border border-gray-200 flex items-center justify-center
                     rounded-full hover:border-black hover:bg-black hover:text-white
                     transition-all duration-300"
          aria-label="Next testimonial"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      <span
        className="tracking-wider uppercase text-gray-300 tabular-nums"
        style={{ fontSize: "11px" }}
      >
        {String(currentIndex + 1).padStart(2, "0")}
        <span className="mx-1">/</span>
        {String(total).padStart(2, "0")}
      </span>
    </div>
  )
})

// ── Desktop: Slider ────────────────────────────────────────
const DesktopTestimonialsSlider = memo(function DesktopTestimonialsSlider() {
  const containerRef = useRef(null)
  const slideRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const animateSlide = useCallback(async (newIndex, direction) => {
    const { default: gsap } = await import("gsap")
    if (!slideRef.current) return

    // Exit animation
    await gsap.to(slideRef.current, {
      opacity: 0,
      x: direction * -50,
      duration: 0.2,
      ease: "power2.in",
    })

    setCurrentIndex(newIndex)

    // Enter animation
    gsap.fromTo(
      slideRef.current,
      { opacity: 0, x: direction * 50 },
      {
        opacity: 1,
        x: 0,
        duration: ANIMATION_CONFIG.slide.duration,
        ease: ANIMATION_CONFIG.slide.ease,
      }
    )
  }, [])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      const next = (currentIndex + 1) % TESTIMONIALS.length
      animateSlide(next, 1)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex, animateSlide])

  // Initial animation
  useScrollAnimation(
    containerRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.card.duration,
          ease: ANIMATION_CONFIG.card.ease,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      )
    },
    []
  )

  const goToPrev = useCallback(() => {
    setIsAutoPlaying(false)
    const prev = currentIndex === 0 ? TESTIMONIALS.length - 1 : currentIndex - 1
    animateSlide(prev, -1)
  }, [currentIndex, animateSlide])

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false)
    const next = (currentIndex + 1) % TESTIMONIALS.length
    animateSlide(next, 1)
  }, [currentIndex, animateSlide])

  const goToSlide = useCallback(
    (index) => {
      if (index === currentIndex) return
      setIsAutoPlaying(false)
      const direction = index > currentIndex ? 1 : -1
      animateSlide(index, direction)
    },
    [currentIndex, animateSlide]
  )

  const testimonial = TESTIMONIALS[currentIndex]

  return (
    <div ref={containerRef} className="hidden md:block opacity-0">
      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Quote card */}
        <div className="col-span-7">
          <DesktopQuoteCard
            testimonial={testimonial}
            index={currentIndex}
            slideRef={slideRef}
          />
        </div>

        {/* Right: Navigation panel */}
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <DesktopRatingSummary />

            {/* Testimonial list */}
            <div className="mt-6">
              {TESTIMONIALS.map((t, i) => (
                <DesktopTestimonialListItem
                  key={t.id}
                  testimonial={t}
                  index={i}
                  isActive={i === currentIndex}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
          </div>

          <DesktopNavArrows
            currentIndex={currentIndex}
            total={TESTIMONIALS.length}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        </div>
      </div>
    </div>
  )
})

// ── Section Header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader({ eyebrowRef, headingRef, descRef }) {
  return (
    <header className="mb-10 md:mb-14 lg:mb-16">
      <div
        ref={eyebrowRef}
        className="flex items-center gap-4 mb-4 md:mb-5 opacity-0"
      >
        <span className="block w-10 h-px bg-black" aria-hidden="true" />
        <span
          className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: "Georgia, serif", fontSize: "10px" }}
        >
          Testimonials
        </span>
      </div>

      <h2
        ref={headingRef}
        className="text-black mb-3 md:mb-4 opacity-0"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "clamp(28px, 5vw, 48px)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        What Customers Say
      </h2>

      <p
        ref={descRef}
        className="text-gray-400 max-w-md leading-relaxed opacity-0"
        style={{ fontSize: "15px" }}
      >
        Real reviews from customers who trust us with their vehicles.
      </p>
    </header>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function Testimonials() {
  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const headerAnimated = useRef(false)

  // Header animation
  useEffect(() => {
    if (headerAnimated.current) return

    let ctx

    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      if (!headingRef.current) return

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
          defaults: { ease: ANIMATION_CONFIG.header.ease },
        })

        if (eyebrowRef.current) {
          tl.fromTo(
            eyebrowRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5 }
          )
        }

        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: ANIMATION_CONFIG.header.duration },
          0.08
        )

        if (descRef.current) {
          tl.fromTo(
            descRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.2
          )
        }
      })

      headerAnimated.current = true
    }

    init()

    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-white py-16 md:py-24 lg:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <SectionHeader
          eyebrowRef={eyebrowRef}
          headingRef={headingRef}
          descRef={descRef}
        />

        {/* Mobile carousel */}
        <MobileTestimonialsScroll />

        {/* Desktop slider */}
        <DesktopTestimonialsSlider />
      </div>
    </section>
  )
}
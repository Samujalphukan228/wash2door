// components/Testimonials.jsx
"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, ArrowUpRight } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Duliajan',
    rating: 5,
    text: 'Absolutely fantastic service! They arrived on time, were extremely professional, and my car looks brand new. Will definitely book again.',
    service: 'Premium Wash',
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Duliajan',
    rating: 5,
    text: 'So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.',
    service: 'Standard Wash',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    location: 'Duliajan',
    rating: 5,
    text: 'I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.',
    service: 'Premium Wash',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    location: 'Duliajan',
    rating: 5,
    text: 'The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!',
    service: 'Basic Wash',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Duliajan',
    rating: 5,
    text: 'Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!',
    service: 'Standard Wash',
  },
]

/* ═══════════════════════════════════════
   MOBILE TESTIMONIAL CARD - Full Width, Premium
═══════════════════════════════════════ */
function MobileTestimonialCard({ testimonial, index, isActive }) {
  return (
    <div
      className={`shrink-0 w-[88vw] snap-center transition-all duration-500
                  ${isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.95]'}`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-black min-h-[320px] flex flex-col">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Large Quote Icon */}
        <Quote
          size={140}
          strokeWidth={0.3}
          className="absolute -top-6 -right-6 text-white/[0.03] rotate-180"
        />

        {/* Number */}
        <span
          className="absolute top-6 left-6 text-white/[0.08]"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '72px',
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 p-6 pt-20">
          {/* Stars */}
          <div className="flex gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                strokeWidth={0}
                fill={i < testimonial.rating ? '#fff' : 'rgba(255,255,255,0.15)'}
              />
            ))}
          </div>

          {/* Quote */}
          <p
            className="text-white/90 leading-[1.75] flex-1 mb-6"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: '16px',
              letterSpacing: '0.01em',
            }}
          >
            "{testimonial.text}"
          </p>

          {/* Author */}
          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full bg-white/10 flex items-center
                           justify-center border border-white/10"
              >
                <span
                  className="text-white"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: '16px',
                    fontWeight: 300,
                  }}
                >
                  {testimonial.name.charAt(0)}
                </span>
              </div>
              <div>
                <span
                  className="text-white block"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 400,
                    fontSize: '15px',
                  }}
                >
                  {testimonial.name}
                </span>
                <span
                  className="text-white/40 mt-0.5 block"
                  style={{ fontSize: '12px' }}
                >
                  {testimonial.location}
                </span>
              </div>
            </div>

            <span
              className="px-3 py-1.5 bg-white/10 rounded-full text-white/60"
              style={{ fontSize: '10px' }}
            >
              {testimonial.service}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   MOBILE SCROLL CONTAINER
═══════════════════════════════════════ */
function MobileTestimonialsScroll() {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth * 0.88
      const gap = 16
      const newIndex = Math.round(scrollLeft / (cardWidth + gap))
      setActiveIndex(Math.min(newIndex, TESTIMONIALS.length - 1))
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!scrollRef.current) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          scrollRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: scrollRef.current, start: 'top 88%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  const scrollTo = (dir) => {
    const container = scrollRef.current
    if (!container) return
    const cardWidth = container.offsetWidth * 0.88 + 16
    container.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
  }

  return (
    <div className="md:hidden">
      {/* Cards */}
      <div className="-mx-5">
        <div
          ref={scrollRef}
          className="opacity-0 flex gap-4 overflow-x-auto snap-x snap-mandatory
                     px-5 pb-6"
          style={{
            scrollPaddingLeft: '20px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <MobileTestimonialCard
              key={t.id}
              testimonial={t}
              index={i}
              isActive={i === activeIndex}
            />
          ))}
          <div className="shrink-0 w-4" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 px-1">
        {/* Progress Bar */}
        <div className="flex-1 h-1 bg-gray-100 rounded-full mr-6 overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-300"
            style={{
              width: `${((activeIndex + 1) / TESTIMONIALS.length) * 100}%`,
            }}
          />
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scrollTo(-1)}
            disabled={activeIndex === 0}
            className="w-12 h-12 bg-gray-100 flex items-center justify-center
                       rounded-full active:bg-black active:text-white
                       disabled:opacity-30 disabled:pointer-events-none
                       transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scrollTo(1)}
            disabled={activeIndex === TESTIMONIALS.length - 1}
            className="w-12 h-12 bg-black text-white flex items-center justify-center
                       rounded-full active:bg-gray-800
                       disabled:opacity-30 disabled:pointer-events-none
                       transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="flex justify-center mt-6">
        <span
          className="text-gray-400"
          style={{ fontSize: '13px' }}
        >
          <span className="text-black font-medium">{activeIndex + 1}</span>
          {' / '}
          {TESTIMONIALS.length}
        </span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   DESKTOP SLIDER (Keep existing design)
═══════════════════════════════════════ */
function DesktopTestimonialsSlider() {
  const containerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const slideRef = useRef(null)

  const animateSlide = useCallback(async (newIndex, dir) => {
    const { default: gsap } = await import('gsap')
    if (!slideRef.current) return

    await gsap.to(slideRef.current, {
      opacity: 0,
      x: dir * -60,
      duration: 0.25,
      ease: 'power2.in',
    })

    setCurrentIndex(newIndex)

    gsap.fromTo(
      slideRef.current,
      { opacity: 0, x: dir * 60 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % TESTIMONIALS.length
      animateSlide(next, 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex, animateSlide])

  const goToPrev = () => {
    setIsAutoPlaying(false)
    const prev = currentIndex === 0 ? TESTIMONIALS.length - 1 : currentIndex - 1
    animateSlide(prev, -1)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    const next = (currentIndex + 1) % TESTIMONIALS.length
    animateSlide(next, 1)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    const dir = index > currentIndex ? 1 : -1
    animateSlide(index, dir)
  }

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!containerRef.current) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  const testimonial = TESTIMONIALS[currentIndex]

  return (
    <div ref={containerRef} className="hidden md:block opacity-0">
      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Big quote area */}
        <div className="col-span-7 relative">
          <div
            ref={slideRef}
            className="relative border border-gray-200 rounded-2xl overflow-hidden
                       hover:border-black transition-colors duration-500"
          >
            {/* Black header */}
            <div className="relative bg-black px-8 pt-8 pb-10 overflow-hidden">
              <Quote
                size={200}
                strokeWidth={0.3}
                className="absolute -top-8 -right-8 text-white/[0.03] rotate-180"
              />

              <span
                className="absolute bottom-3 right-6 text-white/[0.05] select-none"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: '120px',
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                {String(currentIndex + 1).padStart(2, '0')}
              </span>

              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      strokeWidth={0}
                      fill={i < testimonial.rating ? '#fff' : 'rgba(255,255,255,0.15)'}
                    />
                  ))}
                </div>

                <p
                  className="text-white/90 leading-[1.8]"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(16px, 1.6vw, 20px)',
                  }}
                >
                  "{testimonial.text}"
                </p>
              </div>
            </div>

            {/* Author bar */}
            <div className="p-6 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-full bg-black flex items-center justify-center"
                >
                  <span
                    className="text-white"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: '15px',
                      fontWeight: 300,
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <span
                    className="text-black block"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    {testimonial.name}
                  </span>
                  <span
                    className="tracking-wider uppercase text-gray-400 mt-0.5 block"
                    style={{ fontSize: '10px' }}
                  >
                    {testimonial.location}
                  </span>
                </div>
              </div>

              <span
                className="tracking-wider uppercase text-gray-400 border border-gray-200
                           px-3 py-1.5 rounded-full"
                style={{ fontSize: '10px' }}
              >
                {testimonial.service}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Navigation + stats */}
        <div className="col-span-5 flex flex-col justify-between py-2">
          <div>
            <span
              className="text-black block"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '64px',
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              5.0
            </span>
            <div className="flex gap-1 mt-3 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} strokeWidth={0} fill="#000" />
              ))}
            </div>
            <p
              className="tracking-wider uppercase text-gray-400"
              style={{ fontSize: '11px' }}
            >
              Average from {TESTIMONIALS.length} reviews
            </p>

            <div className="w-10 h-px bg-gray-200 mt-6 mb-6" />

            {/* Testimonial list */}
            <div className="space-y-0">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => goToSlide(i)}
                  className={`w-full text-left py-3 border-b border-gray-100
                             last:border-0 flex items-center justify-between
                             transition-all duration-300 ${
                               i === currentIndex
                                 ? 'opacity-100'
                                 : 'opacity-40 hover:opacity-70'
                             }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                                 transition-all duration-300 ${
                                   i === currentIndex
                                     ? 'bg-black'
                                     : 'border border-gray-200'
                                 }`}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          i === currentIndex ? 'text-white' : 'text-gray-400'
                        }`}
                        style={{
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          fontSize: '11px',
                          fontWeight: 300,
                        }}
                      >
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <span
                      className="text-black"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: '13px',
                        fontWeight: 400,
                      }}
                    >
                      {t.name}
                    </span>
                  </div>

                  <span
                    className="tracking-wider uppercase text-gray-300"
                    style={{ fontSize: '9px' }}
                  >
                    {t.location}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              <button
                onClick={goToPrev}
                className="w-11 h-11 border border-gray-200 flex items-center justify-center
                           rounded-full hover:border-black hover:bg-black hover:text-white
                           transition-all duration-300"
                aria-label="Previous"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={goToNext}
                className="w-11 h-11 border border-gray-200 flex items-center justify-center
                           rounded-full hover:border-black hover:bg-black hover:text-white
                           transition-all duration-300"
                aria-label="Next"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>

            <span
              className="tracking-wider uppercase text-gray-300"
              style={{ fontSize: '11px' }}
            >
              {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(TESTIMONIALS.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function Testimonials() {
  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!headingRef.current) return

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
          defaults: { ease: 'power3.out' },
        })

        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5 }
        )
          .fromTo(
            headingRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8 },
            0.1
          )
          .fromTo(
            descRef.current,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.3
          )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      className="w-full bg-white py-16 md:py-28"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <div
            ref={eyebrowRef}
            className="flex items-center gap-4 mb-4 md:mb-6 opacity-0"
          >
            <span className="block w-8 h-px bg-black" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{ fontFamily: 'Georgia, serif', fontSize: '10px' }}
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
              fontSize: 'clamp(28px, 5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            What Customers Say
          </h2>

          <p
            ref={descRef}
            className="text-gray-400 max-w-md leading-relaxed opacity-0"
            style={{ fontSize: '14px' }}
          >
            Real reviews from customers who trust us with their vehicles.
          </p>
        </div>

        {/* Mobile */}
        <MobileTestimonialsScroll />

        {/* Desktop */}
        <DesktopTestimonialsSlider />
      </div>
    </section>
  )
}
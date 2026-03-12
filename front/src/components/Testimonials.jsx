"use client"

import { useEffect, useRef, useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Absolutely fantastic service! They arrived on time, were extremely professional, and my car looks brand new. Will definitely book again.',
    service: 'Premium Wash',
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Delhi',
    rating: 5,
    text: 'So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.',
    service: 'Standard Wash',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    location: 'Bangalore',
    rating: 5,
    text: 'I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.',
    service: 'Premium Wash',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!',
    service: 'Basic Wash',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Pune',
    rating: 5,
    text: 'Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!',
    service: 'Standard Wash',
  },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} strokeWidth={0} fill={i < rating ? '#000' : '#E5E5E5'} />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="flex flex-col p-8 md:p-10 border border-black bg-white rounded-[5px]">

      {/* Quote Icon */}
      <Quote size={28} strokeWidth={1} className="text-gray-200 mb-6 rotate-180" />

      {/* Rating */}
      <div className="mb-6">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Text */}
      <p
        className="text-black leading-7 mb-8 flex-1"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.4vw, 16px)',
        }}
      >
        "{testimonial.text}"
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-gray-100 mb-6" />

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shrink-0">
          <span
            className="text-white"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(12px, 1.2vw, 15px)',
            }}
          >
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <span
            className="text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              letterSpacing: '0.02em',
            }}
          >
            {testimonial.name}
          </span>
          <span
            className="tracking-[0.2em] uppercase text-gray-400 mt-1"
            style={{ fontSize: 'clamp(7px, 0.75vw, 9px)' }}
          >
            {testimonial.location} · {testimonial.service}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const ruleRef = useRef(null)
  const sliderRef = useRef(null)

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  // Heading animation
  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const trigger = headingRef.current
      if (!trigger) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger, start: 'top 85%' },
          defaults: { ease: 'power3.out' },
        })
        tl.fromTo(eyebrowRef.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
          .fromTo(ruleRef.current, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6 }, 0.3)
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  // Slider animation
  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const el = sliderRef.current
      if (!el) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    // ✅ bg-white — consistent with all other sections
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">

        {/* ── Heading ── */}
        <div className="mb-16 md:mb-20">
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-6 opacity-0">
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(7px, 0.8vw, 9px)',
              }}
            >
              Testimonials
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2
              ref={headingRef}
              className="opacity-0 text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.8rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
              }}
            >
              What Our Customers Say
            </h2>

            {/* Navigation — Desktop */}
            <div className="hidden md:flex items-center gap-3 mb-2">
              <button
                onClick={goToPrev}
                className="w-10 h-10 border border-gray-300 flex items-center justify-center rounded-[3px]
                           hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={goToNext}
                className="w-10 h-10 border border-gray-300 flex items-center justify-center rounded-[3px]
                           hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div ref={ruleRef} className="w-full h-px bg-gray-200 mt-8" />
        </div>

        {/* ── Slider ── */}
        <div ref={sliderRef} className="opacity-0">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="max-w-2xl mx-auto">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation — Mobile */}
          <div className="flex md:hidden justify-center gap-3 mt-8">
            <button
              onClick={goToPrev}
              className="w-12 h-12 border border-gray-300 flex items-center justify-center rounded-[3px]
                         hover:border-black transition-colors duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={goToNext}
              className="w-12 h-12 border border-gray-300 flex items-center justify-center rounded-[3px]
                         hover:border-black transition-colors duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
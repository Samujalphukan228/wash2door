"use client"

import { useRef, useState, useCallback, memo } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahul Sharma",
    location: "Duliajan",
    rating: 5,
    text: "Absolutely fantastic service! They arrived on time, were extremely professional, and my car looks brand new. Will definitely book again.",
    service: "Premium Wash",
    avatar: "RS",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Duliajan",
    rating: 5,
    text: "So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.",
    service: "Standard Wash",
    avatar: "PP",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Duliajan",
    rating: 5,
    text: "I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.",
    service: "Premium Wash",
    avatar: "AK",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Duliajan",
    rating: 5,
    text: "The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!",
    service: "Basic Wash",
    avatar: "SR",
  },
  {
    id: 5,
    name: "Vikram Singh",
    location: "Duliajan",
    rating: 5,
    text: "Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!",
    service: "Standard Wash",
    avatar: "VS",
  },
]

// ── Animation Variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const slideIn = {
  enter: { x: 100, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
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
      className="text-center mb-12 md:mb-20"
    >
      {/* Eyebrow */}
      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full bg-gray-50"
      >
        <Quote size={14} className="text-gray-600" />
        <span
          className="tracking-[0.3em] uppercase text-gray-600"
          style={{ fontFamily: "Georgia, serif", fontSize: "10px", fontWeight: 500 }}
        >
          Customer Reviews
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        variants={fadeInUp}
        className="text-black mb-5"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        Real Stories, Real Shine
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={fadeInUp}
        className="text-gray-500 max-w-2xl mx-auto leading-relaxed"
        style={{ fontSize: "17px" }}
      >
        Trusted by hundreds of customers across Duliajan for premium car care
      </motion.p>

      {/* Stats */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto mt-10"
      >
        {[
          { value: "5.0", label: "Average Rating" },
          { value: "500+", label: "Happy Customers" },
          { value: "98%", label: "Satisfaction Rate" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <p
              className="text-black mb-1"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 400,
              }}
            >
              {stat.value}
            </p>
            <p className="text-gray-400 text-xs md:text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
})

// ── Star Rating Component ──────────────────────────────────
const StarRating = memo(function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </div>
  )
})

// ── Desktop Testimonial Card ───────────────────────────────
const DesktopTestimonialCard = memo(function DesktopTestimonialCard({ testimonial, isActive }) {
  if (!isActive) return null

  return (
    <motion.div
      key={testimonial.id}
      variants={slideIn}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="grid md:grid-cols-5 gap-8 lg:gap-12 items-center"
    >
      {/* Left: Large Quote */}
      <div className="md:col-span-3">
        <div className="relative bg-black rounded-3xl p-10 lg:p-14 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <Quote
              size={200}
              strokeWidth={0.5}
              className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-180"
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Rating */}
            <div className="mb-6">
              <StarRating rating={testimonial.rating} />
            </div>

            {/* Quote */}
            <blockquote
              className="text-white/90 mb-8"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              "{testimonial.text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center"
                style={{ boxShadow: "0 10px 30px -5px rgba(255,255,255,0.2)" }}
              >
                <span
                  className="text-black"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "18px",
                    fontWeight: 400,
                  }}
                >
                  {testimonial.avatar}
                </span>
              </div>
              <div>
                <cite
                  className="text-white block not-italic"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "18px",
                    fontWeight: 400,
                  }}
                >
                  {testimonial.name}
                </cite>
                <p className="text-white/40 text-sm">{testimonial.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Info Card */}
      <div className="md:col-span-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-50 rounded-2xl p-8"
        >
          <p
            className="text-gray-400 tracking-wider uppercase mb-4"
            style={{ fontSize: "10px" }}
          >
            Service Booked
          </p>
          <h3
            className="text-black mb-6"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "24px",
              fontWeight: 400,
            }}
          >
            {testimonial.service}
          </h3>

          {/* Service features */}
          <div className="space-y-3">
            {["Professional team", "Eco-friendly products", "100% satisfaction"].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <span className="text-gray-600 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <a
            href="/bookings"
            className="inline-flex items-center gap-2 mt-8 text-black hover:gap-3 transition-all duration-300"
          >
            <span className="text-sm font-medium">Book this service</span>
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
})

// ── Desktop Navigation Dots ────────────────────────────────
const DesktopNavigation = memo(function DesktopNavigation({ total, current, onChange }) {
  return (
    <div className="flex items-center justify-center gap-8 mt-12">
      {/* Previous */}
      <button
        onClick={() => onChange((current - 1 + total) % total)}
        className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center
                   hover:border-black hover:bg-black hover:text-white transition-all duration-300"
        aria-label="Previous testimonial"
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </button>

      {/* Dots */}
      <div className="flex gap-2">
        {[...Array(total)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "w-12 bg-black" : "w-2 bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onChange((current + 1) % total)}
        className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center
                   hover:bg-gray-800 transition-all duration-300"
        aria-label="Next testimonial"
      >
        <ArrowRight size={20} strokeWidth={2} />
      </button>
    </div>
  )
})

// ── Mobile Testimonial Card ────────────────────────────────
const MobileTestimonialCard = memo(function MobileTestimonialCard({ testimonial, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      className="bg-black rounded-3xl p-6 overflow-hidden relative"
    >
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <Quote
          size={120}
          strokeWidth={0.5}
          className="absolute -bottom-6 -right-6 text-white/[0.03] rotate-180"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
              style={{ boxShadow: "0 10px 30px -5px rgba(255,255,255,0.2)" }}
            >
              <span
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {testimonial.avatar}
              </span>
            </div>
            <div>
              <cite
                className="text-white block not-italic"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {testimonial.name}
              </cite>
              <p className="text-white/40 text-sm">{testimonial.location}</p>
            </div>
          </div>
          <span
            className="text-white/10"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "60px",
              fontWeight: 300,
              lineHeight: 0.8,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>

        {/* Quote */}
        <blockquote
          className="text-white/90 mb-6"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "17px",
            lineHeight: 1.6,
          }}
        >
          "{testimonial.text}"
        </blockquote>

        {/* Service badge */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span
            className="px-3 py-1.5 rounded-full bg-white/10 text-white/60 text-xs tracking-wider uppercase"
          >
            {testimonial.service}
          </span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i === 0 ? "bg-white/60" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ── Desktop View ───────────────────────────────────────────
const DesktopTestimonials = memo(function DesktopTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="hidden md:block">
      <AnimatePresence mode="wait">
        <DesktopTestimonialCard
          key={TESTIMONIALS[activeIndex].id}
          testimonial={TESTIMONIALS[activeIndex]}
          isActive={true}
        />
      </AnimatePresence>

      <DesktopNavigation
        total={TESTIMONIALS.length}
        current={activeIndex}
        onChange={setActiveIndex}
      />
    </div>
  )
})

// ── Mobile View ────────────────────────────────────────────
const MobileTestimonials = memo(function MobileTestimonials() {
  return (
    <div className="md:hidden space-y-6">
      {TESTIMONIALS.map((testimonial, i) => (
        <MobileTestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          index={i}
        />
      ))}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center pt-8"
      >
        <a
          href="/bookings"
          className="inline-flex items-center gap-3 h-14 px-8
                     bg-black text-white rounded-full
                     hover:shadow-xl hover:shadow-black/20
                     active:scale-[0.97] transition-all duration-300"
        >
          <span className="tracking-wider uppercase" style={{ fontSize: "11px" }}>
            Book Your First Wash
          </span>
          <ArrowRight size={16} strokeWidth={2} />
        </a>
      </motion.div>
    </div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function Testimonials() {
  return (
    <section
      className="w-full bg-white py-20 md:py-32 lg:py-40"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <SectionHeader />
        <DesktopTestimonials />
        <MobileTestimonials />
      </div>
    </section>
  )
}
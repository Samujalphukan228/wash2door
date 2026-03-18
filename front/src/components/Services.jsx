// components/Services.jsx
"use client"

import { useEffect, useState, useCallback, memo, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  ArrowUpRight,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  RotateCcw,
  Droplets,
  Star,
} from "lucide-react"
import { getCategories } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Shield, label: "100% Satisfaction", desc: "Guaranteed results or we redo it free" },
  { icon: Clock, label: "Same-Day Service", desc: "Book now, cleaned today" },
  { icon: Sparkles, label: "Eco-Friendly", desc: "Safe products for your family & pets" },
]

const MAX_VISIBLE = 6
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// ── Animation ──────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const fadeLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const cardReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
}

// ── Grid helpers ───────────────────────────────────────────
function desktopLayout(index, total) {
  if (total <= 3) {
    if (index === 0) return { col: "md:col-span-2 md:row-span-2", variant: "featured" }
    return { col: "md:col-span-2 md:row-span-1", variant: "wide" }
  }
  if (total === 4) {
    if (index === 0) return { col: "md:col-span-2 md:row-span-2", variant: "featured" }
    if (index === 1) return { col: "md:col-span-1 md:row-span-2", variant: "tall" }
    return { col: "md:col-span-1 md:row-span-1", variant: "default" }
  }
  if (index === 0) return { col: "md:col-span-2 md:row-span-2", variant: "featured" }
  if (index === 5) return { col: "md:col-span-2 md:row-span-1", variant: "wide" }
  return { col: "md:col-span-1 md:row-span-1", variant: "default" }
}

function mobileLayout(index, total) {
  if (index === 0) return "col-span-2 row-span-2"
  if (index === 3 && total > 4) return "row-span-2"
  if (index === 4 && total > 5) return "col-span-2"
  return ""
}

// ── Subcomponents ──────────────────────────────────────────
const CardImage = memo(function CardImage({ src, alt, icon, animateHover }) {
  const [err, setErr] = useState(false)

  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center ${
          animateHover
            ? "transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            : ""
        }`}
        loading="lazy"
        decoding="async"
        onError={() => setErr(true)}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <span className="text-5xl opacity-60">{icon || "🚗"}</span>
    </div>
  )
})

const ArrowCircle = memo(function ArrowCircle({ size = "sm" }) {
  const dim = size === "lg" ? "w-12 h-12" : size === "md" ? "w-10 h-10" : "w-8 h-8"
  const ico = size === "lg" ? 18 : size === "md" ? 15 : 13

  return (
    <div
      className={`${dim} rounded-full border border-white/20 bg-white/10 backdrop-blur-md
                   flex items-center justify-center shrink-0
                   group-hover:bg-white group-hover:border-white group-hover:shadow-lg group-hover:shadow-black/10
                   transition-all duration-500`}
    >
      <ArrowUpRight
        size={ico}
        strokeWidth={1.5}
        className="text-white group-hover:text-black
                   group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                   transition-all duration-500"
      />
    </div>
  )
})

const CountBadge = memo(function CountBadge({ count, large }) {
  if (!count || count <= 0) return null
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/15
                  bg-white/10 backdrop-blur-md ${large ? "px-3.5 py-1.5" : "px-2.5 py-1"}`}
    >
      <span
        className="text-white/80 tracking-wider uppercase"
        style={{ fontSize: large ? "10px" : "9px", fontWeight: 500 }}
      >
        {count} {large ? "services" : ""}
      </span>
    </span>
  )
})

function Overlay({ featured }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700
        ${
          featured
            ? "bg-gradient-to-t from-black/90 via-black/40 to-black/5 group-hover:from-black/95"
            : "bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90"
        }`}
      aria-hidden="true"
    />
  )
}

// ── Desktop Card ───────────────────────────────────────────
const DesktopCard = memo(function DesktopCard({ category, index, total }) {
  const { col, variant } = desktopLayout(index, total)
  const featured = variant === "featured"
  const wide = variant === "wide"
  const tall = variant === "tall"

  const pad = featured ? "p-8 xl:p-10" : wide ? "p-7 xl:p-8" : "p-5 xl:p-6"
  const fsize = featured
    ? "clamp(26px, 3vw, 40px)"
    : wide
    ? "clamp(20px, 2.5vw, 28px)"
    : tall
    ? "clamp(18px, 2vw, 24px)"
    : "clamp(16px, 1.8vw, 22px)"
  const radius = featured ? "rounded-3xl" : "rounded-2xl"

  return (
    <motion.a
      variants={cardReveal}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden no-underline will-change-transform
                  ${radius} ${col}`}
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden bg-gray-100">
        <CardImage src={category.image?.url} alt={category.name} icon={category.icon} animateHover />
      </div>

      <Overlay featured={featured} />

      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100
                   transition-opacity duration-600 pointer-events-none
                   shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${pad}`}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CountBadge count={category.totalServices} large={featured} />
            {featured && (
              <span
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-amber-400/20 backdrop-blur-md border border-amber-400/20"
              >
                <Star size={9} className="text-amber-400 fill-amber-400" />
                <span
                  className="text-amber-200/90 tracking-wider uppercase"
                  style={{ fontSize: "8px", fontWeight: 600 }}
                >
                  Popular
                </span>
              </span>
            )}
          </div>
          <ArrowCircle size={featured ? "lg" : "md"} />
        </div>

        {/* Bottom content */}
        <div>
          {category.icon && (
            <span
              className={`block mb-2.5 transition-transform duration-600 group-hover:scale-110 origin-left
                ${featured ? "text-4xl" : wide || tall ? "text-2xl" : "text-xl"}`}
              aria-hidden="true"
            >
              {category.icon}
            </span>
          )}

          <h3
            className="text-white mb-2 leading-[1.1]"
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: fsize,
              letterSpacing: "-0.025em",
            }}
          >
            {category.name}
          </h3>

          {category.description && (
            <p
              className={`text-white/45 leading-relaxed group-hover:text-white/65
                          transition-colors duration-600
                ${
                  featured
                    ? "line-clamp-3 text-sm"
                    : wide
                    ? "line-clamp-2 text-[13px]"
                    : "line-clamp-2 text-xs"
                }`}
            >
              {category.description}
            </p>
          )}

          {(featured || wide) && (
            <div
              className="mt-5 inline-flex items-center gap-2.5 text-white/30
                         group-hover:text-white/70 transition-colors duration-500"
            >
              <span
                className="uppercase tracking-[0.15em]"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Explore Services
              </span>
              <ArrowRight
                size={13}
                strokeWidth={1.5}
                className="group-hover:translate-x-1.5 transition-transform duration-400"
              />
            </div>
          )}
        </div>
      </div>
    </motion.a>
  )
})

// ── Mobile Card ────────────────────────────────────────────
const MobileCard = memo(function MobileCard({ category, index, total }) {
  const span = mobileLayout(index, total)
  const isLarge = index === 0
  const isTall = span.includes("row-span-2")

  return (
    <motion.a
      variants={cardReveal}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden rounded-2xl
                  active:scale-[0.97] transition-transform duration-200
                  no-underline will-change-transform ${span}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="absolute inset-0 bg-gray-100">
        <CardImage src={category.image?.url} alt={category.name} icon={category.icon} />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
        aria-hidden="true"
      />

      <div className={`relative z-10 h-full flex flex-col justify-between ${isLarge ? "p-5" : "p-4"}`}>
        <div className="flex items-start justify-between">
          <CountBadge count={category.totalServices} />
          <ArrowCircle size={isLarge ? "md" : "sm"} />
        </div>

        <div>
          {category.icon && (
            <span
              className={`block mb-1.5 ${isLarge ? "text-2xl" : "text-lg"}`}
              aria-hidden="true"
            >
              {category.icon}
            </span>
          )}
          <h3
            className="text-white leading-tight"
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              fontSize: isLarge ? "22px" : isTall ? "17px" : "15px",
            }}
          >
            {category.name}
          </h3>
          {isLarge && category.description && (
            <p
              className="text-white/40 line-clamp-2 mt-1.5 leading-relaxed"
              style={{ fontSize: "12px" }}
            >
              {category.description}
            </p>
          )}
        </div>
      </div>
    </motion.a>
  )
})

// ── Skeleton ───────────────────────────────────────────────
function Skeleton() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[150px]">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`bg-gray-100/80 animate-pulse rounded-2xl ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          />
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6 auto-rows-[190px] lg:auto-rows-[210px]">
        {[
          "md:col-span-2 md:row-span-2",
          "md:col-span-1 md:row-span-1",
          "md:col-span-1 md:row-span-1",
          "md:col-span-1 md:row-span-1",
          "md:col-span-1 md:row-span-1",
        ].map((cls, i) => (
          <div key={i} className={`bg-gray-100/80 animate-pulse rounded-2xl ${cls}`} />
        ))}
      </div>
    </>
  )
}

// ── State Message ──────────────────────────────────────────
function StateMessage({ type, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-24"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gray-50 flex items-center justify-center">
        <span className="text-4xl">{type === "error" ? "⚠️" : "🧹"}</span>
      </div>
      <h3
        className="text-black mb-2"
        style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400 }}
      >
        {type === "error" ? "Something went wrong" : "No services yet"}
      </h3>
      <p className="text-gray-400 mb-8 max-w-xs mx-auto" style={{ fontSize: "14px", lineHeight: 1.6 }}>
        {type === "error"
          ? "We couldn't load our services. Please check your connection and try again."
          : "We're setting things up. Check back soon!"}
      </p>
      {type === "error" && onRetry && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRetry}
          className="inline-flex items-center gap-2.5 h-12 px-8 bg-black text-white
                     rounded-full tracking-wider uppercase hover:bg-gray-800
                     transition-colors duration-300"
          style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em" }}
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          Try Again
        </motion.button>
      )}
    </motion.div>
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
        <span className="block w-10 h-px bg-black/20" aria-hidden="true" />
        <span
          className="tracking-[0.35em] uppercase text-gray-400"
          style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 500 }}
        >
          Our Services
        </span>
      </motion.div>

      <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
        {/* Title */}
        <div className="mb-5 lg:mb-0">
          <motion.h2
            variants={fadeUp}
            id="services-heading"
            className="text-black"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Premium Care,
          </motion.h2>
          <motion.h2
            variants={fadeUp}
            className="text-black/15"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontStyle: "italic",
            }}
          >
            At Your Doorstep.
          </motion.h2>
        </div>

        {/* Description */}
        <motion.div variants={fadeUp} className="lg:max-w-sm lg:pb-1">
          <p
            className="text-gray-400 leading-[1.7] mb-4 lg:mb-0"
            style={{ fontSize: "14px", fontFamily: SANS }}
          >
            From exterior washes to deep interior detailing — we bring professional cleaning
            solutions right to your doorstep. Fast, safe &amp; hassle-free.
          </p>

          {/* Mini stats on desktop */}
          <div className="hidden lg:flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
            {[
              { val: "100+", lbl: "Cars cleaned" },
              { val: "4.8★", lbl: "Avg rating" },
            ].map((s, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span
                  className="text-black"
                  style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 400 }}
                >
                  {s.val}
                </span>
                <span className="text-gray-300 uppercase tracking-widest" style={{ fontSize: "9px" }}>
                  {s.lbl}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
})

// ── Trust Bar ──────────────────────────────────────────────
const TrustBar = memo(function TrustBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mt-12 md:mt-20 pt-10 md:pt-12 border-t border-gray-100"
    >
      {/* Section label */}
      <motion.div variants={fadeLeft} className="flex items-center gap-3 mb-8">
        <span className="block w-6 h-px bg-black/15" aria-hidden="true" />
        <span
          className="tracking-[0.3em] uppercase text-gray-300"
          style={{ fontSize: "9px", fontFamily: SANS, fontWeight: 500 }}
        >
          Why Choose Us
        </span>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {TRUST_ITEMS.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="group flex items-start gap-4 p-5 sm:p-6 rounded-2xl
                       bg-gray-50/70 hover:bg-gray-50 border border-transparent
                       hover:border-gray-100 transition-all duration-500"
          >
            <div
              className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center
                         justify-center shrink-0 group-hover:shadow-md
                         transition-shadow duration-500"
            >
              <Icon size={18} strokeWidth={1.3} className="text-gray-400 group-hover:text-black transition-colors duration-500" />
            </div>
            <div>
              <p
                className="text-black leading-tight mb-1"
                style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 400 }}
              >
                {label}
              </p>
              <p className="text-gray-400 leading-relaxed" style={{ fontSize: "12px" }}>
                {desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
})

// ── View All CTA ───────────────────────────────────────────
const ViewAll = memo(function ViewAll() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex justify-center mt-12 md:mt-16"
    >
      <a
        href="/services"
        className="group relative inline-flex items-center justify-center gap-3
                   w-full sm:w-auto h-14 px-10 bg-black text-white
                   rounded-full overflow-hidden no-underline
                   hover:shadow-2xl hover:shadow-black/15 transition-shadow duration-600"
      >
        {/* Sweep bg */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700
                     -translate-x-full group-hover:translate-x-0
                     transition-transform duration-600 ease-out"
          aria-hidden="true"
        />
        <span
          className="relative z-10 tracking-[0.14em] uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          View All Services
        </span>
        <ArrowRight
          size={15}
          strokeWidth={1.5}
          className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-400"
        />
      </a>
    </motion.div>
  )
})

// ── Services Grid ──────────────────────────────────────────
const ServicesGrid = memo(function ServicesGrid({ categories }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[150px]">
        {categories.map((cat, i) => (
          <MobileCard key={cat._id} category={cat} index={i} total={categories.length} />
        ))}
      </div>

      {/* Desktop */}
      <div
        className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6
                   auto-rows-[190px] lg:auto-rows-[210px] xl:auto-rows-[220px]"
      >
        {categories.map((cat, i) => (
          <DesktopCard key={cat._id} category={cat} index={i} total={categories.length} />
        ))}
      </div>
    </motion.div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function Services() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data.slice(0, MAX_VISIBLE) : [])
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    getCategories()
      .then((data) => {
        if (alive) setCategories(Array.isArray(data) ? data.slice(0, MAX_VISIBLE) : [])
      })
      .catch(() => {
        if (alive) setError(true)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section
      className="w-full bg-white py-20 md:py-28 lg:py-36"
      style={{ fontFamily: SANS }}
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <SectionHeader />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Skeleton />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StateMessage type="error" onRetry={load} />
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StateMessage type="empty" />
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ServicesGrid categories={categories} />
              <ViewAll />
              <TrustBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
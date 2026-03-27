// components/Services.jsx
"use client"

import { useEffect, useState, useCallback, memo, useRef, useMemo } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  ArrowUpRight,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  RotateCcw,
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

// ── Animation Variants (defined outside component) ─────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.02 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const fadeLeft = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// ── Grid Layout Helpers (memoizable) ───────────────────────
const DESKTOP_LAYOUTS = {
  featured: { col: "md:col-span-2 md:row-span-2", variant: "featured" },
  tall: { col: "md:col-span-1 md:row-span-2", variant: "tall" },
  wide: { col: "md:col-span-2 md:row-span-1", variant: "wide" },
  default: { col: "md:col-span-1 md:row-span-1", variant: "default" },
}

function getDesktopLayout(index, total) {
  if (total <= 3) {
    return index === 0 ? DESKTOP_LAYOUTS.featured : DESKTOP_LAYOUTS.wide
  }
  if (total === 4) {
    if (index === 0) return DESKTOP_LAYOUTS.featured
    if (index === 1) return DESKTOP_LAYOUTS.tall
    return DESKTOP_LAYOUTS.default
  }
  if (index === 0) return DESKTOP_LAYOUTS.featured
  if (index === 5) return DESKTOP_LAYOUTS.wide
  return DESKTOP_LAYOUTS.default
}

function getMobileLayout(index, total) {
  if (index === 0) return "col-span-2 row-span-2"
  if (index === 3 && total > 4) return "row-span-2"
  if (index === 4 && total > 5) return "col-span-2"
  return ""
}

// ── Simple Image Component ─────────────────────────────────
const CardImage = memo(function CardImage({ src, alt, icon }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <span className="text-5xl opacity-60">{icon || "🚗"}</span>
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  )
})

// ── Arrow Circle (simplified) ──────────────────────────────
const ArrowCircle = memo(function ArrowCircle({ size = "sm" }) {
  const dimensions = {
    sm: { dim: "w-8 h-8", icon: 13 },
    md: { dim: "w-10 h-10", icon: 15 },
    lg: { dim: "w-12 h-12", icon: 18 },
  }
  const { dim, icon } = dimensions[size]

  return (
    <div
      className={`${dim} rounded-full border border-white/20 bg-white/10 
                  flex items-center justify-center shrink-0
                  group-hover:bg-white group-hover:border-white
                  transition-colors duration-300`}
    >
      <ArrowUpRight
        size={icon}
        strokeWidth={1.5}
        className="text-white group-hover:text-black transition-colors duration-300"
      />
    </div>
  )
})

// ── Count Badge ────────────────────────────────────────────
const CountBadge = memo(function CountBadge({ count, large }) {
  if (!count || count <= 0) return null
  
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/15
                  bg-white/10 ${large ? "px-3.5 py-1.5" : "px-2.5 py-1"}`}
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

// ── Desktop Card ───────────────────────────────────────────
const DesktopCard = memo(function DesktopCard({ category, layout }) {
  const { col, variant } = layout
  const featured = variant === "featured"
  const wide = variant === "wide"
  const tall = variant === "tall"

  const styles = useMemo(() => ({
    padding: featured ? "p-8 xl:p-10" : wide ? "p-7 xl:p-8" : "p-5 xl:p-6",
    fontSize: featured
      ? "clamp(26px, 3vw, 40px)"
      : wide
      ? "clamp(20px, 2.5vw, 28px)"
      : tall
      ? "clamp(18px, 2vw, 24px)"
      : "clamp(16px, 1.8vw, 22px)",
    radius: featured ? "rounded-3xl" : "rounded-2xl",
    iconSize: featured ? "text-4xl" : wide || tall ? "text-2xl" : "text-xl",
    descClass: featured
      ? "line-clamp-3 text-sm"
      : wide
      ? "line-clamp-2 text-[13px]"
      : "line-clamp-2 text-xs",
  }), [featured, wide, tall])

  return (
    <motion.a
      variants={cardVariant}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden ${styles.radius} ${col}`}
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden bg-gray-100">
        <CardImage src={category.image?.url} alt={category.name} icon={category.icon} />
      </div>

      {/* Overlay - simplified gradient */}
      <div
        className={`absolute inset-0 ${
          featured
            ? "bg-gradient-to-t from-black/90 via-black/40 to-black/5"
            : "bg-gradient-to-t from-black/85 via-black/30 to-transparent"
        }`}
      />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${styles.padding}`}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CountBadge count={category.totalServices} large={featured} />
            {featured && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/20">
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
            <span className={`block mb-2.5 ${styles.iconSize}`} aria-hidden="true">
              {category.icon}
            </span>
          )}

          <h3
            className="text-white mb-2 leading-[1.1]"
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: styles.fontSize,
              letterSpacing: "-0.025em",
            }}
          >
            {category.name}
          </h3>

          {category.description && (
            <p className={`text-white/45 leading-relaxed ${styles.descClass}`}>
              {category.description}
            </p>
          )}

          {(featured || wide) && (
            <div className="mt-5 inline-flex items-center gap-2.5 text-white/30 group-hover:text-white/70 transition-colors duration-300">
              <span
                className="uppercase tracking-[0.15em]"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Explore Services
              </span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>
    </motion.a>
  )
})

// ── Mobile Card ────────────────────────────────────────────
const MobileCard = memo(function MobileCard({ category, span, isLarge, isTall }) {
  return (
    <motion.a
      variants={cardVariant}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden rounded-2xl active:scale-[0.98] transition-transform duration-200 ${span}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="absolute inset-0 bg-gray-100">
        <CardImage src={category.image?.url} alt={category.name} icon={category.icon} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className={`relative z-10 h-full flex flex-col justify-between ${isLarge ? "p-5" : "p-4"}`}>
        <div className="flex items-start justify-between">
          <CountBadge count={category.totalServices} />
          <ArrowCircle size={isLarge ? "md" : "sm"} />
        </div>

        <div>
          {category.icon && (
            <span className={`block mb-1.5 ${isLarge ? "text-2xl" : "text-lg"}`} aria-hidden="true">
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
            <p className="text-white/40 line-clamp-2 mt-1.5 leading-relaxed" style={{ fontSize: "12px" }}>
              {category.description}
            </p>
          )}
        </div>
      </div>
    </motion.a>
  )
})

// ── Skeleton (CSS-only animation) ──────────────────────────
const Skeleton = memo(function Skeleton() {
  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[150px]">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`skeleton rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
          />
        ))}
      </div>
      
      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6 auto-rows-[190px] lg:auto-rows-[210px]">
        {["md:col-span-2 md:row-span-2", "", "", "", ""].map((cls, i) => (
          <div key={i} className={`skeleton rounded-2xl ${cls}`} />
        ))}
      </div>
    </>
  )
})

// ── State Message ──────────────────────────────────────────
const StateMessage = memo(function StateMessage({ type, onRetry }) {
  return (
    <div className="text-center py-24">
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
          ? "We couldn't load our services. Please try again."
          : "We're setting things up. Check back soon!"}
      </p>
      {type === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2.5 h-12 px-8 bg-black text-white
                     rounded-full tracking-wider uppercase hover:bg-gray-800
                     active:scale-95 transition-all duration-200"
          style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em" }}
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          Try Again
        </button>
      )}
    </div>
  )
})

// ── Section Header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader({ inView }) {
  return (
    <motion.header
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mb-12 md:mb-16 lg:mb-20"
    >
      {/* Tag */}
      <motion.div variants={fadeLeft} className="flex items-center gap-4 mb-6">
        <span className="block w-10 h-px bg-black/20" />
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
            solutions right to your doorstep.
          </p>

          {/* Mini stats on desktop */}
          <div className="hidden lg:flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
            {[
              { val: "100+", lbl: "Cars cleaned" },
              { val: "4.8★", lbl: "Avg rating" },
            ].map((s, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="text-black" style={{ fontFamily: SERIF, fontSize: "18px" }}>
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
const TrustBar = memo(function TrustBar({ inView }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mt-12 md:mt-20 pt-10 md:pt-12 border-t border-gray-100"
    >
      <motion.div variants={fadeLeft} className="flex items-center gap-3 mb-8">
        <span className="block w-6 h-px bg-black/15" />
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
                       hover:border-gray-100 transition-colors duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Icon size={18} strokeWidth={1.3} className="text-gray-400" />
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
const ViewAll = memo(function ViewAll({ inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex justify-center mt-12 md:mt-16"
    >
      <a
        href="/services"
        className="group relative inline-flex items-center justify-center gap-3
                   w-full sm:w-auto h-14 px-10 bg-black text-white
                   rounded-full overflow-hidden hover:bg-gray-800
                   active:scale-[0.98] transition-all duration-300"
      >
        <span
          className="tracking-[0.14em] uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          View All Services
        </span>
        <ArrowRight size={15} strokeWidth={1.5} />
      </a>
    </motion.div>
  )
})

// ── Services Grid ──────────────────────────────────────────
const ServicesGrid = memo(function ServicesGrid({ categories, inView }) {
  // Pre-calculate layouts
  const layoutData = useMemo(() => {
    return categories.map((cat, i) => ({
      category: cat,
      desktopLayout: getDesktopLayout(i, categories.length),
      mobileSpan: getMobileLayout(i, categories.length),
      isLarge: i === 0,
      isTall: getMobileLayout(i, categories.length).includes("row-span-2"),
    }))
  }, [categories])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[150px]">
        {layoutData.map(({ category, mobileSpan, isLarge, isTall }) => (
          <MobileCard
            key={category._id}
            category={category}
            span={mobileSpan}
            isLarge={isLarge}
            isTall={isTall}
          />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6 auto-rows-[190px] lg:auto-rows-[210px] xl:auto-rows-[220px]">
        {layoutData.map(({ category, desktopLayout }) => (
          <DesktopCard
            key={category._id}
            category={category}
            layout={desktopLayout}
          />
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
  
  // Single ref for entire section
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: "-100px" })

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
    let mounted = true
    
    getCategories()
      .then((data) => {
        if (mounted) {
          setCategories(Array.isArray(data) ? data.slice(0, MAX_VISIBLE) : [])
        }
      })
      .catch(() => {
        if (mounted) setError(true)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => { mounted = false }
  }, [])

  // Determine what to render
  const content = useMemo(() => {
    if (loading) return { type: "loading" }
    if (error) return { type: "error" }
    if (categories.length === 0) return { type: "empty" }
    return { type: "content", categories }
  }, [loading, error, categories])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-20 md:py-28 lg:py-36"
      style={{ fontFamily: SANS }}
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <SectionHeader inView={inView} />

        <AnimatePresence mode="wait">
          {content.type === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Skeleton />
            </motion.div>
          )}
          
          {content.type === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StateMessage type="error" onRetry={load} />
            </motion.div>
          )}
          
          {content.type === "empty" && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StateMessage type="empty" />
            </motion.div>
          )}
          
          {content.type === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ServicesGrid categories={content.categories} inView={inView} />
              <ViewAll inView={inView} />
              <TrustBar inView={inView} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
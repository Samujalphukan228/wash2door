"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight, ArrowRight, Shield, Clock, Sparkles } from "lucide-react"
import { getCategories } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Shield, label: "Satisfaction", desc: "Guaranteed" },
  { icon: Clock, label: "Same-Day", desc: "Service" },
  { icon: Sparkles, label: "Eco-Friendly", desc: "Products" },
]

const MAX_VISIBLE_SERVICES = 6

// ── Animation Variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// ── Desktop Layout Config ──────────────────────────────────
// Dynamic grid positions based on number of items
const getDesktopLayout = (index, total) => {
  // For 3 items: Featured left (2x2), stacked right (2x1 each)
  if (total <= 3) {
    if (index === 0) return { colSpan: 2, rowSpan: 2, variant: "featured" }
    if (index === 1) return { colSpan: 2, rowSpan: 1, variant: "wide" }
    if (index === 2) return { colSpan: 2, rowSpan: 1, variant: "wide" }
  }
  
  // For 4 items: Featured (2x2), one tall (1x2), two small (1x1)
  if (total === 4) {
    if (index === 0) return { colSpan: 2, rowSpan: 2, variant: "featured" }
    if (index === 1) return { colSpan: 1, rowSpan: 2, variant: "tall" }
    if (index === 2) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 3) return { colSpan: 1, rowSpan: 1, variant: "default" }
  }
  
  // For 5 items: Featured (2x2), tall (1x2), wide (2x1), two small
  if (total === 5) {
    if (index === 0) return { colSpan: 2, rowSpan: 2, variant: "featured" }
    if (index === 1) return { colSpan: 1, rowSpan: 2, variant: "tall" }
    if (index === 2) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 3) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 4) return { colSpan: 1, rowSpan: 1, variant: "default" }
  }
  
  // For 6 items: Optimized bento layout
  if (total >= 6) {
    if (index === 0) return { colSpan: 2, rowSpan: 2, variant: "featured" }
    if (index === 1) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 2) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 3) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 4) return { colSpan: 1, rowSpan: 1, variant: "default" }
    if (index === 5) return { colSpan: 2, rowSpan: 1, variant: "wide" }
  }
  
  return { colSpan: 1, rowSpan: 1, variant: "default" }
}

const getMobileLayout = (index, total) => {
  if (index === 0) return "large"
  if (index === 3 && total > 4) return "tall"
  if (index === 4 && total > 5) return "wide"
  return "default"
}

const getMobileClasses = (variant) => {
  switch (variant) {
    case "large": return "col-span-2 row-span-2"
    case "tall": return "row-span-2"
    case "wide": return "col-span-2"
    default: return ""
  }
}

// ── Subcomponents ──────────────────────────────────────────

const ServiceBadge = memo(function ServiceBadge({ count, size = "sm" }) {
  if (!count || count <= 0) return null

  const sizeClasses = size === "lg" ? "h-7 px-3" : "px-2.5 py-1"

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-full
                  bg-white/10 backdrop-blur-md border border-white/10`}
    >
      <span
        className="text-white/70 tracking-wider uppercase"
        style={{ fontSize: "9px", fontWeight: 500 }}
      >
        {count} {size === "lg" ? "services" : ""}
      </span>
    </span>
  )
})

const ArrowButton = memo(function ArrowButton({ size = "sm", animated = false }) {
  const dimensions = size === "lg" ? "w-12 h-12" : size === "md" ? "w-10 h-10" : "w-9 h-9"
  const iconSize = size === "lg" ? 18 : size === "md" ? 16 : 14

  return (
    <div
      className={`${dimensions} rounded-full bg-white/10 backdrop-blur-md
                  border border-white/10 flex items-center justify-center
                  ${animated
                    ? "group-hover:bg-white group-hover:border-white group-hover:scale-110 transition-all duration-500"
                    : ""
                  }`}
    >
      <ArrowUpRight
        size={iconSize}
        strokeWidth={1.5}
        className={`text-white ${animated
          ? "group-hover:text-black group-hover:rotate-45 transition-all duration-500"
          : ""
        }`}
      />
    </div>
  )
})

const CardImage = memo(function CardImage({ src, alt, icon, size = "md", animated = false }) {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${animated
          ? "transition-transform duration-[800ms] ease-out group-hover:scale-110"
          : ""
        }`}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
    )
  }

  const iconSize = size === "lg" ? "text-8xl" : size === "md" ? "text-6xl" : "text-4xl"

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <span className={iconSize}>{icon || "🚗"}</span>
    </div>
  )
})

// ── Mobile Service Card ────────────────────────────────────

const MobileServiceCard = memo(function MobileServiceCard({ category, index, variant = "default" }) {
  const image = category.image?.url

  const isLarge = variant === "large"
  const isTall = variant === "tall"
  const isWide = variant === "wide"
  const isExpanded = isLarge || isTall || isWide

  return (
    <motion.a
      href={`/services?category=${category._id}`}
      variants={scaleIn}
      className={`group block relative overflow-hidden rounded-2xl
                  active:scale-[0.98] transition-transform duration-200
                  no-underline will-change-transform
                  ${getMobileClasses(variant)}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="absolute inset-0 bg-gray-100">
        <CardImage
          src={image}
          alt={category.name}
          icon={category.icon}
          size={isLarge ? "lg" : "md"}
        />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true"
      />

      <div
        className={`relative z-10 h-full flex flex-col justify-between
                    ${isLarge ? "p-5" : isTall ? "p-4" : "p-3.5"}`}
      >
        <div className="flex items-start justify-between">
          <ServiceBadge count={category.totalServices} />
          <div className="ml-auto">
            <ArrowButton size={isExpanded ? "md" : "sm"} />
          </div>
        </div>

        <div>
          {category.icon && (
            <span
              className={`block mb-1 ${isLarge ? "text-xl" : "text-base"}`}
              aria-hidden="true"
            >
              {category.icon}
            </span>
          )}

          <h3
            className="text-white"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: isLarge ? "22px" : isTall ? "18px" : "15px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {category.name}
          </h3>

          {isExpanded && category.description && (
            <p
              className="text-white/45 line-clamp-2 mt-1.5 leading-relaxed"
              style={{ fontSize: "11px" }}
            >
              {category.description}
            </p>
          )}
        </div>
      </div>
    </motion.a>
  )
})

// ── Desktop Service Card ───────────────────────────────────

const DesktopServiceCard = memo(function DesktopServiceCard({ category, index, layout }) {
  const image = category.image?.url
  const { colSpan, rowSpan, variant } = layout
  
  const isFeatured = variant === "featured"
  const isWide = variant === "wide"
  const isTall = variant === "tall"

  const gridClasses = `col-span-${colSpan} row-span-${rowSpan}`
  
  // Determine content sizing based on variant
  const getPadding = () => {
    if (isFeatured) return "p-8 lg:p-10"
    if (isWide) return "p-6 lg:p-8"
    if (isTall) return "p-6"
    return "p-5 lg:p-6"
  }

  const getTitleSize = () => {
    if (isFeatured) return "clamp(28px, 3vw, 40px)"
    if (isWide) return "clamp(22px, 2.5vw, 28px)"
    if (isTall) return "clamp(20px, 2vw, 26px)"
    return "clamp(18px, 1.8vw, 22px)"
  }

  return (
    <motion.a
      href={`/services?category=${category._id}`}
      variants={scaleIn}
      className={`group block relative overflow-hidden no-underline will-change-transform
                  ${isFeatured ? "rounded-[2rem]" : "rounded-3xl"}
                  ${colSpan === 2 ? "col-span-2" : "col-span-1"}
                  ${rowSpan === 2 ? "row-span-2" : "row-span-1"}`}
      style={{ perspective: "1000px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image */}
      <div className="absolute inset-0 bg-gray-100 overflow-hidden">
        <CardImage
          src={image}
          alt={category.name}
          icon={category.icon}
          size={isFeatured ? "lg" : "md"}
          animated
        />
      </div>

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 transition-all duration-700
                    ${isFeatured 
                      ? "bg-gradient-to-t from-black/85 via-black/30 to-black/5 group-hover:from-black/90 group-hover:via-black/40" 
                      : "bg-gradient-to-t from-black/80 via-black/25 to-transparent group-hover:from-black/85"
                    }`}
        aria-hidden="true"
      />

      {/* Shine effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
                   bg-gradient-to-tr from-transparent via-white/5 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${getPadding()}`}>
        
        {/* Top Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <ServiceBadge count={category.totalServices} size={isFeatured ? "lg" : "sm"} />
            {isFeatured && (
              <span 
                className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md
                           text-white/80 tracking-wider uppercase hidden sm:inline-flex"
                style={{ fontSize: "9px", fontWeight: 500 }}
              >
                Popular
              </span>
            )}
          </div>
          <ArrowButton size={isFeatured ? "lg" : "md"} animated />
        </div>

        {/* Bottom Content */}
        <div className={isFeatured ? "max-w-lg" : ""}>
          {/* Category icon */}
          {category.icon && (
            <span 
              className={`block mb-2 transition-transform duration-500 group-hover:scale-110 origin-left
                          ${isFeatured ? "text-3xl" : isWide || isTall ? "text-2xl" : "text-xl"}`}
              aria-hidden="true"
            >
              {category.icon}
            </span>
          )}

          {/* Title */}
          <h3
            className="text-white mb-1.5 transition-transform duration-500 group-hover:translate-x-1"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: getTitleSize(),
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {category.name}
          </h3>

          {/* Description - show more lines for larger cards */}
          {category.description && (
            <p
              className={`text-white/50 leading-relaxed transition-all duration-500
                          group-hover:text-white/70
                          ${isFeatured ? "line-clamp-3 text-sm lg:text-base" : 
                            isWide ? "line-clamp-2 text-sm" : 
                            isTall ? "line-clamp-3 text-sm" : "line-clamp-2 text-xs"}`}
            >
              {category.description}
            </p>
          )}

          {/* CTA hint - for featured and wide */}
          {(isFeatured || isWide) && (
            <div className="mt-4 flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-500">
              <span className="text-xs tracking-wider uppercase">Explore services</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          )}
        </div>
      </div>

      {/* Border glow on hover */}
      <div 
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 
                   transition-opacity duration-500 pointer-events-none
                   shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
        aria-hidden="true"
      />
    </motion.a>
  )
})

// ── Skeleton Loaders ───────────────────────────────────────

const SkeletonCard = memo(function SkeletonCard({ colSpan = 1, rowSpan = 1, mobile = false }) {
  const baseClasses = "bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse"

  if (mobile) {
    return <div className={`${baseClasses} rounded-2xl`} />
  }

  return (
    <div 
      className={`${baseClasses} rounded-3xl
                  ${colSpan === 2 ? "col-span-2" : "col-span-1"}
                  ${rowSpan === 2 ? "row-span-2" : "row-span-1"}`} 
    />
  )
})

const LoadingGrid = memo(function LoadingGrid() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
        <div className="col-span-2 row-span-2 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse rounded-2xl" />
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse rounded-2xl" />
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse rounded-2xl" />
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6 auto-rows-[180px] lg:auto-rows-[200px]">
        <SkeletonCard colSpan={2} rowSpan={2} />
        <SkeletonCard colSpan={2} rowSpan={1} />
        <SkeletonCard colSpan={2} rowSpan={1} />
      </div>
    </>
  )
})

// ── Trust Bar ──────────────────────────────────────────────

const TrustItem = memo(function TrustItem({ icon: Icon, label, desc, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col items-center text-center p-3 sm:p-4
                 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80
                 sm:flex-row sm:items-center sm:text-left sm:gap-3
                 transition-colors duration-300"
    >
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm
                   flex items-center justify-center shrink-0 mb-2 sm:mb-0"
      >
        <Icon size={18} strokeWidth={1.3} className="text-gray-400" />
      </div>
      <div>
        <p
          className="text-black text-xs sm:text-sm leading-tight"
          style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}
        >
          {label}
        </p>
        <p className="text-gray-400 text-[10px] sm:text-xs leading-tight">
          {desc}
        </p>
      </div>
    </motion.div>
  )
})

const TrustBar = memo(function TrustBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="grid grid-cols-3 gap-2 sm:gap-5 mt-10 md:mt-20 pt-8 md:pt-12
                 border-t border-gray-100"
    >
      {TRUST_ITEMS.map((item, i) => (
        <TrustItem key={i} index={i} {...item} />
      ))}
    </motion.div>
  )
})

// ── Empty / Error States ───────────────────────────────────

const EmptyState = memo(function EmptyState({ type = "empty", onRetry }) {
  const isError = type === "error"

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 md:py-24"
    >
      <div
        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50
                   flex items-center justify-center"
      >
        <span className="text-2xl">{isError ? "⚠️" : "🧹"}</span>
      </div>

      <h3
        className="text-black mb-2"
        style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 400 }}
      >
        {isError ? "Something went wrong" : "No services yet"}
      </h3>

      <p className="text-gray-400 mb-6" style={{ fontSize: "14px" }}>
        {isError ? "Unable to load services" : "Check back soon!"}
      </p>

      {isError && onRetry && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="h-12 px-8 bg-black text-white rounded-full
                     tracking-wider uppercase hover:bg-gray-800
                     transition-colors duration-300"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
})

// ── Section Header ─────────────────────────────────────────

const SectionHeader = memo(function SectionHeader() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.header 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="mb-10 md:mb-16 lg:mb-20"
    >
      <motion.div
        variants={fadeInLeft}
        className="flex items-center gap-4 mb-4 md:mb-6"
      >
        <span className="block w-10 h-px bg-black" aria-hidden="true" />
        <span
          className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: "Georgia, serif", fontSize: "10px" }}
        >
          Our Services
        </span>
      </motion.div>

      <div className="md:flex md:items-end md:justify-between md:gap-8">
        <motion.h2
          variants={fadeInUp}
          id="services-heading"
          className="text-black mb-4 md:mb-0"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(32px, 7vw, 60px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          What We<br className="hidden sm:block" /> Offer
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-gray-400 max-w-sm leading-relaxed md:text-right"
          style={{ fontSize: "15px" }}
        >
          Premium car care solutions crafted for perfection, delivered right to your doorstep.
        </motion.p>
      </div>
    </motion.header>
  )
})

// ── View All Button ────────────────────────────────────────

const ViewAllButton = memo(function ViewAllButton() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex justify-center mt-10 md:mt-16"
    >
      <motion.a
        href="/services"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex items-center justify-center gap-3
                   w-full sm:w-auto h-14 sm:h-16 px-10
                   bg-black text-white rounded-full overflow-hidden
                   hover:shadow-xl hover:shadow-black/10
                   transition-shadow duration-500 no-underline"
      >
        {/* Hover background sweep */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 
                     translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"
          aria-hidden="true"
        />
        
        <span
          className="relative z-10 tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.15em" }}
        >
          View All Services
        </span>
        <ArrowRight
          size={16}
          strokeWidth={1.5}
          className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
        />
      </motion.a>
    </motion.div>
  )
})

// ── Services Grid ──────────────────────────────────────────

const ServicesGrid = memo(function ServicesGrid({ categories }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {/* Mobile Grid */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
        {categories.map((category, i) => (
          <MobileServiceCard
            key={category._id}
            category={category}
            index={i}
            variant={getMobileLayout(i, categories.length)}
          />
        ))}
      </div>

      {/* Desktop Grid - Optimized Bento Layout */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6 auto-rows-[180px] lg:auto-rows-[200px]">
        {categories.map((category, i) => (
          <DesktopServiceCard
            key={category._id}
            category={category}
            index={i}
            layout={getDesktopLayout(i, categories.length)}
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

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch categories:", err)
      }
      setError(true)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      try {
        const data = await getCategories()
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to fetch categories:", err)
          }
          setError(true)
          setLoading(false)
        }
      }
    }

    load()
    
    return () => {
      isMounted = false
    }
  }, [])

  const visibleCategories = categories.slice(0, MAX_VISIBLE_SERVICES)

  return (
    <section
      className="w-full bg-white py-16 md:py-28 lg:py-36"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        <SectionHeader />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingGrid />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState type="error" onRetry={fetchCategories} />
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState type="empty" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ServicesGrid categories={visibleCategories} />
              <ViewAllButton />
              <TrustBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
"use client"

import { useEffect, useState, useCallback, memo, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ArrowUpRight, ArrowRight, Shield, Clock, Sparkles, RotateCcw } from "lucide-react"
import { getCategories } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Shield,   label: "Satisfaction", desc: "Guaranteed"    },
  { icon: Clock,    label: "Same-Day",     desc: "Service"       },
  { icon: Sparkles, label: "Eco-Friendly", desc: "Products"      },
]

const MAX_VISIBLE = 6
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// ── Grid layout helpers ────────────────────────────────────
// Returns Tailwind col/row span classes for the bento grid
function desktopLayout(index, total) {
  // ≤3: big left + stacked right column
  if (total <= 3) {
    if (index === 0) return { col: "md:col-span-2 md:row-span-2", variant: "featured" }
    return                  { col: "md:col-span-2 md:row-span-1", variant: "wide" }
  }
  // 4: big left + tall right + 2 small
  if (total === 4) {
    if (index === 0) return { col: "md:col-span-2 md:row-span-2", variant: "featured" }
    if (index === 1) return { col: "md:col-span-1 md:row-span-2", variant: "tall" }
    return                  { col: "md:col-span-1 md:row-span-1", variant: "default" }
  }
  // 5+: big left + 4 small + 1 wide footer
  if (index === 0) return { col: "md:col-span-2 md:row-span-2", variant: "featured" }
  if (index === 5) return { col: "md:col-span-2 md:row-span-1", variant: "wide" }
  return                  { col: "md:col-span-1 md:row-span-1", variant: "default" }
}

function mobileLayout(index, total) {
  if (index === 0) return "col-span-2 row-span-2"
  if (index === 3 && total > 4) return "row-span-2"
  if (index === 4 && total > 5) return "col-span-2"
  return ""
}

// ── Animation variants ─────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1]

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

const fadeLeft = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.55, ease: EASE } },
}

const cardReveal = {
  hidden:  { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.6, ease: EASE } },
}

// ── CardImage ──────────────────────────────────────────────
const CardImage = memo(function CardImage({ src, alt, icon, animateHover }) {
  const [err, setErr] = useState(false)

  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center
                    ${animateHover
                      ? "transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                      : ""}`}
        loading="lazy"
        decoding="async"
        onError={() => setErr(true)}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <span className="text-5xl">{icon || "🚗"}</span>
    </div>
  )
})

// ── ArrowCircle ────────────────────────────────────────────
const ArrowCircle = memo(function ArrowCircle({ size = "sm" }) {
  const dim = size === "lg" ? "w-11 h-11" : size === "md" ? "w-9 h-9" : "w-8 h-8"
  const ico = size === "lg" ? 17 : size === "md" ? 14 : 13

  return (
    <div className={`${dim} rounded-full border border-white/20 bg-white/10 backdrop-blur-sm
                     flex items-center justify-center shrink-0
                     group-hover:bg-white group-hover:border-white
                     transition-all duration-400`}>
      <ArrowUpRight
        size={ico}
        strokeWidth={1.5}
        className="text-white group-hover:text-black
                   group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                   transition-all duration-400"
      />
    </div>
  )
})

// ── ServiceCount badge ─────────────────────────────────────
const CountBadge = memo(function CountBadge({ count, large }) {
  if (!count || count <= 0) return null
  return (
    <span className={`inline-flex items-center rounded-full border border-white/15
                      bg-white/10 backdrop-blur-sm
                      ${large ? "px-3 py-1.5" : "px-2.5 py-1"}`}>
      <span className="text-white/70 tracking-wider uppercase"
        style={{ fontSize: "9px", fontWeight: 500 }}>
        {count}{large ? " services" : ""}
      </span>
    </span>
  )
})

// ── Desktop card overlay gradient ─────────────────────────
function Overlay({ featured }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700
                  ${featured
                    ? "bg-gradient-to-t from-black/88 via-black/35 to-black/5 group-hover:from-black/92"
                    : "bg-gradient-to-t from-black/82 via-black/25 to-transparent group-hover:from-black/88"}`}
      aria-hidden="true"
    />
  )
}

// ── Desktop card ───────────────────────────────────────────
const DesktopCard = memo(function DesktopCard({ category, index, total }) {
  const { col, variant } = desktopLayout(index, total)
  const featured = variant === "featured"
  const wide     = variant === "wide"
  const tall     = variant === "tall"

  const pad    = featured ? "p-8 lg:p-10" : wide ? "p-6 lg:p-8" : "p-5"
  const fsize  = featured ? "clamp(26px,3vw,38px)" : wide ? "clamp(20px,2.5vw,26px)" : tall ? "clamp(18px,2vw,22px)" : "clamp(16px,1.8vw,20px)"
  const radius = featured ? "rounded-[2rem]" : "rounded-[1.5rem]"

  return (
    <motion.a
      variants={cardReveal}
      href={`/services?category=${category._id}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={`group block relative overflow-hidden no-underline will-change-transform
                  ${radius} ${col}`}
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden bg-gray-100">
        <CardImage
          src={category.image?.url}
          alt={category.name}
          icon={category.icon}
          animateHover
        />
      </div>

      <Overlay featured={featured} />

      {/* Inset border on hover */}
      <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100
                      transition-opacity duration-500 pointer-events-none
                      shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
        aria-hidden="true" />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${pad}`}>
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CountBadge count={category.totalServices} large={featured} />
            {featured && (
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full
                               bg-white/15 backdrop-blur-sm border border-white/10
                               text-white/70 tracking-wider uppercase"
                style={{ fontSize: "8px", fontWeight: 500 }}>
                Popular
              </span>
            )}
          </div>
          <ArrowCircle size={featured ? "lg" : "md"} />
        </div>

        {/* Bottom */}
        <div>
          {category.icon && (
            <span
              className={`block mb-2 transition-transform duration-500 group-hover:scale-110 origin-left
                          ${featured ? "text-3xl" : wide || tall ? "text-2xl" : "text-xl"}`}
              aria-hidden="true"
            >
              {category.icon}
            </span>
          )}

          <h3
            className="text-white mb-1.5 leading-tight"
            style={{ fontFamily: SERIF, fontWeight: 400, fontSize: fsize, letterSpacing: "-0.02em" }}
          >
            {category.name}
          </h3>

          {category.description && (
            <p className={`text-white/50 leading-relaxed group-hover:text-white/65
                           transition-colors duration-500
                           ${featured ? "line-clamp-3 text-sm" : wide ? "line-clamp-2 text-[13px]" : "line-clamp-2 text-xs"}`}>
              {category.description}
            </p>
          )}

          {(featured || wide) && (
            <div className="mt-4 flex items-center gap-2 text-white/35 group-hover:text-white/65
                            transition-colors duration-400">
              <span style={{ fontSize: "10px", letterSpacing: "0.15em" }}
                className="uppercase tracking-wider">Explore</span>
              <ArrowRight size={12}
                className="group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          )}
        </div>
      </div>
    </motion.a>
  )
})

// ── Mobile card ────────────────────────────────────────────
const MobileCard = memo(function MobileCard({ category, index, total }) {
  const span    = mobileLayout(index, total)
  const isLarge = index === 0
  const isTall  = span.includes("row-span-2")

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
        <CardImage
          src={category.image?.url}
          alt={category.name}
          icon={category.icon}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true" />

      <div className={`relative z-10 h-full flex flex-col justify-between
                       ${isLarge ? "p-4" : "p-3.5"}`}>
        <div className="flex items-start justify-between">
          <CountBadge count={category.totalServices} />
          <ArrowCircle size={isLarge ? "md" : "sm"} />
        </div>

        <div>
          {category.icon && (
            <span className={`block mb-1 ${isLarge ? "text-xl" : "text-base"}`} aria-hidden="true">
              {category.icon}
            </span>
          )}
          <h3
            className="text-white leading-tight"
            style={{
              fontFamily: SERIF, fontWeight: 400, letterSpacing: "-0.02em",
              fontSize: isLarge ? "20px" : isTall ? "17px" : "14px",
            }}
          >
            {category.name}
          </h3>
          {isLarge && category.description && (
            <p className="text-white/45 line-clamp-2 mt-1 leading-relaxed"
              style={{ fontSize: "11px" }}>
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
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
        {[...Array(4)].map((_, i) => (
          <div key={i}
            className={`bg-gray-100 animate-pulse rounded-2xl
                        ${i === 0 ? "col-span-2 row-span-2" : ""}`} />
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6 auto-rows-[180px] lg:auto-rows-[200px]">
        {[
          "md:col-span-2 md:row-span-2",
          "md:col-span-1 md:row-span-1",
          "md:col-span-1 md:row-span-1",
          "md:col-span-1 md:row-span-1",
          "md:col-span-1 md:row-span-1",
        ].map((cls, i) => (
          <div key={i} className={`bg-gray-100 animate-pulse rounded-[1.5rem] ${cls}`} />
        ))}
      </div>
    </>
  )
}

// ── Empty / Error ──────────────────────────────────────────
function StateMessage({ type, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
        <span className="text-3xl">{type === "error" ? "⚠️" : "🧹"}</span>
      </div>
      <h3 className="text-black mb-2" style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 400 }}>
        {type === "error" ? "Something went wrong" : "No services yet"}
      </h3>
      <p className="text-gray-400 mb-7" style={{ fontSize: "14px" }}>
        {type === "error" ? "Unable to load services." : "Check back soon!"}
      </p>
      {type === "error" && onRetry && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onRetry}
          className="inline-flex items-center gap-2 h-12 px-7 bg-black text-white
                     rounded-full tracking-wider uppercase hover:bg-gray-800
                     transition-colors duration-300"
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          <RotateCcw size={13} strokeWidth={1.5} />
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
}

// ── Section header ─────────────────────────────────────────
const SectionHeader = memo(function SectionHeader() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.header
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mb-10 md:mb-16 lg:mb-20"
    >
      <motion.div variants={fadeLeft} className="flex items-center gap-4 mb-5">
        <span className="block w-10 h-px bg-black" aria-hidden="true" />
        <span className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: SERIF, fontSize: "10px" }}>
          Our Services
        </span>
      </motion.div>

      <div className="md:flex md:items-end md:justify-between md:gap-10">
        <motion.h2
          variants={fadeUp}
          id="services-heading"
          className="text-black mb-4 md:mb-0"
          style={{
            fontFamily: SERIF, fontWeight: 300,
            fontSize: "clamp(2rem, 7vw, 3.75rem)",
            lineHeight: 1.05, letterSpacing: "-0.03em",
          }}
        >
          What We<br className="hidden sm:block" /> Offer
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-gray-400 max-w-xs leading-relaxed md:text-right"
          style={{ fontSize: "14px" }}
        >
          Premium cleaning solutions delivered right to your doorstep — fast, safe &amp; hassle-free.
        </motion.p>
      </div>
    </motion.header>
  )
})

// ── Trust bar ──────────────────────────────────────────────
const TrustBar = memo(function TrustBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 md:mt-16
                 pt-8 md:pt-10 border-t border-gray-100"
    >
      {TRUST_ITEMS.map(({ icon: Icon, label, desc }, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3
                     p-3 sm:p-4 rounded-2xl bg-gray-50 hover:bg-gray-100
                     transition-colors duration-300 text-center sm:text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <Icon size={17} strokeWidth={1.3} className="text-gray-400" />
          </div>
          <div>
            <p className="text-black leading-tight" style={{ fontFamily: SERIF, fontSize: "13px" }}>
              {label}
            </p>
            <p className="text-gray-400 leading-tight" style={{ fontSize: "11px" }}>
              {desc}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
})

// ── View all CTA ───────────────────────────────────────────
const ViewAll = memo(function ViewAll() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="flex justify-center mt-10 md:mt-14"
    >
      <motion.a
        href="/services"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex items-center justify-center gap-3
                   w-full sm:w-auto h-14 px-10 bg-black text-white
                   rounded-full overflow-hidden no-underline
                   hover:shadow-xl hover:shadow-black/10 transition-shadow duration-500"
      >
        {/* Sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900
                        -translate-x-full group-hover:translate-x-0
                        transition-transform duration-500"
          aria-hidden="true" />
        <span className="relative z-10 tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em" }}>
          View All Services
        </span>
        <ArrowRight size={15} strokeWidth={1.5}
          className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
      </motion.a>
    </motion.div>
  )
})

// ── Services grid ──────────────────────────────────────────
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
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
        {categories.map((cat, i) => (
          <MobileCard key={cat._id} category={cat} index={i} total={categories.length} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6
                      auto-rows-[180px] lg:auto-rows-[200px]">
        {categories.map((cat, i) => (
          <DesktopCard key={cat._id} category={cat} index={i} total={categories.length} />
        ))}
      </div>
    </motion.div>
  )
})

// ── Main ───────────────────────────────────────────────────
export default function Services() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)

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
      .then(data => { if (alive) setCategories(Array.isArray(data) ? data.slice(0, MAX_VISIBLE) : []) })
      .catch(()  => { if (alive) setError(true) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <section
      className="w-full bg-white py-16 md:py-28 lg:py-36"
      style={{ fontFamily: SANS }}
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
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
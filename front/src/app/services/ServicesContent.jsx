"use client"

import { useEffect, useState, memo, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Tag,
  ChevronDown,
  Sparkles,
  Phone,
} from "lucide-react"
import { getPublicServices, getCategories } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"

// ── Animation Variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
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

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

// ── Helper Functions ───────────────────────────────────────
const getImageUrl = (image) => {
  if (!image) return null
  if (typeof image === "string") return image
  if (typeof image === "object" && image.url) return image.url
  return null
}

// ── Image with Error Fallback ──────────────────────────────
const ServiceImage = memo(function ServiceImage({
  src,
  alt,
  fallbackIcon,
  className = "",
}) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
      >
        <span className="text-5xl">{fallbackIcon || "📦"}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
})

// ── Skeleton Components ────────────────────────────────────
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="h-3 w-20 bg-gray-100 animate-pulse rounded-full" />
        <div className="h-6 w-40 bg-gray-100 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
          <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
        </div>
        <div className="h-12 w-full bg-gray-100 animate-pulse rounded-xl mt-4" />
      </div>
    </div>
  )
})

const SkeletonSection = memo(function SkeletonSection() {
  return (
    <div className="py-16 md:py-24 border-b border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="aspect-[4/3] bg-gray-100 animate-pulse rounded-2xl" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-gray-100 animate-pulse rounded-full" />
          <div className="h-10 w-64 bg-gray-100 animate-pulse rounded" />
          <div className="space-y-2 mt-4">
            <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
            <div className="h-3 w-4/5 bg-gray-100 animate-pulse rounded" />
          </div>
          <div className="h-12 w-40 bg-gray-100 animate-pulse rounded-xl mt-6" />
        </div>
      </div>
    </div>
  )
})

// ── Empty State ────────────────────────────────────────────
const EmptyState = memo(function EmptyState() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20 md:py-32 px-4"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-3xl">🧹</span>
      </div>

      <h3
        className="text-black mb-3 text-center"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "20px",
        }}
      >
        No Services Found
      </h3>

      <p
        className="text-gray-400 text-center max-w-xs mb-8 leading-relaxed"
        style={{ fontSize: "14px" }}
      >
        No services available in this category yet. Please check back soon.
      </p>

      <a
        href="/services"
        className="group inline-flex items-center gap-2 h-12 px-6
                   bg-black text-white rounded-full no-underline
                   hover:bg-gray-800 active:scale-[0.97]
                   transition-all duration-300"
      >
        <span
          className="tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          View All Services
        </span>
        <ArrowRight size={14} />
      </a>
    </motion.div>
  )
})

// ── Category Filter ────────────────────────────────────────
const CategoryFilter = memo(function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}) {
  return (
    <div className="-mx-5 px-5 md:mx-0 md:px-0">
      <div
        className="flex gap-2 md:gap-2.5 overflow-x-auto pb-2 md:pb-0 md:flex-wrap snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(null)}
          className={`shrink-0 snap-start tracking-[0.18em] uppercase
                     px-5 py-2.5 border rounded-full transition-colors duration-300
                     whitespace-nowrap min-h-[44px]
                     ${!activeCategory
                       ? "bg-white text-black border-white"
                       : "text-white/70 border-white/20 hover:border-white/50 hover:text-white"
                     }`}
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          All Services
        </motion.button>

        {categories.map((cat) => (
          <motion.button
            key={cat._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(cat._id)}
            className={`shrink-0 snap-start tracking-[0.18em] uppercase
                       px-5 py-2.5 border rounded-full transition-colors duration-300
                       flex items-center gap-2 whitespace-nowrap min-h-[44px]
                       ${activeCategory === cat._id
                         ? "bg-white text-black border-white"
                         : "text-white/70 border-white/20 hover:border-white/50 hover:text-white"
                       }`}
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            {cat.icon && <span className="text-sm">{cat.icon}</span>}
            {cat.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
})

// ── Service Variant ────────────────────────────────────────
const ServiceVariant = memo(function ServiceVariant({ variant }) {
  const price = variant.discountPrice || variant.price
  const hasDiscount = variant.discountPrice && variant.discountPrice < variant.price

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-300">
      <p
        className="text-black mb-2"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontSize: "14px",
        }}
      >
        {variant.name}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Tag size={12} strokeWidth={1.5} className="text-gray-400" />
          <span className="text-black font-medium" style={{ fontSize: "13px" }}>
            ₹{price?.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <span
              className="text-gray-400 line-through ml-1"
              style={{ fontSize: "11px" }}
            >
              ₹{variant.price?.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {variant.duration && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-gray-500" style={{ fontSize: "12px" }}>
              {variant.duration} min
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

// ── Mobile Service Card ────────────────────────────────────
const MobileServiceCard = memo(function MobileServiceCard({ service, index }) {
  const [showVariants, setShowVariants] = useState(false)
  const variantsId = `variants-mobile-${service._id}`

  const image = getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0])
  const categoryName = service.category?.name || ""
  const categoryIcon = service.category?.icon || ""

  const activeVariants = useMemo(() => 
    service.variants?.filter((v) => v.isActive !== false) || [],
    [service.variants]
  )

  const highlights = service.highlights || service.includes || []

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={scaleIn}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
          <ServiceImage
            src={image}
            alt={service.name}
            fallbackIcon={categoryIcon || "📦"}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span
            className="bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "11px",
              fontWeight: 400,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {service.tier && (
          <div className="absolute top-3 right-3">
            <span
              className="bg-white/90 backdrop-blur-sm text-black px-3 py-1.5 rounded-lg
                         tracking-wider uppercase"
              style={{ fontSize: "9px", fontWeight: 500 }}
            >
              {service.tier}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span
            className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "16px",
              fontWeight: 400,
            }}
          >
            ₹{service.startingPrice?.toLocaleString("en-IN") || 0}+
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-gray-400 tracking-wider uppercase"
            style={{ fontSize: "10px" }}
          >
            {categoryIcon} {categoryName}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: 1.2,
          }}
        >
          {service.name}
        </h3>

        {/* Description */}
        <p
          className="text-gray-400 leading-relaxed mb-4 line-clamp-2"
          style={{ fontSize: "14px" }}
        >
          {service.description || service.shortDescription}
        </p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {highlights.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle
                  size={14}
                  strokeWidth={1.5}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                <span className="text-gray-600" style={{ fontSize: "13px" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Variants toggle */}
        {activeVariants.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowVariants(!showVariants)}
              aria-expanded={showVariants}
              aria-controls={variantsId}
              className="flex items-center justify-between w-full py-3 border-t border-gray-100"
            >
              <span className="text-gray-500" style={{ fontSize: "13px" }}>
                {activeVariants.length} pricing option
                {activeVariants.length > 1 ? "s" : ""}
              </span>
              <motion.div
                animate={{ rotate: showVariants ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} strokeWidth={1.5} className="text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {showVariants && (
                <motion.div
                  id={variantsId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    {activeVariants.map((variant) => (
                      <ServiceVariant key={variant._id} variant={variant} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* CTA */}
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href={`/bookings?service=${encodeURIComponent(service._id)}`}
          className="group flex items-center justify-center gap-2 h-12
                     bg-black text-white rounded-xl no-underline w-full
                     transition-colors duration-300"
        >
          <span
            className="tracking-wider uppercase"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Book Now
          </span>
          <ArrowRight size={14} />
        </motion.a>
      </div>
    </motion.div>
  )
})

// ── Desktop Service Section ────────────────────────────────
const DesktopServiceSection = memo(function DesktopServiceSection({
  service,
  index,
}) {
  const isEven = index % 2 === 0

  const image = getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0])
  const categoryName = service.category?.name || ""
  const categoryIcon = service.category?.icon || ""

  const activeVariants = useMemo(() => 
    service.variants?.filter((v) => v.isActive !== false) || [],
    [service.variants]
  )

  const highlights = service.highlights || service.includes || []

  return (
    <motion.div
      id={service._id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="py-16 lg:py-24 border-b border-gray-100 last:border-0"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image */}
        <motion.div
          variants={isEven ? slideInLeft : slideInRight}
          className={isEven ? "lg:order-1" : "lg:order-2"}
        >
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="aspect-[4/3] bg-gray-100">
              <ServiceImage
                src={image}
                alt={service.name}
                fallbackIcon={categoryIcon || "📦"}
                className="transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Number badge */}
            <div className="absolute top-5 left-5">
              <span
                className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Price badge */}
            <div className="absolute bottom-5 right-5">
              <span
                className="bg-white text-black px-5 py-2.5 rounded-xl shadow-lg"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "18px",
                  fontWeight: 400,
                }}
              >
                ₹{service.startingPrice?.toLocaleString("en-IN") || 0}+
              </span>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={isEven ? slideInRight : slideInLeft}
          className={isEven ? "lg:order-2" : "lg:order-1"}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-black" aria-hidden="true" />
            <span
              className="tracking-[0.35em] uppercase text-gray-400"
              style={{ fontSize: "10px" }}
            >
              {categoryIcon} {categoryName}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-black mb-4"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {service.name}
          </h2>

          {/* Tier */}
          {service.tier && (
            <div className="mb-5">
              <span
                className="inline-block px-3 py-1.5 border border-gray-200 rounded-lg
                           text-gray-500 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                {service.tier}
              </span>
            </div>
          )}

          {/* Description */}
          <p
            className="text-gray-500 leading-relaxed mb-6"
            style={{ fontSize: "15px" }}
          >
            {service.description || service.shortDescription}
          </p>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-2.5 mb-6">
              {highlights.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle
                    size={16}
                    strokeWidth={1.5}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600" style={{ fontSize: "14px" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Variants */}
          {activeVariants.length > 0 && (
            <div className="mb-8">
              <p
                className="text-gray-400 tracking-wider uppercase mb-3"
                style={{ fontSize: "10px" }}
              >
                Pricing Options
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeVariants.slice(0, 4).map((variant) => (
                  <ServiceVariant key={variant._id} variant={variant} />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href={`/bookings?service=${encodeURIComponent(service._id)}`}
            className="group inline-flex items-center gap-3 h-12 px-8
                       bg-black text-white rounded-full no-underline
                       hover:bg-gray-800 transition-colors duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Book {service.name}
            </span>
            <ArrowRight size={16} />
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  )
})

// ── Hero Section ───────────────────────────────────────────
const Hero = memo(function Hero({
  activeCategoryData,
  categories,
  activeCategory,
  onCategoryChange,
}) {
  const pageTitle = activeCategoryData
    ? `${activeCategoryData.icon || ""} ${activeCategoryData.name}`
    : "Our Services"

  const pageSubtitle =
    activeCategoryData?.description ||
    "Professional cleaning delivered to your doorstep — every day, 9 AM to 5 PM."

  return (
    <section className="relative bg-black pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, white 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-5">
          <span className="w-10 h-px bg-white/30" aria-hidden="true" />
          <span
            className="tracking-[0.35em] uppercase text-white/50"
            style={{ fontSize: "10px" }}
          >
            {activeCategoryData ? "Category" : "What We Offer"}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          className="text-white mb-4"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "600px",
          }}
        >
          {pageTitle}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          className="text-white/40 max-w-md mb-8 leading-relaxed"
          style={{ fontSize: "15px" }}
        >
          {pageSubtitle}
        </motion.p>

        {/* Category filter */}
        <motion.div variants={fadeInUp}>
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </motion.div>
      </motion.div>
    </section>
  )
})

// ── Bottom CTA Section ─────────────────────────────────────
const BottomCTA = memo(function BottomCTA() {
  return (
    <section className="w-full bg-black py-16 md:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-white/30" />
              <span
                className="text-white/40 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Ready to book?
              </span>
            </div>

            <h2
              className="text-white"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Book a Service <span className="italic text-white/40">Today</span>
            </h2>
          </div>

          {/* Right */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href="/bookings"
              className="group inline-flex items-center justify-center gap-3 h-12 px-8
                         bg-white text-black rounded-full no-underline
                         hover:bg-gray-100 transition-colors duration-300"
            >
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Book Now
              </span>
              <ArrowRight size={16} />
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center justify-center gap-3 h-12 px-8
                         border border-white/20 text-white rounded-full no-underline
                         hover:bg-white/5 transition-colors duration-300"
            >
              <Phone size={16} strokeWidth={1.5} />
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "11px" }}
              >
                {PHONE_NUMBER}
              </span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  )
})

// ── Error State ────────────────────────────────────────────
const ErrorState = memo(function ErrorState({ onRetry }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex flex-col items-center justify-center py-20 md:py-32"
    >
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-2xl">⚠️</span>
      </div>

      <h3
        className="text-black mb-2"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: "18px",
          fontWeight: 400,
        }}
      >
        Something went wrong
      </h3>

      <p className="text-gray-400 mb-6" style={{ fontSize: "14px" }}>
        Failed to load services
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="group inline-flex items-center gap-2 h-12 px-6
                   bg-black text-white rounded-full
                   hover:bg-gray-800 transition-colors duration-300"
      >
        <span
          className="tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Try Again
        </span>
      </motion.button>
    </motion.div>
  )
})

// ── Services List ──────────────────────────────────────────
const ServicesList = memo(function ServicesList({ services }) {
  return (
    <>
      {/* Mobile: Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 md:hidden">
        {services.map((service, i) => (
          <MobileServiceCard key={service._id} service={service} index={i} />
        ))}
      </div>

      {/* Desktop: Alternating sections */}
      <div className="hidden md:block">
        {services.map((service, i) => (
          <DesktopServiceSection key={service._id} service={service} index={i} />
        ))}
      </div>
    </>
  )
})

// ── Loading State ──────────────────────────────────────────
const LoadingState = memo(function LoadingState() {
  return (
    <>
      {/* Mobile skeletons */}
      <div className="flex flex-col gap-5 py-6 md:hidden">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Desktop skeletons */}
      <div className="hidden md:block">
        <SkeletonSection />
        <SkeletonSection />
      </div>
    </>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function ServicesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryId = searchParams.get("category")

  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(categoryId)
  const [activeCategoryData, setActiveCategoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Sync URL param with state
  useEffect(() => {
    setActiveCategory(categoryId)
  }, [categoryId])

  // Fetch data
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(false)

      try {
        const [servicesData, categoriesData] = await Promise.all([
          getPublicServices(activeCategory ? { category: activeCategory } : {}),
          getCategories(),
        ])

        if (!isMounted) return

        setServices(servicesData || [])
        setCategories(categoriesData || [])

        if (activeCategory && categoriesData) {
          const found = categoriesData.find((c) => c._id === activeCategory)
          setActiveCategoryData(found || null)
        } else {
          setActiveCategoryData(null)
        }
      } catch (err) {
        if (!isMounted) return
        if (process.env.NODE_ENV === "development") {
          console.error("Fetch failed:", err)
        }
        setError(true)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [activeCategory])

  // Handle category change
  const handleCategoryChange = useCallback(
    (catId) => {
      if (catId) {
        router.push(`/services?category=${encodeURIComponent(catId)}`, {
          scroll: false,
        })
      } else {
        router.push("/services", { scroll: false })
      }
    },
    [router]
  )

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Hero */}
      <Hero
        activeCategoryData={activeCategoryData}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Services List */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingState />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState onRetry={handleRetry} />
              </motion.div>
            ) : services.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div
                key="services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ServicesList services={services} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom CTA */}
      {!loading && !error && services.length > 0 && <BottomCTA />}
    </main>
  )
}
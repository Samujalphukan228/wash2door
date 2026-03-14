// app/services/ServicesContent.jsx
"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowUpRight,
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
const ANIMATION_CONFIG = {
  duration: 0.8,
  stagger: 0.1,
  ease: "power4.out",
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

// ── Helper Functions ───────────────────────────────────────
const getImageUrl = (image) => {
  if (!image) return null
  if (typeof image === "string") return image
  if (typeof image === "object" && image.url) return image.url
  return null
}

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
    <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4">
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
    </div>
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
        className="flex gap-2 md:gap-2.5 overflow-x-auto pb-2 md:pb-0 md:flex-wrap
                   snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <button
          onClick={() => onCategoryChange(null)}
          className={`shrink-0 snap-start tracking-[0.18em] uppercase
                     px-5 py-2.5 border rounded-full transition-all duration-300
                     whitespace-nowrap min-h-[44px]
                     ${
                       !activeCategory
                         ? "bg-white text-black border-white"
                         : "text-white/70 border-white/20 hover:border-white/50 hover:text-white"
                     }`}
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          All Services
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onCategoryChange(cat._id)}
            className={`shrink-0 snap-start tracking-[0.18em] uppercase
                       px-5 py-2.5 border rounded-full transition-all duration-300
                       flex items-center gap-2 whitespace-nowrap min-h-[44px]
                       ${
                         activeCategory === cat._id
                           ? "bg-white text-black border-white"
                           : "text-white/70 border-white/20 hover:border-white/50 hover:text-white"
                       }`}
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            {cat.icon && <span className="text-sm">{cat.icon}</span>}
            {cat.name}
          </button>
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
  const cardRef = useRef(null)
  const [showVariants, setShowVariants] = useState(false)

  const image =
    getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0])
  const categoryName = service.category?.name || ""
  const categoryIcon = service.category?.icon || ""

  const activeVariants = service.variants
    ? service.variants.filter((v) => v.isActive !== false)
    : []

  const highlights = service.highlights || service.includes || []

  useScrollAnimation(
    cardRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <div
      ref={cardRef}
      className="opacity-0 bg-white rounded-2xl overflow-hidden border border-gray-100
                 shadow-sm"
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={service.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <span className="text-5xl">{categoryIcon || "📦"}</span>
            </div>
          )}
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
          <span className="text-gray-400 tracking-wider uppercase" style={{ fontSize: "10px" }}>
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
              className="flex items-center justify-between w-full py-3 border-t border-gray-100"
            >
              <span className="text-gray-500" style={{ fontSize: "13px" }}>
                {activeVariants.length} pricing option
                {activeVariants.length > 1 ? "s" : ""}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={1.5}
                className={`text-gray-400 transition-transform duration-300 ${
                  showVariants ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid gap-2 overflow-hidden transition-all duration-300 ease-out ${
                showVariants
                  ? "grid-rows-[1fr] opacity-100 mt-2"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden space-y-2">
                {activeVariants.map((variant) => (
                  <ServiceVariant key={variant._id} variant={variant} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <a
          href={`/bookings?service=${service._id}`}
          className="group flex items-center justify-center gap-2 h-12
                     bg-black text-white rounded-xl no-underline w-full
                     active:scale-[0.98] transition-all duration-300"
        >
          <span
            className="tracking-wider uppercase"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Book Now
          </span>
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform duration-300"
          />
        </a>
      </div>
    </div>
  )
})

// ── Desktop Service Section ────────────────────────────────
const DesktopServiceSection = memo(function DesktopServiceSection({
  service,
  index,
}) {
  const sectionRef = useRef(null)
  const isEven = index % 2 === 0

  const image =
    getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0])
  const categoryName = service.category?.name || ""
  const categoryIcon = service.category?.icon || ""

  const activeVariants = service.variants
    ? service.variants.filter((v) => v.isActive !== false)
    : []

  const highlights = service.highlights || service.includes || []

  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      const imageEl = sectionRef.current.querySelector("[data-image]")
      const contentEl = sectionRef.current.querySelector("[data-content]")

      gsap.fromTo(
        imageEl,
        { opacity: 0, x: isEven ? -40 : 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )

      gsap.fromTo(
        contentEl,
        { opacity: 0, x: isEven ? 40 : -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )
    },
    [isEven]
  )

  return (
    <div
      ref={sectionRef}
      id={service._id}
      className="py-16 lg:py-24 border-b border-gray-100 last:border-0"
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
          isEven ? "" : "direction-rtl"
        }`}
        style={{ direction: isEven ? "ltr" : "rtl" }}
      >
        {/* Image */}
        <div data-image className="opacity-0" style={{ direction: "ltr" }}>
          <div className="relative rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100">
              {image ? (
                <img
                  src={image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-700
                             hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl">{categoryIcon || "📦"}</span>
                </div>
              )}
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
        </div>

        {/* Content */}
        <div data-content className="opacity-0" style={{ direction: "ltr" }}>
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
          <a
            href={`/bookings?service=${service._id}`}
            className="group inline-flex items-center gap-3 h-13 px-8
                       bg-black text-white rounded-full no-underline
                       hover:bg-gray-800 active:scale-[0.97]
                       transition-all duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              Book {service.name}
            </span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>
        </div>
      </div>
    </div>
  )
})

// ── Hero Section ───────────────────────────────────────────
const Hero = memo(function Hero({
  activeCategoryData,
  categories,
  activeCategory,
  onCategoryChange,
  loading,
}) {
  const heroRef = useRef(null)

  useEffect(() => {
    if (loading) return

    let ctx

    const init = async () => {
      const { default: gsap } = await import("gsap")

      if (!heroRef.current) return

      ctx = gsap.context(() => {
        const elements = heroRef.current.querySelectorAll("[data-animate]")

        gsap.fromTo(
          elements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.duration,
            stagger: ANIMATION_CONFIG.stagger,
            ease: ANIMATION_CONFIG.ease,
          }
        )
      })
    }

    init()

    return () => ctx?.revert()
  }, [loading, activeCategory])

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
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
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

      <div
        ref={heroRef}
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12"
      >
        {/* Eyebrow */}
        <div data-animate className="flex items-center gap-3 mb-5 opacity-0">
          <span className="w-10 h-px bg-white/30" aria-hidden="true" />
          <span
            className="tracking-[0.35em] uppercase text-white/50"
            style={{ fontSize: "10px" }}
          >
            {activeCategoryData ? "Category" : "What We Offer"}
          </span>
        </div>

        {/* Title */}
        <h1
          data-animate
          className="opacity-0 text-white mb-4"
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
        </h1>

        {/* Subtitle */}
        <p
          data-animate
          className="opacity-0 text-white/40 max-w-md mb-8 leading-relaxed"
          style={{ fontSize: "15px" }}
        >
          {pageSubtitle}
        </p>

        {/* Category filter */}
        <div data-animate className="opacity-0">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>
    </section>
  )
})

// ── Bottom CTA Section ─────────────────────────────────────
const BottomCTA = memo(function BottomCTA() {
  const sectionRef = useRef(null)

  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <section className="w-full bg-black py-16 md:py-24">
      <div
        ref={sectionRef}
        className="opacity-0 max-w-6xl mx-auto px-5 sm:px-8 md:px-12"
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
            <a
              href="/bookings"
              className="group inline-flex items-center justify-center gap-3 h-13 px-8
                         bg-white text-black rounded-full no-underline
                         hover:bg-gray-100 active:scale-[0.97]
                         transition-all duration-300"
            >
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Book Now
              </span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </a>

            <a
              href="tel:6900706456"
              className="inline-flex items-center justify-center gap-3 h-13 px-8
                         border border-white/20 text-white rounded-full no-underline
                         hover:bg-white/5 active:scale-[0.97]
                         transition-all duration-300"
            >
              <Phone size={16} strokeWidth={1.5} />
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "11px" }}
              >
                6900706456
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function ServicesContent() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("category")

  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(categoryId || null)
  const [activeCategoryData, setActiveCategoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(false)

      try {
        const [servicesData, categoriesData] = await Promise.all([
          getPublicServices(activeCategory ? { category: activeCategory } : {}),
          getCategories(),
        ])

        setServices(servicesData || [])
        setCategories(categoriesData || [])

        if (activeCategory && categoriesData) {
          const found = categoriesData.find((c) => c._id === activeCategory)
          setActiveCategoryData(found || null)
        } else {
          setActiveCategoryData(null)
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err.message)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeCategory])

  // Handle category change
  const handleCategoryChange = useCallback((catId) => {
    setActiveCategory(catId)
    if (catId) {
      window.history.pushState({}, "", `/services?category=${catId}`)
    } else {
      window.history.pushState({}, "", "/services")
    }
  }, [])

  return (
    <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Hero */}
      <Hero
        activeCategoryData={activeCategoryData}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        loading={loading}
      />

      {/* Services List */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
          {loading ? (
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
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32">
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

              <button
                onClick={() => window.location.reload()}
                className="group inline-flex items-center gap-2 h-12 px-6
                           bg-black text-white rounded-full
                           hover:bg-gray-800 active:scale-[0.97]
                           transition-all duration-300"
              >
                <span
                  className="tracking-wider uppercase"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  Try Again
                </span>
              </button>
            </div>
          ) : services.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Mobile: Card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 md:hidden">
                {services.map((service, i) => (
                  <MobileServiceCard
                    key={service._id}
                    service={service}
                    index={i}
                  />
                ))}
              </div>

              {/* Desktop: Alternating sections */}
              <div className="hidden md:block">
                {services.map((service, i) => (
                  <DesktopServiceSection
                    key={service._id}
                    service={service}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      {!loading && !error && services.length > 0 && <BottomCTA />}
    </main>
  )
}
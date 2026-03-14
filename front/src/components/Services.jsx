"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { ArrowUpRight, ArrowRight, Shield, Clock, Sparkles } from "lucide-react"
import { getCategories } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Shield, label: "Satisfaction", desc: "Guaranteed" },
  { icon: Clock, label: "Same-Day", desc: "Service" },
  { icon: Sparkles, label: "Eco-Friendly", desc: "Products" },
]

const ANIMATION_CONFIG = {
  card: {
    duration: 0.9,
    stagger: 0.08,
    ease: "power4.out",
  },
  header: {
    duration: 0.8,
    ease: "power3.out",
  },
  trust: {
    duration: 0.6,
    stagger: 0.1,
    ease: "power3.out",
  },
}

// ── Utils ──────────────────────────────────────────────────
function getMobileVariant(index, total) {
  if (index === 0) return "large"
  if (index === 3 && total > 4) return "tall"
  if (index === 4 && total > 5) return "wide"
  return "default"
}

function getVariantClasses(variant) {
  switch (variant) {
    case "large":
      return "col-span-2 row-span-2"
    case "tall":
      return "row-span-2"
    case "wide":
      return "col-span-2"
    default:
      return ""
  }
}

// ── Shared Hook: GSAP ScrollTrigger Animation ──────────────
function useScrollAnimation(ref, config, deps = []) {
  useEffect(() => {
    if (!ref.current) return

    let ctx
    let observer

    const init = async () => {
      // Use IntersectionObserver for initial visibility check
      // This prevents GSAP from running on elements far outside viewport
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
        { rootMargin: "100px" }
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

const ArrowButton = memo(function ArrowButton({
  size = "sm",
  animated = false,
}) {
  const dimensions = size === "lg" ? "w-11 h-11" : size === "md" ? "w-10 h-10" : "w-9 h-9"
  const iconSize = size === "lg" ? 16 : size === "md" ? 16 : 14

  return (
    <div
      className={`${dimensions} rounded-full bg-white/10 backdrop-blur-md
                  border border-white/10 flex items-center justify-center
                  ${animated
          ? "group-hover:bg-white group-hover:border-white transition-all duration-500"
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
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${animated
            ? "transition-transform duration-700 ease-out group-hover:scale-105"
            : ""
          }`}
        loading="lazy"
        decoding="async"
      />
    )
  }

  const iconSize = size === "lg" ? "text-7xl" : size === "md" ? "text-6xl" : "text-4xl"

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <span className={iconSize}>{icon || "🚗"}</span>
    </div>
  )
})

// ── Mobile Service Card ────────────────────────────────────

const MobileServiceCard = memo(function MobileServiceCard({
  category,
  index,
  variant = "default",
}) {
  const cardRef = useRef(null)
  const image = category.image?.url

  const isLarge = variant === "large"
  const isTall = variant === "tall"
  const isWide = variant === "wide"
  const isExpanded = isLarge || isTall || isWide

  useScrollAnimation(
    cardRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        cardRef.current,
        {
          y: 40,
          opacity: 0,
          scale: 0.97,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: ANIMATION_CONFIG.card.duration,
          ease: ANIMATION_CONFIG.card.ease,
          delay: index * ANIMATION_CONFIG.card.stagger,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 95%",
            once: true,
          },
        }
      )
    },
    [index]
  )

  return (
    <a
      ref={cardRef}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden rounded-2xl
                  active:scale-[0.98] transition-transform duration-200
                  no-underline opacity-0 will-change-transform
                  ${getVariantClasses(variant)}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gray-100">
        <CardImage
          src={image}
          alt={category.name}
          icon={category.icon}
          size={isLarge ? "lg" : "md"}
        />
      </div>

      {/* Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={`relative z-10 h-full flex flex-col justify-between
                    ${isLarge ? "p-5" : isTall ? "p-4" : "p-3.5"}`}
      >
        {/* Top */}
        <div className="flex items-start justify-between">
          <ServiceBadge count={category.totalServices} />
          <div className="ml-auto">
            <ArrowButton size={isExpanded ? "md" : "sm"} />
          </div>
        </div>

        {/* Bottom */}
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
    </a>
  )
})

// ── Desktop Service Card ───────────────────────────────────

const DesktopServiceCard = memo(function DesktopServiceCard({
  category,
  index,
  variant = "default",
}) {
  const cardRef = useRef(null)
  const image = category.image?.url
  const isFeatured = variant === "featured"

  useScrollAnimation(
    cardRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        cardRef.current,
        {
          y: 60,
          opacity: 0,
          scale: 0.96,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: ANIMATION_CONFIG.card.duration,
          ease: ANIMATION_CONFIG.card.ease,
          delay: index * ANIMATION_CONFIG.card.stagger,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 92%",
            once: true,
          },
        }
      )
    },
    [index]
  )

  return (
    <a
      ref={cardRef}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden rounded-3xl no-underline
                  opacity-0 will-change-transform
                  ${isFeatured ? "md:row-span-2" : ""}`}
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

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent
                   group-hover:from-black/85 transition-all duration-500"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 h-full min-h-[280px] flex flex-col justify-between p-6">
        {/* Top */}
        <div className="flex items-start justify-between">
          <ServiceBadge count={category.totalServices} size="lg" />
          <div className="ml-auto">
            <ArrowButton size="md" animated />
          </div>
        </div>

        {/* Bottom */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            {category.icon && (
              <span
                className={isFeatured ? "text-xl" : "text-base"}
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
                fontSize: isFeatured ? "26px" : "20px",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {category.name}
            </h3>
          </div>

          {category.description && (
            <p
              className="text-white/40 leading-relaxed line-clamp-2"
              style={{ fontSize: "13px" }}
            >
              {category.description}
            </p>
          )}
        </div>
      </div>
    </a>
  )
})

// ── Skeleton Loaders ───────────────────────────────────────

const SkeletonCard = memo(function SkeletonCard({ variant = "default", desktop = false }) {
  const baseClasses = "bg-gray-100 animate-pulse"

  if (desktop) {
    return (
      <div
        className={`${baseClasses} rounded-3xl
                    ${variant === "featured" ? "md:row-span-2 min-h-[580px]" : "min-h-[280px]"}`}
      />
    )
  }

  return (
    <div
      className={`${baseClasses} rounded-2xl ${getVariantClasses(variant)}`}
    />
  )
})

function LoadingGrid() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
        <SkeletonCard variant="large" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard variant="tall" />
        <SkeletonCard variant="wide" />
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 auto-rows-[280px]">
        <SkeletonCard variant="featured" desktop />
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} desktop />
        ))}
      </div>
    </>
  )
}

// ── Trust Bar ──────────────────────────────────────────────

const TrustItem = memo(function TrustItem({ icon: Icon, label, desc }) {
  return (
    <div
      className="opacity-0 flex flex-col items-center text-center p-3 sm:p-4
                 rounded-2xl bg-gray-50/80
                 sm:flex-row sm:items-center sm:text-left sm:gap-3
                 will-change-transform"
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
    </div>
  )
})

function TrustBar() {
  const ref = useRef(null)

  useScrollAnimation(
    ref,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        ref.current.children,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: ANIMATION_CONFIG.trust.duration,
          stagger: ANIMATION_CONFIG.trust.stagger,
          ease: ANIMATION_CONFIG.trust.ease,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 94%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 gap-2 sm:gap-5 mt-10 md:mt-20 pt-8 md:pt-12
                 border-t border-gray-100"
    >
      {TRUST_ITEMS.map((item, i) => (
        <TrustItem key={i} {...item} />
      ))}
    </div>
  )
}

// ── Empty / Error States ───────────────────────────────────

function EmptyState({ type = "empty", onRetry }) {
  const isError = type === "error"

  return (
    <div className="text-center py-16 md:py-24">
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
        <button
          onClick={onRetry}
          className="h-12 px-8 bg-black text-white rounded-full
                     tracking-wider uppercase hover:bg-gray-800
                     active:scale-[0.97] transition-all duration-300"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────

function SectionHeader({ eyebrowRef, headingRef, descRef }) {
  return (
    <header className="mb-8 md:mb-16">
      <div
        ref={eyebrowRef}
        className="flex items-center gap-4 mb-3 md:mb-5 opacity-0"
      >
        <span className="block w-8 h-px bg-black" aria-hidden="true" />
        <span
          className="tracking-[0.4em] uppercase text-gray-400"
          style={{ fontFamily: "Georgia, serif", fontSize: "10px" }}
        >
          Services
        </span>
      </div>

      <h2
        ref={headingRef}
        className="text-black mb-3 md:mb-4 opacity-0"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "clamp(28px, 6vw, 52px)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        What We Offer
      </h2>

      <p
        ref={descRef}
        className="text-gray-400 max-w-md leading-relaxed opacity-0"
        style={{ fontSize: "14px" }}
      >
        Professional cleaning solutions delivered to your doorstep.
      </p>
    </header>
  )
}

// ── View All Button ────────────────────────────────────────

function ViewAllButton() {
  const ref = useRef(null)

  useScrollAnimation(
    ref,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        ref.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 95%",
            once: true,
          },
        }
      )
    },
    []
  )

  return (
    <div ref={ref} className="flex justify-center mt-8 md:mt-14 opacity-0">
      <a
        href="/services"
        className="group flex items-center justify-center gap-3
                   w-full sm:w-auto h-14 px-8
                   bg-black text-white rounded-full
                   hover:bg-gray-800 active:scale-[0.98]
                   transition-all duration-300 no-underline"
      >
        <span
          className="tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          View All Services
        </span>
        <ArrowRight
          size={16}
          strokeWidth={1.5}
          className="group-hover:translate-x-0.5 transition-transform duration-300"
        />
      </a>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export default function Services() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const headerAnimated = useRef(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setError(true)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Header animation (runs once when content loads)
  useEffect(() => {
    if (loading || headerAnimated.current) return

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
            start: "top 88%",
            once: true,
          },
          defaults: { ease: ANIMATION_CONFIG.header.ease },
        })

        if (eyebrowRef.current) {
          tl.fromTo(
            eyebrowRef.current,
            { x: -25, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5 }
          )
        }

        tl.fromTo(
          headingRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: ANIMATION_CONFIG.header.duration },
          0.05
        )

        if (descRef.current) {
          tl.fromTo(
            descRef.current,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.2
          )
        }
      })

      headerAnimated.current = true
    }

    init()

    return () => ctx?.revert()
  }, [loading])

  return (
    <section
      className="w-full bg-white py-14 md:py-28"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-labelledby="services-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12">
        <SectionHeader
          eyebrowRef={eyebrowRef}
          headingRef={headingRef}
          descRef={descRef}
        />

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <EmptyState type="error" onRetry={fetchCategories} />
        ) : categories.length === 0 ? (
          <EmptyState type="empty" />
        ) : (
          <>
            {/* Mobile Grid */}
            <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
              {categories.map((category, i) => (
                <MobileServiceCard
                  key={category._id}
                  category={category}
                  index={i}
                  variant={getMobileVariant(i, categories.length)}
                />
              ))}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5 auto-rows-[280px]">
              {categories.map((category, i) => (
                <DesktopServiceCard
                  key={category._id}
                  category={category}
                  index={i}
                  variant={i === 0 ? "featured" : "default"}
                />
              ))}
            </div>

            <ViewAllButton />
            <TrustBar />
          </>
        )}
      </div>
    </section>
  )
}
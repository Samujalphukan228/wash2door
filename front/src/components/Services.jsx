// components/Services.jsx
"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, ArrowRight, Shield, Clock, Sparkles } from "lucide-react"
import { getCategories } from "@/lib/services.api"

/* ═══════════════════════════════════════
   MOBILE CARD - Bento Style with Variants
═══════════════════════════════════════ */
function MobileServiceCard({ category, index, variant = "default" }) {
  const cardRef = useRef(null)
  const image = category.image?.url

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!cardRef.current) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          cardRef.current,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            delay: index * 0.08,
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 92%",
            },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [index])

  // Different styles based on variant
  const isLarge = variant === "large"
  const isTall = variant === "tall"
  const isWide = variant === "wide"

  return (
    <a
      ref={cardRef}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden rounded-3xl
                 active:scale-[0.97] transition-all duration-300 no-underline opacity-0
                 ${isLarge ? "col-span-2 row-span-2" : ""}
                 ${isTall ? "row-span-2" : ""}
                 ${isWide ? "col-span-2" : ""}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={category.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className={`${isLarge || isTall ? "text-6xl" : "text-4xl"}`}>
              {category.icon || "🚗"}
            </span>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-between
                       ${isLarge ? "p-6" : isTall ? "p-5" : "p-4"}`}>
        {/* Top Row */}
        <div className="flex items-start justify-between">
          {category.totalServices > 0 && (
            <span
              className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full
                         border border-white/10"
            >
              <span
                className="text-white/80 tracking-wider uppercase"
                style={{ fontSize: "9px" }}
              >
                {category.totalServices}
              </span>
            </span>
          )}

          <div
            className={`rounded-full bg-white/15 backdrop-blur-md border border-white/10
                        flex items-center justify-center ml-auto
                        ${isLarge || isTall ? "w-11 h-11" : "w-9 h-9"}`}
          >
            <ArrowUpRight
              size={isLarge || isTall ? 16 : 14}
              className="text-white"
            />
          </div>
        </div>

        {/* Bottom Content */}
        <div>
          {category.icon && (
            <span className={`block mb-1.5 ${isLarge ? "text-2xl" : "text-lg"}`}>
              {category.icon}
            </span>
          )}

          <h3
            className="text-white mb-1"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: isLarge ? "24px" : isTall ? "20px" : "16px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {category.name}
          </h3>

          {(isLarge || isTall || isWide) && category.description && (
            <p
              className="text-white/50 line-clamp-2 leading-relaxed"
              style={{ fontSize: "12px" }}
            >
              {category.description}
            </p>
          )}
        </div>
      </div>
    </a>
  )
}

/* ═══════════════════════════════════════
   DESKTOP CARD - Bento style (unchanged)
═══════════════════════════════════════ */
function DesktopServiceCard({ category, index, variant = "default" }) {
  const cardRef = useRef(null)
  const image = category.image?.url
  const isFeatured = variant === "featured"

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!cardRef.current) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          cardRef.current,
          { y: 80, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            delay: index * 0.1,
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 90%",
            },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [index])

  return (
    <a
      ref={cardRef}
      href={`/services?category=${category._id}`}
      className={`group block relative overflow-hidden rounded-3xl no-underline
                  transition-transform duration-300 hover:scale-[1.02] opacity-0
                  ${isFeatured ? "md:row-span-2" : ""}`}
    >
      {/* Image */}
      <div className="absolute inset-0 bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700
                       group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200
                          flex items-center justify-center"
          >
            <span className={`${isFeatured ? "text-7xl" : "text-5xl"}`}>
              {category.icon || "🚗"}
            </span>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent
                      group-hover:from-black/90 transition-all duration-500"
      />

      {/* Content */}
      <div className="relative z-10 h-full min-h-[280px] flex flex-col justify-between p-6">
        {/* Top */}
        <div className="flex items-start justify-between">
          {category.totalServices > 0 && (
            <span
              className="inline-flex items-center h-7 px-3 rounded-full
                         bg-white/10 backdrop-blur-md border border-white/10
                         tracking-widest uppercase text-white/70"
              style={{ fontSize: "9px" }}
            >
              {category.totalServices} services
            </span>
          )}

          <div
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md
                        border border-white/10 flex items-center justify-center ml-auto
                        group-hover:bg-white group-hover:border-white
                        transition-all duration-500"
          >
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              className="text-white group-hover:text-black transition-colors duration-500
                         group-hover:rotate-45"
            />
          </div>
        </div>

        {/* Bottom */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            {category.icon && (
              <span className={isFeatured ? "text-xl" : "text-base"}>
                {category.icon}
              </span>
            )}
            <h3
              className="text-white"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: isFeatured ? "28px" : "20px",
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
}

/* ═══════════════════════════════════════
   SKELETON LOADERS
═══════════════════════════════════════ */
function MobileSkeleton({ variant = "default" }) {
  const isLarge = variant === "large"
  const isTall = variant === "tall"
  const isWide = variant === "wide"

  return (
    <div
      className={`bg-gray-100 rounded-3xl animate-pulse
                  ${isLarge ? "col-span-2 row-span-2" : ""}
                  ${isTall ? "row-span-2" : ""}
                  ${isWide ? "col-span-2" : ""}`}
    />
  )
}

function DesktopSkeleton({ featured }) {
  return (
    <div
      className={`bg-gray-100 rounded-3xl animate-pulse
                  ${featured ? "md:row-span-2 min-h-[580px]" : "min-h-[280px]"}`}
    />
  )
}

/* ═══════════════════════════════════════
   TRUST BADGES
═══════════════════════════════════════ */
const trustItems = [
  { icon: Shield, label: "Satisfaction", desc: "Guaranteed" },
  { icon: Clock, label: "Same-Day", desc: "Service" },
  { icon: Sparkles, label: "Eco-Friendly", desc: "Products" },
]

function TrustBar() {
  const ref = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!ref.current) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          ref.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 92%",
            },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 gap-2 sm:gap-6 mt-10 md:mt-20 pt-8 md:pt-12 border-t border-gray-100"
    >
      {trustItems.map((item, i) => {
        const Icon = item.icon
        return (
          <div
            key={i}
            className="opacity-0 flex flex-col items-center text-center p-3 sm:p-4
                       rounded-2xl bg-gray-50
                       sm:flex-row sm:items-center sm:text-left sm:gap-3"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white 
                         flex items-center justify-center shrink-0 mb-2 sm:mb-0"
            >
              <Icon size={18} strokeWidth={1.3} className="text-gray-400" />
            </div>
            <div>
              <p
                className="text-black text-xs sm:text-sm leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {item.label}
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs leading-tight">
                {item.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════
   HELPER: Get mobile layout variant
═══════════════════════════════════════ */
function getMobileVariant(index, total) {
  // Create interesting bento pattern
  // Pattern: large, small, small, tall, wide, small, small...
  
  if (index === 0) return "large" // First card is big (2x2)
  if (index === 3 && total > 4) return "tall" // 4th card is tall (1x2)
  if (index === 4 && total > 5) return "wide" // 5th card is wide (2x1)
  
  return "default"
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function Services() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)

  const fetchCategories = async () => {
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
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Header animations
  useEffect(() => {
    if (loading) return

    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      if (!headingRef.current) return

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
          defaults: { ease: "power3.out" },
        })

        if (eyebrowRef.current) {
          tl.fromTo(
            eyebrowRef.current,
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6 }
          )
        }

        tl.fromTo(
          headingRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          0.1
        )

        if (descRef.current) {
          tl.fromTo(
            descRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            0.3
          )
        }
      })
    }
    init()
    return () => ctx?.revert()
  }, [loading])

  return (
    <section
      className="w-full bg-white py-14 md:py-28"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12">
        {/* ═══ HEADER ═══ */}
        <div className="mb-8 md:mb-16">
          <div
            ref={eyebrowRef}
            className="flex items-center gap-4 mb-3 md:mb-6 opacity-0"
          >
            <span className="block w-8 h-px bg-black" />
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
              fontSize: "clamp(28px, 6vw, 56px)",
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
        </div>

        {/* ═══ CONTENT ═══ */}
        {loading ? (
          <>
            {/* Mobile Skeleton - Bento Grid */}
            <div className="md:hidden grid grid-cols-2 gap-3 auto-rows-[140px]">
              <MobileSkeleton variant="large" />
              <MobileSkeleton />
              <MobileSkeleton />
              <MobileSkeleton variant="tall" />
              <MobileSkeleton variant="wide" />
            </div>

            {/* Desktop Skeleton */}
            <div className="hidden md:grid md:grid-cols-3 gap-5 auto-rows-[280px]">
              <DesktopSkeleton featured />
              <DesktopSkeleton />
              <DesktopSkeleton />
              <DesktopSkeleton />
              <DesktopSkeleton />
            </div>
          </>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3
              className="text-black mb-2"
              style={{ fontFamily: "Georgia, serif", fontSize: "18px" }}
            >
              Something went wrong
            </h3>
            <p className="text-gray-400 mb-6" style={{ fontSize: "14px" }}>
              Unable to load services
            </p>
            <button
              onClick={fetchCategories}
              className="h-12 px-8 bg-black text-white rounded-full 
                         tracking-wider uppercase hover:bg-gray-800
                         active:scale-95 transition-all duration-300"
              style={{ fontSize: "11px" }}
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
              <span className="text-2xl">🧹</span>
            </div>
            <h3
              className="text-black mb-2"
              style={{ fontFamily: "Georgia, serif", fontSize: "18px" }}
            >
              No services yet
            </h3>
            <p className="text-gray-400" style={{ fontSize: "14px" }}>
              Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* ═══ MOBILE: Bento Grid Layout ═══ */}
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

            {/* ═══ DESKTOP: Bento Grid Layout ═══ */}
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

            {/* View All Button */}
            <div className="flex justify-center mt-8 md:mt-14">
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
                  style={{ fontSize: "11px" }}
                >
                  View All Services
                </span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust Badges */}
            <TrustBar />
          </>
        )}
      </div>
    </section>
  )
}
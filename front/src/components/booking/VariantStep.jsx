"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import { Loader2, ChevronLeft, Clock, Check } from "lucide-react"
import { getServicePricing } from "@/lib/booking.api"

// ── GSAP Loader ───────────────────────────────────────────
let cachedGsap = null

async function loadGsap() {
  if (!cachedGsap) {
    const { default: gsap } = await import("gsap")
    cachedGsap = gsap
  }
  return cachedGsap
}

function makeFallbackVisible(element) {
  if (!element) return
  element.style.opacity = "1"
  element.style.transform = "none"
}

// ── Variant Card ──────────────────────────────────────────
const VariantCard = memo(function VariantCard({
  variant,
  index,
  isSelected,
  onSelect,
}) {
  const cardRef = useRef(null)
  const hasDiscount =
    variant.discountPrice && variant.discountPrice < variant.price

  useEffect(() => {
    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted || !cardRef.current) return

        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.08,
            ease: "power3.out",
          }
        )
      } catch {
        if (mounted) makeFallbackVisible(cardRef.current)
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [index])

  return (
    <button
      ref={cardRef}
      onClick={() => onSelect(variant)}
      className={`opacity-0 group text-left border transition-all duration-300 overflow-hidden rounded-2xl
                 active:scale-[0.98]
                 ${
                   isSelected
                     ? "border-black ring-2 ring-black"
                     : "border-gray-200 hover:border-black"
                 }`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-gray-100">
        {variant.image ? (
          <img
            src={variant.image}
            alt={variant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-black rounded-full flex items-center justify-center">
            <Check size={14} className="text-white" strokeWidth={2} />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-lg">
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "9px", fontWeight: 500 }}
            >
              Save ₹{variant.price - variant.discountPrice}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-black truncate"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontSize: "15px",
              }}
            >
              {variant.name}
            </h3>
            {variant.description && (
              <p
                className="text-gray-400 mt-1 line-clamp-2"
                style={{ fontSize: "10px", letterSpacing: "0.05em" }}
              >
                {variant.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p
              className="text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "22px",
              }}
            >
              ₹{hasDiscount ? variant.discountPrice : variant.price}
            </p>
            {hasDiscount && (
              <p
                className="text-gray-400 line-through"
                style={{ fontSize: "12px" }}
              >
                ₹{variant.price}
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div
          className="flex items-center gap-2 text-gray-500 mb-4"
          style={{ fontSize: "11px" }}
        >
          <Clock size={12} strokeWidth={1.5} />
          <span>{variant.duration} minutes</span>
        </div>

        {/* Features */}
        {variant.features && variant.features.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <ul className="space-y-1.5">
              {variant.features.slice(0, 3).map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-gray-500"
                  style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                >
                  <Check
                    size={10}
                    className="text-emerald-500 shrink-0"
                    strokeWidth={2}
                  />
                  {feature}
                </li>
              ))}
              {variant.features.length > 3 && (
                <li
                  className="text-gray-400"
                  style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  +{variant.features.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </button>
  )
})

// ── Main Component ────────────────────────────────────────
const VariantStep = memo(function VariantStep({
  data,
  onUpdate,
  onUpdateUI,
  onNext,
  onBack,
}) {
  const headerRef = useRef(null)
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (data.serviceId) {
      fetchPricing()
    }
  }, [data.serviceId])

  // Header animation
  useEffect(() => {
    if (loading) return

    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted || !headerRef.current) return

        const elements = headerRef.current.querySelectorAll("[data-animate]")
        gsap.fromTo(
          elements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          }
        )
      } catch {
        if (mounted && headerRef.current) {
          const elements = headerRef.current.querySelectorAll("[data-animate]")
          elements.forEach((el) => makeFallbackVisible(el))
        }
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [loading])

  const fetchPricing = async () => {
    try {
      setLoading(true)
      setError("")
      const result = await getServicePricing(data.serviceId)
      setPricing(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = useCallback(
    (variant) => {
      onUpdate({ variantId: variant._id })
      onUpdateUI({
        variantName: variant.name,
        price: variant.discountPrice || variant.price,
        duration: variant.duration,
      })
      onNext()
    },
    [onUpdate, onUpdateUI, onNext]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p
          className="text-red-500 tracking-wider uppercase mb-4"
          style={{ fontSize: "11px" }}
        >
          {error}
        </p>
        <button
          onClick={fetchPricing}
          className="h-10 px-6 border border-black text-black rounded-full
                     hover:bg-black hover:text-white
                     transition-colors duration-300"
          style={{ fontSize: "10px", letterSpacing: "0.2em" }}
        >
          TRY AGAIN
        </button>
      </div>
    )
  }

  const variants = pricing?.variants || []

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-black
                   transition-colors duration-300 mb-8"
        style={{ fontSize: "10px", letterSpacing: "0.2em" }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        <span className="uppercase">Back to Services</span>
      </button>

      {/* Header */}
      <div ref={headerRef} className="text-center mb-10">
        <p
          data-animate
          className="opacity-0 text-gray-400 tracking-wider uppercase mb-2"
          style={{ fontSize: "9px", letterSpacing: "0.3em" }}
        >
          {pricing?.serviceName}
        </p>
        <h2
          data-animate
          className="opacity-0 text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(24px, 4vw, 32px)",
          }}
        >
          Select Option
        </h2>
        <p
          data-animate
          className="opacity-0 text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Choose the option that suits your needs
        </p>
      </div>

      {/* Variants Grid */}
      {variants.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="text-gray-400 tracking-wider uppercase"
            style={{ fontSize: "11px" }}
          >
            No options available for this service
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map((variant, index) => (
            <VariantCard
              key={variant._id}
              variant={variant}
              index={index}
              isSelected={data.variantId === variant._id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default VariantStep
"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import { Loader2, Star, ChevronRight, Check } from "lucide-react"
import { getServices } from "@/lib/booking.api"

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

const TIER_LABELS = {
  basic: "Essential",
  standard: "Standard",
  premium: "Premium",
}

const TIER_COLORS = {
  basic: "bg-gray-100 text-gray-600",
  standard: "bg-blue-50 text-blue-600",
  premium: "bg-amber-50 text-amber-700",
}

// ── Service Card ──────────────────────────────────────────
const ServiceCard = memo(function ServiceCard({
  service,
  index,
  isSelected,
  onSelect,
}) {
  const cardRef = useRef(null)
  const image = service.primaryImage || service.images?.[0]?.url

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
      onClick={() => onSelect(service)}
      className={`opacity-0 group text-left border transition-all duration-300 overflow-hidden rounded-2xl
                 active:scale-[0.98]
                 ${
                   isSelected
                     ? "border-black ring-2 ring-black"
                     : "border-gray-200 hover:border-black"
                 }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Tier Badge */}
        {service.tier && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 tracking-wider uppercase rounded-lg ${TIER_COLORS[service.tier]}`}
              style={{ fontSize: "9px", fontWeight: 500 }}
            >
              {TIER_LABELS[service.tier]}
            </span>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-black rounded-full flex items-center justify-center">
            <Check size={14} className="text-white" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: "16px",
          }}
        >
          {service.name}
        </h3>

        <p
          className="text-gray-400 tracking-wider uppercase mb-4 line-clamp-2"
          style={{ fontSize: "10px" }}
        >
          {service.shortDescription}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p
              className="text-gray-400 tracking-wider uppercase"
              style={{ fontSize: "9px" }}
            >
              Starting from
            </p>
            <p
              className="text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "20px",
              }}
            >
              ₹{service.startingPrice?.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {service.averageRating > 0 && (
              <div
                className="flex items-center gap-1 text-gray-500"
                style={{ fontSize: "11px" }}
              >
                <Star size={12} fill="currentColor" />
                {service.averageRating.toFixed(1)}
              </div>
            )}
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${
                isSelected ? "translate-x-1" : "group-hover:translate-x-1"
              }`}
            />
          </div>
        </div>
      </div>
    </button>
  )
})

// ── Main Component ────────────────────────────────────────
const ServiceStep = memo(function ServiceStep({
  data,
  onUpdate,
  onUpdateUI,
  onNext,
}) {
  const headerRef = useRef(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTier, setSelectedTier] = useState("all")

  useEffect(() => {
    fetchServices()
  }, [])

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

  const fetchServices = async () => {
    try {
      setLoading(true)
      const result = await getServices()
      setServices(result || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = useCallback(
    (service) => {
      onUpdate({ serviceId: service._id })
      onUpdateUI({
        serviceName: service.name,
        serviceImage: service.primaryImage || service.images?.[0]?.url,
        serviceTier: service.tier,
        categoryName: service.category?.name || "",
      })
      onNext()
    },
    [onUpdate, onUpdateUI, onNext]
  )

  const filteredServices =
    selectedTier === "all"
      ? services
      : services.filter((s) => s.tier === selectedTier)

  const tiers = ["all", "basic", "standard", "premium"]

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
          onClick={fetchServices}
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

  return (
    <div>
      {/* Header */}
      <div ref={headerRef} className="text-center mb-10">
        <h2
          data-animate
          className="opacity-0 text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(24px, 4vw, 32px)",
          }}
        >
          Choose Your Service
        </h2>
        <p
          data-animate
          className="opacity-0 text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Select the service that best fits your needs
        </p>
      </div>

      {/* Tier Filter */}
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`h-10 px-5 tracking-wider uppercase rounded-full
                       transition-all duration-300 active:scale-[0.97]
                       ${
                         selectedTier === tier
                           ? "bg-black text-white"
                           : "border border-gray-200 text-gray-500 hover:border-black hover:text-black"
                       }`}
            style={{ fontSize: "9px", fontWeight: 500 }}
          >
            {tier === "all" ? "All Services" : TIER_LABELS[tier]}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="text-gray-400 tracking-wider uppercase"
            style={{ fontSize: "11px" }}
          >
            No services found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service._id}
              service={service}
              index={index}
              isSelected={data.serviceId === service._id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default ServiceStep
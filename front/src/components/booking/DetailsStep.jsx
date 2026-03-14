"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import { ChevronLeft, ChevronRight, MapPin, Info } from "lucide-react"

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

const DetailsStep = memo(function DetailsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}) {
  const containerRef = useRef(null)
  const [errors, setErrors] = useState({})

  // Initial animation
  useEffect(() => {
    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted || !containerRef.current) return

        const elements = containerRef.current.querySelectorAll("[data-animate]")
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
        if (mounted && containerRef.current) {
          const elements = containerRef.current.querySelectorAll("[data-animate]")
          elements.forEach((el) => makeFallbackVisible(el))
        }
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [])

  const handleChange = useCallback(
    (field, value) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        onUpdate({
          [parent]: {
            ...data[parent],
            [child]: value,
          },
        })
      } else {
        onUpdate({ [field]: value })
      }

      setErrors((prev) => ({ ...prev, [field]: "" }))
    },
    [data, onUpdate]
  )

  const validate = () => {
    const newErrors = {}

    if (!data.location?.address?.trim()) {
      newErrors["location.address"] = "Address is required"
    }
    if (!data.location?.city?.trim()) {
      newErrors["location.city"] = "City is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const getInputClass = (fieldName) => `
    w-full h-12 px-4 border rounded-xl text-black bg-white
    placeholder-gray-300 focus:outline-none focus:border-black
    transition-colors duration-300
    ${errors[fieldName] ? "border-red-300" : "border-gray-200"}
  `

  return (
    <div ref={containerRef}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-black
                   transition-colors duration-300 mb-8"
        style={{ fontSize: "10px", letterSpacing: "0.2em" }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        <span className="uppercase">Back to Date & Time</span>
      </button>

      {/* Header */}
      <div data-animate className="opacity-0 text-center mb-10">
        <h2
          className="text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(24px, 4vw, 32px)",
          }}
        >
          Service Location
        </h2>
        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Tell us where to provide the service
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Location Section */}
        <div
          data-animate
          className="opacity-0 border border-gray-200 p-6 rounded-2xl mb-6"
        >
          <h3
            className="text-black mb-6 flex items-center gap-2"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            <MapPin size={16} strokeWidth={1.5} />
            Address Details
          </h3>

          <div className="space-y-5">
            {/* Address */}
            <div>
              <label
                className="block text-gray-400 tracking-wider uppercase mb-2"
                style={{ fontSize: "9px", letterSpacing: "0.3em" }}
              >
                Street Address *
              </label>
              <input
                type="text"
                value={data.location?.address || ""}
                onChange={(e) =>
                  handleChange("location.address", e.target.value)
                }
                placeholder="123 Main Street, Apartment 4B"
                className={getInputClass("location.address")}
                style={{ fontSize: "13px" }}
              />
              {errors["location.address"] && (
                <p className="text-red-500 mt-1" style={{ fontSize: "10px" }}>
                  {errors["location.address"]}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                className="block text-gray-400 tracking-wider uppercase mb-2"
                style={{ fontSize: "9px", letterSpacing: "0.3em" }}
              >
                City *
              </label>
              <input
                type="text"
                value={data.location?.city || ""}
                onChange={(e) => handleChange("location.city", e.target.value)}
                placeholder="Mumbai"
                className={getInputClass("location.city")}
                style={{ fontSize: "13px" }}
              />
              {errors["location.city"] && (
                <p className="text-red-500 mt-1" style={{ fontSize: "10px" }}>
                  {errors["location.city"]}
                </p>
              )}
            </div>

            {/* Landmark */}
            <div>
              <label
                className="block text-gray-400 tracking-wider uppercase mb-2"
                style={{ fontSize: "9px", letterSpacing: "0.3em" }}
              >
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={data.location?.landmark || ""}
                onChange={(e) =>
                  handleChange("location.landmark", e.target.value)
                }
                placeholder="Near City Mall, opposite XYZ Bank"
                className="w-full h-12 px-4 border border-gray-200 rounded-xl
                           text-black bg-white placeholder-gray-300
                           focus:outline-none focus:border-black
                           transition-colors duration-300"
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>
        </div>

        {/* Special Notes */}
        <div
          data-animate
          className="opacity-0 border border-gray-200 p-6 rounded-2xl"
        >
          <h3
            className="text-black mb-4 flex items-center gap-2"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            <Info size={16} strokeWidth={1.5} />
            Special Instructions (Optional)
          </h3>
          <textarea
            value={data.specialNotes || ""}
            onChange={(e) => handleChange("specialNotes", e.target.value)}
            placeholder="Any specific instructions for our team..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl
                       text-black bg-white placeholder-gray-300
                       focus:outline-none focus:border-black
                       transition-colors duration-300 resize-none"
            style={{ fontSize: "13px" }}
          />
          <p
            className="text-gray-300 mt-2 text-right"
            style={{ fontSize: "10px" }}
          >
            {(data.specialNotes || "").length}/500
          </p>
        </div>

        {/* Next Button */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleNext}
            className="group inline-flex items-center gap-2 h-12 px-8
                       bg-black text-white rounded-full
                       hover:bg-gray-800 active:scale-[0.97]
                       transition-all duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              Review Booking
            </span>
            <ChevronRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    </div>
  )
})

export default DetailsStep
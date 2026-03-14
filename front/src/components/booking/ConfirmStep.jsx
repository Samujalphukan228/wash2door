"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { createBooking } from "@/lib/booking.api"

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

const ConfirmStep = memo(function ConfirmStep({ data, onBack, onSuccess }) {
  const router = useRouter()
  const containerRef = useRef(null)
  const successRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  // Initial animation
  useEffect(() => {
    if (success) return

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
            stagger: 0.08,
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
  }, [success])

  // Success animation
  useEffect(() => {
    if (!success || !successRef.current) return

    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted) return

        const elements = successRef.current.querySelectorAll("[data-success]")
        gsap.fromTo(
          elements,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          }
        )
      } catch {
        if (mounted && successRef.current) {
          const elements = successRef.current.querySelectorAll("[data-success]")
          elements.forEach((el) => makeFallbackVisible(el))
        }
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [success])

  const handleConfirm = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const bookingPayload = {
        serviceId: data.serviceId,
        variantId: data.variantId,
        bookingDate: data.bookingDate,
        timeSlot: data.timeSlot,
        location: {
          address: data.location.address,
          city: data.location.city,
          landmark: data.location.landmark || "",
        },
        specialNotes: data.specialNotes || "",
      }

      const result = await createBooking(bookingPayload)

      if (result && (result.bookingCode || result.bookingId || result._id)) {
        setBookingResult(result)
        setSuccess(true)

        if (onSuccess) {
          onSuccess(result)
        }
      } else if (result) {
        setBookingResult(result)
        setSuccess(true)
      } else {
        setError("Booking may have been created. Please check My Bookings.")
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to create booking"

      if (
        errorMessage.toLowerCase().includes("already booked") ||
        errorMessage.toLowerCase().includes("slot")
      ) {
        setError(errorMessage)
      } else if (errorMessage === "Failed to create booking") {
        setError(
          "Something went wrong. Please check My Bookings to verify if your booking was created."
        )
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [data, onSuccess])

  // ═══════════════════════════════════════
  // SUCCESS VIEW
  // ═══════════════════════════════════════
  if (success && bookingResult) {
    return (
      <div ref={successRef} className="text-center py-10">
        <div
          data-success
          className="opacity-0 w-20 h-20 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={40} className="text-emerald-600" />
        </div>

        <h2
          data-success
          className="opacity-0 text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(24px, 4vw, 32px)",
          }}
        >
          Booking Confirmed!
        </h2>

        <p
          data-success
          className="opacity-0 text-gray-400 tracking-wider uppercase mb-8"
          style={{ fontSize: "10px" }}
        >
          Your booking has been successfully placed
        </p>

        {/* Booking Code */}
        <div
          data-success
          className="opacity-0 inline-block bg-gray-50 border border-gray-100 px-8 py-5 mb-8 rounded-2xl"
        >
          <p
            className="text-gray-400 tracking-wider uppercase mb-1"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Booking Code
          </p>
          <p
            className="text-black tracking-wider"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: "28px",
            }}
          >
            {bookingResult.bookingCode || bookingResult.bookingId || "N/A"}
          </p>
        </div>

        {/* Booking Summary */}
        <div
          data-success
          className="opacity-0 max-w-md mx-auto border border-gray-200 p-6 text-left mb-8 rounded-2xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <span
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Service
              </span>
              <span className="text-black" style={{ fontSize: "13px" }}>
                {bookingResult.serviceName || data._ui?.serviceName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Option
              </span>
              <span className="text-black" style={{ fontSize: "13px" }}>
                {bookingResult.variantName || data._ui?.variantName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Date
              </span>
              <span className="text-black" style={{ fontSize: "13px" }}>
                {new Date(
                  bookingResult.bookingDate || data.bookingDate
                ).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Time
              </span>
              <span className="text-black" style={{ fontSize: "13px" }}>
                {bookingResult.timeSlot || data.timeSlot}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Location
              </span>
              <span
                className="text-black text-right max-w-[200px]"
                style={{ fontSize: "13px" }}
              >
                {bookingResult.location?.city || data.location?.city}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between">
              <span
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                Total
              </span>
              <span
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: "20px",
                }}
              >
                ₹{bookingResult.price || data._ui?.price || 0}
              </span>
            </div>
          </div>
        </div>

        <p
          data-success
          className="opacity-0 text-gray-400 mb-8"
          style={{ fontSize: "11px", letterSpacing: "0.05em" }}
        >
          A confirmation email has been sent to your registered email address.
        </p>

        {/* Actions */}
        <div
          data-success
          className="opacity-0 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push("/my-bookings")}
            className="h-12 px-8 border border-gray-200 text-black rounded-full
                       hover:border-black transition-colors duration-300"
            style={{ fontSize: "10px", letterSpacing: "0.2em" }}
          >
            VIEW MY BOOKINGS
          </button>
          <button
            onClick={() => router.push("/")}
            className="group inline-flex items-center justify-center gap-2 h-12 px-8
                       bg-black text-white rounded-full
                       hover:bg-gray-800 transition-colors duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              Back to Home
            </span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════
  // CONFIRMATION VIEW
  // ═══════════════════════════════════════
  return (
    <div ref={containerRef}>
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-2 text-gray-400 hover:text-black
                   transition-colors duration-300 mb-8 disabled:opacity-50"
        style={{ fontSize: "10px", letterSpacing: "0.2em" }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        <span className="uppercase">Back to Location</span>
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
          Review Your Booking
        </h2>
        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Please confirm all details before placing your booking
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          data-animate
          className="opacity-0 max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 
                     flex items-start gap-3 rounded-xl"
        >
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-600" style={{ fontSize: "12px" }}>
              {error}
            </p>
            <button
              onClick={() => router.push("/my-bookings")}
              className="text-red-700 underline mt-2"
              style={{ fontSize: "11px" }}
            >
              Check My Bookings →
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Service Summary */}
        <div
          data-animate
          className="opacity-0 border border-gray-200 p-6 mb-6 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            {data._ui?.serviceImage && (
              <img
                src={data._ui.serviceImage}
                alt={data._ui?.serviceName}
                className="w-24 h-24 object-cover rounded-xl"
              />
            )}
            <div className="flex-1">
              {data._ui?.serviceTier && (
                <span
                  className="text-gray-400 tracking-wider uppercase"
                  style={{ fontSize: "9px", letterSpacing: "0.3em" }}
                >
                  {TIER_LABELS[data._ui.serviceTier] || data._ui.serviceTier}
                </span>
              )}
              <h3
                className="text-black mt-1"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: "18px",
                }}
              >
                {data._ui?.serviceName || "Service"}
              </h3>
              <p className="text-gray-500 mt-2" style={{ fontSize: "12px" }}>
                {data._ui?.variantName || "Option"} · {data._ui?.duration || 0}{" "}
                mins
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: "26px",
                }}
              >
                ₹{data._ui?.price || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Date & Time */}
          <div
            data-animate
            className="opacity-0 border border-gray-200 p-6 rounded-2xl"
          >
            <h4
              className="flex items-center gap-2 text-gray-400 tracking-wider uppercase mb-4"
              style={{ fontSize: "10px" }}
            >
              <Calendar size={14} strokeWidth={1.5} />
              Schedule
            </h4>
            <p
              className="text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "14px",
              }}
            >
              {data.bookingDate &&
                new Date(data.bookingDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            </p>
            <p
              className="text-black mt-1 flex items-center gap-2"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "14px",
              }}
            >
              <Clock size={14} strokeWidth={1.5} />
              {data.timeSlot || "Not selected"}
            </p>
          </div>

          {/* Location */}
          <div
            data-animate
            className="opacity-0 border border-gray-200 p-6 rounded-2xl"
          >
            <h4
              className="flex items-center gap-2 text-gray-400 tracking-wider uppercase mb-4"
              style={{ fontSize: "10px" }}
            >
              <MapPin size={14} strokeWidth={1.5} />
              Location
            </h4>
            <p
              className="text-black leading-relaxed"
              style={{ fontSize: "13px" }}
            >
              {data.location?.address || "No address"}
              {data.location?.landmark && (
                <span className="text-gray-500">
                  {" "}
                  (Near {data.location.landmark})
                </span>
              )}
            </p>
            <p className="text-black" style={{ fontSize: "13px" }}>
              {data.location?.city || "No city"}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div
          data-animate
          className="opacity-0 border border-gray-200 p-6 mb-6 rounded-2xl"
        >
          <h4
            className="flex items-center gap-2 text-gray-400 tracking-wider uppercase mb-4"
            style={{ fontSize: "10px" }}
          >
            <CreditCard size={14} strokeWidth={1.5} />
            Payment
          </h4>
          <p className="text-black" style={{ fontSize: "13px" }}>
            Cash on Service
          </p>
          <p className="text-gray-500" style={{ fontSize: "12px" }}>
            Pay after the service is completed
          </p>
        </div>

        {/* Special Notes */}
        {data.specialNotes && (
          <div
            data-animate
            className="opacity-0 border border-gray-200 p-6 mb-6 rounded-2xl"
          >
            <h4
              className="text-gray-400 tracking-wider uppercase mb-3"
              style={{ fontSize: "10px" }}
            >
              Special Instructions
            </h4>
            <p className="text-gray-600" style={{ fontSize: "13px" }}>
              {data.specialNotes}
            </p>
          </div>
        )}

        {/* Price Summary */}
        <div
          data-animate
          className="opacity-0 border-2 border-black p-6 mb-8 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-gray-400 tracking-wider uppercase"
                style={{ fontSize: "9px", letterSpacing: "0.3em" }}
              >
                Total Amount
              </p>
              <p className="text-gray-500 mt-1" style={{ fontSize: "11px" }}>
                Including all taxes
              </p>
            </div>
            <p
              className="text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "34px",
              }}
            >
              ₹{data._ui?.price || 0}
            </p>
          </div>
        </div>

        {/* Terms */}
        <p
          data-animate
          className="opacity-0 text-gray-400 text-center mb-8"
          style={{ fontSize: "10px", letterSpacing: "0.05em" }}
        >
          By confirming this booking, you agree to our Terms of Service and
          Cancellation Policy. Cancellations are free up to 2 hours before the
          scheduled time.
        </p>

        {/* Actions */}
        <div
          data-animate
          className="opacity-0 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onBack}
            disabled={loading}
            className="h-12 px-8 border border-gray-200 text-black rounded-full
                       hover:border-black transition-colors duration-300
                       disabled:opacity-50"
            style={{ fontSize: "10px", letterSpacing: "0.2em" }}
          >
            EDIT DETAILS
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 h-12 px-10
                       bg-black text-white rounded-full min-w-[200px]
                       hover:bg-gray-800 active:scale-[0.97]
                       disabled:opacity-70 transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span
                  className="tracking-wider uppercase"
                  style={{ fontSize: "10px", fontWeight: 500 }}
                >
                  Processing...
                </span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span
                  className="tracking-wider uppercase"
                  style={{ fontSize: "10px", fontWeight: 500 }}
                >
                  Confirm Booking
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

export default ConfirmStep
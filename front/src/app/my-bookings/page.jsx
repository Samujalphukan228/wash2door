"use client"

import { useState, useEffect, useRef, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Star,
  X,
  Phone,
  ArrowRight,
  Timer,
  Sparkles,
} from "lucide-react"
import { getUserBookings, cancelBooking } from "@/lib/booking.api"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    dot: "bg-yellow-400",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-blue-400",
    icon: CheckCircle,
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-purple-400",
    icon: RotateCcw,
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    icon: XCircle,
  },
}

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

// ── GSAP Loader (cached) ──────────────────────────────────
let cachedGsap = null

async function loadGsap() {
  if (!cachedGsap) {
    const { default: gsap } = await import("gsap")
    cachedGsap = gsap
  }
  return cachedGsap
}

// ── Scrollbar Hide Styles ─────────────────────────────────
const SCROLLBAR_HIDE_CLASS = "bookings-hide-scrollbar"
let scrollbarStyleInjected = false

function injectScrollbarStyles() {
  if (scrollbarStyleInjected || typeof document === "undefined") return
  const style = document.createElement("style")
  style.textContent = `.${SCROLLBAR_HIDE_CLASS}::-webkit-scrollbar { display: none; }`
  document.head.appendChild(style)
  scrollbarStyleInjected = true
}

// ── Scroll Lock Hook ──────────────────────────────────────
function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.overflow = "hidden"
    document.body.style.width = "100%"

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

// ── Visibility helper ─────────────────────────────────────
function makeFallbackVisible(element) {
  if (!element) return
  element.style.opacity = "1"
  element.style.transform = "none"
  element.classList.remove("opacity-0")
}

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = memo(function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span
        className="text-gray-600 tracking-wider uppercase"
        style={{ fontSize: "9px", fontWeight: 500 }}
      >
        {cfg.label}
      </span>
    </span>
  )
})

// ── Info Pill ─────────────────────────────────────────────
const InfoPill = memo(function InfoPill({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-lg">
      <Icon size={13} strokeWidth={1.5} className="text-gray-400" />
      <span className="text-black" style={{ fontSize: "11px" }}>
        {children}
      </span>
    </div>
  )
})

// ── Format Date Helper ────────────────────────────────────
function formatDate(date) {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

// ── Booking Card ──────────────────────────────────────────
const BookingCard = memo(function BookingCard({
  booking,
  index,
  onViewDetails,
  onCancel,
}) {
  const cardRef = useRef(null)
  const bookingDate = new Date(booking.bookingDate)
  const isUpcoming =
    bookingDate > new Date() &&
    !["cancelled", "completed"].includes(booking.status)
  const canBeCancelled =
    ["pending", "confirmed"].includes(booking.status) && isUpcoming

  // Animate on mount
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
    <div
      ref={cardRef}
      className="opacity-0 group relative bg-white border border-gray-200 rounded-2xl overflow-hidden
                 hover:border-black hover:shadow-lg
                 transition-all duration-300"
    >
      {/* Upcoming indicator */}
      {isUpcoming && booking.status !== "cancelled" && (
        <div className="absolute top-5 right-5 z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500" />
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <StatusBadge status={booking.status} />
          <span
            className="text-gray-300 font-mono uppercase"
            style={{ fontSize: "10px", letterSpacing: "0.1em" }}
          >
            {booking.bookingCode}
          </span>
        </div>

        {/* Service Info */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3
              className="text-black truncate mb-1"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontSize: "clamp(18px, 3vw, 22px)",
              }}
            >
              {booking.serviceName}
            </h3>
            <p
              className="text-gray-400 tracking-wider uppercase"
              style={{ fontSize: "10px" }}
            >
              {booking.vehicleTypeName}
            </p>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <p
              className="text-black leading-none"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(24px, 4vw, 32px)",
              }}
            >
              ₹{booking.price?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <InfoPill icon={Calendar}>{formatDate(bookingDate)}</InfoPill>
          <InfoPill icon={Clock}>{booking.timeSlot}</InfoPill>
          <InfoPill icon={Timer}>{booking.duration} min</InfoPill>
          {booking.location?.city && (
            <InfoPill icon={MapPin}>{booking.location.city}</InfoPill>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-5" />

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(booking)}
            className="group/btn inline-flex items-center gap-2 h-10 px-5
                       bg-black text-white rounded-full
                       hover:bg-gray-800 active:scale-[0.97]
                       transition-all duration-300"
          >
            <span
              className="tracking-wider uppercase"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              Details
            </span>
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="group-hover/btn:translate-x-0.5 transition-transform duration-300"
            />
          </button>

          {/* Completed Badge (instead of Review button) */}
          {booking.status === "completed" && (
            <span className="inline-flex items-center gap-2 h-10 px-5
                           border border-emerald-200 text-emerald-600 rounded-full">
              <CheckCircle size={13} strokeWidth={2} />
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Completed
              </span>
            </span>
          )}

          {/* Cancel Button */}
          {canBeCancelled && (
            <button
              onClick={() => onCancel(booking)}
              className="inline-flex items-center gap-2 h-10 px-5 ml-auto
                         text-red-500 hover:bg-red-50 rounded-full
                         active:scale-[0.97] transition-all duration-300"
            >
              <XCircle size={13} strokeWidth={2} />
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Cancel
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Modal Wrapper ─────────────────────────────────────────
const ModalWrapper = memo(function ModalWrapper({ isOpen, onClose, children }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return

    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted) return

        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.2 }
          )
        }

        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
          )
        }
      } catch {
        if (overlayRef.current) overlayRef.current.style.opacity = "1"
        if (contentRef.current) {
          contentRef.current.style.opacity = "1"
          contentRef.current.style.transform = "none"
        }
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={contentRef}
        className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl
                   max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
})

// ── Details Modal ─────────────────────────────────────────
const BookingDetailsModal = memo(function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}) {
  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge status={booking.status} />
            <h2
              className="text-black mt-4"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(22px, 4vw, 28px)",
              }}
            >
              {booking.serviceName}
            </h2>
            <p
              className="text-gray-400 tracking-wider uppercase mt-1"
              style={{ fontSize: "10px" }}
            >
              {booking.bookingCode}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center shrink-0
                       border border-gray-200 hover:border-black hover:bg-black hover:text-white
                       rounded-full transition-all duration-300"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-baseline gap-2">
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
              fontWeight: 300,
              fontSize: "32px",
            }}
          >
            ₹{booking.price?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5">
        {/* Schedule */}
        <div className="border border-gray-100 rounded-xl p-4">
          <p
            className="text-gray-400 tracking-wider uppercase mb-3"
            style={{ fontSize: "9px" }}
          >
            Schedule
          </p>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center">
              <Calendar size={18} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div>
              <p
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "14px",
                }}
              >
                {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p
                className="text-gray-500 mt-0.5 flex items-center gap-1.5"
                style={{ fontSize: "12px" }}
              >
                <Clock size={11} strokeWidth={2} />
                {booking.timeSlot} · {booking.duration} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border border-gray-100 rounded-xl p-4">
          <p
            className="text-gray-400 tracking-wider uppercase mb-3"
            style={{ fontSize: "9px" }}
          >
            Location
          </p>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
              <MapPin size={18} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div>
              <p
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "14px",
                }}
              >
                {booking.location?.address || "Address not provided"}
              </p>
              {booking.location?.landmark && (
                <p className="text-gray-500 mt-0.5" style={{ fontSize: "12px" }}>
                  Near {booking.location.landmark}
                </p>
              )}
              <p className="text-gray-500" style={{ fontSize: "12px" }}>
                {[booking.location?.city, booking.location?.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        {(booking.vehicleDetails?.brand || booking.vehicleDetails?.type) && (
          <div className="border border-gray-100 rounded-xl p-4">
            <p
              className="text-gray-400 tracking-wider uppercase mb-3"
              style={{ fontSize: "9px" }}
            >
              Vehicle
            </p>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                <Car size={18} strokeWidth={1.5} className="text-gray-400" />
              </div>
              <div>
                <p
                  className="text-black"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "14px",
                  }}
                >
                  {booking.vehicleTypeName}
                </p>
                {booking.vehicleDetails?.brand && (
                  <p
                    className="text-gray-500 mt-0.5"
                    style={{ fontSize: "12px" }}
                  >
                    {booking.vehicleDetails.brand} {booking.vehicleDetails.model}
                  </p>
                )}
                <div
                  className="flex items-center gap-3 mt-1 text-gray-400"
                  style={{ fontSize: "11px" }}
                >
                  {booking.vehicleDetails?.color && (
                    <span>{booking.vehicleDetails.color}</span>
                  )}
                  {booking.vehicleDetails?.plateNumber && (
                    <span className="font-mono uppercase">
                      {booking.vehicleDetails.plateNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Notes */}
        {booking.specialNotes && (
          <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
            <p
              className="text-gray-500 tracking-wider uppercase mb-2"
              style={{ fontSize: "9px" }}
            >
              Special Instructions
            </p>
            <p
              className="text-gray-600 leading-relaxed"
              style={{ fontSize: "12px" }}
            >
              {booking.specialNotes}
            </p>
          </div>
        )}

        {/* Cancellation Info */}
        {booking.status === "cancelled" && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-4">
            <p
              className="text-red-500 tracking-wider uppercase mb-2"
              style={{ fontSize: "9px" }}
            >
              Cancellation Details
            </p>
            <p className="text-red-600" style={{ fontSize: "12px" }}>
              Cancelled by: {booking.cancelledBy || "User"}
            </p>
            {booking.cancellationReason && (
              <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div>
            <p className="text-black" style={{ fontSize: "12px" }}>
              {booking.paymentMethod === "cash"
                ? "Cash on Service"
                : booking.paymentMethod}
            </p>
            <p
              className={`mt-0.5 ${
                booking.paymentStatus === "completed"
                  ? "text-emerald-600"
                  : "text-yellow-600"
              }`}
              style={{ fontSize: "11px" }}
            >
              {booking.paymentStatus === "completed"
                ? "✓ Paid"
                : "○ Payment Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          style={{ fontSize: "11px", letterSpacing: "0.1em" }}
        >
          <Phone size={14} strokeWidth={1.5} />
          <span className="uppercase">Need Help?</span>
        </a>

        <button
          onClick={onClose}
          className="h-10 px-6 bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     transition-all duration-300"
        >
          <span
            className="tracking-wider uppercase"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Close
          </span>
        </button>
      </div>
    </ModalWrapper>
  )
})

// ── Cancel Modal ──────────────────────────────────────────
const CancelBookingModal = memo(function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("")

  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Icon */}
        <div className="w-14 h-14 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <AlertCircle size={24} className="text-red-500" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "22px",
          }}
        >
          Cancel Booking?
        </h2>

        {/* Booking Summary */}
        <div className="border border-gray-100 rounded-xl p-4 mb-6">
          <p
            className="text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "15px",
            }}
          >
            {booking.serviceName}
          </p>
          <p
            className="text-gray-400 tracking-wider uppercase mt-1"
            style={{ fontSize: "10px" }}
          >
            {formatDate(new Date(booking.bookingDate))} at {booking.timeSlot}
          </p>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px" }}
          >
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know why..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl
                       text-black placeholder-gray-300
                       focus:outline-none focus:border-black
                       transition-colors duration-300 resize-none"
            style={{ fontSize: "13px" }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 border border-gray-200 rounded-full
                       text-black tracking-wider uppercase
                       hover:border-black transition-colors duration-300
                       disabled:opacity-50"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Keep Booking
          </button>

          <button
            onClick={() => onConfirm(booking._id, reason)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-12
                       bg-red-600 text-white rounded-full
                       hover:bg-red-700 transition-colors duration-300
                       disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <XCircle size={14} strokeWidth={2} />
                <span
                  className="tracking-wider uppercase"
                  style={{ fontSize: "10px", fontWeight: 500 }}
                >
                  Cancel
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
})

// ── Empty State ───────────────────────────────────────────
const EmptyState = memo(function EmptyState({ hasFilters }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted || !containerRef.current) return

        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        )
      } catch {
        if (mounted) makeFallbackVisible(containerRef.current)
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="opacity-0 flex flex-col items-center justify-center py-20 md:py-32 text-center"
    >
      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        <Car size={32} strokeWidth={1} className="text-gray-300" />
      </div>

      <h3
        className="text-black mb-3"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "20px",
        }}
      >
        {hasFilters ? "No bookings found" : "No bookings yet"}
      </h3>

      <p
        className="text-gray-400 mb-8 max-w-xs leading-relaxed"
        style={{ fontSize: "14px" }}
      >
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Book your first service today"}
      </p>

      {!hasFilters && (
        <a
          href="/bookings"
          className="group inline-flex items-center gap-2 h-12 px-6
                     bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     transition-all duration-300"
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
      )}
    </div>
  )
})

// ── Hero Section ──────────────────────────────────────────
const HeroSection = memo(function HeroSection({ total }) {
  const heroRef = useRef(null)

  useEffect(() => {
    let mounted = true
    let fallbackTimer

    const animate = async () => {
      if (!heroRef.current) return

      fallbackTimer = setTimeout(() => {
        if (mounted && heroRef.current) {
          const elements = heroRef.current.querySelectorAll("[data-animate]")
          elements.forEach((el) => makeFallbackVisible(el))
        }
      }, 3000)

      try {
        const gsap = await loadGsap()
        if (!mounted || !heroRef.current) return
        clearTimeout(fallbackTimer)

        const elements = heroRef.current.querySelectorAll("[data-animate]")
        gsap.fromTo(
          elements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out",
          }
        )
      } catch {
        clearTimeout(fallbackTimer)
        if (mounted && heroRef.current) {
          const elements = heroRef.current.querySelectorAll("[data-animate]")
          elements.forEach((el) => makeFallbackVisible(el))
        }
      }
    }

    animate()

    return () => {
      mounted = false
      if (fallbackTimer) clearTimeout(fallbackTimer)
    }
  }, [])

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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            {/* Eyebrow */}
            <div data-animate className="flex items-center gap-3 mb-5 opacity-0">
              <span className="w-10 h-px bg-white/30" aria-hidden="true" />
              <span
                className="tracking-[0.35em] uppercase text-white/50"
                style={{ fontFamily: "Georgia, serif", fontSize: "10px" }}
              >
                Account
              </span>
            </div>

            {/* Title */}
            <h1
              data-animate
              className="opacity-0 text-white mb-3"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              My Bookings
            </h1>

            {/* Subtitle */}
            <p
              data-animate
              className="opacity-0 text-white/40"
              style={{ fontSize: "14px" }}
            >
              {total} booking{total !== 1 ? "s" : ""} total
            </p>
          </div>

          {/* Book New Button */}
          <div data-animate className="opacity-0 hidden sm:block">
            <a
              href="/bookings"
              className="group inline-flex items-center gap-2 h-12 px-6
                         bg-white text-black rounded-full
                         hover:bg-gray-100 active:scale-[0.97]
                         transition-all duration-300"
            >
              <Sparkles size={14} />
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Book New
              </span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
})

// ── Filter Bar ────────────────────────────────────────────
const FilterBar = memo(function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  useEffect(() => {
    injectScrollbarStyles()
  }, [])

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-11 pr-4 h-12 border border-gray-200 rounded-full
                         text-black placeholder-gray-300
                         focus:outline-none focus:border-black
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Filter Pills */}
          <div
            className={`flex gap-2 overflow-x-auto pb-1 sm:pb-0 ${SCROLLBAR_HIDE_CLASS}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`shrink-0 h-10 px-4 rounded-full
                           tracking-wider uppercase
                           transition-all duration-300
                           ${
                             statusFilter === opt.value
                               ? "bg-black text-white"
                               : "border border-gray-200 text-gray-500 hover:border-black hover:text-black"
                           }`}
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

// ── Pagination ────────────────────────────────────────────
const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-2 h-10 px-5
                   border border-gray-200 rounded-full
                   text-black tracking-wider uppercase
                   hover:border-black disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors duration-300"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        <ChevronLeft size={14} />
        Prev
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-full
                       transition-all duration-300
                       ${
                         currentPage === p
                           ? "bg-black text-white"
                           : "border border-gray-200 text-black hover:border-black"
                       }`}
            style={{ fontSize: "12px" }}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-2 h-10 px-5
                   border border-gray-200 rounded-full
                   text-black tracking-wider uppercase
                   hover:border-black disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors duration-300"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  )
})

// ── Mobile CTA ────────────────────────────────────────────
const MobileCTA = memo(function MobileCTA() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 p-4 pb-safe">
      <a
        href="/bookings"
        className="flex items-center justify-center gap-2 w-full h-12
                   bg-black text-white rounded-full
                   active:scale-[0.98] transition-transform duration-200"
      >
        <Sparkles size={14} />
        <span
          className="tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Book New Service
        </span>
        <ArrowRight size={14} />
      </a>
    </div>
  )
})

// ── Main Component ────────────────────────────────────────
export default function MyBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, openModal } = useAuth()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      openModal("login")
      router.push("/")
    }
  }, [user, authLoading, openModal, router])

  // Fetch bookings
  useEffect(() => {
    if (!user) return

    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError("")
        const result = await getUserBookings(statusFilter, currentPage, 10)
        setBookings(result.bookings || [])
        setTotalPages(result.pages || 1)
        setTotal(result.total || 0)
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Fetch failed:", err.message)
        }
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, statusFilter, currentPage])

  const closeModals = useCallback(() => {
    setShowDetailsModal(false)
    setShowCancelModal(false)
    setSelectedBooking(null)
  }, [])

  const handleCancelConfirm = useCallback(
    async (bookingId, reason) => {
      try {
        setActionLoading(true)
        await cancelBooking(bookingId, reason)
        closeModals()
        // Refetch
        const result = await getUserBookings(statusFilter, currentPage, 10)
        setBookings(result.bookings || [])
        setTotalPages(result.pages || 1)
        setTotal(result.total || 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setActionLoading(false)
      }
    },
    [statusFilter, currentPage, closeModals]
  )

  const handleStatusChange = useCallback((value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }, [])

  // Filter bookings by search
  const filtered = bookings.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.bookingCode?.toLowerCase().includes(q) ||
      b.serviceName?.toLowerCase().includes(q) ||
      b.vehicleTypeName?.toLowerCase().includes(q)
    )
  })

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Hero */}
      <HeroSection total={total} />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />

      {/* Content */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-8 pb-28 sm:pb-12">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-xl">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-600" style={{ fontSize: "13px" }}>
                {error}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={!!(searchQuery || statusFilter)} />
          ) : (
            <>
              {/* Booking Cards */}
              <div className="space-y-4">
                {filtered.map((booking, i) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    index={i}
                    onViewDetails={(b) => {
                      setSelectedBooking(b)
                      setShowDetailsModal(true)
                    }}
                    onCancel={(b) => {
                      setSelectedBooking(b)
                      setShowCancelModal(true)
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </section>

      {/* Mobile CTA */}
      <MobileCTA />

      {/* Modals */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={closeModals}
      />

      <CancelBookingModal
        booking={selectedBooking}
        isOpen={showCancelModal}
        onClose={closeModals}
        onConfirm={handleCancelConfirm}
        loading={actionLoading}
      />
    </main>
  )
}
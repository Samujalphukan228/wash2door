// app/my-bookings/page.jsx
"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
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
  X,
  Phone,
  ArrowRight,
  Timer,
  Sparkles,
} from "lucide-react"
import { getUserBookings, cancelBooking } from "@/lib/booking.api"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-400" },
  confirmed: { label: "Confirmed", color: "bg-blue-400" },
  "in-progress": { label: "In Progress", color: "bg-purple-400" },
  completed: { label: "Completed", color: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "bg-red-400" },
}

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

// ── Scroll Lock ───────────────────────────────────────────
function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return
    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

// ── Format Date ───────────────────────────────────────────
function formatDate(date) {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

// ── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color}`} />
      <span className="text-gray-600 tracking-[0.1em] uppercase" style={{ fontSize: "8px", fontWeight: 500 }}>
        {cfg.label}
      </span>
    </span>
  )
}

// ── Info Chip ─────────────────────────────────────────────
function InfoChip({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 border border-gray-100 rounded">
      <Icon size={10} strokeWidth={1.5} className="text-gray-400 shrink-0" />
      <span className="text-black truncate" style={{ fontSize: "10px" }}>
        {children}
      </span>
    </div>
  )
}

// ── Booking Card ──────────────────────────────────────────
function BookingCard({ booking, onViewDetails, onCancel }) {
  const bookingDate = new Date(booking.bookingDate)
  const isUpcoming = bookingDate > new Date() && !["cancelled", "completed"].includes(booking.status)
  const canCancel = ["pending", "confirmed"].includes(booking.status) && isUpcoming

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden active:scale-[0.99] transition-transform">
      {/* Header */}
      <div className="relative bg-black px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              className="text-white truncate"
              style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "15px" }}
            >
              {booking.serviceName}
            </h3>
            <p className="text-white/40 mt-0.5" style={{ fontSize: "9px", letterSpacing: "0.08em" }}>
              {booking.bookingCode}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white" style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "18px" }}>
              ₹{booking.price?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {isUpcoming && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative rounded-full h-full w-full bg-emerald-500" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <StatusBadge status={booking.status} />
          <span className="text-gray-400 uppercase" style={{ fontSize: "9px", letterSpacing: "0.08em" }}>
            {booking.vehicleTypeName}
          </span>
        </div>

        {/* Info chips */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          <InfoChip icon={Calendar}>{formatDate(bookingDate)}</InfoChip>
          <InfoChip icon={Clock}>{booking.timeSlot}</InfoChip>
          <InfoChip icon={Timer}>{booking.duration}m</InfoChip>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100">
          <button
            onClick={() => onViewDetails(booking)}
            className="inline-flex items-center gap-1 h-8 px-3 bg-black text-white rounded-full"
          >
            <span className="tracking-[0.1em] uppercase" style={{ fontSize: "9px", fontWeight: 500 }}>
              Details
            </span>
            <ChevronRight size={11} />
          </button>

          {booking.status === "completed" && (
            <span className="inline-flex items-center gap-1 h-8 px-3 border border-emerald-200 text-emerald-600 rounded-full">
              <CheckCircle size={10} />
              <span className="tracking-[0.1em] uppercase" style={{ fontSize: "9px", fontWeight: 500 }}>
                Done
              </span>
            </span>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel(booking)}
              className="inline-flex items-center gap-1 h-8 px-3 ml-auto text-red-500 rounded-full active:bg-red-50"
            >
              <XCircle size={10} />
              <span className="tracking-[0.1em] uppercase" style={{ fontSize: "9px", fontWeight: 500 }}>
                Cancel
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────
function Modal({ isOpen, onClose, children }) {
  useScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full sm:max-w-md bg-white sm:rounded-xl rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}

// ── Details Modal ─────────────────────────────────────────
function DetailsModal({ booking, isOpen, onClose }) {
  if (!booking) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <StatusBadge status={booking.status} />
            <h2
              className="text-black mt-2.5"
              style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "18px" }}
            >
              {booking.serviceName}
            </h2>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px", letterSpacing: "0.08em" }}>
              {booking.bookingCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black rounded-full transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-gray-400 uppercase" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
            Total
          </span>
          <span className="text-black" style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "24px" }}>
            ₹{booking.price?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-2.5">
        {/* Schedule */}
        <div className="border border-gray-100 rounded-lg p-3">
          <p className="text-gray-400 uppercase mb-2" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
            Schedule
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-gray-400" />
            </div>
            <div>
              <p className="text-black" style={{ fontFamily: SERIF, fontSize: "12px" }}>
                {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-gray-500 flex items-center gap-1 mt-0.5" style={{ fontSize: "10px" }}>
                <Clock size={9} />
                {booking.timeSlot} · {booking.duration} min
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border border-gray-100 rounded-lg p-3">
          <p className="text-gray-400 uppercase mb-2" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
            Location
          </p>
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-black" style={{ fontFamily: SERIF, fontSize: "12px" }}>
                {booking.location?.address || "Not provided"}
              </p>
              {booking.location?.landmark && (
                <p className="text-gray-500 mt-0.5" style={{ fontSize: "10px" }}>
                  Near {booking.location.landmark}
                </p>
              )}
              <p className="text-gray-500" style={{ fontSize: "10px" }}>
                {[booking.location?.city, booking.location?.state].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        {booking.vehicleDetails?.brand && (
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-gray-400 uppercase mb-2" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
              Vehicle
            </p>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <Car size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-black" style={{ fontFamily: SERIF, fontSize: "12px" }}>
                  {booking.vehicleTypeName}
                </p>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: "10px" }}>
                  {booking.vehicleDetails.brand} {booking.vehicleDetails.model}
                </p>
                <div className="flex items-center gap-2 mt-1 text-gray-400" style={{ fontSize: "9px" }}>
                  {booking.vehicleDetails.color && <span>{booking.vehicleDetails.color}</span>}
                  {booking.vehicleDetails.plateNumber && (
                    <span className="font-mono uppercase">{booking.vehicleDetails.plateNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.specialNotes && (
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 uppercase mb-1.5" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
              Notes
            </p>
            <p className="text-gray-600" style={{ fontSize: "11px", lineHeight: 1.5 }}>
              {booking.specialNotes}
            </p>
          </div>
        )}

        {/* Cancellation */}
        {booking.status === "cancelled" && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-3">
            <p className="text-red-500 uppercase mb-1" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
              Cancelled
            </p>
            <p className="text-red-600" style={{ fontSize: "11px" }}>
              By: {booking.cancelledBy || "User"}
            </p>
            {booking.cancellationReason && (
              <p className="text-red-500 mt-0.5" style={{ fontSize: "11px" }}>
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="flex items-center justify-between py-2.5 border-t border-gray-100">
          <div>
            <p className="text-black" style={{ fontSize: "11px" }}>
              {booking.paymentMethod === "cash" ? "Cash" : booking.paymentMethod}
            </p>
            <p
              className={`mt-0.5 ${booking.paymentStatus === "completed" ? "text-emerald-600" : "text-amber-600"}`}
              style={{ fontSize: "10px" }}
            >
              {booking.paymentStatus === "completed" ? "✓ Paid" : "○ Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors"
          style={{ fontSize: "10px" }}
        >
          <Phone size={12} />
          <span className="uppercase tracking-wider">Help</span>
        </a>
        <button
          onClick={onClose}
          className="h-9 px-5 bg-black text-white rounded-full"
        >
          <span className="uppercase tracking-wider" style={{ fontSize: "9px", fontWeight: 500 }}>
            Close
          </span>
        </button>
      </div>
    </Modal>
  )
}

// ── Cancel Modal ──────────────────────────────────────────
function CancelModal({ booking, isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!isOpen) setReason("")
  }, [isOpen])

  if (!booking) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="w-11 h-11 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-3">
          <AlertCircle size={18} className="text-red-500" />
        </div>

        <h2 className="text-black mb-1.5" style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "18px" }}>
          Cancel Booking?
        </h2>

        <div className="border border-gray-100 rounded-lg p-3 mb-4">
          <p className="text-black" style={{ fontFamily: SERIF, fontSize: "13px" }}>
            {booking.serviceName}
          </p>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px", letterSpacing: "0.08em" }}>
            {formatDate(new Date(booking.bookingDate))} at {booking.timeSlot}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 uppercase mb-1.5" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know why..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-black placeholder-gray-300
                       focus:outline-none focus:border-black transition-colors resize-none"
            style={{ fontSize: "12px" }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 border border-gray-200 rounded-full text-black
                       uppercase tracking-wider disabled:opacity-50"
            style={{ fontSize: "9px", fontWeight: 500 }}
          >
            Keep
          </button>
          <button
            onClick={() => onConfirm(booking._id, reason)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 h-11
                       bg-red-600 text-white rounded-full disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <XCircle size={12} />
                <span className="uppercase tracking-wider" style={{ fontSize: "9px", fontWeight: 500 }}>
                  Cancel
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Empty State ───────────────────────────────────────────
function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
        <Car size={24} strokeWidth={1} className="text-gray-300" />
      </div>
      <h3 className="text-black mb-1" style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "16px" }}>
        {hasFilters ? "No bookings found" : "No bookings yet"}
      </h3>
      <p className="text-gray-400 mb-5 max-w-[240px]" style={{ fontSize: "12px", lineHeight: 1.5 }}>
        {hasFilters ? "Try adjusting filters" : "Book your first service"}
      </p>
      {!hasFilters && (
        <a
          href="/bookings"
          className="inline-flex items-center gap-1.5 h-10 px-5 bg-black text-white rounded-full"
        >
          <span className="uppercase tracking-wider" style={{ fontSize: "10px", fontWeight: 500 }}>
            Book Now
          </span>
          <ArrowRight size={12} />
        </a>
      )}
    </div>
  )
}

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

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      openModal("login")
      router.push("/")
    }
  }, [user, authLoading, openModal, router])

  // Fetch bookings
  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      try {
        setLoading(true)
        setError("")
        const result = await getUserBookings(statusFilter, currentPage, 10)
        setBookings(result.bookings || [])
        setTotalPages(result.pages || 1)
        setTotal(result.total || 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user, statusFilter, currentPage])

  const closeModals = useCallback(() => {
    setShowDetails(false)
    setShowCancel(false)
    setSelectedBooking(null)
  }, [])

  const handleCancel = useCallback(async (bookingId, reason) => {
    try {
      setActionLoading(true)
      await cancelBooking(bookingId, reason)
      closeModals()
      const result = await getUserBookings(statusFilter, currentPage, 10)
      setBookings(result.bookings || [])
      setTotalPages(result.pages || 1)
      setTotal(result.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }, [statusFilter, currentPage, closeModals])

  // Filter local search
  const filtered = bookings.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.bookingCode?.toLowerCase().includes(q) ||
      b.serviceName?.toLowerCase().includes(q) ||
      b.vehicleTypeName?.toLowerCase().includes(q)
    )
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={22} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main style={{ fontFamily: SANS }}>
      {/* ── Header ── */}
      <section className="bg-black pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-white/30" />
            <span className="text-white/50 uppercase tracking-[0.25em]" style={{ fontSize: "8px" }}>
              Account
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1
                className="text-white mb-1"
                style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.4rem, 5vw, 2rem)" }}
              >
                My Bookings
              </h1>
              <p className="text-white/40" style={{ fontSize: "11px" }}>
                {total} booking{total !== 1 ? "s" : ""}
              </p>
            </div>

            <a
              href="/bookings"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 bg-white text-black rounded-full"
            >
              <Sparkles size={11} />
              <span className="uppercase tracking-wider" style={{ fontSize: "9px", fontWeight: 500 }}>
                Book New
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-full
                           text-black placeholder-gray-300 focus:outline-none focus:border-black
                           transition-colors"
                style={{ fontSize: "12px" }}
              />
            </div>

            {/* Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setCurrentPage(1)
                  }}
                  className={`shrink-0 h-7 px-3 rounded-full uppercase tracking-wider transition-all
                    ${statusFilter === opt.value
                      ? "bg-black text-white"
                      : "border border-gray-200 text-gray-500 active:bg-gray-100"
                    }`}
                  style={{ fontSize: "8px", fontWeight: 500 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-10">
        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-red-600 flex-1" style={{ fontSize: "11px" }}>{error}</p>
            <button onClick={() => setError("")}>
              <X size={12} className="text-red-400" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={!!(searchQuery || statusFilter)} />
        ) : (
          <>
            <div className="space-y-2.5">
              {filtered.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onViewDetails={(b) => {
                    setSelectedBooking(b)
                    setShowDetails(true)
                  }}
                  onCancel={(b) => {
                    setSelectedBooking(b)
                    setShowCancel(true)
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 h-9 px-3 border border-gray-200 rounded-full
                             uppercase tracking-wider disabled:opacity-30"
                  style={{ fontSize: "9px", fontWeight: 500 }}
                >
                  <ChevronLeft size={12} />
                  Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-full transition-all
                        ${currentPage === p ? "bg-black text-white" : "border border-gray-200 text-black"}`}
                      style={{ fontSize: "11px" }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 h-9 px-3 border border-gray-200 rounded-full
                             uppercase tracking-wider disabled:opacity-30"
                  style={{ fontSize: "9px", fontWeight: 500 }}
                >
                  Next
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Mobile CTA ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3">
        <a
          href="/bookings"
          className="flex items-center justify-center gap-2 w-full h-12 bg-black text-white rounded-full"
        >
          <Sparkles size={12} />
          <span className="uppercase tracking-wider" style={{ fontSize: "10px", fontWeight: 500 }}>
            Book New Service
          </span>
          <ArrowRight size={12} />
        </a>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* ── Modals ── */}
      <DetailsModal
        booking={selectedBooking}
        isOpen={showDetails}
        onClose={closeModals}
      />

      <CancelModal
        booking={selectedBooking}
        isOpen={showCancel}
        onClose={closeModals}
        onConfirm={handleCancel}
        loading={actionLoading}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}
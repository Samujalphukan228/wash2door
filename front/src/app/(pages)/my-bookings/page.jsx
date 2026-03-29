"use client"

import { useState, useEffect, memo, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useUserSocket } from "@/context/UserSocketContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Phone,
  ArrowRight,
  Car,
  Sparkles,
  X,
} from "lucide-react"
import { getUserBookings, cancelBooking } from "@/lib/booking.api"
import OrderCard from "@/components/OrderCard"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"
const ITEMS_PER_PAGE = 10

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

// ── Utility Functions ──────────────────────────────────────
function isUpcomingBooking(booking) {
  const bookingDate = new Date(booking.bookingDate)
  return (
    bookingDate > new Date() &&
    !["cancelled", "completed"].includes(booking.status)
  )
}

function canCancelBooking(booking) {
  return (
    ["pending", "confirmed"].includes(booking.status) &&
    isUpcomingBooking(booking)
  )
}

// ── Custom Hooks ───────────────────────────────────────────
function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    const body = document.body

    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.overflow = "hidden"
    body.style.width = "100%"

    return () => {
      body.style.position = ""
      body.style.top = ""
      body.style.left = ""
      body.style.right = ""
      body.style.overflow = ""
      body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

// ── Animation Variants ─────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 40,
    transition: { duration: 0.2 },
  },
}

// ── Modal Wrapper ──────────────────────────────────────────
const ModalWrapper = memo(function ModalWrapper({ isOpen, onClose, children }) {
  useScrollLock(isOpen)

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                     bg-black/60 backdrop-blur-sm px-0 sm:px-4"
          onClick={handleOverlayClick}
        >
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl
                       max-h-[92dvh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="overflow-y-auto max-h-[88dvh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ── Details Modal ──────────────────────────────────────────
const BookingDetailsModal = memo(function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}) {
  const bookingDateFormatted = useMemo(() => {
    if (!booking) return ""
    return new Date(booking.bookingDate).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }, [booking])

  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2
              className="text-black mt-3 leading-tight"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(20px, 5vw, 26px)",
              }}
            >
              {booking.serviceName}
            </h2>
            <p
              className="text-gray-400 tracking-wider uppercase mt-1"
              style={{ fontSize: "9px" }}
            >
              {booking.bookingCode}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center shrink-0
                       border border-gray-200 hover:border-black hover:bg-black hover:text-white
                       rounded-full transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={1.5} />
          </motion.button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span
            className="text-gray-400 tracking-wider uppercase"
            style={{ fontSize: "9px" }}
          >
            Total
          </span>
          <span
            className="text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "30px",
            }}
          >
            ₹{booking.price?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        <div className="border border-gray-100 rounded-xl p-4">
          <p
            className="text-gray-400 tracking-wider uppercase mb-3"
            style={{ fontSize: "9px" }}
          >
            Schedule
          </p>
          <div>
            <p
              className="text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "13px",
              }}
            >
              {bookingDateFormatted}
            </p>
            <p
              className="text-gray-500 mt-0.5"
              style={{ fontSize: "11px" }}
            >
              {booking.timeSlot} · {booking.duration} minutes
            </p>
          </div>
        </div>

        {booking.location && (
          <div className="border border-gray-100 rounded-xl p-4">
            <p
              className="text-gray-400 tracking-wider uppercase mb-3"
              style={{ fontSize: "9px" }}
            >
              Location
            </p>
            <div className="min-w-0">
              <p
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "13px",
                }}
              >
                {booking.location?.address || "Address not provided"}
              </p>
              {booking.location?.landmark && (
                <p className="text-gray-500 mt-0.5" style={{ fontSize: "11px" }}>
                  Near {booking.location.landmark}
                </p>
              )}
              <p className="text-gray-500" style={{ fontSize: "11px" }}>
                {[booking.location?.city, booking.location?.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

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

        <div className="flex items-center justify-between py-3 border-t border-gray-100">
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

      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          <Phone size={13} strokeWidth={1.5} />
          <span className="uppercase">Need Help?</span>
        </a>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
          className="h-10 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
        >
          <span
            className="tracking-wider uppercase"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Close
          </span>
        </motion.button>
      </div>
    </ModalWrapper>
  )
})

// ── Cancel Modal ───────────────────────────────────────────
const CancelBookingModal = memo(function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!isOpen) setReason("")
  }, [isOpen])

  const handleConfirm = useCallback(() => {
    if (booking) onConfirm(booking._id, reason)
  }, [booking, reason, onConfirm])

  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-5">
        <div className="w-12 h-12 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={20} className="text-red-500" strokeWidth={1.5} />
        </div>

        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "20px",
          }}
        >
          Cancel Booking?
        </h2>

        <div className="border border-gray-100 rounded-xl p-4 mb-5">
          <p
            className="text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "14px",
            }}
          >
            {booking.serviceName}
          </p>
          <p
            className="text-gray-400 tracking-wider uppercase mt-1"
            style={{ fontSize: "9px" }}
          >
            {new Date(booking.bookingDate).toLocaleDateString("en-IN")} at{" "}
            {booking.timeSlot}
          </p>
        </div>

        <div className="mb-5">
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
                       transition-colors duration-200 resize-none"
            style={{ fontSize: "13px" }}
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 border border-gray-200 rounded-full
                       text-black tracking-wider uppercase
                       hover:border-black transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Keep
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-12
                       bg-red-600 text-white rounded-full
                       hover:bg-red-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Cancel
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </ModalWrapper>
  )
})

// ── Empty State ────────────────────────────────────────────
const EmptyState = memo(function EmptyState({ hasFilters }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5">
        <Car size={28} strokeWidth={1} className="text-gray-300" />
      </div>
      <h3
        className="text-black mb-2"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "18px",
        }}
      >
        {hasFilters ? "No bookings found" : "No bookings yet"}
      </h3>
      <p
        className="text-gray-400 mb-7 max-w-xs leading-relaxed"
        style={{ fontSize: "13px" }}
      >
        {hasFilters ? "Try adjusting your filters" : "Book your first service today"}
      </p>
      {!hasFilters && (
        <motion.a
          whileTap={{ scale: 0.96 }}
          href="/bookings"
          className="inline-flex items-center gap-2 h-11 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          <span
            className="tracking-wider uppercase"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Book Now
          </span>
          <ArrowRight size={13} />
        </motion.a>
      )}
    </motion.div>
  )
})

// ── Hero Section ───────────────────────────────────────────
const HeroSection = memo(function HeroSection({ total }) {
  return (
    <section className="relative bg-black pt-20 pb-10 md:pt-28 md:pb-14 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
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
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, white 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="w-8 h-px bg-white/30" aria-hidden="true" />
              <span
                className="tracking-[0.3em] uppercase text-white/50"
                style={{ fontFamily: "Georgia, serif", fontSize: "9px" }}
              >
                Account
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-white mb-2"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              My Bookings
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40"
              style={{ fontSize: "13px" }}
            >
              {total} booking{total !== 1 ? "s" : ""} total
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden sm:block"
          >
            <motion.a
              whileTap={{ scale: 0.96 }}
              href="/services"
              className="inline-flex items-center gap-2 h-11 px-5
                         bg-white text-black rounded-full
                         hover:bg-gray-100 transition-colors duration-200"
            >
              <Sparkles size={13} />
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Book New
              </span>
              <ArrowRight size={13} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ── Filter Bar ─────────────────────────────────────────────
const FilterBar = memo(function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-3">
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-full
                         text-black placeholder-gray-300
                         focus:outline-none focus:border-black
                         transition-colors duration-200"
              style={{ fontSize: "13px" }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {FILTER_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.94 }}
                onClick={() => onStatusChange(opt.value)}
                className={`shrink-0 h-8 px-3.5 rounded-full tracking-wider uppercase
                           transition-all duration-200
                           ${
                             statusFilter === opt.value
                               ? "bg-black text-white"
                               : "border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black"
                           }`}
                style={{ fontSize: "9px", fontWeight: 500 }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

// ── Pagination ─────────────────────────────────────────────
const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  )

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1.5 h-10 px-4
                   border border-gray-200 rounded-full text-black tracking-wider uppercase
                   hover:border-black disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors duration-200"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        <ChevronLeft size={13} />
        Prev
      </motion.button>

      <div className="flex gap-1 flex-wrap justify-center">
        {pageNumbers.map((page) => (
          <motion.button
            key={page}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full transition-all duration-200
                       ${
                         currentPage === page
                           ? "bg-black text-white"
                           : "border border-gray-200 text-black hover:border-black"
                       }`}
            style={{ fontSize: "12px" }}
          >
            {page}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1.5 h-10 px-4
                   border border-gray-200 rounded-full text-black tracking-wider uppercase
                   hover:border-black disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors duration-200"
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        Next
        <ChevronRight size={13} />
      </motion.button>
    </div>
  )
})

// ── Mobile Bottom CTA ──────────────────────────────────────
const MobileCTA = memo(function MobileCTA() {
  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 z-20
                  bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 pb-safe"
    >
      <motion.a
        whileTap={{ scale: 0.97 }}
        href="/services"
        className="flex items-center justify-center gap-2 w-full h-12
                   bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
      >
        <Sparkles size={13} />
        <span
          className="tracking-wider uppercase"
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          Book New Service
        </span>
        <ArrowRight size={13} />
      </motion.a>
    </div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function MyBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, openModal } = useAuth()

  // ✅ Real-time socket
  const { onBookingEvent } = useUserSocket()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // ✅ Hide footer
  useEffect(() => {
    const footer = document.querySelector("footer")
    if (footer) footer.style.display = "none"
    return () => {
      if (footer) footer.style.display = ""
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      openModal("login")
      router.push("/")
    }
  }, [user, authLoading, openModal, router])

  // ── Fetch bookings ─────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError("")
      const result = await getUserBookings(statusFilter, currentPage, ITEMS_PER_PAGE)
      setBookings(result.bookings || [])
      setTotalPages(result.pages || 1)
      setTotal(result.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }, [user, statusFilter, currentPage])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // ✅ Real-time: refetch silently when admin changes booking status
  useEffect(() => {
    const unsubscribe = onBookingEvent((event) => {
      if (event.type === 'statusUpdated' || event.type === 'cancelled') {
        // Silently refresh without showing loading spinner
        getUserBookings(statusFilter, currentPage, ITEMS_PER_PAGE)
          .then((result) => {
            setBookings(result.bookings || [])
            setTotalPages(result.pages || 1)
            setTotal(result.total || 0)
          })
          .catch(() => {}) // fail silently, toast already shown by socket context
      }
    })
    return unsubscribe
  }, [onBookingEvent, statusFilter, currentPage])

  // Close modals
  const closeModals = useCallback(() => {
    setShowDetailsModal(false)
    setShowCancelModal(false)
    setSelectedBooking(null)
  }, [])

  // Handle cancel confirmation
  const handleCancelConfirm = useCallback(
    async (bookingId, reason) => {
      try {
        setActionLoading(true)
        await cancelBooking(bookingId, reason)
        closeModals()
        fetchBookings()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel booking")
      } finally {
        setActionLoading(false)
      }
    },
    [closeModals, fetchBookings]
  )

  // Handle status filter change
  const handleStatusChange = useCallback((value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }, [])

  // Filter bookings by search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery) return bookings
    const query = searchQuery.toLowerCase()
    return bookings.filter(
      (booking) =>
        booking.bookingCode?.toLowerCase().includes(query) ||
        booking.serviceName?.toLowerCase().includes(query) ||
        booking.vehicleTypeName?.toLowerCase().includes(query)
    )
  }, [bookings, searchQuery])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={26} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <HeroSection total={total} />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />

        <section className="w-full bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-6 pb-28 sm:pb-12">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-xl"
                >
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-red-600" style={{ fontSize: "13px" }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={26} className="animate-spin text-gray-300" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState hasFilters={!!(searchQuery || statusFilter)} />
            ) : (
              <>
                <motion.div layout className="space-y-3">
                  {filteredBookings.map((booking, index) => (
                    <OrderCard
                      key={booking._id}
                      {...booking}
                      index={index}
                      onViewDetails={(b) => {
                        setSelectedBooking(b)
                        setShowDetailsModal(true)
                      }}
                      onCancel={(b) => {
                        setSelectedBooking(b)
                        setShowCancelModal(true)
                      }}
                      isUpcoming={isUpcomingBooking(booking)}
                      canCancel={canCancelBooking(booking)}
                    />
                  ))}
                </motion.div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </section>

        <MobileCTA />

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
    </>
  )
}
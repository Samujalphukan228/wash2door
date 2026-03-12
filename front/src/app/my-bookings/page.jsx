"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  Calendar, Clock, MapPin, Car, Search,
  ChevronRight, Loader2, AlertCircle, CheckCircle,
  XCircle, RotateCcw, Star, X, Phone, ArrowUpRight
} from 'lucide-react'
import { getUserBookings, cancelBooking } from '@/lib/booking.api'
import { createReview } from '@/lib/review.api'

// ─────────────────────────────────────────
// SCROLL LOCK HOOK
// ─────────────────────────────────────────

function useScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      document.body.style.width = '100%'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isLocked])
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const STATUS_CONFIG = {
  pending: { label: 'Pending', dot: 'bg-yellow-400', text: 'text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-400', text: 'text-blue-700', icon: CheckCircle },
  'in-progress': { label: 'In Progress', dot: 'bg-purple-400', text: 'text-purple-700', icon: RotateCcw },
  completed: { label: 'Completed', dot: 'bg-green-500', text: 'text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400', text: 'text-red-700', icon: XCircle },
}

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// ─────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <span className={`text-[9px] tracking-[0.18em] uppercase font-medium ${cfg.text}`}>
        {cfg.label}
      </span>
    </span>
  )
}

// ─────────────────────────────────────────
// BOOKING CARD
// ─────────────────────────────────────────

function BookingCard({ booking, onViewDetails, onCancel, onReview }) {
  const bookingDate = new Date(booking.bookingDate)
  const isUpcoming = bookingDate > new Date() && !['cancelled', 'completed'].includes(booking.status)
  const canBeCancelled = ['pending', 'confirmed'].includes(booking.status) && isUpcoming

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 hover:border-black transition-all duration-300 rounded-[5px]
                 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
    >
      {/* Top strip */}
      <div className="flex items-start justify-between gap-4 p-5 pb-4 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <StatusBadge status={booking.status} />
            <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
              {booking.bookingCode}
            </span>
          </div>
          <h3
            className="text-black truncate text-[15px] sm:text-[17px]"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
          >
            {booking.serviceName}
          </h3>
          <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-0.5 truncate">
            {booking.vehicleTypeName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="text-black text-[20px] sm:text-[24px] leading-none"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            ₹{booking.price}
          </p>
          <p className="text-[9px] tracking-[0.1em] uppercase text-gray-400 mt-1">
            {booking.duration} min
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-gray-100">
        {[
          {
            icon: Calendar,
            label: 'Date',
            value: bookingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }),
          },
          { icon: Clock, label: 'Time', value: booking.timeSlot },
          { icon: MapPin, label: 'City', value: booking.location?.city || 'N/A' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <Icon size={13} strokeWidth={1.5} className="text-gray-300" />
            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400">{label}</p>
            <p className="text-[9px] tracking-[0.1em] uppercase text-black font-medium truncate w-full">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 p-4">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
                     hover:border-black transition-colors duration-300 rounded-[3px] text-[10px]"
        >
          <span className="tracking-[0.18em] uppercase text-black">Details</span>
          <ChevronRight size={11} strokeWidth={1.8} />
        </button>

        {booking.status === 'completed' && !booking.isReviewed && (
          <button
            onClick={() => onReview(booking)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white
                       hover:bg-gray-800 transition-colors duration-300 rounded-[3px] text-[10px]"
          >
            <Star size={11} strokeWidth={1.8} />
            <span className="tracking-[0.18em] uppercase">Review</span>
          </button>
        )}

        {canBeCancelled && (
          <button
            onClick={() => onCancel(booking)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-500
                       hover:bg-red-50 transition-colors duration-300 rounded-[3px] ml-auto text-[10px]"
          >
            <XCircle size={11} strokeWidth={1.8} />
            <span className="tracking-[0.18em] uppercase">Cancel</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────
// MODAL WRAPPER (Reusable)
// ─────────────────────────────────────────

function ModalWrapper({ isOpen, onClose, children }) {
  useScrollLock(isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center 
                     bg-black/60 backdrop-blur-sm overscroll-none touch-none"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full sm:max-w-lg bg-white sm:rounded-[5px] rounded-t-[12px]
                       max-h-[92vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────
// DETAILS MODAL
// ─────────────────────────────────────────

function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!booking) return null

  const Row = ({ label, value }) =>
    value ? (
      <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
        <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 shrink-0">{label}</span>
        <span className="text-[11px] tracking-[0.1em] text-black text-right">{value}</span>
      </div>
    ) : null

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-3">{title}</p>
      <div className="border border-gray-100 rounded-[3px] px-4">{children}</div>
    </div>
  )

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-4 pb-5 border-b border-gray-100">
        <div>
          <StatusBadge status={booking.status} />
          <h2
            className="text-black mt-2 text-[18px] sm:text-[22px]"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            {booking.serviceName}
          </h2>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mt-1">
            {booking.bookingCode}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center border border-gray-200
                     hover:border-black hover:bg-black hover:text-white 
                     transition-all duration-300 rounded-[3px] shrink-0"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <Section title="Service">
          <Row label="Service" value={booking.serviceName} />
          <Row label="Category" value={booking.serviceCategory} />
          <Row label="Vehicle" value={booking.vehicleTypeName} />
          <Row label="Duration" value={`${booking.duration} minutes`} />
        </Section>

        <Section title="Schedule">
          <Row
            label="Date"
            value={new Date(booking.bookingDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <Row label="Time" value={booking.timeSlot} />
        </Section>

        <Section title="Location">
          <Row label="Address" value={booking.location?.address} />
          {booking.location?.landmark && <Row label="Landmark" value={`Near ${booking.location.landmark}`} />}
          <Row label="City" value={[booking.location?.city, booking.location?.state].filter(Boolean).join(', ')} />
        </Section>

        {(booking.vehicleDetails?.brand || booking.vehicleDetails?.type) && (
          <Section title="Vehicle">
            <Row label="Type" value={booking.vehicleDetails?.type} />
            {booking.vehicleDetails?.brand && (
              <Row
                label="Brand & Model"
                value={`${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ''}`.trim()}
              />
            )}
            <Row label="Color" value={booking.vehicleDetails?.color} />
            <Row label="Plate" value={booking.vehicleDetails?.plateNumber} />
          </Section>
        )}

        {booking.specialNotes && (
          <Section title="Special Instructions">
            <div className="py-3">
              <p className="text-[11px] text-gray-600">{booking.specialNotes}</p>
            </div>
          </Section>
        )}

        {booking.status === 'cancelled' && (
          <div className="border border-red-100 bg-red-50 rounded-[3px] px-4 py-4 mb-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-red-500 mb-3">Cancellation</p>
            <p className="text-[11px] text-gray-600">By: {booking.cancelledBy || 'User'}</p>
            {booking.cancellationReason && (
              <p className="text-[11px] text-gray-600 mt-1">Reason: {booking.cancellationReason}</p>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Total</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-gray-500 mt-0.5">
              {booking.paymentMethod === 'cash' ? 'Cash on service' : booking.paymentMethod}
              {' · '}
              <span className={booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                {booking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
              </span>
            </p>
          </div>
          <p
            className="text-black text-[26px] sm:text-[30px]"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            ₹{booking.price}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50 sm:rounded-b-[5px]">
        <a
          href="tel:6900706456"
          className="flex items-center gap-2 no-underline hover:opacity-60 transition-opacity duration-300 text-[10px]"
        >
          <Phone size={13} strokeWidth={1.5} className="text-gray-400" />
          <span className="tracking-[0.18em] uppercase text-gray-500">Need Help?</span>
        </a>
        <button
          onClick={onClose}
          className="relative flex items-center gap-2 px-6 py-3 bg-black text-white
                     tracking-[0.22em] uppercase overflow-hidden group rounded-[5px] text-[10px]"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          <span className="relative z-10 group-hover:text-black transition-colors duration-500">Close</span>
        </button>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// CANCEL MODAL
// ─────────────────────────────────────────

function CancelBookingModal({ booking, isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')

  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={20} className="text-red-500" strokeWidth={1.5} />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 
                       hover:border-black transition-colors duration-300 rounded-[3px]"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <h2
          className="text-black mb-2 text-[20px] sm:text-[24px]"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Cancel Booking?
        </h2>
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 leading-[1.8] mb-6">
          {booking.serviceName} ·{' '}
          {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at{' '}
          {booking.timeSlot}
        </p>

        <div className="mb-6">
          <label className="block text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-3">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know why..."
            rows={3}
            className="w-full bg-transparent border-b border-gray-200 py-3 outline-none resize-none
                       text-[11px] tracking-[0.15em] text-black placeholder-gray-300
                       focus:border-black transition-colors duration-300"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-200 text-[10px] tracking-[0.2em] uppercase
                       hover:border-black transition-colors duration-300 disabled:opacity-40 rounded-[5px]"
          >
            Keep
          </button>
          <button
            onClick={() => onConfirm(booking._id, reason)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5
                       bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase
                       hover:bg-red-700 transition-colors duration-300 disabled:opacity-40 rounded-[5px]"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <XCircle size={13} strokeWidth={1.5} />
                <span>Cancel Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// REVIEW MODAL
// ─────────────────────────────────────────

function ReviewModal({ booking, isOpen, onClose, onSubmit, loading }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  if (!booking) return null

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  const handleSubmit = () => {
    if (!rating) {
      setError('Please select a rating')
      return
    }
    onSubmit(booking._id, rating, comment)
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
            <Star size={20} strokeWidth={1.5} className="text-black" />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 
                       hover:border-black transition-colors duration-300 rounded-[3px]"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <h2
          className="text-black mb-2 text-[20px] sm:text-[24px]"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Rate Your Experience
        </h2>
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-6">{booking.serviceName}</p>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[10px] tracking-[0.15em] uppercase text-red-500 mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setRating(s)
                setError('')
              }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                strokeWidth={1.2}
                fill={(hover || rating) >= s ? '#000' : 'none'}
                stroke={(hover || rating) >= s ? '#000' : '#D1D5DB'}
              />
            </motion.button>
          ))}
        </div>
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-6 h-5">
          {labels[hover || rating]}
        </p>

        <div className="mb-6">
          <label className="block text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-3">
            Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            maxLength={500}
            className="w-full bg-transparent border-b border-gray-200 py-3 outline-none resize-none
                       text-[11px] tracking-[0.15em] text-black placeholder-gray-300
                       focus:border-black transition-colors duration-300"
          />
          <p className="text-right text-[9px] tracking-[0.1em] text-gray-300 mt-1">{comment.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-200 text-[10px] tracking-[0.2em] uppercase
                       hover:border-black transition-colors duration-300 disabled:opacity-40 rounded-[5px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5
                       bg-black text-white text-[10px] tracking-[0.2em] uppercase
                       hover:bg-gray-800 transition-colors duration-300 disabled:opacity-40 rounded-[5px]"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Star size={13} strokeWidth={1.5} />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function MyBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, openModal } = useAuth()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      openModal('login')
      router.push('/')
    }
  }, [user, authLoading, openModal, router])

  useEffect(() => {
    if (user) fetchBookings()
  }, [user, statusFilter, currentPage])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
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

  const closeModals = () => {
    setShowDetailsModal(false)
    setShowCancelModal(false)
    setShowReviewModal(false)
    setSelectedBooking(null)
  }

  const handleCancelConfirm = async (bookingId, reason) => {
    try {
      setActionLoading(true)
      await cancelBooking(bookingId, reason)
      closeModals()
      await fetchBookings()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReviewSubmit = async (bookingId, rating, comment) => {
    try {
      setActionLoading(true)
      await createReview(bookingId, rating, comment)
      closeModals()
      await fetchBookings()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = bookings.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.bookingCode?.toLowerCase().includes(q) ||
      b.serviceName?.toLowerCase().includes(q) ||
      b.vehicleTypeName?.toLowerCase().includes(q)
    )
  })

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-gray-300" />
      </div>
    )

  if (!user) return null

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* ── Page Header ── */}
      <div className="bg-black">
        <div className="max-w-5xl mx-auto px-5 md:px-16 pt-20 pb-10 md:pt-24 md:pb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-6 h-px bg-white/30 shrink-0" />
                <span
                  className="text-[10px] tracking-[0.4em] uppercase text-white/50"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Account
                </span>
              </div>
              <h1
                className="text-white text-[1.5rem] sm:text-[2rem] md:text-[2.2rem]"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
              >
                My Bookings
              </h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mt-2">
                {total} booking{total !== 1 ? 's' : ''}
              </p>
            </div>
            <a
              href="/Bookings"
              className="relative hidden sm:inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase
                         text-black bg-white border border-white px-6 py-3 no-underline
                         overflow-hidden group rounded-[5px] mb-1"
            >
              <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">Book New</span>
              <ArrowUpRight
                size={12}
                strokeWidth={1.5}
                className="relative z-10 group-hover:text-white transition-colors duration-500"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-5 md:px-16 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={14}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white outline-none
                           text-[11px] tracking-[0.1em] text-black placeholder-gray-300
                           focus:border-black transition-colors duration-300 rounded-[5px]"
              />
            </div>

            {/* Status pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setCurrentPage(1)
                  }}
                  className={`flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-300 rounded-[3px] ${
                    statusFilter === opt.value
                      ? 'bg-black text-white'
                      : 'border border-gray-200 text-gray-500 hover:border-black hover:text-black'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-16 py-8 pb-24 sm:pb-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 p-4 border border-red-100 bg-red-50 rounded-[5px]"
            >
              <AlertCircle size={16} strokeWidth={1.5} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] tracking-[0.1em] text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 border border-gray-200 rounded-full flex items-center justify-center mb-6">
              <Car size={24} strokeWidth={1} className="text-gray-300" />
            </div>
            <h3
              className="text-black mb-3 text-[16px] sm:text-[18px]"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
            >
              {searchQuery || statusFilter ? 'No Bookings Found' : 'No Bookings Yet'}
            </h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-8">
              {searchQuery || statusFilter ? 'Try adjusting your search' : 'Book your first service today'}
            </p>
            {!searchQuery && !statusFilter && (
              <a
                href="/Bookings"
                className="relative inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase
                           text-white bg-black border border-black px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
              >
                <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">Book Now</span>
                <ArrowUpRight
                  size={12}
                  strokeWidth={1.5}
                  className="relative z-10 group-hover:text-black transition-colors duration-500"
                />
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {filtered.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onViewDetails={(b) => {
                    setSelectedBooking(b)
                    setShowDetailsModal(true)
                  }}
                  onCancel={(b) => {
                    setSelectedBooking(b)
                    setShowCancelModal(true)
                  }}
                  onReview={(b) => {
                    setSelectedBooking(b)
                    setShowReviewModal(true)
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 border border-gray-200 text-[10px] tracking-[0.2em] uppercase
                             hover:border-black transition-colors duration-300
                             disabled:opacity-30 disabled:cursor-not-allowed rounded-[3px]"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-10 h-10 text-[10px] tracking-[0.1em] transition-all duration-300 rounded-[3px] ${
                      currentPage === p
                        ? 'bg-black text-white'
                        : 'border border-gray-200 hover:border-black text-black'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 border border-gray-200 text-[10px] tracking-[0.2em] uppercase
                             hover:border-black transition-colors duration-300
                             disabled:opacity-30 disabled:cursor-not-allowed rounded-[3px]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Book CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 p-4">
        <a
          href="/Bookings"
          className="flex items-center justify-center gap-2 w-full text-[10px] tracking-[0.22em] uppercase
                     text-white bg-black py-4 no-underline rounded-[5px]"
        >
          <ArrowUpRight size={13} strokeWidth={1.5} />
          Book New Service
        </a>
      </div>

      {/* Modals */}
      <BookingDetailsModal booking={selectedBooking} isOpen={showDetailsModal} onClose={closeModals} />
      <CancelBookingModal
        booking={selectedBooking}
        isOpen={showCancelModal}
        onClose={closeModals}
        onConfirm={handleCancelConfirm}
        loading={actionLoading}
      />
      <ReviewModal
        booking={selectedBooking}
        isOpen={showReviewModal}
        onClose={closeModals}
        onSubmit={handleReviewSubmit}
        loading={actionLoading}
      />
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  Calendar, Clock, MapPin, Car, Search,
  ChevronRight, Loader2, AlertCircle, CheckCircle,
  XCircle, RotateCcw, Star, X, Phone, ArrowUpRight,
  Sparkles, Timer, Navigation
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
  pending: { 
    label: 'Pending', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200',
    text: 'text-amber-700', 
    dot: 'bg-amber-400',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    text: 'text-blue-700', 
    dot: 'bg-blue-400',
    icon: CheckCircle 
  },
  'in-progress': { 
    label: 'In Progress', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    text: 'text-purple-700', 
    dot: 'bg-purple-400',
    icon: RotateCcw 
  },
  completed: { 
    label: 'Completed', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    text: 'text-green-700', 
    dot: 'bg-green-500',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    text: 'text-red-600', 
    dot: 'bg-red-400',
    icon: XCircle 
  },
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
// STATUS BADGE - Redesigned
// ─────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 
      ${cfg.bg} ${cfg.border} border rounded-full
    `}>
      <Icon size={11} strokeWidth={2} className={cfg.text} />
      <span className={`text-[10px] tracking-[0.1em] uppercase font-semibold ${cfg.text}`}>
        {cfg.label}
      </span>
    </span>
  )
}

// ─────────────────────────────────────────
// BOOKING CARD - Completely Redesigned
// ─────────────────────────────────────────

function BookingCard({ booking, onViewDetails, onCancel, onReview }) {
  const bookingDate = new Date(booking.bookingDate)
  const isUpcoming = bookingDate > new Date() && !['cancelled', 'completed'].includes(booking.status)
  const canBeCancelled = ['pending', 'confirmed'].includes(booking.status) && isUpcoming
  const isPast = bookingDate < new Date()
  
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  // Format date nicely
  const formatDate = (date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative bg-white rounded-xl overflow-hidden
        border border-gray-100 hover:border-gray-200
        shadow-[0_2px_8px_rgba(0,0,0,0.04)] 
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        transition-all duration-300
      `}
    >
      {/* Status Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.dot}`} />

      {/* Main Content */}
      <div className="p-5 sm:p-6">
        
        {/* Top Row: Status & Code */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <StatusBadge status={booking.status} />
          <span className="text-[11px] tracking-[0.05em] text-gray-400 font-mono">
            #{booking.bookingCode}
          </span>
        </div>

        {/* Service Info */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-[17px] sm:text-[19px] text-gray-900 font-medium truncate mb-1"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {booking.serviceName}
            </h3>
            <div className="flex items-center gap-2 text-gray-500">
              <Car size={13} strokeWidth={1.5} />
              <span className="text-[12px]">{booking.vehicleTypeName}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="text-right shrink-0">
            <p 
              className="text-[24px] sm:text-[28px] text-gray-900 font-light tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              ₹{booking.price}
            </p>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {/* Date */}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Calendar size={14} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[12px] text-gray-700 font-medium">
              {formatDate(bookingDate)}
            </span>
          </div>
          
          {/* Time */}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Clock size={14} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[12px] text-gray-700 font-medium">
              {booking.timeSlot}
            </span>
          </div>
          
          {/* Duration */}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Timer size={14} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[12px] text-gray-700 font-medium">
              {booking.duration} min
            </span>
          </div>
          
          {/* Location */}
          {booking.location?.city && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <MapPin size={14} strokeWidth={1.5} className="text-gray-400" />
              <span className="text-[12px] text-gray-700 font-medium">
                {booking.location.city}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-4" />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Details - Always visible */}
          <button
            onClick={() => onViewDetails(booking)}
            className="inline-flex items-center gap-2 px-4 py-2.5 
                     bg-gray-900 text-white rounded-lg
                     hover:bg-gray-800 active:scale-[0.98]
                     transition-all duration-200 text-[12px] font-medium"
          >
            View Details
            <ChevronRight size={14} strokeWidth={2} />
          </button>

          {/* Review Button - Only for completed */}
          {booking.status === 'completed' && !booking.isReviewed && (
            <button
              onClick={() => onReview(booking)}
              className="inline-flex items-center gap-2 px-4 py-2.5 
                       bg-amber-50 text-amber-700 border border-amber-200 rounded-lg
                       hover:bg-amber-100 active:scale-[0.98]
                       transition-all duration-200 text-[12px] font-medium"
            >
              <Star size={14} strokeWidth={2} />
              Leave Review
            </button>
          )}

          {/* Cancel Button - Only for cancellable */}
          {canBeCancelled && (
            <button
              onClick={() => onCancel(booking)}
              className="inline-flex items-center gap-2 px-4 py-2.5 ml-auto
                       text-red-600 hover:bg-red-50 rounded-lg
                       active:scale-[0.98] transition-all duration-200 
                       text-[12px] font-medium"
            >
              <XCircle size={14} strokeWidth={2} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Upcoming Indicator */}
      {isUpcoming && booking.status !== 'cancelled' && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────
// MODAL WRAPPER
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-[20px]
                       max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>
            
            <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────
// DETAILS MODAL - Redesigned
// ─────────────────────────────────────────

function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!booking) return null

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className={`${statusConfig.bg} px-6 pt-6 pb-5`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge status={booking.status} />
            <h2 
              className="text-[22px] sm:text-[26px] text-gray-900 mt-3 font-medium"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {booking.serviceName}
            </h2>
            <p className="text-[13px] text-gray-500 mt-1 font-mono">
              #{booking.bookingCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center 
                     bg-white/80 hover:bg-white rounded-full
                     transition-colors duration-200 shrink-0"
          >
            <X size={18} strokeWidth={2} className="text-gray-600" />
          </button>
        </div>
        
        {/* Price Tag */}
        <div className="mt-4 inline-flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl shadow-sm">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider">Total</span>
          <span 
            className="text-[28px] text-gray-900 font-light ml-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            ₹{booking.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Schedule Card */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-[11px] tracking-[0.15em] uppercase text-gray-400 font-semibold mb-3">
            Schedule
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Calendar size={20} strokeWidth={1.5} className="text-gray-600" />
            </div>
            <div>
              <p className="text-[15px] text-gray-900 font-medium">
                {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Clock size={12} strokeWidth={2} />
                {booking.timeSlot} · {booking.duration} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-[11px] tracking-[0.15em] uppercase text-gray-400 font-semibold mb-3">
            Location
          </h4>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <MapPin size={20} strokeWidth={1.5} className="text-gray-600" />
            </div>
            <div>
              <p className="text-[15px] text-gray-900 font-medium">
                {booking.location?.address || 'Address not provided'}
              </p>
              {booking.location?.landmark && (
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Near {booking.location.landmark}
                </p>
              )}
              <p className="text-[13px] text-gray-500">
                {[booking.location?.city, booking.location?.state].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Card */}
        {(booking.vehicleDetails?.brand || booking.vehicleDetails?.type) && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-[11px] tracking-[0.15em] uppercase text-gray-400 font-semibold mb-3">
              Vehicle
            </h4>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Car size={20} strokeWidth={1.5} className="text-gray-600" />
              </div>
              <div>
                <p className="text-[15px] text-gray-900 font-medium">
                  {booking.vehicleTypeName}
                </p>
                {booking.vehicleDetails?.brand && (
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    {booking.vehicleDetails.brand} {booking.vehicleDetails.model}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-400">
                  {booking.vehicleDetails?.color && (
                    <span>{booking.vehicleDetails.color}</span>
                  )}
                  {booking.vehicleDetails?.plateNumber && (
                    <span className="font-mono">{booking.vehicleDetails.plateNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Notes */}
        {booking.specialNotes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <h4 className="text-[11px] tracking-[0.15em] uppercase text-amber-600 font-semibold mb-2">
              Special Instructions
            </h4>
            <p className="text-[13px] text-amber-800">{booking.specialNotes}</p>
          </div>
        )}

        {/* Cancellation Info */}
        {booking.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <h4 className="text-[11px] tracking-[0.15em] uppercase text-red-600 font-semibold mb-2">
              Cancellation Details
            </h4>
            <p className="text-[13px] text-red-700">
              Cancelled by: {booking.cancelledBy || 'User'}
            </p>
            {booking.cancellationReason && (
              <p className="text-[13px] text-red-600 mt-1">
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        )}

        {/* Payment Info */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Sparkles size={16} strokeWidth={2} className="text-gray-500" />
            </div>
            <div>
              <p className="text-[13px] text-gray-900 font-medium">
                {booking.paymentMethod === 'cash' ? 'Cash on Service' : booking.paymentMethod}
              </p>
              <p className={`text-[12px] ${
                booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'
              }`}>
                {booking.paymentStatus === 'completed' ? '✓ Paid' : '○ Payment Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
        <a
          href="tel:6900706456"
          className="inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Phone size={16} strokeWidth={1.5} />
          Need Help?
        </a>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg 
                   hover:bg-gray-800 active:scale-[0.98]
                   transition-all duration-200 text-[13px] font-medium"
        >
          Close
        </button>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// CANCEL MODAL - Redesigned
// ─────────────────────────────────────────

function CancelBookingModal({ booking, isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')

  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Icon */}
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
          <AlertCircle size={28} className="text-red-500" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 
          className="text-[22px] text-gray-900 font-medium mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Cancel this booking?
        </h2>
        
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-[15px] text-gray-900 font-medium">{booking.serviceName}</p>
          <p className="text-[13px] text-gray-500 mt-1">
            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            })} at {booking.timeSlot}
          </p>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-[12px] text-gray-500 font-medium mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Help us improve by sharing why..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     text-[14px] text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-gray-300 focus:bg-white
                     transition-all duration-200 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl
                     hover:bg-gray-50 active:scale-[0.98]
                     transition-all duration-200 text-[14px] font-medium
                     disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={() => onConfirm(booking._id, reason)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                     bg-red-600 text-white rounded-xl
                     hover:bg-red-700 active:scale-[0.98]
                     transition-all duration-200 text-[14px] font-medium
                     disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <XCircle size={16} strokeWidth={2} />
                Cancel Booking
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// REVIEW MODAL - Redesigned
// ─────────────────────────────────────────

function ReviewModal({ booking, isOpen, onClose, onSubmit, loading }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  if (!booking) return null

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  const emojis = ['', '😞', '😐', '🙂', '😊', '🤩']

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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={32} strokeWidth={1.5} className="text-amber-500" />
          </div>
          <h2 
            className="text-[22px] text-gray-900 font-medium"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            How was your experience?
          </h2>
          <p className="text-[14px] text-gray-500 mt-1">{booking.serviceName}</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Star Rating */}
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  setRating(s)
                  setError('')
                }}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform"
              >
                <Star
                  size={40}
                  strokeWidth={1.5}
                  fill={(hover || rating) >= s ? '#F59E0B' : 'none'}
                  stroke={(hover || rating) >= s ? '#F59E0B' : '#D1D5DB'}
                  className="transition-colors duration-150"
                />
              </motion.button>
            ))}
          </div>
          
          {/* Rating Label with Emoji */}
          <AnimatePresence mode="wait">
            {(hover || rating) > 0 && (
              <motion.div
                key={hover || rating}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-2xl">{emojis[hover || rating]}</span>
                <span className="text-[14px] text-gray-600 font-medium">
                  {labels[hover || rating]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-[12px] text-gray-500 font-medium mb-2">
            Share more details (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     text-[14px] text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-gray-300 focus:bg-white
                     transition-all duration-200 resize-none"
          />
          <p className="text-right text-[11px] text-gray-400 mt-1">
            {comment.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl
                     hover:bg-gray-50 active:scale-[0.98]
                     transition-all duration-200 text-[14px] font-medium
                     disabled:opacity-50"
          >
            Maybe Later
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                     bg-amber-500 text-white rounded-xl
                     hover:bg-amber-600 active:scale-[0.98]
                     transition-all duration-200 text-[14px] font-medium
                     disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Star size={16} strokeWidth={2} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────

function EmptyState({ hasFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Car size={36} strokeWidth={1} className="text-gray-300" />
      </div>
      <h3 
        className="text-[20px] text-gray-900 mb-2 font-medium"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {hasFilters ? 'No bookings found' : 'No bookings yet'}
      </h3>
      <p className="text-[14px] text-gray-500 mb-8 max-w-xs">
        {hasFilters 
          ? 'Try adjusting your search or filters' 
          : 'Book your first car wash and enjoy our doorstep service'
        }
      </p>
      {!hasFilters && (
        <a
          href="/Bookings"
          className="inline-flex items-center gap-2 px-6 py-3 
                   bg-gray-900 text-white rounded-xl
                   hover:bg-gray-800 active:scale-[0.98]
                   transition-all duration-200 text-[14px] font-medium"
        >
          Book Your First Wash
          <ArrowUpRight size={16} strokeWidth={2} />
        </a>
      )}
    </motion.div>
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ── Header ── */}
      <div className="bg-gray-900">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-10 sm:pt-20 sm:pb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">
                My Account
              </p>
              <h1 
                className="text-white text-[28px] sm:text-[36px] font-light"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Bookings
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                {total} booking{total !== 1 ? 's' : ''} total
              </p>
            </div>
            
            <a
              href="/Bookings"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 
                       bg-white text-gray-900 rounded-lg
                       hover:bg-gray-100 active:scale-[0.98]
                       transition-all duration-200 text-[13px] font-medium"
            >
              New Booking
              <ArrowUpRight size={16} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search 
                size={18} 
                strokeWidth={1.5} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by service, code..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                         text-[14px] text-gray-900 placeholder-gray-400
                         focus:outline-none focus:border-gray-300 focus:bg-white
                         transition-all duration-200"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setCurrentPage(1)
                  }}
                  className={`
                    flex-shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-medium
                    transition-all duration-200
                    ${statusFilter === opt.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 pb-28 sm:pb-8">
        
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl"
            >
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-[14px] text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={!!(searchQuery || statusFilter)} />
        ) : (
          <>
            {/* Booking Cards */}
            <div className="space-y-4">
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
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg
                           text-[13px] text-gray-600 font-medium
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`
                        w-10 h-10 rounded-lg text-[13px] font-medium
                        transition-all duration-200
                        ${currentPage === p
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg
                           text-[13px] text-gray-600 font-medium
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Mobile CTA ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 p-4">
        <a
          href="/Bookings"
          className="flex items-center justify-center gap-2 w-full py-4 
                   bg-gray-900 text-white rounded-xl
                   active:scale-[0.98] transition-all duration-200
                   text-[14px] font-medium"
        >
          <ArrowUpRight size={18} strokeWidth={2} />
          Book New Service
        </a>
      </div>

      {/* ── Modals ── */}
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
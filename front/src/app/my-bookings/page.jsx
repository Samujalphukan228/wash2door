"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  Calendar, Clock, MapPin, Car, Search,
  ChevronRight, Loader2, AlertCircle, CheckCircle,
  XCircle, RotateCcw, Star, X, Phone, ArrowUpRight,
  Timer
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
// CONSTANTS - Original Colors
// ─────────────────────────────────────────

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    dot: 'bg-yellow-400',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    dot: 'bg-blue-400',
    icon: CheckCircle 
  },
  'in-progress': { 
    label: 'In Progress', 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    dot: 'bg-purple-400',
    icon: RotateCcw 
  },
  completed: { 
    label: 'Completed', 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    dot: 'bg-green-500',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    bg: 'bg-gray-100', 
    text: 'text-gray-500', 
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
// STATUS BADGE - Original Style
// ─────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${cfg.bg} rounded-full`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-[9px] tracking-[0.15em] uppercase font-medium ${cfg.text}`}>
        {cfg.label}
      </span>
    </span>
  )
}

// ─────────────────────────────────────────
// BOOKING CARD - New Design, Original Colors
// ─────────────────────────────────────────

function BookingCard({ booking, onViewDetails, onCancel, onReview }) {
  const bookingDate = new Date(booking.bookingDate)
  const isUpcoming = bookingDate > new Date() && !['cancelled', 'completed'].includes(booking.status)
  const canBeCancelled = ['pending', 'confirmed'].includes(booking.status) && isUpcoming

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
      className="group relative bg-white border border-gray-200 rounded-[8px] overflow-hidden
                 hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                 transition-all duration-300"
    >
      {/* Main Content */}
      <div className="p-5 sm:p-6">
        
        {/* Top Row: Status & Code */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <StatusBadge status={booking.status} />
          <span className="text-[10px] tracking-[0.1em] text-gray-400 font-mono uppercase">
            {booking.bookingCode}
          </span>
        </div>

        {/* Service Info */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-[18px] sm:text-[20px] text-black truncate mb-1"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
            >
              {booking.serviceName}
            </h3>
            <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400">
              {booking.vehicleTypeName}
            </p>
          </div>
          
          {/* Price */}
          <div className="text-right shrink-0">
            <p 
              className="text-[26px] sm:text-[30px] text-black leading-none"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
            >
              ₹{booking.price}
            </p>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Date */}
          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
            <Calendar size={13} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[11px] tracking-[0.05em] text-black">
              {formatDate(bookingDate)}
            </span>
          </div>
          
          {/* Time */}
          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
            <Clock size={13} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[11px] tracking-[0.05em] text-black">
              {booking.timeSlot}
            </span>
          </div>
          
          {/* Duration */}
          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
            <Timer size={13} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[11px] tracking-[0.05em] text-black">
              {booking.duration} min
            </span>
          </div>
          
          {/* Location */}
          {booking.location?.city && (
            <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
              <MapPin size={13} strokeWidth={1.5} className="text-gray-400" />
              <span className="text-[11px] tracking-[0.05em] text-black">
                {booking.location.city}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-5" />

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(booking)}
            className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 
                     bg-black text-white rounded-[5px] overflow-hidden
                     active:scale-[0.98] transition-all duration-300"
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 text-[10px] tracking-[0.15em] uppercase group-hover/btn:text-black transition-colors duration-500">
              Details
            </span>
            <ChevronRight size={13} strokeWidth={2} className="relative z-10 group-hover/btn:text-black transition-colors duration-500" />
          </button>

          {/* Review Button */}
          {booking.status === 'completed' && !booking.isReviewed && (
            <button
              onClick={() => onReview(booking)}
              className="inline-flex items-center gap-2 px-5 py-2.5 
                       border border-gray-200 text-black rounded-[5px]
                       hover:border-black active:scale-[0.98]
                       transition-all duration-300"
            >
              <Star size={13} strokeWidth={2} />
              <span className="text-[10px] tracking-[0.15em] uppercase">Review</span>
            </button>
          )}

          {/* Cancel Button */}
          {canBeCancelled && (
            <button
              onClick={() => onCancel(booking)}
              className="inline-flex items-center gap-2 px-5 py-2.5 ml-auto
                       text-red-500 hover:bg-red-50 rounded-[5px]
                       active:scale-[0.98] transition-all duration-300"
            >
              <XCircle size={13} strokeWidth={2} />
              <span className="text-[10px] tracking-[0.15em] uppercase">Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Upcoming Indicator */}
      {isUpcoming && booking.status !== 'cancelled' && (
        <div className="absolute top-5 right-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-full w-full bg-green-500" />
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
            className="relative w-full sm:max-w-lg bg-white sm:rounded-[8px] rounded-t-[16px]
                       max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
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
// DETAILS MODAL - Original Colors
// ─────────────────────────────────────────

function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge status={booking.status} />
            <h2 
              className="text-[22px] sm:text-[26px] text-black mt-3"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
            >
              {booking.serviceName}
            </h2>
            <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mt-1">
              {booking.bookingCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center 
                     border border-gray-200 hover:border-black hover:bg-black hover:text-white
                     rounded-[5px] transition-all duration-300 shrink-0"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Price */}
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400">Total</span>
          <span 
            className="text-[32px] text-black"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            ₹{booking.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5">
        
        {/* Schedule */}
        <div className="border border-gray-100 rounded-[5px] p-4">
          <p className="text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-3">Schedule</p>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 border border-gray-200 rounded-[5px] flex items-center justify-center">
              <Calendar size={18} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div>
              <p className="text-[14px] text-black" style={{ fontFamily: 'Georgia, serif' }}>
                {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Clock size={11} strokeWidth={2} />
                {booking.timeSlot} · {booking.duration} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border border-gray-100 rounded-[5px] p-4">
          <p className="text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-3">Location</p>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 border border-gray-200 rounded-[5px] flex items-center justify-center shrink-0">
              <MapPin size={18} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div>
              <p className="text-[14px] text-black" style={{ fontFamily: 'Georgia, serif' }}>
                {booking.location?.address || 'Address not provided'}
              </p>
              {booking.location?.landmark && (
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Near {booking.location.landmark}
                </p>
              )}
              <p className="text-[12px] text-gray-500">
                {[booking.location?.city, booking.location?.state].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        {(booking.vehicleDetails?.brand || booking.vehicleDetails?.type) && (
          <div className="border border-gray-100 rounded-[5px] p-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-3">Vehicle</p>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 border border-gray-200 rounded-[5px] flex items-center justify-center shrink-0">
                <Car size={18} strokeWidth={1.5} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[14px] text-black" style={{ fontFamily: 'Georgia, serif' }}>
                  {booking.vehicleTypeName}
                </p>
                {booking.vehicleDetails?.brand && (
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {booking.vehicleDetails.brand} {booking.vehicleDetails.model}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  {booking.vehicleDetails?.color && (
                    <span>{booking.vehicleDetails.color}</span>
                  )}
                  {booking.vehicleDetails?.plateNumber && (
                    <span className="font-mono uppercase">{booking.vehicleDetails.plateNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Notes */}
        {booking.specialNotes && (
          <div className="border border-gray-200 bg-gray-50 rounded-[5px] p-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-gray-500 mb-2">
              Special Instructions
            </p>
            <p className="text-[12px] text-gray-600 leading-relaxed">{booking.specialNotes}</p>
          </div>
        )}

        {/* Cancellation Info */}
        {booking.status === 'cancelled' && (
          <div className="border border-red-200 bg-red-50 rounded-[5px] p-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-red-500 mb-2">
              Cancellation Details
            </p>
            <p className="text-[12px] text-red-600">
              Cancelled by: {booking.cancelledBy || 'User'}
            </p>
            {booking.cancellationReason && (
              <p className="text-[12px] text-red-500 mt-1">
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div>
            <p className="text-[12px] text-black">
              {booking.paymentMethod === 'cash' ? 'Cash on Service' : booking.paymentMethod}
            </p>
            <p className={`text-[11px] mt-0.5 ${
              booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {booking.paymentStatus === 'completed' ? '✓ Paid' : '○ Payment Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
        <a
          href="tel:6900706456"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-gray-400 hover:text-black transition-colors"
        >
          <Phone size={14} strokeWidth={1.5} />
          Need Help?
        </a>
        <button
          onClick={onClose}
          className="group relative px-6 py-2.5 bg-black text-white rounded-[5px] overflow-hidden"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
            Close
          </span>
        </button>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// CANCEL MODAL - Original Colors
// ─────────────────────────────────────────

function CancelBookingModal({ booking, isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')

  if (!booking) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Icon */}
        <div className="w-12 h-12 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <AlertCircle size={24} className="text-red-500" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 
          className="text-[22px] text-black mb-2"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Cancel Booking?
        </h2>
        
        {/* Booking Summary */}
        <div className="border border-gray-100 rounded-[5px] p-4 mb-6">
          <p 
            className="text-[15px] text-black"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {booking.serviceName}
          </p>
          <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400 mt-1">
            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            })} at {booking.timeSlot}
          </p>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know why..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-[5px]
                     text-[12px] text-black placeholder-gray-300
                     focus:outline-none focus:border-black
                     transition-colors duration-300 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-200 rounded-[5px]
                     text-[10px] tracking-[0.2em] uppercase text-black
                     hover:border-black transition-colors duration-300
                     disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={() => onConfirm(booking._id, reason)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 
                     bg-red-600 text-white rounded-[5px]
                     text-[10px] tracking-[0.2em] uppercase
                     hover:bg-red-700 transition-colors duration-300
                     disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <XCircle size={14} strokeWidth={2} />
                Cancel
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ─────────────────────────────────────────
// REVIEW MODAL - Original Colors
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={28} strokeWidth={1.5} className="text-black" />
          </div>
          <h2 
            className="text-[22px] text-black"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            Rate Your Experience
          </h2>
          <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mt-1">
            {booking.serviceName}
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[11px] tracking-[0.1em] uppercase text-red-500 mb-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Star Rating */}
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-3">
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
                className="p-1"
              >
                <Star
                  size={36}
                  strokeWidth={1.2}
                  fill={(hover || rating) >= s ? '#000' : 'none'}
                  stroke={(hover || rating) >= s ? '#000' : '#D1D5DB'}
                  className="transition-colors duration-150"
                />
              </motion.button>
            ))}
          </div>
          
          {/* Rating Label */}
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 h-5">
            {labels[hover || rating]}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
            Review (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-200 rounded-[5px]
                     text-[12px] text-black placeholder-gray-300
                     focus:outline-none focus:border-black
                     transition-colors duration-300 resize-none"
          />
          <p className="text-right text-[9px] text-gray-300 mt-1">
            {comment.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-200 rounded-[5px]
                     text-[10px] tracking-[0.2em] uppercase text-black
                     hover:border-black transition-colors duration-300
                     disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="group flex-1 relative flex items-center justify-center gap-2 px-4 py-3.5 
                     bg-black text-white rounded-[5px] overflow-hidden
                     disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            {loading ? (
              <Loader2 size={16} className="relative z-10 animate-spin" />
            ) : (
              <>
                <Star size={14} strokeWidth={2} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
                  Submit
                </span>
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
      <div className="w-16 h-16 border border-gray-200 rounded-full flex items-center justify-center mb-6">
        <Car size={28} strokeWidth={1} className="text-gray-300" />
      </div>
      <h3 
        className="text-[18px] text-black mb-2"
        style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
      >
        {hasFilters ? 'No bookings found' : 'No bookings yet'}
      </h3>
      <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mb-8 max-w-xs">
        {hasFilters 
          ? 'Try adjusting your search or filters' 
          : 'Book your first service today'
        }
      </p>
      {!hasFilters && (
        <a
          href="/Bookings"
          className="group relative inline-flex items-center gap-2 px-7 py-4 
                   bg-black text-white rounded-[5px] overflow-hidden"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
            Book Now
          </span>
          <ArrowUpRight size={14} strokeWidth={2} className="relative z-10 group-hover:text-black transition-colors duration-500" />
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div 
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      
      {/* ── Header ── */}
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
                className="text-white text-[1.6rem] sm:text-[2rem] md:text-[2.2rem]"
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
              className="hidden sm:inline-flex group relative items-center gap-2 
                       px-6 py-3 bg-white text-black rounded-[5px] overflow-hidden"
            >
              <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-white transition-colors duration-500">
                Book New
              </span>
              <ArrowUpRight size={14} strokeWidth={2} className="relative z-10 group-hover:text-white transition-colors duration-500" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-5 md:px-16 py-4">
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-[5px]
                         text-[12px] text-black placeholder-gray-300
                         focus:outline-none focus:border-black
                         transition-colors duration-300"
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
                    flex-shrink-0 px-4 py-2.5 rounded-[5px] 
                    text-[10px] tracking-[0.15em] uppercase
                    transition-all duration-300
                    ${statusFilter === opt.value
                      ? 'bg-black text-white'
                      : 'border border-gray-200 text-gray-500 hover:border-black hover:text-black'
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
      <div className="max-w-5xl mx-auto px-5 md:px-16 py-8 pb-28 sm:pb-8">
        
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-[5px]"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-[12px] text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
                  className="px-5 py-2.5 border border-gray-200 rounded-[5px]
                           text-[10px] tracking-[0.15em] uppercase text-black
                           hover:border-black disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors duration-300"
                >
                  Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`
                      w-10 h-10 rounded-[5px] text-[11px]
                      transition-all duration-300
                      ${currentPage === p
                        ? 'bg-black text-white'
                        : 'border border-gray-200 text-black hover:border-black'
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 border border-gray-200 rounded-[5px]
                           text-[10px] tracking-[0.15em] uppercase text-black
                           hover:border-black disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors duration-300"
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
                   bg-black text-white rounded-[5px]
                   text-[10px] tracking-[0.2em] uppercase"
        >
          <ArrowUpRight size={14} strokeWidth={2} />
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
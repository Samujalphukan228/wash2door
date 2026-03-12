"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { createBooking } from '@/lib/booking.api'

const CATEGORY_LABELS = {
  basic: 'Essential',
  standard: 'Standard',
  premium: 'Premium'
}

export default function ConfirmStep({ data, onBack, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError('')

      const bookingData = {
        serviceId: data.serviceId,
        vehicleTypeId: data.vehicleTypeId,
        bookingDate: data.bookingDate,
        timeSlot: data.timeSlot,
        location: {
          address: data.location.address,
          city: data.location.city,
          state: data.location.state || '',
          zipCode: data.location.zipCode || '',
          landmark: data.location.landmark || ''
        },
        vehicleDetails: {
          type: data.vehicleDetails.type,
          brand: data.vehicleDetails.brand || '',
          model: data.vehicleDetails.model || '',
          color: data.vehicleDetails.color || '',
          plateNumber: data.vehicleDetails.plateNumber || ''
        },
        specialNotes: data.specialNotes || ''
      }

      const result = await createBooking(bookingData)
      setBookingResult(result)
      setSuccess(true)
      
      if (onSuccess) {
        onSuccess(result)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Success View
  if (success && bookingResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-10"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={40} className="text-green-600" />
        </motion.div>

        <h2
          className="text-2xl md:text-3xl text-black mb-3"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Booking Confirmed!
        </h2>

        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-8">
          Your booking has been successfully placed
        </p>

        {/* Booking Code */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block bg-gray-100 px-8 py-4 mb-8 rounded-[5px]"
        >
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-1">
            Booking Code
          </p>
          <p
            className="text-[28px] text-black tracking-wider"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
          >
            {bookingResult.bookingCode}
          </p>
        </motion.div>

        {/* Booking Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto border border-gray-200 p-6 text-left mb-8 rounded-[5px]"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Service</span>
              <span className="text-[12px] text-black">{bookingResult.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Vehicle</span>
              <span className="text-[12px] text-black">{bookingResult.vehicleTypeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Date</span>
              <span className="text-[12px] text-black">
                {new Date(bookingResult.bookingDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Time</span>
              <span className="text-[12px] text-black">{bookingResult.timeSlot}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between">
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Total</span>
              <span
                className="text-[18px] text-black"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
              >
                ₹{bookingResult.price}
              </span>
            </div>
          </div>
        </motion.div>

        <p className="text-[10px] tracking-[0.1em] text-gray-400 mb-8">
          A confirmation email has been sent to your registered email address.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/MyBookings')}
            className="px-8 py-4 border border-black text-[10px] tracking-[0.22em] uppercase hover:bg-black hover:text-white transition-colors duration-300 rounded-[3px]"
          >
            View My Bookings
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-black text-white text-[10px] tracking-[0.22em] uppercase hover:bg-gray-800 transition-colors duration-300 rounded-[3px]"
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Confirmation View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-black transition-colors duration-300 mb-8"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Back to Details
      </button>

      <div className="text-center mb-10">
        <h2
          className="text-2xl md:text-3xl text-black mb-3"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Review Your Booking
        </h2>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          Please confirm all details before placing your booking
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 flex items-start gap-3 rounded-[5px]"
          >
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] tracking-[0.1em] text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        {/* Service Summary */}
        <div className="border border-gray-200 p-6 mb-6 rounded-[5px]">
          <div className="flex items-start gap-4">
            {data.serviceImage && (
              <img
                src={data.serviceImage}
                alt={data.serviceName}
                className="w-24 h-24 object-cover rounded-[3px]"
              />
            )}
            <div className="flex-1">
              <span className="text-[8px] tracking-[0.3em] uppercase text-gray-400">
                {CATEGORY_LABELS[data.serviceCategory]}
              </span>
              <h3
                className="text-[18px] text-black mt-1"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
              >
                {data.serviceName}
              </h3>
              <p className="text-[11px] text-gray-500 mt-2">
                {data.vehicleTypeName} · {data.duration} mins
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[24px] text-black"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
              >
                ₹{data.price}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Date & Time */}
          <div className="border border-gray-200 p-6 rounded-[5px]">
            <h4 className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-4">
              <Calendar size={14} strokeWidth={1.5} />
              Schedule
            </h4>
            <p className="text-[14px] text-black" style={{ fontFamily: 'Georgia, serif' }}>
              {new Date(data.bookingDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-[14px] text-black mt-1 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
              <Clock size={14} strokeWidth={1.5} />
              {data.timeSlot}
            </p>
          </div>

          {/* Location */}
          <div className="border border-gray-200 p-6 rounded-[5px]">
            <h4 className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-4">
              <MapPin size={14} strokeWidth={1.5} />
              Location
            </h4>
            <p className="text-[12px] text-black leading-5">
              {data.location?.address}
              {data.location?.landmark && <span className="text-gray-500"> (Near {data.location.landmark})</span>}
            </p>
            <p className="text-[12px] text-black">
              {data.location?.city}
              {data.location?.state && `, ${data.location.state}`}
            </p>
          </div>

          {/* Vehicle */}
          <div className="border border-gray-200 p-6 rounded-[5px]">
            <h4 className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-4">
              <Car size={14} strokeWidth={1.5} />
              Vehicle
            </h4>
            <p className="text-[12px] text-black">
              {data.vehicleDetails?.brand} {data.vehicleDetails?.model}
            </p>
            <p className="text-[11px] text-gray-500">
              {data.vehicleDetails?.type?.toUpperCase()}
              {data.vehicleDetails?.color && ` · ${data.vehicleDetails.color}`}
            </p>
            {data.vehicleDetails?.plateNumber && (
              <p className="text-[11px] text-gray-500 mt-1">
                {data.vehicleDetails.plateNumber}
              </p>
            )}
          </div>

          {/* Payment */}
          <div className="border border-gray-200 p-6 rounded-[5px]">
            <h4 className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-4">
              <CreditCard size={14} strokeWidth={1.5} />
              Payment
            </h4>
            <p className="text-[12px] text-black">Cash on Service</p>
            <p className="text-[11px] text-gray-500">
              Pay after the service is completed
            </p>
          </div>
        </div>

        {/* Special Notes */}
        {data.specialNotes && (
          <div className="border border-gray-200 p-6 mb-6 rounded-[5px]">
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-3">
              Special Instructions
            </h4>
            <p className="text-[12px] text-gray-600">{data.specialNotes}</p>
          </div>
        )}

        {/* Price Summary */}
        <div className="border-2 border-black p-6 mb-8 rounded-[5px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400">Total Amount</p>
              <p className="text-[11px] text-gray-500 mt-1">Including all taxes</p>
            </div>
            <p
              className="text-[32px] text-black"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
            >
              ₹{data.price}
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-[9px] tracking-[0.1em] text-gray-400 text-center mb-8">
          By confirming this booking, you agree to our Terms of Service and Cancellation Policy.
          Cancellations are free up to 2 hours before the scheduled time.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-8 py-4 border border-gray-200 text-[10px] tracking-[0.22em] uppercase hover:border-black transition-colors duration-300 rounded-[3px]"
          >
            Edit Details
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={loading}
            className="relative flex items-center justify-center gap-2 px-12 py-4 bg-black text-white text-[10px] tracking-[0.22em] uppercase overflow-hidden group disabled:opacity-50 rounded-[3px]"
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            {loading ? (
              <Loader2 size={16} className="relative z-10 animate-spin" />
            ) : (
              <>
                <CheckCircle size={14} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                  Confirm Booking
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
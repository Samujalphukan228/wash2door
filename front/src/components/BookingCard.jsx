// components/BookingCard.jsx
"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  Timer,
  ChevronRight,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  confirmed: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "in-progress": { label: "In Progress", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
}

const StatusBadge = memo(({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[8px] font-medium uppercase tracking-wide ${config.color} ${config.bg} border ${config.border}`}>
      <span className={`w-1 h-1 rounded-full ${config.color}`} />
      {config.label}
    </div>
  )
})

const InfoRow = memo(({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-2">
      <Icon size={13} strokeWidth={1.5} className="text-gray-400" />
      <span className="text-[9px] text-gray-600 font-medium">{label}</span>
    </div>
    <span className="text-[9px] text-gray-900 font-semibold">{value}</span>
  </div>
))

const formatDate = (date) => {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  ;[today, tomorrow, d].forEach(date => date.setHours(0, 0, 0, 0))

  if (d.getTime() === today.getTime()) return "Today"
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow"

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

// Mobile Booking Card
export const MobileBookingCard = memo(function MobileBookingCard({
  _id,
  bookingCode,
  serviceName,
  vehicleTypeName,
  price,
  bookingDate,
  timeSlot,
  duration,
  location,
  status,
  index = 0,
  onViewDetails,
  onCancel,
  isUpcoming = false,
  canCancel = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const bookingDateObj = useMemo(() => new Date(bookingDate), [bookingDate])
  const formattedDate = useMemo(() => formatDate(bookingDateObj), [bookingDateObj])

  const orderData = {
    _id,
    bookingCode,
    serviceName,
    vehicleTypeName,
    price,
    bookingDate,
    timeSlot,
    duration,
    location,
    status,
  }

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(orderData)
  }, [orderData, onViewDetails])

  const handleCancel = useCallback(() => {
    onCancel?.(orderData)
  }, [orderData, onCancel])

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white border border-gray-200 rounded-lg overflow-hidden 
                 active:scale-[0.98] hover:border-gray-300 transition-all duration-200"
    >
      {isUpcoming && (
        <div className="absolute top-3 right-3 h-1.5 w-1.5 z-10">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse" />
          <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500" />
        </div>
      )}

      {/* Collapsed State */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between gap-3 hover:bg-gray-50 
                   transition-colors duration-200 text-left relative"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusBadge status={status} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {serviceName}
            </h3>
            <p className="text-[8px] text-gray-500 uppercase mt-0.5">
              {vehicleTypeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="text-base font-semibold text-gray-900">
            ₹{price?.toLocaleString("en-IN")}
          </p>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} className="text-gray-400" strokeWidth={2} />
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded Content */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden border-t border-gray-100"
      >
        <div className="p-4 space-y-4">
          {/* Booking Details */}
          <div>
            <p className="text-[8px] font-semibold text-gray-600 uppercase mb-2">Booking Details</p>
            <InfoRow icon={Calendar} label="Booking ID" value={bookingCode || "N/A"} />
            {_id && <InfoRow icon={Calendar} label="Reference" value={_id.slice(-8)} />}
          </div>

          {/* Schedule */}
          <div>
            <p className="text-[8px] font-semibold text-gray-600 uppercase mb-2">Schedule</p>
            <InfoRow icon={Calendar} label="Date" value={formattedDate} />
            <InfoRow icon={Clock} label="Time" value={timeSlot || "N/A"} />
            <InfoRow icon={Timer} label="Duration" value={`${duration || 0}m`} />
          </div>

          {/* Location */}
          {location && (
            <div>
              <p className="text-[8px] font-semibold text-gray-600 uppercase mb-2">Location</p>
              {location.city && (
                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} strokeWidth={1.5} className="text-gray-400" />
                    <span className="text-[9px] text-gray-900 font-semibold">{location.city}</span>
                  </div>
                </div>
              )}
              {location.address && (
                <p className="text-[9px] text-gray-600 py-2 leading-relaxed">
                  {location.address}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleViewDetails}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg
                         bg-gray-900 text-white hover:bg-gray-800
                         transition-colors duration-200 text-[9px] font-medium uppercase"
            >
              Details
              <ChevronRight size={11} strokeWidth={2} />
            </motion.button>

            {status === "completed" && (
              <div className="inline-flex items-center gap-1 h-8 px-4 rounded-lg 
                             border border-emerald-300 text-emerald-700 text-[9px] font-medium uppercase">
                <CheckCircle size={10} strokeWidth={2} />
                Done
              </div>
            )}

            {canCancel && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="ml-auto inline-flex items-center gap-1 h-8 px-4 rounded-lg
                           border border-red-300 text-red-700 hover:bg-red-50
                           transition-colors duration-200 text-[9px] font-medium uppercase"
              >
                <XCircle size={10} strokeWidth={2} />
                Cancel
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

MobileBookingCard.displayName = "MobileBookingCard"

// Desktop Booking Card
export const DesktopBookingCard = memo(function DesktopBookingCard({
  _id,
  bookingCode,
  serviceName,
  vehicleTypeName,
  price,
  bookingDate,
  timeSlot,
  duration,
  location,
  status,
  index = 0,
  onViewDetails,
  onCancel,
  isUpcoming = false,
  canCancel = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const bookingDateObj = useMemo(() => new Date(bookingDate), [bookingDate])
  const formattedDate = useMemo(() => formatDate(bookingDateObj), [bookingDateObj])

  const orderData = {
    _id,
    bookingCode,
    serviceName,
    vehicleTypeName,
    price,
    bookingDate,
    timeSlot,
    duration,
    location,
    status,
  }

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(orderData)
  }, [orderData, onViewDetails])

  const handleCancel = useCallback(() => {
    onCancel?.(orderData)
  }, [orderData, onCancel])

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
      className="bg-white border border-gray-200 rounded-lg overflow-hidden 
                 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
    >
      {isUpcoming && (
        <div className="absolute top-3 right-3 h-1.5 w-1.5 z-10">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse" />
          <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500" />
        </div>
      )}

      {/* Collapsed State */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between gap-3 hover:bg-gray-50 
                   transition-colors duration-200 text-left relative"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusBadge status={status} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {serviceName}
            </h3>
            <p className="text-[8px] text-gray-500 uppercase mt-0.5">
              {vehicleTypeName}
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-100 rounded">
            <Calendar size={11} className="text-gray-400" />
            <span className="text-[10px] text-black">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-100 rounded">
            <Clock size={11} className="text-gray-400" />
            <span className="text-[10px] text-black">{timeSlot || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="text-base font-semibold text-gray-900">
            ₹{price?.toLocaleString("en-IN")}
          </p>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} className="text-gray-400" strokeWidth={2} />
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded Content */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden border-t border-gray-100"
      >
        <div className="p-4 space-y-4">
          {/* Booking Details */}
          <div>
            <p className="text-[8px] font-semibold text-gray-600 uppercase mb-2">Booking Details</p>
            <InfoRow icon={Calendar} label="Booking ID" value={bookingCode || "N/A"} />
            {_id && <InfoRow icon={Calendar} label="Reference" value={_id.slice(-8)} />}
          </div>

          {/* Schedule */}
          <div>
            <p className="text-[8px] font-semibold text-gray-600 uppercase mb-2">Schedule</p>
            <InfoRow icon={Calendar} label="Date" value={formattedDate} />
            <InfoRow icon={Clock} label="Time" value={timeSlot || "N/A"} />
            <InfoRow icon={Timer} label="Duration" value={`${duration || 0}m`} />
          </div>

          {/* Location */}
          {location && (
            <div>
              <p className="text-[8px] font-semibold text-gray-600 uppercase mb-2">Location</p>
              {location.city && (
                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} strokeWidth={1.5} className="text-gray-400" />
                    <span className="text-[9px] text-gray-900 font-semibold">{location.city}</span>
                  </div>
                </div>
              )}
              {location.address && (
                <p className="text-[9px] text-gray-600 py-2 leading-relaxed">
                  {location.address}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleViewDetails}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg
                         bg-gray-900 text-white hover:bg-gray-800
                         transition-colors duration-200 text-[9px] font-medium uppercase"
            >
              Details
              <ChevronRight size={11} strokeWidth={2} />
            </motion.button>

            {status === "completed" && (
              <div className="inline-flex items-center gap-1 h-8 px-4 rounded-lg 
                             border border-emerald-300 text-emerald-700 text-[9px] font-medium uppercase">
                <CheckCircle size={10} strokeWidth={2} />
                Done
              </div>
            )}

            {canCancel && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="ml-auto inline-flex items-center gap-1 h-8 px-4 rounded-lg
                           border border-red-300 text-red-700 hover:bg-red-50
                           transition-colors duration-200 text-[9px] font-medium uppercase"
              >
                <XCircle size={10} strokeWidth={2} />
                Cancel
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

DesktopBookingCard.displayName = "DesktopBookingCard"
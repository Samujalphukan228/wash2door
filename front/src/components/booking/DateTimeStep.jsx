"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react'
import { checkAvailability } from '@/lib/booking.api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function DateTimeStep({ data, onUpdate, onNext, onBack }) {
  const [selectedDate, setSelectedDate] = useState(data.bookingDate ? new Date(data.bookingDate) : null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [closedMessage, setClosedMessage] = useState('')

  useEffect(() => {
    if (selectedDate && data.serviceId) {
      fetchAvailability()
    }
  }, [selectedDate, data.serviceId])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      setError('')
      setClosedMessage('')
      
      const dateStr = formatDateForAPI(selectedDate)
      const result = await checkAvailability(data.serviceId, dateStr)
      
      if (!result.isAvailable) {
        setClosedMessage(result.message || 'Not available on this day')
        setSlots([])
      } else {
        setSlots(result.slots || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDateForAPI = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    onUpdate({ 
      bookingDate: formatDateForAPI(date),
      timeSlot: ''
    })
  }

  const handleSlotSelect = (slot) => {
    onUpdate({ timeSlot: slot })
  }

  const handleNext = () => {
    if (selectedDate && data.timeSlot) {
      onNext()
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateDisabled = (date) => {
    if (!date) return true
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return true
    
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    if (date > maxDate) return true

    if (date.getDay() === 0) return true

    return false
  }

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date) => {
    if (!date) return false
    return date.toDateString() === new Date().toDateString()
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const canGoPrevMonth = () => {
    const today = new Date()
    return currentMonth.getMonth() > today.getMonth() || 
           currentMonth.getFullYear() > today.getFullYear()
  }

  const canGoNextMonth = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return currentMonth.getMonth() < maxDate.getMonth() || 
           currentMonth.getFullYear() < maxDate.getFullYear()
  }

  const days = getDaysInMonth(currentMonth)

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
        Back to Vehicle Type
      </button>

      <div className="text-center mb-10">
        <h2
          className="text-2xl md:text-3xl text-black mb-3"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Pick Date & Time
        </h2>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          Choose when you want us to arrive
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="border border-gray-200 p-6 rounded-[5px]">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              disabled={!canGoPrevMonth()}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-[3px] hover:bg-gray-100"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <h3
              className="text-[14px] text-black"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
            >
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              disabled={!canGoNextMonth()}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-[3px] hover:bg-gray-100"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-[9px] tracking-[0.2em] uppercase text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => (
              <button
                key={i}
                onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                disabled={!date || isDateDisabled(date)}
                className={`
                  aspect-square flex items-center justify-center text-[12px] transition-all duration-200 rounded-[3px]
                  ${!date ? 'invisible' : ''}
                  ${isDateDisabled(date) ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-black'}
                  ${isDateSelected(date) ? 'bg-black text-white hover:bg-black' : ''}
                  ${isToday(date) && !isDateSelected(date) ? 'border border-black' : ''}
                  ${date?.getDay() === 0 ? 'text-red-300' : ''}
                `}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-[9px] tracking-[0.1em] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border border-black rounded-[2px]"></span>
                Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-black rounded-[2px]"></span>
                Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-100 rounded-[2px]"></span>
                Unavailable
              </span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="border border-gray-200 p-6 rounded-[5px]">
          <h3
            className="text-[14px] text-black mb-6 flex items-center gap-2"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
          >
            <Clock size={16} strokeWidth={1.5} />
            Available Time Slots
          </h3>

          {!selectedDate ? (
            <div className="flex items-center justify-center py-16 text-center">
              <div>
                <Calendar size={32} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
                  Please select a date first
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle size={32} className="mx-auto text-red-300 mb-4" strokeWidth={1} />
              <p className="text-[10px] tracking-[0.15em] uppercase text-red-500">
                {error}
              </p>
            </div>
          ) : closedMessage ? (
            <div className="text-center py-16">
              <AlertCircle size={32} className="mx-auto text-amber-300 mb-4" strokeWidth={1} />
              <p className="text-[10px] tracking-[0.15em] uppercase text-amber-600">
                {closedMessage}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot) => (
                <motion.button
                  key={slot.slot}
                  whileTap={{ scale: slot.available ? 0.98 : 1 }}
                  onClick={() => slot.available && handleSlotSelect(slot.slot)}
                  disabled={!slot.available}
                  className={`
                    px-4 py-3 text-[11px] tracking-[0.1em] border transition-all duration-200 rounded-[3px]
                    ${!slot.available 
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through' 
                      : data.timeSlot === slot.slot
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }
                  `}
                >
                  {slot.slot}
                </motion.button>
              ))}
            </div>
          )}

          {/* Selected Summary */}
          <AnimatePresence>
            {selectedDate && data.timeSlot && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Selected
                </p>
                <p className="text-[14px] text-black" style={{ fontFamily: 'Georgia, serif' }}>
                  {selectedDate.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-[14px] text-black" style={{ fontFamily: 'Georgia, serif' }}>
                  {data.timeSlot}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-10 flex justify-end">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!selectedDate || !data.timeSlot}
          className="relative flex items-center gap-2 px-8 py-4 bg-black text-white text-[10px] tracking-[0.22em] uppercase overflow-hidden group disabled:opacity-30 disabled:cursor-not-allowed rounded-[3px]"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          <span className="relative z-10 group-hover:text-black transition-colors duration-500">
            Continue
          </span>
          <ChevronRight size={14} className="relative z-10 group-hover:text-black transition-colors duration-500" />
        </motion.button>
      </div>
    </motion.div>
  )
}
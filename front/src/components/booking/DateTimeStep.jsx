"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react"
import { checkAvailability } from "@/lib/booking.api"

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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DateTimeStep = memo(function DateTimeStep({
  data,
  onUpdate,
  onNext,
  onBack,
}) {
  const containerRef = useRef(null)
  const [selectedDate, setSelectedDate] = useState(
    data.bookingDate ? new Date(data.bookingDate) : null
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [closedMessage, setClosedMessage] = useState("")

  useEffect(() => {
    if (selectedDate && data.serviceId) {
      fetchAvailability()
    }
  }, [selectedDate, data.serviceId])

  // Initial animation
  useEffect(() => {
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
            stagger: 0.1,
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
  }, [])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      setError("")
      setClosedMessage("")

      const dateStr = formatDateForAPI(selectedDate)
      const result = await checkAvailability(data.serviceId, dateStr)

      if (!result.isAvailable) {
        setClosedMessage(result.message || "Not available on this day")
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
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleDateSelect = useCallback(
    (date) => {
      setSelectedDate(date)
      onUpdate({
        bookingDate: formatDateForAPI(date),
        timeSlot: "",
      })
    },
    [onUpdate]
  )

  const handleSlotSelect = useCallback(
    (slot) => {
      onUpdate({ timeSlot: slot })
    },
    [onUpdate]
  )

  const handleNext = useCallback(() => {
    if (selectedDate && data.timeSlot) {
      onNext()
    }
  }, [selectedDate, data.timeSlot, onNext])

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
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const canGoPrevMonth = () => {
    const today = new Date()
    return (
      currentMonth.getMonth() > today.getMonth() ||
      currentMonth.getFullYear() > today.getFullYear()
    )
  }

  const canGoNextMonth = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return (
      currentMonth.getMonth() < maxDate.getMonth() ||
      currentMonth.getFullYear() < maxDate.getFullYear()
    )
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div ref={containerRef}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-black
                   transition-colors duration-300 mb-8"
        style={{ fontSize: "10px", letterSpacing: "0.2em" }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        <span className="uppercase">Back to Options</span>
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
          Pick Date & Time
        </h2>
        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Choose when you want us to arrive
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div
          data-animate
          className="opacity-0 border border-gray-200 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              disabled={!canGoPrevMonth()}
              className="w-10 h-10 flex items-center justify-center text-gray-400
                         hover:text-black hover:bg-gray-100 rounded-full
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <h3
              className="text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontSize: "14px",
              }}
            >
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              disabled={!canGoNextMonth()}
              className="w-10 h-10 flex items-center justify-center text-gray-400
                         hover:text-black hover:bg-gray-100 rounded-full
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-gray-400 tracking-wider uppercase py-2"
                style={{ fontSize: "9px" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => (
              <button
                key={i}
                onClick={() =>
                  date && !isDateDisabled(date) && handleDateSelect(date)
                }
                disabled={!date || isDateDisabled(date)}
                className={`
                  aspect-square flex items-center justify-center rounded-lg
                  transition-all duration-200
                  ${!date ? "invisible" : ""}
                  ${
                    isDateDisabled(date)
                      ? "text-gray-200 cursor-not-allowed"
                      : "hover:bg-gray-100 text-black"
                  }
                  ${isDateSelected(date) ? "bg-black text-white hover:bg-black" : ""}
                  ${isToday(date) && !isDateSelected(date) ? "ring-1 ring-black" : ""}
                  ${date?.getDay() === 0 ? "text-red-300" : ""}
                `}
                style={{ fontSize: "12px" }}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div
              className="flex items-center gap-4 text-gray-400"
              style={{ fontSize: "9px", letterSpacing: "0.1em" }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 ring-1 ring-black rounded" />
                Today
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-black rounded" />
                Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-gray-100 rounded" />
                Unavailable
              </span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div
          data-animate
          className="opacity-0 border border-gray-200 p-6 rounded-2xl"
        >
          <h3
            className="text-black mb-6 flex items-center gap-2"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            <Clock size={16} strokeWidth={1.5} />
            Available Time Slots
          </h3>

          {!selectedDate ? (
            <div className="flex items-center justify-center py-16 text-center">
              <div>
                <Calendar
                  size={32}
                  className="mx-auto text-gray-200 mb-4"
                  strokeWidth={1}
                />
                <p
                  className="text-gray-400 tracking-wider uppercase"
                  style={{ fontSize: "10px" }}
                >
                  Please select a date first
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle
                size={32}
                className="mx-auto text-red-300 mb-4"
                strokeWidth={1}
              />
              <p
                className="text-red-500 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                {error}
              </p>
            </div>
          ) : closedMessage ? (
            <div className="text-center py-16">
              <AlertCircle
                size={32}
                className="mx-auto text-amber-300 mb-4"
                strokeWidth={1}
              />
              <p
                className="text-amber-600 tracking-wider uppercase"
                style={{ fontSize: "10px" }}
              >
                {closedMessage}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.slot}
                  onClick={() => slot.available && handleSlotSelect(slot.slot)}
                  disabled={!slot.available}
                  className={`
                    h-12 border rounded-xl transition-all duration-200
                    ${
                      !slot.available
                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                        : data.timeSlot === slot.slot
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-200 hover:border-black"
                    }
                  `}
                  style={{ fontSize: "11px", letterSpacing: "0.05em" }}
                >
                  {slot.slot}
                </button>
              ))}
            </div>
          )}

          {/* Selected Summary */}
          {selectedDate && data.timeSlot && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p
                className="text-gray-400 tracking-wider uppercase mb-2"
                style={{ fontSize: "9px", letterSpacing: "0.3em" }}
              >
                Selected
              </p>
              <p
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "14px",
                }}
              >
                {selectedDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p
                className="text-black"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "14px",
                }}
              >
                {data.timeSlot}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedDate || !data.timeSlot}
          className="group inline-flex items-center gap-2 h-12 px-8
                     bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-300"
        >
          <span
            className="tracking-wider uppercase"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Continue
          </span>
          <ChevronRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform duration-300"
          />
        </button>
      </div>
    </div>
  )
})

export default DateTimeStep
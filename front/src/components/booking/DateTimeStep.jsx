// components/booking/DateTimeStep.jsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { checkAvailability } from "@/lib/booking.api"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const formatSlot = (slot) => slot

const convertTo24Hour = (time12) => {
    const [time, period] = time12.split(' ')
    let [hours, minutes] = time.split(':').map(Number)

    if (period === 'PM' && hours !== 12) {
        hours += 12
    } else if (period === 'AM' && hours === 12) {
        hours = 0
    }

    return { hours, minutes }
}

const isSlotPast = (slotStr, selectedDate) => {
    if (!selectedDate) return false

    const today = new Date()
    const sel = new Date(selectedDate)
    sel.setHours(0, 0, 0, 0)
    const todayMidnight = new Date(today)
    todayMidnight.setHours(0, 0, 0, 0)

    if (sel > todayMidnight) return false

    if (sel.getTime() === todayMidnight.getTime()) {
        const startTimePart = slotStr.split('-')[0].trim()
        const { hours, minutes } = convertTo24Hour(startTimePart)
        
        const slotDateTime = new Date(today)
        slotDateTime.setHours(hours, minutes, 0, 0)
        return today >= slotDateTime
    }

    return false
}

export default function DateTimeStep({ data, onUpdate, onNext, onBack }) {
    const [selectedDate, setSelectedDate] = useState(data.bookingDate ? new Date(data.bookingDate + 'T12:00:00') : null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [closedMessage, setClosedMessage] = useState("")

    const fetchAvailability = useCallback(async (date) => {
        if (!date) return
        try {
            setLoading(true)
            setError("")
            setClosedMessage("")

            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`

            const result = await checkAvailability(dateStr)
            const availabilityData = result.data || result

            if (availabilityData.isClosed) {
                setClosedMessage(availabilityData.message || "We are closed on this day")
                setSlots([])
            } else if (!availabilityData.isAvailable && (!availabilityData.slots || availabilityData.slots.length === 0)) {
                setClosedMessage("No available slots for this day")
                setSlots([])
            } else {
                setSlots(availabilityData.slots || [])
            }
        } catch (err) {
            setError(err.message || "Failed to check availability")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (selectedDate) {
            fetchAvailability(selectedDate)
        }
    }, [selectedDate, fetchAvailability])

    const handleDateSelect = (date) => {
        setSelectedDate(date)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        onUpdate({ bookingDate: `${year}-${month}-${day}`, timeSlot: "" })
    }

    const handleSlotSelect = (slot) => {
        onUpdate({ timeSlot: slot })
    }

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const days = []
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
        return days
    }

    const isDateDisabled = (date) => {
        if (!date) return true
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        if (checkDate < today) return true
        const maxDate = new Date()
        maxDate.setDate(maxDate.getDate() + 30)
        maxDate.setHours(0, 0, 0, 0)
        if (checkDate > maxDate) return true
        return false
    }

    const isToday = (date) => {
        if (!date) return false
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    const isDateSelected = (date) => {
        if (!date || !selectedDate) return false
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        )
    }

    const today = new Date()
    const isPrevMonthDisabled =
        currentMonth.getFullYear() === today.getFullYear() &&
        currentMonth.getMonth() === today.getMonth()

    const days = getDaysInMonth(currentMonth)

    const sortedSlots = [...slots].sort((a, b) => {
        const toMins = (slotStr) => {
            const startTimePart = slotStr.slot.split('-')[0].trim()
            const { hours, minutes } = convertTo24Hour(startTimePart)
            return hours * 60 + minutes
        }
        return toMins(a) - toMins(b)
    })

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors"
                style={{ fontSize: "10px", letterSpacing: "0.2em" }}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <ChevronLeft size={16} />
                <span className="uppercase">Back</span>
            </motion.button>

            <motion.h2 
                className="text-black mb-10" 
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                Pick Date & Time
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <motion.div 
                    className="border border-gray-200 p-6 rounded-2xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <motion.button
                            onClick={() => !isPrevMonthDisabled && setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            disabled={isPrevMonthDisabled}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronLeft size={18} />
                        </motion.button>
                        <h3 className="text-black" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <motion.button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronRight size={18} />
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((day) => (
                            <div key={day} className="text-center text-gray-400 text-xs font-medium py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, i) => (
                            <motion.button
                                key={i}
                                onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                                disabled={!date || isDateDisabled(date)}
                                className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all relative
                                    ${!date ? "invisible" : ""}
                                    ${isDateDisabled(date) ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100"}
                                    ${isDateSelected(date) ? "bg-black text-white" : ""}
                                    ${isToday(date) && !isDateSelected(date) ? "border border-black font-semibold" : ""}
                                `}
                                whileHover={!isDateDisabled(date) ? { scale: 1.1 } : {}}
                                whileTap={!isDateDisabled(date) ? { scale: 0.95 } : {}}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                {date?.getDate()}
                                <AnimatePresence>
                                    {isToday(date) && !isDateSelected(date) && (
                                        <motion.span 
                                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Time Slots */}
                <motion.div 
                    className="border border-gray-200 p-6 rounded-2xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-black mb-6 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        <Clock size={16} />
                        Time Slots
                    </h3>

                    <AnimatePresence mode="wait">
                        {!selectedDate ? (
                            <motion.div
                                key="no-date"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex items-center justify-center py-16 text-center"
                            >
                                <div>
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Calendar size={32} className="mx-auto text-gray-200 mb-4" />
                                    </motion.div>
                                    <p className="text-gray-400 text-xs">Please select a date first</p>
                                </div>
                            </motion.div>
                        ) : loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-16"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 size={24} className="text-gray-300" />
                                </motion.div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-16"
                            >
                                <AlertCircle size={32} className="mx-auto text-red-300 mb-4" />
                                <p className="text-red-500 text-xs mb-4">{error}</p>
                                <motion.button
                                    onClick={() => fetchAvailability(selectedDate)}
                                    className="flex items-center gap-2 mx-auto text-xs text-gray-500 hover:text-black border border-gray-200 hover:border-black px-4 py-2 rounded-full transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <RefreshCw size={12} />
                                    Retry
                                </motion.button>
                            </motion.div>
                        ) : closedMessage ? (
                            <motion.div
                                key="closed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-16"
                            >
                                <AlertCircle size={32} className="mx-auto text-amber-300 mb-4" />
                                <p className="text-amber-600 text-xs">{closedMessage}</p>
                            </motion.div>
                        ) : sortedSlots.length === 0 ? (
                            <motion.div
                                key="no-slots"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-16"
                            >
                                <Clock size={32} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 text-xs">No slots available</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="slots"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 gap-3"
                            >
                                {sortedSlots.map((slot, index) => {
                                    const pastSlot = isSlotPast(slot.slot, selectedDate)
                                    const isUnavailable = !slot.available || pastSlot

                                    return (
                                        <motion.button
                                            key={slot.slot}
                                            onClick={() => !isUnavailable && handleSlotSelect(slot.slot)}
                                            disabled={isUnavailable}
                                            title={pastSlot ? "This time has already passed" : slot.reason === 'Booked' ? "Already booked" : ""}
                                            className={`h-12 border rounded-xl transition-all text-xs
                                                ${isUnavailable
                                                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                                                    : data.timeSlot === slot.slot
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-black border-gray-200 hover:border-black"
                                                }`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={!isUnavailable ? { scale: 1.05 } : {}}
                                            whileTap={!isUnavailable ? { scale: 0.95 } : {}}
                                        >
                                            {formatSlot(slot.slot)}
                                        </motion.button>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Next Button */}
            <motion.div 
                className="mt-10 flex justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <motion.button
                    onClick={onNext}
                    disabled={!selectedDate || !data.timeSlot}
                    className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Continue
                </motion.button>
            </motion.div>
        </motion.div>
    )
}
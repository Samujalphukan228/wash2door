// components/booking/DateTimeStep.jsx
"use client"

import { useEffect, useState } from "react"
import { Loader2, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { checkAvailability } from "@/lib/booking.api"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function DateTimeStep({ data, onUpdate, onNext, onBack }) {
    const [selectedDate, setSelectedDate] = useState(data.bookingDate ? new Date(data.bookingDate + 'T12:00:00') : null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [closedMessage, setClosedMessage] = useState("")

    useEffect(() => {
        if (selectedDate) {
            fetchAvailability()
        }
    }, [selectedDate])

    const fetchAvailability = async () => {
        try {
            setLoading(true)
            setError("")
            setClosedMessage("")

            // ✅ FIXED: Create date string from local date parts
            const year = selectedDate.getFullYear()
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const day = String(selectedDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`

            console.log('🖱️ Frontend: Sending date:', dateStr)
            
            const result = await checkAvailability(dateStr)

            console.log('📅 Availability result:', result)

            const availabilityData = result.data || result

            if (availabilityData.isClosed) {
                setClosedMessage(availabilityData.message || "We are closed on this day")
                setSlots([])
            } else if (!availabilityData.isAvailable) {
                setClosedMessage("No available slots for this day")
                setSlots([])
            } else {
                setSlots(availabilityData.slots || [])
            }
        } catch (err) {
            console.error('❌ Availability error:', err)
            setError(err.message || "Failed to check availability")
        } finally {
            setLoading(false)
        }
    }

    const handleDateSelect = (date) => {
        console.log('🖱️ User clicked:', date.toLocaleDateString())

        setSelectedDate(date)
        
        // ✅ FIXED: Create YYYY-MM-DD from local date parts
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        console.log('🖱️ Sending to backend:', dateStr)
        
        onUpdate({
            bookingDate: dateStr,
            timeSlot: "",
        })
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
        
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        
        if (checkDate < today) return true
        
        const maxDate = new Date()
        maxDate.setDate(maxDate.getDate() + 30)
        maxDate.setHours(0, 0, 0, 0)
        
        if (checkDate > maxDate) return true
        
        return false
    }

    const isDateSelected = (date) => {
        if (!date || !selectedDate) return false
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        )
    }

    const days = getDaysInMonth(currentMonth)

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors"
                style={{ fontSize: "10px", letterSpacing: "0.2em" }}
            >
                <ChevronLeft size={16} />
                <span className="uppercase">Back</span>
            </button>

            <h2 className="text-black mb-10" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}>
                Pick Date & Time
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="border border-gray-200 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <h3 className="text-black" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
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
                            <button
                                key={i}
                                onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                                disabled={!date || isDateDisabled(date)}
                                className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                                    ${!date ? "invisible" : ""}
                                    ${isDateDisabled(date) ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100"}
                                    ${isDateSelected(date) ? "bg-black text-white" : ""}`}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Slots */}
                <div className="border border-gray-200 p-6 rounded-2xl">
                    <h3 className="text-black mb-6 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        <Clock size={16} />
                        Time Slots
                    </h3>

                    {!selectedDate ? (
                        <div className="flex items-center justify-center py-16 text-center">
                            <div>
                                <Calendar size={32} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 text-xs">Please select a date first</p>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-gray-300" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <AlertCircle size={32} className="mx-auto text-red-300 mb-4" />
                            <p className="text-red-500 text-xs">{error}</p>
                        </div>
                    ) : closedMessage ? (
                        <div className="text-center py-16">
                            <AlertCircle size={32} className="mx-auto text-amber-300 mb-4" />
                            <p className="text-amber-600 text-xs">{closedMessage}</p>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-16">
                            <Clock size={32} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 text-xs">No slots available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {slots.map((slot) => (
                                <button
                                    key={slot.slot}
                                    onClick={() => slot.available && handleSlotSelect(slot.slot)}
                                    disabled={!slot.available}
                                    className={`h-12 border rounded-xl transition-all text-xs
                                        ${!slot.available ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through" : data.timeSlot === slot.slot ? "bg-black text-white border-black" : "bg-white text-black border-gray-200 hover:border-black"}`}
                                >
                                    {slot.slot}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Next Button */}
            <div className="mt-10 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!selectedDate || !data.timeSlot}
                    className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
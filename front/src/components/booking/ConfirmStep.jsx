// components/booking/ConfirmStep.jsx
"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, AlertCircle, ChevronLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import { createBooking } from "@/lib/booking.api"

export default function ConfirmStep({ data, onBack, onSuccess }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [bookingCode, setBookingCode] = useState("")

    const handleConfirm = async () => {
        try {
            setLoading(true)
            setError("")

            const bookingPayload = {
                serviceId: data.serviceId,
                variantId: data.variantId,
                bookingDate: data.bookingDate,
                timeSlot: data.timeSlot,
                location: {
                    address: data.location.address,
                    city: data.location.city,
                    landmark: data.location.landmark || "",
                },
                specialNotes: data.specialNotes || "",
            }

            const result = await createBooking(bookingPayload)
            setBookingCode(result.bookingCode || result._id)
            setSuccess(true)
            onSuccess?.(result)
        } catch (err) {
            setError(err.message || "Failed to create booking")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} className="text-emerald-600" />
                </div>

                <h2 className="text-black mb-3" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "32px" }}>
                    Booking Confirmed!
                </h2>

                <p className="text-gray-400 mb-8">Your booking code is:</p>

                <div className="inline-block bg-gray-50 border border-gray-200 px-8 py-4 rounded-2xl mb-8">
                    <p className="text-black text-2xl font-mono tracking-wider">{bookingCode}</p>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => router.push("/my-bookings")}
                        className="h-12 px-8 border border-gray-200 text-black rounded-full hover:border-black transition-colors"
                        style={{ fontSize: "10px", letterSpacing: "0.2em" }}
                    >
                        VIEW BOOKINGS
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <span>BACK HOME</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <button
                onClick={onBack}
                disabled={loading}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors disabled:opacity-50"
                style={{ fontSize: "10px", letterSpacing: "0.2em" }}
            >
                <ChevronLeft size={16} />
                <span className="uppercase">Back</span>
            </button>

            <h2 className="text-black mb-10" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}>
                Confirm Booking
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="max-w-2xl space-y-6 mb-8">
                {/* Service Summary */}
                <div className="border border-gray-200 p-6 rounded-2xl">
                    <div className="flex items-start gap-4">
                        {data._ui?.serviceImage && (
                            <img src={data._ui.serviceImage} alt={data._ui.serviceName} className="w-20 h-20 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                            <p className="text-gray-400 text-xs uppercase mb-1">Service</p>
                            <p className="text-black text-lg mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                {data._ui?.serviceName}
                            </p>
                            <p className="text-gray-600 text-sm">
                                {data._ui?.variantName}
                            </p>
                        </div>
                        <p className="text-black text-2xl font-semibold">₹{data._ui?.price?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="border border-gray-200 p-6 rounded-2xl">
                        <p className="text-gray-400 text-xs uppercase mb-3">Date & Time</p>
                        <p className="text-black text-sm mb-2">{new Date(data.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p className="text-black text-sm font-semibold">{data.timeSlot}</p>
                    </div>

                    <div className="border border-gray-200 p-6 rounded-2xl">
                        <p className="text-gray-400 text-xs uppercase mb-3">Location</p>
                        <p className="text-black text-sm">{data.location.address}</p>
                        <p className="text-black text-sm font-semibold">{data.location.city}</p>
                    </div>
                </div>

                {data.specialNotes && (
                    <div className="border border-gray-200 p-6 rounded-2xl">
                        <p className="text-gray-400 text-xs uppercase mb-3">Special Notes</p>
                        <p className="text-gray-600 text-sm">{data.specialNotes}</p>
                    </div>
                )}
            </div>

            {/* Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="h-12 px-10 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={16} />
                            CONFIRM & PAY
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
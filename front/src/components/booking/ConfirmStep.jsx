// components/booking/ConfirmStep.jsx
"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, AlertCircle, ChevronLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createBooking } from "@/lib/booking.api"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
}

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

            console.log('📦 Booking data:', {
                serviceId: data.serviceId,
                bookingDate: data.bookingDate,
                timeSlot: data.timeSlot,
                location: data.location,
                specialNotes: data.specialNotes
            })

            const bookingPayload = {
                serviceId: data.serviceId,
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

    return (
        <AnimatePresence mode="wait">
            {success ? (
                <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                >
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        className="w-20 h-20 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-6"
                    >
                        <motion.div
                            animate={{ scale: [0.8, 1.1, 1] }}
                            transition={{ duration: 0.6 }}
                        >
                            <CheckCircle size={40} className="text-emerald-600" />
                        </motion.div>
                    </motion.div>

                    <motion.h2 
                        className="text-black mb-3"
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "32px" }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Booking Confirmed!
                    </motion.h2>

                    <motion.p 
                        className="text-gray-400 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Your booking code is:
                    </motion.p>

                    <motion.div 
                        className="inline-block bg-gray-50 border border-gray-200 px-8 py-4 rounded-2xl mb-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                    >
                        <p className="text-black text-2xl font-mono tracking-wider">{bookingCode}</p>
                    </motion.div>

                    <motion.div 
                        className="flex gap-4 justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.button
                            onClick={() => router.push("/my-bookings")}
                            className="h-12 px-8 border border-gray-200 text-black rounded-full hover:border-black transition-colors"
                            style={{ fontSize: "10px", letterSpacing: "0.2em" }}
                            whileHover={{ scale: 1.05, borderColor: "#000" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            VIEW BOOKINGS
                        </motion.button>
                        <motion.button
                            onClick={() => router.push("/")}
                            className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>BACK HOME</span>
                            <ArrowRight size={14} />
                        </motion.button>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.button
                        onClick={onBack}
                        disabled={loading}
                        className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors disabled:opacity-50"
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
                        Confirm Booking
                    </motion.h2>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                            >
                                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div 
                        className="max-w-2xl space-y-6 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Service Summary */}
                        <motion.div 
                            className="border border-gray-200 p-6 rounded-2xl"
                            variants={itemVariants}
                            whileHover={{ borderColor: "#000", y: -2 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-start gap-4">
                                {data._ui?.serviceImage && (
                                    <motion.img 
                                        src={data._ui.serviceImage} 
                                        alt={data._ui.serviceName} 
                                        className="w-20 h-20 object-cover rounded-lg"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs uppercase mb-1">Service</p>
                                    <p className="text-black text-lg mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                        {data._ui?.serviceName}
                                    </p>
                                </div>
                                <motion.p 
                                    className="text-black text-2xl font-semibold"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    ₹{data._ui?.price?.toLocaleString('en-IN')}
                                </motion.p>
                            </div>
                        </motion.div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.div 
                                className="border border-gray-200 p-6 rounded-2xl"
                                variants={itemVariants}
                                whileHover={{ borderColor: "#000", y: -2 }}
                            >
                                <p className="text-gray-400 text-xs uppercase mb-3">Date & Time</p>
                                <p className="text-black text-sm mb-2">{new Date(data.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                <p className="text-black text-sm font-semibold">{data.timeSlot}</p>
                            </motion.div>

                            <motion.div 
                                className="border border-gray-200 p-6 rounded-2xl"
                                variants={itemVariants}
                                whileHover={{ borderColor: "#000", y: -2 }}
                            >
                                <p className="text-gray-400 text-xs uppercase mb-3">Location</p>
                                <p className="text-black text-sm">{data.location.address}</p>
                                <p className="text-black text-sm font-semibold">{data.location.city}</p>
                            </motion.div>
                        </div>

                        {data.specialNotes && (
                            <motion.div 
                                className="border border-gray-200 p-6 rounded-2xl"
                                variants={itemVariants}
                                whileHover={{ borderColor: "#000", y: -2 }}
                            >
                                <p className="text-gray-400 text-xs uppercase mb-3">Special Notes</p>
                                <p className="text-gray-600 text-sm">{data.specialNotes}</p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Button */}
                    <motion.div 
                        className="flex justify-end"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <motion.button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="h-12 px-10 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                            style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Loader2 size={16} />
                                    </motion.div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    CONFIRM & PAY
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
// components/booking/ServiceStep.jsx
"use client"

import { useEffect, useState, memo } from "react"
import { Loader2, Star, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getPublicServices } from "@/lib/services.api"

const ServiceCard = memo(function ServiceCard({ service, isSelected, onSelect, index }) {
    const image = service.primaryImage || service.images?.[0]?.url

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => onSelect(service)}
            className={`group text-left border transition-all overflow-hidden rounded-2xl
                 active:scale-[0.98] ${isSelected ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-black"}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
                {image ? (
                    <motion.img
                        src={image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <motion.span 
                            className="text-4xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            📦
                        </motion.span>
                    </div>
                )}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="absolute top-3 right-3 w-7 h-7 bg-black rounded-full flex items-center justify-center"
                        >
                            <motion.svg 
                                width="14" 
                                height="12" 
                                viewBox="0 0 14 12" 
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <path d="M1 6l4 4L13 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-black mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: "16px", fontWeight: 400 }}>
                    {service.name}
                </h3>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {service.shortDescription || service.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-gray-400 text-xs mb-1">Price</p>
                        <motion.p 
                            className="text-black" 
                            style={{ fontFamily: 'Georgia, serif', fontSize: "18px" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                        >
                            ₹{service.finalPrice?.toLocaleString("en-IN")}
                        </motion.p>
                    </div>
                    <div className="flex items-center gap-3">
                        {service.averageRating > 0 && (
                            <motion.div 
                                className="flex items-center gap-1 text-gray-500 text-xs"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.3 }}
                            >
                                <Star size={12} fill="currentColor" />
                                {service.averageRating.toFixed(1)}
                            </motion.div>
                        )}
                        <motion.div
                            className="group-hover:translate-x-1 transition-transform"
                        >
                            <ChevronRight size={16} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.button>
    )
})

export default function ServiceStep({ data, onUpdate, onUpdateUI, onNext }) {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true)
                const result = await getPublicServices()
                setServices(result || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    const handleSelect = (service) => {
        onUpdate({ 
            serviceId: service._id
        })
        onUpdateUI({
            serviceName: service.name,
            serviceImage: service.primaryImage || service.images?.[0]?.url,
            serviceTier: service.tier,
            categoryName: service.category?.name || "",
            price: service.finalPrice || service.price,
            duration: service.duration,
            variantName: '',
        })
        onNext()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 size={32} className="text-gray-300" />
                </motion.div>
            </div>
        )
    }

    if (error) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24"
            >
                <p className="text-red-500 mb-4">{error}</p>
                <motion.button
                    onClick={() => window.location.reload()}
                    className="h-10 px-6 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Try Again
                </motion.button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2 
                className="text-black mb-10" 
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Select a Service
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <ServiceCard
                        key={service._id}
                        service={service}
                        isSelected={data.serviceId === service._id}
                        onSelect={handleSelect}
                        index={index}
                    />
                ))}
            </div>
        </motion.div>
    )
}
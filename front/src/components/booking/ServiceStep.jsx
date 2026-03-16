// components/booking/ServiceStep.jsx
"use client"

import { useEffect, useState, memo } from "react"
import { Loader2, Star, ChevronRight } from "lucide-react"
import { getServices } from "@/lib/booking.api"

const ServiceCard = memo(function ServiceCard({ service, isSelected, onSelect }) {
    const image = service.primaryImage || service.images?.[0]?.url

    return (
        <button
            onClick={() => onSelect(service)}
            className={`group text-left border transition-all overflow-hidden rounded-2xl
                 active:scale-[0.98] ${isSelected ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-black"}`}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <span className="text-4xl">📦</span>
                    </div>
                )}
                {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-black rounded-full flex items-center justify-center">
                        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                            <path d="M1 6l4 4L13 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
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
                        <p className="text-gray-400 text-xs mb-1">Starting from</p>
                        <p className="text-black" style={{ fontFamily: 'Georgia, serif', fontSize: "18px" }}>
                            ₹{service.startingPrice?.toLocaleString("en-IN")}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {service.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                <Star size={12} fill="currentColor" />
                                {service.averageRating.toFixed(1)}
                            </div>
                        )}
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </button>
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
                const result = await getServices()
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
        // Reset variantId when service changes
        onUpdate({ 
            serviceId: service._id,
            variantId: ''  // ← Reset variant
        })
        onUpdateUI({
            serviceName: service.name,
            serviceImage: service.primaryImage || service.images?.[0]?.url,
            serviceTier: service.tier,
            categoryName: service.category?.name || "",
            price: service.startingPrice,
            variantName: '',  // ← Reset
            duration: 0,      // ← Reset
        })
        onNext()  // ← Go to variant step
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-gray-300" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="h-10 px-6 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-black mb-10" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}>
                Select a Service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <ServiceCard
                        key={service._id}
                        service={service}
                        isSelected={data.serviceId === service._id}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        </div>
    )
}
// components/booking/VariantStep.jsx
"use client"

import { useEffect, useState } from "react"
import { Loader2, ChevronLeft, ChevronRight, Clock, Check } from "lucide-react"
import api from "@/lib/api"

export default function VariantStep({ data, onUpdate, onUpdateUI, onNext, onBack }) {
    const [variants, setVariants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchVariants = async () => {
            if (!data.serviceId) return

            try {
                setLoading(true)
                setError("")
                const response = await api.get(`/bookings/pricing/${data.serviceId}`)
                
                const serviceData = response.data?.data || response.data
                setVariants(serviceData?.variants || [])
            } catch (err) {
                console.error('Failed to fetch variants:', err)
                setError(err.message || "Failed to load options")
            } finally {
                setLoading(false)
            }
        }

        fetchVariants()
    }, [data.serviceId])

    const handleSelect = (variant) => {
        onUpdate({ variantId: variant._id })
        onUpdateUI({
            variantName: variant.name,
            price: variant.discountPrice || variant.price,
            duration: variant.duration,
        })
    }

    const selectedVariant = variants.find(v => v._id === data.variantId)

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
                    onClick={onBack}
                    className="h-10 px-6 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

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

            <h2 className="text-black mb-3" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}>
                Select Package
            </h2>
            
            <p className="text-gray-400 mb-10" style={{ fontSize: "14px" }}>
                Choose the option that best fits your needs
            </p>

            {/* Variants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {variants.map((variant) => {
                    const isSelected = data.variantId === variant._id
                    const hasDiscount = variant.discountPrice && variant.discountPrice < variant.price

                    return (
                        <button
                            key={variant._id}
                            onClick={() => handleSelect(variant)}
                            className={`relative text-left p-6 border rounded-2xl transition-all
                                ${isSelected 
                                    ? "border-black ring-2 ring-black bg-gray-50" 
                                    : "border-gray-200 hover:border-black"
                                }`}
                        >
                            {/* Selected Check */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}

                            {/* Variant Image */}
                            {variant.image && (
                                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-100">
                                    <img 
                                        src={variant.image} 
                                        alt={variant.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Name */}
                            <h3 className="text-black mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: "18px" }}>
                                {variant.name}
                            </h3>

                            {/* Description */}
                            {variant.description && (
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                    {variant.description}
                                </p>
                            )}

                            {/* Features */}
                            {variant.features && variant.features.length > 0 && (
                                <ul className="space-y-1 mb-4">
                                    {variant.features.slice(0, 3).map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600 text-xs">
                                            <Check size={12} className="text-emerald-500" />
                                            {feature}
                                        </li>
                                    ))}
                                    {variant.features.length > 3 && (
                                        <li className="text-gray-400 text-xs">
                                            +{variant.features.length - 3} more
                                        </li>
                                    )}
                                </ul>
                            )}

                            {/* Price & Duration */}
                            <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                                <div>
                                    {hasDiscount && (
                                        <p className="text-gray-400 text-sm line-through">
                                            ₹{variant.price?.toLocaleString("en-IN")}
                                        </p>
                                    )}
                                    <p className="text-black" style={{ fontFamily: 'Georgia, serif', fontSize: "22px" }}>
                                        ₹{(variant.discountPrice || variant.price)?.toLocaleString("en-IN")}
                                    </p>
                                </div>
                                
                                {variant.duration && (
                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        <Clock size={12} />
                                        {variant.duration} min
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* No variants message */}
            {variants.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-400">No options available for this service</p>
                </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!data.variantId}
                    className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                >
                    <span>Continue</span>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
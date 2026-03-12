"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ChevronLeft, Clock, Check } from 'lucide-react'
import { getServicePricing } from '@/lib/booking.api'

export default function VariantStep({ data, onUpdate, onUpdateUI, onNext, onBack }) {
    const [pricing, setPricing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (data.serviceId) {
            fetchPricing()
        }
    }, [data.serviceId])

    const fetchPricing = async () => {
        try {
            setLoading(true)
            setError('')
            const result = await getServicePricing(data.serviceId)
            setPricing(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (variant) => {
        // Update main data (for API)
        onUpdate({
            variantId: variant._id,
        })
        
        // Update UI data (for display only)
        onUpdateUI({
            variantName: variant.name,
            price: variant.discountPrice || variant.price,
            duration: variant.duration,
        })
        
        onNext()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-[11px] tracking-[0.15em] uppercase text-red-500 mb-4">
                    {error}
                </p>
                <button
                    onClick={fetchPricing}
                    className="text-[10px] tracking-[0.2em] uppercase text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-300 rounded-[3px]"
                >
                    Try Again
                </button>
            </div>
        )
    }

    const variants = pricing?.variants || []

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
                Back to Services
            </button>

            <div className="text-center mb-10">
                <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                    {pricing?.serviceName}
                </p>
                <h2
                    className="text-2xl md:text-3xl text-black mb-3"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                >
                    Select Option
                </h2>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
                    Choose the option that suits your needs
                </p>
            </div>

            {/* Variants Grid */}
            {variants.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400">
                        No options available for this service
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {variants.map((variant, index) => {
                        const isSelected = data.variantId === variant._id
                        const hasDiscount = variant.discountPrice && variant.discountPrice < variant.price

                        return (
                            <motion.button
                                key={variant._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(variant)}
                                className={`group text-left border transition-all duration-300 overflow-hidden rounded-[5px] ${
                                    isSelected
                                        ? 'border-black ring-2 ring-black'
                                        : 'border-gray-200 hover:border-black'
                                }`}
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden bg-gray-100">
                                    {variant.image ? (
                                        <img
                                            src={variant.image}
                                            alt={variant.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                            <span className="text-4xl">📦</span>
                                        </div>
                                    )}
                                    
                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 w-6 h-6 bg-black rounded-full flex items-center justify-center"
                                        >
                                            <Check size={14} className="text-white" />
                                        </motion.div>
                                    )}
                                    
                                    {/* Discount Badge */}
                                    {hasDiscount && (
                                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-[3px]">
                                            <span className="text-[9px] tracking-[0.1em] uppercase">
                                                Save ₹{variant.price - variant.discountPrice}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3
                                                className="text-[15px] text-black"
                                                style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                                            >
                                                {variant.name}
                                            </h3>
                                            {variant.description && (
                                                <p className="text-[9px] tracking-[0.1em] text-gray-400 mt-1 line-clamp-2">
                                                    {variant.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className="text-[20px] text-black"
                                                style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                                            >
                                                ₹{hasDiscount ? variant.discountPrice : variant.price}
                                            </p>
                                            {hasDiscount && (
                                                <p className="text-[11px] text-gray-400 line-through">
                                                    ₹{variant.price}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4">
                                        <Clock size={12} strokeWidth={1.5} />
                                        <span>{variant.duration} minutes</span>
                                    </div>

                                    {/* Features */}
                                    {variant.features && variant.features.length > 0 && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <ul className="space-y-1">
                                                {variant.features.slice(0, 3).map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-[9px] tracking-[0.1em] uppercase text-gray-500">
                                                        <Check size={10} className="text-green-500" strokeWidth={2} />
                                                        {feature}
                                                    </li>
                                                ))}
                                                {variant.features.length > 3 && (
                                                    <li className="text-[9px] tracking-[0.1em] uppercase text-gray-400">
                                                        +{variant.features.length - 3} more
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            )}
        </motion.div>
    )
}
"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Info } from 'lucide-react'

const inputStyles = {
    base: `
        w-full px-4 py-3 
        border text-[12px] text-black bg-white
        placeholder:text-gray-400
        focus:outline-none focus:border-black 
        transition-colors duration-300 
        rounded-[3px]
    `,
    error: 'border-red-300',
    normal: 'border-gray-200'
}

export default function DetailsStep({ data, onUpdate, onNext, onBack }) {
    const [errors, setErrors] = useState({})

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            onUpdate({
                [parent]: {
                    ...data[parent],
                    [child]: value
                }
            })
        } else {
            onUpdate({ [field]: value })
        }
        
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validate = () => {
        const newErrors = {}

        if (!data.location?.address?.trim()) {
            newErrors['location.address'] = 'Address is required'
        }
        if (!data.location?.city?.trim()) {
            newErrors['location.city'] = 'City is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validate()) {
            onNext()
        }
    }

    const getInputClass = (fieldName) => `
        ${inputStyles.base}
        ${errors[fieldName] ? inputStyles.error : inputStyles.normal}
    `

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
                Back to Date & Time
            </button>

            <div className="text-center mb-10">
                <h2
                    className="text-2xl md:text-3xl text-black mb-3"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                >
                    Service Location
                </h2>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
                    Tell us where to provide the service
                </p>
            </div>

            <div className="max-w-xl mx-auto">
                {/* Location Section */}
                <div className="border border-gray-200 p-6 rounded-[5px] mb-6">
                    <h3
                        className="text-[14px] text-black mb-6 flex items-center gap-2"
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                    >
                        <MapPin size={16} strokeWidth={1.5} />
                        Address Details
                    </h3>

                    <div className="space-y-4">
                        {/* Address */}
                        <div>
                            <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={data.location?.address || ''}
                                onChange={(e) => handleChange('location.address', e.target.value)}
                                placeholder="123 Main Street, Apartment 4B"
                                className={getInputClass('location.address')}
                            />
                            <AnimatePresence>
                                {errors['location.address'] && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-[9px] text-red-500 mt-1"
                                    >
                                        {errors['location.address']}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={data.location?.city || ''}
                                onChange={(e) => handleChange('location.city', e.target.value)}
                                placeholder="Mumbai"
                                className={getInputClass('location.city')}
                            />
                            <AnimatePresence>
                                {errors['location.city'] && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-[9px] text-red-500 mt-1"
                                    >
                                        {errors['location.city']}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Landmark */}
                        <div>
                            <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={data.location?.landmark || ''}
                                onChange={(e) => handleChange('location.landmark', e.target.value)}
                                placeholder="Near City Mall, opposite XYZ Bank"
                                className={`${inputStyles.base} ${inputStyles.normal}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Special Notes */}
                <div className="border border-gray-200 p-6 rounded-[5px]">
                    <h3
                        className="text-[14px] text-black mb-4 flex items-center gap-2"
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                    >
                        <Info size={16} strokeWidth={1.5} />
                        Special Instructions (Optional)
                    </h3>
                    <textarea
                        value={data.specialNotes || ''}
                        onChange={(e) => handleChange('specialNotes', e.target.value)}
                        placeholder="Any specific instructions for our team..."
                        rows={3}
                        maxLength={500}
                        className="
                            w-full px-4 py-3 
                            border border-gray-200 
                            text-[12px] text-black bg-white
                            placeholder:text-gray-400
                            focus:outline-none focus:border-black 
                            transition-colors duration-300 
                            resize-none rounded-[3px]
                        "
                    />
                    <p className="text-[9px] text-gray-400 mt-2 text-right">
                        {(data.specialNotes || '').length}/500
                    </p>
                </div>

                {/* Next Button */}
                <div className="mt-10 flex justify-end">
                    <motion.button
                        onClick={handleNext}
                        whileTap={{ scale: 0.98 }}
                        className="relative flex items-center gap-2 px-8 py-4 bg-black text-white text-[10px] tracking-[0.22em] uppercase overflow-hidden group rounded-[3px]"
                    >
                        <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                        <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                            Review Booking
                        </span>
                        <ChevronRight size={14} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}
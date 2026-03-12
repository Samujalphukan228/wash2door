"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Car, Info } from 'lucide-react'

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV / MUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'bike', label: 'Bike' },
  { value: 'other', label: 'Other' }
]

// ✅ Reusable input styles
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
    if (!data.vehicleDetails?.type) {
      newErrors['vehicleDetails.type'] = 'Vehicle type is required'
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
          Location & Vehicle Details
        </h2>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          Tell us where to come and about your vehicle
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Location Section */}
          <div className="border border-gray-200 p-6 rounded-[5px]">
            <h3
              className="text-[14px] text-black mb-6 flex items-center gap-2"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
            >
              <MapPin size={16} strokeWidth={1.5} />
              Service Location
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

              {/* State */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={data.location?.state || ''}
                  onChange={(e) => handleChange('location.state', e.target.value)}
                  placeholder="Maharashtra"
                  className={`${inputStyles.base} ${inputStyles.normal}`}
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  value={data.location?.landmark || ''}
                  onChange={(e) => handleChange('location.landmark', e.target.value)}
                  placeholder="Near City Mall"
                  className={`${inputStyles.base} ${inputStyles.normal}`}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="border border-gray-200 p-6 rounded-[5px]">
            <h3
              className="text-[14px] text-black mb-6 flex items-center gap-2"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
            >
              <Car size={16} strokeWidth={1.5} />
              Vehicle Information
            </h3>

            <div className="space-y-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Vehicle Type *
                </label>
                <div className="relative">
                  <select
                    value={data.vehicleDetails?.type || ''}
                    onChange={(e) => handleChange('vehicleDetails.type', e.target.value)}
                    className={`
                      w-full px-4 py-3 border text-[12px] text-black bg-white
                      focus:outline-none focus:border-black 
                      transition-colors duration-300 rounded-[3px]
                      cursor-pointer appearance-none pr-10
                      ${errors['vehicleDetails.type'] ? 'border-red-300' : 'border-gray-200'}
                    `}
                  >
                    <option value="" className="text-gray-400">Select type</option>
                    {VEHICLE_TYPES.map((type) => (
                      <option key={type.value} value={type.value} className="text-black">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
                <AnimatePresence>
                  {errors['vehicleDetails.type'] && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[9px] text-red-500 mt-1"
                    >
                      {errors['vehicleDetails.type']}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={data.vehicleDetails?.brand || ''}
                  onChange={(e) => handleChange('vehicleDetails.brand', e.target.value)}
                  placeholder="Honda, Toyota, Maruti..."
                  className={`${inputStyles.base} ${inputStyles.normal}`}
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={data.vehicleDetails?.model || ''}
                  onChange={(e) => handleChange('vehicleDetails.model', e.target.value)}
                  placeholder="City, Fortuner, Swift..."
                  className={`${inputStyles.base} ${inputStyles.normal}`}
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={data.vehicleDetails?.color || ''}
                  onChange={(e) => handleChange('vehicleDetails.color', e.target.value)}
                  placeholder="White, Black, Silver..."
                  className={`${inputStyles.base} ${inputStyles.normal}`}
                />
              </div>

              {/* Plate Number */}
              <div>
                <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={data.vehicleDetails?.plateNumber || ''}
                  onChange={(e) => handleChange('vehicleDetails.plateNumber', e.target.value.toUpperCase())}
                  placeholder="MH 01 AB 1234"
                  className={`${inputStyles.base} ${inputStyles.normal} uppercase`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Special Notes */}
        <div className="mt-8 border border-gray-200 p-6 rounded-[5px]">
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
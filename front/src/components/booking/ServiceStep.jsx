"use client"

import { useEffect, useState } from 'react'
import { Loader2, Star, Clock, ChevronRight } from 'lucide-react'
import { getServices } from '@/lib/booking.api'

const CATEGORY_LABELS = {
  basic: 'Essential',
  standard: 'Standard',
  premium: 'Premium'
}

const CATEGORY_COLORS = {
  basic: 'bg-gray-100 text-gray-600',
  standard: 'bg-blue-100 text-blue-600',
  premium: 'bg-amber-100 text-amber-700'
}

export default function ServiceStep({ data, onUpdate, onNext }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const result = await getServices()
      setServices(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (service) => {
    onUpdate({
      serviceId: service._id,
      serviceName: service.name,
      serviceCategory: service.category,
      serviceImage: service.primaryImage || service.images?.[0]?.url
    })
    onNext()
  }

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory)

  const categories = ['all', 'basic', 'standard', 'premium']

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
          onClick={fetchServices}
          className="text-[10px] tracking-[0.2em] uppercase text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-300"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h2
          className="text-2xl md:text-3xl text-black mb-3"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Choose Your Service
        </h2>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          Select the service that best fits your needs
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 text-[9px] tracking-[0.2em] uppercase border transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:border-black'
            }`}
          >
            {cat === 'all' ? 'All Services' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400">
            No services found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isSelected = data.serviceId === service._id
            const image = service.primaryImage || service.images?.[0]?.url

            return (
              <button
                key={service._id}
                onClick={() => handleSelect(service)}
                className={`group text-left border transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'border-black ring-2 ring-black'
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {image ? (
                    <img
                      src={image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-gray-300">
                        No Image
                      </span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-[8px] tracking-[0.2em] uppercase ${CATEGORY_COLORS[service.category]}`}>
                      {CATEGORY_LABELS[service.category]}
                    </span>
                  </div>
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3
                    className="text-[15px] text-black mb-2"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                  >
                    {service.name}
                  </h3>
                  
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 mb-4 line-clamp-2">
                    {service.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400">
                        Starting from
                      </p>
                      <p
                        className="text-[18px] text-black"
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                      >
                        ₹{service.startingPrice}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {service.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Star size={12} fill="currentColor" />
                          {service.averageRating.toFixed(1)}
                        </div>
                      )}
                      <ChevronRight 
                        size={16} 
                        className={`transition-transform duration-300 ${
                          isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
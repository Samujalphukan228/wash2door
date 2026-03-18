// components/booking/VariantStep.jsx
"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Clock, Check, AlertCircle } from "lucide-react"
import api from "@/lib/api"

function SkeletonCard() {
  return (
    <div className="p-6 border border-gray-100 rounded-2xl animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 rounded w-4/5 mb-6" />
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-6 bg-gray-100 rounded w-20" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
    </div>
  )
}

function VariantCard({ variant, isSelected, onSelect }) {
  const hasDiscount = variant.discountPrice && variant.discountPrice < variant.price
  const displayPrice = variant.discountPrice || variant.price
  const savings = hasDiscount ? variant.price - variant.discountPrice : 0

  return (
    <button
      onClick={() => onSelect(variant)}
      className={`relative text-left p-6 border rounded-2xl transition-all duration-200 w-full ${isSelected ? "border-black ring-2 ring-black bg-gray-50" : "border-gray-200 hover:border-gray-400 hover:shadow-sm"}`}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-black rounded-full flex items-center justify-center">
          <Check size={13} className="text-white" strokeWidth={2.5} />
        </div>
      )}

      {/* Savings badge */}
      {hasDiscount && !isSelected && (
        <div className="absolute top-4 right-4 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="text-emerald-600" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>
            SAVE ₹{savings.toLocaleString("en-IN")}
          </span>
        </div>
      )}

      {/* Name */}
      <h3 className="text-black mb-1.5 pr-8" style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 400 }}>
        {variant.name}
      </h3>

      {/* Description */}
      {variant.description && (
        <p className="text-gray-400 mb-4 line-clamp-2" style={{ fontSize: "13px", lineHeight: "1.6" }}>
          {variant.description}
        </p>
      )}

      {/* Features */}
      {variant.features?.length > 0 && (
        <ul className="space-y-1.5 mb-5">
          {variant.features.slice(0, 3).map((feature, i) => (
            <li key={i} className="flex items-center gap-2" style={{ fontSize: "12px" }}>
              <Check size={11} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
              <span className="text-gray-500">{feature}</span>
            </li>
          ))}
          {variant.features.length > 3 && (
            <li className="text-gray-400 pl-[19px]" style={{ fontSize: "11px" }}>
              +{variant.features.length - 3} more included
            </li>
          )}
        </ul>
      )}

      {/* Price & Duration */}
      <div className="flex items-end justify-between pt-4 border-t border-gray-100">
        <div>
          {hasDiscount && (
            <p className="text-gray-300 line-through" style={{ fontSize: "13px" }}>
              ₹{variant.price?.toLocaleString("en-IN")}
            </p>
          )}
          <p className="text-black leading-none" style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 300 }}>
            ₹{displayPrice?.toLocaleString("en-IN")}
          </p>
        </div>

        {variant.duration && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={12} strokeWidth={1.5} />
            <span style={{ fontSize: "12px" }}>{variant.duration} min</span>
          </div>
        )}
      </div>
    </button>
  )
}

export default function VariantStep({ data, onUpdate, onUpdateUI, onNext, onBack }) {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!data.serviceId) return

    const fetchVariants = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await api.get(`/bookings/pricing/${data.serviceId}`)
        const serviceData = response.data?.data || response.data
        setVariants(serviceData?.variants || [])
      } catch (err) {
        console.error("Failed to fetch variants:", err)
        setError("Failed to load packages. Please try again.")
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

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors duration-200 group"
        style={{ fontSize: "10px", letterSpacing: "0.2em" }}
      >
        <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span className="uppercase">Back</span>
      </button>

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-black mb-2" style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}>
          Select Package
        </h2>
        <p className="text-gray-400" style={{ fontSize: "14px" }}>
          Choose the option that best fits your needs
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <p className="text-gray-500 mb-6" style={{ fontSize: "14px" }}>{error}</p>
          <button
            onClick={onBack}
            className="h-10 px-6 border border-black text-black rounded-full hover:bg-black hover:text-white transition-all duration-200"
            style={{ fontSize: "11px", letterSpacing: "0.15em" }}
          >
            GO BACK
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && variants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 mb-6" style={{ fontSize: "14px" }}>No packages available for this service.</p>
          <button
            onClick={onBack}
            className="h-10 px-6 border border-black text-black rounded-full hover:bg-black hover:text-white transition-all duration-200"
            style={{ fontSize: "11px", letterSpacing: "0.15em" }}
          >
            GO BACK
          </button>
        </div>
      )}

      {/* Variants */}
      {!loading && !error && variants.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {variants.map((variant) => (
              <VariantCard
                key={variant._id}
                variant={variant}
                isSelected={data.variantId === variant._id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Selected summary */}
          {selectedVariant && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl mb-8">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-black truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {selectedVariant.name}
                </p>
              </div>
              <p className="text-black shrink-0" style={{ fontFamily: "Georgia, serif", fontSize: "16px" }}>
                ₹{(selectedVariant.discountPrice || selectedVariant.price)?.toLocaleString("en-IN")}
              </p>
            </div>
          )}

          {/* Continue */}
          <div className="flex justify-end">
            <button
              onClick={onNext}
              disabled={!data.variantId}
              className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 group"
              style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
            >
              <span>CONTINUE</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
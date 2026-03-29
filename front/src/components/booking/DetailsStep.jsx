"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export default function DetailsStep({ data, onUpdate, onNext, onBack }) {
    const handleChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".")
            onUpdate({
                [parent]: {
                    ...data[parent],
                    [child]: value,
                },
            })
        } else {
            onUpdate({ [field]: value })
        }
    }

    const validate = () => {
        if (!data.location?.address?.trim()) {
            alert("Address is required")
            return false
        }
        if (!data.location?.city?.trim()) {
            alert("City is required")
            return false
        }
        if (!data.phone?.trim()) {
            alert("Phone number is required")
            return false
        }
        return true
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors"
                style={{ fontSize: "10px", letterSpacing: "0.2em" }}
            >
                <ChevronLeft size={16} />
                <span className="uppercase">Back</span>
            </motion.button>

            <motion.h2 
                className="text-black mb-10" 
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}
            >
                Service Location
            </motion.h2>

            <div className="max-w-2xl">

                {/* Address Section */}
                <div className="border border-gray-200 p-6 rounded-2xl mb-6">
                    <h3 className="text-black mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        Address Details
                    </h3>

                    <div className="space-y-5">

                        {/* Address */}
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={data.location?.address || ""}
                                onChange={(e) => handleChange("location.address", e.target.value)}
                                placeholder="123 Main Street / Quarter Number"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                City *
                            </label>
                            <input
                                type="text"
                                value={data.location?.city || "Duliajan"}
                                onChange={(e) => handleChange("location.city", e.target.value)}
                                placeholder="Duliajan"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={data.phone || ""}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black"
                            />
                        </div>

                    </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => validate() && onNext()}
                        className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 flex items-center gap-2"
                        style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                    >
                        <span>Review</span>
                        <ChevronRight size={14} />
                    </button>
                </div>

            </div>
        </motion.div>
    )
}
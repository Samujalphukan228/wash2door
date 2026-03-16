// components/booking/DetailsStep.jsx
"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

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
        return true
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

            <h2 className="text-black mb-10" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}>
                Service Location
            </h2>

            <div className="max-w-2xl">
                {/* Address Fields */}
                <div className="border border-gray-200 p-6 rounded-2xl mb-6">
                    <h3 className="text-black mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        Address Details
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={data.location?.address || ""}
                                onChange={(e) => handleChange("location.address", e.target.value)}
                                placeholder="123 Main Street"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                City *
                            </label>
                            <input
                                type="text"
                                value={data.location?.city || ""}
                                onChange={(e) => handleChange("location.city", e.target.value)}
                                placeholder="Mumbai"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={data.location?.landmark || ""}
                                onChange={(e) => handleChange("location.landmark", e.target.value)}
                                placeholder="Near City Mall"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Special Notes */}
                <div className="border border-gray-200 p-6 rounded-2xl mb-8">
                    <h3 className="text-black mb-4" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        Special Instructions (Optional)
                    </h3>
                    <textarea
                        value={data.specialNotes || ""}
                        onChange={(e) => handleChange("specialNotes", e.target.value)}
                        placeholder="Any special requests?"
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors resize-none"
                    />
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => validate() && onNext()}
                        className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
                        style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                    >
                        <span>Review</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
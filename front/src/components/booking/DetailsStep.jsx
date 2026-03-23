// components/booking/DetailsStep.jsx
"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
}

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors"
                style={{ fontSize: "10px", letterSpacing: "0.2em" }}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <ChevronLeft size={16} />
                <span className="uppercase">Back</span>
            </motion.button>

            <motion.h2 
                className="text-black mb-10" 
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(24px, 4vw, 32px)" }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                Service Location
            </motion.h2>

            <motion.div 
                className="max-w-2xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Address Fields */}
                <motion.div 
                    className="border border-gray-200 p-6 rounded-2xl mb-6"
                    variants={itemVariants}
                    whileHover={{ borderColor: "#000", y: -2 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-black mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        Address Details
                    </h3>

                    <div className="space-y-5">
                        <motion.div variants={itemVariants}>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                Street Address *
                            </label>
                            <motion.input
                                type="text"
                                value={data.location?.address || ""}
                                onChange={(e) => handleChange("location.address", e.target.value)}
                                placeholder="123 Main Street"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                City *
                            </label>
                            <motion.input
                                type="text"
                                value={data.location?.city || ""}
                                onChange={(e) => handleChange("location.city", e.target.value)}
                                placeholder="Mumbai"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wide">
                                Landmark (Optional)
                            </label>
                            <motion.input
                                type="text"
                                value={data.location?.landmark || ""}
                                onChange={(e) => handleChange("location.landmark", e.target.value)}
                                placeholder="Near City Mall"
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Special Notes */}
                <motion.div 
                    className="border border-gray-200 p-6 rounded-2xl mb-8"
                    variants={itemVariants}
                    whileHover={{ borderColor: "#000", y: -2 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-black mb-4" style={{ fontFamily: 'Georgia, serif', fontSize: "14px" }}>
                        Special Instructions (Optional)
                    </h3>
                    <motion.textarea
                        value={data.specialNotes || ""}
                        onChange={(e) => handleChange("specialNotes", e.target.value)}
                        placeholder="Any special requests?"
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors resize-none"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    />
                </motion.div>

                {/* Next Button */}
                <motion.div 
                    className="flex justify-end"
                    variants={itemVariants}
                >
                    <motion.button
                        onClick={() => validate() && onNext()}
                        className="h-12 px-8 bg-black text-white rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
                        style={{ fontSize: "10px", letterSpacing: "0.2em", fontWeight: 500 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Review</span>
                        <ChevronRight size={14} />
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
"use client"

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Vehicle' },
  { id: 3, label: 'Date & Time' },
  { id: 4, label: 'Details' },
  { id: 5, label: 'Confirm' }
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep > step.id ? '#000' : '#fff',
                  borderColor: currentStep >= step.id ? '#000' : '#e5e7eb',
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300`}
              >
                {currentStep > step.id ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check size={16} strokeWidth={2} className="text-white" />
                  </motion.div>
                ) : (
                  <span className={`text-[12px] font-medium ${currentStep === step.id ? 'text-black' : 'text-gray-300'}`}>
                    {step.id}
                  </span>
                )}
              </motion.div>
              <span
                className={`mt-2 text-[9px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-black' : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-px bg-gray-200 relative overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-black origin-left"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-black">
            {STEPS.find(s => s.id === currentStep)?.label}
          </span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-black"
          />
        </div>
      </div>
    </div>
  )
}
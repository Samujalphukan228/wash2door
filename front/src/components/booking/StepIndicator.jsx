"use client"

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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep > step.id
                    ? 'bg-black border-black text-white'
                    : currentStep === step.id
                    ? 'bg-white border-black text-black'
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={16} strokeWidth={2} />
                ) : (
                  <span className="text-[12px] font-medium">{step.id}</span>
                )}
              </div>
              <span
                className={`mt-2 text-[9px] tracking-[0.2em] uppercase ${
                  currentStep >= step.id ? 'text-black' : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-px transition-all duration-300 ${
                    currentStep > step.id ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
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
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
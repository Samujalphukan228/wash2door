"use client"

import { useEffect, useRef, memo } from "react"
import { Check } from "lucide-react"

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Vehicle" },
  { id: 3, label: "Date & Time" },
  { id: 4, label: "Details" },
  { id: 5, label: "Confirm" },
]

// ── GSAP Loader ───────────────────────────────────────────
let cachedGsap = null

async function loadGsap() {
  if (!cachedGsap) {
    const { default: gsap } = await import("gsap")
    cachedGsap = gsap
  }
  return cachedGsap
}

const StepIndicator = memo(function StepIndicator({ currentStep }) {
  const mobileProgressRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted) return

        // Animate connector lines
        const connectors = document.querySelectorAll("[data-connector]")
        connectors.forEach((connector, index) => {
          const stepId = index + 1
          gsap.to(connector, {
            scaleX: currentStep > stepId ? 1 : 0,
            duration: 0.4,
            ease: "power3.out",
          })
        })

        // Animate mobile progress
        if (mobileProgressRef.current) {
          gsap.to(mobileProgressRef.current, {
            width: `${(currentStep / STEPS.length) * 100}%`,
            duration: 0.4,
            ease: "power3.out",
          })
        }
      } catch {
        // Fallback - CSS handles it
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [currentStep])

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                           transition-all duration-300
                           ${
                             currentStep > step.id
                               ? "bg-black border-black"
                               : currentStep === step.id
                               ? "bg-white border-black"
                               : "bg-white border-gray-200"
                           }`}
              >
                {currentStep > step.id ? (
                  <Check size={16} strokeWidth={2} className="text-white" />
                ) : (
                  <span
                    className={`transition-colors duration-300 ${
                      currentStep === step.id ? "text-black" : "text-gray-300"
                    }`}
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <span
                className={`mt-2 tracking-wider uppercase transition-colors duration-300 ${
                  currentStep >= step.id ? "text-black" : "text-gray-300"
                }`}
                style={{ fontSize: "9px" }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-px bg-gray-200 relative overflow-hidden">
                  <div
                    data-connector
                    className="absolute inset-0 bg-black origin-left transition-transform duration-400"
                    style={{
                      transform: `scaleX(${currentStep > step.id ? 1 : 0})`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span
            className="tracking-wider uppercase text-gray-400"
            style={{ fontSize: "10px" }}
          >
            Step {currentStep} of {STEPS.length}
          </span>
          <span
            className="tracking-wider uppercase text-black"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            {STEPS.find((s) => s.id === currentStep)?.label}
          </span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            ref={mobileProgressRef}
            className="h-full bg-black rounded-full transition-all duration-400"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
})

export default StepIndicator
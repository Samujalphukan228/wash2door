"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import StepIndicator from '@/components/booking/StepIndicator'
import ServiceStep from '@/components/booking/ServiceStep'
import VehicleStep from '@/components/booking/VehicleStep'
import DateTimeStep from '@/components/booking/DateTimeStep'
import DetailsStep from '@/components/booking/DetailsStep'
import ConfirmStep from '@/components/booking/ConfirmStep'
import { ArrowLeft } from 'lucide-react'

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const INITIAL_DATA = {
  serviceId: '',
  serviceName: '',
  serviceCategory: '',
  serviceImage: '',
  vehicleTypeId: '',
  vehicleType: '',
  vehicleTypeName: '',
  price: 0,
  duration: 0,
  features: [],
  bookingDate: '',
  timeSlot: '',
  location: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
  },
  vehicleDetails: {
    type: '',
    brand: '',
    model: '',
    color: '',
    plateNumber: '',
  },
  specialNotes: '',
}

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Vehicle' },
  { number: 3, label: 'Date & Time' },
  { number: 4, label: 'Details' },
  { number: 5, label: 'Confirm' },
]

// ─────────────────────────────────────────
// STEP INDICATOR (inline — replaces import
// so styling is fully controlled here)
// ─────────────────────────────────────────

function Steps({ current }) {
  return (
    <div className="w-full">
      {/* Mobile: progress bar + label */}
      <div className="flex md:hidden flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className="tracking-[0.3em] uppercase text-white/50"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
          >
            Step {current} of {STEPS.length}
          </span>
          <span
            className="tracking-[0.3em] uppercase text-white/70"
            style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
          >
            {STEPS[current - 1]?.label}
          </span>
        </div>
        <div className="w-full h-px bg-white/10">
          <div
            className="h-px bg-white transition-all duration-500 ease-out"
            style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: step dots */}
      <div className="hidden md:flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = current > step.number
          const active = current === step.number
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    done
                      ? 'bg-white border-white'
                      : active
                      ? 'bg-transparent border-white'
                      : 'bg-transparent border-white/20'
                  }`}
                >
                  {done ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l3.5 3.5L11 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span
                      className={`${active ? 'text-white' : 'text-white/30'}`}
                      style={{ fontFamily: 'Georgia, serif', fontSize: '11px' }}
                    >
                      {step.number}
                    </span>
                  )}
                </div>
                <span
                  className={`tracking-[0.2em] uppercase transition-colors duration-300 ${
                    active ? 'text-white' : done ? 'text-white/60' : 'text-white/20'
                  }`}
                  style={{ fontSize: 'clamp(8px, 1vw, 9px)' }}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-16 xl:w-24 mx-2 mb-6 transition-all duration-500 ${
                    done ? 'bg-white/60' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading: authLoading, openModal } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState(INITIAL_DATA)

  useEffect(() => {
    const serviceId = searchParams.get('service')
    if (serviceId) setBookingData((prev) => ({ ...prev, serviceId }))
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !isAuthenticated && currentStep > 1) openModal('login')
  }, [authLoading, isAuthenticated, currentStep, openModal])

  const updateData = (newData) => setBookingData((prev) => ({ ...prev, ...newData }))

  const goToStep = (step) => {
    if (step > 1 && !isAuthenticated) { openModal('login'); return }
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBookingSuccess = (result) => {
    console.log('Booking successful:', result)
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >

      {/* ── Black header with step indicator ── */}
      <div className="bg-black">
        <div className="max-w-5xl mx-auto px-5 md:px-16">

          {/* Top row */}
          <div className="flex items-center justify-between pt-16 md:pt-20 pb-8 md:pb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="block w-6 h-px bg-white/30 shrink-0" />
                <span
                  className="tracking-[0.4em] uppercase text-white/50"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  Doorstep Service
                </span>
              </div>
              <h1
                className="text-white"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                Book a Service
              </h1>
            </div>

            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 no-underline group"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              <ArrowLeft size={13} strokeWidth={1.5} className="text-white/40 group-hover:text-white transition-colors duration-300" />
              <span className="tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                Back
              </span>
            </button>
          </div>

          {/* Step indicator */}
          <div className="pb-8 md:pb-10">
            <Steps current={currentStep} />
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-16 py-10 md:py-14">
        {currentStep === 1 && (
          <ServiceStep data={bookingData} onUpdate={updateData} onNext={() => goToStep(2)} />
        )}
        {currentStep === 2 && (
          <VehicleStep data={bookingData} onUpdate={updateData} onNext={() => goToStep(3)} onBack={() => goToStep(1)} />
        )}
        {currentStep === 3 && (
          <DateTimeStep data={bookingData} onUpdate={updateData} onNext={() => goToStep(4)} onBack={() => goToStep(2)} />
        )}
        {currentStep === 4 && (
          <DetailsStep data={bookingData} onUpdate={updateData} onNext={() => goToStep(5)} onBack={() => goToStep(3)} />
        )}
        {currentStep === 5 && (
          <ConfirmStep data={bookingData} onBack={() => goToStep(4)} onSuccess={handleBookingSuccess} />
        )}
      </div>
    </div>
  )
}
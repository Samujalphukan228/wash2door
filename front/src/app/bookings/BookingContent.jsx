// app/bookings/BookingContent.jsx
"use client"

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ServiceStep from '@/components/booking/ServiceStep'
import DateTimeStep from '@/components/booking/DateTimeStep'
import DetailsStep from '@/components/booking/DetailsStep'
import ConfirmStep from '@/components/booking/ConfirmStep'
import { ArrowLeft } from 'lucide-react'

const INITIAL_DATA = {
    serviceId: '',
    variantId: '',
    bookingDate: '',
    timeSlot: '',
    location: { address: '', city: '', landmark: '' },
    specialNotes: '',
    _ui: { serviceName: '', serviceImage: '', price: 0 }
}

const STEPS = [
    { number: 1, label: 'Service' },
    { number: 2, label: 'Date & Time' },
    { number: 3, label: 'Location' },
    { number: 4, label: 'Confirm' },
]

function StepIndicator({ current }) {
    return (
        <div className="hidden md:flex items-center gap-0">
            {STEPS.map((step, i) => (
                <div key={step.number} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all
                        ${current > step.number ? 'bg-white border-white' : current === step.number ? 'border-white' : 'border-white/20'}`}>
                        {current > step.number ? (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                <path d="M1 5l3.5 3.5L11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <span className={`${current === step.number ? 'text-white' : 'text-white/30'}`}>{step.number}</span>
                        )}
                    </div>
                    {i < STEPS.length - 1 && <div className={`h-px w-16 xl:w-24 mx-2 mb-6 ${current > step.number ? 'bg-white/60' : 'bg-white/10'}`} />}
                </div>
            ))}
        </div>
    )
}

export default function BookingContent() {
    const router = useRouter()
    const { isAuthenticated, openModal } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)
    const [bookingData, setBookingData] = useState(INITIAL_DATA)

    useEffect(() => {
        if (!isAuthenticated && currentStep > 1) {
            openModal('login')
            setCurrentStep(1)
        }
    }, [isAuthenticated, currentStep, openModal])

    const updateData = (newData) => setBookingData(prev => ({ ...prev, ...newData }))
    const updateUI = (uiData) => setBookingData(prev => ({ ...prev, _ui: { ...prev._ui, ...uiData } }))

    const goToStep = (step) => {
        if (step > 1 && !isAuthenticated) {
            openModal('login')
            return
        }
        setCurrentStep(step)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {/* Black Header */}
            <div className="bg-black">
                <div className="max-w-5xl mx-auto px-5 md:px-16">
                    <div className="flex items-center justify-between pt-16 md:pt-20 pb-8 md:pb-10">
                        <div>
                            <h1 className="text-white" style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: "clamp(1.4rem, 4vw, 2.4rem)", lineHeight: 1.1 }}>
                                Book a Service
                            </h1>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            style={{ fontSize: "11px", letterSpacing: "0.2em" }}
                        >
                            <ArrowLeft size={13} />
                            <span className="uppercase">Back</span>
                        </button>
                    </div>
                    <div className="pb-8 md:pb-10">
                        <StepIndicator current={currentStep} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white">
                <div className="max-w-5xl mx-auto px-5 md:px-16 py-10 md:py-14">
                    {currentStep === 1 && (
                        <ServiceStep
                            data={bookingData}
                            onUpdate={updateData}
                            onUpdateUI={updateUI}
                            onNext={() => goToStep(2)}
                        />
                    )}
                    {currentStep === 2 && (
                        <DateTimeStep
                            data={bookingData}
                            onUpdate={updateData}
                            onNext={() => goToStep(3)}
                            onBack={() => goToStep(1)}
                        />
                    )}
                    {currentStep === 3 && (
                        <DetailsStep
                            data={bookingData}
                            onUpdate={updateData}
                            onNext={() => goToStep(4)}
                            onBack={() => goToStep(2)}
                        />
                    )}
                    {currentStep === 4 && (
                        <ConfirmStep
                            data={bookingData}
                            onBack={() => goToStep(3)}
                            onSuccess={() => router.push('/my-bookings')}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
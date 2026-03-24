// app/bookings/BookingContent.jsx
"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ServiceStep from '@/components/booking/ServiceStep'
import DateTimeStep from '@/components/booking/DateTimeStep'
import DetailsStep from '@/components/booking/DetailsStep'
import ConfirmStep from '@/components/booking/ConfirmStep'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPublicServices } from '@/lib/services.api'

const INITIAL_DATA = {
    serviceId: '',
    bookingDate: '',
    timeSlot: '',
    location: { address: '', city: '', landmark: '' },
    specialNotes: '',
    _ui: {
        serviceName: '',
        serviceImage: '',
        price: 0,
        duration: 0,
        categoryName: '',
        subcategoryName: ''
    }
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
                    <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all
                            ${current > step.number
                                ? 'bg-white border-white'
                                : current === step.number
                                ? 'border-white'
                                : 'border-white/20'}`}
                        animate={{
                            scale: current === step.number ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {current > step.number ? (
                            <motion.svg 
                                width="12" 
                                height="10" 
                                viewBox="0 0 12 10" 
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <path d="M1 5l3.5 3.5L11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                        ) : (
                            <span className={`text-sm ${current === step.number ? 'text-white' : 'text-white/30'}`}>
                                {step.number}
                            </span>
                        )}
                    </motion.div>
                    {i < STEPS.length - 1 && (
                        <motion.div 
                            className={`h-px w-12 xl:w-16 mx-2 ${current > step.number ? 'bg-white/60' : 'bg-white/10'}`}
                            animate={{
                                opacity: current > step.number ? 1 : 0.3,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export default function BookingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const { isAuthenticated, openModal, loading } = useAuth()

    const serviceIdFromUrl = searchParams.get('service')
    const [currentStep, setCurrentStep] = useState(serviceIdFromUrl ? 2 : 1)
    const [bookingData, setBookingData] = useState({
        ...INITIAL_DATA,
        serviceId: serviceIdFromUrl || ''
    })
    const [loadingService, setLoadingService] = useState(false)

    // ✅ Hide footer
    useEffect(() => {
        const footer = document.querySelector("footer")
        if (footer) footer.style.display = "none"
        return () => {
            if (footer) footer.style.display = ""
        }
    }, [])

    useEffect(() => {
        if (serviceIdFromUrl) {
            loadServiceFromUrl(serviceIdFromUrl)
        }
    }, [serviceIdFromUrl])

    const loadServiceFromUrl = async (serviceId) => {
        try {
            setLoadingService(true)
            const services = await getPublicServices()
            const service = services.find(s => s._id === serviceId)

            if (service) {
                setBookingData(prev => ({
                    ...prev,
                    serviceId: service._id,
                    _ui: {
                        serviceName: service.name,
                        serviceImage: service.primaryImage || service.images?.[0]?.url || '',
                        price: service.finalPrice || service.price,
                        duration: service.duration,
                        categoryName: service.category?.name || '',
                        subcategoryName: service.subcategory?.name || ''
                    }
                }))
                setCurrentStep(2)
            }
        } catch (err) {
            console.error('Failed to load service:', err)
        } finally {
            setLoadingService(false)
        }
    }

    useEffect(() => {
        if (!loading && !isAuthenticated && currentStep > 1) {
            openModal('login')
            setCurrentStep(1)
        }
    }, [isAuthenticated, currentStep, openModal, loading])

    const updateData = (newData) =>
        setBookingData(prev => ({ ...prev, ...newData }))

    const updateUI = (uiData) =>
        setBookingData(prev => ({ ...prev, _ui: { ...prev._ui, ...uiData } }))

    const goToStep = (step) => {
        if (step > 1 && !loading && !isAuthenticated) {
            openModal('login')
            return
        }
        setCurrentStep(step)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading || loadingService) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 size={32} className="text-gray-300" />
                </motion.div>
            </div>
        )
    }

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {/* Black Header */}
            <motion.div 
                className="bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-5xl mx-auto px-5 md:px-16">
                    <div className="flex items-center justify-between pt-16 md:pt-20 pb-8 md:pb-10">
                        <div>
                            <motion.h1
                                className="text-white"
                                style={{
                                    fontFamily: 'Georgia, serif',
                                    fontWeight: 300,
                                    fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
                                    lineHeight: 1.1
                                }}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Book a Service
                            </motion.h1>
                            <AnimatePresence>
                                {bookingData._ui?.serviceName && currentStep > 1 && (
                                    <motion.p 
                                        className="text-white/50 text-sm mt-1"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {bookingData._ui.serviceName}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            style={{ fontSize: "11px", letterSpacing: "0.2em" }}
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <ArrowLeft size={13} />
                            <span className="uppercase">Back</span>
                        </motion.button>
                    </div>
                    <motion.div 
                        className="pb-8 md:pb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <StepIndicator current={currentStep} />
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="bg-white">
                <div className="max-w-5xl mx-auto px-5 md:px-16 py-10 md:py-14">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ServiceStep
                                    data={bookingData}
                                    onUpdate={updateData}
                                    onUpdateUI={updateUI}
                                    onNext={() => goToStep(2)}
                                />
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DateTimeStep
                                    data={bookingData}
                                    onUpdate={updateData}
                                    onNext={() => goToStep(3)}
                                    onBack={() => {
                                        if (serviceIdFromUrl) {
                                            router.back()
                                        } else {
                                            goToStep(1)
                                        }
                                    }}
                                />
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DetailsStep
                                    data={bookingData}
                                    onUpdate={updateData}
                                    onNext={() => goToStep(4)}
                                    onBack={() => goToStep(2)}
                                />
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div
                                key="step-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ConfirmStep
                                    data={bookingData}
                                    onBack={() => goToStep(3)}
                                    onSuccess={() => router.push('/my-bookings')}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
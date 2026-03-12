"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight, CalendarCheck, Car, MapPin, Sparkles } from 'lucide-react'

const STEPS = [
    {
        icon: Car,
        number: '01',
        title: 'Choose Service',
        description: 'Select from our range of professional cleaning services tailored to your needs.',
    },
    {
        icon: MapPin,
        number: '02',
        title: 'Enter Location',
        description: 'Tell us where you are. We come to your doorstep — home, office, or anywhere.',
    },
    {
        icon: CalendarCheck,
        number: '03',
        title: 'Pick Date & Time',
        description: 'Choose a slot that works for you. We offer flexible scheduling 7 days a week.',
    },
    {
        icon: Sparkles,
        number: '04',
        title: 'We Handle the Rest',
        description: 'Sit back and relax. Our experts arrive on time and deliver a spotless finish.',
    },
]

// ── Step Card (same design everywhere) ──
function StepCard({ step, index, isActive = false, className = '' }) {
    const Icon = step.icon

    return (
        <div
            className={`relative overflow-hidden border rounded-[5px] transition-all duration-500
                       bg-white group
                       ${isActive
                    ? 'border-black shadow-[0_8px_30px_rgba(0,0,0,0.1)]'
                    : 'border-gray-200 hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]'
                } ${className}`}
        >
            {/* Black header */}
            <div className="relative h-36 bg-black overflow-hidden flex items-end">
                {/* Ghost number */}
                <span
                    className="absolute -top-6 -right-3 text-white/[0.06] select-none
                               pointer-events-none"
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: '160px',
                        fontWeight: 300,
                        lineHeight: 1,
                    }}
                >
                    {step.number}
                </span>

                {/* Content */}
                <div className="relative z-10 p-5 flex items-end justify-between w-full">
                    <div>
                        <span
                            className="tracking-[0.3em] uppercase text-white/30 block mb-2"
                            style={{ fontSize: '9px' }}
                        >
                            Step {step.number}
                        </span>
                        <h3
                            className="text-white"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: '22px',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.15,
                            }}
                        >
                            {step.title}
                        </h3>
                    </div>

                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center
                                    justify-center shrink-0 bg-white/5 backdrop-blur-sm">
                        <Icon size={20} strokeWidth={1.3} className="text-white" />
                    </div>
                </div>
            </div>

            {/* White content */}
            <div className="p-5">
                <p
                    className="text-gray-400 leading-[1.7] mb-4"
                    style={{ fontSize: '12px', letterSpacing: '0.03em' }}
                >
                    {step.description}
                </p>

                {/* Progress dots */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i === index
                                        ? 'w-5 bg-black'
                                        : 'w-1 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <span
                        className="tracking-[0.2em] uppercase text-gray-300"
                        style={{ fontSize: '9px' }}
                    >
                        {step.number} / 04
                    </span>
                </div>
            </div>
        </div>
    )
}

// ── Mobile Scroll ──
function MobileStepsScroll() {
    const scrollRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft
            const cardWidth = container.offsetWidth * 0.82
            const gap = 12
            const newIndex = Math.round(scrollLeft / (cardWidth + gap))
            setActiveIndex(Math.min(newIndex, STEPS.length - 1))
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!scrollRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(scrollRef.current,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: { trigger: scrollRef.current, start: 'top 88%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <div className="md:hidden -mx-5">
            <div
                ref={scrollRef}
                className="opacity-0 flex gap-3 overflow-x-auto snap-x snap-mandatory
                           px-5 pb-4 scrollbar-hide"
                style={{ scrollPaddingLeft: '20px' }}
            >
                {STEPS.map((step, i) => (
                    <div key={step.number} className="shrink-0 w-[82vw] snap-center">
                        <StepCard
                            step={step}
                            index={i}
                            isActive={i === activeIndex}
                        />
                    </div>
                ))}
                <div className="shrink-0 w-3" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-3 px-5">
                <ArrowRight size={10} strokeWidth={1.5} className="text-gray-300" />
                <span
                    className="tracking-[0.25em] uppercase text-gray-300"
                    style={{ fontSize: '8px' }}
                >
                    Swipe to explore
                </span>
            </div>
        </div>
    )
}

// ── Desktop Grid ──
function DesktopStepsGrid() {
    const gridRef = useRef(null)

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!gridRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(
                    gridRef.current.children,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 0.8, stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: gridRef.current, start: 'top 86%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <div
            ref={gridRef}
            className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
            {STEPS.map((step, i) => (
                <div key={step.number} className="opacity-0">
                    <StepCard step={step} index={i} />
                </div>
            ))}
        </div>
    )
}

// ── Main ──
export default function HowItWorks() {
    const eyebrowRef = useRef(null)
    const headingRef = useRef(null)
    const descRef = useRef(null)
    const ctaRef = useRef(null)

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            const trigger = headingRef.current
            if (!trigger) return
            ctx = gsap.context(() => {
                const tl = gsap.timeline({
                    scrollTrigger: { trigger, start: 'top 85%' },
                    defaults: { ease: 'power3.out' },
                })
                tl.fromTo(eyebrowRef.current,
                    { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
                    .fromTo(headingRef.current,
                        { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
                    .fromTo(descRef.current,
                        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!ctaRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(ctaRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
                        scrollTrigger: { trigger: ctaRef.current, start: 'top 92%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <section
            className="w-full bg-white py-16 md:py-32"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            <div className="max-w-6xl mx-auto px-5 md:px-16">

                {/* ── Heading ── */}
                <div className="mb-10 md:mb-16">
                    <div ref={eyebrowRef}
                        className="flex items-center gap-3 mb-4 md:mb-6 opacity-0">
                        <span className="block w-8 h-px bg-black shrink-0" />
                        <span
                            className="tracking-[0.4em] uppercase text-gray-400"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontSize: 'clamp(8px, 0.8vw, 9px)',
                            }}
                        >
                            Simple Process
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between
                                    gap-5 md:gap-6">
                        <div className="flex-1">
                            <h2
                                ref={headingRef}
                                className="opacity-0 text-black mb-3 md:mb-5"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: 'clamp(1.8rem, 4vw, 3.8rem)',
                                    lineHeight: 1.08,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                How It Works
                            </h2>
                            <p
                                ref={descRef}
                                className="opacity-0 tracking-[0.18em] leading-[1.9] uppercase
                                           text-gray-400 max-w-md"
                                style={{ fontSize: 'clamp(9px, 0.9vw, 11px)' }}
                            >
                                Book a professional car wash in under 2 minutes —
                                <br className="hidden md:block" />
                                we handle everything else.
                            </p>
                        </div>

                        <a
                            href="/bookings"
                            className="hidden md:flex items-center gap-3 group mb-2"
                        >
                            <span
                                className="tracking-[0.28em] uppercase text-gray-400
                                           group-hover:text-black transition-colors duration-300"
                                style={{ fontSize: 'clamp(7px, 0.8vw, 9px)' }}
                            >
                                Get Started
                            </span>
                            <div className="w-8 h-8 rounded-full border border-gray-200
                                            group-hover:border-black group-hover:bg-black
                                            flex items-center justify-center
                                            transition-all duration-300">
                                <ArrowUpRight
                                    size={12}
                                    strokeWidth={1.5}
                                    className="text-gray-400 group-hover:text-white
                                               transition-colors duration-300"
                                />
                            </div>
                        </a>
                    </div>
                </div>

                {/* ═══ Mobile: Scroll ═══ */}
                <MobileStepsScroll />

                {/* ═══ Desktop: Grid ═══ */}
                <DesktopStepsGrid />

                {/* ── Mobile CTA ── */}
                <div ref={ctaRef} className="opacity-0 mt-8 flex md:hidden">
                    <a
                        href="/bookings"
                        className="relative flex items-center justify-center gap-2.5
                                   tracking-[0.22em] uppercase text-white bg-black
                                   border border-black px-8 py-4 no-underline
                                   overflow-hidden group rounded-[5px] min-h-[52px] w-full
                                   active:scale-[0.98] transition-all duration-200"
                        style={{ fontSize: 'clamp(9px, 2.4vw, 10px)' }}
                    >
                        <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                         group-hover:scale-y-100 transition-transform
                                         duration-500 ease-out" />
                        <span className="relative z-10 group-hover:text-black
                                         transition-colors duration-500">
                            Book Now
                        </span>
                        <ArrowUpRight
                            size={13}
                            strokeWidth={1.5}
                            className="relative z-10 group-hover:text-black
                                       transition-colors duration-500"
                        />
                    </a>
                </div>

            </div>
        </section>
    )
}
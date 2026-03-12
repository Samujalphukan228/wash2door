"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, ArrowUpRight } from 'lucide-react'

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Rahul Sharma',
        location: 'Mumbai',
        rating: 5,
        text: 'Absolutely fantastic service! They arrived on time, were extremely professional, and my car looks brand new. Will definitely book again.',
        service: 'Premium Wash',
    },
    {
        id: 2,
        name: 'Priya Patel',
        location: 'Delhi',
        rating: 5,
        text: 'So convenient to have them come to my office parking. No more wasting weekends at the car wash. The quality is top-notch every single time.',
        service: 'Standard Wash',
    },
    {
        id: 3,
        name: 'Amit Kumar',
        location: 'Bangalore',
        rating: 5,
        text: 'I was skeptical at first, but these guys exceeded all my expectations. My SUV has never looked this clean. Highly recommend their premium package.',
        service: 'Premium Wash',
    },
    {
        id: 4,
        name: 'Sneha Reddy',
        location: 'Hyderabad',
        rating: 5,
        text: 'The booking process was so simple and the team was very courteous. They even cleaned spots I did not notice. Great attention to detail!',
        service: 'Basic Wash',
    },
    {
        id: 5,
        name: 'Vikram Singh',
        location: 'Pune',
        rating: 5,
        text: 'Finally a car wash service that respects your time. They came exactly when they said they would. My car is spotless. Five stars!',
        service: 'Standard Wash',
    },
]

function StarRating({ rating }) {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={11}
                    strokeWidth={0}
                    fill={i < rating ? '#000' : '#E5E5E5'}
                />
            ))}
        </div>
    )
}

// ── Mobile Card ──
function MobileTestimonialCard({ testimonial, index, isActive }) {
    return (
        <div
            className={`shrink-0 w-[85vw] snap-center transition-all duration-500
                       ${isActive
                    ? 'opacity-100 scale-100'
                    : 'opacity-60 scale-[0.97]'
                }`}
        >
            <div className="relative overflow-hidden rounded-[5px] border border-gray-200 bg-white">
                {/* Black header */}
                <div className="relative bg-black px-5 pt-5 pb-6 overflow-hidden">
                    {/* Ghost quote */}
                    <Quote
                        size={120}
                        strokeWidth={0.5}
                        className="absolute -top-4 -right-4 text-white/[0.04] rotate-180"
                    />

                    {/* Ghost number */}
                    <span
                        className="absolute bottom-2 right-4 text-white/[0.06] select-none
                                   pointer-events-none"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: '80px',
                            fontWeight: 300,
                            lineHeight: 1,
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="relative z-10">
                        {/* Rating */}
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={11}
                                    strokeWidth={0}
                                    fill={i < testimonial.rating ? '#fff' : 'rgba(255,255,255,0.15)'}
                                />
                            ))}
                        </div>

                        {/* Quote text */}
                        <p
                            className="text-white/90 leading-[1.7] line-clamp-4"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: '14px',
                                letterSpacing: '0.01em',
                            }}
                        >
                            &ldquo;{testimonial.text}&rdquo;
                        </p>
                    </div>
                </div>

                {/* Author */}
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center
                                        justify-center shrink-0">
                            <span
                                className="text-white"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontSize: '14px',
                                    fontWeight: 300,
                                }}
                            >
                                {testimonial.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <span
                                className="text-black block"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 400,
                                    fontSize: '13px',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {testimonial.name}
                            </span>
                            <span
                                className="tracking-[0.15em] uppercase text-gray-400 mt-0.5 block"
                                style={{ fontSize: '9px' }}
                            >
                                {testimonial.location}
                            </span>
                        </div>
                    </div>

                    <span
                        className="tracking-[0.15em] uppercase text-gray-300 border border-gray-200
                                   px-2.5 py-1 rounded-[3px]"
                        style={{ fontSize: '8px' }}
                    >
                        {testimonial.service}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ── Mobile Scroll ──
function MobileTestimonialsScroll() {
    const scrollRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft
            const cardWidth = container.offsetWidth * 0.85
            const gap = 12
            const newIndex = Math.round(scrollLeft / (cardWidth + gap))
            setActiveIndex(Math.min(newIndex, TESTIMONIALS.length - 1))
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

    const scrollTo = (dir) => {
        const container = scrollRef.current
        if (!container) return
        const cardWidth = container.offsetWidth * 0.85 + 12
        container.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
    }

    return (
        <div className="md:hidden">
            {/* Cards */}
            <div className="-mx-5">
                <div
                    ref={scrollRef}
                    className="opacity-0 flex gap-3 overflow-x-auto snap-x snap-mandatory
                               px-5 pb-4 scrollbar-hide"
                    style={{ scrollPaddingLeft: '20px' }}
                >
                    {TESTIMONIALS.map((t, i) => (
                        <MobileTestimonialCard
                            key={t.id}
                            testimonial={t}
                            index={i}
                            isActive={i === activeIndex}
                        />
                    ))}
                    <div className="shrink-0 w-3" />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-5 px-1">
                {/* Dots */}
                <div className="flex gap-1.5">
                    {TESTIMONIALS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex
                                    ? 'w-5 bg-black'
                                    : 'w-1 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Arrows */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scrollTo(-1)}
                        className="w-10 h-10 border border-gray-200 flex items-center justify-center
                                   rounded-[3px] active:bg-black active:text-white active:border-black
                                   transition-all duration-200"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => scrollTo(1)}
                        className="w-10 h-10 border border-gray-200 flex items-center justify-center
                                   rounded-[3px] active:bg-black active:text-white active:border-black
                                   transition-all duration-200"
                        aria-label="Next"
                    >
                        <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Desktop Slider ──
function DesktopTestimonialsSlider() {
    const containerRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const slideRef = useRef(null)

    const animateSlide = useCallback(async (newIndex, dir) => {
        const { default: gsap } = await import('gsap')
        if (!slideRef.current) return

        await gsap.to(slideRef.current, {
            opacity: 0,
            x: dir * -60,
            duration: 0.25,
            ease: 'power2.in',
        })

        setCurrentIndex(newIndex)

        gsap.fromTo(slideRef.current,
            { opacity: 0, x: dir * 60 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
        )
    }, [])

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return
        const interval = setInterval(() => {
            const next = (currentIndex + 1) % TESTIMONIALS.length
            animateSlide(next, 1)
        }, 5000)
        return () => clearInterval(interval)
    }, [isAutoPlaying, currentIndex, animateSlide])

    const goToPrev = () => {
        setIsAutoPlaying(false)
        const prev = currentIndex === 0 ? TESTIMONIALS.length - 1 : currentIndex - 1
        animateSlide(prev, -1)
    }

    const goToNext = () => {
        setIsAutoPlaying(false)
        const next = (currentIndex + 1) % TESTIMONIALS.length
        animateSlide(next, 1)
    }

    const goToSlide = (index) => {
        setIsAutoPlaying(false)
        const dir = index > currentIndex ? 1 : -1
        animateSlide(index, dir)
    }

    // Entrance animation
    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!containerRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(containerRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                        scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    const testimonial = TESTIMONIALS[currentIndex]

    return (
        <div ref={containerRef} className="hidden md:block opacity-0">
            <div className="grid grid-cols-12 gap-8 lg:gap-12">

                {/* Left: Big quote area */}
                <div className="col-span-7 relative">
                    <div
                        ref={slideRef}
                        className="relative border border-gray-200 rounded-[5px] overflow-hidden
                                   hover:border-black transition-colors duration-500"
                    >
                        {/* Black header */}
                        <div className="relative bg-black px-8 pt-8 pb-10 overflow-hidden">
                            {/* Ghost quote */}
                            <Quote
                                size={200}
                                strokeWidth={0.3}
                                className="absolute -top-8 -right-8 text-white/[0.03] rotate-180"
                            />

                            {/* Ghost number */}
                            <span
                                className="absolute bottom-3 right-6 text-white/[0.05] select-none
                                           pointer-events-none"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontSize: '120px',
                                    fontWeight: 300,
                                    lineHeight: 1,
                                }}
                            >
                                {String(currentIndex + 1).padStart(2, '0')}
                            </span>

                            <div className="relative z-10">
                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={13}
                                            strokeWidth={0}
                                            fill={i < testimonial.rating
                                                ? '#fff'
                                                : 'rgba(255,255,255,0.15)'}
                                        />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p
                                    className="text-white/90 leading-[1.8]"
                                    style={{
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontWeight: 300,
                                        fontSize: 'clamp(16px, 1.6vw, 20px)',
                                        letterSpacing: '0.01em',
                                    }}
                                >
                                    &ldquo;{testimonial.text}&rdquo;
                                </p>
                            </div>
                        </div>

                        {/* Author bar */}
                        <div className="p-6 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-black flex items-center
                                                justify-center shrink-0">
                                    <span
                                        className="text-white"
                                        style={{
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            fontSize: '15px',
                                            fontWeight: 300,
                                        }}
                                    >
                                        {testimonial.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className="text-black block"
                                        style={{
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            fontWeight: 400,
                                            fontSize: '14px',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {testimonial.name}
                                    </span>
                                    <span
                                        className="tracking-[0.2em] uppercase text-gray-400 mt-0.5 block"
                                        style={{ fontSize: '9px' }}
                                    >
                                        {testimonial.location}
                                    </span>
                                </div>
                            </div>

                            <span
                                className="tracking-[0.2em] uppercase text-gray-400 border border-gray-200
                                           px-3 py-1.5 rounded-[3px]"
                                style={{ fontSize: '9px' }}
                            >
                                {testimonial.service}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Navigation + stats */}
                <div className="col-span-5 flex flex-col justify-between py-2">

                    {/* Stats */}
                    <div>
                        <span
                            className="text-black block"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontSize: '64px',
                                fontWeight: 300,
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            5.0
                        </span>
                        <div className="flex gap-1 mt-3 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} strokeWidth={0} fill="#000" />
                            ))}
                        </div>
                        <p
                            className="tracking-[0.2em] uppercase text-gray-400"
                            style={{ fontSize: '10px' }}
                        >
                            Average from {TESTIMONIALS.length} reviews
                        </p>

                        <div className="w-8 h-px bg-gray-200 mt-6 mb-6" />

                        {/* Testimonial list */}
                        <div className="space-y-0">
                            {TESTIMONIALS.map((t, i) => (
                                <button
                                    key={t.id}
                                    onClick={() => goToSlide(i)}
                                    className={`w-full text-left py-3 border-b border-gray-100
                                               last:border-0 flex items-center justify-between
                                               group transition-all duration-300 ${i === currentIndex
                                            ? 'opacity-100'
                                            : 'opacity-40 hover:opacity-70'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-full flex items-center
                                                        justify-center shrink-0 transition-all
                                                        duration-300 ${i === currentIndex
                                                ? 'bg-black'
                                                : 'border border-gray-200'
                                            }`}>
                                            <span
                                                className={`transition-colors duration-300 ${i === currentIndex
                                                        ? 'text-white'
                                                        : 'text-gray-400'
                                                    }`}
                                                style={{
                                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                                    fontSize: '10px',
                                                    fontWeight: 300,
                                                }}
                                            >
                                                {t.name.charAt(0)}
                                            </span>
                                        </div>
                                        <span
                                            className="text-black"
                                            style={{
                                                fontFamily: 'Georgia, "Times New Roman", serif',
                                                fontSize: '12px',
                                                fontWeight: 400,
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            {t.name}
                                        </span>
                                    </div>

                                    <span
                                        className="tracking-[0.15em] uppercase text-gray-300"
                                        style={{ fontSize: '8px' }}
                                    >
                                        {t.location}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation arrows */}
                    <div className="flex items-center justify-between mt-8">
                        <div className="flex gap-2">
                            <button
                                onClick={goToPrev}
                                className="w-10 h-10 border border-gray-200 flex items-center
                                           justify-center rounded-[3px] hover:border-black
                                           hover:bg-black hover:text-white
                                           transition-all duration-300"
                                aria-label="Previous"
                            >
                                <ChevronLeft size={16} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={goToNext}
                                className="w-10 h-10 border border-gray-200 flex items-center
                                           justify-center rounded-[3px] hover:border-black
                                           hover:bg-black hover:text-white
                                           transition-all duration-300"
                                aria-label="Next"
                            >
                                <ChevronRight size={16} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Counter */}
                        <span
                            className="tracking-[0.2em] uppercase text-gray-300"
                            style={{ fontSize: '10px' }}
                        >
                            {String(currentIndex + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Main ──
export default function Testimonials() {
    const eyebrowRef = useRef(null)
    const headingRef = useRef(null)
    const descRef = useRef(null)

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
                            Testimonials
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between
                                    gap-5 md:gap-6">
                        <div className="flex-1">
                            <h2
                                ref={headingRef}
                                className="opacity-0 text-black mb-3 md:mb-4"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: 'clamp(1.8rem, 4vw, 3.8rem)',
                                    lineHeight: 1.08,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                What Our Customers Say
                            </h2>
                            <p
                                ref={descRef}
                                className="opacity-0 tracking-[0.18em] leading-[1.9] uppercase
                                           text-gray-400 max-w-md"
                                style={{ fontSize: 'clamp(9px, 0.9vw, 11px)' }}
                            >
                                Real reviews from real customers who trust us
                                <br className="hidden md:block" />
                                with their vehicles every week.
                            </p>
                        </div>

                        {/* Desktop CTA */}
                        <a
                            href="/bookings"
                            className="hidden md:flex items-center gap-3 group mb-2"
                        >
                            <span
                                className="tracking-[0.28em] uppercase text-gray-400
                                           group-hover:text-black transition-colors duration-300"
                                style={{ fontSize: 'clamp(7px, 0.8vw, 9px)' }}
                            >
                                Book Now
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

                {/* ═══ Mobile ═══ */}
                <MobileTestimonialsScroll />

                {/* ═══ Desktop ═══ */}
                <DesktopTestimonialsSlider />

            </div>
        </section>
    )
}
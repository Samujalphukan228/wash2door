"use client"

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, CheckCircle, Clock, Tag, ChevronDown } from 'lucide-react'
import { getPublicServices, getCategories } from '@/lib/services.api'

// ── Skeleton ──
function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            {/* Image skeleton */}
            <div className="aspect-[16/10] sm:aspect-[4/3] bg-gray-100 animate-pulse" />
            {/* Content skeleton */}
            <div className="p-5 sm:p-6 space-y-4">
                <div className="h-3 w-24 bg-gray-100 animate-pulse rounded-full" />
                <div className="h-7 w-44 bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
                <div className="space-y-2.5 pt-2">
                    <div className="h-3 w-40 bg-gray-100 animate-pulse rounded" />
                    <div className="h-3 w-36 bg-gray-100 animate-pulse rounded" />
                </div>
                <div className="h-12 w-full bg-gray-100 animate-pulse rounded-lg mt-4" />
            </div>
        </div>
    )
}

function SkeletonSection() {
    return (
        <div className="py-12 md:py-20 border-b border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                <div className="aspect-[4/3] bg-gray-100 animate-pulse rounded-xl" />
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                    <div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
                    <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
                    <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
                    <div className="space-y-3 mt-4">
                        <div className="h-3 w-48 bg-gray-100 animate-pulse rounded" />
                        <div className="h-3 w-40 bg-gray-100 animate-pulse rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Empty State ──
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 md:py-20 px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 border border-gray-200 rounded-full flex items-center justify-center mb-6 bg-gray-50">
                <span className="text-2xl md:text-3xl">🧹</span>
            </div>
            <h3
                className="text-black mb-3 text-center"
                style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(16px, 2vw, 20px)',
                }}
            >
                No Services Found
            </h3>
            <p
                className="tracking-[0.2em] uppercase text-gray-400 text-center max-w-xs leading-[1.9] mb-8"
                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
            >
                No services available in this category yet.<br />
                Please check back soon.
            </p>
            <a
                href="/services"
                className="relative tracking-[0.22em] uppercase text-black border border-black
                           px-7 py-3.5 no-underline overflow-hidden group rounded-lg"
                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
            >
                <span className="absolute inset-0 bg-black transform origin-bottom scale-y-0
                                 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    View All Categories
                </span>
            </a>
        </div>
    )
}

// ── Mobile Service Card ──
function MobileServiceCard({ service, index }) {
    const cardRef = useRef(null)
    const [showVariants, setShowVariants] = useState(false)

    const image = service.primaryImage || service.images?.[0]?.url
    const categoryName = service.category?.name || ''
    const categoryIcon = service.category?.icon || ''

    const activeVariants = service.variants
        ? service.variants.filter(v => v.isActive !== false)
        : []

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!cardRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(
                    cardRef.current,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                        scrollTrigger: { trigger: cardRef.current, start: 'top 88%' }
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <div
            ref={cardRef}
            className="opacity-0 bg-white rounded-xl overflow-hidden border border-gray-100
                       shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            {/* Image */}
            <div className="relative">
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    {image ? (
                        <img
                            src={image}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <span className="text-4xl">{categoryIcon || '📦'}</span>
                        </div>
                    )}
                </div>

                {/* Floating badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                        className="bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-md"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontWeight: 300,
                            fontSize: '10px',
                            letterSpacing: '0.2em',
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    {service.tier && (
                        <span
                            className="bg-white/90 backdrop-blur-md text-black px-2.5 py-1 rounded-md
                                       tracking-[0.15em] uppercase"
                            style={{ fontSize: '9px' }}
                        >
                            {service.tier}
                        </span>
                    )}
                </div>

                {/* Price badge */}
                <div className="absolute bottom-3 right-3">
                    <span
                        className="bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-md"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontWeight: 300,
                            fontSize: '14px',
                        }}
                    >
                        ₹{service.startingPrice?.toLocaleString('en-IN') || 0}+
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span
                        className="tracking-[0.3em] uppercase text-gray-400"
                        style={{ fontSize: '9px' }}
                    >
                        {categoryIcon} {categoryName}
                    </span>
                </div>

                {/* Title */}
                <h3
                    className="text-black mb-2.5"
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 400,
                        fontSize: '20px',
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                    }}
                >
                    {service.name}
                </h3>

                {/* Description */}
                <p
                    className="tracking-[0.1em] leading-[1.8] text-gray-400 mb-4 line-clamp-3"
                    style={{ fontSize: '11px' }}
                >
                    {service.description || service.shortDescription}
                </p>

                {/* Highlights */}
                {(service.highlights?.length > 0 || service.includes?.length > 0) && (
                    <div className="flex flex-col gap-2 mb-4">
                        {(service.highlights || service.includes || []).slice(0, 3).map((f, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <CheckCircle size={12} strokeWidth={1.5} className="text-green-600 shrink-0 mt-0.5" />
                                <span
                                    className="tracking-[0.1em] text-gray-600 leading-[1.6]"
                                    style={{ fontSize: '11px' }}
                                >
                                    {f}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Variants toggle */}
                {activeVariants.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowVariants(!showVariants)}
                            className="flex items-center justify-between w-full py-2.5 text-left"
                        >
                            <span
                                className="tracking-[0.2em] uppercase text-gray-400"
                                style={{ fontSize: '9px' }}
                            >
                                {activeVariants.length} Option{activeVariants.length > 1 ? 's' : ''} Available
                            </span>
                            <ChevronDown
                                size={14}
                                strokeWidth={1.5}
                                className={`text-gray-400 transition-transform duration-300 ${
                                    showVariants ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        <div
                            className={`grid gap-2.5 overflow-hidden transition-all duration-400 ease-out ${
                                showVariants ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                            }`}
                        >
                            {activeVariants.map((variant) => (
                                <div
                                    key={variant._id}
                                    className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg"
                                >
                                    <p
                                        className="text-black mb-1.5"
                                        style={{
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            fontWeight: 400,
                                            fontSize: '13px',
                                        }}
                                    >
                                        {variant.name}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <Tag size={10} strokeWidth={1.5} className="text-gray-400" />
                                            <span
                                                className="tracking-[0.15em] text-gray-600 font-medium"
                                                style={{ fontSize: '11px' }}
                                            >
                                                ₹{variant.discountPrice
                                                    ? variant.discountPrice.toLocaleString('en-IN')
                                                    : variant.price?.toLocaleString('en-IN')
                                                }
                                            </span>
                                            {variant.discountPrice && (
                                                <span
                                                    className="text-gray-300 line-through ml-0.5"
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    ₹{variant.price?.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={10} strokeWidth={1.5} className="text-gray-400" />
                                            <span
                                                className="tracking-[0.15em] text-gray-500"
                                                style={{ fontSize: '11px' }}
                                            >
                                                {variant.duration} min
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Button - full width on mobile */}
                <a
                    href={`/bookings?service=${service._id}`}
                    className="relative flex items-center justify-center gap-2 tracking-[0.18em] uppercase
                               text-white bg-black border border-black px-5 py-3.5
                               no-underline overflow-hidden group rounded-lg w-full
                               active:scale-[0.98] transition-transform duration-150"
                    style={{ fontSize: '10px' }}
                >
                    <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                     group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                    <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                        Book Now
                    </span>
                    <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                        className="relative z-10 group-hover:text-black transition-colors duration-500"
                    />
                </a>
            </div>
        </div>
    )
}

// ── Desktop Service Section ──
function DesktopServiceSection({ service, index }) {
    const sectionRef = useRef(null)
    const imageRef = useRef(null)
    const contentRef = useRef(null)

    const isEven = index % 2 === 0

    const image = service.primaryImage || service.images?.[0]?.url
    const categoryName = service.category?.name || ''
    const categoryIcon = service.category?.icon || ''

    const activeVariants = service.variants
        ? service.variants.filter(v => v.isActive !== false)
        : []

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!sectionRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(
                    imageRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' }
                    }
                )
                gsap.fromTo(
                    contentRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
                        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' }
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [isEven])

    return (
        <div
            ref={sectionRef}
            id={service._id}
            className="w-full border-b border-gray-100 last:border-0 py-20 lg:py-28"
        >
            <div className={`grid grid-cols-2 gap-20 items-center ${isEven ? '' : 'grid-flow-dense'}`}>

                {/* Image */}
                <div
                    ref={imageRef}
                    className={`opacity-0 relative overflow-hidden rounded-xl ${isEven ? '' : 'col-start-2'}`}
                >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-xl">
                        {image ? (
                            <img
                                src={image}
                                alt={service.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl">{categoryIcon || '📦'}</span>
                            </div>
                        )}
                    </div>

                    {/* Number badge */}
                    <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-md">
                        <span
                            className="text-white"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: '11px',
                                letterSpacing: '0.3em',
                            }}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-5 right-5 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-md">
                        <span
                            className="text-white"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: '16px',
                            }}
                        >
                            ₹{service.startingPrice?.toLocaleString('en-IN') || 0}+
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div
                    ref={contentRef}
                    className={`opacity-0 ${isEven ? '' : 'col-start-1 row-start-1'}`}
                >
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="block w-6 h-px bg-black shrink-0" />
                        <span
                            className="tracking-[0.4em] uppercase text-gray-400"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontSize: '11px',
                            }}
                        >
                            {categoryIcon} {categoryName}
                        </span>
                    </div>

                    {/* Title */}
                    <h2
                        className="text-black mb-4"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontWeight: 300,
                            fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)',
                            lineHeight: 1.08,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {service.name}
                    </h2>

                    {/* Tier badge */}
                    {service.tier && (
                        <div className="mb-6">
                            <span
                                className="tracking-[0.3em] uppercase border border-gray-200 px-3 py-1.5
                                           rounded-md text-gray-500"
                                style={{ fontSize: '9px' }}
                            >
                                {service.tier}
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <p
                        className="tracking-[0.15em] leading-[1.9] uppercase text-gray-400 mb-8"
                        style={{ fontSize: '11px' }}
                    >
                        {service.description || service.shortDescription}
                    </p>

                    {/* Highlights */}
                    {(service.highlights?.length > 0 || service.includes?.length > 0) && (
                        <div className="flex flex-col gap-2.5 mb-8">
                            {(service.highlights || service.includes || []).slice(0, 5).map((f, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle size={13} strokeWidth={1.5} className="text-black shrink-0 mt-0.5" />
                                    <span
                                        className="tracking-[0.15em] uppercase text-gray-600"
                                        style={{ fontSize: '11px' }}
                                    >
                                        {f}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Variants */}
                    {activeVariants.length > 0 && (
                        <div className="mb-8">
                            <p
                                className="tracking-[0.3em] uppercase text-gray-400 mb-4"
                                style={{ fontSize: '9px' }}
                            >
                                Available Options
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {activeVariants.map((variant) => (
                                    <div
                                        key={variant._id}
                                        className="border border-gray-200 px-4 py-3 rounded-lg
                                                   hover:border-black transition-colors duration-300"
                                    >
                                        <p
                                            className="text-black mb-1.5"
                                            style={{
                                                fontFamily: 'Georgia, "Times New Roman", serif',
                                                fontWeight: 300,
                                                fontSize: '14px',
                                            }}
                                        >
                                            {variant.name}
                                        </p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Tag size={10} strokeWidth={1.5} className="text-gray-400" />
                                                <span
                                                    className="tracking-[0.2em] uppercase text-gray-500"
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    ₹{variant.discountPrice
                                                        ? variant.discountPrice.toLocaleString('en-IN')
                                                        : variant.price?.toLocaleString('en-IN')
                                                    }
                                                </span>
                                                {variant.discountPrice && (
                                                    <span
                                                        className="tracking-[0.2em] uppercase text-gray-300
                                                                   line-through ml-1"
                                                        style={{ fontSize: '9px' }}
                                                    >
                                                        ₹{variant.price?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} strokeWidth={1.5} className="text-gray-400" />
                                                <span
                                                    className="tracking-[0.2em] uppercase text-gray-500"
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    {variant.duration} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="w-full h-px bg-gray-100 mb-8" />

                    {/* CTA */}
                    <a
                        href={`/bookings?service=${service._id}`}
                        className="relative inline-flex items-center gap-2 tracking-[0.22em] uppercase
                                   text-white bg-black border border-black px-7 py-4
                                   no-underline overflow-hidden group rounded-lg"
                        style={{ fontSize: '11px' }}
                    >
                        <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                         group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                        <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                            Book {service.name}
                        </span>
                        <ArrowUpRight
                            size={13}
                            strokeWidth={1.5}
                            className="relative z-10 group-hover:text-black transition-colors duration-500"
                        />
                    </a>
                </div>
            </div>
        </div>
    )
}

// ── Page ──
export default function ServicesPage() {
    const searchParams = useSearchParams()
    const categoryId = searchParams.get('category')

    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState(categoryId || null)
    const [activeCategoryData, setActiveCategoryData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const heroRef = useRef(null)

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(false)
            try {
                const [servicesData, categoriesData] = await Promise.all([
                    getPublicServices(activeCategory ? { category: activeCategory } : {}),
                    getCategories()
                ])
                setServices(servicesData || [])
                setCategories(categoriesData || [])

                if (activeCategory && categoriesData) {
                    const found = categoriesData.find(c => c._id === activeCategory)
                    setActiveCategoryData(found || null)
                } else {
                    setActiveCategoryData(null)
                }
            } catch (err) {
                console.error('❌ Fetch failed:', err.message)
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeCategory])

    // Update URL when category changes
    const handleCategoryChange = (catId) => {
        setActiveCategory(catId)
        if (catId) {
            window.history.pushState({}, '', `/services?category=${catId}`)
        } else {
            window.history.pushState({}, '', '/services')
        }
    }

    // Hero animation
    useEffect(() => {
        if (loading) return
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            if (!heroRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(
                    heroRef.current.children,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [loading, activeCategory])

    const pageTitle = activeCategoryData
        ? `${activeCategoryData.icon || ''} ${activeCategoryData.name}`
        : 'Our Services'

    const pageSubtitle = activeCategoryData?.description
        || 'Professional cleaning delivered to your doorstep — every day, 9 AM to 5 PM.'

    return (
        <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

            {/* ── Hero ── */}
            <section className="w-full bg-black pt-20 pb-10 md:pt-32 md:pb-28 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg, transparent, transparent 60px, white 60px, white 61px)',
                    }}
                />
                <div className="max-w-6xl mx-auto px-5 md:px-16 relative z-10">
                    <div ref={heroRef}>

                        {/* Eyebrow */}
                        <div className="flex items-center gap-3 mb-4 md:mb-8">
                            <span className="block w-6 h-px bg-white/30 shrink-0" />
                            <span
                                className="tracking-[0.4em] uppercase text-white/50"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontSize: 'clamp(9px, 2.2vw, 11px)',
                                }}
                            >
                                {activeCategoryData ? 'Category' : 'What We Offer'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            className="text-white mb-3 md:mb-6"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: 'clamp(1.8rem, 6vw, 5.5rem)',
                                lineHeight: 1.06,
                                letterSpacing: '-0.02em',
                                maxWidth: '700px',
                            }}
                        >
                            {pageTitle}
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="tracking-[0.15em] leading-[1.9] uppercase text-white/50
                                       max-w-lg mb-6 md:mb-12"
                            style={{ fontSize: 'clamp(9px, 2.4vw, 11px)' }}
                        >
                            {pageSubtitle}
                        </p>

                        {/* Category filter — horizontal scroll on mobile */}
                        <div className="-mx-5 px-5 md:mx-0 md:px-0">
                            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 md:pb-0
                                            md:flex-wrap snap-x snap-mandatory scrollbar-hide">
                                <button
                                    onClick={() => handleCategoryChange(null)}
                                    className={`shrink-0 snap-start tracking-[0.22em] uppercase
                                               px-4 py-2.5 md:px-5 md:py-2.5 border rounded-lg
                                               transition-all duration-300 whitespace-nowrap
                                               min-h-[44px] ${
                                        !activeCategory
                                            ? 'bg-white text-black border-white'
                                            : 'text-white border-white/30 hover:border-white active:bg-white/10'
                                    }`}
                                    style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
                                >
                                    All Services
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryChange(cat._id)}
                                        className={`shrink-0 snap-start tracking-[0.22em] uppercase
                                                   px-4 py-2.5 md:px-5 md:py-2.5 border rounded-lg
                                                   transition-all duration-300 flex items-center gap-2
                                                   whitespace-nowrap min-h-[44px] ${
                                            activeCategory === cat._id
                                                ? 'bg-white text-black border-white'
                                                : 'text-white border-white/30 hover:border-white active:bg-white/10'
                                        }`}
                                        style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
                                    >
                                        {cat.icon && <span className="text-sm">{cat.icon}</span>}
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Services List ── */}
            <section className="w-full bg-gray-50 md:bg-white">
                <div className="max-w-6xl mx-auto px-4 md:px-16 py-6 md:py-0">
                    {loading ? (
                        <>
                            {/* Mobile skeletons */}
                            <div className="flex flex-col gap-5 md:hidden">
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                            {/* Desktop skeletons */}
                            <div className="hidden md:block">
                                <SkeletonSection />
                                <SkeletonSection />
                            </div>
                        </>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 md:py-24 px-4">
                            <span className="text-3xl mb-4">⚠️</span>
                            <p
                                className="tracking-[0.2em] uppercase text-gray-400 mb-6 text-center"
                                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
                            >
                                Failed to load services
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="relative tracking-[0.22em] uppercase text-black border
                                           border-black px-7 py-3.5 overflow-hidden group rounded-lg
                                           min-h-[44px]"
                                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
                            >
                                <span className="absolute inset-0 bg-black transform origin-bottom
                                                 scale-y-0 group-hover:scale-y-100 transition-transform
                                                 duration-500 ease-out" />
                                <span className="relative z-10 group-hover:text-white
                                                 transition-colors duration-500">
                                    Try Again
                                </span>
                            </button>
                        </div>
                    ) : services.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* ── Mobile: Stacked cards ── */}
                            <div className="flex flex-col gap-5 md:hidden pb-6">
                                {services.map((service, i) => (
                                    <MobileServiceCard
                                        key={service._id}
                                        service={service}
                                        index={i}
                                    />
                                ))}
                            </div>

                            {/* ── Desktop: Alternating sections ── */}
                            <div className="hidden md:block">
                                {services.map((service, i) => (
                                    <DesktopServiceSection
                                        key={service._id}
                                        service={service}
                                        index={i}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="w-full bg-black py-14 md:py-28">
                <div className="max-w-6xl mx-auto px-5 md:px-16">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between
                                    gap-8 md:gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <span className="block w-6 h-px bg-white/30 shrink-0" />
                                <span
                                    className="tracking-[0.4em] uppercase text-white/50"
                                    style={{
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontSize: 'clamp(9px, 2.2vw, 11px)',
                                    }}
                                >
                                    Ready to Book?
                                </span>
                            </div>
                            <h2
                                className="text-white"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: 'clamp(1.6rem, 4vw, 3.5rem)',
                                    lineHeight: 1.08,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Book a Service Today
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 md:mb-1">
                            <a
                                href="/bookings"
                                className="relative flex items-center justify-center gap-2
                                           tracking-[0.22em] uppercase text-black bg-white
                                           border border-white px-7 py-4 no-underline
                                           overflow-hidden group rounded-lg min-h-[52px]
                                           active:scale-[0.98] transition-transform duration-150"
                                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                            >
                                <span className="absolute inset-0 bg-black origin-bottom scale-y-0
                                                 group-hover:scale-y-100 transition-transform
                                                 duration-500 ease-out" />
                                <span className="relative z-10 group-hover:text-white
                                                 transition-colors duration-500">
                                    Book Now
                                </span>
                                <ArrowUpRight
                                    size={13}
                                    strokeWidth={1.5}
                                    className="relative z-10 group-hover:text-white
                                               transition-colors duration-500"
                                />
                            </a>
                            <a
                                href="tel:6900706456"
                                className="relative flex items-center justify-center gap-2
                                           tracking-[0.22em] uppercase text-white
                                           border border-white/30 px-7 py-4 no-underline
                                           overflow-hidden group rounded-lg min-h-[52px]
                                           active:scale-[0.98] transition-transform duration-150"
                                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                            >
                                <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                                 group-hover:scale-y-100 transition-transform
                                                 duration-500 ease-out" />
                                <span className="relative z-10 group-hover:text-black
                                                 transition-colors duration-500">
                                    6900706456
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
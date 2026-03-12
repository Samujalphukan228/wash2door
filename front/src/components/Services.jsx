"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react'
import { getCategories } from '@/lib/services.api'

// ── Skeleton ──
function SkeletonFeatured() {
    return (
        <div className="rounded-[5px] overflow-hidden border border-gray-100">
            <div className="aspect-[16/11] bg-gray-100 animate-pulse" />
            <div className="p-6 space-y-3">
                <div className="h-6 w-40 bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-2/3 bg-gray-100 animate-pulse rounded" />
                <div className="h-11 w-full bg-gray-100 animate-pulse rounded-[5px] mt-4" />
            </div>
        </div>
    )
}

function SkeletonSmall() {
    return (
        <div className="rounded-[5px] overflow-hidden border border-gray-100">
            <div className="aspect-[1/1] bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-2">
                <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
            </div>
        </div>
    )
}

function SkeletonDesktop() {
    return (
        <div className="flex flex-col border border-gray-100 overflow-hidden rounded-[5px]">
            <div className="h-64 bg-gray-100 animate-pulse" />
            <div className="p-7 flex flex-col gap-4">
                <div className="h-5 w-32 bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
            </div>
        </div>
    )
}

// ── Empty State ──
function EmptyState() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 md:py-24">
            <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center
                            justify-center mb-6 bg-gray-50">
                <span className="text-3xl">🧹</span>
            </div>
            <h3
                className="text-black mb-3 text-center"
                style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(16px, 2vw, 20px)',
                }}
            >
                No Services Available
            </h3>
            <p
                className="tracking-[0.2em] uppercase text-gray-400 text-center max-w-xs
                           leading-[1.9] mb-8"
                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
            >
                We&apos;re currently updating our services.<br />
                Please check back soon.
            </p>
            <a
                href="tel:6900706456"
                className="relative tracking-[0.22em] uppercase text-white bg-black border
                           border-black px-7 py-3.5 no-underline overflow-hidden group
                           rounded-[5px] min-h-[44px] flex items-center"
                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
            >
                <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                    Contact Us
                </span>
            </a>
        </div>
    )
}

// ── Error State ──
function ErrorState({ onRetry }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 md:py-24">
            <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center
                            justify-center mb-6 bg-gray-50">
                <span className="text-3xl">⚠️</span>
            </div>
            <h3
                className="text-black mb-3"
                style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(16px, 2vw, 20px)',
                }}
            >
                Unable to Load Services
            </h3>
            <p
                className="tracking-[0.2em] uppercase text-gray-400 text-center max-w-xs
                           mb-8 leading-[1.9]"
                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
            >
                Something went wrong while fetching services.
            </p>
            <button
                className="relative tracking-[0.22em] uppercase text-white bg-black border
                           border-black px-7 py-3.5 overflow-hidden group rounded-[5px] min-h-[44px]"
                style={{ fontSize: 'clamp(9px, 1vw, 10px)' }}
                onClick={onRetry}
            >
                <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                    Try Again
                </span>
            </button>
        </div>
    )
}

// ── Mobile Featured Card (first category) ──
function MobileFeaturedCard({ category, index }) {
    const cardRef = useRef(null)
    const image = category.image?.url
    const hasImage = !!image && image.length > 0

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!cardRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(cardRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: { trigger: cardRef.current, start: 'top 90%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <a
            ref={cardRef}
            href={`/services?category=${category._id}`}
            className="opacity-0 group block relative overflow-hidden rounded-[5px]
                       no-underline active:scale-[0.98] transition-transform duration-200"
        >
            {/* Full bleed image */}
            <div className="relative aspect-[16/11] overflow-hidden bg-gray-100">
                {hasImage ? (
                    <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700
                                   group-active:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-6xl">{category.icon || '📦'}</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Number */}
                <div className="absolute top-4 left-4">
                    <span
                        className="text-white/30"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: '48px',
                            fontWeight: 300,
                            lineHeight: 1,
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>

                {/* Service count */}
                {category.totalServices > 0 && (
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md
                                    border border-white/20 px-3 py-1.5 rounded-[3px]">
                        <span
                            className="tracking-[0.2em] uppercase text-white/80"
                            style={{ fontSize: '9px' }}
                        >
                            {category.totalServices} {category.totalServices === 1 ? 'Service' : 'Services'}
                        </span>
                    </div>
                )}

                {/* Bottom content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            {/* Category icon + name */}
                            <div className="flex items-center gap-2.5 mb-2">
                                {category.icon && <span className="text-lg">{category.icon}</span>}
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
                                    {category.name}
                                </h3>
                            </div>

                            {/* Description */}
                            {category.description && (
                                <p
                                    className="text-white/50 leading-[1.6] line-clamp-2 tracking-[0.05em]"
                                    style={{ fontSize: '11px' }}
                                >
                                    {category.description}
                                </p>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center
                                        shrink-0 mt-1">
                            <ArrowUpRight size={16} strokeWidth={1.5} className="text-black" />
                        </div>
                    </div>
                </div>
            </div>
        </a>
    )
}

// ── Mobile Grid Card (smaller cards) ──
function MobileGridCard({ category, index }) {
    const cardRef = useRef(null)
    const image = category.image?.url
    const hasImage = !!image && image.length > 0

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!cardRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(cardRef.current,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                        delay: (index % 2) * 0.1,
                        scrollTrigger: { trigger: cardRef.current, start: 'top 92%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [index])

    return (
        <a
            ref={cardRef}
            href={`/services?category=${category._id}`}
            className="opacity-0 group block relative overflow-hidden rounded-[5px]
                       border border-gray-200 no-underline bg-white
                       active:scale-[0.97] transition-transform duration-200"
        >
            {/* Square image */}
            <div className="relative aspect-[1/1] overflow-hidden bg-gray-50">
                {hasImage ? (
                    <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">{category.icon || '📦'}</span>
                    </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Number */}
                <div className="absolute top-2.5 left-3">
                    <span
                        className="text-white/20"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: '32px',
                            fontWeight: 300,
                            lineHeight: 1,
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>

                {/* Service count pill */}
                {category.totalServices > 0 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm
                                    px-2 py-1 rounded-[3px]">
                        <span
                            className="tracking-[0.15em] uppercase text-gray-600"
                            style={{ fontSize: '8px' }}
                        >
                            {category.totalServices}
                        </span>
                    </div>
                )}

                {/* Bottom name */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <div className="flex items-center gap-2">
                        {category.icon && <span className="text-sm">{category.icon}</span>}
                        <h3
                            className="text-white"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 400,
                                fontSize: '14px',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.2,
                            }}
                        >
                            {category.name}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Minimal bottom bar */}
            <div className="flex items-center justify-between px-3.5 py-3 border-t border-gray-100">
                <span
                    className="tracking-[0.15em] uppercase text-gray-300"
                    style={{ fontSize: '8px' }}
                >
                    Explore
                </span>
                <ArrowRight size={11} strokeWidth={1.5} className="text-gray-400" />
            </div>
        </a>
    )
}

// ── Mobile List Card (alternate layout for many categories) ──
function MobileListCard({ category, index }) {
    const cardRef = useRef(null)
    const image = category.image?.url
    const hasImage = !!image && image.length > 0

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!cardRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(cardRef.current,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
                        delay: index * 0.08,
                        scrollTrigger: { trigger: cardRef.current, start: 'top 92%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [index])

    return (
        <a
            ref={cardRef}
            href={`/services?category=${category._id}`}
            className="opacity-0 group flex items-center gap-4 py-5 border-b border-gray-100
                       last:border-0 no-underline active:bg-gray-50 transition-colors duration-200
                       -mx-1 px-1 rounded-[3px]"
        >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-[5px] overflow-hidden bg-gray-100 shrink-0 relative">
                {hasImage ? (
                    <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-2xl">{category.icon || '📦'}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3
                        className="text-black truncate"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontWeight: 400,
                            fontSize: '15px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {category.name}
                    </h3>
                </div>
                {category.description && (
                    <p
                        className="text-gray-400 truncate leading-[1.5]"
                        style={{ fontSize: '11px', letterSpacing: '0.02em' }}
                    >
                        {category.description}
                    </p>
                )}
                <p
                    className="tracking-[0.2em] uppercase text-gray-300 mt-1"
                    style={{ fontSize: '9px' }}
                >
                    {category.totalServices || 0} services
                </p>
            </div>

            {/* Arrow */}
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center
                            justify-center shrink-0 group-active:border-black
                            group-active:bg-black transition-all duration-200">
                <ArrowRight
                    size={12}
                    strokeWidth={1.5}
                    className="text-gray-400 group-active:text-white transition-colors duration-200"
                />
            </div>
        </a>
    )
}

// ── Desktop Category Card ──
function DesktopCategoryCard({ category, index }) {
    const cardRef = useRef(null)
    const image = category.image?.url
    const hasImage = !!image && image.length > 0

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!cardRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(cardRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                        delay: index * 0.15,
                        scrollTrigger: { trigger: cardRef.current, start: 'top 88%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [index])

    return (
        <a
            ref={cardRef}
            href={`/services?category=${category._id}`}
            className="opacity-0 group flex flex-col border border-gray-200 overflow-hidden
                       hover:border-black transition-all duration-500 rounded-[5px]
                       hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] no-underline cursor-pointer"
        >
            {/* Image */}
            <div className="relative h-72 overflow-hidden bg-gray-50">
                {hasImage ? (
                    <>
                        <img
                            src={image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-700
                                       group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40
                                        via-black/10 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-6xl transition-transform duration-500
                                         group-hover:scale-110">
                            {category.icon || '📦'}
                        </span>
                    </div>
                )}

                {/* Number */}
                <div className="absolute top-5 left-6">
                    <span
                        className="text-white/20"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: '56px',
                            fontWeight: 300,
                            lineHeight: 1,
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>

                {/* Service count */}
                {category.totalServices > 0 && (
                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm
                                    px-3 py-1.5 rounded-[3px]">
                        <span
                            className="tracking-[0.3em] uppercase text-gray-500"
                            style={{ fontSize: 'clamp(7px, 0.8vw, 9px)' }}
                        >
                            {category.totalServices} {category.totalServices === 1 ? 'Service' : 'Services'}
                        </span>
                    </div>
                )}

                {/* Name overlay */}
                {hasImage && (
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3">
                            {category.icon && <span className="text-2xl">{category.icon}</span>}
                            <h3
                                className="text-white"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: 'clamp(18px, 2vw, 24px)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {category.name}
                            </h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-7 flex flex-col flex-1">
                {!hasImage && (
                    <div className="flex items-center gap-3 mb-3">
                        {category.icon && <span className="text-2xl">{category.icon}</span>}
                        <h3
                            className="text-black group-hover:opacity-70
                                       transition-opacity duration-300"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: 'clamp(16px, 1.8vw, 22px)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {category.name}
                        </h3>
                    </div>
                )}

                {category.description && (
                    <p
                        className="tracking-[0.18em] leading-[1.9] uppercase text-gray-400
                                   flex-1 mb-6"
                        style={{ fontSize: 'clamp(8px, 0.9vw, 11px)' }}
                    >
                        {category.description}
                    </p>
                )}

                <div className="w-full h-px bg-gray-100 mb-5" />

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                    <p
                        className="tracking-[0.28em] uppercase text-gray-400"
                        style={{ fontSize: 'clamp(7px, 0.75vw, 9px)' }}
                    >
                        {category.totalServices || 0}{' '}
                        {category.totalServices === 1 ? 'service' : 'services'} available
                    </p>

                    <div className="flex items-center gap-2 tracking-[0.22em] uppercase text-black
                                    transition-all duration-300"
                        style={{ fontSize: 'clamp(8px, 0.9vw, 10px)' }}
                    >
                        <span className="opacity-0 group-hover:opacity-100 -translate-x-2
                                         group-hover:translate-x-0 transition-all duration-400">
                            Explore
                        </span>
                        <div className="w-9 h-9 rounded-full border border-gray-200
                                        group-hover:border-black group-hover:bg-black
                                        flex items-center justify-center
                                        transition-all duration-300">
                            <ArrowUpRight
                                size={14}
                                strokeWidth={1.5}
                                className="text-gray-400 group-hover:text-white
                                           transition-all duration-300
                                           group-hover:translate-x-0.5
                                           group-hover:-translate-y-0.5"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </a>
    )
}

// ── Trust Badges ──
const trustItems = [
    { icon: Shield, label: '100% Satisfaction', desc: 'Guaranteed' },
    { icon: Clock, label: 'Same Day', desc: 'Service Available' },
    { icon: Sparkles, label: 'Eco-Friendly', desc: 'Products Used' },
]

function TrustBar() {
    const ref = useRef(null)

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!ref.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(
                    ref.current.children,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
                        scrollTrigger: { trigger: ref.current, start: 'top 90%' },
                    }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <div
            ref={ref}
            className="grid grid-cols-3 gap-3 sm:gap-6 mt-12 md:mt-20 pt-10 md:pt-12
                       border-t border-gray-200"
        >
            {trustItems.map((item, i) => {
                const Icon = item.icon
                return (
                    <div key={i} className="opacity-0 flex flex-col sm:flex-row items-center
                                            sm:items-center gap-2 sm:gap-4 group text-center sm:text-left">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-200 rounded-full
                                        flex items-center justify-center shrink-0
                                        group-hover:border-black transition-colors duration-300">
                            <Icon
                                size={16}
                                strokeWidth={1.2}
                                className="text-gray-400 group-hover:text-black
                                           transition-colors duration-300 sm:[&]:w-[18px] sm:[&]:h-[18px]"
                            />
                        </div>
                        <div>
                            <p
                                className="text-black"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: 'clamp(10px, 1.2vw, 14px)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {item.label}
                            </p>
                            <p
                                className="tracking-[0.2em] uppercase text-gray-400 mt-0.5
                                           hidden sm:block"
                                style={{ fontSize: 'clamp(7px, 0.75vw, 9px)' }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Main Component ──
export default function Services() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const eyebrowRef = useRef(null)
    const headingRef = useRef(null)
    const descRef = useRef(null)
    const ruleRef = useRef(null)

    const fetchCategories = async () => {
        setLoading(true)
        setError(false)
        try {
            const data = await getCategories()
            if (!Array.isArray(data)) {
                setCategories([])
                return
            }
            setCategories(data || [])
        } catch (err) {
            console.error('❌ Categories fetch failed:', err.message)
            setError(true)
            setCategories([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        if (loading) return
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
                tl.fromTo(eyebrowRef.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
                    .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
                    .fromTo(descRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
                    .fromTo(ruleRef.current, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6 }, 0.4)
            })
        }
        init()
        return () => ctx?.revert()
    }, [loading])

    const desktopGridCols =
        categories.length <= 2
            ? 'md:grid-cols-2'
            : categories.length === 3
                ? 'md:grid-cols-3'
                : 'md:grid-cols-2 lg:grid-cols-3'

    // Split categories for mobile layout
    const featuredCategory = categories[0]
    const gridCategories = categories.slice(1, 5) // 2x2 grid
    const listCategories = categories.slice(5)     // remaining as list

    return (
        <section
            className="w-full bg-white py-16 md:py-32"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            <div className="max-w-6xl mx-auto px-5 md:px-16">

                {/* ── Heading ── */}
                <div className="mb-10 md:mb-20">
                    <div ref={eyebrowRef} className="flex items-center gap-3 mb-4 md:mb-6 opacity-0">
                        <span className="block w-8 h-px bg-black shrink-0" />
                        <span
                            className="tracking-[0.4em] uppercase text-gray-400"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontSize: 'clamp(8px, 0.8vw, 9px)',
                            }}
                        >
                            What We Offer
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6">
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
                                Our Services
                            </h2>
                            <p
                                ref={descRef}
                                className="opacity-0 tracking-[0.18em] leading-[1.9] uppercase
                                           text-gray-400 max-w-md"
                                style={{ fontSize: 'clamp(9px, 0.9vw, 11px)' }}
                            >
                                Professional cleaning at your doorstep —
                                <br className="hidden md:block" />
                                choose a category to explore our packages.
                            </p>
                        </div>

                        {/* Desktop View All */}
                        <a
                            href="/services"
                            className="hidden md:flex items-center gap-3 group mb-2"
                        >
                            <span
                                className="tracking-[0.28em] uppercase text-gray-400
                                           group-hover:text-black transition-colors duration-300"
                                style={{ fontSize: 'clamp(7px, 0.8vw, 9px)' }}
                            >
                                View All
                            </span>
                            <div className="w-8 h-8 rounded-full border border-gray-200
                                            group-hover:border-black group-hover:bg-black
                                            flex items-center justify-center
                                            transition-all duration-300">
                                <ArrowRight
                                    size={12}
                                    strokeWidth={1.5}
                                    className="text-gray-400 group-hover:text-white
                                               transition-colors duration-300"
                                />
                            </div>
                        </a>
                    </div>

                    <div ref={ruleRef} className="w-full h-px bg-gray-200 mt-6 md:mt-8" />
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <>
                        {/* Mobile skeleton */}
                        <div className="md:hidden space-y-4">
                            <SkeletonFeatured />
                            <div className="grid grid-cols-2 gap-3">
                                <SkeletonSmall />
                                <SkeletonSmall />
                            </div>
                        </div>
                        {/* Desktop skeleton */}
                        <div className={`hidden md:grid ${desktopGridCols} gap-6`}>
                            <SkeletonDesktop />
                            <SkeletonDesktop />
                            <SkeletonDesktop />
                        </div>
                    </>
                ) : error ? (
                    <ErrorState onRetry={fetchCategories} />
                ) : categories.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* ═══ Mobile Layout ═══ */}
                        <div className="md:hidden space-y-3">

                            {/* Featured card (first category) */}
                            {featuredCategory && (
                                <MobileFeaturedCard
                                    category={featuredCategory}
                                    index={0}
                                />
                            )}

                            {/* 2-column grid (next 4 categories) */}
                            {gridCategories.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {gridCategories.map((cat, i) => (
                                        <MobileGridCard
                                            key={cat._id}
                                            category={cat}
                                            index={i + 1}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* List style (remaining categories) */}
                            {listCategories.length > 0 && (
                                <div className="pt-2">
                                    {listCategories.map((cat, i) => (
                                        <MobileListCard
                                            key={cat._id}
                                            category={cat}
                                            index={i + 5}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ═══ Desktop Layout ═══ */}
                        <div className={`hidden md:grid ${desktopGridCols} gap-6`}>
                            {categories.map((category, i) => (
                                <DesktopCategoryCard
                                    key={category._id}
                                    category={category}
                                    index={i}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* ── Mobile View All ── */}
                {!loading && !error && categories.length > 0 && (
                    <div className="mt-8 flex md:hidden">
                        <a
                            href="/services"
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
                                View All Services
                            </span>
                            <ArrowUpRight
                                size={13}
                                strokeWidth={1.5}
                                className="relative z-10 group-hover:text-black
                                           transition-colors duration-500"
                            />
                        </a>
                    </div>
                )}

                {/* ── Trust Badges ── */}
                {!loading && !error && categories.length > 0 && <TrustBar />}
            </div>
        </section>
    )
}
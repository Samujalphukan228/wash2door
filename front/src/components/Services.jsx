"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Sparkles, Clock, Shield } from 'lucide-react'
import { getPublicServices } from '@/lib/services.api'

const CATEGORY_LABEL = { basic: 'Essential', standard: 'Standard', premium: 'Premium' }
const CATEGORY_ICON = { basic: Clock, standard: Shield, premium: Sparkles }

// ── Skeleton ──
function SkeletonCard() {
  return (
    <div className="flex flex-col border border-gray-100 overflow-hidden rounded-[5px]">
      <div className="h-72 bg-gray-100 animate-pulse" />
      <div className="p-7 flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-full" />
          <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
        </div>
        <div className="h-5 w-40 bg-gray-100 animate-pulse rounded" />
        <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
        <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
        <div className="mt-4 flex justify-between items-center">
          <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 w-24 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}

// ── Empty State ──
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center justify-center mb-6 bg-gray-50">
        <span className="text-3xl">🚗</span>
      </div>
      <h3
        className="text-[20px] text-black mb-3 tracking-[-0.01em]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
      >
        No Services Available
      </h3>
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 text-center max-w-xs leading-[1.9] mb-8">
        We&apos;re currently updating our services.<br />
        Please check back soon.
      </p>
      <a
        href="tel:6900706456"
        className="relative text-[10px] tracking-[0.22em] uppercase text-black border border-black px-7 py-3.5 no-underline overflow-hidden group rounded-[5px]"
      >
        <span className="absolute inset-0 bg-black transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
        <span className="relative z-10 group-hover:text-white transition-colors duration-500">
          Contact Us
        </span>
      </a>
    </div>
  )
}

// ── Error State ──
function ErrorState({ onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 border border-red-200 rounded-full flex items-center justify-center mb-6 bg-red-50">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3
        className="text-[20px] text-black mb-3 tracking-[-0.01em]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
      >
        Unable to Load Services
      </h3>
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 text-center max-w-xs mb-8 leading-[1.9]">
        Something went wrong while fetching services.
      </p>
      <button
        className="relative text-[10px] tracking-[0.22em] uppercase text-black border border-black px-7 py-3.5 overflow-hidden group rounded-[5px]"
        onClick={onRetry}
      >
        <span className="absolute inset-0 bg-black transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
        <span className="relative z-10 group-hover:text-white transition-colors duration-500">
          Try Again
        </span>
      </button>
    </div>
  )
}

// ── Card ──
function ServiceCard({ service, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const el = cardRef.current
      if (!el) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: index * 0.15,
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [index])

  const image = service.primaryImage || service.images?.[0]?.url
  const CategoryIcon = CATEGORY_ICON[service.category] || Sparkles

  return (
    <div
      ref={cardRef}
      className="opacity-0 group flex flex-col border border-gray-200 overflow-hidden
                 hover:border-black transition-all duration-500 rounded-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden bg-gray-50">
        {image ? (
          <>
            <img
              src={image}
              alt={service.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-[9px] tracking-[0.28em] uppercase text-gray-300">No Image</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-[3px]">
          <CategoryIcon size={10} strokeWidth={1.5} className="text-gray-500" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-gray-500">
            {CATEGORY_LABEL[service.category] ?? service.category}
          </span>
        </div>

        {/* Price tag on image */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-[3px]">
          <span
            className="text-[13px] text-white tracking-[0.01em]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
          >
            ₹{service.startingPrice}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-7">
        <h3
          className="text-[17px] text-black mb-2 tracking-[-0.01em] group-hover:opacity-70 transition-opacity duration-300"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
        >
          {service.name}
        </h3>

        <p className="text-[10.5px] tracking-[0.18em] leading-[1.9] uppercase text-gray-400 flex-1 mb-6">
          {service.shortDescription}
        </p>

        {/* Features pills */}
        {service.features && service.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {service.features.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="text-[7.5px] tracking-[0.22em] uppercase text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="text-[7.5px] tracking-[0.22em] uppercase text-gray-300 px-1 py-1">
                +{service.features.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="w-full h-px bg-gray-100 mb-6" />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] tracking-[0.28em] uppercase text-gray-400 mb-1">Starting from</p>
            <p
              className="text-[20px] text-black tracking-[0.01em]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
            >
              ₹{service.startingPrice}
            </p>
          </div>

          <a
            href={`/book/${service._id}`}
            className="relative flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase
                       text-white bg-black border border-black px-5 py-3 no-underline
                       overflow-hidden group/btn rounded-[5px]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover/btn:text-black transition-colors duration-500">Book</span>
            <ArrowUpRight size={12} strokeWidth={1.5} className="relative z-10 group-hover/btn:text-black transition-colors duration-500" />
          </a>
        </div>
      </div>
    </div>
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
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 90%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-20 pt-12 border-t border-gray-200">
      {trustItems.map((item, i) => {
        const Icon = item.icon
        return (
          <div key={i} className="opacity-0 flex items-center gap-4 group">
            <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center shrink-0 group-hover:border-black transition-colors duration-300">
              <Icon size={18} strokeWidth={1.2} className="text-gray-400 group-hover:text-black transition-colors duration-300" />
            </div>
            <div>
              <p
                className="text-[13px] text-black tracking-[-0.01em]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300 }}
              >
                {item.label}
              </p>
              <p className="text-[8px] tracking-[0.28em] uppercase text-gray-400 mt-0.5">
                {item.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main ──
export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const eyebrowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const ruleRef = useRef(null)

  const fetchServices = async () => {
    setLoading(true)
    setError(false)

    try {
      const data = await getPublicServices()
      setServices(data || [])
    } catch (err) {
      console.error('❌ Services fetch failed:', err.message)
      setError(true)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // ── heading animation ──
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

  // Display max 3 services
  const displayedServices = services.slice(0, 3)
  const hasMoreServices = services.length > 3

  return (
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">

        {/* ── Heading ── */}
        <div className="mb-16 md:mb-20">
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-6 opacity-0">
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="text-[9px] tracking-[0.4em] uppercase text-gray-400"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              What We Offer
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <h2
                ref={headingRef}
                className="opacity-0 text-black mb-5"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(2rem, 4vw, 3.8rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                }}
              >
                Our Services
              </h2>
              <p
                ref={descRef}
                className="opacity-0 text-[10.5px] tracking-[0.18em] leading-[1.9] uppercase text-gray-400 max-w-md"
              >
                Professional car &amp; home cleaning at your<br className="hidden md:block" />
                doorstep — tailored packages for every need.
              </p>
            </div>

            {/* Desktop View All - only show if more than 3 services */}
            {hasMoreServices && (
              <a
                href="/services"
                className="hidden md:flex items-center gap-3 text-[9px] tracking-[0.28em] uppercase
                           text-gray-400 no-underline hover:text-black transition-colors duration-300 group mb-2"
              >
                View All
                <span className="block h-px bg-gray-300 w-5 group-hover:w-10 group-hover:bg-black transition-all duration-300" />
              </a>
            )}
          </div>

          <div ref={ruleRef} className="w-full h-px bg-gray-200 mt-8" />
        </div>

        {/* ── Content ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <ErrorState onRetry={fetchServices} />
          ) : services.length === 0 ? (
            <EmptyState />
          ) : (
            displayedServices.map((service, i) => (
              <ServiceCard key={service._id} service={service} index={i} />
            ))
          )}
        </div>

        {/* ── Mobile View All - only show if more than 3 services ── */}
        {!loading && !error && hasMoreServices && (
          <div className="mt-12 flex md:hidden justify-center">
            <a
              href="/services"
              className="relative flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase
                         text-black border border-black px-7 py-3.5 no-underline
                         overflow-hidden group rounded-[5px]"
            >
              <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                View All Services ({services.length})
              </span>
              <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-white transition-colors duration-500" />
            </a>
          </div>
        )}

        {/* ── Trust Badges ── */}
        {!loading && !error && services.length > 0 && <TrustBar />}

      </div>
    </section>
  )
}